import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalService } from '../lib/services/goal.service';
import { prisma } from '../lib/db';

vi.mock('../lib/db', () => ({
  prisma: {
    carbonGoal: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((cb) => cb(prisma)),
  },
}));

describe('Goal Service Lifecycle Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks previous active goal as REPLACED when creating new active goal', async () => {
    vi.mocked(prisma.carbonGoal.create).mockResolvedValue({
      id: 'goal-2',
      userId: 'user-100',
      targetAnnualEmissionsKg: 3000,
      targetMonthlyEmissionsKg: 250,
      reductionPercentage: 25,
      targetYear: 2026,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const goal = await goalService.replaceActiveGoal('user-100', {
      targetAnnualEmissionsKg: 3000,
      reductionPercentage: 25,
      targetYear: 2026,
    });

    expect(prisma.carbonGoal.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-100', status: 'ACTIVE' },
      data: { status: 'REPLACED' },
    });
    expect(goal.status).toBe('ACTIVE');
  });

  it('fetches only the current active goal', async () => {
    vi.mocked(prisma.carbonGoal.findFirst).mockResolvedValue({
      id: 'goal-active',
      status: 'ACTIVE',
    } as any);

    const goal = await goalService.getActiveGoal('user-100');
    expect(goal?.status).toBe('ACTIVE');
    expect(prisma.carbonGoal.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-100', status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  });
});
