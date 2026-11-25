import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

// Save manual expense via Rust backend
export const saveExpense = async (expenseData) => {
  try {
    const res = await invoke('add_expense_backend', { expense: expenseData });
    return res;
  } catch (err) {
    const { error } = await supabase.from('expenses').insert([expenseData]);
    if (error) throw error;
    return "Saved via fallback!";
  }
};

// Fetch all financial data for reports calculation
export const fetchFinancialData = async () => {
  const [feesRes, salariesRes, expensesRes] = await Promise.all([
    supabase.from('fees').select('*'),
    supabase.from('teacher_payments').select('*'),
    supabase.from('expenses').select('*')
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