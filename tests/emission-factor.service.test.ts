import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmissionFactorService, EmissionFactorNotFoundError, DuplicateEmissionFactorError } from '@/lib/services/emission-factor.service';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    emissionFactor: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('EmissionFactorService', () => {
  let service: EmissionFactorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new EmissionFactorService();
  });

  it('resolves factor with exact match', async () => {
    const mockFactor = {
      id: 'factor-1',
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.192,
      source: 'DEFRA 2023',
      sourceUrl: 'https://example.com',
      methodologyNote: 'Test methodology',
      confidenceLevel: 'HIGH',
      isActive: true,
    };

    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValueOnce([mockFactor] as any);

    const result = await service.resolveFactor({
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
    });

    expect(result.factor).toBe(0.192);
    expect(result.factorId).toBe('factor-1');
    expect(result.source).toBe('DEFRA 2023');
    expect(result.confidenceLevel).toBe('HIGH');
  });

  it('falls back to GLOBAL region when regional factor not found', async () => {
    const globalFactor = {
      id: 'factor-global',
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_us',
      region: 'GLOBAL',
      unit: 'kWh',
      factor: 0.45,
      source: 'IEA Global',
      sourceUrl: null,
      methodologyNote: null,
      confidenceLevel: 'MEDIUM',
      isActive: true,
    };

    vi.mocked(prisma.emissionFactor.findMany)
      .mockResolvedValueOnce([] as any) // regional not found
      .mockResolvedValueOnce([globalFactor] as any); // global found

    const result = await service.resolveFactor({
      category: 'ENERGY',
      activity: 'electricity',
      subtype: 'grid_us',
      region: 'US',
    });

    expect(result.factor).toBe(0.45);
    expect(result.factorId).toBe('factor-global');
  });

  it('throws EmissionFactorNotFoundError when no factor exists', async () => {
    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue([] as any);

    await expect(
      service.resolveFactor({
        category: 'TRANSPORTATION',
        activity: 'car',
        subtype: 'nonexistent',
        region: 'GLOBAL',
      })
    ).rejects.toThrow(EmissionFactorNotFoundError);
  });

  it('resolveFactorOptional returns null instead of throwing', async () => {
    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue([] as any);

    const result = await service.resolveFactorOptional({
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'nonexistent',
      region: 'GLOBAL',
    });

    expect(result).toBeNull();
  });

  it('gets active factors by category', async () => {
    const mockFactors = [
      {
        id: 'f1',
        category: 'TRANSPORTATION',
        activity: 'car',
        subtype: 'petrol',
        region: 'GLOBAL',
        unit: 'km',
        factor: 0.192,
        source: 'DEFRA',
        sourceUrl: 'https://example.com',
        methodologyNote: 'note',
        confidenceLevel: 'HIGH',
        isActive: true,
      },
      {
        id: 'f2',
        category: 'TRANSPORTATION',
        activity: 'car',
        subtype: 'diesel',
        region: 'GLOBAL',
        unit: 'km',
        factor: 0.171,
        source: 'DEFRA',
        sourceUrl: 'https://example.com',
        methodologyNote: 'note',
        confidenceLevel: 'HIGH',
        isActive: true,
      },
    ];

    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue(mockFactors as any);

    const results = await service.getActiveFactorsByCategory('TRANSPORTATION');

    expect(results).toHaveLength(2);
    expect(results[0].name).toContain('petrol');
    expect(results[1].name).toContain('diesel');
  });

  it('caches resolved factors', async () => {
    const mockFactor = {
      id: 'factor-1',
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
      unit: 'km',
      factor: 0.192,
      source: 'DEFRA 2023',
      sourceUrl: 'https://example.com',
      methodologyNote: 'Test methodology',
      confidenceLevel: 'HIGH',
      isActive: true,
    };

    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue([mockFactor] as any);

    // First call
    await service.resolveFactor({
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
    });

    // Second call should use cache
    await service.resolveFactor({
      category: 'TRANSPORTATION',
      activity: 'car',
      subtype: 'petrol',
      region: 'GLOBAL',
    });

    // Prisma should only be called once due to caching
    expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(1);
  });

  it('does not reuse a cached factor for a different unit', async () => {
    const factor = { id: 'factor-km', category: 'TRANSPORTATION', activity: 'car', subtype: 'petrol', region: 'GLOBAL', unit: 'km', factor: 0.192, source: 'DEFRA', sourceUrl: null, methodologyNote: null, confidenceLevel: 'HIGH' };
    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValueOnce([factor] as any).mockResolvedValueOnce([] as any);
    await service.resolveFactor({ category: 'TRANSPORTATION', activity: 'car', subtype: 'petrol', region: 'GLOBAL', unit: 'km' });
    await expect(service.resolveFactor({ category: 'TRANSPORTATION', activity: 'car', subtype: 'petrol', region: 'GLOBAL', unit: 'mile' })).rejects.toThrow(EmissionFactorNotFoundError);
    expect(prisma.emissionFactor.findMany).toHaveBeenCalledTimes(2);
  });

  it('rejects duplicate matching factors rather than selecting one arbitrarily', async () => {
    vi.mocked(prisma.emissionFactor.findMany).mockResolvedValue([{ id: 'a' }, { id: 'b' }] as any);
    await expect(service.resolveFactor({ category: 'TRANSPORTATION', activity: 'car', subtype: 'petrol', region: 'GLOBAL', unit: 'km' })).rejects.toThrow(DuplicateEmissionFactorError);
  });
});
