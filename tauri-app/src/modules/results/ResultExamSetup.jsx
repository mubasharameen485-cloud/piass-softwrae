import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function ResultExamSetup({ onExamCreated }) {
  const [category, setCategory] = useState('BS Computer Science');
  const [semester, setSemester] = useState('1st Semester');
  const [termType, setTermType] = useState('Mid Term');
  const [academicYear, setAcademicYear] = useState('2026');
  
  const [currentExamId, setCurrentExamId] = useState(null);
  const [subjectsList, setSubjectsList] = useState([]);
  const [subName, setSubName] = useState('');
  const [subTotalMarks, setSubTotalMarks] = useState('');
  const [step, setStep] = useState(1); // 1: Header Info, 2: Add Subjects

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

  const terms = ['Mid Term', 'Final Term', 'Monthly Test', 'Weekly Quiz', 'Semester Evaluation'];

  const handleCreateExamHeader = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('result_exams').insert([{
        category, semester, term_type: termType, academic_year: academicYear
      }]).select().single();

      if (error) throw error;
      setCurrentExamId(data.id);
      setStep(2);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddSubjectToExam = async (e) => {
    e.preventDefault();
    try {
      const newSub = { subject_name: subName, total_marks: parseFloat(subTotalMarks) || 100 };
      const { error } = await supabase.from('result_subjects').insert([{
        exam_id: currentExamId, ...newSub
      }]);
      if (error) throw error;

      setSubjectsList([...subjectsList, newSub]);
      setSubName(''); setSubTotalMarks('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs max-w-2xl mx-auto">
      {step === 1 ? (
        <form onSubmit={handleCreateExamHeader} className="grid gap-4">
          <h3 className="text-lg font-black text-[#062b55]">Step 1: Select Exam Category & Term</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program / Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Semester:</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Term Type:</label>
            <select value={termType} onChange={(e) => setTermType(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {terms.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Academic Year:</label>
            <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm mt-2">Proceed to Add Subjects →</button>
        </form>
      ) : (
        <div>
          <h3 className="text-lg font-black text-[#062b55] mb-2">Step 2: Create Subjects & Assign Total Marks</h3>
          <p className="text-xs font-semibold text-slate-500 mb-4">Exam: <b>{category} ({semester}) - {termType} {academicYear}</b></p>
          
          <form onSubmit={handleAddSubjectToExam} className="flex gap-3 mb-5">
            <input type="text" placeholder="Subject Name (e.g. Anatomy)" value={subName} onChange={(e) => setSubName(e.target.value)} required className="flex-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold" />
            <input type="number" placeholder="Total Marks" value={subTotalMarks} onChange={(e) => setSubTotalMarks(e.target.value)} required className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold" />
            <button type="submit" className="cursor-pointer rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white shadow-sm">Add Subject</button>
          </form>

          <h4 className="text-sm font-bold text-slate-700 mb-2">Added Subjects List:</h4>
          <ul className="list-disc pl-5 mb-6 text-sm font-semibold text-slate-800">
            {subjectsList.map((s, idx) => <li key={idx}><b>{s.subject_name}</b> (Total Marks: {s.total_marks})</li>)}
          </ul>

          <button onClick={() => onExamCreated(currentExamId, category, semester, subjectsList)} className="w-full cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm">Proceed to Enter Class Marks Grid →</button>
        </div>
      )}
    </div>
  );
}