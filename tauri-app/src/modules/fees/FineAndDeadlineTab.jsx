import React, { useState } from 'react';
import { applyStudentFine } from './advancedFeeService';
import { supabase } from '../../services/supabaseClient';

export default function FineAndDeadlineTab() {
  const [subMode, setSubMode] = useState('fine'); // 'fine' or 'deadline'
  
  // Fine States
  const [fineRollNo, setFineRollNo] = useState('');
  const [fineAmount, setFineAmount] = useState('');
  const [fineReason, setFineReason] = useState('');

  // Deadline States
  const [dCategory, setDCategory] = useState('BS Computer Science');
  const [dSemester, setDSemester] = useState('1st Semester');
  const [lastDateDay, setLastDateDay] = useState(10);
  const [ruleFineAmount, setRuleFineAmount] = useState(500);

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

  const handleFineSubmit = async (e) => {
    e.preventDefault();
    try {
      await applyStudentFine({ roll_no: fineRollNo, fine_amount: parseFloat(fineAmount) || 0, reason: fineReason });
      alert('✅ Fine applied successfully to student!');
      setFineRollNo(''); setFineAmount(''); setFineReason('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleSaveDeadlineRule = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('fee_deadline_rules')
        .upsert([{ category: dCategory, semester: dSemester, last_date_day: parseInt(lastDateDay) || 10, fine_amount_per_month: parseFloat(ruleFineAmount) || 0 }], { onConflict: 'category,semester' });

      if (error) throw error;
      alert('✅ Fee deadline and late fine rule saved successfully!');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setSubMode('fine')} className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold shadow-xs ${subMode === 'fine' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Apply Student Fine</button>
        <button onClick={() => setSubMode('deadline')} className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold shadow-xs ${subMode === 'deadline' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Set Deadline & Late Fine</button>
      </div>

      {subMode === 'fine' ? (
        <form onSubmit={handleFineSubmit} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Apply Manual Fine to Student</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Roll Number:</label>
            <input type="text" value={fineRollNo} onChange={(e) => setFineRollNo(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Fine Amount (Rs):</label>
            <input type="number" value={fineAmount} onChange={(e) => setFineAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Reason for Fine:</label>
            <input type="text" value={fineReason} onChange={(e) => setFineReason(e.target.value)} placeholder="e.g. Discipline issue" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-red-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-red-700">Apply Fine</button>
        </form>
      ) : (
        <form onSubmit={handleSaveDeadlineRule} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Set Monthly Fee Deadline & Automatic Late Fine</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program / Category:</label>
            <select value={dCategory} onChange={(e) => setDCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Semester:</label>
            <select value={dSemester} onChange={(e) => setDSemester(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Last Date Day (e.g. 10):</label>
              <input type="number" min="1" max="31" value={lastDateDay} onChange={(e) => setLastDateDay(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Late Fine Amount (Rs):</label>
              <input type="number" value={ruleFineAmount} onChange={(e) => setRuleFineAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
            </div>
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm">Save Deadline Rule</button>
        </form>
      )}
    </div>
  );
}