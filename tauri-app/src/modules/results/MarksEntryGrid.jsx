import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function MarksEntryGrid({ examId, category, semester, subjectsList, onFinished }) {
  const [classStudents, setClassStudents] = useState([]);
  const [bulkMarks, setBulkMarks] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students').select('*').eq('category', category).eq('semester', semester);
      setClassStudents(data || []);
    };
    fetchStudents();
  }, [category, semester]);

  const handleSaveAllMarks = async () => {
    try {
      setLoading(true);
      let recordsToInsert = classStudents.map(s => ({
        exam_id: examId,
        roll_no: s.roll_no,
        student_name: s.full_name,
        marks_data: bulkMarks[s.roll_no] || {}
      }));

      for (let rec of recordsToInsert) {
        await supabase.from('student_marks').delete().eq('exam_id', examId).eq('roll_no', rec.roll_no);
      }
      const { error } = await supabase.from('student_marks').insert(recordsToInsert);
      if (error) throw error;

      alert('All student marks saved successfully.');
      onFinished();
    } catch (err) {
      alert('Error saving marks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs">
      <h3 className="text-lg font-black text-[#062b55] mb-4">Step 3: Enter Class Marks (Excel Style Grid)</h3>
      
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#062b55] text-white">
            <tr>
              <th className="px-4 py-3 font-bold">Roll No</th>
              <th className="px-4 py-3 font-bold">Student Name</th>
              {subjectsList.map((sub, i) => <th key={i} className="px-4 py-3 font-bold">{sub.subject_name} <br/><small>(Max: {sub.total_marks})</small></th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {classStudents.map(st => (
              <tr key={st.id} className="font-semibold">
                <td className="px-4 py-3 text-slate-900">{st.roll_no}</td>
                <td className="px-4 py-3 text-slate-900">{st.full_name}</td>
                {subjectsList.map((sub, i) => (
                  <td key={i} className="px-4 py-3">
                    <input 
                      type="number" 
                      placeholder="Marks"
                      value={bulkMarks[st.roll_no]?.[sub.subject_name] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBulkMarks(prev => ({
                          ...prev,
                          [st.roll_no]: {
                            ...(prev[st.roll_no] || {}),
                            [sub.subject_name]: val
                          }
                        }));
                      }}
                      className="w-20 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={handleSaveAllMarks} disabled={loading} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-emerald-700 mt-4">
        {loading ? 'Saving...' : 'Save All Class Marks & Finish'}
      </button>
    </div>
  );
}