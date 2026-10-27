/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShiftHoursBreakdown {
  totalGrossHours: number;
  breakHours: number;
  netWorkHours: number;
  standardHours: number;
  overtimeHours: number;
}

/**
 * Calculates net worked hours and splits into standard and overtime hours.
 * Based on standard 8-hour workday per UN SDG 8 and ILO guidelines.
 */
export function calculateShiftHours(
  clockInTime: string | Date,
  clockOutTime: string | Date,
  breakMinutes: number = 60,
  standardDayHoursCap: number = 8
): ShiftHoursBreakdown {
  const start = typeof clockInTime === 'string' ? new Date(clockInTime) : clockInTime;
  const end = typeof clockOutTime === 'string' ? new Date(clockOutTime) : clockOutTime;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0 || isNaN(diffMs)) {
    return {
      totalGrossHours: 0,
      breakHours: 0,
      netWorkHours: 0,
      standardHours: 0,
      overtimeHours: 0,
    };
  }

  const totalGrossHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  const breakHours = Number((Math.max(0, breakMinutes) / 60).toFixed(2));
  const netWorkHours = Math.max(0, Number((totalGrossHours - breakHours).toFixed(2)));

  const standardHours = Math.min(netWorkHours, standardDayHoursCap);
  const overtimeHours = Number(Math.max(0, netWorkHours - standardDayHoursCap).toFixed(2));

  return {
    totalGrossHours,
    breakHours,
    netWorkHours,
    standardHours: Number(standardHours.toFixed(2)),
    overtimeHours,
  };
}

/**
 * Calculates earnings for a shift given standard & overtime hours and rate.
 * Standard overtime rate is typically 1.5x regular pay.
 */
export function calculateShiftPay(
  standardHours: number,
  overtimeHours: number,
  baseHourlyRate: number,
  overtimeMultiplier: number = 1.5
): {
  standardPay: number;
  overtimePay: number;
  totalShiftPay: number;
} {
  const safeStandard = Math.max(0, standardHours);
  const safeOvertime = Math.max(0, overtimeHours);
  const safeRate = Math.max(0, baseHourlyRate);

  const standardPay = Number((safeStandard * safeRate).toFixed(2));
  const overtimePay = Number((safeOvertime * safeRate * overtimeMultiplier).toFixed(2));
  const totalShiftPay = Number((standardPay + overtimePay).toFixed(2));

  return {
    standardPay,
    overtimePay,
    totalShiftPay,
  };
}
