import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { detectEmissionAnomalies, ANOMALY_Z_SCORE_THRESHOLD } from '@/lib/engine/anomaly';
import { emissionFactorService, EmissionFactorNotFoundError } from '@/lib/services/emission-factor.service';

const idSchema = z.string().uuid();
const entrySchema = z.object({ date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)), category: z.enum(['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE']), activityType: z.string().min(1), subtype: z.string().min(1), quantity: z.number().positive(), unit: z.string().min(1), notes: z.string().max(1000).optional() });
const idFromRequest = (req: Request) => idSchema.safeParse(new URL(req.url).searchParams.get('id'));

const responseForError = (error: unknown) => {
  if (error instanceof EmissionFactorNotFoundError) return NextResponse.json({ error: 'EMISSION_FACTOR_NOT_FOUND', details: error.params }, { status: 422 });
  console.error('Diary error', error); return NextResponse.json({ error: 'CALCULATION_FAILED' }, { status: 500 });
};
const toEntryData = async (input: z.infer<typeof entrySchema>, region: string) => {
  // Electricity diary entries follow the profile's grid region rather than a
  // transport-style generic subtype typed into the form.
  const subtype = input.category === 'ENERGY' && input.activityType === 'electricity' && input.subtype.startsWith('grid_')
    ? `grid_${region.toLowerCase()}`
    : input.subtype;
  const factor = await emissionFactorService.resolveFactor({ category: input.category, activity: input.activityType, subtype, unit: input.unit, region });
  return { ...input, subtype, date: new Date(input.date), emissionsKg: Number((input.quantity * factor.factor).toFixed(2)) };
};

export async function GET() {
  try {
    const user = await requireAuth(); const entries = await prisma.diaryEntry.findMany({ where: { userId: user.userId }, orderBy: { date: 'desc' }, take: 60 });
    const anomalyResult = detectEmissionAnomalies(entries, ANOMALY_Z_SCORE_THRESHOLD);
    return NextResponse.json({ entries, anomalyResult, anomalyThreshold: ANOMALY_Z_SCORE_THRESHOLD });
  } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return responseForError(error); }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(); const parsed = entrySchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'INVALID_ACTIVITY', details: parsed.error.flatten() }, { status: 400 });
    const profile = await prisma.profile.findUnique({ where: { userId: user.userId }, select: { region: true } });
    const entry = await prisma.diaryEntry.create({ data: { userId: user.userId, ...await toEntryData(parsed.data, profile?.region ?? 'GLOBAL') } });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return responseForError(error); }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth(); const parsedId = idFromRequest(req); const parsed = entrySchema.partial().safeParse(await req.json());
    if (!parsedId.success || !parsed.success || Object.keys(parsed.data).length === 0) return NextResponse.json({ error: 'INVALID_ACTIVITY', details: parsed.success ? undefined : parsed.error.flatten() }, { status: 400 });
    const existing = await prisma.diaryEntry.findFirst({ where: { id: parsedId.data, userId: user.userId } });
    if (!existing) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const merged = entrySchema.parse({ ...existing, ...parsed.data, date: parsed.data.date ?? existing.date.toISOString() });
    const profile = await prisma.profile.findUnique({ where: { userId: user.userId }, select: { region: true } });
    const entry = await prisma.diaryEntry.update({ where: { id: existing.id }, data: await toEntryData(merged, profile?.region ?? 'GLOBAL') });
    return NextResponse.json({ entry });
  } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return responseForError(error); }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuth(); const parsedId = idFromRequest(req);
    if (!parsedId.success) return NextResponse.json({ error: 'INVALID_ACTIVITY' }, { status: 400 });
    const result = await prisma.diaryEntry.deleteMany({ where: { id: parsedId.data, userId: user.userId } });
    if (result.count === 0) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) { if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 }); return responseForError(error); }
}
