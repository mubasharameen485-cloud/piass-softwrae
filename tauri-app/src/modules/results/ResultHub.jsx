import React, { useState } from 'react';
import Background from '../reports/Background';
import ResultExamSetup from './ResultExamSetup';
import MarksEntryGrid from './MarksEntryGrid';
import ResultCardPrintView from './ResultCardPrintView';

export default function ResultHub() {
  const [mainTab, setMainTab] = useState('menu'); // 'menu', 'set-result', 'view-result'
  const [activeGridExam, setActiveGridExam] = useState(null); // { examId, category, semester, subjectsList }

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Result & Examination Grading Hub</h1>
      </header>

      {/* MAIN MENU */}
      {mainTab === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 no-print">
          <div onClick={() => { setMainTab('set-result'); setActiveGridExam(null); }} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">Set Result & Enter Marks</h3>
            <p className="text-xs text-slate-500 mt-2">Create exam sessions, define subjects, and enter class marks.</p>
          </div>
          <div onClick={() => setMainTab('view-result')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">View / Print Past Results & Cards</h3>
            <p className="text-xs text-slate-500 mt-2">Browse past exam archives and print official result cards.</p>
          </div>
        </div>
      )}

      {/* BACK BUTTON */}
      {mainTab !== 'menu' && !activeGridExam && (
        <button onClick={() => setMainTab('menu')} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700 no-print">
          ← Back to Result Menu
        </button>
      )}

      {/* SET RESULT FLOW */}
      {mainTab === 'set-result' && !activeGridExam && (
        <ResultExamSetup 
          onExamCreated={(examId, category, semester, subjectsList) => {
            setActiveGridExam({ examId, category, semester, subjectsList });
          }} 
        />
      )}

      {/* MARKS ENTRY GRID */}
      {mainTab === 'set-result' && activeGridExam && (
        <MarksEntryGrid 
          examId={activeGridExam.examId}
          category={activeGridExam.category}
          semester={activeGridExam.semester}
          subjectsList={activeGridExam.subjectsList}
          onFinished={() => {
            setActiveGridExam(null);
            setMainTab('view-result');
          }}
        />
      )}

      {/* VIEW & PRINT PAST RESULTS */}
      {mainTab === 'view-result' && <ResultCardPrintView />}
    </div>
  );

  return (
    <div className="screen-report-only h-full w-full">
      <Background>{hubContent}</Background>
    </div>
  );
}