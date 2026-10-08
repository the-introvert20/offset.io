/**
 * Uncertainty and Confidence Subsystem for offset.io
 * Calculates overall confidence level, error margins, and likely emission ranges.
 */

import { ConfidenceLevel, SingleCalculationResult } from './calculator';

export interface UncertaintyAssessment {
  estimatedAnnualKg: number;
  estimatedAnnualTonnes: number;
  minAnnualKg: number;
  maxAnnualKg: number;
  minAnnualTonnes: number;
  maxAnnualTonnes: number;
  overallConfidence: ConfidenceLevel;
  confidenceScorePct: number; // e.g. 85%
  explanation: string;
  isIncomplete?: boolean;
  missingCategories?: string[];
}

const CONFIDENCE_MARGINS: Record<ConfidenceLevel, number> = {
  HIGH: 0.05,   // ±5%
  MEDIUM: 0.15, // ±15%
  LOW: 0.30,    // ±30%
};

const CONFIDENCE_SCORES: Record<ConfidenceLevel, number> = {
  HIGH: 90,
  MEDIUM: 70,
  LOW: 40,
};

/**
 * Calculates conservative confidence bounds and range for a footprint estimate.
 * Note: Bounds represent worst-case linear combinations covering emission-factor
 * measurement uncertainty, not user input measurement variance.
 */
export function calculateUncertainty(calculations: SingleCalculationResult[]): UncertaintyAssessment {
  if (!calculations || calculations.length === 0) {
    return {
      estimatedAnnualKg: 0,
      estimatedAnnualTonnes: 0,
      minAnnualKg: 0,
      maxAnnualKg: 0,
      minAnnualTonnes: 0,
      maxAnnualTonnes: 0,
      overallConfidence: 'LOW',
      confidenceScorePct: 0,
      explanation: 'No activities provided for uncertainty evaluation.',
      isIncomplete: true,
      missingCategories: ['Transport', 'Home energy', 'Food', 'Goods & waste'],
    };
  }

  // Check completeness across core sectors
  const presentCategories = new Set(calculations.map((c) => c.category));
  const missing: string[] = [];
  if (!presentCategories.has('TRANSPORTATION')) missing.push('Transport');
  if (!presentCategories.has('ENERGY')) missing.push('Home energy');
  if (!presentCategories.has('FOOD')) missing.push('Food');
  if (!presentCategories.has('CONSUMPTION') && !presentCategories.has('WASTE')) missing.push('Goods & waste');

  const isIncomplete = missing.length > 0;

  let totalEstKg = 0;
  let totalMinKg = 0;
  let totalMaxKg = 0;
  let weightedScoreSum = 0;

  for (const calc of calculations) {
    const margin = CONFIDENCE_MARGINS[calc.confidenceLevel] || 0.15;
    const score = CONFIDENCE_SCORES[calc.confidenceLevel] || 70;

    const minKg = calc.annualEmissionsKg * (1 - margin);
    const maxKg = calc.annualEmissionsKg * (1 + margin);

    totalEstKg += calc.annualEmissionsKg;
    totalMinKg += minKg;
    totalMaxKg += maxKg;
    weightedScoreSum += score * calc.annualEmissionsKg;
  }

  const weightedAvgScore = totalEstKg > 0 ? weightedScoreSum / totalEstKg : 70;

  let overallConfidence: ConfidenceLevel = 'MEDIUM';
  if (isIncomplete) {
    overallConfidence = 'LOW';
  } else if (weightedAvgScore >= 80) {
    overallConfidence = 'HIGH';
  } else if (weightedAvgScore < 60) {
    overallConfidence = 'LOW';
  }

  let explanation = '';
  if (isIncomplete) {
    explanation = `Incomplete footprint: missing ${missing.join(', ')}. Margin ±% covers emission-factor data uncertainty on logged activities.`;
  } else if (overallConfidence === 'HIGH') {
    explanation = 'High confidence: based on regionally calibrated emission factors (±5% data uncertainty margin).';
  } else if (overallConfidence === 'MEDIUM') {
    explanation = 'Medium confidence: mix of high-certainty grid factors and generalized dietary/lifecycle averages.';
  } else {
    explanation = 'Low confidence: relies on high-level consumption estimates. Adding precise utility/travel data improves accuracy.';
  }

  return {
    estimatedAnnualKg: parseFloat(totalEstKg.toFixed(2)),
    estimatedAnnualTonnes: parseFloat((totalEstKg / 1000).toFixed(2)),
    minAnnualKg: parseFloat(totalMinKg.toFixed(2)),
    maxAnnualKg: parseFloat(totalMaxKg.toFixed(2)),
    minAnnualTonnes: parseFloat((totalMinKg / 1000).toFixed(2)),
    maxAnnualTonnes: parseFloat((totalMaxKg / 1000).toFixed(2)),
    overallConfidence,
    confidenceScorePct: Math.round(weightedAvgScore),
    explanation,
    isIncomplete,
    missingCategories: missing,
  };
}
