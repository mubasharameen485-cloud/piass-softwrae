import React, { useState } from 'react';
import { searchStudentsForEdit, updateStudentDetails, bulkPromoteBatch, updateStudentStatus } from './studentManageService';
import { supabase } from '../../services/supabaseClient';

export default function StudentManageHub() {
  const [subTab, setSubTab] = useState('batch-promote'); // 'batch-promote', 'edit-student', 'status-manager'

  // Batch Promote States
  const [targetCategory, setTargetCategory] = useState('BS Computer Science');
  const [fromSem, setFromSem] = useState('1st Semester');
  const [toSem, setToSem] = useState('2nd Semester');
  const [promoting, setPromoting] = useState(false);

  // Search & Edit States
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
    "5th Semester", "6th Semester", "7th Semester", "8th Semester", "Degree Completed / Graduated"
  ];

  // Handle Batch Promotion
  const handleBatchPromotion = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to promote all students of ${targetCategory} from ${fromSem} to ${toSem}?`)) return;
    
    try {
      setPromoting(true);
      const updated = await bulkPromoteBatch(targetCategory, fromSem, toSem);
      alert(`✅ Successfully promoted ${updated.length} students to ${toSem}!`);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setPromoting(false);
    }
  };

  // Handle Search for Edit
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results || []);
    } catch (err) {
      alert('❌ Search error: ' + err.message);
    }
  };

  // Open Edit Modal for a student
  const startEditing = (student) => {
    setEditingStudent(student);
    setEditForm({ ...student });
    setImageFile(null);
  };

  // Save Edited Student Data
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let imageUrl = editForm.image_url;

      // If new image uploaded
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
      alert('✅ Student profile updated successfully!');
      setEditingStudent(null);
      // Refresh search
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results);
    } catch (err) {
      alert('❌ Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle Soft Status Change (Graduated, Dropped, Stuck Off, Migrated)
  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Change student status to "${newStatus}"? (Record will be safely preserved in database)`)) return;
    try {
      await updateStudentStatus(id, newStatus);
      alert(`✅ Status updated to ${newStatus}`);
      const results = await searchStudentsForEdit(searchQuery);
      setSearchResults(results);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>⚙️ Student Management Hub (Edit, Promote & Status)</h2>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setSubTab('batch-promote')} style={{ padding: '10px 15px', background: subTab === 'batch-promote' ? '#0f766e' : '#e2e8f0', color: subTab === 'batch-promote' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          🚀 Batch Class Promotion
        </button>
        <button onClick={() => setSubTab('edit-student')} style={{ padding: '10px 15px', background: subTab === 'edit-student' ? '#0f766e' : '#e2e8f0', color: subTab === 'edit-student' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ✏️ Search & Edit Student
        </button>
      </div>

      {/* 1. BATCH PROMOTION VIEW */}
      {subTab === 'batch-promote' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🚀 Bulk Class Promotion (Promote Whole Batch)</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Instead of changing semesters one by one, select a program and promote all students from current semester to next semester instantly.</p>
          
          <form onSubmit={handleBatchPromotion} style={{ display: 'grid', gap: '15px', maxWidth: '500px', marginTop: '15px' }}>
            <div>
              <label style={{ fontWeight: 'bold' }}>Select Program / Category:</label>
              <select value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontWeight: 'bold' }}>From Semester:</label>
                <select value={fromSem} onChange={(e) => setFromSem(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold' }}>To Promote Semester:</label>
                <select value={toSem} onChange={(e) => setToSem(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}>
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" disabled={promoting} style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
              {promoting ? 'Promoting Batch...' : 'Confirm Bulk Promotion'}
            </button>
          </form>
        </div>
      )}

      {/* 2. SEARCH & EDIT STUDENT VIEW */}
      {subTab === 'edit-student' && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>✏️ Search Student to Edit Profile or Update Status</h3>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <input 
              type="text" 
              placeholder="Enter Roll Number or Full Name..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              required 
              style={{ flex: 1, padding: '10px' }}
            />
            <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Search
            </button>
          </form>

          {/* Search Results List */}
          <div style={{ marginTop: '20px' }}>
            {searchResults.length > 0 ? (
              <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Semester</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(s => (
                    <tr key={s.id}>
                      <td><b>{s.roll_no}</b></td>
                      <td>{s.full_name}</td>
                      <td>{s.category}</td>
                      <td>{s.semester}</td>
                      <td>
                        <span style={{ 
                          color: s.status === 'Active' ? 'green' : s.status === 'Graduated' ? 'blue' : 'orange', 
                          fontWeight: 'bold' 
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => startEditing(s)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                          <select value={s.status} onChange={(e) => handleStatusUpdate(s.id, e.target.value)} style={{ padding: '4px' }}>
                            <option value="Active">Active</option>
                            <option value="Dropped">Dropped</option>
                            <option value="Stuck_Off">Stuck Off</option>
                            <option value="Graduated">Graduated (8th Sem)</option>
                            <option value="Migrated">Migrated</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#64748b' }}>No students searched yet or results empty.</p>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL POPUP */}
      {editingStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>✏️ Edit Student Profile</h3>
            
            <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '10px', marginTop: '15px' }}>
              <div>
                <label>Full Name:</label>
                <input type="text" value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Father Name:</label>
                <input type="text" value={editForm.father_name || ''} onChange={(e) => setEditForm({...editForm, father_name: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Program / Category:</label>
                <select value={editForm.category || ''} onChange={(e) => setEditForm({...editForm, category: e.target.value})} style={{ width: '100%', padding: '8px' }}>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Current Semester:</label>
                <select value={editForm.semester || ''} onChange={(e) => setEditForm({...editForm, semester: e.target.value})} style={{ width: '100%', padding: '8px' }}>
                  {semesters.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Phone Number:</label>
                <input type="text" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Update Photo:</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '5px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" disabled={saving} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setEditingStudent(null)} style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}