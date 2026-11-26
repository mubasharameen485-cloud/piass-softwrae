import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function CertificateHub() {
  const [subTab, setSubTab] = useState('generate'); // 'generate' or 'history'
  const [studentName, setStudentName] = useState('');
  const [certType, setCertType] = useState('Degree / Course Completion Certificate');
  const [message, setMessage] = useState('For successfully completing academic requirements with distinction.');
  const [issuedList, setIssuedList] = useState([]);
  const [previewCert, setPreviewCert] = useState(null);

  const fetchHistory = async () => {
    const { data } = await supabase.from('issued_certificates').select('*').order('issue_date', { ascending: false });
    setIssuedList(data || []);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const payload = { student_name: studentName, certificate_type: certType, message };
      const { error } = await supabase.from('issued_certificates').insert([payload]);
      if (error) throw error;
      
      setPreviewCert(payload);
      alert('✅ Certificate generated & saved to archive!');
      fetchHistory();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>🎓 Certificate & Degree Generator</h2>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }} className="no-print">
        <button onClick={() => { setSubTab('generate'); setPreviewCert(null); }} style={{ padding: '10px 15px', background: subTab === 'generate' ? '#0f766e' : '#e2e8f0', color: subTab === 'generate' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ✨ Generate New Certificate
        </button>
        <button onClick={() => setSubTab('history')} style={{ padding: '10px 15px', background: subTab === 'history' ? '#0f766e' : '#e2e8f0', color: subTab === 'history' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          🗂️ Past Issued Certificates Archive
        </button>
      </div>

      {/* 1. GENERATE FORM */}
      {subTab === 'generate' && !previewCert && (
        <form onSubmit={handleGenerate} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>Create Official Certificate / Degree</h3>
          <div>
            <label style={{ fontWeight: 'bold' }}>Student Name:</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Ali Ahmed" required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Certificate / Degree Title:</label>
            <input type="text" value={certType} onChange={(e) => setCertType(e.target.value)} placeholder="e.g. BS Computer Science Degree / Annual Sports Award" required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Custom Message / Description:</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows="3" required style={{ width: '100%', padding: '10px', marginTop: '5px' }}></textarea>
          </div>
          <button type="submit" style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Generate Certificate Preview</button>
        </form>
      )}

      {/* CERTIFICATE PREVIEW & PRINTABLE TEMPLATE */}
      {previewCert && (
        <div style={{ background: '#fff', padding: '40px', borderRadius: '8px', border: '8px double #0f766e', textAlign: 'center', margin: '20px 0', position: 'relative' }}>
          <h1 style={{ color: '#0f766e', margin: '0 0 5px 0', fontSize: '2rem' }}>PIASS COLLEGE OF NURSING & IT</h1>
          <p style={{ margin: '0 0 30px 0', color: '#555', letterSpacing: '2px' }}>OFFICIAL CERTIFICATE OF RECOGNITION</p>
          
          <p style={{ fontSize: '1.1rem', fontStyle: 'italic', margin: '20px 0' }}>This is proudly presented to</p>
          <h2 style={{ fontSize: '2.5rem', color: '#1e293b', borderBottom: '2px solid #0f766e', display: 'inline-block', paddingBottom: '5px', margin: '10px 0 20px 0' }}>{previewCert.student_name}</h2>
          
          <h3 style={{ color: '#2563eb', margin: '15px 0' }}>{previewCert.certificate_type}</h3>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6', color: '#334155' }}>{previewCert.message}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '0 40px' }}>
            <div>
              <p style={{ borderTop: '1px solid #000', paddingTop: '5px', margin: 0 }}>Date Issued: {new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ borderTop: '1px solid #000', paddingTop: '5px', margin: 0 }}><b>Director Signature</b></p>
            </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center' }} className="no-print">
            <button onClick={() => window.print()} style={{ background: '#16a34a', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>🖨️ Print Certificate</button>
            <button onClick={() => setPreviewCert(null)} style={{ background: '#64748b', color: 'white', padding: '10px 20px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Create Another</button>
          </div>
        </div>
      )}

      {/* 2. PAST ISSUED CERTIFICATES ARCHIVE */}
      {subTab === 'history' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🗂️ Past Issued Certificates Archive</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Student Name</th><th>Certificate / Degree Type</th><th>Message</th><th>Date Issued</th><th>Action</th></tr>
            </thead>
            <tbody>
              {issuedList.length > 0 ? issuedList.map(c => (
                <tr key={c.id}>
                  <td><b>{c.student_name}</b></td>
                  <td>{c.certificate_type}</td>
                  <td>{c.message}</td>
                  <td>{new Date(c.issue_date).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => { setPreviewCert(c); setSubTab('generate'); }} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>View / Print</button>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No past certificates found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}