import React, { useState } from 'react';
import { updateStudentSemester } from './studentRecordService';
import Print from '../reports/Print';

export default function StudentProfileModal({ student, onClose, onUpdate }) {
  const [newSem, setNewSem] = useState(student.semester);
  const [updating, setUpdating] = useState(false);

  const handlePromote = async () => {
    try {
      setUpdating(true);
      await updateStudentSemester(student.id, newSem);
      alert('Student semester updated successfully.');
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Error updating semester: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Dedicated A4 Print Content wrapped inside Print.jsx layout standard
  const profilePrintContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Student Profile Record</p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">PIASS College of Nursing & IT</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleString('en-PK')}</p>
      </header>

      <div className="flex gap-6 items-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div>
          {student.image_url ? (
            <img 
              src={student.image_url} 
              alt="Student" 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
              className="w-28 h-28 object-cover rounded-full border-4 border-[#062b55]" 
            />
          ) : (
            <div className="w-28 h-28 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">No Photo</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm w-full font-semibold text-slate-800">
          <p><b>Full Name:</b> {student.full_name}</p>
          <p><b>Roll Number:</b> {student.roll_no}</p>
          <p><b>Father Name:</b> {student.father_name}</p>
          <p><b>Program:</b> {student.category}</p>
          <p><b>Semester:</b> {student.semester}</p>
          <p><b>Phone:</b> {student.phone || '—'}</p>
          <p><b>Email:</b> {student.email || '—'}</p>
          <p><b>Status:</b> <span className={student.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{student.status}</span></p>
        </div>
      </div>

      <div className="flex justify-between mt-32 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Student Signature</p>
        <p>Authorized Principal / Registrar Stamp</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Screen View Modal */}
      <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50 no-print p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-black text-[#062b55]">Student Full Profile</h2>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-700">Print Profile</button>
              <button onClick={onClose} className="cursor-pointer bg-slate-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-slate-600">Close</button>
            </div>
          </div>

          <div className="flex gap-6 items-center mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              {student.image_url ? (
                <img 
                  src={student.image_url} 
                  alt="Student" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                  className="w-24 h-24 object-cover rounded-full border-3 border-[#062b55]" 
                />
              ) : (
                <div className="w-24 h-24 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">No Photo</div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold text-slate-800">
              <p><b>Name:</b> {student.full_name}</p>
              <p><b>Roll No:</b> {student.roll_no}</p>
              <p><b>Father:</b> {student.father_name}</p>
              <p><b>Program:</b> {student.category}</p>
              <p><b>Semester:</b> {student.semester}</p>
              <p><b>Phone:</b> {student.phone || '—'}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center bg-slate-100 p-4 rounded-xl mb-4">
            <label className="text-xs font-black uppercase text-[#062b55]">Change Semester:</label>
            <select value={newSem} onChange={(e) => setNewSem(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold">
              {["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"].map((s, i) => (
                <option key={i} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={handlePromote} disabled={updating} className="cursor-pointer bg-[#062b55] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-[#0b3e78]">
              {updating ? 'Updating...' : 'Update Semester'}
            </button>
          </div>

        </div>
      </div>

      {/* Dedicated Print Layout Wrapper */}
      <Print title="PIASS Student Profile">{profilePrintContent}</Print>
    </>
  );
}