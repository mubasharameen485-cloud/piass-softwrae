import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';

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
    "BS Nursing - BSN", "Post RN", "Doctor of Physiotherapy (DPT)", "LHV Diploma", 
    "CMW Diploma", "CNA Program", "BS Computer Science", "BS Information Tech", 
    "BBA (Business Admin)", "BS English Literature", "ADP Computer Science", 
    "ADP Information Tech", "ADP Business Admin", "ADP English", "Lateral 5th Sem Entry"
  ];

  const semesters = [
    "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
    "5th Semester", "6th Semester", "7th Semester", "8th Semester"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let imageUrl = '';
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('campus_images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicURLData } = supabase.storage.from('campus_images').getPublicUrl(fileName);
        imageUrl = publicURLData.publicUrl;
      }

      const { error: insertError } = await supabase.from('students').insert([{ ...formData, image_url: imageUrl }]);
      if (insertError) throw insertError;

      setMessage('Student admission and record registered successfully.');
      setFormData({
        roll_no: '', full_name: '', father_name: '', category: 'BS Nursing - BSN',
        semester: '1st Semester', phone: '', email: '', admission_date: new Date().toISOString().split('T')[0], status: 'Active'
      });
      setImageFile(null);
      if (onStudentAdded) onStudentAdded();
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen-report-only h-full w-full">
      <Background>
        <div className="mx-auto max-w-3xl px-2">
          <div className="rounded-2xl border border-slate-300 bg-white p-8 shadow-sm">
            <header className="mb-6 border-b border-slate-200 pb-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
              <h1 className="text-2xl font-black text-[#062b55]">New Student Admission</h1>
            </header>

            {message && <p className="mb-4 rounded-xl bg-slate-100 p-3 text-sm font-bold text-[#062b55]">{message}</p>}
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Roll Number / ID:</label>
                <input type="text" name="roll_no" value={formData.roll_no} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Full Name:</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Father Name:</label>
                <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Program / Category:</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
                  {categories.map((cat, index) => <option key={index} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Current Semester:</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">
                  {semesters.map((sem, index) => <option key={index} value={sem}>{sem}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Phone Number:</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Admission Date:</label>
                <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Photo:</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2.5 text-sm font-semibold text-slate-800" />
              </div>

              <div className="sm:col-span-2 mt-4">
                <button type="submit" disabled={loading} className="w-full cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0b3e78]">
                  {loading ? 'Processing Registration...' : 'Complete Student Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Background>
    </div>
  );
}