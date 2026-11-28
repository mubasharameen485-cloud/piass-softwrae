import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';
import Print from '../reports/Print';

export default function ArchiveHub() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [targetType, setTargetType] = useState(null); // 'students' or 'teachers'
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [printItem, setPrintItem] = useState(null);

  const years = ['2026', '2025', '2024', '2023'];
  const months = [
    { label: 'All Months', value: 'All' },
    { label: 'January', value: '01' }, { label: 'February', value: '02' },
    { label: 'March', value: '03' }, { label: 'April', value: '04' },
    { label: 'May', value: '05' }, { label: 'June', value: '06' },
    { label: 'July', value: '07' }, { label: 'August', value: '08' },
    { label: 'September', value: '09' }, { label: 'October', value: '10' },
    { label: 'November', value: '11' }, { label: 'December', value: '12' }
  ];

  const programs = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const fetchArchiveData = async (type, prog = null) => {
    try {
      setLoading(true);
      let tableName = type === 'students' ? 'students' : 'teachers';
      let dateField = type === 'students' ? 'admission_date' : 'joining_date';

      let query = supabase.from(tableName).select('*');
      if (prog && type === 'students') {
        query = query.eq('category', prog);
      }

      const { data, error } = await query;
      if (error) throw error;

      const filtered = (data || []).filter(item => {
        const itemDateStr = item[dateField] || item.created_at || '2026-01-01';
        const itemDate = new Date(itemDateStr);
        const itemYear = itemDate.getFullYear().toString();
        const itemMonth = String(itemDate.getMonth() + 1).padStart(2, '0');

        const matchesYear = itemYear === selectedYear;
        const matchesMonth = selectedMonth === 'All' || itemMonth === selectedMonth;

        return matchesYear && matchesMonth;
      });

      setRecords(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelect = (type) => {
    setTargetType(type);
    setSelectedProgram(null);
    fetchArchiveData(type);
  };

  const handleProgramSelect = (prog) => {
    setSelectedProgram(prog);
    fetchArchiveData('students', prog);
  };

  const archivePrintContent = printItem ? (
    <div className="text-slate-900 font-medium p-4">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Archive Record</p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">PIASS College of Nursing & IT</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleString('en-PK')}</p>
      </header>

      <div className="mb-8 rounded-xl border border-slate-300 bg-slate-50 p-6 grid grid-cols-2 gap-4 text-sm font-semibold text-slate-800">
        <p><b>ID / Roll Number:</b> {printItem.roll_no || printItem.teacher_id}</p>
        <p><b>Full Name:</b> {printItem.full_name}</p>
        <p><b>Details / Program:</b> {printItem.category || printItem.subject}</p>
        <p><b>Semester / Degree:</b> {printItem.semester || printItem.degree}</p>
        <p><b>Record Date:</b> {printItem.admission_date || printItem.joining_date || 'N/A'}</p>
        <p><b>Status:</b> <span className={printItem.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>{printItem.status || 'Active'}</span></p>
      </div>

      <div className="flex justify-between mt-32 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Verified By</p>
        <p>Authorized Principal / Registrar Stamp</p>
      </div>
    </div>
  ) : null;

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Past & Archive Records Hub</h1>
      </header>

      {/* Year & Month Filter Bar */}
      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs flex flex-wrap gap-4 items-center mb-6 no-print">
        <div>
          <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Select Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold">
            {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Select Month:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold">
            {months.map((m, i) => <option key={i} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category Selection */}
      {!targetType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          <div onClick={() => handleTypeSelect('students')} className="cursor-pointer rounded-2xl border border-sky-300 bg-sky-50/50 p-8 text-center shadow-sm transition hover:bg-sky-100">
            <h3 className="text-xl font-black text-sky-900">Students Archive</h3>
            <p className="text-xs text-sky-700 mt-2">View historical student admissions for year {selectedYear}.</p>
          </div>
          <div onClick={() => handleTypeSelect('teachers')} className="cursor-pointer rounded-2xl border border-amber-300 bg-amber-50/50 p-8 text-center shadow-sm transition hover:bg-amber-100">
            <h3 className="text-xl font-black text-amber-900">Teachers Archive</h3>
            <p className="text-xs text-amber-700 mt-2">View historical teacher joinings for year {selectedYear}.</p>
          </div>
        </div>
      )}

      {/* Programs List for Students */}
      {targetType === 'students' && !selectedProgram && (
        <div>
          <button onClick={() => setTargetType(null)} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
            ← Back to Categories
          </button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Program for Year {selectedYear}:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {programs.map((prog, i) => (
              <div key={i} onClick={() => handleProgramSelect(prog)} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-5 shadow-xs transition hover:border-[#078343]">
                <h4 className="text-base font-black text-[#062b55]">{prog}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Table */}
      {(targetType === 'teachers' || selectedProgram) && (
        <div>
          <button onClick={() => { targetType === 'teachers' ? setTargetType(null) : setSelectedProgram(null); }} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
            ← Back
          </button>
          
          <h3 className="text-base font-black text-[#062b55] mb-4">Archive Records: {targetType === 'teachers' ? 'All Teachers' : selectedProgram} ({selectedYear} - {selectedMonth === 'All' ? 'All Months' : `Month ${selectedMonth}`})</h3>
          
          {loading ? <p className="font-bold">Loading archive data...</p> : (
            <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">ID / Roll No</th>
                    <th className="px-4 py-3 font-bold">Full Name</th>
                    <th className="px-4 py-3 font-bold">{targetType === 'teachers' ? 'Subject' : 'Semester'}</th>
                    <th className="px-4 py-3 font-bold">Date</th>
                    <th className="px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {records.length > 0 ? records.map(r => (
                    <tr key={r.id} className="font-semibold">
                      <td className="px-4 py-3 text-slate-900">{r.roll_no || r.teacher_id}</td>
                      <td className="px-4 py-3 text-slate-900">{r.full_name}</td>
                      <td className="px-4 py-3 text-slate-800">{r.subject || r.semester}</td>
                      <td className="px-4 py-3 text-slate-800">{r.admission_date || r.joining_date || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setPrintItem(r); setTimeout(() => window.print(), 100); }} className="cursor-pointer bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700">
                          Print Record
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" className="p-8 text-center font-bold text-slate-400">No records found for {selectedYear} (Month: {selectedMonth}).</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>{hubContent}</Background>
      </div>
      <Print title="PIASS Archive Record">{archivePrintContent}</Print>
    </>
  );
}