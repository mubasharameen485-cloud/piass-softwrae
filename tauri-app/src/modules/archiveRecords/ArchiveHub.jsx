import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

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

      // Filter precisely by Year and Month in JavaScript based on admission/joining date
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

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>🗂️ Past / Archive Records Hub</h2>

      {/* Year & Month Filter Bar */}
      <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Select Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ padding: '8px' }}>
            {years.map((y, i) => <option key={i} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 'bold', marginRight: '5px' }}>Select Month:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '8px' }}>
            {months.map((m, i) => <option key={i} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Category Selection */}
      {!targetType && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          <div onClick={() => handleTypeSelect('students')} style={{ background: '#e0f2fe', border: '2px solid #0284c7', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#0369a1' }}>
            🎓 View Students Archive ({selectedYear})
          </div>
          <div onClick={() => handleTypeSelect('teachers')} style={{ background: '#fef3c7', border: '2px solid #d97706', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#b45309' }}>
            👨‍🏫 View Teachers Archive ({selectedYear})
          </div>
        </div>
      )}

      {/* Programs List for Students */}
      {targetType === 'students' && !selectedProgram && (
        <div>
          <button onClick={() => setTargetType(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
            ← Back
          </button>
          <h3>Select Program for Year {selectedYear}:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
            {programs.map((prog, i) => (
              <div key={i} onClick={() => handleProgramSelect(prog)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0', color: '#0f766e' }}>{prog}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Records Table */}
      {(targetType === 'teachers' || selectedProgram) && (
        <div>
          <button onClick={() => { targetType === 'teachers' ? setTargetType(null) : setSelectedProgram(null); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>
            ← Back
          </button>
          
          <h3>Archive Records: {targetType === 'teachers' ? 'All Teachers' : selectedProgram} ({selectedYear} - {selectedMonth === 'All' ? 'All Months' : `Month ${selectedMonth}`})</h3>
          
          {loading ? <p>Loading archive data...</p> : (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>ID / Roll No</th>
                    <th>Full Name</th>
                    <th>{targetType === 'teachers' ? 'Subject' : 'Semester'}</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length > 0 ? records.map(r => (
                    <tr key={r.id}>
                      <td><b>{r.roll_no || r.teacher_id}</b></td>
                      <td>{r.full_name}</td>
                      <td>{r.subject || r.semester}</td>
                      <td>{r.admission_date || r.joining_date || 'N/A'}</td>
                      <td>
                        <button onClick={() => setPrintItem(r)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>
                          🖨️ Print Record
                        </button>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No records found for {selectedYear} (Month: {selectedMonth}).</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Print Preview Modal */}
      {printItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px' }}>
            <h2>PIASS ARCHIVE RECORD PRINT</h2>
            <hr />
            <p><b>ID / Roll No:</b> {printItem.roll_no || printItem.teacher_id}</p>
            <p><b>Name:</b> {printItem.full_name}</p>
            <p><b>Details:</b> {printItem.category || printItem.subject} ({printItem.semester || printItem.degree})</p>
            <p><b>Date:</b> {printItem.admission_date || printItem.joining_date}</p>
            <hr />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Print Now</button>
              <button onClick={() => setPrintItem(null)} style={{ background: '#64748b', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}