import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function QuestionPaperCreator() {
  const [paperSub, setPaperSub] = useState(null); // 'subjective' or 'objective'
  const [paperCategory, setPaperCategory] = useState('BS Computer Science');
  const [paperSemester, setPaperSemester] = useState('1st Semester');
  const [paperTitle, setPaperTitle] = useState('');
  
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('Short'); 
  const [createdQuestions, setCreatedQuestions] = useState([]);

  const [mcqText, setMcqText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [createdMcqs, setCreatedMcqs] = useState([]);

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

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category: paperCategory, semester: paperSemester, paper_type: 'Subjective',
        subject_title: paperTitle, question_text: qText, question_type: qType
      };
      await supabase.from('exam_papers').insert([payload]);
      setCreatedQuestions([...createdQuestions, payload]);
      setQText('');
      alert('Question added to paper.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddMcq = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category: paperCategory, semester: paperSemester, paper_type: 'Objective',
        subject_title: paperTitle, question_text: mcqText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, question_type: 'MCQ'
      };
      await supabase.from('exam_papers').insert([payload]);
      setCreatedMcqs([...createdMcqs, payload]);
      setMcqText(''); setOptA(''); setOptB(''); setOptC(''); setOptD('');
      alert('MCQ added to paper.');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (!paperSub) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
        <div onClick={() => setPaperSub('subjective')} className="cursor-pointer rounded-2xl border border-pink-300 bg-pink-50/50 p-8 text-center shadow-sm transition hover:bg-pink-100">
          <h3 className="text-lg font-black text-pink-900">Subjective Paper Creator</h3>
          <p className="text-xs text-pink-700 mt-2">Create Short and Long descriptive questions.</p>
        </div>
        <div onClick={() => setPaperSub('objective')} className="cursor-pointer rounded-2xl border border-purple-300 bg-purple-50/50 p-8 text-center shadow-sm transition hover:bg-purple-100">
          <h3 className="text-lg font-black text-purple-900">Objective Paper Creator (MCQs)</h3>
          <p className="text-xs text-purple-700 mt-2">Create multiple choice questions with options.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setPaperSub(null)} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
        ← Back to Paper Types
      </button>

      {paperSub === 'subjective' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-[#062b55] mb-4">Subjective Question Paper Creator</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={paperCategory} onChange={(e) => setPaperCategory(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <select value={paperSemester} onChange={(e) => setPaperSemester(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Subject Title (e.g. Pathology)" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold" />
          </div>

          <form onSubmit={handleAddQuestion} className="grid gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <select value={qType} onChange={(e) => setQType(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold w-48">
              <option value="Short">Short Question</option>
              <option value="Long">Long Question</option>
            </select>
            <textarea placeholder="Write question here..." value={qText} onChange={(e) => setQText(e.target.value)} rows="2" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"></textarea>
            <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-5 py-2.5 font-bold text-white shadow-sm">Add Question</button>
          </form>

          {createdQuestions.length > 0 && (
            <div className="mt-6 bg-white p-5 border border-slate-300 rounded-xl">
              <h4 className="text-base font-black text-[#062b55] mb-3">Paper Preview ({paperTitle})</h4>
              {createdQuestions.map((q, idx) => (
                <p key={idx} className="text-sm font-semibold text-slate-800 mb-2"><b>Q{idx+1} [{q.question_type}]:</b> {q.question_text}</p>
              ))}
              <button onClick={() => window.print()} className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm mt-3">Print Paper</button>
            </div>
          )}
        </div>
      )}

      {paperSub === 'objective' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-[#062b55] mb-4">Objective MCQ Paper Creator</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <select value={paperCategory} onChange={(e) => setPaperCategory(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <select value={paperSemester} onChange={(e) => setPaperSemester(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Subject Title (e.g. Pharmacology)" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold" />
          </div>

          <form onSubmit={handleAddMcq} className="grid gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <textarea placeholder="Write MCQ Question..." value={mcqText} onChange={(e) => setMcqText(e.target.value)} rows="2" required className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"></textarea>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" />
              <input type="text" placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" />
              <input type="text" placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" />
              <input type="text" placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold" />
            </div>
            <button type="submit" className="cursor-pointer rounded-xl bg-purple-700 px-5 py-2.5 font-bold text-white shadow-sm">Add MCQ</button>
          </form>

          {createdMcqs.length > 0 && (
            <div className="mt-6 bg-white p-5 border border-slate-300 rounded-xl">
              <h4 className="text-base font-black text-[#062b55] mb-3">MCQ Paper Preview ({paperTitle})</h4>
              {createdMcqs.map((m, idx) => (
                <div key={idx} className="mb-3 text-sm font-semibold text-slate-800">
                  <p className="mb-1"><b>Q{idx+1}:</b> {m.question_text}</p>
                  <p className="pl-4 text-xs text-slate-600">A) {m.option_a} &nbsp;&nbsp; B) {m.option_b} &nbsp;&nbsp; C) {m.option_c} &nbsp;&nbsp; D) {m.option_d}</p>
                </div>
              ))}
              <button onClick={() => window.print()} className="cursor-pointer bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm mt-3">Print MCQ Paper</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}