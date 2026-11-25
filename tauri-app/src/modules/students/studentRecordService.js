import { supabase } from '../../services/supabaseClient';

// Get all students
export const getAllStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('admission_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Get specific student fee history by Roll No
export const getStudentFeeHistory = async (rollNo) => {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('roll_no', rollNo)
    .order('payment_date', { ascending: false });

  if (error) throw error;
  return data;
};

// Update student semester (Promotion feature base)
export const updateStudentSemester = async (studentId, newSemester) => {
  const { data, error } = await supabase
    .from('students')
    .update({ semester: newSemester })
    .eq('id', studentId)
    .select();

  if (error) throw error;
  return data[0];
};