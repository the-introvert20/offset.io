import { prisma } from '@/lib/db';
import { CalculationInput, Category, ConfidenceLevel } from '@/lib/engine/calculator';

export interface EmissionFactorResult {
  factor: number;
  factorId: string;
  source: string;
  sourceUrl: string | null;
  methodologyNote: string | null;
  confidenceLevel: ConfidenceLevel | string;
  unit: string;
  name: string;
}

export interface FactorLookupParams {
  category: Category;
  activity: string;
  subtype: string;
  region?: string;
  unit?: string;
}

export class EmissionFactorNotFoundError extends Error {
  public readonly params: FactorLookupParams;

  constructor(params: FactorLookupParams) {
    const { category, activity, subtype, region } = params;
    super(
      `No active emission factor found for category="${category}", activity="${activity}", subtype="${subtype}"${region ? `, region="${region}"` : ''}.`
    );
    this.name = 'EmissionFactorNotFoundError';
    this.params = params;
  }
}

/** A data-integrity failure: matching active factor records must be unique. */
export class DuplicateEmissionFactorError extends Error {
  public readonly params: FactorLookupParams;

  constructor(params: FactorLookupParams) {
    super(`Multiple active emission factors match ${params.category}/${params.activity}/${params.subtype}.`);
    this.name = 'DuplicateEmissionFactorError';
    this.params = params;
  }
}

export class EmissionFactorService {
  private factorCache: Map<string, EmissionFactorResult> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Resolves an emission factor for the given activity parameters.
   * Throws EmissionFactorNotFoundError if no matching active factor is found.
   */
  async resolveFactor(params: FactorLookupParams): Promise<EmissionFactorResult> {
    const cacheKey = this.buildCacheKey(params);
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const validWhere = {
      isActive: true,
      AND: [
        { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
        { OR: [{ validTo: null }, { validTo: { gte: now } }] },
      ],
    };

    // Primary match: category + activity + subtype + region. Unit is included
    // whenever the caller knows it so compatible activities cannot cross-match.
    const matches = await prisma.emissionFactor.findMany({
      where: {
        ...validWhere,
        category: params.category,
        activity: params.activity,
        subtype: params.subtype,
        region: params.region || 'GLOBAL',
        ...(params.unit ? { unit: params.unit } : {}),
      },
      take: 2,
      orderBy: { updatedAt: 'desc' },
    });
    if (matches.length > 1) throw new DuplicateEmissionFactorError(params);
    let factor = matches[0] ?? null;

    // Fallback: category + activity + subtype with GLOBAL region
    if (!factor && params.region && params.region !== 'GLOBAL') {
      const globalMatches = await prisma.emissionFactor.findMany({
        where: {
          ...validWhere,
          category: params.category,
          activity: params.activity,
          subtype: params.subtype,
          region: 'GLOBAL',
          ...(params.unit ? { unit: params.unit } : {}),
        },
        take: 2,
        orderBy: { updatedAt: 'desc' },
      });
      if (globalMatches.length > 1) throw new DuplicateEmissionFactorError(params);
      factor = globalMatches[0] ?? null;
    }

    if (!factor) {
      throw new EmissionFactorNotFoundError(params);
    }

    const result: EmissionFactorResult = {
      factor: factor.factor,
      factorId: factor.id,
      source: factor.source,
      sourceUrl: factor.sourceUrl,
      methodologyNote: factor.methodologyNote,
      confidenceLevel: factor.confidenceLevel as ConfidenceLevel,
      unit: factor.unit,
      name: `${factor.category} / ${factor.activity} / ${factor.subtype}`,
    };

    this.setCache(cacheKey, result);
    return result;
  }

  /**
   * Resolves factors for multiple activities in batch.
   * Returns a map of activity ID to factor result.
   * Throws on first missing factor (use resolveFactorOptional for graceful handling).
   */
  async resolveFactorsForActivities(activities: Array<{ id: string } & FactorLookupParams>): Promise<Map<string, EmissionFactorResult>> {
    const results = new Map<string, EmissionFactorResult>();
    
    for (const activity of activities) {
      const { id, ...params } = activity;
      const factor = await this.resolveFactor(params);
      results.set(id, factor);
    }

    return results;
  }

  /**
   * Attempts to resolve a factor, returning null if not found (no throw).
   * Useful for optional activities or graceful degradation.
   */
  async resolveFactorOptional(params: FactorLookupParams): Promise<EmissionFactorResult | null> {
    try {
      return await this.resolveFactor(params);
    } catch (err) {
      if (err instanceof EmissionFactorNotFoundError) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Gets all active factors for a category (useful for admin/debugging).
   */
  async getActiveFactorsByCategory(category: Category): Promise<EmissionFactorResult[]> {
    const factors = await prisma.emissionFactor.findMany({
      where: { category, isActive: true },
      orderBy: [{ activity: 'asc' }, { subtype: 'asc' }, { region: 'asc' }],
    });

    return factors.map((f) => ({
      factor: f.factor,
      factorId: f.id,
      source: f.source,
      sourceUrl: f.sourceUrl,
      methodologyNote: f.methodologyNote,
      confidenceLevel: f.confidenceLevel as ConfidenceLevel,
      unit: f.unit,
      name: `${f.category} / ${f.activity} / ${f.subtype}`,
    }));
  }

  /**
   * Converts an activity database record to a CalculationInput using resolved factor.
   * Throws if factor cannot be resolved.
   */
  async activityToCalculationInput(activity: {
    id: string;
    category: Category;
    activityType: string;
    subtype: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    quantity: number;
    unit: string;
    region?: string;
  }): Promise<CalculationInput> {
    const factorResult = await this.resolveFactor({
      category: activity.category,
      activity: activity.activityType,
      subtype: activity.subtype,
      region: activity.region,
      unit: activity.unit,
    });

    return {
      id: activity.id,
      category: activity.category,
      activityType: activity.activityType,
      subtype: activity.subtype,
      frequency: activity.frequency,
      quantity: activity.quantity,
      unit: activity.unit,
      factor: factorResult.factor,
      region: activity.region,
      confidenceLevel: factorResult.confidenceLevel as ConfidenceLevel,
    };
  }

  /**
   * Converts multiple activities to CalculationInputs.
   * Throws if any factor cannot be resolved.
   */
  async activitiesToCalculationInputs(activities: Array<{
    id: string;
    category: Category;
    activityType: string;
    subtype: string;
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    quantity: number;
    unit: string;
    region?: string;
  }>): Promise<CalculationInput[]> {
    const inputs: CalculationInput[] = [];
    
    for (const activity of activities) {
      const input = await this.activityToCalculationInput(activity);
      inputs.push(input);
    }

    return inputs;
  }

  private buildCacheKey(params: FactorLookupParams): string {
    return `${params.category}:${params.activity}:${params.subtype}:${params.region || 'GLOBAL'}:${params.unit || '*'}`;
  }

  private getCached(key: string): EmissionFactorResult | null {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.factorCache.get(key) || null;
    }
    this.factorCache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, value: EmissionFactorResult): void {
    this.factorCache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL_MS);
  }

  clearCache(): void {
    this.factorCache.clear();
    this.cacheExpiry.clear();
  }
}

export const emissionFactorService = new EmissionFactorService();
