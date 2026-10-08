import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { emissionFactorService, EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';
import type { Category } from '@/lib/engine/calculator';

// Only the fields a user is allowed to change on an existing activity
const patchSchema = z.object({
  category: z.enum(['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE']).optional(),
  activityType: z.string().min(1).optional(),
  subtype: z.string().min(1).optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  quantity: z.number().min(0).optional(),
  unit: z.string().min(1).optional(),
  region: z.string().optional(),
});

const unauthorizedError = (error: unknown) =>
  error instanceof Error && error.message === 'UNAUTHORIZED';

/**
 * PATCH /api/activities/[id]
 *
 * Update a single activity for the signed-in user. Only the supplied fields are
 * changed; the rest remain as stored. The emission factor for the merged activity
 * is pre-validated before saving — if no factor exists, a 422 is returned.
 *
 * The dashboard recalculates from the Activity table on every request, so no
 * separate Calculation row needs to be updated here.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'INVALID_ACTIVITY', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json({ error: 'NO_FIELDS_TO_UPDATE' }, { status: 400 });
    }

    // Ownership check
    const existing = await prisma.activity.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    // Merge the patch with the stored values so we can validate the emission factor
    // for the full (combined) activity before committing any change.
    const merged = { ...existing, ...parsed.data };
    // Validate the emission factor for the merged activity before committing
    await emissionFactorService.resolveFactor({
      category: merged.category as Category,
      activity: merged.activityType,
      subtype: merged.subtype,
      region: merged.region,
      unit: merged.unit,
    });

    await prisma.activity.update({
      where: { id: params.id },
      data: {
        category: parsed.data.category,
        activityType: parsed.data.activityType,
        subtype: parsed.data.subtype,
        frequency: parsed.data.frequency,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit,
        region: parsed.data.region,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (unauthorizedError(error)) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    if (error instanceof EmissionFactorNotFoundError) {
      return NextResponse.json(
        { error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params },
        { status: 422 }
      );
    }
    console.error('Activity PATCH error', error);
    return NextResponse.json({ error: 'UPDATE_FAILED' }, { status: 500 });
  }
}

/**
 * DELETE /api/activities/[id]
 *
 * Remove a single activity for the signed-in user. The dashboard re-derives
 * the footprint from the remaining activities on each request, so no extra
 * cleanup is needed. The Calculation table is an audit log and is intentionally
 * left untouched.
 */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    // deleteMany with the userId condition is the atomic ownership check + delete
    const result = await prisma.activity.deleteMany({
      where: { id: params.id, userId: user.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (unauthorizedError(error)) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    console.error('Activity DELETE error', error);
    return NextResponse.json({ error: 'DELETE_FAILED' }, { status: 500 });
  }
}
