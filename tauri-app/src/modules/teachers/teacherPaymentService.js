import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

export const findTeacherById = async (teacherId) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('teacher_id', teacherId)
    .single();
  if (error) throw new Error('Teacher not found with this ID!');
  return data;
};

export const getAllTeachers = async () => {
  const { data, error } = await supabase.from('teachers').select('*');
  if (error) throw error;
  return data || [];
};

export const applyTeacherFine = async (fineData) => {
  const { data, error } = await supabase.from('teacher_fines').insert([fineData]).select();
  if (error) throw error;
  return data[0];
};

export const getUnpaidTeacherFines = async (teacherId) => {
  const { data, error } = await supabase
    .from('teacher_fines')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('status', 'Unpaid');
  if (error) throw error;
  return data || [];
};

export const markTeacherFinesAsPaid = async (teacherId) => {
  const { error } = await supabase
    .from('teacher_fines')
    .update({ status: 'Paid' })
    .eq('teacher_id', teacherId)
    .eq('status', 'Unpaid');
  if (error) throw error;
};

export const saveTeacherPayment = async (paymentData) => {
  try {
    const res = await invoke('pay_teacher_salary_backend', { payment: paymentData });
    return res;
  } catch (err) {
    const { error } = await supabase.from('teacher_payments').insert([paymentData]);
    if (error) throw error;
    return "Saved via fallback!";
  }
};