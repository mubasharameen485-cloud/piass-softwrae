import React, { useState } from 'react';
import { findTeacherById, saveTeacherPayment } from './teacherPaymentService';

export default function TeacherPaymentManager() {
  const [teacherId, setTeacherId] = useState('');
  const [teacher, setTeacher] = useState(null);
  const [totalSalary, setTotalSalary] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('May 2026');
  const [paymentNote, setPaymentNote] = useState('Monthly Salary');
  const [adminName, setAdminName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await findTeacherById(teacherId);
      setTeacher(data);
      setReceiptData(null);
    } catch (err) {
      alert(err.message);
      setTeacher(null);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!teacher) return;

    const total = parseFloat(totalSalary) || 0;
    const paid = parseFloat(paidAmount) || 0;
    const remaining = total - paid;

    const payload = {
      teacher_id: teacher.teacher_id,
      total_salary: total,
      paid_amount: paid,
      remaining_balance: remaining,
      salary_month: salaryMonth,
      payment_note: paymentNote,
      paid_by_admin: adminName || 'Admin'
    };

    setLoading(true);
    try {
      await saveTeacherPayment(payload);
      alert('✅ Teacher Salary Paid Successfully!');
      setReceiptData({
        ...payload,
        name: teacher.full_name,
        father_name: teacher.father_name,
        subject: teacher.subject,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>💵 Teacher Salary & Payment Management</h2>

      {/* Search Teacher by ID */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Enter Teacher ID (e.g. T-101)" 
          value={teacherId} 
          onChange={(e) => setTeacherId(e.target.value)} 
          required 
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#0f766e', color: 'white', border: 'none', cursor: 'pointer' }}>
          Search Teacher
        </button>
      </form>

      {/* Teacher Profile Card */}
      {teacher && (
        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <h3>👨‍🏫 Teacher Profile Found</h3>
          <p><b>Name:</b> {teacher.full_name} s/o {teacher.father_name}</p>
          <p><b>Subject:</b> {teacher.subject} | <b>Degree:</b> {teacher.degree}</p>
        </div>
      )}

      {/* Salary Payment Form */}
      {teacher && (
        <form onSubmit={handlePaymentSubmit} style={{ display: 'grid', gap: '12px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
          <div>
            <label>Total Monthly Salary (Rs):</label>
            <input type="number" value={totalSalary} onChange={(e) => setTotalSalary(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Amount Paying Now (Rs):</label>
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Salary Month:</label>
            <input type="text" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} placeholder="e.g. May 2026" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Payment Note / Description:</label>
            <input type="text" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Admin / Disbursed By:</label>
            <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} placeholder="Admin name" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Pay Salary & Generate Slip'}
          </button>
        </form>
      )}

      {/* Printable Salary Slip */}
      {receiptData && (
        <div style={{ marginTop: '30px', padding: '20px', border: '2px dashed #0f766e', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <h2>PIASS COLLEGE OF NURSING & IT</h2>
            <p>Main Ferozpur Road, Opposite New Bus Terminal, Kasur</p>
            <h4>OFFICIAL TEACHER SALARY SLIP</h4>
          </div>
          <div style={{ margin: '15px 0' }}>
            <p><b>Payment Date:</b> {receiptData.date}</p>
            <p><b>Teacher ID:</b> {receiptData.teacher_id}</p>
            <p><b>Teacher Name:</b> {receiptData.name} s/o {receiptData.father_name}</p>
            <p><b>Subject:</b> {receiptData.subject}</p>
            <p><b>Salary Month:</b> {receiptData.salary_month} ({receiptData.payment_note})</p>
            <hr />
            <p><b>Total Salary:</b> Rs. {receiptData.total_salary}</p>
            <p style={{ color: 'green' }}><b>Paid Amount:</b> Rs. {receiptData.paid_amount}</p>
            <p style={{ color: 'red' }}><b>Remaining Balance:</b> Rs. {receiptData.remaining_balance}</p>
            <hr />
            <p><b>Disbursed By:</b> {receiptData.paid_by_admin}</p>
          </div>
          <button onClick={handlePrint} style={{ width: '100%', background: '#16a34a', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            🖨️ Print Salary Slip Directly
          </button>
        </div>
      )}
    </div>
  );
}