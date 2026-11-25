import { supabase } from '../../services/supabaseClient';
import { invoke } from '@tauri-apps/api/core';

export const registerTeacher = async (teacherData) => {
  try {
    const res = await invoke('register_teacher_backend', { teacher: teacherData });
    return res;
  } catch (err) {
    // Fallback direct supabase
    const { error } = await supabase.from('teachers').insert([teacherData]);
    if (error) throw error;
    return "Saved via direct fallback!";
  }
};

export const loginTeacher = async (teacherId, password) => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('password', password)
    .single();

  if (error) throw new Error('Invalid Teacher ID or Password!');
  return data;
};