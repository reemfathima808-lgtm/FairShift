/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FatigueAlert, ShiftRecord, WorkerProfile } from '../types';

/**
 * Checks shift records for fatigue risks according to UN SDG 8 and ILO standards:
 * 1. Weekly work hours exceeding 48 hours in a 7-day period.
 * 2. Consecutive work days exceeding 6 days without a rest day.
 * 3. Back-to-back shifts with less than 11 hours rest between end and start.
 */
export function detectFatigueAlerts(
  shifts: ShiftRecord[],
  workers: WorkerProfile[] = []
): FatigueAlert[] {
  const alerts: FatigueAlert[] = [];
  const workerMap = new Map(workers.map((w) => [w.id, w]));

  // Group completed shifts by worker
  const shiftsByWorker = new Map<string, ShiftRecord[]>();
  for (const shift of shifts) {
    if (!shiftsByWorker.has(shift.workerId)) {
      shiftsByWorker.set(shift.workerId, []);
    }
    shiftsByWorker.get(shift.workerId)!.push(shift);
  }

  for (const [workerId, workerShifts] of shiftsByWorker.entries()) {
    const worker = workerMap.get(workerId);
    const workerName = worker?.name || workerShifts[0]?.workerName || 'Worker';
    const department = worker?.department || workerShifts[0]?.department || 'General';
    const sectorId = worker?.sectorId || workerShifts[0]?.sectorId || 'construction';

    // Sort chronologically by clockIn
    const sortedShifts = [...workerShifts].sort(
      (a, b) => new Date(a.clockIn).getTime() - new Date(b.clockIn).getTime()
    );

    // 1. Weekly Hours Check (Last 7 days relative to the latest shift)
    const latestDate = sortedShifts.length > 0 
      ? new Date(sortedShifts[sortedShifts.length - 1].clockIn)
      : new Date();
    
    const sevenDaysAgo = new Date(latestDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentShifts = sortedShifts.filter(
      (s) => new Date(s.clockIn) >= sevenDaysAgo && new Date(s.clockIn) <= latestDate
    );

    const totalWeeklyHours = recentShifts.reduce(
      (sum, s) => sum + (s.standardHours + s.overtimeHours),
      0
    );

    if (totalWeeklyHours > 48) {
      alerts.push({
        id: `fatigue-hours-${workerId}-${latestDate.toISOString().slice(0, 10)}`,
        workerId,
        workerName,
        department,
        sectorId,
        alertType: 'EXCESSIVE_WEEKLY_HOURS',
        severity: totalWeeklyHours > 58 ? 'critical' : 'warning',
        metric: `${totalWeeklyHours.toFixed(1)} hrs in 7 days`,
        detail: `Worker logged ${totalWeeklyHours.toFixed(1)} hours over the last 7 days, exceeding the 48-hour statutory safe limit.`,
        recommendedAction: 'Schedule an immediate rest day and reassign upcoming overtime to reserve pool.',
        detectedAt: latestDate.toISOString(),
      });
    }

    // 2. Consecutive Days Check
    const uniqueDays = Array.from(
      new Set(sortedShifts.map((s) => s.date || s.clockIn.slice(0, 10)))
    ).sort();

    let consecutiveCount = 0;
    let maxConsecutive = 0;
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        consecutiveCount = 1;
      } else {
        const prev = new Date(uniqueDays[i - 1]).getTime();
        const curr = new Date(uniqueDays[i]).getTime();
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          consecutiveCount++;
        } else if (diffDays > 1) {
          consecutiveCount = 1;
        }
      }
      if (consecutiveCount > maxConsecutive) {
        maxConsecutive = consecutiveCount;
      }
    }

    if (maxConsecutive >= 6) {
      alerts.push({
        id: `fatigue-consec-${workerId}-${uniqueDays[uniqueDays.length - 1] || 'current'}`,
        workerId,
        workerName,
        department,
        sectorId,
        alertType: 'CONSECUTIVE_DAYS',
        severity: maxConsecutive >= 8 ? 'critical' : 'warning',
        metric: `${maxConsecutive} consecutive days`,
        detail: `Worker has completed ${maxConsecutive} continuous shifts without a 24-hour mandatory rest cycle.`,
        recommendedAction: 'Enforce a minimum 36-hour weekend/rest period before next roster assignment.',
        detectedAt: latestDate.toISOString(),
      });
    }

    // 3. Back-to-Back Shifts Check (< 11 hours rest interval)
    for (let i = 0; i < sortedShifts.length - 1; i++) {
      const current = sortedShifts[i];
      const next = sortedShifts[i + 1];

      if (current.clockOut && next.clockIn) {
        const currentEnd = new Date(current.clockOut).getTime();
        const nextStart = new Date(next.clockIn).getTime();
        const restIntervalHours = (nextStart - currentEnd) / (1000 * 60 * 60);

        // Less than 11 hours rest interval between shifts
        if (restIntervalHours > 0 && restIntervalHours < 11) {
          alerts.push({
            id: `fatigue-b2b-${workerId}-${next.id}`,
            workerId,
            workerName,
            department,
            sectorId,
            alertType: 'BACK_TO_BACK_SHIFTS',
            severity: restIntervalHours < 8 ? 'critical' : 'warning',
            metric: `${restIntervalHours.toFixed(1)} hrs rest`,
            detail: `Shift turnaround was only ${restIntervalHours.toFixed(1)} hours between clock-out on ${new Date(current.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} and next clock-in.`,
            recommendedAction: 'Adjust shift rotations to guarantee at least 11 continuous hours between shifts.',
            detectedAt: next.clockIn,
          });
          break; // Flag once per worker to avoid alert spam
        }
      }
    }
  }

  return alerts;
}
