import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { emissionFactorService, EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const entrySchema = z.object({
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  category: z.enum(['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE']),
  activityType: z.string().min(1),
  subtype: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

const responseForError = (error: unknown) => {
  if (error instanceof EmissionFactorNotFoundError) {
    return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
  }
  console.error('Diary error', error);
  return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
};

const toEntryData = async (input: z.infer<typeof entrySchema>) => {
  const factor = await emissionFactorService.resolveFactor({
    category: input.category,
    activity: input.activityType,
    subtype: input.subtype,
    unit: input.unit,
  });
  return {
    ...input,
    date: new Date(input.date),
    emissionsKg: Number((input.quantity * factor.factor).toFixed(2)),
  };
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const entry = await prisma.diaryEntry.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    if (!entry) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return responseForError(error);
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return PATCH(req, { params });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const parsed = entrySchema.partial().safeParse(await req.json());
    if (!parsed.success || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: 'INVALID_ACTIVITY', details: parsed.success ? undefined : parsed.error.flatten() },
        { status: 400 }
      );
    }
    const existing = await prisma.diaryEntry.findFirst({
      where: { id: params.id, userId: user.userId },
    });
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

    const merged = entrySchema.parse({
      ...existing,
      ...parsed.data,
      date: parsed.data.date ?? existing.date.toISOString(),
    });
    const entry = await prisma.diaryEntry.update({
      where: { id: existing.id },
      data: await toEntryData(merged),
    });
    return NextResponse.json({ entry });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return responseForError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const result = await prisma.diaryEntry.deleteMany({
      where: { id: params.id, userId: user.userId },
    });
    if (result.count === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }
    return responseForError(error);
  }
}
