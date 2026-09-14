import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { footprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const simulatorSchema = z.object({
  carKmMonthly: z.number().min(0),
  vehicleSubtype: z.string().min(1),
  electricityKwhMonthly: z.number().min(0),
  renewablePct: z.number().min(0).max(100),
  dietPattern: z.string().min(1),
  flightKmYearly: z.number().min(0),
  wasteKgMonthly: z.number().min(0),
});

const gridSubtypeForRegion = (region: string) => `grid_${region.toLowerCase()}`;

export async function GET() {
  try {
    const user = await requireAuth();
    const [activities, profile] = await Promise.all([
      prisma.activity.findMany({ where: { userId: user.userId } }),
      prisma.profile.findUnique({ where: { userId: user.userId }, select: { region: true, dietPattern: true } }),
    ]);
    return NextResponse.json({ activities, profile });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const parsed = simulatorSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'INVALID_ACTIVITY', details: parsed.error.flatten() }, { status: 400 });

    const [baseline, profile] = await Promise.all([
      footprintService.calculateUserFootprint({ userId: user.userId }),
      prisma.profile.findUnique({ where: { userId: user.userId }, select: { region: true } }),
    ]);
    const data = parsed.data;
    const region = profile?.region ?? 'GLOBAL';
    const activities = [
      data.carKmMonthly > 0 && { category: 'TRANSPORTATION', activityType: 'car', subtype: data.vehicleSubtype, frequency: 'MONTHLY', quantity: data.carKmMonthly, unit: 'km', region },
      data.flightKmYearly > 0 && { category: 'TRANSPORTATION', activityType: 'flight', subtype: 'short_haul', frequency: 'YEARLY', quantity: data.flightKmYearly, unit: 'km', region: 'GLOBAL' },
      data.electricityKwhMonthly * (1 - data.renewablePct / 100) > 0 && { category: 'ENERGY', activityType: 'electricity', subtype: gridSubtypeForRegion(region), frequency: 'MONTHLY', quantity: data.electricityKwhMonthly * (1 - data.renewablePct / 100), unit: 'kWh', region },
      data.electricityKwhMonthly * data.renewablePct / 100 > 0 && { category: 'ENERGY', activityType: 'solar', subtype: 'renewable', frequency: 'MONTHLY', quantity: data.electricityKwhMonthly * data.renewablePct / 100, unit: 'kWh', region: 'GLOBAL' },
      { category: 'FOOD', activityType: 'diet', subtype: data.dietPattern, frequency: 'DAILY', quantity: 1, unit: 'day', region: 'GLOBAL' },
      data.wasteKgMonthly > 0 && { category: 'WASTE', activityType: 'waste', subtype: 'landfill', frequency: 'MONTHLY', quantity: data.wasteKgMonthly, unit: 'kg', region: 'GLOBAL' },
    ].filter(Boolean) as any[];
    const simulated = await footprintService.calculateFootprintFromActivities(activities);
    const reductionKg = baseline.footprint.totalAnnualEmissionsKg - simulated.footprint.totalAnnualEmissionsKg;
    const reductionPct = baseline.footprint.totalAnnualEmissionsKg > 0 ? reductionKg / baseline.footprint.totalAnnualEmissionsKg * 100 : 0;
    return NextResponse.json({
      baselineAnnualKg: baseline.footprint.totalAnnualEmissionsKg,
      simulatedAnnualKg: simulated.footprint.totalAnnualEmissionsKg,
      reductionKg: Number(reductionKg.toFixed(2)), reductionPct: Number(reductionPct.toFixed(1)),
      simulatedFootprint: simulated.footprint,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    if (error instanceof EmissionFactorNotFoundError) return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
    console.error('Simulator error', error);
    return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
  }
}
