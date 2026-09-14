import { describe, it, expect, vi } from 'vitest';
import { FootprintService } from '../lib/services/footprint.service';
import { prisma } from '../lib/db';

vi.mock('../lib/db', () => ({
  prisma: {
    activity: {
      findMany: vi.fn(),
    },
    calculation: {
      createMany: vi.fn(),
    },
  },
}));

vi.mock('../lib/services/emission-factor.service', () => ({
  emissionFactorService: {
    activitiesToCalculationInputs: vi.fn().mockImplementation((activities) =>
      activities.map((a: any) => ({
        id: a.id,
        category: a.category,
        activityType: a.activityType,
        subtype: a.subtype,
        frequency: a.frequency,
        quantity: a.quantity,
        unit: a.unit,
        factor: 0.21,
        confidenceLevel: 'HIGH',
      }))
    ),
    resolveFactorsForActivities: vi.fn().mockImplementation((activities) => {
      const map = new Map();
      activities.forEach((a: any) => {
        map.set(a.id, {
          factor: 0.21,
          factorId: 'factor-1',
          source: 'DEFRA',
          sourceUrl: null,
          methodologyNote: null,
          confidenceLevel: 'HIGH',
          unit: a.unit,
          name: `${a.category} / ${a.activity} / ${a.subtype}`,
        });
      });
      return Promise.resolve(map);
    }),
  },
}));

describe('Dashboard Data Integrity & Audit Idempotency', () => {
  it('does NOT create audit rows when persistCalculation is false (default dashboard GET)', async () => {
    const service = new FootprintService();
    const mockActivities = [
      {
        id: 'act-1',
        userId: 'user-123',
        category: 'TRANSPORTATION',
        activityType: 'car',
        subtype: 'petrol',
        frequency: 'MONTHLY',
        quantity: 200,
        unit: 'km',
        region: 'GLOBAL',
      },
    ];

    vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities as any);

    const result = await service.calculateUserFootprint({
      userId: 'user-123',
      persistCalculation: false,
    });

    expect(result).toBeDefined();
    expect(result.footprint.totalAnnualEmissionsKg).toBeGreaterThan(0);
    expect(prisma.calculation.createMany).not.toHaveBeenCalled();
  });

  it('creates audit rows ONLY when persistCalculation is true (explicit calculation event)', async () => {
    const service = new FootprintService();
    const mockActivities = [
      {
        id: 'act-1',
        userId: 'user-123',
        category: 'TRANSPORTATION',
        activityType: 'car',
        subtype: 'petrol',
        frequency: 'MONTHLY',
        quantity: 200,
        unit: 'km',
        region: 'GLOBAL',
      },
    ];

    vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities as any);

    await service.calculateUserFootprint({
      userId: 'user-123',
      persistCalculation: true,
    });

    expect(prisma.calculation.createMany).toHaveBeenCalledTimes(1);
  });
});
