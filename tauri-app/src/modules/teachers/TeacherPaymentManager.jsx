import React, { useState, useEffect } from 'react';
import { findTeacherById, getAllTeachers, applyTeacherFine, getUnpaidTeacherFines, markTeacherFinesAsPaid, saveTeacherPayment } from './teacherPaymentService';
import Background from '../reports/Background';
import Print from '../reports/Print';

export default function TeacherPaymentManager() {
  const [subTab, setSubTab] = useState('pay'); // 'pay', 'fine', 'list'
  
  const [teacherId, setTeacherId] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [baseSalary, setBaseSalary] = useState('');
  const [unpaidFineAmount, setUnpaidFineAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('May 2026');
  const [paymentNote, setPaymentNote] = useState('Monthly Salary');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const [fineTeacherId, setFineTeacherId] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');

  const [teachersList, setTeachersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const data = await getAllTeachers();
        setTeachersList(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadTeachers();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await findTeacherById(teacherId);
      setTeacher(data);
      setReceiptData(null);

      const fines = await getUnpaidTeacherFines(teacherId);
      const totalFine = fines.reduce((acc, curr) => acc + Number(curr.fine_amount), 0);
      setUnpaidFineAmount(totalFine);

      const standardSalary = 40000; 
      setBaseSalary(standardSalary);
      setPaidAmount(standardSalary - totalFine); 
    } catch (err) {
      alert(err.message);
      setTeacher(null);
    }
  };

  const handleFineSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyTeacherFine({
        teacher_id: fineTeacherId,
        fine_amount: parseFloat(fineAmount) || 0,
        reason: fineReason
      });
      alert('Fine applied successfully to teacher.');
      setFineTeacherId(''); setFineAmount(''); setFineReason('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!teacher) return;

    const total = parseFloat(baseSalary) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const remaining = total - paid;

    const payload = {
      teacher_id: teacher.teacher_id,
      total_salary: total,
      paid_amount: paid,
      remaining_balance: remaining,
      salary_month: salaryMonth,
      payment_note: `${paymentNote} (Fines Deducted: Rs.${unpaidFineAmount})`,
      paid_by_admin: adminName || 'Admin'
    };

    setLoading(true);
    try {
      await saveTeacherPayment(payload);
      if (unpaidFineAmount > 0) {
        await markTeacherFinesAsPaid(teacher.teacher_id);
      }
      alert('Teacher salary disbursed successfully.');
      setReceiptData({
        ...payload,
        name: teacher.full_name,
        subject: teacher.subject,
        finesDeducted: unpaidFineAmount,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachersList.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.teacher_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const salaryPrintContent = receiptData ? (
    <div className="text-slate-900 font-medium p-4">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Teacher Salary Slip</p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">PIASS College of Nursing & IT</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {receiptData.date}</p>
      </header>

      <div className="mb-6 rounded-xl border border-slate-300 bg-slate-50 p-4 grid grid-cols-2 gap-3 text-sm">
        <p><b>Teacher Name:</b> {receiptData.name}</p>
        <p><b>Teacher ID:</b> {receiptData.teacher_id}</p>
        <p><b>Subject:</b> {receiptData.subject}</p>
        <p><b>Salary Month:</b> {receiptData.salary_month}</p>
        <p><b>Disbursed By:</b> {receiptData.paid_by_admin}</p>
        <p><b>Note:</b> {receiptData.payment_note}</p>
      </div>

      <table className="w-full border-collapse text-left text-sm mb-8">
        <thead className="bg-[#062b55] text-white">
          <tr>
            <th className="px-4 py-3 font-bold">Salary Description</th>
            <th className="px-4 py-3 font-bold">Amount (PKR)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 font-semibold">
          <tr>
            <td className="px-4 py-3">Total Base Salary</td>
            <td className="px-4 py-3">Rs. {receiptData.total_salary}</td>
          </tr>
          {receiptData.finesDeducted > 0 && (
            <tr>
              <td className="px-4 py-3 text-red-600">Fine Deductions</td>
              <td className="px-4 py-3 text-red-600">- Rs. {receiptData.finesDeducted}</td>
            </tr>
          )}
          <tr className="bg-emerald-50">
            <td className="px-4 py-3 font-bold text-emerald-800">Net Paid Salary</td>
            <td className="px-4 py-3 font-bold text-emerald-800">Rs. {receiptData.paid_amount}</td>
          </tr>
          <tr className="bg-slate-100">
            <td className="px-4 py-3 font-bold text-slate-900">Remaining Balance</td>
            <td className="px-4 py-3 font-bold text-slate-900">Rs. {receiptData.remaining_balance}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between mt-24 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Teacher Signature</p>
        <p>Authorized Accountant / Stamp</p>
      </div>
    </div>
  ) : null;

  const managerContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Teacher Salary & Fine Management</h1>
      </header>

      <div className="flex gap-3 mb-8 no-print">
        <button onClick={() => setSubTab('pay')} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subTab === 'pay' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Pay Salary & Auto-Deduct Fine</button>
        <button onClick={() => setSubTab('fine')} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subTab === 'fine' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Apply Teacher Fine</button>
        <button onClick={() => setSubTab('list')} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subTab === 'list' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>All Teachers Directory</button>
      </div>

      {subTab === 'pay' && (
        <div>
          <form onSubmit={handleSearch} className="flex gap-3 mb-6 no-print">
            <input type="text" placeholder="Enter Teacher ID (e.g. T-101)..." value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold" />
            <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3 text-sm font-bold text-white shadow-sm">Search Teacher</button>
          </form>

          {teacher && (
            <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs mb-6">
              <h3 className="text-base font-black text-[#062b55] mb-2">Teacher Profile Found</h3>
              <p className="font-semibold text-slate-800 text-sm"><b>Name:</b> {teacher.full_name} | <b>Subject:</b> {teacher.subject} | <b>Degree:</b> {teacher.degree}</p>
              {unpaidFineAmount > 0 && <p className="text-red-600 font-bold mt-1 text-xs">Unpaid Fines to be Cut: Rs. {unpaidFineAmount}</p>}
            </div>
          )}

          {teacher && (
            <form onSubmit={handlePaymentSubmit} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4 no-print">
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Total Base Salary (Rs):</label>
                <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Net Payable Amount (Auto-adjusted after Fine):</label>
                <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-emerald-800" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Salary Month:</label>
                <input type="text" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Payment Note:</label>
                <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Admin Disbursed By:</label>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
              </div>
              <button type="submit" disabled={loading} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-emerald-700">
                {loading ? 'Processing...' : 'Disburse Salary & Print Slip'}
              </button>
            </form>
          )}

          {receiptData && (
            <div className="mt-8 rounded-2xl border-2 border-dashed border-[#062b55] bg-white p-6 shadow-sm no-print">
              <div className="text-center border-b border-slate-300 pb-3 mb-4">
                <h3 className="text-lg font-black text-[#062b55]">PIASS COLLEGE OF NURSING & IT</h3>
                <p className="text-xs font-bold text-slate-500">OFFICIAL TEACHER SALARY SLIP</p>
              </div>
              <div className="grid gap-2 text-sm font-semibold text-slate-800">
                <p><b>Date:</b> {receiptData.date}</p>
                <p><b>Teacher ID:</b> {receiptData.teacher_id} | <b>Name:</b> {receiptData.name}</p>
                <p><b>Subject:</b> {receiptData.subject} | <b>Month:</b> {receiptData.salary_month}</p>
                {receiptData.finesDeducted > 0 && <p className="text-red-600"><b>Fine Deducted:</b> - Rs. {receiptData.finesDeducted}</p>}
                <hr className="my-2 border-slate-200" />
                <p><b>Total Base Salary:</b> Rs. {receiptData.total_salary}</p>
                <p className="text-emerald-700"><b>Net Paid Amount:</b> Rs. {receiptData.paid_amount}</p>
                <hr className="my-2 border-slate-200" />
                <p><b>Disbursed By:</b> {receiptData.paid_by_admin}</p>
              </div>
              <button onClick={() => window.print()} className="mt-5 w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm">Print Salary Slip</button>
            </div>
          )}
        </div>
      )}

      {subTab === 'fine' && (
        <form onSubmit={handleFineSubmit} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Apply Fine to Teacher</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Teacher ID:</label>
            <input type="text" value={fineTeacherId} onChange={(e) => setFineTeacherId(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Fine Amount (Rs):</label>
            <input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Reason for Fine:</label>
            <input type="text" value={fineReason} onChange={(e) => setFineReason(e.target.value)} placeholder="e.g. Late arrival" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-red-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-red-700">Apply Fine to Teacher</button>
        </form>
      )}

      {subTab === 'list' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-[#062b55] mb-4">All Teachers Directory</h3>
          <input 
            type="text" 
            placeholder="Search teacher by name or ID..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold mb-5"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">Teacher ID</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Subject</th>
                  <th className="px-4 py-3 font-bold">Degree</th>
                  <th className="px-4 py-3 font-bold">Experience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTeachers.length > 0 ? filteredTeachers.map(t => (
                  <tr key={t.id} className="font-semibold">
                    <td className="px-4 py-3">{t.teacher_id}</td>
                    <td className="px-4 py-3">{t.full_name}</td>
                    <td className="px-4 py-3">{t.subject}</td>
                    <td className="px-4 py-3">{t.degree}</td>
                    <td className="px-4 py-3">{t.experience}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="p-6 text-center font-bold text-slate-400">No teachers found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>{managerContent}</Background>
      </div>
      <Print title="PIASS Teacher Salary Slip">{salaryPrintContent}</Print>
    </>
  );
}