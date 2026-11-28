import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function DatesheetCreator() {
  const [category, setCategory] = useState('BS Computer Science');
  const [semester, setSemester] = useState('1st Semester');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');

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

  const handleAddDatesheetEntry = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('exam_datesheets').insert([{
        category, semester, subject_name: subjectName, subject_code: subjectCode, exam_date: examDate, exam_time: examTime
      }]);
      if (error) throw error;
      alert('Exam entry added to Datesheet successfully.');
      setSubjectName(''); setSubjectCode(''); setExamDate(''); setExamTime('');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
      <h3 className="text-lg font-black text-[#062b55] mb-4">Create & Assign Datesheet Entries</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program:</label>
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
      </div>

      <form onSubmit={handleAddDatesheetEntry} className="grid gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700">Add Subject Exam Slot</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Subject Name (e.g. Data Structures)" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" />
          <input type="text" placeholder="Subject Code (e.g. CS-301)" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" />
          <input type="text" placeholder="Timing (e.g. 10:00 AM - 01:00 PM)" value={examTime} onChange={(e) => setExamTime(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold" />
        </div>
        <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3 font-bold text-white shadow-sm hover:bg-[#0b3e78] mt-2">Add Exam Slot</button>
      </form>
    </div>
  );
}