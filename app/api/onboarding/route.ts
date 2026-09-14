import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { footprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const regionSchema = z.enum(['US', 'EU', 'UK', 'IN', 'GLOBAL']);
const onboardingSchema = z.object({
  region: regionSchema.default('GLOBAL'), dietPattern: z.string().min(1).default('MIXED'),
  hasVehicle: z.boolean(), vehicleType: z.string().min(1).optional(),
  vehicleDistanceKmMonth: z.number().min(0).default(0), electricityKwhMonth: z.number().min(0).default(0),
  flightKmYear: z.number().min(0).default(0), wasteKgMonth: z.number().min(0).default(0),
});

const gridSubtype = (region: string) => `grid_${region.toLowerCase()}`;

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const parsed = onboardingSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'INVALID_ACTIVITY', details: parsed.error.flatten() }, { status: 400 });
    const input = parsed.data;
    const activities = [
      input.hasVehicle && input.vehicleDistanceKmMonth > 0 && { category: 'TRANSPORTATION', activityType: 'car', subtype: input.vehicleType ?? 'petrol', frequency: 'MONTHLY', quantity: input.vehicleDistanceKmMonth, unit: 'km', region: input.region },
      input.flightKmYear > 0 && { category: 'TRANSPORTATION', activityType: 'flight', subtype: 'short_haul', frequency: 'YEARLY', quantity: input.flightKmYear, unit: 'km', region: 'GLOBAL' },
      input.electricityKwhMonth > 0 && { category: 'ENERGY', activityType: 'electricity', subtype: gridSubtype(input.region), frequency: 'MONTHLY', quantity: input.electricityKwhMonth, unit: 'kWh', region: input.region },
      { category: 'FOOD', activityType: 'diet', subtype: input.dietPattern.toLowerCase(), frequency: 'DAILY', quantity: 1, unit: 'day', region: 'GLOBAL' },
      input.wasteKgMonth > 0 && { category: 'WASTE', activityType: 'waste', subtype: 'landfill', frequency: 'MONTHLY', quantity: input.wasteKgMonth, unit: 'kg', region: 'GLOBAL' },
    ].filter(Boolean) as Array<any>;

    // Pre-validate factors and calculate footprint before mutating baseline
    const calculationResult = await footprintService.calculateFootprintFromActivities(activities);

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { userId: user.userId },
        data: { region: input.region, dietPattern: input.dietPattern, onboardingComplete: true },
      });
      await tx.activity.deleteMany({ where: { userId: user.userId } });
      await tx.activity.createMany({
        data: activities.map((activity) => ({ userId: user.userId, ...activity })),
      });

      const margins = calculationResult.uncertainty.estimatedAnnualKg > 0
        ? (calculationResult.uncertainty.maxAnnualKg - calculationResult.uncertainty.estimatedAnnualKg) / calculationResult.uncertainty.estimatedAnnualKg
        : 0;

      await tx.calculation.createMany({
        data: calculationResult.calculationInputs.map((inputItem) => {
          const item = calculationResult.footprint.calculations.find((calc) => calc.activityId === inputItem.id)!;
          return {
            userId: user.userId,
            category: item.category,
            activityType: item.activityType,
            annualEmissionsKg: item.annualEmissionsKg,
            monthlyEmissionsKg: item.monthlyEmissionsKg,
            dailyEmissionsKg: item.dailyEmissionsKg,
            factorUsed: item.factorUsed,
            formula: item.formula,
            confidenceLevel: item.confidenceLevel,
            minEmissionsKg: item.annualEmissionsKg * (1 - margins),
            maxEmissionsKg: item.annualEmissionsKg * (1 + margins),
            breakdownJson: JSON.stringify({ activity: inputItem, factor: inputItem.factorDetails, methodologyVersion: 'calculator-v1' }),
          };
        }),
      });
    });

    return NextResponse.json({ success: true, footprint: calculationResult.footprint });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    if (error instanceof EmissionFactorNotFoundError) return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
    console.error('Onboarding error', error);
    return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
  }
}
