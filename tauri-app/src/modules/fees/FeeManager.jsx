import React, { useState } from 'react';
import { findStudentByRollNo, saveFeeRecord } from './feeService';

export default function FeeManager() {
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState(null);
  const [totalFee, setTotalFee] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [installmentNote, setInstallmentNote] = useState('1st Installment');
  const [staffName, setStaffName] = useState('');
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const data = await findStudentByRollNo(rollNo);
      setStudent(data);
      setReceiptData(null);
    } catch (err) {
      alert(err.message);
      setStudent(null);
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
      installment_note: installmentNote,
      collected_by: staffName || 'Admin'
    };

    setLoading(true);
    try {
      await saveFeeRecord(payload);
      alert('✅ Fee Submitted Successfully!');
      setReceiptData({
        ...payload,
        name: student.full_name,
        father_name: student.father_name,
        category: student.category,
        date: new Date().toLocaleString()
      });
    } catch (err) {
      alert('❌ Error saving fee: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print(); // Browser/Tauri native silent/popup print trigger
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>💰 Fee Management & Collection</h2>

      {/* Search Student by Roll No */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Enter Roll Number (e.g. BS-2026-01)" 
          value={rollNo} 
          onChange={(e) => setRollNo(e.target.value)} 
          required 
          style={{ flex: 1, padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#0f766e', color: 'white', border: 'none', cursor: 'pointer' }}>
          Search Student
        </button>
      </form>

      {/* Student Details Card */}
      {student && (
        <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
          <h3>👤 Student Profile Found</h3>
          <p><b>Name:</b> {student.full_name} | <b>Father Name:</b> {student.father_name}</p>
          <p><b>Program:</b> {student.category} | <b>Phone:</b> {student.phone}</p>
        </div>
      )}

      {/* Fee Entry Form */}
      {student && (
        <form onSubmit={handleFeeSubmit} style={{ display: 'grid', gap: '12px', background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '6px' }}>
          <div>
            <label>Total Course/Semester Fee (Rs):</label>
            <input type="number" value={totalFee} onChange={(e) => setTotalFee(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Amount Paying Now (Rs):</label>
            <input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Installment / Note:</label>
            <input type="text" value={installmentNote} onChange={(e) => setInstallmentNote(e.target.value)} placeholder="e.g. 1st Installment / Monthly Fee" style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Staff Name (Collector):</label>
            <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Staff member name" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'Processing...' : 'Collect Fee & Generate Receipt'}
          </button>
        </form>
      )}

      {/* Printable Receipt Area */}
      {receiptData && (
        <div id="receipt-print-area" style={{ marginTop: '30px', padding: '20px', border: '2px dashed #0f766e', background: '#fff' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            <h2>PIASS COLLEGE OF NURSING & IT</h2>
            <p>Main Ferozpur Road, Opposite New Bus Terminal, Kasur</p>
            <h4>OFFICIAL FEE RECEIPT</h4>
          </div>
          <div style={{ margin: '15px 0' }}>
            <p><b>Receipt Date:</b> {receiptData.date}</p>
            <p><b>Roll No:</b> {receiptData.roll_no}</p>
            <p><b>Student Name:</b> {receiptData.name} s/o {receiptData.father_name}</p>
            <p><b>Program:</b> {receiptData.category}</p>
            <p><b>Note / Installment:</b> {receiptData.installment_note}</p>
            <hr />
            <p><b>Total Fee:</b> Rs. {receiptData.total_fee}</p>
            <p style={{ color: 'green' }}><b>Paid Amount:</b> Rs. {receiptData.paid_amount}</p>
            <p style={{ color: 'red' }}><b>Remaining Balance:</b> Rs. {receiptData.remaining_balance}</p>
            <hr />
            <p><b>Collected By Staff:</b> {receiptData.collected_by}</p>
          </div>
          <button onClick={handlePrint} style={{ width: '100%', background: '#16a34a', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            🖨️ Print Receipt Directly
          </button>
        </div>
      )}
    </div>
  );
}