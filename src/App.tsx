/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { DemoBanner } from './components/DemoBanner';
import { TopBar } from './components/TopBar';
import { LandingPage } from './pages/landing/LandingPage';
import { WorkerApp } from './pages/worker/WorkerApp';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { IndustryOverview } from './pages/industries/IndustryOverview';
import { SectorType } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'worker' | 'admin' | 'industries'>('landing');
  const [activeSector, setActiveSectorState] = useState<SectorType>(() => StorageService.getActiveSector());

  const handleSectorChange = (sec: SectorType) => {
    setActiveSectorState(sec);
    StorageService.setActiveSector(sec);
  };

  // Determine screen summary for read-aloud button in TopBar
  const screenSummaryText = (() => {
    if (activeView === 'worker') {
      return 'FairShift Worker App. View today shift status, clock in with QR or GPS, review your transparent payslip, report safety hazards via voice, submit anonymous feedback, or share your verified skill passport.';
    }
    if (activeView === 'admin') {
      return 'FairShift Employer Dashboard. Monitor on-duty attendance, fatigue flags exceeding forty-eight hours, review open workplace safety tickets, and analyze team attrition-risk scores with transparent root causes.';
    }
    if (activeView === 'industries') {
      return 'How FairShift Works Across Industries. Mapping UN SDG Goal 8 decent work principles across Construction, College and School campuses, Hospitals, and Manufacturing plants.';
    }
    return 'Welcome to FairShift. A Decent Work platform for United Nations Sustainable Development Goal 8. Select Worker App or Employer Dashboard to begin.';
  })();

  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          {/* Top Demo Banner */}
          <DemoBanner />

          {/* Sticky Top Bar Contract */}
          <TopBar
            activeView={activeView}
            setActiveView={setActiveView}
            activeSector={activeSector}
            setActiveSector={handleSectorChange}
            screenSummaryText={screenSummaryText}
          />

          {/* Views */}
          <div className="flex-1">
            {activeView === 'landing' && (
              <LandingPage
                onSelectRole={(role) => setActiveView(role)}
                activeSector={activeSector}
                onSelectSector={handleSectorChange}
                onViewIndustries={() => setActiveView('industries')}
              />
            )}

            {activeView === 'worker' && (
              <WorkerApp
                sectorId={activeSector}
                onSectorChange={handleSectorChange}
              />
            )}

            {activeView === 'admin' && (
              <AdminDashboard
                activeSector={activeSector}
                onSectorChange={handleSectorChange}
              />
            )}

            {activeView === 'industries' && (
              <IndustryOverview
                onSelectSector={handleSectorChange}
                onGoToRole={(role) => setActiveView(role)}
              />
            )}
          </div>
        </div>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
