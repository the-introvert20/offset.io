import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();
    const profile = await prisma.profile.findUnique({
      where: { userId: user.userId },
      include: { user: { select: { name: true, email: true, role: true } } },
    });
    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

const updateProfileSchema = z.object({
  region: z.string().optional(),
  dietPattern: z.string().optional(),
  householdSize: z.number().optional(),
  targetReductionPct: z.number().optional(),
  monthlyBudget: z.number().optional(),
  currency: z.string().optional(),
});

export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: user.userId },
      data: parsed.data,
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
