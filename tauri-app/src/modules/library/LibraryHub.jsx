import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';

export default function LibraryHub() {
  const [subTab, setSubTab] = useState('active'); // 'active', 'issue', 'history'
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Issue Form State
  const [studentName, setStudentName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [returnDueDate, setReturnDueDate] = useState('');

  const fetchBooks = async () => {
    setLoading(true);
    const { data } = await supabase.from('library_books').select('*').order('issue_date', { ascending: false });
    setIssuedBooks((data || []).filter(b => b.status === 'Issued'));
    setHistoryBooks((data || []).filter(b => b.status === 'Returned'));
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('library_books').insert([{
        student_name: studentName,
        roll_no: rollNo,
        book_title: bookTitle,
        return_due_date: returnDueDate,
        status: 'Issued'
      }]);
      if (error) throw error;
      alert('✅ Book issued successfully!');
      setStudentName(''); setRollNo(''); setBookTitle(''); setReturnDueDate('');
      setSubTab('active');
      fetchBooks();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Return Book (Soft return / Archive history)
  const handleReturnBook = async (id) => {
    if (!window.confirm("Mark this book as returned?")) return;
    try {
      await supabase.from('library_books').update({ status: 'Returned' }).eq('id', id);
      alert('✅ Book returned and archived in history!');
      fetchBooks();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  // Permanent Delete from active list
  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete record permanently?")) return;
    await supabase.from('library_books').delete().eq('id', id);
    fetchBooks();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <h2>📚 University Library Management System</h2>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
        <button onClick={() => setSubTab('active')} style={{ padding: '10px 15px', background: subTab === 'active' ? '#0f766e' : '#e2e8f0', color: subTab === 'active' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          📖 Currently Issued Books
        </button>
        <button onClick={() => setSubTab('issue')} style={{ padding: '10px 15px', background: subTab === 'issue' ? '#0f766e' : '#e2e8f0', color: subTab === 'issue' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          ➕ Issue New Book
        </button>
        <button onClick={() => setSubTab('history')} style={{ padding: '10px 15px', background: subTab === 'history' ? '#0f766e' : '#e2e8f0', color: subTab === 'history' ? '#fff' : '#333', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          🗂️ Past / Returned Books History
        </button>
      </div>

      {/* 1. ACTIVE ISSUED BOOKS */}
      {subTab === 'active' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>Currently Issued Books</h3>
          {loading ? <p>Loading...</p> : (
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Student Name</th><th>Book Title</th><th>Issue Date</th><th>Due Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {issuedBooks.length > 0 ? issuedBooks.map(b => (
                  <tr key={b.id}>
                    <td><b>{b.roll_no}</b></td>
                    <td>{b.student_name}</td>
                    <td>{b.book_title}</td>
                    <td>{b.issue_date}</td>
                    <td style={{ color: 'red', fontWeight: 'bold' }}>{b.return_due_date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleReturnBook(b.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Return Book</button>
                        <button onClick={() => handleDeleteBook(b.id)} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" style={{ textAlign: 'center' }}>No books currently issued.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 2. ISSUE BOOK FORM */}
      {subTab === 'issue' && (
        <form onSubmit={handleIssueBook} style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'grid', gap: '15px' }}>
          <h3>Issue Book to Student</h3>
          <div>
            <label style={{ fontWeight: 'bold' }}>Student Name:</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Student Roll Number:</label>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Book Title:</label>
            <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold' }}>Return Due Date:</label>
            <input type="date" value={returnDueDate} onChange={(e) => setReturnDueDate(e.target.value)} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ background: '#0f766e', color: 'white', padding: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>Issue Book</button>
        </form>
      )}

      {/* 3. PAST / RETURNED HISTORY */}
      {subTab === 'history' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h3>🗂️ Library Archive (Returned Books History)</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}><th>Roll No</th><th>Student Name</th><th>Book Title</th><th>Issue Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {historyBooks.length > 0 ? historyBooks.map(b => (
                <tr key={b.id}>
                  <td><b>{b.roll_no}</b></td>
                  <td>{b.student_name}</td>
                  <td>{b.book_title}</td>
                  <td>{b.issue_date}</td>
                  <td style={{ color: 'green', fontWeight: 'bold' }}>Returned</td>
                </tr>
              )) : <tr><td colSpan="5" style={{ textAlign: 'center' }}>No archive records found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}