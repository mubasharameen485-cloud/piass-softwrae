import React, { useState } from 'react';
import { searchStudentsForEdit, updateStudentDetails, bulkPromoteBatch, updateStudentStatus } from './studentManageService';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';

export default function StudentManageHub() {
  const [subTab, setSubTab] = useState('batch-promote'); 

  const [targetCategory, setTargetCategory] = useState('BS Computer Science');
  const [fromSem, setFromSem] = useState('1st Semester');
  const [toSem, setToSem] = useState('2nd Semester');
  const [promoting, setPromoting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const categories = [
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester", "Graduated"
  ];

  const handleBatchPromotion = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to promote all students of ${targetCategory} from ${fromSem} to ${toSem}?`)) return;
    
    try {
      setPromoting(true);
      const updated = await bulkPromoteBatch(targetCategory, fromSem, toSem);
      alert(`Successfully promoted ${updated.length} students to ${toSem}.`);
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setPromoting(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      alert('Search error: ' + err.message);
    }
  };

  const startEditing = (student) => {
    setEditingStudent(student);
    setEditForm({ ...student });
    setImageFile(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl = editForm.image_url;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `edit_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('campus_images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicURLData } = supabase.storage.from('campus_images').getPublicUrl(fileName);
        imageUrl = publicURLData.publicUrl;
      }

      const updatedFields = {
        full_name: editForm.full_name,
        father_name: editForm.father_name,
        phone: editForm.phone,
        email: editForm.email,
        semester: editForm.semester,
        category: editForm.category,
        status: editForm.status,
        image_url: imageUrl
      };

      await updateStudentDetails(editingStudent.id, updatedFields);
      alert('Student profile updated successfully.');
      setEditingStudent(null);
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results);
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Change student status to "${newStatus}"?`)) return;
    try {
      await updateStudentStatus(id, newStatus);
      alert(`Status updated to ${newStatus}`);
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Student Management Hub</h1>
      </header>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setSubTab('batch-promote')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${subTab === 'batch-promote' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
          Batch Class Promotion
        </button>
        <button onClick={() => setSubTab('edit-student')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${subTab === 'edit-student' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
          Search & Edit Student
        </button>
      </div>

      {subTab === 'batch-promote' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs">
          <h3 className="text-lg font-black text-[#062b55] mb-2">Bulk Class Promotion</h3>
          <p className="text-xs font-semibold text-slate-500 mb-6">Promote all students of a program from current semester to next semester instantly.</p>
          
          <form onSubmit={handleBatchPromotion} className="grid gap-4 max-w-lg">
            <div>
              <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Select Program:</label>
              <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">From Semester:</label>
                <select value={fromSem} onChange={(e) => setFromSem(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">To Semester:</label>
                <select value={toSem} onChange={(e) => setToSem(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold">
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={promoting} className="cursor-pointer rounded-xl bg-emerald-600 px-6 py-3.5 font-black text-white shadow-sm hover:bg-emerald-700 mt-2">
              {promoting ? 'Promoting Batch...' : 'Confirm Bulk Promotion'}
            </button>
          </form>
        </div>
      )}

      {subTab === 'edit-student' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs">
          <h3 className="text-lg font-black text-[#062b55] mb-4">Search Student to Edit Profile</h3>
          
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <input 
              type="text" 
              placeholder="Enter Roll Number or Full Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              required 
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold" 
            />
            <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3 text-sm font-bold text-white shadow-sm">Search</button>
          </form>

          <div className="overflow-x-auto">
            {searchResults.length > 0 ? (
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Roll No</th>
                    <th className="px-4 py-3 font-bold">Name</th>
                    <th className="px-4 py-3 font-bold">Program</th>
                    <th className="px-4 py-3 font-bold">Semester</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {searchResults.map(s => (
                    <tr key={s.id} className="font-semibold">
                      <td className="px-4 py-3">{s.roll_no}</td>
                      <td className="px-4 py-3">{s.full_name}</td>
                      <td className="px-4 py-3">{s.category}</td>
                      <td className="px-4 py-3">{s.semester}</td>
                      <td className="px-4 py-3"><span className={s.status === 'Active' ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold'}>{s.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(s)} className="cursor-pointer bg-sky-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-sky-700">Edit</button>
                          <select value={s.status} onChange={(e) => handleStatusUpdate(s.id, e.target.value)} className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold">
                            <option value="Active">Active</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Stuck_Off">Stuck Off</option>
                            <option value="Graduated">Graduated</option>
                            <option value="Migrated">Migrated</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="font-bold text-slate-400">No students searched yet.</p>
            )}
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
            <h3 className="text-lg font-black text-[#062b55] mb-4">Edit Student Profile</h3>
            
            <form onSubmit={handleSaveEdit} className="grid gap-4">
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Full Name:</label>
                <input type="text" value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Father Name:</label>
                <input type="text" value={editForm.father_name || ''} onChange={(e) => setEditForm({...editForm, father_name: e.target.value})} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program:</label>
                <select value={editForm.category || ''} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold">
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Semester:</label>
                <select value={editForm.semester || ''} onChange={(e) => setEditForm({...editForm, semester: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-bold">
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Phone:</label>
                <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Update Photo:</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-sm" />
              </div>

              <div className="flex gap-3 mt-4">
                <button type="submit" disabled={saving} className="flex-1 cursor-pointer bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-xs hover:bg-emerald-700">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingStudent(null)} className="cursor-pointer bg-slate-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-xs hover:bg-slate-600">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="screen-report-only h-full w-full">
      <Background>{hubContent}</Background>
    </div>
  );
}