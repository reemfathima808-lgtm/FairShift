/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Smartphone,
  LayoutDashboard,
  HardHat,
  GraduationCap,
  HeartPulse,
  Factory,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Volume2,
  Scale,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { SectorType } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { VoiceReadAloudButton } from '../../components/VoiceReadAloudButton';
import { SECTOR_CONFIGS } from '../../data/seedData';

interface LandingPageProps {
  onSelectRole: (role: 'worker' | 'admin') => void;
  activeSector: SectorType;
  onSelectSector: (sector: SectorType) => void;
  onViewIndustries: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRole,
  activeSector,
  onSelectSector,
  onViewIndustries,
}) => {
  const { t } = useLanguage();

  const landingSpeech =
    'Welcome to FairShift. A Decent Work platform for United Nations Sustainable Development Goal 8. Select Worker App for simplified mobile-first shift tracking, clear payslips, and voice hazard reporting. Or select Employer Dashboard for attendance analytics, fatigue watch, and transparent attrition-risk analysis.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-12 pb-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold tracking-wide">
            <Scale className="w-4 h-4" />
            <span>UN SDG 8 Decent Work & Economic Growth</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Fairness, Safety & Transparency for Every Frontline Shift
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Replacing paper registers, uncounted overtime, and WhatsApp groups with verifiable shift hours, 100% anonymous safety reporting, and multilingual payslips.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <VoiceReadAloudButton
              textToSpeak={landingSpeech}
              label="Listen to Introduction"
              size="lg"
            />
            <button
              type="button"
              onClick={onViewIndustries}
              className="min-h-[52px] px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
            >
              How This Works Across Industries →
            </button>
          </div>
        </div>
      </section>

      {/* Sector Quick Switcher Strip */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">
            Simulate Sector:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'construction', label: 'Construction Site', icon: HardHat },
                { id: 'education', label: 'College / School', icon: GraduationCap },
                { id: 'healthcare', label: 'Hospital Care', icon: HeartPulse },
                { id: 'manufacturing', label: 'Factory Plant', icon: Factory },
              ] as const
            ).map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSector === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSelectSector(sec.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role Selection Cards (TWO SEPARATE INTERFACES) */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        <div>
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Choose an Interface to Demo
            </h2>
            <p className="text-xs text-slate-500">
              Experience the application from both worker and administrative perspectives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Interface 1: Worker App */}
            <div className="bg-white rounded-3xl p-7 border-2 border-emerald-500/40 hover:border-emerald-600 shadow-sm transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Smartphone className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {t('workerApp')}
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Mobile First
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Designed for low-end smartphones, low literacy, and regional languages.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Big touch buttons (≥48px)</strong> and icon-first UI for rapid scanning.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Voice support & read-aloud:</strong> Speaks payslips and accepts voice safety reports in Hindi, Tamil, Telugu, and English.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Transparent overtime & payslips:</strong> Transparent 1.5x calculation with "Explain My Pay" voice assistant.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Verifiable Skill Passport:</strong> Portable trade certificates shareable via QR code.
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectRole('worker')}
                className="w-full min-h-[56px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Launch Worker App</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Interface 2: Admin Dashboard */}
            <div className="bg-white rounded-3xl p-7 border-2 border-slate-300 hover:border-slate-400 shadow-sm transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                  <LayoutDashboard className="w-7 h-7" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {t('adminDashboard')}
                    </h3>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      Desktop First
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Operational oversight, hazard review, fatigue watch, and transparent attrition metrics.
                  </p>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Attendance & Overtime Trends:</strong> Lightweight, accessible charts of work hours and overtime spikes.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fatigue Watch Center:</strong> Flags shifts exceeding 48h/week or under 11h turnaround rest.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Safety Hazard Tracker:</strong> Review worker hazard reports, assign status, and log engineering mitigations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Transparent Attrition-Risk Engine:</strong> Rule-based team scoring with transparent reasons (not a black-box AI score).
                    </span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectRole('admin')}
                className="w-full min-h-[56px] bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Launch Employer Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 8 Core Feature Matrix */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">
              8 Foundational Decent Work Capabilities Built-In
            </h3>
            <p className="text-xs text-slate-500">
              Every feature is functional, locally persisted, and test-verified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">1. Shift Tracking</span>
              <p className="text-slate-600">
                Gate QR scan or GPS geofence with automatic overtime splitting after 8 hours.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">2. Clear Payslips</span>
              <p className="text-slate-600">
                Itemized wages, overtime, and social deductions with an "Explain My Pay" voice assistant.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">3. Safety Reporting</span>
              <p className="text-slate-600">
                Voice/text hazard reporting with photo proof and live status workflow tracking.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">4. Anonymous Feedback</span>
              <p className="text-slate-600">
                Identity-scrubbed ratings of manager fairness and workload without fear of retaliation.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">5. Skill Passport</span>
              <p className="text-slate-600">
                Portable digital credential of safety trainings and trade certifications shareable via QR.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">6. Fatigue Alerts</span>
              <p className="text-slate-600">
                Automated flags for &gt;48h weekly load and back-to-back turnaround rest under 11 hours.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">7. Admin Dashboard</span>
              <p className="text-slate-600">
                Real-time operational charts, fatigue mitigation, and transparent attrition risk scores.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="font-bold text-slate-900 block">8. Local Languages & Voice</span>
              <p className="text-slate-600">
                English, Hindi, Tamil, and Telugu translations with browser Web Speech synthesis and recognition.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
