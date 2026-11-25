import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { supabase } from '../../services/supabaseClient';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try via Rust backend command
      const response = await invoke('login_backend', { username, pass: password });
      if (response.success) {
        onLoginSuccess(response); // Pass user info (role, name, identifier) to App.jsx
      }
    } catch (err) {
      // Fallback direct check if rust fails in local testing
      try {
        if (username === 'admin' && password === 'admin123') {
          onLoginSuccess({ success: true, role: 'admin', full_name: 'System Admin', identifier: 'admin' });
          return;
        }
        // Check teacher direct supabase
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('teacher_id', username)
          .eq('password', password)
          .single();
        
        if (error || !data) throw new Error('Invalid Credentials');
        onLoginSuccess({ success: true, role: 'teacher', full_name: data.full_name, identifier: data.teacher_id });
      } catch (fallbackErr) {
        setError('❌ Invalid Username/ID or Password!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#0f766e' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', display: 'grid', gap: '15px' }}>
        <h2 style={{ textAlign: 'center', color: '#0f766e', margin: 0 }}>🎓 Piass Campus Login</h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', margin: 0 }}>Enter your credentials to access system</p>
        
        {error && <p style={{ color: 'red', fontSize: '0.9rem', margin: 0, textAlign: 'center' }}>{error}</p>}

        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Username / Teacher ID:</label>
          <input type="text" placeholder="admin or T-101" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }} />
        </div>

        <div>
          <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Password:</label>
          <input type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box' }} />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>
          {loading ? 'Authenticating...' : 'Login'}
        </button>
      </form>
    </div>
  );
}