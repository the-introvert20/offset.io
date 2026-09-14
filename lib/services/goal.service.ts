import { prisma } from '@/lib/db';

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'REPLACED' | 'EXPIRED';

export class GoalService {
  async replaceActiveGoal(userId: string, input: {
    targetAnnualEmissionsKg: number;
    reductionPercentage: number;
    targetYear: number;
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.carbonGoal.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'REPLACED' },
      });
      return tx.carbonGoal.create({
        data: {
          userId,
          targetAnnualEmissionsKg: input.targetAnnualEmissionsKg,
          targetMonthlyEmissionsKg: Number((input.targetAnnualEmissionsKg / 12).toFixed(2)),
          reductionPercentage: input.reductionPercentage,
          targetYear: input.targetYear,
          status: 'ACTIVE',
        },
      });
    });
  }

  async getActiveGoal(userId: string) {
    return prisma.carbonGoal.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const goalService = new GoalService();
