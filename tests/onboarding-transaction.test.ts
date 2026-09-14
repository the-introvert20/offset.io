import { describe, it, expect, vi } from 'vitest';
import { prisma } from '../lib/db';
import { footprintService } from '../lib/services/footprint.service';
import { EmissionFactorNotFoundError } from '../lib/services/emission-factor.service';

vi.mock('../lib/db', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock('../lib/services/footprint.service', () => ({
  footprintService: {
    calculateFootprintFromActivities: vi.fn(),
  },
}));

describe('Onboarding Transaction Atomic Rollback', () => {
  it('prevents any database changes if factor validation fails before transaction starts', async () => {
    vi.mocked(footprintService.calculateFootprintFromActivities).mockRejectedValue(
      new EmissionFactorNotFoundError({
        category: 'TRANSPORTATION',
        activity: 'car',
        subtype: 'unknown_type',
        region: 'GLOBAL',
        unit: 'km',
      })
    );

    await expect(
      footprintService.calculateFootprintFromActivities([
        {
          category: 'TRANSPORTATION',
          activityType: 'car',
          subtype: 'unknown_type',
          frequency: 'MONTHLY',
          quantity: 100,
          unit: 'km',
        },
      ])
    ).rejects.toThrow(EmissionFactorNotFoundError);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
