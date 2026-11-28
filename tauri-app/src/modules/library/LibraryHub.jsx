import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import Background from '../reports/Background';
import Print from '../reports/Print';

export default function LibraryHub() {
  const [subTab, setSubTab] = useState('active'); // 'active', 'issue', 'history'
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [historyBooks, setHistoryBooks] = useState([]);
  const [loading, setLoading] = useState(false);

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
      alert('Book issued successfully.');
      setStudentName(''); setRollNo(''); setBookTitle(''); setReturnDueDate('');
      setSubTab('active');
      fetchBooks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleReturnBook = async (id) => {
    if (!window.confirm("Mark this book as returned?")) return;
    try {
      await supabase.from('library_books').update({ status: 'Returned' }).eq('id', id);
      alert('Book returned and archived in history.');
      fetchBooks();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete record permanently?")) return;
    await supabase.from('library_books').delete().eq('id', id);
    fetchBooks();
  };

  const libraryPrintContent = (
    <div className="text-slate-900 font-medium p-4">
      <header className="mb-6 border-b-2 border-slate-300 pb-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#078343]">Official Library Statement</p>
        <h2 className="mt-1 text-2xl font-black text-[#062b55]">PIASS College of Nursing & IT</h2>
        <p className="text-xs font-semibold text-slate-500 mt-1">Generated: {new Date().toLocaleString('en-PK')}</p>
      </header>

      <table className="w-full border-collapse text-left text-sm mb-8">
        <thead className="bg-[#062b55] text-white">
          <tr>
            <th className="px-4 py-3 font-bold">Roll No</th>
            <th className="px-4 py-3 font-bold">Student Name</th>
            <th className="px-4 py-3 font-bold">Book Title</th>
            <th className="px-4 py-3 font-bold">Issue Date</th>
            <th className="px-4 py-3 font-bold">Due Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 font-semibold">
          {issuedBooks.length > 0 ? issuedBooks.map(b => (
            <tr key={b.id}>
              <td className="px-4 py-3">{b.roll_no}</td>
              <td className="px-4 py-3">{b.student_name}</td>
              <td className="px-4 py-3">{b.book_title}</td>
              <td className="px-4 py-3">{b.issue_date}</td>
              <td className="px-4 py-3 text-red-600 font-bold">{b.return_due_date}</td>
            </tr>
          )) : <tr><td colSpan="5" className="p-6 text-center font-bold text-slate-400">No active issued books found.</td></tr>}
        </tbody>
      </table>

      <div className="flex justify-between mt-32 pt-4 border-t border-slate-400 text-sm font-bold">
        <p>Library Incharge Signature</p>
        <p>Authorized Principal / Registrar Stamp</p>
      </div>
    </div>
  );

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4 flex justify-between items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
          <h1 className="text-2xl font-black text-[#062b55]">University Library Management</h1>
        </div>
        <button onClick={() => window.print()} className="cursor-pointer bg-[#062b55] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-[#0b3e78] no-print">
          Print Active Books Report
        </button>
      </header>

      {/* Sub Tabs */}
      <div className="flex gap-3 mb-6 no-print">
        <button onClick={() => setSubTab('active')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${subTab === 'active' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
          Currently Issued Books
        </button>
        <button onClick={() => setSubTab('issue')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${subTab === 'issue' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
          Issue New Book
        </button>
        <button onClick={() => setSubTab('history')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${subTab === 'history' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700'}`}>
          Returned Books History
        </button>
      </div>

      {subTab === 'active' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-[#062b55] mb-4">Currently Issued Books</h3>
          {loading ? <p className="font-bold">Loading...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-[#062b55] text-white">
                  <tr>
                    <th className="px-4 py-3 font-bold">Roll No</th>
                    <th className="px-4 py-3 font-bold">Student Name</th>
                    <th className="px-4 py-3 font-bold">Book Title</th>
                    <th className="px-4 py-3 font-bold">Issue Date</th>
                    <th className="px-4 py-3 font-bold">Due Date</th>
                    <th className="px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {issuedBooks.length > 0 ? issuedBooks.map(b => (
                    <tr key={b.id} className="font-semibold">
                      <td className="px-4 py-3 text-slate-900">{b.roll_no}</td>
                      <td className="px-4 py-3 text-slate-900">{b.student_name}</td>
                      <td className="px-4 py-3 text-slate-800">{b.book_title}</td>
                      <td className="px-4 py-3 text-slate-800">{b.issue_date}</td>
                      <td className="px-4 py-3 text-red-600 font-bold">{b.return_due_date}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleReturnBook(b.id)} className="cursor-pointer bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700">Return</button>
                          <button onClick={() => handleDeleteBook(b.id)} className="cursor-pointer bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs hover:bg-red-700">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )) : <tr><td colSpan="6" className="p-8 text-center font-bold text-slate-400">No books currently issued.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'issue' && (
        <form onSubmit={handleIssueBook} className="rounded-2xl border border-slate-300 bg-white p-8 shadow-xs grid gap-4 max-w-xl">
          <h3 className="text-lg font-black text-[#062b55]">Issue Book to Student</h3>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Name:</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Student Roll Number:</label>
            <input type="text" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Book Title:</label>
            <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-[#062b55] mb-1">Return Due Date:</label>
            <input type="date" value={returnDueDate} onChange={(e) => setReturnDueDate(e.target.value)} required className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold" />
          </div>
          <button type="submit" className="cursor-pointer rounded-xl bg-[#062b55] px-6 py-3.5 font-black text-white shadow-sm mt-2">Issue Book</button>
        </form>
      )}

      {subTab === 'history' && (
        <div className="rounded-2xl border border-slate-300 bg-white p-6 shadow-xs">
          <h3 className="text-base font-black text-[#062b55] mb-4">Library Archive (Returned Books History)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#062b55] text-white">
                <tr>
                  <th className="px-4 py-3 font-bold">Roll No</th>
                  <th className="px-4 py-3 font-bold">Student Name</th>
                  <th className="px-4 py-3 font-bold">Book Title</th>
                  <th className="px-4 py-3 font-bold">Issue Date</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {historyBooks.length > 0 ? historyBooks.map(b => (
                  <tr key={b.id} className="font-semibold">
                    <td className="px-4 py-3 text-slate-900">{b.roll_no}</td>
                    <td className="px-4 py-3 text-slate-900">{b.student_name}</td>
                    <td className="px-4 py-3 text-slate-800">{b.book_title}</td>
                    <td className="px-4 py-3 text-slate-800">{b.issue_date}</td>
                    <td className="px-4 py-3 text-emerald-700 font-bold">Returned</td>
                  </tr>
                )) : <tr><td colSpan="5" className="p-8 text-center font-bold text-slate-400">No archive records found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>{hubContent}</Background>
      </div>
      <Print title="PIASS Library Report">{libraryPrintContent}</Print>
    </>
  );
}