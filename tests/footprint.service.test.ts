import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FootprintService } from '@/lib/services/footprint.service';
import { prisma } from '@/lib/db';
import { calculateFootprint, CalculationInput } from '@/lib/engine/calculator';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    activity: {
      findMany: vi.fn(),
    },
    scenario: {
      findUnique: vi.fn(),
    },
    calculation: {
      createMany: vi.fn(),
    },
  },
}));

// Mock emission factor service
vi.mock('@/lib/services/emission-factor.service', () => ({
  emissionFactorService: {
    activitiesToCalculationInputs: vi.fn(),
    resolveFactorsForActivities: vi.fn(),
  },
}));

describe('FootprintService', () => {
  let service: FootprintService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FootprintService();
  });

  const mockActivities = [
    {
      id: 'act-1',
      category: 'TRANSPORTATION',
      activityType: 'car',
      subtype: 'petrol',
      frequency: 'MONTHLY',
      quantity: 390,
      unit: 'km',
      region: 'US',
    },
    {
      id: 'act-2',
      category: 'ENERGY',
      activityType: 'electricity',
      subtype: 'grid_us',
      frequency: 'MONTHLY',
      quantity: 320,
      unit: 'kWh',
      region: 'US',
    },
    {
      id: 'act-3',
      category: 'FOOD',
      activityType: 'diet',
      subtype: 'mixed',
      frequency: 'DAILY',
      quantity: 1,
      unit: 'day',
      region: 'GLOBAL',
    },
  ];

  const mockCalculationInputs: CalculationInput[] = [
    {
      id: 'act-1',
      category: 'TRANSPORTATION',
      activityType: 'car',
      subtype: 'petrol',
      frequency: 'MONTHLY',
      quantity: 390,
      unit: 'km',
      factor: 0.192,
      region: 'US',
      confidenceLevel: 'HIGH',
    },
    {
      id: 'act-2',
      category: 'ENERGY',
      activityType: 'electricity',
      subtype: 'grid_us',
      frequency: 'MONTHLY',
      quantity: 320,
      unit: 'kWh',
      factor: 0.385,
      region: 'US',
      confidenceLevel: 'HIGH',
    },
    {
      id: 'act-3',
      category: 'FOOD',
      activityType: 'diet',
      subtype: 'mixed',
      frequency: 'DAILY',
      quantity: 1,
      unit: 'day',
      factor: 5.6,
      region: 'GLOBAL',
      confidenceLevel: 'MEDIUM',
    },
  ];

  const mockFactorDetails = new Map([
    ['act-1', { factorId: 'f1', factor: 0.192, source: 'DEFRA', confidenceLevel: 'HIGH', sourceUrl: null, methodologyNote: null, unit: 'km', name: 'TRANSPORTATION/car/petrol' }],
    ['act-2', { factorId: 'f2', factor: 0.385, source: 'EPA', confidenceLevel: 'HIGH', sourceUrl: null, methodologyNote: null, unit: 'kWh', name: 'ENERGY/electricity/grid_us' }],
    ['act-3', { factorId: 'f3', factor: 5.6, source: 'Poore & Nemecek', confidenceLevel: 'MEDIUM', sourceUrl: null, methodologyNote: null, unit: 'day', name: 'FOOD/diet/mixed' }],
  ]);

  it('calculates user footprint from database activities', async () => {
    vi.mocked(prisma.activity.findMany).mockResolvedValue(mockActivities as any);
    
    const { emissionFactorService } = await import('@/lib/services/emission-factor.service');
    vi.mocked(emissionFactorService.activitiesToCalculationInputs).mockResolvedValue(mockCalculationInputs);
    vi.mocked(emissionFactorService.resolveFactorsForActivities).mockResolvedValue(mockFactorDetails);

    const result = await service.calculateUserFootprint({ userId: 'user-1', persistCalculation: false });

    expect(result.footprint.totalAnnualEmissionsKg).toBeGreaterThan(0);
    expect(result.uncertainty.estimatedAnnualKg).toBeGreaterThan(0);
    expect(result.calculationInputs).toHaveLength(3);
    expect(result.calculationInputs[0].factorDetails).toBeDefined();
  });

  it('calculates footprint from provided activities', async () => {
    const { emissionFactorService } = await import('@/lib/services/emission-factor.service');
    vi.mocked(emissionFactorService.activitiesToCalculationInputs).mockResolvedValue(mockCalculationInputs);
    vi.mocked(emissionFactorService.resolveFactorsForActivities).mockResolvedValue(mockFactorDetails);

    const activities = mockActivities.map(({ id, ...rest }) => rest);
    const result = await service.calculateFootprintFromActivities(activities);

    expect(result.footprint.totalAnnualEmissionsKg).toBeGreaterThan(0);
    expect(result.calculationInputs).toHaveLength(3);
  });

  it('calculates scenario footprint', async () => {
    vi.mocked(prisma.scenario.findUnique).mockResolvedValue({
      id: 'scenario-1',
      activities: mockActivities,
    } as any);

    const { emissionFactorService } = await import('@/lib/services/emission-factor.service');
    vi.mocked(emissionFactorService.activitiesToCalculationInputs).mockResolvedValue(mockCalculationInputs);
    vi.mocked(emissionFactorService.resolveFactorsForActivities).mockResolvedValue(mockFactorDetails);

    const result = await service.calculateScenarioFootprint('scenario-1');

    expect(result.footprint.totalAnnualEmissionsKg).toBeGreaterThan(0);
  });

  it('throws when scenario not found', async () => {
    vi.mocked(prisma.scenario.findUnique).mockResolvedValue(null);

    await expect(service.calculateScenarioFootprint('nonexistent')).rejects.toThrow('Scenario nonexistent not found');
  });

  it('calculates progress to target correctly - under target', () => {
    const result = service.calculateProgressToTarget(3000, 4000);

    expect(result.progressPct).toBe(25); // (4000-3000)/4000 * 100 = 25%
    expect(result.isOverTarget).toBe(false);
    expect(result.kgDifference).toBe(1000);
    expect(result.status).toBe('under');
  });

  it('calculates progress to target correctly - over target', () => {
    const result = service.calculateProgressToTarget(5000, 4000);

    expect(result.progressPct).toBe(-25); // (4000-5000)/4000 * 100 = -25%
    expect(result.isOverTarget).toBe(true);
    expect(result.kgDifference).toBe(1000);
    expect(result.status).toBe('over');
  });

  it('calculates progress to target correctly - at target', () => {
    const result = service.calculateProgressToTarget(4000, 4000);

    expect(result.progressPct).toBe(0);
    expect(result.isOverTarget).toBe(false);
    expect(result.kgDifference).toBe(0);
    expect(result.status).toBe('at');
  });

  it('handles zero target gracefully', () => {
    const result = service.calculateProgressToTarget(5000, 0);

    expect(result.progressPct).toBe(0);
    expect(result.isOverTarget).toBe(false);
    expect(result.status).toBe('over');
  });

  it('gets category breakdown with percentages', async () => {
    const { emissionFactorService } = await import('@/lib/services/emission-factor.service');
    vi.mocked(emissionFactorService.activitiesToCalculationInputs).mockResolvedValue(mockCalculationInputs);
    vi.mocked(emissionFactorService.resolveFactorsForActivities).mockResolvedValue(mockFactorDetails);

    const result = await service.calculateFootprintFromActivities(mockActivities.map(({ id, ...rest }) => rest));
    const breakdown = service.getCategoryBreakdown(result.footprint);

    expect(breakdown.length).toBeGreaterThan(0);
    breakdown.forEach((cat) => {
      expect(cat.annualEmissionsKg).toBeGreaterThanOrEqual(0);
      expect(cat.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  it('gets largest category', async () => {
    const { emissionFactorService } = await import('@/lib/services/emission-factor.service');
    vi.mocked(emissionFactorService.activitiesToCalculationInputs).mockResolvedValue(mockCalculationInputs);
    vi.mocked(emissionFactorService.resolveFactorsForActivities).mockResolvedValue(mockFactorDetails);

    const result = await service.calculateFootprintFromActivities(mockActivities.map(({ id, ...rest }) => rest));
    const largest = service.getLargestCategory(result.footprint);

    expect(['TRANSPORTATION', 'ENERGY', 'FOOD', 'CONSUMPTION', 'WASTE']).toContain(largest);
  });
});