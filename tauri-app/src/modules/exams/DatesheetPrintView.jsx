import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function DatesheetPrintView() {
  const [dlProgram, setDlProgram] = useState(null);
  const [dlSemester, setDlSemester] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [savedDatesheets, setSavedDatesheets] = useState([]);
  const [activeStudentCard, setActiveStudentCard] = useState(null);

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

  const fetchDatesheetsForClass = async (prog, sem) => {
    const { data } = await supabase.from('exam_datesheets').select('*').eq('category', prog).eq('semester', sem);
    setSavedDatesheets(data || []);
    const { data: stdData } = await supabase.from('students').select('*').eq('category', prog).eq('semester', sem);
    setClassStudents(stdData || []);
  };

  if (activeStudentCard) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-sm">
        {/* Printable Letterhead wrapper styled exactly like official PIASS letterhead */}
        <div id="exam-print-area" className="bg-white p-6 text-slate-900">
          <div className="border-b-2 border-[#062b55] pb-4 mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-[#062b55]">PIASS COLLEGE OF NURSING & IT</h2>
              <p className="text-xs font-bold text-[#078343]">Official Examination Datesheet Slip</p>
            </div>
            <div>
              {activeStudentCard.image_url ? (
                <img src={activeStudentCard.image_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#062b55]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">Photo</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-6 bg-slate-50 p-4 rounded-xl text-sm font-semibold text-slate-800">
            <p><b>Student Name:</b> {activeStudentCard.full_name}</p>
            <p><b>Roll Number:</b> {activeStudentCard.roll_no}</p>
            <p><b>Father Name:</b> {activeStudentCard.father_name}</p>
            <p><b>Program:</b> {activeStudentCard.category} ({activeStudentCard.semester})</p>
          </div>

          <table className="w-full border-collapse text-left text-sm mb-6">
            <thead className="bg-[#062b55] text-white">
              <tr>
                <th className="px-4 py-3 font-bold">Subject Code</th>
                <th className="px-4 py-3 font-bold">Subject Name</th>
                <th className="px-4 py-3 font-bold">Exam Date</th>
                <th className="px-4 py-3 font-bold">Timing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-semibold">
              {savedDatesheets.length > 0 ? savedDatesheets.map(ds => (
                <tr key={ds.id}>
                  <td className="px-4 py-3 text-slate-900">{ds.subject_code}</td>
                  <td className="px-4 py-3 text-slate-900">{ds.subject_name}</td>
                  <td className="px-4 py-3 text-slate-800">{ds.exam_date}</td>
                  <td className="px-4 py-3 text-slate-800">{ds.exam_time}</td>
                </tr>
              )) : <tr><td colSpan="4" className="p-6 text-center font-bold text-slate-400">No datesheet slots defined for this class yet.</td></tr>}
            </tbody>
          </table>

          <div className="rounded-xl bg-amber-50 border border-amber-300 p-4 mb-6 text-xs text-amber-900">
            <p className="font-bold mb-1">Exam Instructions:</p>
            <ol className="list-decimal pl-4 space-y-0.5">
              <li>Students must bring their Student ID card and this Datesheet slip to the examination hall.</li>
              <li>Entry into the examination hall will be closed 15 minutes after the exam starts.</li>
            </ol>
          </div>

          <div className="flex justify-between mt-16 pt-4 border-t border-slate-400 text-sm font-bold">
            <p>Student Signature</p>
            <p>Controller of Examinations Stamp</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-6 no-print">
          <button onClick={() => window.print()} className="cursor-pointer bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700">Print Datesheet</button>
          <button onClick={() => setActiveStudentCard(null)} className="cursor-pointer bg-slate-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-600">Back to List</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!dlProgram && (
        <div>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Program to Print Student Datesheets:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {categories.map((p, i) => (
              <div key={i} onClick={() => setDlProgram(p)} className="cursor-pointer rounded-xl border border-slate-300 bg-white p-4 font-bold text-slate-800 shadow-xs hover:border-[#078343]">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {dlProgram && !dlSemester && (
        <div>
          <button onClick={() => setDlProgram(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Program</button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Select Semester for {dlProgram}:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {semesters.map((sem, i) => (
              <div key={i} onClick={() => { setDlSemester(sem); fetchDatesheetsForClass(dlProgram, sem); }} className="cursor-pointer rounded-xl border border-emerald-300 bg-emerald-50/50 p-4 text-center font-bold text-emerald-900 shadow-xs hover:bg-emerald-100">
                {sem}
              </div>
            ))}
          </div>
        </div>
      )}

      {dlProgram && dlSemester && (
        <div>
          <button onClick={() => setDlSemester(null)} className="mb-4 cursor-pointer rounded-lg bg-slate-500 px-3 py-1.5 text-xs font-bold text-white">← Change Semester</button>
          <h3 className="text-base font-black text-[#062b55] mb-4">Class Students List ({dlProgram} - {dlSemester})</h3>
          
          <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">Roll No</th>
                  <th className="px-4 py-3 font-bold">Student Name</th>
                  <th className="px-4 py-3 font-bold">Father Name</th>
                  <th className="px-4 py-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {classStudents.length > 0 ? classStudents.map(s => (
                  <tr key={s.id} className="font-semibold">
                    <td className="px-4 py-3 text-slate-900">{s.roll_no}</td>
                    <td className="px-4 py-3 text-slate-900">{s.full_name}</td>
                    <td className="px-4 py-3 text-slate-800">{s.father_name}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setActiveStudentCard(s)} className="cursor-pointer bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700">
                        Print Datesheet
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="p-8 text-center font-bold text-slate-400">No students found in this class.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}