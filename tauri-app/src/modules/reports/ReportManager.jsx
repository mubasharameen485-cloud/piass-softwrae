import React, { useMemo, useState, useEffect } from 'react';
import Background from './Background';
import Print from './Print';
import { fetchFinancialData, saveExpense } from './reportService';

const getLocalToday = () => new Date().toLocaleDateString('en-CA');
const money = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

export default function ReportManager() {
  const today = useMemo(() => getLocalToday(), []);
  const monthNow = today.slice(0, 7);

  const [fees, setFees] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [adminName, setAdminName] = useState('');

  const [period, setPeriod] = useState('daily');
  const [date, setDate] = useState(today);
  const [month, setMonth] = useState(monthNow);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchFinancialData();
      setFees(data.fees);
      setSalaries(data.salaries);
      setExpenses(data.expenses);
    } catch (err) {
      console.error('Error fetching financial reports:', err);
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
      alert('✅ Expense recorded successfully!');
      setExpenseTitle('');
      setExpenseAmount('');
      setAdminName('');
      setShowExpenseModal(false);
      loadData();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const range = useMemo(() => {
    if (period === 'daily') return [date, date];
    if (period === 'monthly') {
      const [year, m] = month.split('-').map(Number);
      const lastDay = String(new Date(year, m, 0).getDate()).padStart(2, '0');
      return [`${month}-01`, `${month}-${lastDay}`];
    }
    return [from, to];
  }, [period, date, month, from, to]);

  const filterDate = (dateStr) => {
    if (!dateStr) return false;
    const d = dateStr.split('T')[0];
    return d >= range[0] && d <= range[1];
  };

  const filteredFees = fees.filter((row) => filterDate(row.payment_date));
  const filteredSalaries = salaries.filter((row) => filterDate(row.payment_date));
  const filteredExpenses = expenses.filter((row) => filterDate(row.expense_date));

  const income = filteredFees.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);
  const salaryTotal = filteredSalaries.reduce((sum, row) => sum + Number(row.paid_amount || 0), 0);
  const expenseTotal = filteredExpenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const balance = income - salaryTotal - expenseTotal;

  const label =
    period === 'daily'
      ? `Daily Report — ${date}`
      : period === 'monthly'
      ? `Monthly Report — ${month}`
      : `Custom Report — ${from} to ${to}`;

  const reportContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">
          Official Financial Statement
        </p>
        <h2 className="mt-1 text-3xl font-black text-[#062b55]">
          {label}
        </h2>
        <p className="text-sm font-semibold text-slate-600 mt-1">
          Generated: {new Date().toLocaleString('en-PK')}
        </p>
      </header>

      {/* Summary Cards with Larger Text */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Total Income', income, 'border-l-emerald-600'],
          ['Salaries', salaryTotal, 'border-l-[#062b55]'],
          ['Other Expenses', expenseTotal, 'border-l-amber-500'],
          ['Net Balance', balance, balance < 0 ? 'border-l-red-600' : 'border-l-emerald-600'],
        ].map(([name, value, accent]) => (
          <div
            key={name}
            className={`rounded-2xl border border-slate-300 border-l-6 ${accent} bg-white/90 p-5 shadow-sm`}
          >
            <p className="text-xs font-black uppercase tracking-wider text-slate-600">{name}</p>
            <p
              className={`mt-2 text-2xl font-black ${
                name === 'Net Balance' && value < 0 ? 'text-red-600' : 'text-[#062b55]'
              }`}
            >
              {money(value)}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        title="Student Fee Collections"
        rows={filteredFees}
        columns={['Roll No', 'Amount', 'Note', 'Collector', 'Date']}
        fields={['roll_no', 'paid_amount', 'installment_note', 'collected_by', 'payment_date']}
      />
      <DataTable
        title="Teacher Salaries"
        rows={filteredSalaries}
        columns={['Teacher ID', 'Amount', 'Month', 'Admin', 'Date']}
        fields={['teacher_id', 'paid_amount', 'salary_month', 'paid_by_admin', 'payment_date']}
      />
      <DataTable
        title="Other Expenses"
        rows={filteredExpenses}
        columns={['Title', 'Amount', 'Added By', 'Date']}
        fields={['title', 'amount', 'added_by', 'expense_date']}
      />
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>
          <div className="mx-auto max-w-7xl px-2">
            
            {/* Top Control Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white px-6 py-5 shadow-sm">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">
                  PIASS College of Nursing Kasur
                </p>
                <h1 className="text-2xl font-black text-[#062b55]">Financial Reports & Expenses</h1>
              </div>

              {/* Filters & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                >
                  + Add Expense (Kharcha)
                </button>

                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-[#062b55] focus:border-[#078343] focus:outline-none"
                >
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom Range</option>
                </select>

                {period === 'daily' && (
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800"
                  />
                )}

                {period === 'monthly' && (
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800"
                  />
                )}

                {period === 'custom' && (
                  <>
                    <input
                      type="date"
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        if (to < e.target.value) setTo(e.target.value);
                      }}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800"
                    />
                    <input
                      type="date"
                      value={to}
                      min={from}
                      onChange={(e) => setTo(e.target.value)}
                      className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800"
                    />
                  </>
                )}

                <button
                  onClick={() => window.print()}
                  className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3e78]"
                >
                  Print / Save PDF
                </button>
              </div>
            </div>

            {/* Add Expense Modal Popup */}
            {showExpenseModal && (
              <div className="mb-6 rounded-2xl border-2 border-red-500 bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-xl font-black text-[#062b55]">Record Manual Expense (Utility, Stationery, etc.)</h3>
                <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Expense Title (e.g. Electricity Bill)"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Amount (Rs)"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Added By (Admin Name)"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    required
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-sm hover:bg-emerald-700">Save</button>
                    <button type="button" onClick={() => setShowExpenseModal(false)} className="rounded-xl bg-slate-500 px-4 py-3 font-bold text-white shadow-sm hover:bg-slate-600">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Report Content */}
            {loading ? <p className="text-center font-bold py-10 text-lg">Loading financial reports...</p> : <div className="px-1">{reportContent}</div>}
          </div>
        </Background>
      </div>

      <Print title="PIASS Financial Report">{reportContent}</Print>
    </>
  );
}

function DataTable({ title, rows, columns, fields }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-6 w-2 rounded-full bg-[#078343]" />
        <h3 className="text-base font-black uppercase tracking-wide text-[#062b55]">
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs print:border-none print:shadow-none">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#062b55] text-white">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-3.5 font-bold tracking-wide">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id || Math.random()} className="transition hover:bg-slate-50 font-semibold">
                  {fields.map((field) => (
                    <td key={field} className="px-5 py-3.5 text-slate-800">
                      {field.includes('amount') ? money(row[field]) : row[field] ? String(row[field]).split('T')[0] : '—'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center font-bold text-slate-400 text-sm">
                  No records found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}