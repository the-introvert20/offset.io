import { describe, it, expect } from 'vitest';
import { calculateEvReductionPercentage } from '../lib/engine/recommendation-constants';

describe('EV Reduction Regional Calibration (Audit K.1)', () => {
  it('calculates correct reduction percentages for each region', () => {
    // Formula: (0.192 - (0.15 * gridFactor)) / 0.192
    // Petrol car: 0.192 kg CO2e/km
    // EV efficiency: 0.15 kWh/km
    
    const tests = [
      { region: 'IN', gridFactor: 0.71, expectedMin: 0.44, expectedMax: 0.45 },
      { region: 'US', gridFactor: 0.385, expectedMin: 0.69, expectedMax: 0.70 },
      { region: 'EU', gridFactor: 0.23, expectedMin: 0.82, expectedMax: 0.83 },
      { region: 'UK', gridFactor: 0.21, expectedMin: 0.83, expectedMax: 0.84 },
      { region: 'GLOBAL', gridFactor: 0.45, expectedMin: 0.64, expectedMax: 0.65 },
    ];

    for (const { region, gridFactor, expectedMin, expectedMax } of tests) {
      const reduction = calculateEvReductionPercentage(region);
      expect(reduction).toBeGreaterThanOrEqual(expectedMin);
      expect(reduction).toBeLessThanOrEqual(expectedMax);
      
      // Verify the calculation manually
      const evEmissions = 0.15 * gridFactor;
      const manualReduction = (0.192 - evEmissions) / 0.192;
      expect(Math.abs(reduction - manualReduction)).toBeLessThan(0.01);
    }
  });

  it('ensures India has lower reduction than US, and US lower than EU (dirtier grids = less benefit)', () => {
    const indiaReduction = calculateEvReductionPercentage('IN');
    const usReduction = calculateEvReductionPercentage('US');
    const euReduction = calculateEvReductionPercentage('EU');
    
    // India's grid is dirtier (0.71 kg/kWh) than US (0.385), so EVs provide LESS benefit
    expect(indiaReduction).toBeLessThan(usReduction);
    expect(usReduction).toBeLessThan(euReduction);
    
    // Verify the actual percentages
    expect(indiaReduction).toBeLessThan(0.5); // ~44.5%
    expect(usReduction).toBeGreaterThan(0.65); // ~69.9%
    expect(euReduction).toBeGreaterThan(0.8); // ~82%
  });

  it('returns GLOBAL reduction for unknown regions', () => {
    const unknown = calculateEvReductionPercentage('XX');
    const global = calculateEvReductionPercentage('GLOBAL');
    expect(unknown).toBe(global);
  });

  it('ensures minimum 10% reduction even with extremely dirty grids', () => {
    const reduction = calculateEvReductionPercentage('TEST_DIRTY_GRID');
    expect(reduction).toBeGreaterThanOrEqual(0.1);
  });
});
