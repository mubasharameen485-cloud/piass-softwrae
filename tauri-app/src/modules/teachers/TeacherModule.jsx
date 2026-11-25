import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function TeacherModule() {
  const [formData, setFormData] = useState({
    teacher_id: '',
    full_name: '',
    father_name: '',
    gender: 'Male',
    age: '',
    degree: '',
    subject: '',
    experience: '',
    password: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let imageUrl = '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `teacher_${Date.now()}_${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('campus_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from('campus_images')
          .getPublicUrl(fileName);

        imageUrl = publicURLData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from('teachers')
        .insert([{ ...formData, age: parseInt(formData.age) || 0, image_url: imageUrl }]);

      if (insertError) throw insertError;

      setMessage('✅ Teacher Registered Successfully with Image!');
      setFormData({
        teacher_id: '', full_name: '', father_name: '', gender: 'Male',
        age: '', degree: '', subject: '', experience: '', password: ''
      });
      setImageFile(null);
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      <h2>👨‍🏫 Teacher Registration Form (With Photo)</h2>
      <form onSubmit={handleRegister} style={{ background: '#fff', padding: '20px', border: '1px solid #ddd', borderRadius: '6px', display: 'grid', gap: '12px' }}>
        {message && <p style={{ fontWeight: 'bold' }}>{message}</p>}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="text" name="teacher_id" placeholder="Teacher ID (e.g. T-101)" value={formData.teacher_id} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required style={{ padding: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="text" name="father_name" placeholder="Father Name" value={formData.father_name} onChange={handleChange} required style={{ padding: '8px' }} />
          <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '8px' }}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="text" name="degree" placeholder="Highest Degree (e.g. M.Phil / PhD)" value={formData.degree} onChange={handleChange} required style={{ padding: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <input type="text" name="subject" placeholder="Assigned Subject" value={formData.subject} onChange={handleChange} required style={{ padding: '8px' }} />
          <input type="text" name="experience" placeholder="Experience (e.g. 5 Years)" value={formData.experience} onChange={handleChange} required style={{ padding: '8px' }} />
        </div>

        <div>
          <label>Teacher Profile Photo:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', padding: '6px', background: '#fff' }} />
        </div>

        <div>
          <input type="password" name="password" placeholder="Password (For future dashboard)" value={formData.password} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0f766e', color: 'white', padding: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
          {loading ? 'Uploading & Saving...' : 'Register Teacher'}
        </button>
      </form>
    </div>
  );
}