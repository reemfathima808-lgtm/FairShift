/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode, Payslip } from '../types';

export interface PayslipComputationParams {
  workerId: string;
  workerName: string;
  monthYear: string;
  payPeriod: string;
  currency: string;
  baseHours: number;
  baseHourlyRate: number;
  overtimeHours: number;
  overtimeMultiplier?: number;
  bonuses?: number;
  deductionConfig?: {
    providentFundPct?: number; // e.g. 0.05 (5%)
    healthInsuranceFlat?: number;
    safetyKitOrAdvance?: number;
  };
}

/**
 * Computes a transparent, fair payslip with breakdown of gross earnings,
 * statutory/safety deductions, and take-home pay.
 */
export function calculatePayslip(params: PayslipComputationParams): Payslip {
  const {
    workerId,
    workerName,
    monthYear,
    payPeriod,
    currency,
    baseHours,
    baseHourlyRate,
    overtimeHours,
    overtimeMultiplier = 1.5,
    bonuses = 0,
    deductionConfig = {},
  } = params;

  const basePay = Math.round(baseHours * baseHourlyRate);
  const overtimePay = Math.round(overtimeHours * baseHourlyRate * overtimeMultiplier);
  const grossPay = basePay + overtimePay + bonuses;

  const pfPct = deductionConfig.providentFundPct ?? 0.04;
  const providentFundOrTax = Math.round(grossPay * pfPct);
  const healthInsurance = deductionConfig.healthInsuranceFlat ?? 250;
  const safetyKitOrAdvance = deductionConfig.safetyKitOrAdvance ?? 0;

  const totalDeductions = providentFundOrTax + healthInsurance + safetyKitOrAdvance;
  const netPay = Math.max(0, grossPay - totalDeductions);

  const explanation = generateMultilingualExplanation({
    workerName,
    monthYear,
    currency,
    baseHours,
    basePay,
    overtimeHours,
    overtimePay,
    bonuses,
    totalDeductions,
    netPay,
  });

  return {
    id: `pay-${workerId}-${monthYear.replace(/\s+/g, '-').toLowerCase()}`,
    workerId,
    workerName,
    monthYear,
    payPeriod,
    currency,
    baseHours,
    baseHourlyRate,
    basePay,
    overtimeHours,
    overtimePay,
    bonuses,
    grossPay,
    deductions: {
      providentFundOrTax,
      healthInsurance,
      safetyKitOrAdvance,
      totalDeductions,
    },
    netPay,
    status: 'paid',
    paymentDate: '2026-10-25',
    explanation,
  };
}

interface ExplanationInput {
  workerName: string;
  monthYear: string;
  currency: string;
  baseHours: number;
  basePay: number;
  overtimeHours: number;
  overtimePay: number;
  bonuses: number;
  totalDeductions: number;
  netPay: number;
}

export function generateMultilingualExplanation(input: ExplanationInput): Record<LanguageCode, string> {
  const { currency, baseHours, basePay, overtimeHours, overtimePay, bonuses, totalDeductions, netPay } = input;

  return {
    en: `For this month, you completed ${baseHours} regular hours earning ${currency}${basePay.toLocaleString()}. You also completed ${overtimeHours} overtime hours at 1.5x pay rate, earning ${currency}${overtimePay.toLocaleString()}${bonuses > 0 ? ` plus ${currency}${bonuses.toLocaleString()} bonus` : ''}. After deductions of ${currency}${totalDeductions.toLocaleString()} for social security and insurance, your final take-home salary is ${currency}${netPay.toLocaleString()}. Every single hour was counted.`,
    
    hi: `इस महीने आपने ${baseHours} सामान्य घंटे काम किया, जिससे ${currency}${basePay.toLocaleString()} की आय हुई। आपने ${overtimeHours} अतिरिक्त (ओवरटाइम) घंटे 1.5 गुना दर पर काम किए, जिससे ${currency}${overtimePay.toLocaleString()} प्राप्त हुए। सामाजिक सुरक्षा और स्वास्थ्य बीमा के ${currency}${totalDeductions.toLocaleString()} कटौती के बाद, आपकी अंतिम शुद्ध राशि ${currency}${netPay.toLocaleString()} है। आपका हर एक घंटा सुरक्षित रूप से दर्ज किया गया है।`,
    
    ta: `இந்த மாதத்தில் நீங்கள் ${baseHours} வழக்கமான மணிநேரம் வேலை செய்து ${currency}${basePay.toLocaleString()} சம்பாதித்தீர்கள். மேலும் ${overtimeHours} கூடுதல் பணி நேரத்திற்கு 1.5 மடங்கு விகிதத்தில் ${currency}${overtimePay.toLocaleString()} பெற்றுள்ளீர்கள். வருங்கால வைப்பு நிதி மற்றும் காப்பீட்டுக்கான ${currency}${totalDeductions.toLocaleString()} பிடித்தத்திற்குப் பிறகு, உங்கள் நிகர ஊதியம் ${currency}${netPay.toLocaleString()} ஆகும். நீங்கள் உழைத்த ஒவ்வொரு மணிநேரமும் துல்லியமாகக் கணக்கிடப்பட்டுள்ளது.`,
    
    te: `ఈ నెలలో మీరు ${baseHours} సాధారణ గంటలు పని చేసి ${currency}${basePay.toLocaleString()} సంపాదించారు. మీరు 1.5 రెట్లు వేతనంతో ${overtimeHours} ఓవర్‌టైమ్ గంటలు పని చేసి ${currency}${overtimePay.toLocaleString()} పొందారు. భవిష్య నిధి మరియు బీమా కోసం ${currency}${totalDeductions.toLocaleString()} మినహాయింపుల తర్వాత, మీ నికర జీతం ${currency}${netPay.toLocaleString()}. మీరు పనిచేసిన ప్రతి గంట పారదర్శకంగా లెక్కించబడింది.`
  };
}
