import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function ResultHub() {
  const [mainTab, setMainTab] = useState('menu'); // 'menu', 'set-result', 'view-result'
  const [subSetStep, setSubSetStep] = useState(1); // 1: Create Exam, 2: Add Subjects, 3: Enter Marks Grid
  
  // Exam Setup States
  const [category, setCategory] = useState('BS Computer Science');
  const [semester, setSemester] = useState('1st Semester');
  const [termType, setTermType] = useState('Mid Term');
  const [academicYear, setAcademicYear] = useState('2026');
  const [currentExamId, setCurrentExamId] = useState(null);

  // Subjects Creator States
  const [subjectsList, setSubjectsList] = useState([]); // [{subject_name, total_marks}]
  const [subName, setSubName] = useState('');
  const [subTotalMarks, setSubTotalMarks] = useState('');

  // Bulk Marks Entry States
  const [classStudents, setClassStudents] = useState([]);
  const [bulkMarks, setBulkMarks] = useState({}); // { roll_no: { subject_name: marks } }

  // Result Cards / View States
  const [allExamsList, setAllExamsList] = useState([]);
  const [selectedExamForView, setSelectedExamForView] = useState(null);
  const [viewStudentsResults, setViewStudentsResults] = useState([]);
  const [activePrintCard, setActivePrintCard] = useState(null); // Clickable student result card

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

  // Step 1: Create Exam & Proceed to Subjects
  const handleCreateExamHeader = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('result_exams').insert([{
        category, semester, term_type: termType, academic_year: academicYear
      }]).select().single();

      if (error) throw error;
      setCurrentExamId(data.id);
      setSubSetStep(2); // Go to add subjects
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Step 2: Add Subject to Exam
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
      alert('❌ Error: ' + err.message);
    }
  };

  // Move to Step 3: Fetch Students for Marks Entry Grid
  const proceedToMarksGrid = async () => {
    if (subjectsList.length === 0) {
      alert('Please add at least one subject!');
      return;
    }
    const { data } = await supabase.from('students').select('*').eq('category', category).eq('semester', semester);
    setClassStudents(data || []);
    setSubSetStep(3);
  };

  // Save Bulk Marks for All Students
  const handleSaveAllMarks = async () => {
    try {
      let recordsToInsert = classStudents.map(s => ({
        exam_id: currentExamId,
        roll_no: s.roll_no,
        student_name: s.full_name,
        marks_data: bulkMarks[s.roll_no] || {}
      }));

      for (let rec of recordsToInsert) {
        // Upsert or insert marks
        await supabase.from('student_marks').delete().eq('exam_id', currentExamId).eq('roll_no', rec.roll_no);
      }
      const { error } = await supabase.from('student_marks').insert(recordsToInsert);
      if (error) throw error;

      alert('✅ All student marks saved successfully!');
      setMainTab('menu');
      setSubSetStep(1);
      setCurrentExamId(null);
      setSubjectsList([]);
      setBulkMarks({});
    } catch (err) {
      alert('❌ Error saving marks: ' + err.message);
    }
  };

  // Fetch Past / Existing Exams for Viewing Results
  const fetchAllExams = async () => {
    const { data } = await supabase.from('result_exams').select('*').order('academic_year', { ascending: false });
    setAllExamsList(data || []);
  };

  const handleSelectExamToView = async (exam) => {
    setSelectedExamForView(exam);
    // Fetch subjects & marks
    const { data: subData } = await supabase.from('result_subjects').select('*').eq('exam_id', exam.id);
    const { data: markData } = await supabase.from('student_marks').select('*').eq('exam_id', exam.id);
    
    // Fetch student full details (like photo)
    const { data: stdData } = await supabase.from('students').select('*').eq('category', exam.category);

    // Merge marks with student profile
    const combined = (markData || []).map(m => {
      const studentProfile = (stdData || []).find(st => st.roll_no === m.roll_no) || {};
      return { ...m, ...studentProfile, subjects: subData || [] };
    });

    setViewStudentsResults(combined);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📊 Result & Examination Grading Hub</h2>

      {/* MAIN MENU */}
      {mainTab === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: '40px' }} className="no-print">
          <div onClick={() => { setMainTab('set-result'); setSubSetStep(1); }} style={{ background: '#0f766e', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 'bold' }}>
            ⚙️ Set Result & Enter Marks
          </div>
          <div onClick={() => { setMainTab('view-result'); fetchAllExams(); setSelectedExamForView(null); setActivePrintCard(null); }} style={{ background: '#2563eb', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.4rem', fontWeight: 'bold' }}>
            🗂️ View / Print Past Results & Cards
          </div>
        </div>
      )}

      {mainTab !== 'menu' && !activePrintCard && (
        <button onClick={() => { setMainTab('menu'); setSelectedExamForView(null); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }} className="no-print">
          ← Back to Result Menu
        </button>
      )}

      {/* ================= 1. SET RESULT & ENTER MARKS FLOW ================= */}
      {mainTab === 'set-result' && subSetStep === 1 && (
        <form onSubmit={handleCreateExamHeader} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>Step 1: Select Exam Category & Term</h3>
          <div>
            <label style={{ fontWeight: 'bold' }}>Program / Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Semester:</label>
            <select value={semester} onChange={(e) => setSemester(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Term Type:</label>
            <select value={termType} onChange={(e) => setTermType(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
              {terms.map((t, i) => <option key={i} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Academic Year:</label>
            <input type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Proceed to Add Subjects →</button>
        </form>
      )}

      {mainTab === 'set-result' && subSetStep === 2 && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>Step 2: Create Subjects & Assign Total Marks</h3>
          <p style={{ color: '#64748b' }}>Exam: <b>{category} ({semester}) - {termType} {academicYear}</b></p>
          
          <form onSubmit={handleAddSubjectToExam} style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input type="text" placeholder="Subject Name (e.g. Anatomy)" value={subName} onChange={(e) => setSubName(e.target.value)} required style={{ flex: 2, padding: '10px' }} />
            <input type="number" placeholder="Total Marks (e.g. 100)" value={subTotalMarks} onChange={(e) => setSubTotalMarks(e.target.value)} required style={{ flex: 1, padding: '10px' }} />
            <button type="submit" style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Add Subject</button>
          </form>

          <h4>Added Subjects List:</h4>
          <ul>
            {subjectsList.map((s, idx) => <li key={idx}><b>{s.subject_name}</b> (Total Marks: {s.total_marks})</li>)}
          </ul>

          <button onClick={proceedToMarksGrid} style={{ background: '#2563eb', color: 'white', padding: '12px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginTop: '20px' }}>Proceed to Enter Student Marks Grid →</button>
        </div>
      )}

      {mainTab === 'set-result' && subSetStep === 3 && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>Step 3: Enter Class Marks (Excel Style Grid)</h3>
          
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  {subjectsList.map((sub, i) => <th key={i}>{sub.subject_name} <br/><small>(Max: {sub.total_marks})</small></th>)}
                </tr>
              </thead>
              <tbody>
                {classStudents.map(st => (
                  <tr key={st.id}>
                    <td><b>{st.roll_no}</b></td>
                    <td>{st.full_name}</td>
                    {subjectsList.map((sub, i) => (
                      <td key={i}>
                        <input 
                          type="number" 
                          placeholder="Marks"
                          value={bulkMarks[st.roll_no]?.[sub.subject_name] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBulkMarks(prev => ({
                              ...prev,
                              [st.roll_no]: {
                                ...(prev[st.roll_no] || {}),
                                [sub.subject_name]: val
                              }
                            }));
                          }}
                          style={{ width: '70px', padding: '6px' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={handleSaveAllMarks} style={{ background: '#16a34a', color: 'white', padding: '12px 30px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginTop: '20px' }}>💾 Save All Class Marks & Finish</button>
        </div>
      )}

      {/* ================= 2. VIEW / PRINT RESULTS & CARDS ================= */}
      {mainTab === 'view-result' && !selectedExamForView && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🗂️ Past Results & Exam Archive</h3>
          <p style={{ color: '#64748b' }}>Select an exam session to view or print student result cards:</p>
          
          <div style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
            {allExamsList.length > 0 ? allExamsList.map(ex => (
              <div key={ex.id} onClick={() => handleSelectExamToView(ex)} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>{ex.category} - {ex.semester}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>Term: <b>{ex.term_type}</b> | Year: {ex.academic_year}</p>
                </div>
                <button style={{ background: '#0284c7', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>View Results</button>
              </div>
            )) : <p>No exam results found in archive.</p>}
          </div>
        </div>
      )}

      {mainTab === 'view-result' && selectedExamForView && !activePrintCard && (
        <div>
          <button onClick={() => setSelectedExamForView(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }} className="no-print">← Back to Exam Sessions</button>
          <h3>Results: {selectedExamForView.category} ({selectedExamForView.semester}) - {selectedExamForView.term_type}</h3>
          
          <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Student Name</th><th>Action</th></tr>
              </thead>
              <tbody>
                {viewStudentsResults.length > 0 ? viewStudentsResults.map(res => (
                  <tr key={res.id}>
                    <td><b>{res.roll_no}</b></td>
                    <td>{res.full_name}</td>
                    <td>
                      <button onClick={() => setActivePrintCard(res)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                        🖨️ Print Detailed Result Card
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="3" style={{ textAlign: 'center' }}>No student marks recorded for this exam.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDIVIDUAL PRINTABLE DETAILED RESULT CARD */}
      {activePrintCard && (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '4px solid #0f766e', margin: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f766e', paddingBottom: '15px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>PIASS COLLEGE OF NURSING & IT</h2>
              <h3 style={{ margin: 0, color: '#334155' }}>Official Statement of Marks ({selectedExamForView.term_type} - {selectedExamForView.academic_year})</h3>
            </div>
            <div>
              {activePrintCard.image_url ? (
                <img src={activePrintCard.image_url} alt="" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0f766e' }} />
              ) : (
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#ccc' }}></div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px' }}>
            <p style={{ margin: '3px 0' }}><b>Student Name:</b> {activePrintCard.full_name}</p>
            <p style={{ margin: '3px 0' }}><b>Roll Number:</b> {activePrintCard.roll_no}</p>
            <p style={{ margin: '3px 0' }}><b>Father Name:</b> {activePrintCard.father_name}</p>
            <p style={{ margin: '3px 0' }}><b>Program / Semester:</b> {selectedExamForView.category} ({selectedExamForView.semester})</p>
          </div>

          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Subject Name</th><th>Total Marks</th><th>Obtained Marks</th><th>Status</th></tr>
            </thead>
            <tbody>
              {activePrintCard.subjects.map((sub, i) => {
                const obtained = parseFloat(activePrintCard.marks_data?.[sub.subject_name]) || 0;
                const isPass = obtained >= (sub.total_marks * 0.4); // 40% passing criteria
                return (
                  <tr key={i}>
                    <td><b>{sub.subject_name}</b></td>
                    <td>{sub.total_marks}</td>
                    <td>{obtained}</td>
                    <td style={{ color: isPass ? 'green' : 'red', fontWeight: 'bold' }}>{isPass ? 'PASS' : 'FAIL'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '0 20px' }}>
            <p style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>Prepared By</p>
            <p style={{ borderTop: '1px solid #000', paddingTop: '5px' }}>Controller of Examinations</p>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }} className="no-print">
            <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>🖨️ Print Result Card</button>
            <button onClick={() => setActivePrintCard(null)} style={{ background: '#64748b', color: 'white', padding: '10px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Back to List</button>
          </div>
        </div>
      )}
    </div>
  );
}