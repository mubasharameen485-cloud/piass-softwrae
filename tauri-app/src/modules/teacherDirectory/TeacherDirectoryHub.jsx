import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function TeacherDirectoryHub() {
  const [mode, setMode] = useState('menu'); // 'menu', 'list', 'manage'
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [editingTeacher, setEditingTeacher] = useState(null);
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

  // Proper Delete from database
  const handleDeleteTeacher = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this teacher from database?")) return;
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
      alert('✅ Teacher deleted successfully!');
      fetchTeachers();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Handle Edit Submit
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = editForm.image_url;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `teacher_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('campus_images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicURLData } = supabase.storage.from('campus_images').getPublicUrl(fileName);
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

      alert('✅ Teacher details updated successfully!');
      setEditingTeacher(null);
      setImageFile(null);
      fetchTeachers();
    } catch (err) {
      alert('❌ Error updating: ' + err.message);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.full_name.toLowerCase().includes(search.toLowerCase()) ||
    t.teacher_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>👨‍🏫 Teachers Directory Hub</h2>

      {/* STEP 1: TWO MAIN BUTTONS MENU */}
      {mode === 'menu' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
          <div 
            onClick={() => setMode('list')} 
            style={{ background: '#0f766e', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.3rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            📋 Show All Teachers
          </div>
          <div 
            onClick={() => setMode('manage')} 
            style={{ background: '#2563eb', color: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '1.3rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            ⚙️ Edit / Delete Teachers
          </div>
        </div>
      )}

      {/* BACK TO MENU BUTTON */}
      {mode !== 'menu' && (
        <button onClick={() => { setMode('menu'); setEditingTeacher(null); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '20px' }}>
          ← Back to Teacher Menu
        </button>
      )}

      {/* STEP 2: SHOW ALL TEACHERS LIST VIEW */}
      {mode === 'list' && (
        <div>
          <h3>All Active Teachers</h3>
          <input 
            type="text" 
            placeholder="Search teachers..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '10px', margin: '15px 0' }}
          />
          {loading ? <p>Loading...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              {filteredTeachers.map(t => (
                <div key={t.id} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {t.image_url ? (
                    <img src={t.image_url} alt="" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#cbd5e1', marginBottom: '10px' }}></div>
                  )}
                  <h4 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>{t.full_name}</h4>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>ID: <b>{t.teacher_id}</b></p>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Subject: {t.subject}</p>
                  <p style={{ margin: '2px 0', fontSize: '0.85rem' }}>Experience: <b>{calculateExperience(t.joining_date)}</b></p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: EDIT / DELETE MANAGEMENT VIEW */}
      {mode === 'manage' && !editingTeacher && (
        <div>
          <h3>Manage Teachers (Edit or Delete)</h3>
          <input 
            type="text" 
            placeholder="Search by name or ID to edit/delete..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ width: '100%', padding: '10px', margin: '15px 0' }}
          />
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th>Photo</th>
                <th>ID</th>
                <th>Name</th>
                <th>Subject</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(t => (
                <tr key={t.id}>
                  <td style={{ textAlign: 'center' }}>
                    {t.image_url ? <img src={t.image_url} alt="" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} /> : 'No Pic'}
                  </td>
                  <td><b>{t.teacher_id}</b></td>
                  <td>{t.full_name}</td>
                  <td>{t.subject}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setEditingTeacher(t); setEditForm(t); }} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Edit</button>
                      <button onClick={() => handleDeleteTeacher(t.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* EDIT MODAL / FORM */}
      {editingTeacher && (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '20px' }}>
          <h3>✏️ Edit Teacher: {editingTeacher.full_name}</h3>
          <form onSubmit={handleUpdateSubmit} style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Full Name:</label>
                <input type="text" value={editForm.full_name || ''} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Father Name:</label>
                <input type="text" value={editForm.father_name || ''} onChange={(e) => setEditForm({...editForm, father_name: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Subject:</label>
                <input type="text" value={editForm.subject || ''} onChange={(e) => setEditForm({...editForm, subject: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Degree:</label>
                <input type="text" value={editForm.degree || ''} onChange={(e) => setEditForm({...editForm, degree: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Experience Note:</label>
                <input type="text" value={editForm.experience || ''} onChange={(e) => setEditForm({...editForm, experience: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
              <div>
                <label>Age:</label>
                <input type="number" value={editForm.age || ''} onChange={(e) => setEditForm({...editForm, age: e.target.value})} required style={{ width: '100%', padding: '8px' }} />
              </div>
            </div>

            <div>
              <label>Update Photo:</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '5px' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Save Changes</button>
              <button type="button" onClick={() => setEditingTeacher(null)} style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}