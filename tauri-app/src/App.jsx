import React, { useState } from 'react';
import Login from './modules/auth/Login';
import StudentForm from './modules/students/StudentForm';
import StudentList from './modules/students/StudentList';
import StudentManageHub from './modules/students/StudentManageHub';
import FeeManager from './modules/fees/FeeManager';
import TeacherModule from './modules/teachers/TeacherModule';
import TeacherPaymentManager from './modules/teachers/TeacherPaymentManager';
import ReportManager from './modules/reports/ReportManager';
import TeacherDashboard from './modules/teacherDashboard/TeacherDashboard';
import TeacherDirectoryHub from './modules/teacherDirectory/TeacherDirectoryHub';
import ArchiveHub from './modules/archiveRecords/ArchiveHub';
import BroadcastHub from './modules/broadcast/BroadcastHub';
import AttendanceHub from './modules/attendance/AttendanceHub';

import LibraryHub from './modules/library/LibraryHub';
import CertificateHub from './modules/certificates/CertificateHub';
import ExamHub from './modules/exams/ExamHub';
import ResultHub from './modules/results/ResultHub';

import AdminDashboardHub from './modules/adminDashboard/AdminDashboardHub';






export default function App(){
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('reports');

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  if (user.role === 'teacher') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <TeacherDashboard 
          teacherId={user.identifier} 
          teacherName={user.full_name} 
          onLogout={() => setUser(null)} 
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', background: '#0f766e', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #115e59', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>🎓 Piass ERP</h2>
            <p style={{ fontSize: '0.8rem', color: '#99f6e4', margin: '5px 0 0 0' }}>Admin: {user.full_name}</p>
          </div>
          <button onClick={() => setUser(null)} title="Logout" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
            Logout
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '20px', padding: '0 10px' }}>
          <button onClick={() => setActiveTab('reports')} style={{ textAlign: 'left', background: activeTab === 'reports' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📊 Daily / Monthly Reports</button>
          <button onClick={() => setActiveTab('attendance')} style={{ textAlign: 'left', background: activeTab === 'attendance' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📌 Attendance System</button>
          <button onClick={() => setActiveTab('broadcast')} style={{ textAlign: 'left', background: activeTab === 'broadcast' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📢 Teachers Broadcast</button>
          <button onClick={() => setActiveTab('fees')} style={{ textAlign: 'left', background: activeTab === 'fees' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💰 Fee Management</button>
          <button onClick={() => setActiveTab('admission')} style={{ textAlign: 'left', background: activeTab === 'admission' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📝 New Admission</button>
          <button onClick={() => setActiveTab('students')} style={{ textAlign: 'left', background: activeTab === 'students' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📋 Student Directory</button>
          <button onClick={() => setActiveTab('manage-students')} style={{ textAlign: 'left', background: activeTab === 'manage-students' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>⚙️ Manage & Promote Hub</button>
          <button onClick={() => setActiveTab('teachers')} style={{ textAlign: 'left', background: activeTab === 'teachers' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>👨‍🏫 Teacher Registration</button>
          <button onClick={() => setActiveTab('teacher-directory')} style={{ textAlign: 'left', background: activeTab === 'teacher-directory' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📁 Teachers Directory</button>
          <button onClick={() => setActiveTab('teacher-salary')} style={{ textAlign: 'left', background: activeTab === 'teacher-salary' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💵 Teacher Salaries</button>
          <button onClick={() => setActiveTab('archive')} style={{ textAlign: 'left', background: activeTab === 'archive' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗂️ Past / Archive Records</button>
        
        <button onClick={() => setActiveTab('library')} style={{ textAlign: 'left', background: activeTab === 'library' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📚 Library Management</button>
<button onClick={() => setActiveTab('certificates')} style={{ textAlign: 'left', background: activeTab === 'certificates' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🎓 Certificate & Degree Hub</button>
<button onClick={() => setActiveTab('exams')} style={{ textAlign: 'left', background: activeTab === 'exams' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📝 Exams & Assessment Hub</button>
        <button onClick={() => setActiveTab('results')} style={{ textAlign: 'left', background: activeTab === 'results' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📊 Result & Grading Hub</button>
        <button onClick={() => setActiveTab('admin-dash')} style={{ textAlign: 'left', background: activeTab === 'admin-dash' ? '#115e59' : 'transparent', color: 'white', border: 'none', padding: '12px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🛡️ Admin Control & Audit</button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {activeTab === 'reports' && <ReportManager />}
        {activeTab === 'attendance' && <AttendanceHub />}
        {activeTab === 'broadcast' && <BroadcastHub />}
        {activeTab === 'fees' && <FeeManager />}
        {activeTab === 'admission' && <StudentForm />}
        {activeTab === 'students' && <StudentList />}
        {activeTab === 'manage-students' && <StudentManageHub />}
        {activeTab === 'teachers' && <TeacherModule />}
        {activeTab === 'teacher-directory' && <TeacherDirectoryHub />}
        {activeTab === 'teacher-salary' && <TeacherPaymentManager />}
        {activeTab === 'archive' && <ArchiveHub />}
        {activeTab === 'library' && <LibraryHub />}
{activeTab === 'certificates' && <CertificateHub />}
{activeTab === 'exams' && <ExamHub />}
{activeTab === 'results' && <ResultHub />}
{activeTab === 'admin-dash' && <AdminDashboardHub />}
      </main>

    </div>
  );
}