import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

// Fetch all financial data for reports calculation
export const fetchFinancialData = async () => {
  const [feesRes, salariesRes, expensesRes] = await Promise.all([
    supabase.from('fees').select('*').order('payment_date', { ascending: false }),
    supabase.from('teacher_payments').select('*').order('payment_date', { ascending: false }),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false })
  ]);

  if (feesRes.error) throw feesRes.error;
  if (salariesRes.error) throw salariesRes.error;
  if (expensesRes.error) throw expensesRes.error;

  return {
    fees: feesRes.data || [],
    salaries: salariesRes.data || [],
    expenses: expensesRes.data || []
  };
};

// Save manual expense (Kharcha)
export const saveExpense = async (expenseData) => {
  try {
    // Try calling Tauri backend command if available, otherwise fallback direct to Supabase
    const res = await invoke('add_expense_backend', { expense: expenseData });
    return res;
  } catch (err) {
    const { error } = await supabase.from('expenses').insert([expenseData]);
    if (error) throw error;
    return "Saved via direct fallback!";
  }
};