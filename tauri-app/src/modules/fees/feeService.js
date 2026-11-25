import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

// Roll number se student search karne ke liye
export const findStudentByRollNo = async (rollNo) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('roll_no', rollNo)
    .single();

  if (error) throw new Error('Student not found with this Roll Number!');
  return data;
};

// Fee save karna via Rust Backend
export const saveFeeRecord = async (feeData) => {
  try {
    const res = await invoke('collect_fee_backend', { fee: feeData });
    return res;
  } catch (err) {
    // Fallback direct supabase if rust invoke fails in dev
    const { error } = await supabase.from('fees').insert([feeData]);
    if (error) throw error;
    return "Saved via direct fallback!";
  }
};