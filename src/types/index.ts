/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SectorType = 'construction' | 'education' | 'healthcare' | 'manufacturing';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te';

export interface SectorConfig {
  id: SectorType;
  name: string;
  tagline: string;
  image: string;
  roles: string[];
  departments: string[];
  shiftTypes: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    defaultBreakMinutes: number;
  }[];
  hazardCategories: {
    id: string;
    name: string;
    icon: string;
    example: string;
  }[];
  terminology: {
    worksite: string;
    supervisor: string;
    workerRole: string;
    shiftUnit: string;
  };
}

export interface WorkerProfile {
  id: string;
  name: string;
  sectorId: SectorType;
  role: string;
  department: string;
  hourlyRate: number;
  currency: string;
  preferredLanguage: LanguageCode;
  phone: string;
  employeeCode: string;
  joinedDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  skills: {
    name: string;
    level: 'Beginner' | 'Skilled' | 'Master';
    verified: boolean;
  }[];
}

export interface ShiftRecord {
  id: string;
  workerId: string;
  workerName: string;
  sectorId: SectorType;
  department: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO string or HH:mm
  clockOut: string | null; // ISO string or HH:mm or null if active
  breakMinutes: number;
  standardHours: number;
  overtimeHours: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  locationName: string;
  checkInMethod: 'qr' | 'location' | 'manual';
  status: 'active' | 'completed' | 'flagged';
  notes?: string;
}

export interface PayslipItem {
  label: string;
  amount: number;
  type: 'earning' | 'deduction';
  isOvertime?: boolean;
}

export interface Payslip {
  id: string;
  workerId: string;
  workerName: string;
  monthYear: string; // e.g. "October 2026"
  payPeriod: string;
  currency: string;
  baseHours: number;
  baseHourlyRate: number;
  basePay: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  grossPay: number;
  deductions: {
    providentFundOrTax: number;
    healthInsurance: number;
    safetyKitOrAdvance: number;
    totalDeductions: number;
  };
  netPay: number;
  status: 'paid' | 'processing';
  paymentDate: string;
  explanation: {
    en: string;
    hi: string;
    ta: string;
    te: string;
  };
}

export type HazardSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type HazardStatus = 'Reported' | 'Under Review' | 'Resolved';

export interface SafetyReport {
  id: string;
  anonymousId: string; // token generated without linking to real identity
  sectorId: SectorType;
  locationOrSite: string;
  category: string;
  severity: HazardSeverity;
  description: string;
  audioNote?: string; // transcription or indicator
  photoUrl?: string;
  status: HazardStatus;
  createdAt: string;
  resolvedAt?: string;
  adminResponse?: string;
  actionTaken?: string;
}

export interface AnonymousFeedback {
  id: string;
  sectorId: SectorType;
  department: string;
  submittedAt: string; // Date string without timestamp precision to prevent deanonymisation
  managerRating: number; // 1-5
  safetyRating: number; // 1-5
  workloadRating: number; // 1-5
  fairnessRating: number; // 1-5
  comments?: string;
}

export interface SkillPassport {
  workerId: string;
  workerName: string;
  employeeCode: string;
  sectorId: SectorType;
  tradeRole: string;
  yearsExperience: number;
  issueDate: string;
  verificationHash: string;
  certificates: {
    id: string;
    title: string;
    issuingBody: string;
    issuedDate: string;
    validUntil?: string;
    verified: boolean;
    credentialId?: string;
  }[];
  experienceSummary: {
    role: string;
    employer: string;
    period: string;
    highlights: string;
  }[];
}

export interface FatigueAlert {
  id: string;
  workerId: string;
  workerName: string;
  department: string;
  sectorId: SectorType;
  alertType: 'EXCESSIVE_WEEKLY_HOURS' | 'CONSECUTIVE_DAYS' | 'BACK_TO_BACK_SHIFTS';
  severity: 'warning' | 'critical';
  metric: string;
  detail: string;
  recommendedAction: string;
  detectedAt: string;
}

export interface AttritionRiskTeam {
  department: string;
  sectorId: SectorType;
  workerCount: number;
  riskScore: number; // 0 - 100
  riskLevel: 'Low' | 'Medium' | 'High';
  reasons: string[];
  metrics: {
    avgWeeklyHours: number;
    overtimeProportion: number; // percentage
    feedbackScore: number; // out of 5
    unresolvedHazardsCount: number;
  };
  recommendations: string[];
}
