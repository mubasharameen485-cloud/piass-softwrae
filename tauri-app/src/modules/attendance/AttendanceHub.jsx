import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function AttendanceHub() {
  const [mainTab, setMainTab] = useState('menu'); // 'menu', 'mark-student', 'mark-teacher', 'view-absent', 'past'
  const [subTarget, setSubTarget] = useState(null); // 'student' or 'teacher' for absent view
  
  // Marking States
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { person_id: 'Present' / 'Absent' }
  const [loading, setLoading] = useState(false);

  // View Absent States
  const [absentList, setAbsentList] = useState([]);
  const [absentProgram, setAbsentProgram] = useState(null);

  // Past Records States
  const [pastDate, setPastDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastRecords, setPastRecords] = useState([]);

  // Holiday / Weekend Check
  const todayObj = new Date();
  const dayOfWeek = todayObj.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const currentDateStr = todayObj.toISOString().split('T')[0];

  const programs = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  // Fetch students for marking
  const fetchStudentsForAttendance = async (prog, sem) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('category', prog)
        .eq('semester', sem);
      if (error) throw error;
      setStudentsList(data || []);
      
      // Default all to Present
      let initial = {};
      (data || []).forEach(s => { initial[s.roll_no] = 'Present'; });
      setAttendanceState(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers for marking
  const fetchTeachersForAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('teachers').select('*');
      if (error) throw error;
      setTeachersList(data || []);
      
      let initial = {};
      (data || []).forEach(t => { initial[t.teacher_id] = 'Present'; });
      setAttendanceState(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Save Attendance
  const handleSaveAttendance = async (type) => {
    try {
      setLoading(true);
      const recordsToSave = [];

      if (type === 'student') {
        studentsList.forEach(s => {
          recordsToSave.push({
            person_id: s.roll_no,
            name: s.full_name,
            category: `${selectedProgram} - ${selectedSemester}`,
            attendance_date: currentDateStr,
            status: attendanceState[s.roll_no] || 'Present'
          });
        });
      } else {
        teachersList.forEach(t => {
          recordsToSave.push({
            person_id: t.teacher_id,
            name: t.full_name,
            category: 'Staff / Teacher',
            attendance_date: currentDateStr,
            status: attendanceState[t.teacher_id] || 'Present'
          });
        });
      }

      // First delete if already marked today to prevent duplicates, then insert
      for (let rec of recordsToSave) {
        await supabase.from('attendance_records').delete().eq('person_id', rec.person_id).eq('attendance_date', currentDateStr);
      }

      const { error } = await supabase.from('attendance_records').insert(recordsToSave);
      if (error) throw error;

      alert('✅ Attendance successfully saved for today!');
    } catch (err) {
      alert('❌ Error saving attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Today's Absentees
  const fetchTodayAbsents = async (type, prog = null) => {
    try {
      setLoading(true);
      let query = supabase.from('attendance_records').select('*').eq('attendance_date', currentDateStr).eq('status', 'Absent');
      if (type === 'student' && prog) {
        query = query.ilike('category', `%${prog}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      
      // If teacher view, filter records where category is 'Staff / Teacher'
      if (type === 'teacher') {
        setAbsentList((data || []).filter(r => r.category === 'Staff / Teacher'));
      } else {
        setAbsentList(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Past Attendance by Date
  const fetchPastRecords = async (dateVal) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('attendance_records').select('*').eq('attendance_date', dateVal);
      if (error) throw error;
      setPastRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📌 Campus Attendance Management System</h2>
      <p style={{ color: '#64748b' }}>Date: <b>{currentDateStr}</b> {isWeekend && <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ (Weekend / Holiday Notice)</span>}</p>

      {/* MAIN MENU BUTTONS */}
      {mainTab === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
          <div onClick={() => setMainTab('mark-student')} style={{ background: '#0f766e', color: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
            🎓 Mark Student Attendance
          </div>
          <div onClick={() => { setMainTab('mark-teacher'); fetchTeachersForAttendance(); }} style={{ background: '#2563eb', color: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
            👨‍🏫 Mark Teacher Attendance
          </div>
          <div onClick={() => setMainTab('view-absent')} style={{ background: '#ca8a04', color: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
            📊 View Today's Absents & Print
          </div>
          <div onClick={() => { setMainTab('past'); fetchPastRecords(pastDate); }} style={{ background: '#475569', color: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
            🗂️ Past Attendance History
          </div>
        </div>
      )}

      {mainTab !== 'menu' && (
        <button onClick={() => { setMainTab('menu'); setSelectedProgram(null); setSelectedSemester(null); setSubTarget(null); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
          ← Back to Attendance Menu
        </button>
      )}

      {/* 1. MARK STUDENT ATTENDANCE FLOW */}
      {mainTab === 'mark-student' && !selectedProgram && (
        <div>
          <h3>Select Program for Student Attendance:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
            {programs.map((p, i) => (
              <div key={i} onClick={() => setSelectedProgram(p)} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', cursor: 'pointer' }}>
                <h4 style={{ margin: 0, color: '#0f766e' }}>{p}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'mark-student' && selectedProgram && !selectedSemester && (
        <div>
          <button onClick={() => setSelectedProgram(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Change Program</button>
          <h3>Select Semester for {selectedProgram}:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
            {semesters.map((sem, i) => (
              <div key={i} onClick={() => { setSelectedSemester(sem); fetchStudentsForAttendance(selectedProgram, sem); }} style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center' }}>
                <h4 style={{ margin: 0, color: '#166534' }}>{sem}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'mark-student' && selectedProgram && selectedSemester && (
        <div>
          <button onClick={() => setSelectedSemester(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Change Semester</button>
          <h3>Marking Attendance: {selectedProgram} ({selectedSemester})</h3>
          
          {loading ? <p>Loading students...</p> : (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Student Name</th><th>Attendance Status</th></tr>
                </thead>
                <tbody>
                  {studentsList.map(s => (
                    <tr key={s.id}>
                      <td><b>{s.roll_no}</b></td>
                      <td>{s.full_name}</td>
                      <td>
                        <select 
                          value={attendanceState[s.roll_no] || 'Present'} 
                          onChange={(e) => setAttendanceState({...attendanceState, [s.roll_no]: e.target.value})}
                          style={{ padding: '6px', fontWeight: 'bold', color: attendanceState[s.roll_no] === 'Absent' ? 'red' : 'green' }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleSaveAttendance('student')} style={{ background: '#16a34a', color: 'white', padding: '12px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}>Save Class Attendance</button>
            </div>
          )}
        </div>
      )}

      {/* 2. MARK TEACHER ATTENDANCE */}
      {mainTab === 'mark-teacher' && (
        <div>
          <h3>Mark Staff / Teacher Attendance ({currentDateStr})</h3>
          {loading ? <p>Loading teachers...</p> : (
            <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}><th>Teacher ID</th><th>Teacher Name</th><th>Subject</th><th>Attendance Status</th></tr>
                </thead>
                <tbody>
                  {teachersList.map(t => (
                    <tr key={t.id}>
                      <td><b>{t.teacher_id}</b></td>
                      <td>{t.full_name}</td>
                      <td>{t.subject}</td>
                      <td>
                        <select 
                          value={attendanceState[t.teacher_id] || 'Present'} 
                          onChange={(e) => setAttendanceState({...attendanceState, [t.teacher_id]: e.target.value})}
                          style={{ padding: '6px', fontWeight: 'bold', color: attendanceState[t.teacher_id] === 'Absent' ? 'red' : 'green' }}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleSaveAttendance('teacher')} style={{ background: '#16a34a', color: 'white', padding: '12px 25px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '6px' }}>Save Teacher Attendance</button>
            </div>
          )}
        </div>
      )}

      {/* 3. VIEW TODAY ABSENT STUDENTS / TEACHERS */}
      {mainTab === 'view-absent' && !subTarget && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div onClick={() => { setSubTarget('student'); fetchTodayAbsents('student'); }} style={{ background: '#fee2e2', border: '2px solid #dc2626', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#991b1b' }}>
            🔴 View Today's Absent Students & Print
          </div>
          <div onClick={() => { setSubTarget('teacher'); fetchTodayAbsents('teacher'); }} style={{ background: '#fef3c7', border: '2px solid #d97706', padding: '30px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#b45309' }}>
            🟠 View Today's Absent Teachers & Print
          </div>
        </div>
      )}

      {mainTab === 'view-absent' && subTarget && (
        <div>
          <button onClick={() => setSubTarget(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px' }}>← Back</button>
          <h3>Today's Absent {subTarget === 'student' ? 'Students' : 'Teachers'} ({currentDateStr})</h3>
          
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}><th>ID / Roll No</th><th>Name</th><th>Category / Dept</th><th>Status</th></tr>
              </thead>
              <tbody>
                {absentList.length > 0 ? absentList.map(a => (
                  <tr key={a.id}>
                    <td><b>{a.person_id}</b></td>
                    <td>{a.name}</td>
                    <td>{a.category}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>{a.status}</td>
                  </tr>
                )) : <tr><td colSpan="4" style={{ textAlign: 'center' }}>No absent records found for today! 🎉</td></tr>}
              </tbody>
            </table>
            <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>🖨️ Print Absent Report</button>
          </div>
        </div>
      )}

      {/* 4. PAST ATTENDANCE HISTORY */}
      {mainTab === 'past' && (
        <div>
          <h3>🗂️ Past Attendance Records</h3>
          <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input type="date" value={pastDate} onChange={(e) => setPastDate(e.target.value)} style={{ padding: '8px' }} />
            <button onClick={() => fetchPastRecords(pastDate)} style={{ background: '#0f766e', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Fetch Attendance</button>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}><th>ID / Roll No</th><th>Name</th><th>Category</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pastRecords.length > 0 ? pastRecords.map(p => (
                  <tr key={p.id}>
                    <td><b>{p.person_id}</b></td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.attendance_date}</td>
                    <td style={{ color: p.status === 'Present' ? 'green' : 'red', fontWeight: 'bold' }}>{p.status}</td>
                  </tr>
                )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No attendance records found for {pastDate}.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}