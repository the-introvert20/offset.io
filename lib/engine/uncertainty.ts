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
 * Calculates confidence bounds and range for a footprint estimate.
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
      overallConfidence: 'MEDIUM',
      confidenceScorePct: 70,
      explanation: 'No activities provided for uncertainty evaluation.',
    };
  }

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
  if (weightedAvgScore >= 80) {
    overallConfidence = 'HIGH';
  } else if (weightedAvgScore < 60) {
    overallConfidence = 'LOW';
  }

  let explanation = '';
  if (overallConfidence === 'HIGH') {
    explanation = 'High confidence due to precise energy meter readings and verified activity inputs.';
  } else if (overallConfidence === 'MEDIUM') {
    explanation = 'Medium confidence based on a mix of exact mileage/billing data and generalized dietary patterns.';
  } else {
    explanation = 'Low confidence due to reliance on high-level consumption estimates. Adding precise bill data will improve accuracy.';
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
  };
}
