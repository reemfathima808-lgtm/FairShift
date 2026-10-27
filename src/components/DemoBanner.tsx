/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { StorageService } from '../services/storageService';

export const DemoBanner: React.FC = () => {
  const { t } = useLanguage();

  const handleReset = () => {
    if (window.confirm('Reset all demo shifts, safety tickets, and feedback to factory state?')) {
      StorageService.resetAllToDefaults();
      window.location.reload();
    }
  };

  return (
    <aside
      aria-label="Demo mode announcement"
      className="bg-slate-900 text-slate-100 text-xs px-4 py-2 border-b border-slate-800"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span className="font-semibold text-white tracking-wide">{t('demoMode')}</span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="text-slate-300 hidden sm:inline">{t('demoModeSubtitle')}</span>
          <span className="hidden md:inline text-slate-400">·</span>
          <span className="text-emerald-300 hidden md:inline font-mono text-[11px]">
            UN SDG Target 8.5 & 8.8
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          title="Reset local storage data to initial demo seed"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
