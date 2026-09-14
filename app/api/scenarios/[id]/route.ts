import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { footprintService } from '@/lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const activitySchema = z.object({
  category: z.enum(['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE']),
  activityType: z.string().min(1),
  subtype: z.string().min(1),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  quantity: z.number().min(0),
  unit: z.string().min(1),
  region: z.string().default('GLOBAL'),
});

const scenarioSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  estimatedCostDeltaMonthly: z.number(),
  activities: z.array(activitySchema).min(1),
});

const failure = (error: unknown) => {
  if (error instanceof EmissionFactorNotFoundError) {
    return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
  }
  console.error('Scenario error', error);
  return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const scenario = await prisma.scenario.findFirst({
      where: { id: params.id, userId: user.userId },
      include: { activities: true },
    });
    if (!scenario) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ scenario });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return failure(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return PATCH(req, { params });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const parsed = scenarioSchema.partial().safeParse(await req.json());
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: 'INVALID_SCENARIO', details: parsed.success ? undefined : parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existing = await prisma.scenario.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const activities = parsed.data.activities;
    const footprint = activities ? await footprintService.calculateFootprintFromActivities(activities) : null;

    const scenario = await prisma.$transaction(async (tx) => {
      if (activities) {
        await tx.scenarioActivity.deleteMany({ where: { scenarioId: existing.id } });
      }
      return tx.scenario.update({
        where: { id: existing.id },
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          estimatedCostDeltaMonthly: parsed.data.estimatedCostDeltaMonthly,
          ...(footprint
            ? {
                totalAnnualEmissionsKg: footprint.footprint.totalAnnualEmissionsKg,
                activities: { create: activities },
              }
            : {}),
        },
        include: { activities: true },
      });
    });

    return NextResponse.json({ scenario });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return failure(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const result = await prisma.scenario.deleteMany({
      where: { id: params.id, userId: user.userId },
    });
    if (result.count === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return failure(error);
  }
}
