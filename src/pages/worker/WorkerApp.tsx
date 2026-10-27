/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  FileText,
  ShieldAlert,
  MessageSquareHeart,
  Award,
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Sparkles,
  Camera,
  Share2,
  Check,
  Building2,
  ChevronRight,
  Info,
} from 'lucide-react';
import { SectorType, WorkerProfile, ShiftRecord, SafetyReport, HazardSeverity } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { StorageService, subscribeToDataChanges } from '../../services/storageService';
import { VoiceReadAloudButton } from '../../components/VoiceReadAloudButton';
import { VoiceInputButton } from '../../components/VoiceInputButton';
import { QrCodeDisplay } from '../../components/QrCodeDisplay';
import { SECTOR_CONFIGS } from '../../data/seedData';
import { detectFatigueAlerts } from '../../utils/fatigue';

interface WorkerAppProps {
  sectorId: SectorType;
  onSectorChange: (s: SectorType) => void;
}

type WorkerTab = 'shifts' | 'payslip' | 'safety' | 'feedback' | 'passport';

export const WorkerApp: React.FC<WorkerAppProps> = ({ sectorId, onSectorChange }) => {
  const { t, language } = useLanguage();

  // Active Tab
  const [activeTab, setActiveTab] = useState<WorkerTab>('shifts');

  // Available workers in sector
  const workersInSector = useMemo(() => StorageService.getWorkers(sectorId), [sectorId]);
  const [currentWorkerId, setCurrentWorkerId] = useState<string>(
    workersInSector[0]?.id || 'worker-c1'
  );

  // When sector changes, pick the first worker of that sector
  useEffect(() => {
    if (workersInSector.length > 0 && !workersInSector.find((w) => w.id === currentWorkerId)) {
      setCurrentWorkerId(workersInSector[0].id);
    }
  }, [sectorId, workersInSector, currentWorkerId]);

  const currentWorker = useMemo(
    () => StorageService.getWorkerById(currentWorkerId) || workersInSector[0],
    [currentWorkerId, workersInSector]
  );

  const sectorConfig = SECTOR_CONFIGS[sectorId] || SECTOR_CONFIGS['construction'];

  // Reactive state from StorageService
  const [, setVersion] = useState(0);
  useEffect(() => {
    const unsub = subscribeToDataChanges(() => setVersion((v) => v + 1));
    return unsub;
  }, []);

  const allShifts = StorageService.getShifts(sectorId);
  const workerShifts = allShifts.filter((s) => s.workerId === currentWorker?.id);
  const activeShift = StorageService.getActiveShift(currentWorker?.id || '');
  const payslips = StorageService.getPayslips(currentWorker?.id);
  const latestPayslip = payslips[0];
  const safetyReports = StorageService.getSafetyReports(sectorId);
  const skillPassport = StorageService.getSkillPassport(currentWorker?.id || '');

  // Fatigue alert check for this worker
  const workerFatigueAlerts = useMemo(() => {
    if (!currentWorker) return [];
    return detectFatigueAlerts(workerShifts, [currentWorker]);
  }, [workerShifts, currentWorker]);

  // Live timer for active shift
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!activeShift) {
      setElapsedSeconds(0);
      return;
    }
    const updateElapsed = () => {
      const start = new Date(activeShift.clockIn).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((now - start) / 1000)));
    };
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [activeShift]);

  // Check-In / Check-Out Handlers
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkInMethod, setCheckInMethod] = useState<'qr' | 'location'>('qr');
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);

  const handleClockIn = () => {
    if (!currentWorker) return;
    StorageService.clockIn({
      workerId: currentWorker.id,
      sectorId,
      department: currentWorker.department,
      locationName: `${sectorConfig.terminology.worksite} #102`,
      checkInMethod,
      hourlyRate: currentWorker.hourlyRate,
    });
    setCheckInModalOpen(false);
    setCheckInSuccessMsg(t('checkInSuccess'));
    setTimeout(() => setCheckInSuccessMsg(null), 4000);
  };

  const handleClockOut = () => {
    if (!activeShift) return;
    StorageService.clockOut(activeShift.id, 45);
    setCheckInSuccessMsg(t('checkOutSuccess'));
    setTimeout(() => setCheckInSuccessMsg(null), 4000);
  };

  // Safety Report Form State
  const [hazardCategory, setHazardCategory] = useState<string>(
    sectorConfig.hazardCategories[0]?.name || 'General'
  );
  const [hazardLocation, setHazardLocation] = useState('');
  const [hazardDescription, setHazardDescription] = useState('');
  const [hazardSeverity, setHazardSeverity] = useState<HazardSeverity>('Medium');
  const [hazardPhotoAttached, setHazardPhotoAttached] = useState(false);
  const [safetySuccessMsg, setSafetySuccessMsg] = useState<string | null>(null);

  const handleReportSafety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardDescription.trim()) return;

    StorageService.submitSafetyReport({
      anonymousId: `anon-${Math.random().toString(36).slice(2, 8)}`,
      sectorId,
      locationOrSite: hazardLocation.trim() || `${sectorConfig.terminology.worksite} Area`,
      category: hazardCategory,
      severity: hazardSeverity,
      description: hazardDescription.trim(),
      photoUrl: hazardPhotoAttached ? sectorConfig.image : undefined,
    });

    setHazardDescription('');
    setHazardLocation('');
    setHazardPhotoAttached(false);
    setSafetySuccessMsg(t('hazardSubmitted'));
    setTimeout(() => setSafetySuccessMsg(null), 4000);
  };

  // Anonymous Feedback Form State
  const [managerRating, setManagerRating] = useState(4);
  const [safetyRating, setSafetyRating] = useState(4);
  const [workloadRating, setWorkloadRating] = useState(3);
  const [fairnessRating, setFairnessRating] = useState(4);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.submitAnonymousFeedback({
      sectorId,
      department: currentWorker?.department || 'General',
      managerRating,
      safetyRating,
      workloadRating,
      fairnessRating,
      comments: feedbackComment,
    });
    setFeedbackComment('');
    setFeedbackSuccessMsg(t('feedbackThankYou'));
    setTimeout(() => setFeedbackSuccessMsg(null), 5000);
  };

  // Share Passport state
  const [passportQrModal, setPassportQrModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Formatting helpers
  const formatSeconds = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 text-slate-900">
      {/* Top Mobile Bar with Worker Switcher & Read Aloud */}
      <section className="bg-white border-b border-slate-200 px-4 py-3 sticky top-14 z-20 shadow-xs">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              {currentWorker?.name ? currentWorker.name.charAt(0) : 'W'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {currentWorker?.name}
                </h1>
                <span className="text-xs text-slate-500 font-mono">
                  {currentWorker?.employeeCode}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {currentWorker?.role} · {sectorConfig.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo Worker Switcher */}
            <select
              value={currentWorkerId}
              onChange={(e) => setCurrentWorkerId(e.target.value)}
              aria-label="Switch Demo Worker Profile"
              className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 font-medium text-slate-800 cursor-pointer min-h-[44px]"
            >
              {workersInSector.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>

            <VoiceReadAloudButton
              textToSpeak={`Worker profile: ${currentWorker?.name}. Role: ${currentWorker?.role}. Shift status: ${activeShift ? 'Currently clocked in on duty' : 'Off duty'}. Hourly rate: ${currentWorker?.currency}${currentWorker?.hourlyRate} per hour.`}
              size="sm"
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Fatigue Alert Warning Banner */}
        {workerFatigueAlerts.length > 0 && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 shadow-sm flex items-start gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-amber-900">
                  {t('fatigueWarningTitle')} · {workerFatigueAlerts[0].metric}
                </h2>
                <VoiceReadAloudButton
                  textToSpeak={`${t('fatigueWarningTitle')}. ${workerFatigueAlerts[0].detail} ${workerFatigueAlerts[0].recommendedAction}`}
                  size="sm"
                  className="bg-amber-100 hover:bg-amber-200 border-amber-300"
                />
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {workerFatigueAlerts[0].detail}
              </p>
              <p className="text-xs font-semibold text-amber-900">
                Action: {workerFatigueAlerts[0].recommendedAction}
              </p>
            </div>
          </div>
        )}

        {/* Global Toast Success Msg */}
        {checkInSuccessMsg && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-medium flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{checkInSuccessMsg}</span>
          </div>
        )}

        {/* =========================================================================
            TAB 1: SHIFTS & ATTENDANCE
            ========================================================================= */}
        {activeTab === 'shifts' && (
          <div className="space-y-4">
            {/* Active Shift Card / Check-In Button */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {t('todayStatus')}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        activeShift ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <h2 className="text-xl font-bold text-slate-900">
                      {activeShift ? t('onDuty') : t('offDuty')}
                    </h2>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">{t('ratePerHour')}</span>
                  <p className="text-lg font-bold text-slate-900 font-mono">
                    {currentWorker?.currency}
                    {currentWorker?.hourlyRate} / hr
                  </p>
                </div>
              </div>

              {activeShift ? (
                /* Clocked-In Active Card */
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-medium">
                      {t('activeShift')}
                    </span>
                    <span className="text-xs text-emerald-700 font-mono">
                      {t('clockedInAt')}: {new Date(activeShift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <span className="text-xs text-slate-500 block mb-1">
                      {t('elapsedTime')}
                    </span>
                    <p className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                      {formatSeconds(elapsedSeconds)}
                    </p>
                    {elapsedSeconds > 8 * 3600 && (
                      <span className="inline-block mt-2 px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
                        {t('overtimeAlert')} · 1.5x Pay
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClockOut}
                      className="w-full min-h-[52px] bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <Square className="w-5 h-5 fill-current" />
                      <span>{t('checkOutNow')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Ready to Clock In */
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Verify presence via Gate QR Code or GPS location fence at {sectorConfig.name}.
                  </p>

                  <button
                    type="button"
                    onClick={() => setCheckInModalOpen(true)}
                    className="w-full min-h-[56px] bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>{t('checkInNow')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Check-In Modal Simulation */}
            {checkInModalOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      {t('checkInNow')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setCheckInModalOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-lg font-bold min-h-[44px] min-w-[44px]"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Method selector */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCheckInMethod('qr')}
                      className={`min-h-[44px] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        checkInMethod === 'qr'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{t('qrCodeScan')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckInMethod('location')}
                      className={`min-h-[44px] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        checkInMethod === 'location'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>{t('locationVerify')}</span>
                    </button>
                  </div>

                  {checkInMethod === 'qr' ? (
                    <div className="text-center py-2 space-y-2">
                      <p className="text-xs text-slate-600">
                        Scan the worksite QR poster at Gate 1:
                      </p>
                      <div className="flex justify-center">
                        <QrCodeDisplay
                          value={`FAIRSHIFT-GATE-${sectorId.toUpperCase()}-01`}
                          size={150}
                          label="Site Gate QR"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-center space-y-2">
                      <MapPin className="w-8 h-8 text-blue-600 mx-auto" />
                      <p className="text-xs font-semibold text-blue-950">
                        GPS Geofence Match
                      </p>
                      <p className="text-xs text-blue-800">
                        Within 25 meters of {sectorConfig.name} Main Gate.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleClockIn}
                    className="w-full min-h-[50px] bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-base shadow-sm transition-all cursor-pointer"
                  >
                    Confirm & Start Shift
                  </button>
                </div>
              </div>
            )}

            {/* Shift History List */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {t('recentShifts')}
                </h3>
                <span className="text-xs text-slate-500">
                  {workerShifts.length} Recorded Shifts
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {workerShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="py-3 flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 font-mono">
                          {shift.date}
                        </span>
                        {shift.status === 'active' ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {new Date(shift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {shift.clockOut ? new Date(shift.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px] sm:max-w-none">
                        {shift.locationName} · {shift.breakMinutes}m break
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 font-mono">
                        {(shift.standardHours + shift.overtimeHours).toFixed(1)} hrs
                      </span>
                      {shift.overtimeHours > 0 && (
                        <p className="text-xs text-amber-700 font-semibold font-mono">
                          +{shift.overtimeHours.toFixed(1)}h OT (1.5x)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TRANSPARENT PAYSLIP
            ========================================================================= */}
        {activeTab === 'payslip' && (
          <div className="space-y-4">
            {latestPayslip ? (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {latestPayslip.monthYear}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {t('monthlyPayslip')}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Period: {latestPayslip.payPeriod}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      {t('paymentStatusPaid')}
                    </span>
                  </div>
                </div>

                {/* Net Pay Hero Box */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-800 font-medium">
                      {t('netTakeHome')}
                    </span>
                    <p className="text-3xl font-extrabold text-emerald-950 font-mono tracking-tight mt-0.5">
                      {latestPayslip.currency}
                      {latestPayslip.netPay.toLocaleString()}
                    </p>
                  </div>

                  {/* Explain My Pay Voice Button */}
                  <VoiceReadAloudButton
                    textToSpeak={
                      latestPayslip.explanation[language] || latestPayslip.explanation['en']
                    }
                    label={t('explainMyPay')}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white border-0 shadow-sm"
                  />
                </div>

                {/* Visual Pay Breakdown Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Earnings Breakdown
                  </h3>

                  <div className="space-y-2 text-sm divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-600">
                        {t('regularWages')} ({latestPayslip.baseHours} hrs @ {latestPayslip.currency}{latestPayslip.baseHourlyRate}/hr)
                      </span>
                      <span className="font-semibold text-slate-900 font-mono">
                        {latestPayslip.currency}
                        {latestPayslip.basePay.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 text-amber-900 bg-amber-50/50 px-2 rounded-lg">
                      <span className="font-medium flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        {t('overtimeWages')} ({latestPayslip.overtimeHours} hrs @ 1.5x)
                      </span>
                      <span className="font-bold font-mono">
                        +{latestPayslip.currency}
                        {latestPayslip.overtimePay.toLocaleString()}
                      </span>
                    </div>

                    {latestPayslip.bonuses > 0 && (
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-600">Attendance & Safety Bonus</span>
                        <span className="font-semibold text-emerald-700 font-mono">
                          +{latestPayslip.currency}
                          {latestPayslip.bonuses.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions Breakdown */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Authorized Deductions
                  </h3>

                  <div className="space-y-2 text-sm divide-y divide-slate-100">
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-600">{t('statutoryDeductions')}</span>
                      <span className="text-slate-700 font-mono">
                        -{latestPayslip.currency}
                        {latestPayslip.deductions.providentFundOrTax.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-600">{t('healthInsurance')}</span>
                      <span className="text-slate-700 font-mono">
                        -{latestPayslip.currency}
                        {latestPayslip.deductions.healthInsurance.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5 font-bold text-slate-900 border-t border-slate-200">
                      <span>Total Deductions</span>
                      <span className="font-mono text-red-700">
                        -{latestPayslip.currency}
                        {latestPayslip.deductions.totalDeductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Multilingual Text Explanation */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-600" />
                      Clear Pay Assurance
                    </span>
                    <VoiceReadAloudButton
                      textToSpeak={
                        latestPayslip.explanation[language] || latestPayslip.explanation['en']
                      }
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {latestPayslip.explanation[language] || latestPayslip.explanation['en']}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  No payslips generated for this worker yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: SAFETY REPORTING
            ========================================================================= */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            {/* Report Form */}
            <form
              onSubmit={handleReportSafety}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {t('reportHazardTitle')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('reportHazardDesc')}
                  </p>
                </div>
                <VoiceReadAloudButton
                  textToSpeak={`${t('reportHazardTitle')}. ${t('reportHazardDesc')}`}
                  size="sm"
                />
              </div>

              {safetySuccessMsg && (
                <div
                  role="status"
                  className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{safetySuccessMsg}</span>
                </div>
              )}

              {/* Category selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('hazardCategory')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sectorConfig.hazardCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setHazardCategory(cat.name)}
                      className={`min-h-[48px] p-2.5 rounded-xl text-left border text-xs font-medium transition-all cursor-pointer flex flex-col justify-center ${
                        hazardCategory === cat.name
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-[10px] text-slate-500 font-normal truncate">
                        e.g. {cat.example}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('hazardLocation')}
                </label>
                <input
                  type="text"
                  value={hazardLocation}
                  onChange={(e) => setHazardLocation(e.target.value)}
                  placeholder={`e.g. ${sectorConfig.terminology.worksite} 3rd floor`}
                  className="w-full min-h-[48px] px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
                />
              </div>

              {/* Severity Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as HazardSeverity[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setHazardSeverity(lvl)}
                      className={`min-h-[44px] text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                        hazardSeverity === lvl
                          ? lvl === 'Critical'
                            ? 'bg-red-600 text-white border-red-700'
                            : lvl === 'High'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description + Voice Button */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('hazardDescription')}
                </label>
                <textarea
                  rows={3}
                  value={hazardDescription}
                  onChange={(e) => setHazardDescription(e.target.value)}
                  placeholder="Describe the dangerous condition or defect..."
                  className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
                />

                <div className="mt-2 flex items-center justify-between gap-2">
                  <VoiceInputButton
                    onTranscript={(text) =>
                      setHazardDescription((prev) => (prev ? `${prev} ${text}` : text))
                    }
                    label="Speak Hazard Report"
                    className="text-xs"
                  />

                  {/* Photo attachment mock */}
                  <button
                    type="button"
                    onClick={() => setHazardPhotoAttached(!hazardPhotoAttached)}
                    className={`min-h-[48px] px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      hazardPhotoAttached
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>{hazardPhotoAttached ? 'Photo Attached ✓' : t('attachPhoto')}</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[52px] bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-base shadow-sm hover:shadow transition-all cursor-pointer active:scale-[0.98]"
              >
                {t('submitReport')}
              </button>
            </form>

            {/* List of Recent Safety Reports & Status */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {t('mySafetyReports')}
              </h3>

              <div className="space-y-3">
                {safetyReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{report.category}</span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {report.locationOrSite} · {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          report.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : report.status === 'Under Review'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {report.description}
                    </p>

                    {report.adminResponse && (
                      <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                        <span className="font-bold text-emerald-800 block">
                          Supervisor Action:
                        </span>
                        <p>{report.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: ANONYMOUS FEEDBACK
            ========================================================================= */}
        {activeTab === 'feedback' && (
          <form
            onSubmit={handleFeedbackSubmit}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 tracking-wider uppercase block">
                  100% Confidential
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  {t('feedbackTitle')}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  {t('feedbackDesc')}
                </p>
              </div>

              <VoiceReadAloudButton
                textToSpeak={`${t('feedbackTitle')}. ${t('feedbackDesc')}`}
                size="sm"
              />
            </div>

            {feedbackSuccessMsg && (
              <div
                role="status"
                className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{feedbackSuccessMsg}</span>
              </div>
            )}

            {/* Rating Item 1: Manager Fairness */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{t('managerFairness')}</span>
                <span className="font-mono font-bold text-emerald-700">{managerRating} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setManagerRating(val)}
                    className={`min-h-[48px] rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                      managerRating === val
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Item 2: Workload Sustainability */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{t('workloadSafety')}</span>
                <span className="font-mono font-bold text-emerald-700">{workloadRating} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setWorkloadRating(val)}
                    className={`min-h-[48px] rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                      workloadRating === val
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Item 3: Safety Equipment */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{t('safetyEquipment')}</span>
                <span className="font-mono font-bold text-emerald-700">{safetyRating} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSafetyRating(val)}
                    className={`min-h-[48px] rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                      safetyRating === val
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Item 4: Overtime Fairness */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{t('overallFairness')}</span>
                <span className="font-mono font-bold text-emerald-700">{fairnessRating} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFairnessRating(val)}
                    className={`min-h-[48px] rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                      fairnessRating === val
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}★
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t('optionalComments')}
              </label>
              <textarea
                rows={2}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share any general experience or suggestion..."
                className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-1">
              <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('privacyGuarantee')}</span>
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-base shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              {t('submitFeedback')}
            </button>
          </form>
        )}

        {/* =========================================================================
            TAB 5: SKILL PASSPORT
            ========================================================================= */}
        {activeTab === 'passport' && (
          <div className="space-y-4">
            {skillPassport ? (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                      Portable SDG 8 Credential
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      {skillPassport.workerName}
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      {skillPassport.tradeRole} · {skillPassport.yearsExperience} Years Experience
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPassportQrModal(true)}
                    className="min-h-[48px] px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t('shareViaQr')}</span>
                  </button>
                </div>

                {/* Verified Badge Header */}
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      {t('verifiedTradeBadge')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-800">
                    ID: {skillPassport.verificationHash}
                  </span>
                </div>

                {/* Certificates List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('trainingCertificates')}
                  </h3>

                  <div className="space-y-2">
                    {skillPassport.certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">
                            {cert.title}
                          </span>
                          {cert.verified && (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600">
                          Issued by {cert.issuingBody} · Issued {cert.issuedDate}
                        </p>
                        {cert.credentialId && (
                          <p className="font-mono text-[10px] text-slate-400">
                            Reg: {cert.credentialId}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Summary */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {t('workExperience')}
                  </h3>

                  <div className="space-y-2">
                    {skillPassport.experienceSummary.map((exp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{exp.role}</span>
                          <span className="text-slate-500 font-mono">{exp.period}</span>
                        </div>
                        <p className="font-medium text-slate-700">{exp.employer}</p>
                        <p className="text-slate-600 leading-relaxed mt-1">
                          {exp.highlights}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
                <Award className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-800">
                  No verified skill passport found for this worker ID.
                </p>
              </div>
            )}

            {/* Share QR Modal */}
            {passportQrModal && skillPassport && (
              <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
              >
                <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">
                      Skill Passport QR
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPassportQrModal(false)}
                      className="text-slate-400 hover:text-slate-600 text-lg font-bold min-h-[44px] min-w-[44px]"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-slate-600">
                    New contractors or employers can scan this QR code to verify certifications independently:
                  </p>

                  <div className="flex justify-center py-2">
                    <QrCodeDisplay
                      value={`https://fairshift.org/passport/${skillPassport.verificationHash}`}
                      size={180}
                      label="Skill Passport Link"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 3000);
                    }}
                    className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{linkCopied ? 'Link Copied to Clipboard!' : t('shareLink')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Bottom Tab Navigation (Mobile Touch First Anchor) */}
      <nav
        aria-label="Worker App Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'shifts'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Clock className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[56px]">
              {t('tabShifts')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payslip')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'payslip'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[56px]">
              {t('tabPayslip')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('safety')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'safety'
                ? 'text-red-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[56px]">
              {t('tabSafety')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'feedback'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <MessageSquareHeart className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[56px]">
              {t('tabFeedback')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('passport')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'passport'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <Award className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] tracking-tight truncate max-w-[56px]">
              {t('tabPassport')}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
};
