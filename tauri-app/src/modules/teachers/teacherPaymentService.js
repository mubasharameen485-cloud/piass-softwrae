import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

// Teacher ID se teacher search karne ke liye
export const findTeacherById = async (teacherId) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('teacher_id', teacherId)
    .single();

  if (error) throw new Error('Teacher not found with this ID!');
  return data;
};

// Save teacher salary payment via Rust Backend
export const saveTeacherPayment = async (paymentData) => {
  try {
    const res = await invoke('pay_teacher_salary_backend', { payment: paymentData });
    return res;
  } catch (err) {
    // Fallback direct supabase if rust invoke fails
    const { error } = await supabase.from('teacher_payments').insert([paymentData]);
    if (error) throw error;
    return "Saved via direct fallback!";
  }
};