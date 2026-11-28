import React, { useState } from 'react';
import Background from '../reports/Background';
import DatesheetCreator from './DatesheetCreator';
import DatesheetPrintView from './DatesheetPrintView';
import QuestionPaperCreator from './QuestionPaperCreator';

export default function ExamHub() {
  const [mainMenu, setMainMenu] = useState('menu'); // 'menu', 'datesheet-menu', 'paper-menu'
  const [datesheetSub, setDatesheetSub] = useState(null); // 'set', 'download'
  const [paperSub, setPaperSub] = useState(false); // true/false for paper creator

  const hubContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Exams & Assessment Hub</h1>
      </header>

      {/* MAIN MENU */}
      {mainMenu === 'menu' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
          <div onClick={() => setMainMenu('datesheet-menu')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">Datesheet Management</h3>
            <p className="text-xs text-slate-500 mt-2">Create, manage, and print customized student datesheets.</p>
          </div>
          <div onClick={() => setMainMenu('paper-menu')} className="cursor-pointer rounded-2xl border border-slate-300 bg-white p-8 text-center shadow-sm transition hover:border-[#062b55]">
            <h3 className="text-xl font-black text-[#062b55]">Question Paper Sheet Creator</h3>
            <p className="text-xs text-slate-500 mt-2">Generate subjective and objective MCQ examination papers.</p>
          </div>
        </div>
      )}

      {/* BACK BUTTON */}
      {mainMenu !== 'menu' && (
        <button onClick={() => { setMainMenu('menu'); setDatesheetSub(null); }} className="mb-6 cursor-pointer rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-slate-700">
          ← Back to Exams Menu
        </button>
      )}

      {/* DATESHEET SUB-MENU */}
      {mainMenu === 'datesheet-menu' && !datesheetSub && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div onClick={() => setDatesheetSub('set')} className="cursor-pointer rounded-2xl border border-emerald-300 bg-emerald-50/50 p-8 text-center shadow-sm transition hover:bg-emerald-100">
            <h3 className="text-lg font-black text-emerald-900">Set & Create Datesheet</h3>
            <p className="text-xs text-emerald-700 mt-2">Add exam slots, subjects, dates, and timings.</p>
          </div>
          <div onClick={() => setDatesheetSub('download')} className="cursor-pointer rounded-2xl border border-sky-300 bg-sky-50/50 p-8 text-center shadow-sm transition hover:bg-sky-100">
            <h3 className="text-lg font-black text-sky-900">Download / Print Student Datesheets</h3>
            <p className="text-xs text-sky-700 mt-2">Select class and print individual student slips.</p>
          </div>
        </div>
      )}

      {datesheetSub === 'set' && <DatesheetCreator />}
      {datesheetSub === 'download' && <DatesheetPrintView />}

      {/* QUESTION PAPER MENU */}
      {mainMenu === 'paper-menu' && <QuestionPaperCreator />}
    </div>
  );

  return (
    <div className="screen-report-only h-full w-full">
      <Background>{hubContent}</Background>
    </div>
  );
}