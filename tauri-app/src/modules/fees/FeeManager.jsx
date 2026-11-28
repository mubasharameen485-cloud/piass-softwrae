import React, { useState } from 'react';
import Background from '../reports/Background';
import Print from '../reports/Print';

import CollectFeeTab from './CollectFeeTab';
import ClassAndIndividualFeeTab from './ClassAndIndividualFeeTab';
import FineAndDeadlineTab from './FineAndDeadlineTab';
import UniversityDuesTab from './UniversityDuesTab';

export default function FeeManager() {
  const [activeMainTab, setActiveMainTab] = useState('collect'); // 'collect', 'class-ind', 'fine-deadline', 'dues'

  const managerContent = (
    <div className="text-slate-900 font-medium">
      <header className="mb-6 border-b border-slate-200 pb-4">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078343]">PIASS College of Nursing Kasur</p>
        <h1 className="text-2xl font-black text-[#062b55]">Advanced Fee & Fine Management</h1>
      </header>

      {/* Master Navigation Buttons */}
      <div className="flex flex-wrap gap-3 mb-8 no-print">
        <button onClick={() => setActiveMainTab('collect')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${activeMainTab === 'collect' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
          💵 Collect Fee & Receipts
        </button>
        <button onClick={() => setActiveMainTab('class-ind')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${activeMainTab === 'class-ind' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
          ⚙️ Class & Individual Fees
        </button>
        <button onClick={() => setActiveMainTab('fine-deadline')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${activeMainTab === 'fine-deadline' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
          ⚠️ Fines & Deadlines
        </button>
        <button onClick={() => setActiveMainTab('dues')} className={`cursor-pointer rounded-xl px-5 py-3 text-sm font-black shadow-xs transition ${activeMainTab === 'dues' ? 'bg-[#062b55] text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
          🏛️ University Dues Hub
        </button>
      </div>

      {activeMainTab === 'collect' && <CollectFeeTab />}
      {activeMainTab === 'class-ind' && <ClassAndIndividualFeeTab />}
      {activeMainTab === 'fine-deadline' && <FineAndDeadlineTab />}
      {activeMainTab === 'dues' && <UniversityDuesTab />}
    </div>
  );

  return (
    <>
      <div className="screen-report-only h-full w-full">
        <Background>{managerContent}</Background>
      </div>
      <Print title="PIASS Fee Management Report">{managerContent}</Print>
    </>
  );
}