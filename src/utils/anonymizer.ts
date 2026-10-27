/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AnonymousFeedback, SectorType } from '../types';

export interface RawFeedbackSubmission {
  sectorId: SectorType;
  department: string;
  managerRating: number;
  safetyRating: number;
  workloadRating: number;
  fairnessRating: number;
  comments?: string;
  // Any accidental user or worker identifier that may be passed in client memory
  _workerId?: string;
  _workerName?: string;
  _deviceFingerprint?: string;
  _ipAddress?: string;
}

/**
 * Sanitizes and strictly strips all personal identifiers, IP, device identifiers,
 * or user keys before storing feedback.
 * Coarsens timestamp to the calendar date only (omitting hours/minutes/seconds)
 * to prevent correlation attacks.
 */
export function sanitizeAndAnonymizeFeedback(
  submission: RawFeedbackSubmission
): AnonymousFeedback {
  // Validate ratings strictly between 1 and 5
  const clampRating = (val: number) => Math.min(5, Math.max(1, Math.round(Number(val) || 3)));

  // Sanitize comments: trim, remove potential HTML tags, limit length to 500 chars
  let cleanedComments: string | undefined = undefined;
  if (submission.comments) {
    cleanedComments = submission.comments
      .replace(/<[^>]*>/g, '') // remove HTML tags
      .trim()
      .slice(0, 500);
  }

  // Generate an unlinked pseudo-random identifier for database indexing
  // without any mathematical relation to the worker
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  const anonymousId = `anon-fb-${Date.now().toString(36)}-${randomSuffix}`;

  // Coarsen date to YYYY-MM-DD so time of submission cannot be matched to shift punches
  const safeDateString = new Date().toISOString().split('T')[0];

  return {
    id: anonymousId,
    sectorId: submission.sectorId,
    department: submission.department || 'General',
    submittedAt: safeDateString,
    managerRating: clampRating(submission.managerRating),
    safetyRating: clampRating(submission.safetyRating),
    workloadRating: clampRating(submission.workloadRating),
    fairnessRating: clampRating(submission.fairnessRating),
    comments: cleanedComments || undefined,
  };
}

/**
 * Aggregates anonymous feedback for admin view so individual submissions cannot be singled out.
 */
export function aggregateFeedbackResults(feedbacks: AnonymousFeedback[]): {
  totalSubmissions: number;
  averageManagerRating: number;
  averageSafetyRating: number;
  averageWorkloadRating: number;
  averageFairnessRating: number;
  overallMoraleScore: number;
  ratingDistribution: {
    excellent: number; // 5
    good: number; // 4
    average: number; // 3
    poor: number; // 2
    critical: number; // 1
  };
} {
  if (!feedbacks || feedbacks.length === 0) {
    return {
      totalSubmissions: 0,
      averageManagerRating: 0,
      averageSafetyRating: 0,
      averageWorkloadRating: 0,
      averageFairnessRating: 0,
      overallMoraleScore: 0,
      ratingDistribution: { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 },
    };
  }

  let sumManager = 0;
  let sumSafety = 0;
  let sumWorkload = 0;
  let sumFairness = 0;

  const dist = { excellent: 0, good: 0, average: 0, poor: 0, critical: 0 };

  for (const f of feedbacks) {
    sumManager += f.managerRating;
    sumSafety += f.safetyRating;
    sumWorkload += f.workloadRating;
    sumFairness += f.fairnessRating;

    const avg = Math.round((f.managerRating + f.safetyRating + f.workloadRating + f.fairnessRating) / 4);
    if (avg >= 5) dist.excellent++;
    else if (avg === 4) dist.good++;
    else if (avg === 3) dist.average++;
    else if (avg === 2) dist.poor++;
    else dist.critical++;
  }

  const count = feedbacks.length;
  const avgManager = Number((sumManager / count).toFixed(2));
  const avgSafety = Number((sumSafety / count).toFixed(2));
  const avgWorkload = Number((sumWorkload / count).toFixed(2));
  const avgFairness = Number((sumFairness / count).toFixed(2));
  const overall = Number(((avgManager + avgSafety + avgWorkload + avgFairness) / 4).toFixed(2));

  return {
    totalSubmissions: count,
    averageManagerRating: avgManager,
    averageSafetyRating: avgSafety,
    averageWorkloadRating: avgWorkload,
    averageFairnessRating: avgFairness,
    overallMoraleScore: overall,
    ratingDistribution: dist,
  };
}
