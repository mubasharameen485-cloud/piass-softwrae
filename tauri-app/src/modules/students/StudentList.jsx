import React, { useEffect, useState } from 'react';
import { getAllStudents } from './studentRecordService';
import StudentProfileModal from './StudentProfileModal';

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
    "BS Nursing - BSN",
    "Post RN",
    "Doctor of Physiotherapy (DPT)",
    "LHV Diploma",
    "CMW Diploma",
    "CNA Program",
    "BS Computer Science",
    "BS Information Tech",
    "BBA (Business Admin)",
    "BS English Literature",
    "ADP Computer Science",
    "ADP Information Tech",
    "ADP Business Admin",
    "ADP English",
    "Lateral 5th Sem Entry"
  ];

  const semestersList = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  // Filter logic: Global search OR Program -> Semester hierarchy
  const filteredStudents = students.filter(s => {
    if (search) {
      return s.full_name.toLowerCase().includes(search.toLowerCase()) ||
             s.roll_no.toLowerCase().includes(search.toLowerCase());
    }
    const matchesProgram = selectedProgram ? s.category === selectedProgram : true;
    const matchesSemester = selectedSemester ? s.semester === selectedSemester : true;
    return matchesProgram && matchesSemester;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📋 Student Records & Program Directory</h2>

      {/* Navigation Breadcrumb / Back Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        {selectedSemester && (
          <button onClick={() => setSelectedSemester(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Semesters
          </button>
        )}
        {selectedProgram && !selectedSemester && (
          <button onClick={() => setSelectedProgram(null)} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ← Back to Programs
          </button>
        )}
      </div>

      {/* Header Info based on selection */}
      {selectedProgram && (
        <h3 style={{ color: '#0f766e', marginBottom: '15px' }}>
          Program: {selectedProgram} {selectedSemester ? `> ${selectedSemester}` : ''}
        </h3>
      )}

      {/* GLOBAL SEARCH BAR */}
      <input 
        type="text" 
        placeholder="Global Search by Roll Number or Name across all programs..." 
        value={search} 
        onChange={(e) => { setSearch(e.target.value); setSelectedProgram(null); setSelectedSemester(null); }} 
        style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
      />

      {loading ? (
        <p>Loading students data...</p>
      ) : (
        <>
          {/* STEP 1: SHOW PROGRAMS DIRECTORY (If no program selected and no search) */}
          {!selectedProgram && !search && (
            <div>
              <p style={{ color: '#555', marginBottom: '15px' }}>Select a Program/Department:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {programs.map((prog, index) => {
                  const count = students.filter(s => s.category === prog).length;
                  return (
                    <div 
                      key={index} 
                      onClick={() => { setSelectedProgram(prog); setSelectedSemester(null); }}
                      style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: '0.2s' }}
                    >
                      <h4 style={{ margin: '0 0 10px 0', color: '#0f766e' }}>{prog}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Total Enrolled: <b>{count}</b></p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: SHOW SEMESTERS LIST (If program selected, but semester NOT selected) */}
          {selectedProgram && !selectedSemester && !search && (
            <div>
              <p style={{ color: '#555', marginBottom: '15px' }}>Select a Semester:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                {semestersList.map((sem, index) => {
                  const count = students.filter(s => s.category === selectedProgram && s.semester === sem).length;
                  return (
                    <div 
                      key={index} 
                      onClick={() => setSelectedSemester(sem)}
                      style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '20px', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                    >
                      <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>{sem}</h4>
                      <p style={{ margin: 0, color: '#15803d', fontSize: '0.85rem' }}>Students: <b>{count}</b></p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: SHOW STUDENTS TABLE (If Semester is selected OR Global Search is active) */}
          {(selectedSemester || search) && (
            <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>Photo</th>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Father Name</th>
                    <th>Semester</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <tr 
                        key={s.id} 
                        onClick={() => setSelectedStudent(s)}
                        style={{ cursor: 'pointer', background: '#fff' }}
                        title="Click to view full profile & fee history"
                      >
                        <td style={{ textAlign: 'center' }}>
                          {s.image_url ? (
                            <img src={s.image_url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }} />
                          ) : (
                            <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '50%', margin: '0 auto' }}></div>
                          )}
                        </td>
                        <td><b>{s.roll_no}</b></td>
                        <td>{s.full_name}</td>
                        <td>{s.father_name}</td>
                        <td><span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{s.semester}</span></td>
                        <td>{s.phone}</td>
                        <td><span style={{ color: s.status === 'Active' ? 'green' : 'red', fontWeight: 'bold' }}>{s.status}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No students found matching this criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* STUDENT PROFILE POPUP MODAL */}
      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
          onUpdate={() => { fetchStudents(); setSelectedStudent(null); }} 
        />
      )}
    </div>
  );
}




