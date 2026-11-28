import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';
import Print from '../reports/Print';

export default function TeacherDirectoryHub() {
  const [mode, setMode] = useState('menu'); // 'menu', 'list', 'manage'
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherSalaries, setTeacherSalaries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('teachers').select('*');
      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const calculateExperience = (joiningDate) => {
    if (!joiningDate) return "1 Year";
    const start = new Date(joiningDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${(diffDays / 365).toFixed(1)} Years`;
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this teacher from database?")) return;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
      alert('Teacher deleted successfully.');
      fetchTeachers();
      setSelectedTeacher(null);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    setEditForm(teacher);
    setIsEditing(false);
    try {
      const { data } = await supabase
        .from('teacher_payments')
        .select('*')
        .eq('teacher_id', teacher.teacher_id);
      setTeacherSalaries(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = editForm.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `teacher_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('campus_images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicURLData } = await supabase.storage.from('campus_images').getPublicUrl(fileName);
        imageUrl = publicURLData.publicUrl;
      }

      const updatedData = {
        full_name: editForm.full_name,
        father_name: editForm.father_name,
        subject: editForm.subject,
        degree: editForm.degree,
        experience: editForm.experience,
        gender: editForm.gender,
        age: parseInt(editForm.age) || 0,
        image_url: imageUrl
      };

      const { error } = await supabase.from('teachers').update(updatedData).eq('id', editForm.id);
      if (error) throw error;

      alert('Teacher details updated successfully.');
      setIsEditing(false);
      setImageFile(null);
      fetchTeachers();
      setSelectedTeacher({ ...editForm, image_url: imageUrl });
    } catch (err) {
      alert('Error updating: ' + err.message);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.teacher_id.toLowerCase().includes(search.toLowerCase())
  );

  const teacherPrintContent = selectedTeacher ? (
    <div className="text-slate-900 font-medium p-4">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Teacher Profile Record</p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">PIASS College of Nursing & IT</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleString('en-PK')}</p>
      </header>

      <div className="flex gap-6 items-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div>
          {selectedTeacher.image_url ? (
            <img src={selectedTeacher.image_url} alt="" onError={(e)=>{e.target.src='https://via.placeholder.com/150?text=No+Image'}} className="w-28 h-28 object-cover rounded-full border-4 border-[#062b55]" />
          ) : (
            <div className="w-28 h-28 bg-slate-300 rounded-full flex items-center justify-center font-bold text-slate-600 text-xs">No Photo</div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm w-full font-semibold text-slate-800">
          <p><b>Full Name:</b> {selectedTeacher.full_name}</p>
          <p><b>Teacher ID:</b> {selectedTeacher.teacher_id}</p>
          <p><b>Father Name:</b> {selectedTeacher.father_name}</p>
          <p><b>Subject:</b> {selectedTeacher.subject}</p>
          <p><b>Degree:</b> {selectedTeacher.degree}</p>
          <p><b>Experience:</b> {calculateExperience(selectedTeacher.joining_date)}</p>
          <p><b>Gender:</b> {selectedTeacher.gender}</p>
          <p><b>Status:</b> <span className={selectedTeacher.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{selectedTeacher.status || 'Active'}</span></p>
        </div>
      </div>

      <div className="flex justify-between mt-32 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Teacher Signature</p>
        <p>Authorized Principal / Registrar Stamp</p>
      </div>
    </div>
  ) : null;

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Teachers Directory & Management</h1>
      </header>

      {mode === 'menu' && !selectedTeacher && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          <div onClick={() => setMode('list')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">Show All Teachers</h3>
            <p className="text-xs text-slate-500 mt-2">Browse active teachers directory and click to view profiles.</p>
          </div>
          <div onClick={() => setMode('manage')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">Edit / Delete Teachers</h3>
            <p className="text-xs text-slate-500 mt-2">Modify teacher profiles or remove records from database.</p>
          </div>
        </div>
      )}

      {mode !== 'menu' && !selectedTeacher && (
        <button onClick={() => setMode('menu')} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
          ← Back to Menu
        </button>
      )}

      {selectedTeacher && (
        <button onClick={() => setSelectedTeacher(null)} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700 no-print">
          ← Back to List
        </button>
      )}

      {/* LIST VIEW (CLICKABLE TEACHERS) */}
      {mode === 'list' && !selectedTeacher && (
        <div>
          <input 
            type="text" 
            placeholder="Search teachers by name or ID..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold mb-6 shadow-xs"
          />
          {loading ? <p className="font-bold">Loading teachers...</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredTeachers.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => handleSelectTeacher(t)}
                  className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-5 shadow-xs transition hover:border-[#078343]"
                >
                  {t.image_url ? (
                    <img src={t.image_url} alt="" onError={(e)=>{e.target.src='https://via.placeholder.com/150?text=No+Image'}} className="w-16 h-16 rounded-full object-cover mb-3 border border-slate-300" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 mb-3 flex items-center justify-center text-xs font-bold text-slate-500">No Pic</div>
                  )}
                  <h4 className="text-base font-black text-[#062b55] mb-1">{t.full_name}</h4>
                  <p className="text-xs font-semibold text-slate-600">ID: <b>{t.teacher_id}</b></p>
                  <p className="text-xs font-semibold text-slate-600">Subject: {t.subject}</p>
                  <p className="text-xs font-semibold text-slate-600">Experience: <b>{calculateExperience(t.joining_date)}</b></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANAGE VIEW */}
      {mode === 'manage' && !selectedTeacher && (
        <div>
          <input 
            type="text" 
            placeholder="Search teacher by name or ID to edit/delete..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold mb-6 shadow-xs"
          />
          <div className="overflow-x-auto rounded-2xl border border-slate-300 bg-white shadow-xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold text-center">Photo</th>
                  <th className="px-4 py-3 font-bold">ID</th>
                  <th className="px-4 py-3 font-bold">Name</th>
                  <th className="px-4 py-3 font-bold">Subject</th>
                  <th className="px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTeachers.map(t => (
                  <tr key={t.id} className="font-semibold">
                    <td className="px-4 py-3 text-center">
                      {t.image_url ? <img src={t.image_url} alt="" onError={(e)=>{e.target.src='https://via.placeholder.com/150?text=No+Image'}} className="w-10 h-10 rounded-full object-cover mx-auto border border-slate-300" /> : 'No Pic'}
                    </td>
                    <td className="px-4 py-3 text-slate-900">{t.teacher_id}</td>
                    <td className="px-4 py-3 text-slate-900">{t.full_name}</td>
                    <td className="px-4 py-3 text-slate-800">{t.subject}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleSelectTeacher(t)} className="cursor-pointer bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-sky-700">Edit</button>
                        <button onClick={() => handleDeleteTeacher(t.id)} className="cursor-pointer bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-red-700">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SELECTED TEACHER PROFILE & EDIT VIEW */}
      {selectedTeacher && (
        <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs">
          {!isEditing ? (
            <div>
              <div className="flex justify-between items-center mb-6 no-print">
                <h3 className="text-xl font-black text-[#062b55]">Teacher Profile</h3>
                <div className="flex gap-3">
                  <button onClick={() => window.print()} className="cursor-pointer bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-700">Print Profile</button>
                  <button onClick={() => setIsEditing(true)} className="cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs hover:bg-sky-700">Edit Details</button>
                </div>
              </div>

              <div className="flex gap-6 items-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div>
                  {selectedTeacher.image_url ? (
                    <img src={selectedTeacher.image_url} alt="" onError={(e)=>{e.target.src='https://via.placeholder.com/150?text=No+Image'}} className="w-24 h-24 rounded-full object-cover border-3 border-[#062b55]" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-300 flex items-center justify-center font-bold text-slate-600 text-xs">No Photo</div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-semibold text-slate-800">
                  <p><b>Name:</b> {selectedTeacher.full_name}</p>
                  <p><b>Teacher ID:</b> {selectedTeacher.teacher_id}</p>
                  <p><b>Subject:</b> {selectedTeacher.subject}</p>
                  <p><b>Degree:</b> {selectedTeacher.degree}</p>
                  <p><b>Experience:</b> {calculateExperience(selectedTeacher.joining_date)}</p>
                  <p><b>Status:</b> <span className={selectedTeacher.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{selectedTeacher.status || 'Active'}</span></p>
                </div>
              </div>

              <h4 className="text-base font-black text-[#062b55] mb-3">Salary Payment History</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#062b55] text-white">
                    <tr>
                      <th className="px-4 py-3 font-bold">Month</th>
                      <th className="px-4 py-3 font-bold">Total Salary</th>
                      <th className="px-4 py-3 font-bold">Paid Amount</th>
                      <th className="px-4 py-3 font-bold">Note</th>
                      <th className="px-4 py-3 font-bold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teacherSalaries.length > 0 ? teacherSalaries.map(s => (
                      <tr key={s.id} className="font-semibold">
                        <td className="px-4 py-3">{s.salary_month}</td>
                        <td className="px-4 py-3">Rs. {s.total_salary}</td>
                        <td className="px-4 py-3 text-emerald-700 font-bold">Rs. {s.paid_amount}</td>
                        <td className="px-4 py-3">{s.payment_note}</td>
                        <td className="px-4 py-3">{new Date(s.payment_date).toLocaleDateString()}</td>
                      </tr>
                    )) : <tr><td colSpan="5" className="p-6 text-center font-bold text-slate-400">No salary records found for this teacher.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateSubmit} className="grid gap-4">
              <h3 className="text-lg font-black text-[#062b55]">Edit Teacher Profile</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Full Name:</label>
                  <input type="text" value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Father Name:</label>
                  <input type="text" value={editForm.father_name || ''} onChange={(e) => setEditForm({...editForm, father_name: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Subject:</label>
                  <input type="text" value={editForm.subject || ''} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Degree:</label>
                  <input type="text" value={editForm.degree || ''} onChange={(e) => setEditForm({...editForm, degree: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Experience Note:</label>
                  <input type="text" value={editForm.experience || ''} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Update Photo:</label>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-sm" />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button type="submit" className="cursor-pointer bg-emerald-600 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-700">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="cursor-pointer bg-slate-500 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xs hover:bg-slate-600">Cancel</button>
              </div>
            </form>
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
      <Print title="PIASS Teacher Profile">{teacherPrintContent}</Print>
    </>
  );
}