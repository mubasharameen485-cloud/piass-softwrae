import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';
import Print from '../reports/Print';

export default function AttendanceHub() {
  const [mainTab, setMainTab] = useState('menu'); 
  const [subTarget, setSubTarget] = useState(null); 
  
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [teachersList, setTeachersList] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); 
  const [loading, setLoading] = useState(false);

  const [absentList, setAbsentList] = useState([]);
  const [pastDate, setPastDate] = useState(new Date().toISOString().split('T')[0]);
  const [pastRecords, setPastRecords] = useState([]);

  const todayObj = new Date();
  const dayOfWeek = todayObj.getDay(); 
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
      
      let initial = {};
      (data || []).forEach(s => { initial[s.roll_no] = 'Present'; });
      setAttendanceState(initial);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      for (let rec of recordsToSave) {
        await supabase.from('attendance_records').delete().eq('person_id', rec.person_id).eq('attendance_date', currentDateStr);
      }

      const { error } = await supabase.from('attendance_records').insert(recordsToSave);
      if (error) throw error;

      alert('Attendance successfully saved for today.');
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAbsents = async (type) => {
    try {
      setLoading(true);
      let query = supabase.from('attendance_records').select('*').eq('attendance_date', currentDateStr).eq('status', 'Absent');
      const { data, error } = await query;
      if (error) throw error;
      
      if (type === 'teacher') {
        setAbsentList((data || []).filter(r => r.category === 'Staff / Teacher'));
      } else {
        setAbsentList((data || []).filter(r => r.category !== 'Staff / Teacher'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  // Professional A4 Printable Layout matching Reports standard
  const absentPrintContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">
          Official Absent Statement
        </p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">
          {subTarget === 'student' ? 'Student' : 'Teacher'} Absent Report — {currentDateStr}
        </h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Generated: {new Date().toLocaleString('en-PK')}
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#062b55] text-white">
            <tr>
              <th className="px-5 py-3.5 font-bold tracking-wide">ID / Roll No</th>
              <th className="px-5 py-3.5 font-bold tracking-wide">Name</th>
              <th className="px-5 py-3.5 font-bold tracking-wide">Category / Dept</th>
              <th className="px-5 py-3.5 font-bold tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {absentList.length > 0 ? (
              absentList.map((a) => (
                <tr key={a.id || Math.random()} className="font-semibold">
                  <td className="px-5 py-3.5 text-slate-800">{a.person_id}</td>
                  <td className="px-5 py-3.5 text-slate-800">{a.name}</td>
                  <td className="px-5 py-3.5 text-slate-800">{a.category}</td>
                  <td className="px-5 py-3.5 text-red-600 font-bold">{a.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center font-bold text-slate-400 text-sm">
                  No absent records found for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Attendance Management System</h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Date: {currentDateStr} {isWeekend && <span className="text-red-600 font-bold">(Weekend Notice)</span>}
        </p>
      </header>

      {mainTab === 'menu' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-6">
          <div onClick={() => setMainTab('mark-student')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-lg font-black text-[#062b55]">Mark Student Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">Program and semester-wise class attendance entry.</p>
          </div>
          <div onClick={() => { setMainTab('mark-teacher'); fetchTeachersForAttendance(); }} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-lg font-black text-[#062b55]">Mark Teacher Attendance</h3>
            <p className="text-xs text-slate-500 mt-1">Daily faculty and staff attendance tracker.</p>
          </div>
          <div onClick={() => setMainTab('view-absent')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-lg font-black text-[#062b55]">View Today's Absents</h3>
            <p className="text-xs text-slate-500 mt-1">Generate official absent lists and print reports.</p>
          </div>
          <div onClick={() => { setMainTab('past'); fetchPastRecords(pastDate); }} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-lg font-black text-[#062b55]">Past Attendance History</h3>
            <p className="text-xs text-slate-500 mt-1">Audit past attendance logs by custom dates.</p>
          </div>
        </div>
      )}

      {mainTab !== 'menu' && (
        <button onClick={() => { setMainTab('menu'); setSelectedProgram(null); setSelectedSemester(null); setSubTarget(null); }} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
          ← Back to Attendance Menu
        </button>
      )}

      {mainTab === 'mark-student' && !selectedProgram && (
        <div>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Program for Student Attendance:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {programs.map((p, i) => (
              <div key={i} onClick={() => setSelectedProgram(p)} className="cursor-pointer rounded-xl border border-slate-300 bg-white p-4 font-bold text-slate-800 shadow-xs hover:border-[#078343]">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'mark-student' && selectedProgram && !selectedSemester && (
        <div>
          <button onClick={() => setSelectedProgram(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Program</button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Semester for {selectedProgram}:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {semesters.map((sem, i) => (
              <div key={i} onClick={() => { setSelectedSemester(sem); fetchStudentsForAttendance(selectedProgram, sem); }} className="cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 text-center font-bold text-emerald-900 shadow-xs hover:bg-emerald-100">
                {sem}
              </div>
            ))}
          </div>
        </div>
      )}

      {mainTab === 'mark-student' && selectedProgram && selectedSemester && (
        <div>
          <button onClick={() => setSelectedSemester(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Semester</button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Marking Class: {selectedProgram} ({selectedSemester})</h3>
          
          {loading ? <p className="font-bold">Loading students...</p> : (
            <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
              <table className="w-full border-collapse text-left text-sm mb-5">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Roll No</th>
                    <th className="px-4 py-3 font-bold">Student Name</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentsList.map(s => (
                    <tr key={s.id} className="font-semibold">
                      <td className="px-4 py-3">{s.roll_no}</td>
                      <td className="px-4 py-3">{s.full_name}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={attendanceState[s.roll_no] || 'Present'} 
                          onChange={(e) => setAttendanceState({...attendanceState, [s.roll_no]: e.target.value})}
                          className={`rounded-xl border px-3 py-1.5 text-sm font-bold ${attendanceState[s.roll_no] === 'Absent' ? 'text-red-600 border-red-300 bg-red-50' : 'text-emerald-700 border-emerald-300 bg-emerald-50'}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleSaveAttendance('student')} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-black text-white shadow-sm hover:bg-emerald-700">Save Class Attendance</button>
            </div>
          )}
        </div>
      )}

      {mainTab === 'mark-teacher' && (
        <div>
          <h3 className="text-base font-black text-[#062b55] mb-4">Mark Staff / Teacher Attendance ({currentDateStr})</h3>
          {loading ? <p className="font-bold">Loading teachers...</p> : (
            <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
              <table className="w-full border-collapse text-left text-sm mb-5">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Teacher ID</th>
                    <th className="px-4 py-3 font-bold">Teacher Name</th>
                    <th className="px-4 py-3 font-bold">Subject</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teachersList.map(t => (
                    <tr key={t.id} className="font-semibold">
                      <td className="px-4 py-3">{t.teacher_id}</td>
                      <td className="px-4 py-3">{t.full_name}</td>
                      <td className="px-4 py-3">{t.subject}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={attendanceState[t.teacher_id] || 'Present'} 
                          onChange={(e) => setAttendanceState({...attendanceState, [t.teacher_id]: e.target.value})}
                          className={`rounded-xl border px-3 py-1.5 text-sm font-bold ${attendanceState[t.teacher_id] === 'Absent' ? 'text-red-600 border-red-300 bg-red-50' : 'text-emerald-700 border-emerald-300 bg-emerald-50'}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => handleSaveAttendance('teacher')} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3 font-black text-white shadow-sm hover:bg-emerald-700">Save Teacher Attendance</button>
            </div>
          )}
        </div>
      )}

      {mainTab === 'view-absent' && !subTarget && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div onClick={() => { setSubTarget('student'); fetchTodayAbsents('student'); }} className="cursor-pointer rounded-2xl border-2 border-red-500 bg-red-50/50 p-6 text-center font-black text-red-700 shadow-sm transition hover:bg-red-100">
            View Today's Absent Students & Print
          </div>
          <div onClick={() => { setSubTarget('teacher'); fetchTodayAbsents('teacher'); }} className="cursor-pointer rounded-2xl border-2 border-amber-500 bg-amber-50/50 p-6 text-center font-black text-amber-800 shadow-sm transition hover:bg-amber-100">
            View Today's Absent Teachers & Print
          </div>
        </div>
      )}

      {mainTab === 'view-absent' && subTarget && (
        <div>
          <button onClick={() => setSubTarget(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Back</button>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-black text-[#062b55]">Today's Absent {subTarget === 'student' ? 'Students' : 'Teachers'} ({currentDateStr})</h3>
            <button onClick={() => window.print()} className="cursor-pointer rounded-xl bg-[#062b55] px-4 py-2 text-sm font-bold text-white shadow-sm">Print Absent Report</button>
          </div>
          
          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">ID / Roll No</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Category / Dept</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {absentList.length > 0 ? absentList.map(a => (
                  <tr key={a.id} className="font-semibold">
                    <td className="px-4 py-3">{a.person_id}</td>
                    <td className="px-4 py-3">{a.name}</td>
                    <td className="px-4 py-3">{a.category}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{a.status}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="p-6 text-center font-bold text-slate-400">No absent records found for today.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'past' && (
        <div>
          <h3 className="text-base font-black text-[#062b55] mb-4">Past Attendance Records</h3>
          <div className="flex gap-3 mb-5">
            <input type="date" value={pastDate} onChange={(e) => setPastDate(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800" />
            <button onClick={() => fetchPastRecords(pastDate)} className="cursor-pointer rounded-xl bg-[#062b55] px-5 py-2 text-sm font-bold text-white shadow-sm">Fetch Attendance</button>
          </div>

          <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">ID / Roll No</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Category</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pastRecords.length > 0 ? pastRecords.map(p => (
                  <tr key={p.id} className="font-semibold">
                    <td className="px-4 py-3">{p.person_id}</td>
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="px-4 py-3">{p.category}</td>
                    <td className="px-4 py-3">{p.attendance_date}</td>
                    <td className={`px-4 py-3 font-bold ${p.status === 'Present' ? 'text-emerald-700' : 'text-red-600'}`}>{p.status}</td>
                  </tr>
                )) : <tr><td colSpan="5" className="p-6 text-center font-bold text-slate-400">No attendance records found for {pastDate}.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>{hubContent}</Background>
      </div>
      <Print title="PIASS Attendance Report">{absentPrintContent}</Print>
    </>
  );
}