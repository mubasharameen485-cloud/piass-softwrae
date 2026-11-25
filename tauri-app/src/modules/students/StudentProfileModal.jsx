import React, { useEffect, useState } from 'react';
import { getStudentFeeHistory, updateStudentSemester } from './studentRecordService';

export default function StudentProfileModal({ student, onClose, onUpdate }) {
  const [feeHistory, setFeeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSem, setNewSem] = useState(student.semester);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getStudentFeeHistory(student.roll_no);
        setFeeHistory(data || []);
      } catch (err) {
        console.error('Error fetching fee history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [student.roll_no]);

  const handlePromote = async () => {
    try {
      setUpdating(true);
      await updateStudentSemester(student.id, newSem);
      alert('✅ Student semester updated successfully!');
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('❌ Error updating semester: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '700px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
        
        {/* Header with Print & Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '10px', marginBottom: '20px' }} className="no-print">
          <h2>📄 Student Profile & Full Record</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} style={{ background: '#16a34a', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print Profile</button>
            <button onClick={onClose} style={{ background: '#dc2626', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-profile">
          {/* Top Info (Photo + Details) */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <div>
              {student.image_url ? (
                <img src={student.image_url} alt="Student" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #0f766e' }} />
              ) : (
                <div style={{ width: '100px', height: '100px', background: '#cbd5e1', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', color: '#555' }}>No Photo</div>
              )}
            </div>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>{student.full_name}</h3>
              <p style={{ margin: '3px 0' }}><b>Roll No / ID:</b> {student.roll_no}</p>
              <p style={{ margin: '3px 0' }}><b>Father Name:</b> {student.father_name}</p>
              <p style={{ margin: '3px 0' }}><b>Program:</b> {student.category}</p>
              <p style={{ margin: '3px 0' }}><b>Current Semester:</b> <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{student.semester}</span></p>
              <p style={{ margin: '3px 0' }}><b>Phone:</b> {student.phone} | <b>Status:</b> <span style={{ color: student.status === 'Active' ? 'green' : 'red' }}>{student.status}</span></p>
            </div>
          </div>

          {/* Quick Promote Section (Inside Modal) */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', background: '#e2e8f0', padding: '10px', borderRadius: '6px' }} className="no-print">
            <label style={{ fontWeight: 'bold' }}>Change Semester:</label>
            <select value={newSem} onChange={(e) => setNewSem(e.target.value)} style={{ padding: '6px' }}>
              {["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"].map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={handlePromote} disabled={updating} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
              {updating ? 'Updating...' : 'Update Semester'}
            </button>
          </div>

          {/* Fee History Table */}
          <h4>💰 Fee Payment History</h4>
          {loading ? (
            <p>Loading fee history...</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>Total Fee</th>
                  <th>Paid Amount</th>
                  <th>Remaining</th>
                  <th>Note</th>
                  <th>Collector</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feeHistory.length > 0 ? (
                  feeHistory.map(f => (
                    <tr key={f.id}>
                      <td>Rs. {f.total_fee}</td>
                      <td style={{ color: 'green', fontWeight: 'bold' }}>Rs. {f.paid_amount}</td>
                      <td style={{ color: 'red', fontWeight: 'bold' }}>Rs. {f.remaining_balance}</td>
                      <td>{f.installment_note}</td>
                      <td>{f.collected_by}</td>
                      <td>{new Date(f.payment_date).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No fee records found for this student.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}