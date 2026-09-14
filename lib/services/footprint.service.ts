import { prisma } from '@/lib/db';
import { calculateFootprint, type CalculationInput, type FootprintResult, type Category, type Frequency } from '@/lib/engine/calculator';
import { calculateUncertainty, type UncertaintyAssessment } from '@/lib/engine/uncertainty';
import { emissionFactorService, type EmissionFactorResult } from './emission-factor.service';

type ActivityInput = { id?: string; category: Category | string; activityType: string; subtype: string; frequency: Frequency | string; quantity: number; unit: string; region?: string };
export interface FootprintCalculationResult { footprint: FootprintResult; uncertainty: UncertaintyAssessment; calculationInputs: Array<CalculationInput & { factorDetails: EmissionFactorResult }>; }
export interface FootprintServiceOptions { userId: string; persistCalculation?: boolean; }

export class FootprintService {
  async calculateUserFootprint(options: FootprintServiceOptions): Promise<FootprintCalculationResult> {
    const activities = await prisma.activity.findMany({ where: { userId: options.userId } });
    const result = await this.calculateFootprintFromActivities(activities.map((activity) => ({
      id: activity.id, category: activity.category, activityType: activity.activityType, subtype: activity.subtype,
      frequency: activity.frequency, quantity: activity.quantity, unit: activity.unit, region: activity.region || undefined,
    })));
    if (options.persistCalculation) await this.persistCalculationAudit(options.userId, result);
    return result;
  }

  async calculateFootprintFromActivities(activities: ActivityInput[]): Promise<FootprintCalculationResult> {
    const identified = activities.map((activity, index) => ({
      id: activity.id ?? `activity-${index}`, category: activity.category as Category, activityType: activity.activityType,
      subtype: activity.subtype, frequency: activity.frequency as Frequency, quantity: activity.quantity,
      unit: activity.unit, region: activity.region,
    }));
    const [resolvedInputs, factorDetails] = await Promise.all([
      emissionFactorService.activitiesToCalculationInputs(identified),
      emissionFactorService.resolveFactorsForActivities(identified.map(({ id, category, activityType, subtype, region, unit }) => ({
        id, category, activity: activityType, subtype, region, unit,
      }))),
    ]);
    const inputsWithDetails = resolvedInputs.map((input) => ({
      ...input, factorDetails: factorDetails.get(input.id!)!,
    }));
    const calculationInputs: CalculationInput[] = inputsWithDetails.map(({ factorDetails: _factorDetails, ...input }) => input);
    const footprint = calculateFootprint(calculationInputs);
    return { footprint, uncertainty: calculateUncertainty(footprint.calculations), calculationInputs: inputsWithDetails };
  }

  async calculateScenarioFootprint(scenarioId: string): Promise<FootprintCalculationResult> {
    const scenario = await prisma.scenario.findUnique({ where: { id: scenarioId }, include: { activities: true } });
    if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);
    return this.calculateFootprintFromActivities(scenario.activities);
  }

  getCategoryBreakdown(footprint: FootprintResult) {
    return (Object.keys(footprint.categoryBreakdown) as Category[])
      .map((category) => footprint.categoryBreakdown[category]).filter((category) => category.annualEmissionsKg > 0);
  }

  getLargestCategory(footprint: FootprintResult): Category { return footprint.largestCategory; }

  calculateProgressToTarget(currentAnnualKg: number, targetAnnualKg: number) {
    if (targetAnnualKg <= 0) return { progressPct: 0, isOverTarget: false, kgDifference: currentAnnualKg, status: 'over' as const };
    const difference = targetAnnualKg - currentAnnualKg;
    return {
      progressPct: Math.min(100, Math.max(-100, Math.round(difference / targetAnnualKg * 100))),
      isOverTarget: difference < 0, kgDifference: Math.abs(difference),
      status: difference > 0 ? 'under' as const : difference < 0 ? 'over' as const : 'at' as const,
    };
  }

  private async persistCalculationAudit(userId: string, result: FootprintCalculationResult) {
    const margins = result.uncertainty.estimatedAnnualKg > 0
      ? (result.uncertainty.maxAnnualKg - result.uncertainty.estimatedAnnualKg) / result.uncertainty.estimatedAnnualKg : 0;
    await prisma.calculation.createMany({ data: result.calculationInputs.map((input) => {
      const calculation = result.footprint.calculations.find((item) => item.activityId === input.id)!;
      return {
        userId, category: calculation.category, activityType: calculation.activityType,
        annualEmissionsKg: calculation.annualEmissionsKg, monthlyEmissionsKg: calculation.monthlyEmissionsKg,
        dailyEmissionsKg: calculation.dailyEmissionsKg, factorUsed: calculation.factorUsed, formula: calculation.formula,
        confidenceLevel: calculation.confidenceLevel, minEmissionsKg: calculation.annualEmissionsKg * (1 - margins),
        maxEmissionsKg: calculation.annualEmissionsKg * (1 + margins),
        breakdownJson: JSON.stringify({ activity: input, factor: input.factorDetails, methodologyVersion: 'calculator-v1' }),
      };
    }) });
  }
}

export const footprintService = new FootprintService();
