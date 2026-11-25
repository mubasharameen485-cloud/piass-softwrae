import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

// Set standard fee for a full Program & Semester batch
export const setProgramSemesterFeeTemplate = async (templateData) => {
  const { data, error } = await supabase
    .from('program_fee_templates')
    .upsert([templateData], { onConflict: 'category, semester' })
    .select();
  if (error) throw error;
  return data[0];
};

// Get template fee
export const getProgramSemesterFee = async (category, semester) => {
  const { data, error } = await supabase
    .from('program_fee_templates')
    .select('standard_fee')
    .eq('category', category)
    .eq('semester', semester)
    .single();
  if (error) return 0; // Default if not set
  return data ? data.standard_fee : 0;
};

// Apply Fine to Student
export const applyStudentFine = async (fineData) => {
  const { data, error } = await supabase
    .from('student_fines')
    .insert([fineData])
    .select();
  if (error) throw error;
  return data[0];
};

// Get total unpaid fines for student
export const getUnpaidStudentFines = async (rollNo) => {
  const { data, error } = await supabase
    .from('student_fines')
    .select('*')
    .eq('roll_no', rollNo)
    .eq('status', 'Unpaid');
  if (error) throw error;
  return data || [];
};