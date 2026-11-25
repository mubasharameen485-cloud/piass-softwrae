import { supabase } from '../../services/supabaseClient';

// Search student by roll number or name for editing
export const searchStudentsForEdit = async (query) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .or(`roll_no.ilike.%${query}%,full_name.ilike.%${query}%`);

  if (error) throw error;
  return data;
};

// Update individual student details
export const updateStudentDetails = async (id, updateFields) => {
  const { data, error } = await supabase
    .from('students')
    .update(updateFields)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// Bulk Batch Promotion (e.g., All students of BS CS from 1st Sem to 2nd Sem)
export const bulkPromoteBatch = async (category, oldSemester, newSemester) => {
  const { data, error } = await supabase
    .from('students')
    .update({ semester: newSemester })
    .eq('category', category)
    .eq('semester', oldSemester)
    .select();

  if (error) throw error;
  return data;
};

// Soft Delete / Status Update (Graduated, Dropped, Stuck_off, Migrated)
export const updateStudentStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('students')
    .update({ status: status })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};