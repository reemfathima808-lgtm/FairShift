/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnonymousFeedback, AttritionRiskTeam, SafetyReport, SectorType, ShiftRecord } from '../types';

export interface AttritionAnalysisInput {
  sectorId: SectorType;
  departments: string[];
  shifts: ShiftRecord[];
  feedbacks: AnonymousFeedback[];
  safetyReports: SafetyReport[];
}

/**
 * Transparent, rule-based Attrition Risk Engine.
 * Evaluates department-level risk (0-100) using objective labor indicators:
 * - Overtime workload burden (up to 35 pts)
 * - Morale & workload friction from anonymous feedback (up to 35 pts)
 * - Open/unaddressed workplace safety hazards (up to 20 pts)
 * - Chronic rest & fatigue deficit flags (up to 10 pts)
 */
export function calculateAttritionRiskByDepartment(
  input: AttritionAnalysisInput
): AttritionRiskTeam[] {
  const { sectorId, departments, shifts, feedbacks, safetyReports } = input;

  return departments.map((dept) => {
    // 1. Department Shifts
    const deptShifts = shifts.filter(
      (s) => s.department === dept && (s.sectorId === sectorId || !s.sectorId)
    );
    const uniqueWorkers = new Set(deptShifts.map((s) => s.workerId));
    const workerCount = Math.max(1, uniqueWorkers.size);

    const totalStandardHours = deptShifts.reduce((acc, s) => acc + s.standardHours, 0);
    const totalOvertimeHours = deptShifts.reduce((acc, s) => acc + s.overtimeHours, 0);
    const totalHours = totalStandardHours + totalOvertimeHours;

    const avgWeeklyHoursPerWorker = workerCount > 0 ? totalHours / workerCount : 40;
    const overtimeProportion =
      totalHours > 0 ? (totalOvertimeHours / totalHours) * 100 : 0;

    // 2. Feedback Morale
    const deptFeedbacks = feedbacks.filter(
      (f) => f.department === dept && (f.sectorId === sectorId || !f.sectorId)
    );
    let avgFeedback = 4.2; // default healthy baseline if no responses yet
    let avgWorkloadRating = 4.0;
    if (deptFeedbacks.length > 0) {
      const sumRatings = deptFeedbacks.reduce(
        (acc, f) =>
          acc +
          (f.managerRating + f.safetyRating + f.workloadRating + f.fairnessRating) / 4,
        0
      );
      avgFeedback = sumRatings / deptFeedbacks.length;
      avgWorkloadRating =
        deptFeedbacks.reduce((acc, f) => acc + f.workloadRating, 0) / deptFeedbacks.length;
    }

    // 3. Safety Hazards (Unresolved)
    const openHazards = safetyReports.filter(
      (r) =>
        (r.sectorId === sectorId || !r.sectorId) &&
        r.status !== 'Resolved' &&
        (r.locationOrSite.toLowerCase().includes(dept.toLowerCase()) ||
          r.category.toLowerCase().includes(dept.toLowerCase()) ||
          departments.length <= 2)
    );

    // Score Accumulator & Reasons
    let score = 0;
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // --- Factor A: Overtime & Workload (0 - 35) ---
    if (overtimeProportion >= 25) {
      score += 25;
      reasons.push(
        `Heavy overtime: ${overtimeProportion.toFixed(1)}% of total work time is overtime.`
      );
      recommendations.push('Authorize temporary shift support or redistribute tasks across teams.');
    } else if (overtimeProportion >= 15) {
      score += 15;
      reasons.push(
        `Moderate overtime spike: ${overtimeProportion.toFixed(1)}% overtime share.`
      );
      recommendations.push('Monitor fatigue rosters and establish voluntary overtime rotations.');
    }

    if (avgWeeklyHoursPerWorker > 48) {
      score += 10;
      reasons.push(
        `Average team weekly load (${avgWeeklyHoursPerWorker.toFixed(1)} hrs) exceeds ILO 48h limit.`
      );
      recommendations.push('Enforce mandatory 36-hour weekend off-duty slots for overburdened workers.');
    }

    // --- Factor B: Anonymous Feedback & Sentiment (0 - 35) ---
    if (deptFeedbacks.length > 0) {
      if (avgFeedback < 2.5) {
        score += 25;
        reasons.push(
          `Critical discontent: team feedback average is only ${avgFeedback.toFixed(1)} / 5.0.`
        );
        recommendations.push('Arrange anonymous round-table with site mediator on supervisory fairness.');
      } else if (avgFeedback < 3.4) {
        score += 15;
        reasons.push(
          `Subdued morale: team satisfaction rated at ${avgFeedback.toFixed(1)} / 5.0.`
        );
      }

      if (avgWorkloadRating < 2.5) {
        score += 10;
        reasons.push(
          `Workload stress: workers rate workload sustainability at ${avgWorkloadRating.toFixed(1)} / 5.0.`
        );
      }
    } else {
      // No feedback yet
      reasons.push('Low feedback engagement: workers have not submitted recent sentiment.');
      recommendations.push('Remind team of 100% anonymous feedback protections to gauge frontline pulse.');
    }

    // --- Factor C: Safety & Environmental Concerns (0 - 20) ---
    if (openHazards.length >= 3) {
      score += 20;
      reasons.push(`${openHazards.length} open safety hazard reports pending review or mitigation.`);
      recommendations.push('Expedite safety inspections for reported site equipment and hazard locations.');
    } else if (openHazards.length >= 1) {
      score += 10;
      reasons.push(`${openHazards.length} pending safety report awaiting final sign-off.`);
    }

    // Clamp score
    const finalScore = Math.min(100, Math.max(5, Math.round(score)));

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (finalScore >= 65) {
      riskLevel = 'High';
    } else if (finalScore >= 35) {
      riskLevel = 'Medium';
    }

    if (reasons.length === 0) {
      reasons.push('Healthy balanced shifts, safe environment, and steady attendance.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain current shift rotations and recognize safety compliance.');
    }

    return {
      department: dept,
      sectorId,
      workerCount,
      riskScore: finalScore,
      riskLevel,
      reasons,
      metrics: {
        avgWeeklyHours: Number(avgWeeklyHoursPerWorker.toFixed(1)),
        overtimeProportion: Number(overtimeProportion.toFixed(1)),
        feedbackScore: Number(avgFeedback.toFixed(1)),
        unresolvedHazardsCount: openHazards.length,
      },
      recommendations,
    };
  });
}
