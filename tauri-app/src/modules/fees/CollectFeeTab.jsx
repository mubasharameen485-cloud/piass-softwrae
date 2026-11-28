import React, { useState } from 'react';
import { findStudentByRollNo, saveFeeRecord } from './feeService';
import { getProgramSemesterFee, getUnpaidStudentFines } from './advancedFeeService';
import { supabase } from '../../services/supabaseClient';
import Print from '../reports/Print';

export default function CollectFeeTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [totalFee, setTotalFee] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [installmentNote, setInstallmentNote] = useState('1st Installment');
  const [staffName, setStaffName] = useState('');
  const [unpaidFines, setUnpaidFines] = useState(0);
  const [autoCalculatedLateFine, setAutoCalculatedLateFine] = useState(0);
  const [alreadyPaidTotal, setAlreadyPaidTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const installmentsList = [
    "1st Installment", "2nd Installment", "3rd Installment", "4th Installment", 
    "5th Installment", "6th Installment", "7th Installment", "8th Installment", "Full Semester Fee"
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let studentData = null;

      const { data: rollData } = await supabase
        .from('students').select('*').eq('roll_no', searchQuery.trim()).maybeSingle();

      if (rollData) {
        studentData = rollData;
      } else {
        const { data: nameData, error: nameErr } = await supabase
          .from('students').select('*').ilike('full_name', `%${searchQuery.trim()}%`).limit(1);

        if (nameErr || !nameData || nameData.length === 0) {
          throw new Error('Student not found with this Roll Number or Name!');
        }
        studentData = nameData[0];
      }

      setStudent(studentData);
      setReceiptData(null);

      let baseFee = 0;
      const { data: indFeeData } = await supabase
        .from('individual_student_fees').select('custom_fee').eq('roll_no', studentData.roll_no).maybeSingle();

      if (indFeeData) {
        baseFee = Number(indFeeData.custom_fee);
      } else {
        baseFee = await getProgramSemesterFee(studentData.category, studentData.semester || '1st Semester');
      }
      
      const fines = await getUnpaidStudentFines(studentData.roll_no);
      const totalManualFine = fines.reduce((acc, curr) => acc + Number(curr.fine_amount), 0);

      let deadlineFine = 0;
      const { data: ruleData } = await supabase
        .from('fee_deadline_rules').select('*').eq('category', studentData.category).eq('semester', studentData.semester || '1st Semester').maybeSingle();

      if (ruleData) {
        if (new Date().getDate() > ruleData.last_date_day) {
          deadlineFine = Number(ruleData.fine_amount_per_month);
        }
      }

      const { data: pastPaid } = await supabase
        .from('fees').select('paid_amount').eq('roll_no', studentData.roll_no);
      const paidSum = (pastPaid || []).reduce((acc, curr) => acc + Number(curr.paid_amount), 0);
      setAlreadyPaidTotal(paidSum);

      setUnpaidFines(totalManualFine);
      setAutoCalculatedLateFine(deadlineFine);
      setTotalFee(baseFee + totalManualFine + deadlineFine);
    } catch (err) {
      alert(err.message);
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    const total = parseFloat(totalFee) || 0;
    const paid = parseFloat(paidAmount) || 0;
    // Accurate remaining balance calculation
    const remaining = Math.max(0, total - (alreadyPaidTotal + paid));

    const payload = {
      roll_no: student.roll_no,
      total_fee: total,
      paid_amount: paid,
      remaining_balance: remaining,
      installment_note: `${installmentNote} (Manual Fine: ${unpaidFines}, Late Fine: ${autoCalculatedLateFine})`,
      collected_by: staffName || 'Admin'
    };

    setLoading(true);
    try {
      await saveFeeRecord(payload);
      alert('✅ Fee Submitted & Recorded Successfully!');
      setReceiptData({
        ...payload,
        name: student.full_name,
        father_name: student.father_name,
        category: student.category,
        semester: student.semester,
        manualFine: unpaidFines,
        lateFine: autoCalculatedLateFine,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFullyPaid = alreadyPaidTotal >= totalFee && totalFee > 0;

  // Clean A4 Printable Receipt Content (Removed redundant duplicate title)
  const receiptPrintContent = receiptData ? (
    <div className="text-slate-900 font-medium p-4">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Fee Statement & Receipt</p>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {receiptData.date}</p>
      </header>

      <div className="mb-6 rounded-xl border border-slate-300 bg-slate-50 p-4 grid grid-cols-2 gap-3 text-sm">
        <p><b>Student Name:</b> {receiptData.name}</p>
        <p><b>Roll Number:</b> {receiptData.roll_no}</p>
        <p><b>Father Name:</b> {receiptData.father_name}</p>
        <p><b>Program:</b> {receiptData.category} ({receiptData.semester})</p>
        <p><b>Payment Plan:</b> {receiptData.installment_note}</p>
        <p><b>Collector Staff:</b> {receiptData.collected_by}</p>
      </div>

      <table className="w-full border-collapse text-left text-sm mb-8">
        <thead className="bg-[#062b55] text-white">
          <tr>
            <th className="px-4 py-3 font-bold">Fee Description</th>
            <th className="px-4 py-3 font-bold">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 font-semibold">
          <tr>
            <td className="px-4 py-3">Total Semester Fee (Fixed)</td>
            <td className="px-4 py-3">Rs. {receiptData.total_fee}</td>
          </tr>
          {receiptData.manualFine > 0 && (
            <tr>
              <td className="px-4 py-3 text-red-600">Manual Fines</td>
              <td className="px-4 py-3 text-red-600">Rs. {receiptData.manualFine}</td>
            </tr>
          )}
          {receiptData.lateFine > 0 && (
            <tr>
              <td className="px-4 py-3 text-red-600">Automated Late Fine</td>
              <td className="px-4 py-3 text-red-600">Rs. {receiptData.lateFine}</td>
            </tr>
          )}
          <tr className="bg-emerald-50">
            <td className="px-4 py-3 font-bold text-emerald-800">Amount Paid Now</td>
            <td className="px-4 py-3 font-bold text-emerald-800">Rs. {receiptData.paid_amount}</td>
          </tr>
          <tr className="bg-slate-100">
            <td className="px-4 py-3 font-bold text-slate-900">Remaining Balance</td>
            <td className="px-4 py-3 font-bold text-slate-900">Rs. {receiptData.remaining_balance}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between mt-20 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Student Signature</p>
        <p>Authorized Accountant / Stamp</p>
      </div>
    </div>
  ) : (
    <div className="p-10 text-center font-bold text-slate-500">No receipt generated to print yet.</div>
  );

  return (
    <>
      <div>
        <form onSubmit={handleSearch} className="flex gap-3 mb-6 no-print">
          <input 
            type="text" 
            placeholder="Search by Roll Number OR Student Name..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            required 
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold" 
          />
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3 text-sm font-bold text-white shadow-sm">Search Student</button>
        </form>

        {student && (
          <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs mb-6">
            <h3 className="text-base font-black text-[#062b55] mb-2">Student Profile Found</h3>
            <p className="font-semibold text-slate-800 text-sm"><b>Name:</b> {student.full_name} | <b>Roll No:</b> {student.roll_no} | <b>Program:</b> {student.category} | <b>Semester:</b> {student.semester}</p>
            <p className="text-emerald-700 font-bold mt-1 text-xs">Total Fee Already Paid: Rs. {alreadyPaidTotal}</p>
            {unpaidFines > 0 && <p className="text-red-600 font-bold mt-1 text-xs">Manual Fines Attached: Rs. {unpaidFines}</p>}
            {autoCalculatedLateFine > 0 && <p className="text-red-600 font-bold mt-1 text-xs">Automated Late Fine: Rs. {autoCalculatedLateFine}</p>}
            
            {isFullyPaid && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-300 p-3 text-amber-800 font-bold text-xs">
                ⚠️ WARNING: Student's total fee has already been fully covered and paid!
              </div>
            )}
          </div>
        )}

        {student && !isFullyPaid && (
          <form onSubmit={handleFeeSubmit} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4 no-print">
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Total Fee (Fixed & Auto-Calculated):</label>
              <input type="number" value={totalFee} readOnly disabled className="w-full rounded-xl border border-slate-300 bg-slate-200 px-4 py-3 text-sm font-bold text-slate-700 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Amount Paying Now (Rs):</label>
              <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Installment / Payment Plan:</label>
              <select value={installmentNote} onChange={(e) => setInstallmentNote(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
                {installmentsList.map((inst, i) => <option key={i} value={inst}>{inst}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Collector Staff Name:</label>
              <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
            </div>
            <button type="submit" disabled={loading} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-emerald-700">
              {loading ? 'Processing...' : 'Collect Fee & Generate Receipt'}
            </button>
          </form>
        )}

        {receiptData && (
          <div className="mt-8 rounded-2xl border-2 border-dashed border-[#062b55] bg-white p-6 shadow-sm no-print">
            <div className="text-center border-b border-slate-300 pb-3 mb-4">
              <h3 className="text-lg font-black text-[#062b55]">PIASS COLLEGE OF NURSING & IT</h3>
              <p className="text-xs font-bold text-slate-500">OFFICIAL FEE RECEIPT</p>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-slate-800">
              <p><b>Date:</b> {receiptData.date}</p>
              <p><b>Roll No:</b> {receiptData.roll_no} | <b>Name:</b> {receiptData.name}</p>
              <p><b>Program:</b> {receiptData.category} ({receiptData.semester})</p>
              <p><b>Installment:</b> {receiptData.installment_note}</p>
              <hr className="my-2 border-slate-200" />
              <p><b>Total Fee:</b> Rs. {receiptData.total_fee}</p>
              <p className="text-emerald-700"><b>Paid:</b> Rs. {receiptData.paid_amount}</p>
              <p className="text-red-600"><b>Remaining:</b> Rs. {receiptData.remaining_balance}</p>
              <hr className="my-2 border-slate-200" />
              <p><b>Collected By:</b> {receiptData.collected_by}</p>
            </div>
            <button onClick={() => window.print()} className="mt-5 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm">Print Receipt</button>
          </div>
        )}
      </div>

      <Print title="PIASS Fee Receipt">{receiptPrintContent}</Print>
    </>
  );
}