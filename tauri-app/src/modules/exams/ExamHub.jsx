import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function ExamHub() {
  const [mainMenu, setMainMenu] = useState('menu'); // 'menu', 'datesheet-menu', 'paper-menu'
  const [datesheetSub, setDatesheetSub] = useState(null); // 'set', 'download'
  const [paperSub, setPaperSub] = useState(null); // 'subjective', 'objective'

  // Datesheet Set States
  const [category, setCategory] = useState('BS Computer Science');
  const [semester, setSemester] = useState('1st Semester');
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [savedDatesheets, setSavedDatesheets] = useState([]);

  // Download Datesheet Flow States
  const [dlProgram, setDlProgram] = useState(null);
  const [dlSemester, setDlSemester] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [activeStudentCard, setActiveStudentCard] = useState(null); // For individual printable datesheet

  // Paper Sheet States
  const [paperCategory, setPaperCategory] = useState('BS Computer Science');
  const [paperSemester, setPaperSemester] = useState('1st Semester');
  const [paperTitle, setPaperTitle] = useState('');
  
  // Subjective Question Form
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState('Short'); // 'Short' or 'Long'
  const [createdQuestions, setCreatedQuestions] = useState([]);

  // Objective MCQ Form
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

  // Fetch Datesheets when downloading
  const fetchDatesheetsForClass = async (prog, sem) => {
    const { data } = await supabase.from('exam_datesheets').select('*').eq('category', prog).eq('semester', sem);
    setSavedDatesheets(data || []);
    const { data: stdData } = await supabase.from('students').select('*').eq('category', prog).eq('semester', sem);
    setClassStudents(stdData || []);
  };

  // Add Datesheet Row
  const handleAddDatesheetEntry = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('exam_datesheets').insert([{
        category, semester, subject_name: subjectName, subject_code: subjectCode, exam_date: examDate, exam_time: examTime
      }]);
      if (error) throw error;
      alert('✅ Exam entry added to Datesheet!');
      setSubjectName(''); setSubjectCode(''); setExamDate(''); setExamTime('');
      const { data } = await supabase.from('exam_datesheets').select('*').eq('category', category).eq('semester', semester);
      setSavedDatesheets(data || []);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Add Subjective Question
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
      alert('✅ Question added to paper!');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Add MCQ Question
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
      alert('✅ MCQ added to paper!');
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📝 Exams & Assessment Hub</h2>

      {/* MAIN EXAM MENU */}
      {mainMenu === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '40px' }} className="no-print">
          <div onClick={() => setMainMenu('datesheet-menu')} style={{ background: '#0f766e', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            📅 Datesheet Management
          </div>
          <div onClick={() => setMainMenu('paper-menu')} style={{ background: '#2563eb', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            📄 Question Paper Sheet Creator
          </div>
        </div>
      )}

      {/* BACK BUTTON */}
      {mainMenu !== 'menu' && !activeStudentCard && (
        <button onClick={() => { setMainMenu('menu'); setDatesheetSub(null); setPaperSub(null); setDlProgram(null); setDlSemester(null); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }} className="no-print">
          ← Back to Exams Menu
        </button>
      )}

      {/* ================= DATESHEET SUB-MENU ================= */}
      {mainMenu === 'datesheet-menu' && !datesheetSub && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div onClick={() => setDatesheetSub('set')} style={{ background: '#f0fdf4', border: '2px solid #16a34a', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#166534' }}>
            ⚙️ Set & Create Datesheet
          </div>
          <div onClick={() => setDatesheetSub('download')} style={{ background: '#e0f2fe', border: '2px solid #0284c7', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#0369a1' }}>
            🖨️ Download / Print Student Datesheets
          </div>
        </div>
      )}

      {/* SET DATESHEET FORM */}
      {datesheetSub === 'set' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>⚙️ Create & Assign Datesheet Entries</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Program:</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 'bold' }}>Semester:</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <form onSubmit={handleAddDatesheetEntry} style={{ display: 'grid', gap: '12px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <h4>Add Subject Exam Slot</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Subject Name (e.g. Data Structures)" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Subject Code (e.g. CS-301)" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} required style={{ padding: '8px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Timing (e.g. 10:00 AM - 01:00 PM)" value={examTime} onChange={(e) => setExamTime(e.target.value)} required style={{ padding: '8px' }} />
            </div>
            <button type="submit" style={{ background: '#0f766e', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Add Exam Slot</button>
          </form>
        </div>
      )}

      {/* DOWNLOAD / PRINT DATESHEET FLOW */}
      {datesheetSub === 'download' && !dlProgram && (
        <div>
          <h3>Select Program to Print Student Datesheets:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
            {categories.map((p, i) => (
              <div key={i} onClick={() => setDlProgram(p)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', cursor: 'pointer' }}>
                <h4 style={{ margin: 0, color: '#0f766e' }}>{p}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {datesheetSub === 'download' && dlProgram && !dlSemester && (
        <div>
          <button onClick={() => setDlProgram(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Change Program</button>
          <h3>Select Semester for {dlProgram}:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
            {semesters.map((sem, i) => (
              <div key={i} onClick={() => { setDlSemester(sem); fetchDatesheetsForClass(dlProgram, sem); }} style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: '#166534' }}>{sem}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {datesheetSub === 'download' && dlProgram && dlSemester && !activeStudentCard && (
        <div>
          <button onClick={() => setDlSemester(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Change Semester</button>
          <h3>Class Students List ({dlProgram} - {dlSemester}): Click any student to print customized datesheet</h3>
          
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Student Name</th><th>Father Name</th><th>Action</th></tr>
              </thead>
              <tbody>
                {classStudents.length > 0 ? classStudents.map(s => (
                  <tr key={s.id}>
                    <td><b>{s.roll_no}</b></td>
                    <td>{s.full_name}</td>
                    <td>{s.father_name}</td>
                    <td>
                      <button onClick={() => setActiveStudentCard(s)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                        🖨️ Print Datesheet
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No students found in this class.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDIVIDUAL PRINTABLE STUDENT DATESHEET CARD */}
      {activeStudentCard && (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '4px solid #0f766e', margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>PIASS COLLEGE OF NURSING & IT</h2>
              <h3 style={{ margin: 0, color: '#334155' }}>Official Examination Datesheet</h3>
            </div>
            <div>
              {activeStudentCard.image_url ? (
                <img src={activeStudentCard.image_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f766e' }} />
              ) : (
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ccc' }}></div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '3px 0' }}><b>Student Name:</b> {activeStudentCard.full_name}</p>
            <p style={{ margin: '3px 0' }}><b>Roll Number:</b> {activeStudentCard.roll_no}</p>
            <p style={{ margin: '3px 0' }}><b>Father Name:</b> {activeStudentCard.father_name}</p>
            <p style={{ margin: '3px 0' }}><b>Program / Semester:</b> {activeStudentCard.category} ({activeStudentCard.semester})</p>
          </div>

          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Subject Code</th><th>Subject Name</th><th>Exam Date</th><th>Timing</th></tr>
            </thead>
            <tbody>
              {savedDatesheets.length > 0 ? savedDatesheets.map(ds => (
                <tr key={ds.id}>
                  <td><b>{ds.subject_code}</b></td>
                  <td>{ds.subject_name}</td>
                  <td>{ds.exam_date}</td>
                  <td>{ds.exam_time}</td>
                </tr>
              )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No datesheet slots defined for this class yet.</td></tr>}
            </tbody>
          </table>

          <div style={{ background: '#fffbeb', border: '1px solid #fde047', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#854d0e' }}>Exam Rules & Instructions:</h4>
            <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#713f12' }}>
              <li>Students must bring their Student ID card and this Datesheet slip to the examination hall.</li>
              <li>Entry into the examination hall will be closed 15 minutes after the exam starts.</li>
              <li>Mobile phones, smartwatches, and programmable calculators are strictly prohibited.</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }} className="no-print">
            <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>🖨️ Print Datesheet</button>
            <button onClick={() => setActiveStudentCard(null)} style={{ background: '#64748b', color: 'white', padding: '10px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Back to List</button>
          </div>
        </div>
      )}

      {/* ================= QUESTION PAPER SHEET CREATOR ================= */}
      {mainMenu === 'paper-menu' && !paperSub && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div onClick={() => setPaperSub('subjective')} style={{ background: '#fdf2f8', border: '2px solid #db2777', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#be185d' }}>
            📝 Subjective Paper Creator (Short/Long)
          </div>
          <div onClick={() => setPaperSub('objective')} style={{ background: '#faf5ff', border: '2px solid #9333ea', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', color: '#7e22ce' }}>
            ☑️ Objective Paper Creator (MCQs)
          </div>
        </div>
      )}

      {/* SUBJECTIVE PAPER CREATOR */}
      {paperSub === 'subjective' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>📝 Subjective Question Paper Creator</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <select value={paperCategory} onChange={(e) => setPaperCategory(e.target.value)} style={{ padding: '8px' }}>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <select value={paperSemester} onChange={(e) => setPaperSemester(e.target.value)} style={{ padding: '8px' }}>
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Subject Title (e.g. Pathology)" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <form onSubmit={handleAddQuestion} style={{ display: 'grid', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={qType} onChange={(e) => setQType(e.target.value)} style={{ padding: '8px' }}>
                <option value="Short">Short Question</option>
                <option value="Long">Long Question</option>
              </select>
            </div>
            <textarea placeholder="Write question here..." value={qText} onChange={(e) => setQText(e.target.value)} rows="2" required style={{ width: '100%', padding: '8px' }}></textarea>
            <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Add Question to Paper</button>
          </form>

          {createdQuestions.length > 0 && (
            <div style={{ marginTop: '20px', background: '#fff', padding: '15px', border: '1px solid #ccc' }}>
              <h4>Paper Preview ({paperTitle})</h4>
              {createdQuestions.map((q, idx) => (
                <p key={idx}><b>Q{idx+1} [{q.question_type}]:</b> {q.question_text}</p>
              ))}
              <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>🖨️ Print Paper</button>
            </div>
          )}
        </div>
      )}

      {/* OBJECTIVE MCQ PAPER CREATOR */}
      {paperSub === 'objective' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>☑️ Objective MCQ Question Paper Creator</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <select value={paperCategory} onChange={(e) => setPaperCategory(e.target.value)} style={{ padding: '8px' }}>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <select value={paperSemester} onChange={(e) => setPaperSemester(e.target.value)} style={{ padding: '8px' }}>
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <input type="text" placeholder="Subject Title (e.g. Pharmacology)" value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} required style={{ padding: '8px' }} />
          </div>

          <form onSubmit={handleAddMcq} style={{ display: 'grid', gap: '10px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <textarea placeholder="Write MCQ Question..." value={mcqText} onChange={(e) => setMcqText(e.target.value)} rows="2" required style={{ width: '100%', padding: '8px' }}></textarea>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input type="text" placeholder="Option A" value={optA} onChange={(e) => setOptA(e.target.value)} required style={{ padding: '6px' }} />
              <input type="text" placeholder="Option B" value={optB} onChange={(e) => setOptB(e.target.value)} required style={{ padding: '6px' }} />
              <input type="text" placeholder="Option C" value={optC} onChange={(e) => setOptC(e.target.value)} required style={{ padding: '6px' }} />
              <input type="text" placeholder="Option D" value={optD} onChange={(e) => setOptD(e.target.value)} required style={{ padding: '6px' }} />
            </div>
            <button type="submit" style={{ background: '#9333ea', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Add MCQ to Paper</button>
          </form>

          {createdMcqs.length > 0 && (
            <div style={{ marginTop: '20px', background: '#fff', padding: '15px', border: '1px solid #ccc' }}>
              <h4>MCQ Paper Preview ({paperTitle})</h4>
              {createdMcqs.map((m, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <p style={{ margin: '0 0 5px 0' }}><b>Q{idx+1}:</b> {m.question_text}</p>
                  <p style={{ margin: '2px 0', paddingLeft: '15px' }}>A) {m.option_a} &nbsp;&nbsp; B) {m.option_b}</p>
                  <p style={{ margin: '2px 0', paddingLeft: '15px' }}>C) {m.option_c} &nbsp;&nbsp; D) {m.option_d}</p>
                </div>
              ))}
              <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>🖨️ Print MCQ Paper</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}