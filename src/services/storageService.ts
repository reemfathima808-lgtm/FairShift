/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AnonymousFeedback,
  HazardStatus,
  Payslip,
  SafetyReport,
  SectorType,
  ShiftRecord,
  SkillPassport,
  WorkerProfile,
} from '../types';
import {
  DEMO_WORKERS,
  INITIAL_ANONYMOUS_FEEDBACK,
  INITIAL_PAYSLIPS,
  INITIAL_SAFETY_REPORTS,
  INITIAL_SHIFTS,
  INITIAL_SKILL_PASSPORTS,
  SECTOR_CONFIGS,
} from '../data/seedData';
import { calculateShiftHours } from '../utils/overtime';
import { sanitizeAndAnonymizeFeedback } from '../utils/anonymizer';

const KEYS = {
  SHIFTS: 'fairshift_shifts_v1',
  REPORTS: 'fairshift_safety_reports_v1',
  FEEDBACK: 'fairshift_feedback_v1',
  PASSPORTS: 'fairshift_passports_v1',
  PAYSLIPS: 'fairshift_payslips_v1',
  SECTOR: 'fairshift_active_sector_v1',
};

// Simple event dispatcher for localStorage changes across components
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeToDataChanges(callback: StorageListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyDataChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('Error running storage listener:', err);
    }
  });
}

function getStoredJson<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from storage, returning default:`, e);
    return defaultValue;
  }
}

function setStoredJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyDataChanged();
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  // Workers
  getWorkers(sectorId?: SectorType): WorkerProfile[] {
    const all = DEMO_WORKERS;
    if (!sectorId) return all;
    return all.filter((w) => w.sectorId === sectorId);
  },

  getWorkerById(id: string): WorkerProfile | undefined {
    return DEMO_WORKERS.find((w) => w.id === id);
  },

  // Shifts
  getShifts(sectorId?: SectorType): ShiftRecord[] {
    const shifts = getStoredJson<ShiftRecord[]>(KEYS.SHIFTS, INITIAL_SHIFTS);
    if (!sectorId) return shifts;
    return shifts.filter((s) => s.sectorId === sectorId);
  },

  getActiveShift(workerId: string): ShiftRecord | undefined {
    const shifts = this.getShifts();
    return shifts.find((s) => s.workerId === workerId && s.status === 'active');
  },

  clockIn(params: {
    workerId: string;
    sectorId: SectorType;
    department: string;
    locationName: string;
    checkInMethod: 'qr' | 'location' | 'manual';
    hourlyRate?: number;
  }): ShiftRecord {
    const shifts = this.getShifts();
    const worker = this.getWorkerById(params.workerId);

    const now = new Date();
    const newShift: ShiftRecord = {
      id: `shift-${params.workerId}-${Date.now()}`,
      workerId: params.workerId,
      workerName: worker?.name || 'Worker',
      sectorId: params.sectorId,
      department: params.department || worker?.department || 'General',
      date: now.toISOString().split('T')[0],
      clockIn: now.toISOString(),
      clockOut: null,
      breakMinutes: 45,
      standardHours: 0,
      overtimeHours: 0,
      hourlyRate: params.hourlyRate || worker?.hourlyRate || 140,
      overtimeMultiplier: 1.5,
      locationName: params.locationName,
      checkInMethod: params.checkInMethod,
      status: 'active',
    };

    setStoredJson(KEYS.SHIFTS, [newShift, ...shifts]);
    return newShift;
  },

  clockOut(shiftId: string, breakMinutes: number = 45): ShiftRecord | null {
    const shifts = this.getShifts();
    const index = shifts.findIndex((s) => s.id === shiftId);
    if (index === -1) return null;

    const shift = shifts[index];
    const clockOutTime = new Date().toISOString();

    const breakdown = calculateShiftHours(
      shift.clockIn,
      clockOutTime,
      breakMinutes,
      8
    );

    const updated: ShiftRecord = {
      ...shift,
      clockOut: clockOutTime,
      breakMinutes,
      standardHours: breakdown.standardHours,
      overtimeHours: breakdown.overtimeHours,
      status: 'completed',
    };

    shifts[index] = updated;
    setStoredJson(KEYS.SHIFTS, [...shifts]);
    return updated;
  },

  // Payslips
  getPayslips(workerId?: string): Payslip[] {
    const payslips = getStoredJson<Payslip[]>(KEYS.PAYSLIPS, INITIAL_PAYSLIPS);
    if (!workerId) return payslips;
    return payslips.filter((p) => p.workerId === workerId);
  },

  // Safety Reports
  getSafetyReports(sectorId?: SectorType): SafetyReport[] {
    const reports = getStoredJson<SafetyReport[]>(KEYS.REPORTS, INITIAL_SAFETY_REPORTS);
    if (!sectorId) return reports;
    return reports.filter((r) => r.sectorId === sectorId);
  },

  submitSafetyReport(report: Omit<SafetyReport, 'id' | 'createdAt' | 'status'>): SafetyReport {
    const reports = this.getSafetyReports();
    const newReport: SafetyReport = {
      ...report,
      id: `saf-${Date.now().toString(36)}`,
      status: 'Reported',
      createdAt: new Date().toISOString(),
    };

    setStoredJson(KEYS.REPORTS, [newReport, ...reports]);
    return newReport;
  },

  updateSafetyReportStatus(
    id: string,
    status: HazardStatus,
    adminResponse?: string,
    actionTaken?: string
  ): SafetyReport | null {
    const reports = this.getSafetyReports();
    const index = reports.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updated: SafetyReport = {
      ...reports[index],
      status,
      adminResponse: adminResponse ?? reports[index].adminResponse,
      actionTaken: actionTaken ?? reports[index].actionTaken,
      resolvedAt: status === 'Resolved' ? new Date().toISOString() : reports[index].resolvedAt,
    };

    reports[index] = updated;
    setStoredJson(KEYS.REPORTS, [...reports]);
    return updated;
  },

  // Anonymous Feedback
  getAnonymousFeedback(sectorId?: SectorType): AnonymousFeedback[] {
    const feedbacks = getStoredJson<AnonymousFeedback[]>(
      KEYS.FEEDBACK,
      INITIAL_ANONYMOUS_FEEDBACK
    );
    if (!sectorId) return feedbacks;
    return feedbacks.filter((f) => f.sectorId === sectorId);
  },

  submitAnonymousFeedback(
    raw: Parameters<typeof sanitizeAndAnonymizeFeedback>[0]
  ): AnonymousFeedback {
    const anonymized = sanitizeAndAnonymizeFeedback(raw);
    const existing = this.getAnonymousFeedback();
    setStoredJson(KEYS.FEEDBACK, [anonymized, ...existing]);
    return anonymized;
  },

  // Skill Passport
  getSkillPassport(workerId: string): SkillPassport | undefined {
    const passports = getStoredJson<Record<string, SkillPassport>>(
      KEYS.PASSPORTS,
      INITIAL_SKILL_PASSPORTS
    );
    return passports[workerId];
  },

  // Active Sector preference
  getActiveSector(): SectorType {
    const saved = localStorage.getItem(KEYS.SECTOR);
    if (saved && SECTOR_CONFIGS[saved]) {
      return saved as SectorType;
    }
    return 'construction';
  },

  setActiveSector(sector: SectorType): void {
    localStorage.setItem(KEYS.SECTOR, sector);
    notifyDataChanged();
  },

  // Reset to demo defaults
  resetAllToDefaults(): void {
    localStorage.removeItem(KEYS.SHIFTS);
    localStorage.removeItem(KEYS.REPORTS);
    localStorage.removeItem(KEYS.FEEDBACK);
    localStorage.removeItem(KEYS.PASSPORTS);
    localStorage.removeItem(KEYS.PAYSLIPS);
    notifyDataChanged();
  },
};
