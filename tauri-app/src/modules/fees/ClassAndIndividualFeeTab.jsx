import React, { useState } from 'react';
import { setProgramSemesterFeeTemplate } from './advancedFeeService';
import { supabase } from '../../services/supabaseClient';

export default function ClassAndIndividualFeeTab() {
  const [subMode, setSubMode] = useState('class'); // 'class' or 'individual'

  // Class Template
  const [tCategory, setTCategory] = useState('BS Computer Science');
  const [tSemester, setTSemester] = useState('1st Semester');
  const [tStandardFee, setTStandardFee] = useState('');

  // Individual Student Fee
  const [indRollNo, setIndRollNo] = useState('');
  const [indCustomFee, setIndCustomFee] = useState('');

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

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      await setProgramSemesterFeeTemplate({
        category: tCategory, semester: tSemester, standard_fee: parseFloat(tStandardFee) || 0
      });
      alert(`✅ Standard Fee for ${tCategory} (${tSemester}) updated successfully!`);
      setTStandardFee('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleSaveIndividualFee = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('individual_student_fees')
        .upsert([{ roll_no: indRollNo.trim(), custom_fee: parseFloat(indCustomFee) || 0 }], { onConflict: 'roll_no' });

      if (error) throw error;
      alert(`✅ Custom fee for student (${indRollNo}) saved successfully!`);
      setIndRollNo(''); setIndCustomFee('');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setSubMode('class')} className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold shadow-xs ${subMode === 'class' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Set Class / Program Fee</button>
        <button onClick={() => setSubMode('individual')} className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-bold shadow-xs ${subMode === 'individual' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>Set Individual Student Fee</button>
      </div>

      {subMode === 'class' ? (
        <form onSubmit={handleSaveTemplate} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Bulk Program & Semester Standard Fee Setup</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program / Category:</label>
            <select value={tCategory} onChange={(e) => setTCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Semester:</label>
            <select value={tSemester} onChange={(e) => setTSemester(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Standard Fee Amount (Rs):</label>
            <input type="number" value={tStandardFee} onChange={(e) => setTStandardFee(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm">Save Standard Fee Template</button>
        </form>
      ) : (
        <form onSubmit={handleSaveIndividualFee} className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs grid gap-4">
          <h3 className="text-base font-black text-[#062b55]">Set Individual Student Custom Fee (Override)</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Roll Number:</label>
            <input type="text" value={indRollNo} onChange={(e) => setIndRollNo(e.target.value)} placeholder="e.g. st1" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Custom Total Fee (Rs):</label>
            <input type="number" value={indCustomFee} onChange={(e) => setIndCustomFee(e.target.value)} placeholder="e.g. 25000" required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm">Save Individual Student Fee</button>
        </form>
      )}
    </div>
  );
}