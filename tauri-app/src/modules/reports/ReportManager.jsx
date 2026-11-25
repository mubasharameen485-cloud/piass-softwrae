import React, { useState, useEffect } from 'react';
import { fetchFinancialData, saveExpense } from './reportService';

export default function ReportManager() {
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'monthly'
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [adminName, setAdminName] = useState('');

  // Data States
  const [fees, setFees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFinancialData();
      setFees(data.fees);
      setSalaries(data.salaries);
      setExpenses(data.expenses);
    } catch (err) {
      console.error('Error loading reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveExpense({
        title: expenseTitle,
        amount: parseFloat(expenseAmount) || 0,
        added_by: adminName || 'Admin'
      });
      alert('✅ Expense Recorded Successfully!');
      setExpenseTitle('');
      setExpenseAmount('');
      setShowExpenseModal(false);
      loadData();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // --- FILTER LOGIC ---
  const now = new Date();

  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toDateString() === now.toDateString();
  };

  const isWithinLast30Days = (dateStr) => {
    const d = new Date(dateStr);
    const diffTime = Math.abs(now - d);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  };

  const filteredFees = fees.filter(f => viewType === 'daily' ? isToday(f.payment_date) : isWithinLast30Days(f.payment_date));
  const filteredSalaries = salaries.filter(s => viewType === 'daily' ? isToday(s.payment_date) : isWithinLast30Days(s.payment_date));
  const filteredExpenses = expenses.filter(e => viewType === 'daily' ? isToday(e.expense_date) : isWithinLast30Days(e.expense_date));

  const totalIncome = filteredFees.reduce((acc, curr) => acc + Number(curr.paid_amount), 0);
  const totalSalariesPaid = filteredSalaries.reduce((acc, curr) => acc + Number(curr.paid_amount), 0);
  const totalOtherExpenses = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOutflow = totalSalariesPaid + totalOtherExpenses;
  const netBalance = totalIncome - totalOutflow;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📊 Financial & Daily/Monthly Reports</h2>

      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }} className="no-print">
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={viewType} 
            onChange={(e) => setViewType(e.target.value)} 
            style={{ padding: '10px', fontWeight: 'bold', borderRadius: '4px' }}
          >
            <option value="daily">📅 Today's Report (Last 24 Hours)</option>
            <option value="monthly">🗓️ Monthly Report (Last 30 Days)</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handlePrintReport} 
            style={{ background: '#16a34a', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🖨️ Print / Save PDF Report
          </button>
          <button 
            onClick={() => setShowExpenseModal(true)} 
            style={{ background: '#dc2626', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ➕ Add Other Expense
          </button>
        </div>
      </div>

      {/* Expense Modal Popup */}
      {showExpenseModal && (
        <div style={{ background: '#f8fafc', border: '2px solid #dc2626', padding: '20px', borderRadius: '6px', marginBottom: '20px' }} className="no-print">
          <h3>Record Other Expense (e.g. Bill, Tea, Repair)</h3>
          <form onSubmit={handleExpenseSubmit} style={{ display: 'grid', gap: '10px' }}>
            <input type="text" placeholder="Expense Title (e.g. Electricity Bill)" value={expenseTitle} onChange={(e) => setExpenseTitle(e.target.value)} required style={{ padding: '8px' }} />
            <input type="number" placeholder="Amount (Rs)" value={expenseAmount} onChange={(e) => setExpenseAmount(e.target.value)} required style={{ padding: '8px' }} />
            <input type="text" placeholder="Recorded By Admin Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} required style={{ padding: '8px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ background: '#16a34a', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer' }}>Save Expense</button>
              <button type="button" onClick={() => setShowExpenseModal(false)} style={{ background: '#64748b', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading financial reports...</p>
      ) : (
        <div id="printable-report-area">
          {/* Printable Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #0f766e', paddingBottom: '10px' }}>
            <h2>PIASS COLLEGE OF NURSING & IT, KASUR</h2>
            <h3>Official Financial Statement ({viewType === 'daily' ? 'Daily Report' : 'Monthly Report'})</h3>
            <p>Generated on: {new Date().toLocaleString()}</p>
          </div>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' }}>
            <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #16a34a' }}>
              <h4>Total Income (Fee)</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534' }}>Rs. {totalIncome}</p>
            </div>
            <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #dc2626' }}>
              <h4>Teacher Salaries</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#991b1b' }}>Rs. {totalSalariesPaid}</p>
            </div>
            <div style={{ background: '#fef9c3', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #ca8a04' }}>
              <h4>Other Expenses</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#854d0e' }}>Rs. {totalOtherExpenses}</p>
            </div>
            <div style={{ background: '#e0f2fe', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #0284c7' }}>
              <h4>Net Balance</h4>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0369a1' }}>Rs. {netBalance}</p>
            </div>
          </div>

          {/* Detailed Lists */}
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4>📥 Student Fee Collections</h4>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Paid Amount</th><th>Note</th><th>Collector</th><th>Date/Time</th></tr>
                </thead>
                <tbody>
                  {filteredFees.length > 0 ? filteredFees.map(f => (
                    <tr key={f.id}>
                      <td>{f.roll_no}</td>
                      <td style={{ color: 'green', fontWeight: 'bold' }}>Rs. {f.paid_amount}</td>
                      <td>{f.installment_note}</td>
                      <td>{f.collected_by}</td>
                      <td>{new Date(f.payment_date).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No fee records found.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4>📤 Teacher Salaries Disbursed</h4>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}><th>Teacher ID</th><th>Paid Salary</th><th>Month</th><th>Admin</th><th>Date/Time</th></tr>
                </thead>
                <tbody>
                  {filteredSalaries.length > 0 ? filteredSalaries.map(s => (
                    <tr key={s.id}>
                      <td>{s.teacher_id}</td>
                      <td style={{ color: 'red', fontWeight: 'bold' }}>Rs. {s.paid_amount}</td>
                      <td>{s.salary_month}</td>
                      <td>{s.paid_by_admin}</td>
                      <td>{new Date(s.payment_date).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No salary records found.</td></tr>}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <h4>🧾 Other Expenses (Akhrajat)</h4>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}><th>Title</th><th>Amount</th><th>Added By</th><th>Date/Time</th></tr>
                </thead>
                <tbody>
                  {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
                    <tr key={e.id}>
                      <td>{e.title}</td>
                      <td style={{ color: 'orange', fontWeight: 'bold' }}>Rs. {e.amount}</td>
                      <td>{e.added_by}</td>
                      <td>{new Date(e.expense_date).toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No other expenses found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}