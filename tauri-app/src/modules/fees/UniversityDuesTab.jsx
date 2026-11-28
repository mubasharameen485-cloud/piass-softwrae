import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function UniversityDuesTab() {
  const [subMode, setSubMode] = useState('collect'); // 'collect', 'set-due', 'defaulters'

  // Collect Due States
  const [rollNo, setRollNo] = useState('');
  const [dueTitle, setDueTitle] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [staffName, setStaffName] = useState('');

  // Set Due Template States
  const [uCategory, setUCategory] = useState('BS Computer Science');
  const [uSemester, setUSemester] = useState('1st Semester');
  const [uDueTitle, setUDueTitle] = useState('');
  const [uAmount, setUAmount] = useState('');

  // Defaulters Check States
  const [defProgram, setDefProgram] = useState(null);
  const [defSemester, setDefSemester] = useState(null);
  const [unpaidList, setUnpaidList] = useState([]);

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

  const handleCollectDue = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('student_university_dues_paid').insert([{
        roll_no: rollNo.trim(),
        due_title: dueTitle,
        amount_paid: parseFloat(amountPaid) || 0,
        collected_by: staffName || 'Admin'
      }]);
      if (error) throw error;
      alert('✅ University due collected successfully!');
      setRollNo(''); setDueTitle(''); setAmountPaid(''); setStaffName('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleSetDueTemplate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('university_due_templates').upsert([{
        category: uCategory, semester: uSemester, due_title: uDueTitle, amount: parseFloat(uAmount) || 0
      }], { onConflict: 'category,semester,due_title' });

      if (error) throw error;
      alert('✅ University due template saved successfully!');
      setUDueTitle(''); setUAmount('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const fetchUnpaidDues = async (prog, sem) => {
    try {
      const { data: students } = await supabase.from('students').select('*').eq('category', prog).eq('semester', sem).eq('status', 'Active');
      const { data: paidDues } = await supabase.from('student_university_dues_paid').select('roll_no');
      const paidRolls = new Set((paidDues || []).map(p => p.roll_no));

      const unpaid = (students || []).filter(s => !paidRolls.has(s.roll_no));
      setUnpaidList(unpaid);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6 no-print">
        <button onClick={() => setSubMode('collect')} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subMode === 'collect' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Collect University Due</button>
        <button onClick={() => setSubMode('set-due')} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subMode === 'set-due' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Set University Due</button>
        <button onClick={() => { setSubMode('defaulters'); setDefProgram(null); setDefSemester(null); }} className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold shadow-xs ${subMode === 'defaulters' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Check Unpaid Dues List & Print</button>
      </div>

      {subMode === 'collect' && (
        <form onSubmit={handleCollectDue} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Collect University Fee / Due</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Roll Number:</label>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Due Title (e.g. Exam Fee / Library Fine):</label>
            <input type="text" value={dueTitle} onChange={(e) => setDueTitle(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Amount Paid (Rs):</label>
            <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Collector Staff Name:</label>
            <input type="text" value={staffName} onChange={(e) => setStaffName(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm">Save University Due Payment</button>
        </form>
      )}

      {subMode === 'set-due' && (
        <form onSubmit={handleSetDueTemplate} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Set University Due Template for Class</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program:</label>
            <select value={uCategory} onChange={(e) => setUCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Semester:</label>
            <select value={uSemester} onChange={(e) => setUSemester(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Due Title:</label>
            <input type="text" value={uDueTitle} onChange={(e) => setUDueTitle(e.target.value)} placeholder="e.g. Annual Sports Fund" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Amount (Rs):</label>
            <input type="number" value={uAmount} onChange={(e) => setUAmount(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm">Save University Due Template</button>
        </form>
      )}

      {subMode === 'defaulters' && !defProgram && (
        <div>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Program for Unpaid University Dues:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((p, i) => (
              <div key={i} onClick={() => setDefProgram(p)} className="cursor-pointer rounded-xl border border-slate-300 bg-white p-4 font-bold text-slate-800 shadow-xs hover:border-[#078343]">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {subMode === 'defaulters' && defProgram && !defSemester && (
        <div>
          <button onClick={() => setDefProgram(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Program</button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Semester for {defProgram}:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {semesters.map((sem, i) => (
              <div key={i} onClick={() => { setDefSemester(sem); fetchUnpaidDues(defProgram, sem); }} className="cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 text-center font-bold text-emerald-900 shadow-xs hover:bg-emerald-100">
                {sem}
              </div>
            ))}
          </div>
        </div>
      )}

      {subMode === 'defaulters' && defProgram && defSemester && (
        <div>
          <button onClick={() => setDefSemester(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Semester</button>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-[#062b55]">Unpaid University Dues: {defProgram} ({defSemester})</h3>
            <button onClick={() => window.print()} className="cursor-pointer rounded-xl bg-[#062b55] px-4 py-2 text-sm font-bold text-white shadow-sm no-print">Print Unpaid Dues Report</button>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">Roll No</th>
                  <th className="px-4 py-3 font-bold">Student Name</th>
                  <th className="px-4 py-3 font-bold">Father Name</th>
                  <th className="px-4 py-3 font-bold">Phone</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {unpaidList.length > 0 ? unpaidList.map(u => (
                  <tr key={u.id} className="font-semibold">
                    <td className="px-4 py-3">{u.roll_no}</td>
                    <td className="px-4 py-3">{u.full_name}</td>
                    <td className="px-4 py-3">{u.father_name}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">Unpaid University Dues</td>
                  </tr>
                )) : <tr><td colSpan="5" className="p-6 text-center font-bold text-slate-400">All students have cleared university dues.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}