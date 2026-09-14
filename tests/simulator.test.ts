import { describe, it, expect, vi } from 'vitest';
import { runSimulationApi } from '../features/simulator/api';

describe('Simulator API & Cancellation', () => {
  it('supports AbortSignal to cancel in-flight simulation requests', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      runSimulationApi(
        {
          carKmMonthly: 390,
          vehicleSubtype: 'petrol',
          electricityKwhMonthly: 320,
          renewablePct: 0,
          dietPattern: 'mixed',
          flightKmYearly: 1500,
          wasteKgMonthly: 45,
        },
        controller.signal
      )
    ).rejects.toThrow();
  });
});
