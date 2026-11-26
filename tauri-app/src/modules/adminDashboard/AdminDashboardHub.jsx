import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function AdminDashboardHub() {
  const [activeSub, setActiveSub] = useState('overview'); // 'overview', 'audit-live', 'audit-past', 'students-stat', 'attendance-stat', 'fees-stat', 'expense-stat', 'admission-stat', 'salary-stat', 'fines-stat'
  
  // Stats States
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayFee: 0,
    todayExpense: 0,
    todayAdmissions: 0,
    todaySalaries: 0,
    todayFines: 0,
    absentStudentsCount: 0,
    absentTeachersCount: 0
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [pastAuditDate, setPastAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastAuditLogs, setPastAuditLogs] = useState([]);
  const [detailedDataList, setDetailedDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Students & Teachers Count
      const { count: stdCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
      const { count: tchCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });

      // 2. Today's Fees
      const { data: feesData } = await supabase.from('fees').select('*').gte('payment_date', `${todayStr}T00:00:00`);
      const tFee = (feesData || []).reduce((acc, curr) => acc + Number(curr.paid_amount), 0);

      // 3. Today's Expenses
      const { data: expData } = await supabase.from('expenses').select('*').gte('expense_date', `${todayStr}T00:00:00`);
      const tExp = (expData || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

      // 4. Today's Admissions
      const { count: admCount } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('admission_date', todayStr);

      // 5. Today's Salaries
      const { data: salData } = await supabase.from('teacher_payments').select('*').gte('payment_date', `${todayStr}T00:00:00`);
      const tSal = (salData || []).reduce((acc, curr) => acc + Number(curr.paid_amount), 0);

      // 6. Today's Fines
      const { data: fineData } = await supabase.from('student_fines').select('*').gte('fine_date', `${todayStr}T00:00:00`);
      const tFine = (fineData || []).reduce((acc, curr) => acc + Number(curr.fine_amount), 0);

      // 7. Today's Absentees
      const { count: absStd } = await supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('attendance_date', todayStr).eq('status', 'Absent').not('category', 'eq', 'Staff / Teacher');
      const { count: absTch } = await supabase.from('attendance_records').select('*', { count: 'exact', head: true }).eq('attendance_date', todayStr).eq('status', 'Absent').eq('category', 'Staff / Teacher');

      setStats({
        totalStudents: stdCount || 0,
        totalTeachers: tchCount || 0,
        todayFee: tFee,
        todayExpense: tExp,
        todayAdmissions: admCount || 0,
        todaySalaries: tSal,
        todayFines: tFine,
        absentStudentsCount: absStd || 0,
        absentTeachersCount: absTch || 0
      });

      // Fetch Live Audit (Last 24 Hours)
      const { data: auditData } = await supabase.from('audit_logs').select('*').gte('created_at', new Date(Date.now() - 86400000).toISOString()).order('created_at', { ascending: false });
      setAuditLogs(auditData || []);

    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fetch specific details when clicking dashboard cards
  const handleCardClick = async (type) => {
    setActiveSub(type);
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (type === 'students-stat') {
        const { data } = await supabase.from('students').select('*');
        setDetailedDataList(data || []);
      } else if (type === 'attendance-stat') {
        const { data } = await supabase.from('attendance_records').select('*').eq('attendance_date', todayStr).eq('status', 'Absent');
        setDetailedDataList(data || []);
      } else if (type === 'fees-stat') {
        const { data } = await supabase.from('fees').select('*').gte('payment_date', `${todayStr}T00:00:00`);
        setDetailedDataList(data || []);
      } else if (type === 'expense-stat') {
        const { data } = await supabase.from('expenses').select('*').gte('expense_date', `${todayStr}T00:00:00`);
        setDetailedDataList(data || []);
      } else if (type === 'admission-stat') {
        const { data } = await supabase.from('students').select('*').eq('admission_date', todayStr);
        setDetailedDataList(data || []);
      } else if (type === 'salary-stat') {
        const { data } = await supabase.from('teacher_payments').select('*').gte('payment_date', `${todayStr}T00:00:00`);
        setDetailedDataList(data || []);
      } else if (type === 'fines-stat') {
        const { data } = await supabase.from('student_fines').select('*').gte('fine_date', `${todayStr}T00:00:00`);
        setDetailedDataList(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Past Audit by Date
  const handleFetchPastAudit = async (dateVal) => {
    try {
      setLoading(true);
      const { data } = await supabase.from('audit_logs').select('*').gte('created_at', `${dateVal}T00:00:00`).lte('created_at', `${dateVal}T23:59:59`).order('created_at', { ascending: false });
      setPastAuditLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>🛡️ Admin Master Control & Audit Dashboard</h2>
      <p style={{ color: '#64748b' }}>Complete real-time campus overview and action audit trails.</p>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '20px 0' }} className="no-print">
        <button onClick={() => setActiveSub('overview')} style={{ padding: '8px 14px', background: activeSub === 'overview' ? '#0f766e' : '#e2e8f0', color: activeSub === 'overview' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>📊 Live Overview</button>
        <button onClick={() => setActiveSub('audit-live')} style={{ padding: '8px 14px', background: activeSub === 'audit-live' ? '#0f766e' : '#e2e8f0', color: activeSub === 'audit-live' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔍 Live Audit (24 Hrs)</button>
        <button onClick={() => { setActiveSub('audit-past'); handleFetchPastAudit(pastDate); }} style={{ padding: '8px 14px', background: activeSub === 'audit-past' ? '#0f766e' : '#e2e8f0', color: activeSub === 'audit-past' ? '#fff' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗂️ Past Audit Archive</button>
      </div>

      {/* 1. OVERVIEW CARDS GRID (10 Clickable Options) */}
      {activeSub === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
          
          <div onClick={() => handleCardClick('audit-live')} style={{ background: '#f8fafc', border: '2px solid #0f766e', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>🔍 Live Audit Logs</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>Track operations performed in last 24 hours.</p>
          </div>

          <div onClick={() => handleCardClick('students-stat')} style={{ background: '#e0f2fe', border: '2px solid #0284c7', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#0369a1' }}>🎓 Total Students</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#0369a1' }}>{stats.totalStudents}</p>
          </div>

          <div onClick={() => handleCardClick('attendance-stat')} style={{ background: '#fee2e2', border: '2px solid #dc2626', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#991b1b' }}>📌 Today's Absentees</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#991b1b' }}>Students: {stats.absentStudentsCount} | Staff: {stats.absentTeachersCount}</p>
          </div>

          <div onClick={() => handleCardClick('fees-stat')} style={{ background: '#dcfce7', border: '2px solid #16a34a', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#166534' }}>💰 Today's Fee Collection</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#166534' }}>Rs. {stats.todayFee}</p>
          </div>

          <div onClick={() => handleCardClick('expense-stat')} style={{ background: '#fef9c3', border: '2px solid #ca8a04', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#854d0e' }}>🧾 Today's Expenses</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#854d0e' }}>Rs. {stats.todayExpense}</p>
          </div>

          <div onClick={() => handleCardClick('admission-stat')} style={{ background: '#f3e8ff', border: '2px solid #9333ea', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#7e22ce' }}>📝 Today's Admissions</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#7e22ce' }}>{stats.todayAdmissions}</p>
          </div>

          <div onClick={() => handleCardClick('salary-stat')} style={{ background: '#ffedd5', border: '2px solid #ea580c', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#9a3412' }}>💵 Teacher Salaries Paid</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#9a3412' }}>Rs. {stats.todaySalaries}</p>
          </div>

          <div onClick={() => handleCardClick('fines-stat')} style={{ background: '#ffe4e6', border: '2px solid #f43f5e', padding: '20px', borderRadius: '8px', cursor: 'pointer' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#881337' }}>⚠️ Today's Fines Imposed</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#881337' }}>Rs. {stats.todayFines}</p>
          </div>

          <div style={{ background: '#f1f5f9', border: '2px solid #64748b', padding: '20px', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#334155' }}>👨‍🏫 Total Active Teachers</h4>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '5px 0 0 0', color: '#334155' }}>{stats.totalTeachers}</p>
          </div>

        </div>
      )}

      {/* 2. LIVE AUDIT LOGS VIEW */}
      {activeSub === 'audit-live' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🔍 Live Operation Audit Logs (Auto-refreshes / Last 24 Hours)</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Action Type</th><th>Description</th><th>Performed By</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {auditLogs.length > 0 ? auditLogs.map(l => (
                <tr key={l.id}>
                  <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{l.action_type}</span></td>
                  <td>{l.description}</td>
                  <td><b>{l.performed_by}</b></td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No audit actions recorded in the last 24 hours.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. PAST AUDIT ARCHIVE */}
      {activeSub === 'audit-past' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🗂️ Past Audit Logs Archive</h3>
          <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input type="date" value={pastAuditDate} onChange={(e) => setPastAuditDate(e.target.value)} style={{ padding: '8px' }} />
            <button onClick={() => handleFetchPastAudit(pastAuditDate)} style={{ background: '#0f766e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Fetch Past Audit</button>
          </div>

          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Action Type</th><th>Description</th><th>Performed By</th><th>Timestamp</th></tr>
            </thead>
            <tbody>
              {pastAuditLogs.length > 0 ? pastAuditLogs.map(l => (
                <tr key={l.id}>
                  <td><b>{l.action_type}</b></td>
                  <td>{l.description}</td>
                  <td>{l.performed_by}</td>
                  <td>{new Date(l.created_at).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No audit logs found for {pastAuditDate}.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. DETAILED DRILL-DOWN VIEW (When clicking any dashboard metric card) */}
      {['students-stat', 'attendance-stat', 'fees-stat', 'expense-stat', 'admission-stat', 'salary-stat', 'fines-stat'].includes(activeSub) && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <button onClick={() => setActiveSub('overview')} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Back to Overview</button>
          <h3>Detailed Records View</h3>
          
          {loading ? <p>Loading details...</p> : (
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>Record ID / Roll No</th>
                  <th>Name / Title</th>
                  <th>Details / Amount</th>
                  <th>Date / Time</th>
                </tr>
              </thead>
              <tbody>
                {detailedDataList.length > 0 ? detailedDataList.map(item => (
                  <tr key={item.id}>
                    <td><b>{item.roll_no || item.teacher_id || item.id}</b></td>
                    <td>{item.full_name || item.title || item.name || 'N/A'}</td>
                    <td>{item.paid_amount ? `Rs. ${item.paid_amount}` : item.amount ? `Rs. ${item.amount}` : item.fine_amount ? `Rs. ${item.fine_amount}` : item.status || item.category || 'Active'}</td>
                    <td>{new Date(item.payment_date || item.expense_date || item.fine_date || item.admission_date || item.created_at || Date.now()).toLocaleString()}</td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No detailed records found for this metric today.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}