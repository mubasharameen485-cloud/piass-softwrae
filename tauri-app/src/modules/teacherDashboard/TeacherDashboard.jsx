import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function TeacherDashboard({ teacherId, teacherName, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teacher_messages')
        .select('*')
        .or(`teacher_id.eq.ALL,teacher_id.eq.${teacherId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);

      // Mark unread messages as read
      await supabase
        .from('teacher_messages')
        .update({ status: 'Read' })
        .eq('teacher_id', teacherId)
        .eq('status', 'Unread');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMessages();
  }, [teacherId]);

  const unreadCount = messages.filter(m => m.status === 'Unread').length;

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f766e', color: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0 }}>👨‍🏫 Welcome, {teacherName}</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#99f6e4' }}>Teacher ID: {teacherId}</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <span style={{ background: '#22c55e', color: 'white', padding: '5px 10px', borderRadius: '50%', fontWeight: 'bold', fontSize: '0.85rem' }} title="Unread Notifications">
              {unreadCount} 🟢
            </span>
          )}
          <button onClick={onLogout} style={{ background: '#dc2626', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout
          </button>
        </div>
      </div>

      <h3>📥 Director Notices & Assigned Timetables</h3>
      {loading ? <p>Loading messages...</p> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {messages.length > 0 ? messages.map(m => (
            <div key={m.id} style={{ background: '#fff', borderLeft: m.status === 'Unread' ? '5px solid #22c55e' : '5px solid #0f766e', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📅 {new Date(m.created_at).toLocaleString()}</span>
                {m.is_timetable && <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>⏰ Period: {m.period_time}</span>}
              </div>
              <h4 style={{ margin: '0 0 8px 0', color: '#0f766e' }}>{m.title}</h4>
              <p style={{ margin: '0 0 10px 0', color: '#334155', lineHeight: '1.5' }}>{m.message}</p>
              {m.image_url && <img src={m.image_url} alt="" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '6px', objectFit: 'cover' }} />}
            </div>
          )) : (
            <p style={{ color: '#64748b' }}>No notices or messages found.</p>
          )}
        </div>
      )}
    </div>
  );
}