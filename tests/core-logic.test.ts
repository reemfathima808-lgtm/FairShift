/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { calculateShiftHours, calculateShiftPay } from '../src/utils/overtime';
import { calculatePayslip } from '../src/utils/payslip';
import { detectFatigueAlerts } from '../src/utils/fatigue';
import { calculateAttritionRiskByDepartment } from '../src/utils/attrition';
import {
  sanitizeAndAnonymizeFeedback,
  aggregateFeedbackResults,
  RawFeedbackSubmission,
} from '../src/utils/anonymizer';
import { ShiftRecord, WorkerProfile } from '../src/types';

describe('1. Overtime Calculation Logic', () => {
  it('correctly calculates regular 8-hour shift without overtime', () => {
    const clockIn = '2026-10-26T08:00:00';
    const clockOut = '2026-10-26T17:00:00'; // 9 hours gross
    const breakMinutes = 60; // 1 hour break => 8 hours net

    const result = calculateShiftHours(clockIn, clockOut, breakMinutes);
    expect(result.netWorkHours).toBe(8);
    expect(result.standardHours).toBe(8);
    expect(result.overtimeHours).toBe(0);
  });

  it('correctly splits standard and overtime hours when working beyond 8 hours', () => {
    const clockIn = '2026-10-26T08:00:00';
    const clockOut = '2026-10-26T19:30:00'; // 11.5 hours gross
    const breakMinutes = 60; // 1 hour break => 10.5 hours net

    const result = calculateShiftHours(clockIn, clockOut, breakMinutes);
    expect(result.netWorkHours).toBe(10.5);
    expect(result.standardHours).toBe(8);
    expect(result.overtimeHours).toBe(2.5);
  });

  it('correctly calculates pay with 1.5x overtime multiplier', () => {
    const standardHours = 8;
    const overtimeHours = 2;
    const hourlyRate = 100; // $100/hr

    const pay = calculateShiftPay(standardHours, overtimeHours, hourlyRate, 1.5);
    expect(pay.standardPay).toBe(800);
    expect(pay.overtimePay).toBe(300); // 2 * 100 * 1.5 = 300
    expect(pay.totalShiftPay).toBe(1100);
  });
});

describe('2. Payslip Calculation & Explanations', () => {
  it('generates itemized payslip with correct gross, deductions and net pay', () => {
    const payslip = calculatePayslip({
      workerId: 'w-test',
      workerName: 'Arun Kumar',
      monthYear: 'October 2026',
      payPeriod: '01 Oct - 31 Oct',
      currency: '₹',
      baseHours: 160,
      baseHourlyRate: 150,
      overtimeHours: 20,
      overtimeMultiplier: 1.5,
      bonuses: 1000,
      deductionConfig: {
        providentFundPct: 0.05, // 5%
        healthInsuranceFlat: 300,
      },
    });

    const expectedBasePay = 160 * 150; // 24,000
    const expectedOtPay = 20 * 150 * 1.5; // 4,500
    const expectedGross = expectedBasePay + expectedOtPay + 1000; // 29,500
    const expectedPf = Math.round(expectedGross * 0.05); // 1,475
    const expectedDeductions = expectedPf + 300; // 1,775
    const expectedNet = expectedGross - expectedDeductions; // 27,725

    expect(payslip.basePay).toBe(expectedBasePay);
    expect(payslip.overtimePay).toBe(expectedOtPay);
    expect(payslip.grossPay).toBe(expectedGross);
    expect(payslip.deductions.totalDeductions).toBe(expectedDeductions);
    expect(payslip.netPay).toBe(expectedNet);

    // Multilingual explanations generated in all 4 languages
    expect(payslip.explanation.en).toContain('160 regular hours');
    expect(payslip.explanation.hi).toContain('160 सामान्य घंटे');
    expect(payslip.explanation.ta).toContain('160 வழக்கமான மணிநேரம்');
    expect(payslip.explanation.te).toContain('160 సాధారణ గంటలు');
  });
});

describe('3. Fatigue Alerts Engine', () => {
  it('flags excessive weekly hours when work hours in a 7-day period exceed 48h', () => {
    const worker: WorkerProfile = {
      id: 'worker-fatigued',
      name: 'Ramesh',
      sectorId: 'construction',
      role: 'Lead Scaffolder',
      department: 'Scaffolding',
      hourlyRate: 140,
      currency: '₹',
      preferredLanguage: 'hi',
      phone: '123',
      employeeCode: 'FS-101',
      joinedDate: '2024-01-01',
      emergencyContact: { name: 'A', phone: '1', relation: 'Spouse' },
      skills: [],
    };

    // 6 shifts of 9 hours net = 54 hours
    const shifts: ShiftRecord[] = [
      '2026-10-21',
      '2026-10-22',
      '2026-10-23',
      '2026-10-24',
      '2026-10-25',
      '2026-10-26',
    ].map((date, idx) => ({
      id: `s-${idx}`,
      workerId: 'worker-fatigued',
      workerName: 'Ramesh',
      sectorId: 'construction',
      department: 'Scaffolding',
      date,
      clockIn: `${date}T08:00:00`,
      clockOut: `${date}T18:00:00`,
      breakMinutes: 60,
      standardHours: 8,
      overtimeHours: 1,
      hourlyRate: 140,
      overtimeMultiplier: 1.5,
      locationName: 'Site',
      checkInMethod: 'qr',
      status: 'completed',
    }));

    const alerts = detectFatigueAlerts(shifts, [worker]);
    const weeklyHoursAlert = alerts.find((a) => a.alertType === 'EXCESSIVE_WEEKLY_HOURS');

    expect(weeklyHoursAlert).toBeDefined();
    expect(weeklyHoursAlert?.severity).toBe('warning');
    expect(weeklyHoursAlert?.detail).toContain('exceeding the 48-hour statutory safe limit');
  });

  it('flags back-to-back shifts with less than 11 hours rest interval', () => {
    const shifts: ShiftRecord[] = [
      {
        id: 's1',
        workerId: 'w-b2b',
        workerName: 'Worker B',
        sectorId: 'healthcare',
        department: 'Emergency',
        date: '2026-10-25',
        clockIn: '2026-10-25T14:00:00',
        clockOut: '2026-10-25T23:00:00', // Ended at 23:00
        breakMinutes: 30,
        standardHours: 8,
        overtimeHours: 0.5,
        hourlyRate: 100,
        overtimeMultiplier: 1.5,
        locationName: 'Ward',
        checkInMethod: 'qr',
        status: 'completed',
      },
      {
        id: 's2',
        workerId: 'w-b2b',
        workerName: 'Worker B',
        sectorId: 'healthcare',
        department: 'Emergency',
        date: '2026-10-26',
        clockIn: '2026-10-26T06:00:00', // Started at 06:00 => only 7 hours turnaround!
        clockOut: '2026-10-26T15:00:00',
        breakMinutes: 30,
        standardHours: 8,
        overtimeHours: 0.5,
        hourlyRate: 100,
        overtimeMultiplier: 1.5,
        locationName: 'Ward',
        checkInMethod: 'qr',
        status: 'completed',
      },
    ];

    const alerts = detectFatigueAlerts(shifts);
    const b2bAlert = alerts.find((a) => a.alertType === 'BACK_TO_BACK_SHIFTS');

    expect(b2bAlert).toBeDefined();
    expect(b2bAlert?.metric).toContain('7.0 hrs rest');
    expect(b2bAlert?.severity).toBe('critical'); // < 8h is critical
  });
});

describe('4. Transparent Attrition-Risk Scoring', () => {
  it('assigns high risk score and lists concrete drivers when overtime is high and morale is low', () => {
    const shifts: ShiftRecord[] = [
      {
        id: 's1',
        workerId: 'w1',
        workerName: 'Worker 1',
        sectorId: 'construction',
        department: 'Scaffolding',
        date: '2026-10-26',
        clockIn: '2026-10-26T07:00:00',
        clockOut: '2026-10-26T19:00:00',
        breakMinutes: 60,
        standardHours: 8,
        overtimeHours: 3, // 3 / 11 = 27% overtime
        hourlyRate: 100,
        overtimeMultiplier: 1.5,
        locationName: 'Site',
        checkInMethod: 'qr',
        status: 'completed',
      },
    ];

    const feedbacks = [
      {
        id: 'fb1',
        sectorId: 'construction' as const,
        department: 'Scaffolding',
        submittedAt: '2026-10-26',
        managerRating: 2,
        safetyRating: 2,
        workloadRating: 1, // high stress
        fairnessRating: 2,
      },
    ];

    const safetyReports = [
      {
        id: 'saf1',
        anonymousId: 'anon1',
        sectorId: 'construction' as const,
        locationOrSite: 'Scaffolding Bay',
        category: 'Fall Risk',
        severity: 'Critical' as const,
        description: 'Unsecured plank',
        status: 'Reported' as const,
        createdAt: '2026-10-26T10:00:00',
      },
      {
        id: 'saf2',
        anonymousId: 'anon2',
        sectorId: 'construction' as const,
        locationOrSite: 'Scaffolding Bay',
        category: 'Fall Risk',
        severity: 'High' as const,
        description: 'Loose clamp',
        status: 'Under Review' as const,
        createdAt: '2026-10-26T11:00:00',
      },
      {
        id: 'saf3',
        anonymousId: 'anon3',
        sectorId: 'construction' as const,
        locationOrSite: 'Scaffolding Bay',
        category: 'Fall Risk',
        severity: 'High' as const,
        description: 'Missing toe board',
        status: 'Reported' as const,
        createdAt: '2026-10-26T12:00:00',
      },
    ];

    const teams = calculateAttritionRiskByDepartment({
      sectorId: 'construction',
      departments: ['Scaffolding'],
      shifts,
      feedbacks,
      safetyReports,
    });

    expect(teams.length).toBe(1);
    const scaffoldingTeam = teams[0];

    // Score should reflect all three factors (heavy OT + low morale + 3 open hazards)
    expect(scaffoldingTeam.riskScore).toBeGreaterThanOrEqual(65);
    expect(scaffoldingTeam.riskLevel).toBe('High');

    // Transparent explanations
    expect(scaffoldingTeam.reasons.some((r) => r.includes('overtime'))).toBe(true);
    expect(scaffoldingTeam.reasons.some((r) => r.includes('Critical discontent'))).toBe(true);
    expect(scaffoldingTeam.reasons.some((r) => r.includes('open safety hazard reports'))).toBe(true);
    expect(scaffoldingTeam.recommendations.length).toBeGreaterThan(0);
  });
});

describe('5. Anonymisation and Privacy Aggregation', () => {
  it('strictly scrubs all personal and device identifiers from feedback submission', () => {
    const rawSubmission: RawFeedbackSubmission = {
      sectorId: 'construction',
      department: 'Masonry',
      managerRating: 5,
      safetyRating: 4,
      workloadRating: 3,
      fairnessRating: 4,
      comments: 'Site engineer was very fair today. <script>alert("hack")</script>',
      _workerId: 'worker-sensitive-9982',
      _workerName: 'Secret Worker',
      _deviceFingerprint: 'iphone-14-pro-device-id',
      _ipAddress: '192.168.1.104',
    };

    const sanitized = sanitizeAndAnonymizeFeedback(rawSubmission);

    // Private properties are completely absent in output object
    expect((sanitized as unknown as Record<string, unknown>)['_workerId']).toBeUndefined();
    expect((sanitized as unknown as Record<string, unknown>)['_workerName']).toBeUndefined();
    expect((sanitized as unknown as Record<string, unknown>)['_deviceFingerprint']).toBeUndefined();
    expect((sanitized as unknown as Record<string, unknown>)['_ipAddress']).toBeUndefined();

    // Timestamp is coarsened to YYYY-MM-DD (no hour/minute/second correlation)
    expect(sanitized.submittedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // HTML script tags stripped
    expect(sanitized.comments).not.toContain('<script>');
    expect(sanitized.comments).toContain('Site engineer was very fair today.');
  });

  it('aggregates anonymous feedback into macro climate metrics without individual tracing', () => {
    const feedbacks = [
      {
        id: 'anon-1',
        sectorId: 'education' as const,
        department: 'Security',
        submittedAt: '2026-10-26',
        managerRating: 4,
        safetyRating: 5,
        workloadRating: 3,
        fairnessRating: 4,
      },
      {
        id: 'anon-2',
        sectorId: 'education' as const,
        department: 'Security',
        submittedAt: '2026-10-26',
        managerRating: 2,
        safetyRating: 3,
        workloadRating: 1,
        fairnessRating: 2,
      },
    ];

    const aggregates = aggregateFeedbackResults(feedbacks);

    expect(aggregates.totalSubmissions).toBe(2);
    expect(aggregates.averageManagerRating).toBe(3.0);
    expect(aggregates.averageSafetyRating).toBe(4.0);
    expect(aggregates.averageWorkloadRating).toBe(2.0);
    expect(aggregates.averageFairnessRating).toBe(3.0);
    expect(aggregates.overallMoraleScore).toBe(3.0);
  });
});
