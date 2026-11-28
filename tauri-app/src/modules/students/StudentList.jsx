import React, { useEffect, useState } from 'react';
import { getAllStudents } from './studentRecordService';
import StudentProfileModal from './StudentProfileModal';
import Background from '../reports/Background';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const programs = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semestersList = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  const filteredStudents = students.filter(s => {
    if (search) {
      return s.full_name.toLowerCase().includes(search.toLowerCase()) ||
             s.roll_no.toLowerCase().includes(search.toLowerCase());
    }
    const matchesProgram = selectedProgram ? s.category === selectedProgram : true;
    const matchesSemester = selectedSemester ? s.semester === selectedSemester : true;
    return matchesProgram && matchesSemester;
  });

  const directoryContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Student Records & Program Directory</h1>
      </header>

      <div className="mb-6 flex gap-3">
        {selectedSemester && (
          <button onClick={() => setSelectedSemester(null)} className="cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
            ← Back to Semesters
          </button>
        )}
        {selectedProgram && !selectedSemester && (
          <button onClick={() => setSelectedProgram(null)} className="cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
            ← Back to Programs
          </button>
        )}
      </div>

      {selectedProgram && (
        <h3 className="text-lg font-black text-[#062b55] mb-4">
          Program: {selectedProgram} {selectedSemester ? `> ${selectedSemester}` : ''}
        </h3>
      )}

      <input 
        type="text" 
        placeholder="Global Search by Roll Number or Name across all programs..." 
        value={search} 
        onChange={(e) => { setSearch(e.target.value); setSelectedProgram(null); setSelectedSemester(null); }} 
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold mb-6 shadow-xs"
      />

      {loading ? (
        <p className="font-bold">Loading students data...</p>
      ) : (
        <>
          {!selectedProgram && !search && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-4">Select a Program / Department:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {programs.map((prog, index) => {
                  const count = students.filter(s => s.category === prog).length;
                  return (
                    <div 
                      key={index} 
                      onClick={() => { setSelectedProgram(prog); setSelectedSemester(null); }}
                      className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-5 shadow-xs transition hover:border-[#078343]"
                    >
                      <h4 className="text-base font-black text-[#062b55] mb-2">{prog}</h4>
                      <p className="text-xs font-semibold text-slate-500">Enrolled Students: <span className="font-bold text-slate-800">{count}</span></p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedProgram && !selectedSemester && !search && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-4">Select a Semester:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {semestersList.map((sem, index) => {
                  const count = students.filter(s => s.category === selectedProgram && s.semester === sem).length;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedSemester(sem)}
                      className="cursor-pointer rounded-2xl border border-emerald-300 bg-emerald-50/50 p-5 text-center shadow-xs transition hover:bg-emerald-100"
                    >
                      <h4 className="text-base font-black text-emerald-900 mb-1">{sem}</h4>
                      <p className="text-xs font-bold text-emerald-700">Students: {count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedSemester || search) && (
            <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold text-center">Photo</th>
                    <th className="px-4 py-3 font-bold">Roll No</th>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Father Name</th>
                    <th className="px-4 py-3 font-bold">Semester</th>
                    <th className="px-4 py-3 font-bold">Phone</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr 
                        key={s.id} 
                        onClick={() => setSelectedStudent(s)}
                        className="cursor-pointer transition hover:bg-slate-50 font-semibold"
                        title="Click to view full profile"
                      >
                        <td className="px-4 py-3 text-center">
                          {s.image_url ? (
                            <img src={s.image_url} alt="" className="w-10 h-10 object-cover rounded-full mx-auto border border-slate-300" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-[10px] font-bold text-slate-500">No Pic</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-900">{s.roll_no}</td>
                        <td className="px-4 py-3 text-slate-900">{s.full_name}</td>
                        <td className="px-4 py-3 text-slate-800">{s.father_name}</td>
                        <td className="px-4 py-3"><span className="rounded-xl bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">{s.semester}</span></td>
                        <td className="px-4 py-3 text-slate-800">{s.phone || '—'}</td>
                        <td className="px-4 py-3"><span className={s.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{s.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center font-bold text-slate-400">No students found matching this criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onUpdate={() => { fetchStudents(); setSelectedStudent(null); }} 
        />
      )}
    </div>
  );

  return (
    <div className="screen-report-only h-full w-full">
      <Background>{directoryContent}</Background>
    </div>
  );
}