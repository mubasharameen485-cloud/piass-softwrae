import React, { useState, useEffect } from 'react';
import { findStudentByRollNo, saveFeeRecord } from './feeService';
import { setProgramSemesterFeeTemplate, getProgramSemesterFee, applyStudentFine, getUnpaidStudentFines } from './advancedFeeService';

export default function FeeManager() {
  const [subTab, subTabSet] = useState('collect'); // 'collect' or 'template' or 'fine'

  // Collect Fee States
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState(null);
  const [totalFee, setTotalFee] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [installmentNote, setInstallmentNote] = useState('1st Installment');
  const [staffName, setStaffName] = useState('');
  const [unpaidFines, setUnpaidFines] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  // Template Fee States
  const [tCategory, setTCategory] = useState('BS Computer Science');
  const [tSemester, setTSemester] = useState('1st Semester');
  const [tStandardFee, setTStandardFee] = useState('');

  // Fine States
  const [fineRollNo, setFineRollNo] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');

  const categories = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  // Search Student and Auto-fetch template fee + unpaid fines
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await findStudentByRollNo(rollNo);
      setStudent(data);
      setReceiptData(null);

      // Fetch Program & Semester standard fee template
      const standardFee = await getProgramSemesterFee(data.category, data.semester || '1st Semester');
      
      // Fetch unpaid fines
      const fines = await getUnpaidStudentFines(rollNo);
      const totalFine = fines.reduce((acc, curr) => acc + Number(curr.fine_amount), 0);
      setUnpaidFines(totalFine);

      setTotalFee(standardFee + totalFine);
    } catch (err) {
      alert(err.message);
      setStudent(null);
    }
  };

  // Save Template Fee
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await setProgramSemesterFeeTemplate({
        category: tCategory,
        semester: tSemester,
        standard_fee: parseFloat(tStandardFee) || 0
      });
      alert(`✅ Standard Fee for ${tCategory} (${tSemester}) updated successfully!`);
      setTStandardFee('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Apply Fine Submit
  const handleFineSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyStudentFine({
        roll_no: fineRollNo,
        fine_amount: parseFloat(fineAmount) || 0,
        reason: fineReason
      });
      alert('✅ Fine applied successfully to student!');
      setFineRollNo('');
      setFineAmount('');
      setFineReason('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    const total = parseFloat(totalFee) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const remaining = total - paid;

    const payload = {
      roll_no: student.roll_no,
      total_fee: total,
      paid_amount: paid,
      remaining_balance: remaining,
      installment_note: `${installmentNote} (Includes Fines: Rs.${unpaidFines})`,
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
        finesIncluded: unpaidFines,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>💰 Advanced Fee & Fine Management</h2>

      {/* Sub Navigation */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => subTabSet('collect')} style={{ padding: '10px 15px', background: subTab === 'collect' ? '#0f766e' : '#e2e8f0', color: subTab === 'collect' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          💵 Collect Fee & Receipts
        </button>
        <button onClick={() => subTabSet('template')} style={{ padding: '10px 15px', background: subTab === 'template' ? '#0f766e' : '#e2e8f0', color: subTab === 'template' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ⚙️ Set Class / Program Fee
        </button>
        <button onClick={() => subTabSet('fine')} style={{ padding: '10px 15px', background: subTab === 'fine' ? '#0f766e' : '#e2e8f0', color: subTab === 'fine' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ⚠️ Apply Student Fine
        </button>
      </div>

      {/* 1. COLLECT FEE VIEW */}
      {subTab === 'collect' && (
        <div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Enter Roll Number..." value={rollNo} onChange={(e) => setRollNo(e.target.value)} required style={{ flex: 1, padding: '10px' }} />
            <button type="submit" style={{ padding: '10px 20px', background: '#0f766e', color: 'white', border: 'none', cursor: 'pointer' }}>Search Student</button>
          </form>

          {student && (
            <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <h3>👤 Student Profile Found</h3>
              <p><b>Name:</b> {student.full_name} | <b>Program:</b> {student.category} | <b>Semester:</b> {student.semester}</p>
              {unpaidFines > 0 && <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Unpaid Fines Attached: Rs. {unpaidFines}</p>}
            </div>
          )}

          {student && (
            <form onSubmit={handleFeeSubmit} style={{ display: 'grid', gap: '12px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <div>
                <label>Total Fee (Auto-calculated with Fines):</label>
                <input type="number" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Amount Paying Now (Rs):</label>
                <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Installment Note:</label>
                <input type="text" value={installmentNote} onChange={(e) => setInstallmentNote(e.target.value)} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Collector Staff Name:</label>
                <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Processing...' : 'Collect Fee & Generate Receipt'}
              </button>
            </form>
          )}

          {/* Receipt */}
          {receiptData && (
            <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #0f766e', background: '#fff' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                <h2>PIASS COLLEGE OF NURSING & IT</h2>
                <h4>OFFICIAL FEE RECEIPT</h4>
              </div>
              <div style={{ margin: '15px 0' }}>
                <p><b>Date:</b> {receiptData.date}</p>
                <p><b>Roll No:</b> {receiptData.roll_no} | <b>Name:</b> {receiptData.name}</p>
                <p><b>Program:</b> {receiptData.category} ({receiptData.semester})</p>
                {receiptData.finesIncluded > 0 && <p style={{ color: 'red' }}><b>Includes Fine:</b> Rs. {receiptData.finesIncluded}</p>}
                <hr />
                <p><b>Total Fee:</b> Rs. {receiptData.total_fee}</p>
                <p style={{ color: 'green' }}><b>Paid:</b> Rs. {receiptData.paid_amount}</p>
                <p style={{ color: 'red' }}><b>Remaining:</b> Rs. {receiptData.remaining_balance}</p>
                <hr />
                <p><b>Collected By:</b> {receiptData.collected_by}</p>
              </div>
              <button onClick={() => window.print()} style={{ width: '100%', background: '#16a34a', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print Receipt</button>
            </div>
          )}
        </div>
      )}

      {/* 2. SET PROGRAM / SEMESTER TEMPLATE FEE VIEW */}
      {subTab === 'template' && (
        <form onSubmit={handleSaveTemplate} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>⚙️ Bulk Program & Semester Standard Fee Setup</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Set standard fee for an entire class/semester so it auto-fills when collecting fee.</p>
          
          <div>
            <label style={{ fontWeight: 'bold' }}>Program / Category:</label>
            <select value={tCategory} onChange={(e) => setTCategory(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Semester:</label>
            <select value={tSemester} onChange={(e) => setTSemester(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Standard Fee Amount (Rs):</label>
            <input type="number" value={tStandardFee} onChange={(e) => setTStandardFee(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Save Standard Fee Template</button>
        </form>
      )}

      {/* 3. APPLY STUDENT FINE VIEW */}
      {subTab === 'fine' && (
        <form onSubmit={handleFineSubmit} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>⚠️ Apply Fine to Student</h3>
          <div>
            <label style={{ fontWeight: 'bold' }}>Student Roll Number:</label>
            <input type="text" value={fineRollNo} onChange={(e) => setFineRollNo(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Fine Amount (Rs):</label>
            <input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Reason for Fine:</label>
            <input type="text" value={fineReason} onChange={(e) => setFineReason(e.target.value)} placeholder="e.g. Late fee submission / Discipline issue" required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ background: '#dc2626', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Apply Fine</button>
        </form>
      )}
    </div>
  );
}