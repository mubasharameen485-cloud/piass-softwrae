import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';

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
        .insert([{ 
          ...formData, 
          age: parseInt(formData.age) || 0, 
          image_url: imageUrl,
          joining_date: new Date().toISOString().split('T')[0],
          status: 'Active'
        }]);

      if (insertError) throw insertError;

      setMessage('Teacher registered successfully with photo.');
      setFormData({
        teacher_id: '', full_name: '', father_name: '', gender: 'Male',
        age: '', degree: '', subject: '', experience: '', password: ''
      });
      setImageFile(null);
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const moduleContent = (
    <div className="mx-auto max-w-2xl px-2">
      <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
        <header className="mb-6 border-b border-slate-200 pb-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
          <h1 className="text-2xl font-black text-[#062b55]">Teacher Registration Form</h1>
        </header>

        <form onSubmit={handleRegister} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {message && <div className="sm:col-span-2 rounded-xl bg-slate-100 p-3 text-sm font-bold text-[#062b55]">{message}</div>}
          
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Teacher ID:</label>
            <input type="text" name="teacher_id" placeholder="e.g. T-101" value={formData.teacher_id} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Full Name:</label>
            <input type="text" name="full_name" placeholder="Full Name" value={formData.full_name} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Father Name:</label>
            <input type="text" name="father_name" placeholder="Father Name" value={formData.father_name} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Gender:</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Age:</label>
            <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Highest Degree:</label>
            <input type="text" name="degree" placeholder="e.g. M.Phil / PhD" value={formData.degree} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Assigned Subject:</label>
            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Experience:</label>
            <input type="text" name="experience" placeholder="e.g. 5 Years" value={formData.experience} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Teacher Profile Photo:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm font-semibold text-slate-800" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Password (For Portal Login):</label>
            <input type="password" name="password" placeholder="********" value={formData.password} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
          </div>

          <div className="sm:col-span-2 mt-4">
            <button type="submit" disabled={loading} className="w-full cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3e78]">
              {loading ? 'Processing Registration...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="screen-report-only h-full w-full">
      <Background>{moduleContent}</Background>
    </div>
  );
}