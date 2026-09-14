import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { goalService } from '@/lib/services/goal.service';

export async function GET() {
  try {
    const user = await requireAuth();
    const goal = await goalService.getActiveGoal(user.userId);
    return NextResponse.json({ goal });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const goalSchema = z.object({
  targetAnnualEmissionsKg: z.number().positive(),
  reductionPercentage: z.number().min(1).max(99),
  targetYear: z.number().default(2026),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid goal parameters' }, { status: 400 });
    }

    const { targetAnnualEmissionsKg, reductionPercentage, targetYear } = parsed.data;

    const goal = await goalService.replaceActiveGoal(user.userId, {
      targetAnnualEmissionsKg,
      reductionPercentage,
      targetYear,
    });

    return NextResponse.json({ goal });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
