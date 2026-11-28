import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { generateStudentResultPDF } from '../../utils/pdfGenerator';

export default function ResultCardPrintView() {
  const [allExamsList, setAllExamsList] = useState([]);
  const [selectedExamForView, setSelectedExamForView] = useState(null);
  const [viewStudentsResults, setViewStudentsResults] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Filters
  const [filterProgram, setFilterProgram] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [searchRollOrName, setSearchRollOrName] = useState('');

  const categories = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  useEffect(() => {
    const fetchAllExams = async () => {
      const { data } = await supabase.from('result_exams').select('*').order('academic_year', { ascending: false });
      setAllExamsList(data || []);
    };
    fetchAllExams();
  }, []);

  const handleSelectExamToView = async (exam) => {
    setSelectedExamForView(exam);
    const { data: subData } = await supabase.from('result_subjects').select('*').eq('exam_id', exam.id);
    const { data: markData } = await supabase.from('student_marks').select('*').eq('exam_id', exam.id);
    const { data: stdData } = await supabase.from('students').select('*');

    const combined = (markData || []).map(m => {
      const studentProfile = (stdData || []).find(st => st.roll_no === m.roll_no) || {};
      return { ...m, ...studentProfile, subjects: subData || [] };
    });

    setViewStudentsResults(combined);
  };

  const filteredExamsList = allExamsList.filter(ex => {
    const matchProg = filterProgram === 'All' || ex.category === filterProgram;
    const matchSem = filterSemester === 'All' || ex.semester === filterSemester;
    return matchProg && matchSem;
  });

  const filteredStudentsResults = viewStudentsResults.filter(res => {
    if (!searchRollOrName.trim()) return true;
    const q = searchRollOrName.toLowerCase();
    return (res.roll_no && res.roll_no.toLowerCase().includes(q)) || 
           (res.full_name && res.full_name.toLowerCase().includes(q)) ||
           (res.student_name && res.student_name.toLowerCase().includes(q));
  });

  const handleDownloadPDF = async (studentRes) => {
    try {
      setLoadingPdf(true);
      await generateStudentResultPDF(studentRes, selectedExamForView, studentRes.subjects);
      alert('PDF Result Card generated and downloaded successfully.');
    } catch (err) {
      alert('Error generating PDF: ' + err.message);
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div>
      {!selectedExamForView ? (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-lg font-black text-[#062b55] mb-2">Past Results & Exam Archive</h3>
          <p className="text-xs font-semibold text-slate-500 mb-5">Filter by Program or Semester, or select an exam session below to generate PDF result cards.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Filter Program:</label>
              <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold">
                <option value="All">All Programs</option>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Filter Semester:</label>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold">
                <option value="All">All Semesters</option>
                {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-3">
            {filteredExamsList.length > 0 ? filteredExamsList.map(ex => (
              <div key={ex.id} onClick={() => handleSelectExamToView(ex)} className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50 p-4 transition hover:border-[#062b55] flex justify-between items-center">
                <div>
                  <h4 className="text-base font-black text-[#062b55] mb-1">{ex.category} - {ex.semester}</h4>
                  <p className="text-xs font-semibold text-slate-600">Term: <b>{ex.term_type}</b> | Year: {ex.academic_year}</p>
                </div>
                <button className="cursor-pointer bg-[#062b55] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs">View Results</button>
              </div>
            )) : <p className="font-bold text-slate-400">No exam results found matching these filters.</p>}
          </div>
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedExamForView(null)} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
            ← Back to Exam Sessions
          </button>
          <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
            <h3 className="text-base font-black text-[#062b55]">Results: {selectedExamForView.category} ({selectedExamForView.semester}) - {selectedExamForView.term_type}</h3>
            <input 
              type="text" 
              placeholder="Search student roll no or name..." 
              value={searchRollOrName} 
              onChange={(e) => setSearchRollOrName(e.target.value)} 
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold w-72 shadow-xs"
            />
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">Roll No</th>
                  <th className="px-4 py-3 font-bold">Student Name</th>
                  <th className="px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudentsResults.length > 0 ? filteredStudentsResults.map(res => (
                  <tr key={res.id} className="font-semibold">
                    <td className="px-4 py-3 text-slate-900">{res.roll_no}</td>
                    <td className="px-4 py-3 text-slate-900">{res.full_name || res.student_name}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleDownloadPDF(res)} 
                        disabled={loadingPdf}
                        className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
                      >
                        {loadingPdf ? 'Generating PDF...' : 'Download PDF Result Card'}
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="3" className="p-8 text-center font-bold text-slate-400">No student records found matching search.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}