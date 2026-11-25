import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function StudentForm({ onStudentAdded }) {
  const [formData, setFormData] = useState({
    roll_no: '',
    full_name: '',
    father_name: '',
    category: 'BS Nursing - BSN',
    semester: '1st Semester',
    phone: '',
    email: '',
    admission_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
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

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = '';

      // 1. Upload Image to Supabase Storage if selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campus_images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: publicURLData } = supabase.storage
          .from('campus_images')
          .getPublicUrl(filePath);

        imageUrl = publicURLData.publicUrl;
      }

      // 2. Insert Student into Database
      const { error: insertError } = await supabase
        .from('students')
        .insert([{ ...formData, image_url: imageUrl }]);

      if (insertError) throw insertError;

      setMessage('✅ Student Admission & Image Upload Successful!');
      setFormData({
        roll_no: '',
        full_name: '',
        father_name: '',
        category: 'BS Nursing - BSN',
        semester: '1st Semester',
        phone: '',
        email: '',
        admission_date: new Date().toISOString().split('T')[0],
        status: 'Active'
      });
      setImageFile(null);
      if (onStudentAdded) onStudentAdded();
    } catch (error) {
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px', maxWidth: '600px', margin: '20px auto', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h2>🎓 New Student Admission (With Image & Semester)</h2>
      {message && <p style={{ fontWeight: 'bold' }}>{message}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label>Roll Number / ID:</label>
          <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Full Name:</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div>
          <label>Father Name:</label>
          <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label>Program / Category:</label>
            <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Current Semester:</label>
            <select name="semester" value={formData.semester} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
              {semesters.map((sem, index) => (
                <option key={index} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label>Phone Number:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>

        <div>
          <label>Student Passport Size Photo:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '6px', background: '#fff' }} />
        </div>

        <div>
          <label>Admission Date:</label>
          <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0f766e', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {loading ? 'Uploading & Registering...' : 'Register Student'}
        </button>
      </form>
    </div>
  );
}