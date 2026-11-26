import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function BroadcastHub() {
  const [messages, setMessages] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [targetType, setTargetType] = useState('ALL'); // 'ALL' or specific teacher_id
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isTimetable, setIsTimetable] = useState(false);
  const [periodTime, setPeriodTime] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: msgData } = await supabase.from('teacher_messages').select('*').order('created_at', { ascending: false });
    const { data: tData } = await supabase.from('teachers').select('teacher_id, full_name');
    setMessages(msgData || []);
    setTeachers(tData || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const fileName = `bc_${Date.now()}.${imageFile.name.split('.').pop()}`;
        await supabase.storage.from('campus_images').upload(fileName, imageFile);
        const { data } = supabase.storage.from('campus_images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      await supabase.from('teacher_messages').insert([{
        teacher_id: targetType,
        title,
        message,
        image_url: imageUrl,
        is_timetable: isTimetable,
        period_time: periodTime,
        status: 'Unread'
      }]);

      alert('✅ Broadcast / Timetable sent successfully to teacher(s)!');
      setTitle(''); setMessage(''); setPeriodTime(''); setImageFile(null); setIsTimetable(false);
      fetchData();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    await supabase.from('teacher_messages').delete().eq('id', id);
    fetchData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📢 Teachers Broadcast, Message & Timetable Hub</h2>

      <form onSubmit={handleSend} style={{ background: '#fff', padding: '20px', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'grid', gap: '12px', marginBottom: '30px' }}>
        <h3>Send Notice / Timetable Period</h3>
        
        <div>
          <label style={{ fontWeight: 'bold' }}>Send To:</label>
          <select value={targetType} onChange={(e) => setTargetType(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="ALL">📢 Broadcast to ALL Teachers</option>
            {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>👤 {t.full_name} ({t.teacher_id})</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Urgent Meeting / Period Assignment" required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Message / Details:</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type message here..." rows="3" required style={{ width: '100%', padding: '8px', marginTop: '5px' }}></textarea>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
          <label style={{ fontWeight: 'bold' }}>
            <input type="checkbox" checked={isTimetable} onChange={(e) => setIsTimetable(e.target.checked)} style={{ marginRight: '5px' }} />
            Is this a Timetable / Period Assignment?
          </label>
          {isTimetable && (
            <input type="text" value={periodTime} onChange={(e) => setPeriodTime(e.target.value)} placeholder="Time e.g. 10:00 AM - 11:00 AM" style={{ padding: '6px' }} />
          )}
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>Attach Image (Optional):</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={{ width: '100%', padding: '5px', marginTop: '5px' }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
          {loading ? 'Sending...' : 'Send Broadcast Message'}
        </button>
      </form>

      <h3>History of Sent Messages & Timetables</h3>
      <div style={{ display: 'grid', gap: '10px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#64748b' }}>Target: <b>{m.teacher_id}</b> | Date: {new Date(m.created_at).toLocaleString()}</p>
              <h4 style={{ margin: '0 0 5px 0', color: '#0f766e' }}>{m.title} {m.is_timetable && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', fontSize: '0.75rem', borderRadius: '4px' }}>Timetable: {m.period_time}</span>}</h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{m.message}</p>
              {m.image_url && <img src={m.image_url} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', marginTop: '8px', borderRadius: '4px' }} />}
            </div>
            <button onClick={() => handleDelete(m.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}