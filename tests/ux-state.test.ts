import { describe, it, expect } from 'vitest';
import { classifyDashboardResponse, hasUsableFootprint } from '@/lib/dashboard-state';
import {
  buildSimulatorActivities,
  isValidSnapshot,
  saveSimulatorSnapshot,
  loadSimulatorSnapshot,
  clearSimulatorSnapshot,
} from '@/lib/simulator-snapshot';

describe('classifyDashboardResponse', () => {
  const ready = { footprint: { calculations: [{ id: 1 }], totalAnnualEmissionsKg: 100 } };
  const empty = { footprint: { calculations: [], totalAnnualEmissionsKg: 0 } };

  it('never mistakes failure for "no data"', () => {
    expect(classifyDashboardResponse(500, ready)).toBe('error');
    expect(classifyDashboardResponse(0, null)).toBe('error');
    expect(classifyDashboardResponse(200, null)).toBe('error');
    // Even a healthy-looking payload with an error status is an error.
    expect(classifyDashboardResponse(500, empty)).toBe('error');
  });

  it('identifies signed-out users separately', () => {
    expect(classifyDashboardResponse(401, null)).toBe('unauthorized');
  });

  it('distinguishes genuinely empty footprints from errors', () => {
    expect(classifyDashboardResponse(200, empty)).toBe('empty');
    expect(classifyDashboardResponse(200, ready)).toBe('ready');
  });

  it('hasUsableFootprint requires at least one calculation', () => {
    expect(hasUsableFootprint(ready)).toBe(true);
    expect(hasUsableFootprint(empty)).toBe(false);
    expect(hasUsableFootprint(null)).toBe(false);
  });
});

describe('buildSimulatorActivities', () => {
  it('mirrors the simulator API mapping (grid/solar split, frequencies, regions)', () => {
    const acts = buildSimulatorActivities({
      carKmMonthly: 390,
      vehicleSubtype: 'petrol',
      electricityKwhMonthly: 320,
      renewablePct: 50,
      dietPattern: 'mixed',
      flightKmYearly: 1500,
      wasteKgMonthly: 45,
      region: 'US',
    });
    const car = acts.find((a) => a.activityType === 'car');
    expect(car).toMatchObject({ subtype: 'petrol', frequency: 'MONTHLY', quantity: 390, unit: 'km', region: 'US' });
    const grid = acts.find((a) => a.activityType === 'electricity');
    expect(grid).toMatchObject({ subtype: 'grid_us', quantity: 160, region: 'US' });
    const solar = acts.find((a) => a.activityType === 'solar');
    expect(solar).toMatchObject({ subtype: 'renewable', quantity: 160, region: 'GLOBAL' });
    const diet = acts.find((a) => a.activityType === 'diet');
    expect(diet).toMatchObject({ subtype: 'mixed', frequency: 'DAILY', quantity: 1 });
  });

  it('omits zeroed sliders but always keeps diet', () => {
    const acts = buildSimulatorActivities({
      carKmMonthly: 0,
      vehicleSubtype: 'petrol',
      electricityKwhMonthly: 0,
      renewablePct: 0,
      dietPattern: 'plant_based',
      flightKmYearly: 0,
      wasteKgMonthly: 0,
      region: 'IN',
    });
    expect(acts.map((a) => a.activityType)).toEqual(['diet']);
  });
});

describe('simulator snapshot storage', () => {
  it('rejects malformed snapshots instead of trusting storage', () => {
    expect(isValidSnapshot(null)).toBe(false);
    expect(isValidSnapshot({ activities: [] })).toBe(false);
    expect(isValidSnapshot({ activities: [{ category: 'X' }] })).toBe(false);
    expect(
      isValidSnapshot({
        activities: [
          { category: 'FOOD', activityType: 'diet', subtype: 'mixed', frequency: 'DAILY', quantity: 1, unit: 'day' },
        ],
      })
    ).toBe(true);
  });

  it('is safe to call outside the browser (no window)', () => {
    saveSimulatorSnapshot({ activities: [], createdAt: '', summary: '' });
    expect(loadSimulatorSnapshot()).toBeNull();
    clearSimulatorSnapshot();
  });
});
