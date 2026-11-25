import { supabase } from '../../services/supabaseClient';

// Get all students
export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('admission_date', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Add new student (Admission)
export const addStudent = async (studentData) => {
  const { data, error } = await supabase
    .from('students')
    .insert([studentData])
    .select();
  
  if (error) throw error;
  return data[0];
};

// Update student status (Active / Dropped / Stuck_off)
export const updateStudentStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('students')
    .update({ status })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};