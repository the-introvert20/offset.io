import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { emissionFactorService } from '@/lib/services/emission-factor.service';

export async function GET() {
  try {
    await requireAdmin();
    const factors = await prisma.emissionFactor.findMany({
      orderBy: [{ category: 'asc' }, { activity: 'asc' }],
    });
    return NextResponse.json({ factors });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN_ADMIN_ONLY') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const factorSchema = z.object({
  category: z.string(),
  activity: z.string(),
  subtype: z.string(),
  region: z.string().default('GLOBAL'),
  unit: z.string(),
  factor: z.number().positive(),
  source: z.string(),
  sourceUrl: z.string().optional(),
  methodologyNote: z.string().optional(),
  confidenceLevel: z.string().default('HIGH'),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = factorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid factor data' }, { status: 400 });
    }

    const factor = await prisma.emissionFactor.create({
      data: parsed.data,
    });
    emissionFactorService.clearCache();

    return NextResponse.json({ factor });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN_ADMIN_ONLY') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    if (error.code === 'P2002') return NextResponse.json({ error: 'DUPLICATE_EMISSION_FACTOR' }, { status: 409 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
