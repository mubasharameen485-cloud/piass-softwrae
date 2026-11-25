import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function TeacherDashboard({ teacherId, teacherName, onLogout }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherPayments = async () => {
      try {
        const { data, error } = await supabase
          .from('teacher_payments')
          .select('*')
          .eq('teacher_id', teacherId);
        
        if (error) throw error;
        setPayments(data || []);
      } catch (err) {
        console.error('Error fetching teacher payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherPayments();
  }, [teacherId]);

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '15px', marginBottom: '20px' }}>
        <h2>👨‍🏫 Welcome, {teacherName} (Teacher Portal)</h2>
        <button onClick={onLogout} style={{ background: '#dc2626', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '6px', marginBottom: '20px' }}>
        <h3>📋 My Salary & Payment Records</h3>
        <p>Here you can check whether your salary for specific months has been paid or is pending.</p>
      </div>

      {loading ? (
        <p>Loading your payment records...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
          <thead>
            <tr style={{ background: '#0f766e', color: 'white' }}>
              <th>Salary Month</th>
              <th>Total Salary</th>
              <th>Paid Amount</th>
              <th>Remaining Balance</th>
              <th>Note</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map(p => (
                <tr key={p.id}>
                  <td><b>{p.salary_month}</b></td>
                  <td>Rs. {p.total_salary}</td>
                  <td style={{ color: 'green', fontWeight: 'bold' }}>Rs. {p.paid_amount}</td>
                  <td style={{ color: 'red', fontWeight: 'bold' }}>Rs. {p.remaining_balance}</td>
                  <td>{p.payment_note}</td>
                  <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No salary payment records found yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}