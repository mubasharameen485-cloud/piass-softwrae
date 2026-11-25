import React, { useState, useEffect } from 'react';
import { findTeacherById, getAllTeachers, applyTeacherFine, getUnpaidTeacherFines, markTeacherFinesAsPaid, saveTeacherPayment } from './teacherPaymentService';

export default function TeacherPaymentManager() {
  const [subTab, setSubTab] = useState('pay'); // 'pay' or 'fine' or 'list'
  
  // Pay Salary States
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

  // Fine States
  const [fineTeacherId, setFineTeacherId] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');

  // Teachers List State
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

      // Fetch unpaid fines for teacher
      const fines = await getUnpaidTeacherFines(teacherId);
      const totalFine = fines.reduce((acc, curr) => acc + Number(curr.fine_amount), 0);
      setUnpaidFineAmount(totalFine);

      const standardSalary = 40000; // Default or fetched base salary
      setBaseSalary(standardSalary);
      setPaidAmount(standardSalary - totalFine); // Auto cut fine
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
      alert('✅ Fine applied successfully to teacher!');
      setFineTeacherId('');
      setFineAmount('');
      setFineReason('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
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
        await markTeacherFinesAsPaid(teacher.teacher_id); // Clear fines after deduction
      }
      alert('✅ Teacher Salary Disbursed & Fines Deducted Successfully!');
      setReceiptData({
        ...payload,
        name: teacher.full_name,
        subject: teacher.subject,
        finesDeducted: unpaidFineAmount,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachersList.filter(t => 
    t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.teacher_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>💵 Teacher Salary & Fine Management</h2>

      {/* Sub Navigation */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setSubTab('pay')} style={{ padding: '10px 15px', background: subTab === 'pay' ? '#0f766e' : '#e2e8f0', color: subTab === 'pay' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          💸 Pay Salary & Auto-Deduct Fine
        </button>
        <button onClick={() => setSubTab('fine')} style={{ padding: '10px 15px', background: subTab === 'fine' ? '#0f766e' : '#e2e8f0', color: subTab === 'fine' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ⚠️ Apply Teacher Fine
        </button>
        <button onClick={() => setSubTab('list')} style={{ padding: '10px 15px', background: subTab === 'list' ? '#0f766e' : '#e2e8f0', color: subTab === 'list' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          📋 All Teachers Directory
        </button>
      </div>

      {/* 1. PAY SALARY VIEW */}
      {subTab === 'pay' && (
        <div>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input type="text" placeholder="Enter Teacher ID (e.g. T-101)..." value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required style={{ flex: 1, padding: '10px' }} />
            <button type="submit" style={{ padding: '10px 20px', background: '#0f766e', color: 'white', border: 'none', cursor: 'pointer' }}>Search Teacher</button>
          </form>

          {teacher && (
            <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
              <h3>👨‍🏫 Teacher Profile Found</h3>
              <p><b>Name:</b> {teacher.full_name} | <b>Subject:</b> {teacher.subject} | <b>Degree:</b> {teacher.degree}</p>
              {unpaidFineAmount > 0 && <p style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Unpaid Fines to be Cut: Rs. {unpaidFineAmount}</p>}
            </div>
          )}

          {teacher && (
            <form onSubmit={handlePaymentSubmit} style={{ display: 'grid', gap: '12px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
              <div>
                <label>Total Base Salary (Rs):</label>
                <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Net Payable Amount (Auto-adjusted after Fine deduction):</label>
                <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required style={{ width: '100%', padding: '8px', fontWeight: 'bold', color: 'green' }} />
              </div>
              <div>
                <label>Salary Month:</label>
                <input type="text" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Payment Note:</label>
                <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Admin Disbursed By:</label>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Processing...' : 'Disburse Salary & Print Slip'}
              </button>
            </form>
          )}

          {/* Salary Slip Receipt */}
          {receiptData && (
            <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #0f766e', background: '#fff' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                <h2>PIASS COLLEGE OF NURSING & IT</h2>
                <h4>OFFICIAL TEACHER SALARY SLIP</h4>
              </div>
              <div style={{ margin: '15px 0' }}>
                <p><b>Date:</b> {receiptData.date}</p>
                <p><b>Teacher ID:</b> {receiptData.teacher_id} | <b>Name:</b> {receiptData.name}</p>
                <p><b>Subject:</b> {receiptData.subject} | <b>Month:</b> {receiptData.salary_month}</p>
                {receiptData.finesDeducted > 0 && <p style={{ color: 'red' }}><b>Fine Deducted:</b> - Rs. {receiptData.finesDeducted}</p>}
                <hr />
                <p><b>Total Base Salary:</b> Rs. {receiptData.total_salary}</p>
                <p style={{ color: 'green' }}><b>Net Paid Amount:</b> Rs. {receiptData.paid_amount}</p>
                <hr />
                <p><b>Disbursed By:</b> {receiptData.paid_by_admin}</p>
              </div>
              <button onClick={() => window.print()} style={{ width: '100%', background: '#16a34a', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🖨️ Print Salary Slip</button>
            </div>
          )}
        </div>
      )}

      {/* 2. APPLY TEACHER FINE VIEW */}
      {subTab === 'fine' && (
        <form onSubmit={handleFineSubmit} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>⚠️ Apply Fine to Teacher</h3>
          <div>
            <label style={{ fontWeight: 'bold' }}>Teacher ID:</label>
            <input type="text" value={fineTeacherId} onChange={(e) => setFineTeacherId(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Fine Amount (Rs):</label>
            <input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Reason for Fine:</label>
            <input type="text" value={fineReason} onChange={(e) => setFineReason(e.target.value)} placeholder="e.g. Late arrival / Absent without leave" required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ background: '#dc2626', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Apply Fine to Teacher</button>
        </form>
      )}

      {/* 3. TEACHERS DIRECTORY LIST VIEW */}
      {subTab === 'list' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>📋 All Teachers Directory & Search</h3>
          <input 
            type="text" 
            placeholder="Search teacher by name or ID..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            style={{ width: '100%', padding: '10px', margin: '15px 0' }}
          />
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th>Teacher ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Degree</th>
                <th>Experience</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map(t => (
                  <tr key={t.id}>
                    <td><b>{t.teacher_id}</b></td>
                    <td>{t.full_name}</td>
                    <td>{t.subject}</td>
                    <td>{t.degree}</td>
                    <td>{t.experience}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No teachers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}