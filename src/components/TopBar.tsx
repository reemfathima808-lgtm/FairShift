/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Globe } from 'lucide-react';
import { LanguageCode, SectorType } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { VoiceReadAloudButton } from './VoiceReadAloudButton';
import { SECTOR_CONFIGS } from '../data/seedData';

interface TopBarProps {
  activeView: 'landing' | 'worker' | 'admin' | 'industries';
  setActiveView: (view: 'landing' | 'worker' | 'admin' | 'industries') => void;
  activeSector: SectorType;
  setActiveSector: (sec: SectorType) => void;
  screenSummaryText: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  setActiveView,
  activeSector,
  setActiveSector,
  screenSummaryText,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { highContrast, toggleHighContrast } = useAccessibility();

  const sectorList: SectorType[] = ['construction', 'education', 'healthcare', 'manufacturing'];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title, one line */}
        <button
          type="button"
          onClick={() => setActiveView('landing')}
          className="text-lg md:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
            8
          </span>
          <span>FairShift</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => setActiveView('worker')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'worker'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('workerApp')}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'admin'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('adminDashboard')}
          </button>

          <button
            type="button"
            onClick={() => setActiveView('industries')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 cursor-pointer ${
              activeView === 'industries'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            {t('howItWorks')}
          </button>

          {/* Quick Sector Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-xs text-slate-400 whitespace-nowrap">Sector:</span>
            <select
              value={activeSector}
              onChange={(e) => setActiveSector(e.target.value as SectorType)}
              aria-label="Select Industry Sector"
              className="text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 py-1 px-2 rounded-lg border border-slate-200 cursor-pointer"
            >
              {sectorList.map((sec) => (
                <option key={sec} value={sec}>
                  {SECTOR_CONFIGS[sec].name}
                </option>
              ))}
            </select>
          </div>
        </nav>

        {/* Zone 3: 1 primary action / utility controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Read Aloud button */}
          <VoiceReadAloudButton
            textToSpeak={screenSummaryText}
            size="sm"
            className="hidden sm:inline-flex"
          />

          {/* Language Selector */}
          <div className="relative inline-flex items-center">
            <Globe className="w-4 h-4 text-slate-500 absolute left-2 pointer-events-none" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              aria-label="Select Language"
              className="pl-7 pr-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-800 cursor-pointer min-h-[44px]"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-label={t('highContrast')}
            title={t('highContrast')}
            className={`min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              highContrast
                ? 'bg-black text-yellow-300 border-yellow-400 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden lg:inline">{t('highContrast')}</span>
          </button>

          {/* Mobile Role Switch Button */}
          <button
            type="button"
            onClick={() =>
              setActiveView(
                activeView === 'worker' ? 'admin' : activeView === 'admin' ? 'industries' : 'worker'
              )
            }
            className="md:hidden min-h-[44px] px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-lg shadow-sm"
          >
            {activeView === 'worker' ? 'Admin' : activeView === 'admin' ? 'Industries' : 'Worker'}
          </button>
        </div>
      </div>
    </header>
  );
};
