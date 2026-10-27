/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  HardHat,
  GraduationCap,
  HeartPulse,
  Factory,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SectorType } from '../../types';
import { SECTOR_CONFIGS } from '../../data/seedData';
import { useLanguage } from '../../i18n/LanguageContext';
import { VoiceReadAloudButton } from '../../components/VoiceReadAloudButton';

interface IndustryOverviewProps {
  onSelectSector: (sector: SectorType) => void;
  onGoToRole: (role: 'worker' | 'admin') => void;
}

export const IndustryOverview: React.FC<IndustryOverviewProps> = ({
  onSelectSector,
  onGoToRole,
}) => {
  const { t } = useLanguage();

  const sectorDetails: {
    id: SectorType;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    challenge: string;
    fairshiftSolution: string;
    terminology: { label: string; val: string }[];
    sdgTarget: string;
  }[] = [
    {
      id: 'construction',
      icon: <HardHat className="w-7 h-7 text-amber-600" />,
      title: 'Construction Site Operations',
      subtitle: 'Metro Rail, High-Rise & Infrastructure Projects',
      challenge:
        'Informal subcontracting leads to unpaid overtime on concreting runs, unreported scaffolding slips, and workers without portable trade credentials when moving contractors.',
      fairshiftSolution:
        'Independent GPS/QR shift logs, automatic 1.5x overtime counting, voice hazard reporting in native dialect with photo attachments, and a verified Skill Passport for trade progression.',
      terminology: [
        { label: 'Worksite', val: 'Pier / Foundation Level' },
        { label: 'Supervisor', val: 'Foreman & Site Engineer' },
        { label: 'Shift Unit', val: 'Site Shift' },
      ],
      sdgTarget: 'SDG 8.8: Safe & Secure Working Environments',
    },
    {
      id: 'education',
      icon: <GraduationCap className="w-7 h-7 text-blue-600" />,
      title: 'College & School Campus',
      subtitle: 'Residential Engineering Campuses & K-12 Schools',
      challenge:
        'Sanitation, security guards, and lab assistants work irregular evening/night duties, experience opaque deductions for hostel food or uniforms, and lack a direct confidential channel to raise safety concerns.',
      fairshiftSolution:
        'Itemized monthly payslips explaining every deduction in regional mother tongues, fatigue watch for night gate guards, and anonymous ratings of supervisors and physical working conditions.',
      terminology: [
        { label: 'Worksite', val: 'Campus Wing / Hostel' },
        { label: 'Supervisor', val: 'Facilities Director' },
        { label: 'Shift Unit', val: 'Campus Duty' },
      ],
      sdgTarget: 'SDG 8.5: Productive Employment & Equal Pay',
    },
    {
      id: 'healthcare',
      icon: <HeartPulse className="w-7 h-7 text-emerald-600" />,
      title: 'Hospital Support Staff',
      subtitle: 'General Hospitals, Trauma Centers & Long-Term Care',
      challenge:
        'Orderlies and biohazard sanitation staff face chronic back-to-back shift assignments, sharp disposal injuries, and intense emotional fatigue with high staff turnover.',
      fairshiftSolution:
        'Rule-based fatigue alerts flagging shifts with under 11h turnaround, urgent biohazard ticket routing, and team attrition-risk scoring to spot burnout before orderlies resign.',
      terminology: [
        { label: 'Worksite', val: 'Hospital Ward / Unit' },
        { label: 'Supervisor', val: 'Nursing Superintendent' },
        { label: 'Shift Unit', val: 'Duty Roster' },
      ],
      sdgTarget: 'SDG 8.8: Protect Labour Rights',
    },
    {
      id: 'manufacturing',
      icon: <Factory className="w-7 h-7 text-indigo-600" />,
      title: 'Factory & Manufacturing Plant',
      subtitle: 'Precision Auto Parts, Machining & Assembly Lines',
      challenge:
        'Line workers operate heavy presses and CNC tooling where fatigue creates catastrophic amputation risk; attendance registered on paper cards often misses half-hour machine setup overtime.',
      fairshiftSolution:
        'Machine-guard hazard tracking, digital overtime calculation from gate-in to line sign-off, and verified vocational skill passports showcasing ISO compliance and 5S certification.',
      terminology: [
        { label: 'Worksite', val: 'Plant Bay / Cell' },
        { label: 'Supervisor', val: 'Shop Floor In-charge' },
        { label: 'Shift Unit', val: 'Plant Shift' },
      ],
      sdgTarget: 'SDG 8.2: Economic Productivity through Higher Value Add',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold tracking-wide">
            <Scale className="w-4 h-4" />
            <span>UN SDG 8 · Decent Work and Economic Growth</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How FairShift Operates Across Sectors
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Employee-intensive sectors share common vulnerabilities: uncounted overtime, fear of speaking up, and invisible fatigue. FairShift adapts its language, terminology, and hazard categories to serve frontline workers everywhere.
          </p>

          <div className="pt-2">
            <VoiceReadAloudButton
              textToSpeak="How FairShift works across industries. Employee intensive organizations across construction, college campuses, hospitals, and factories replace paper registers and WhatsApp groups with transparent shift tracking, fair payslips, and anonymous safety workflows."
              label="Listen to Overview"
              size="md"
            />
          </div>
        </div>
      </section>

      {/* Grid of Sectors */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sectorDetails.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Sector Image */}
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img
                    src={SECTOR_CONFIGS[sec.id]?.image}
                    alt={sec.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-5">
                    <div className="text-white">
                      <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-300 block mb-1">
                        {sec.sdgTarget}
                      </span>
                      <h2 className="text-xl font-bold">{sec.title}</h2>
                      <p className="text-xs text-slate-200">{sec.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Challenge vs Solution */}
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="p-3 bg-red-50/70 rounded-2xl border border-red-100">
                      <span className="font-bold text-red-900 block mb-1">
                        Frontline Friction:
                      </span>
                      <p className="text-red-950">{sec.challenge}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 block mb-1">
                        FairShift Impact:
                      </span>
                      <p className="text-emerald-950">{sec.fairshiftSolution}</p>
                    </div>
                  </div>

                  {/* Terminology mapping */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Adapted Terminology
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      {sec.terminology.map((t, idx) => (
                        <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="text-slate-500 block">{t.label}</span>
                          <span className="font-bold text-slate-800 truncate block">{t.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    onSelectSector(sec.id);
                    onGoToRole('worker');
                  }}
                  className="min-h-[48px] px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open as Worker</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSector(sec.id);
                    onGoToRole('admin');
                  }}
                  className="min-h-[48px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SDG 8 Target Alignment Matrix */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              UN Sustainable Development Goal 8 Mapping
            </h2>
            <p className="text-xs text-slate-500">
              FairShift directly supports official United Nations indicators for Decent Work and Economic Growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-emerald-700 font-bold text-sm block">Target 8.5</span>
              <p className="font-semibold text-slate-900">
                Full and productive employment and decent work for all women and men, including equal pay for work of equal value.
              </p>
              <p className="text-slate-600 leading-relaxed">
                FairShift guarantees transparent payslip breakdowns, verifies hourly rates, and calculates 1.5x overtime systematically so no wage theft occurs.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-emerald-700 font-bold text-sm block">Target 8.8</span>
              <p className="font-semibold text-slate-900">
                Protect labour rights and promote safe and secure working environments for all workers, including precarious employment.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Workers report hazards via regional voice audio with photo verification. Fatigue algorithms proactively flag overwork before accidents occur.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-emerald-700 font-bold text-sm block">Target 8.2 & 8.6</span>
              <p className="font-semibold text-slate-900">
                Diversification, technological upgrading, innovation, and youth vocational skills.
              </p>
              <p className="text-slate-600 leading-relaxed">
                The verifiable Skill Passport provides portable, tamper-evident proof of trade expertise, enabling workers to transition to higher-wage employment.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
