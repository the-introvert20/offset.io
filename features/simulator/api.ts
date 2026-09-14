import { SimulatorInputs, SimulatorResult } from './types';

export async function runSimulationApi(inputs: SimulatorInputs, signal?: AbortSignal): Promise<SimulatorResult> {
  const res = await fetch('/api/simulator', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
    signal,
  });

  if (!res.ok) {
    throw new Error('Simulation failed');
  }

  return res.json();
}

export async function fetchUserBaselineApi(): Promise<SimulatorInputs> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) {
    return {
      carKmMonthly: 390,
      vehicleSubtype: 'petrol',
      electricityKwhMonthly: 320,
      renewablePct: 0,
      dietPattern: 'mixed',
      flightKmYearly: 1500,
      wasteKgMonthly: 45,
    };
  }

  const data = await res.json();
  const breakdown = data.footprint?.categoryBreakdown || {};

  return {
    carKmMonthly: Math.round(((breakdown.TRANSPORTATION?.annualEmissionsKg || 2506) * 0.5) / (12 * 0.21)),
    vehicleSubtype: 'petrol',
    electricityKwhMonthly: Math.round((breakdown.ENERGY?.annualEmissionsKg || 1156) / (12 * 0.385)),
    renewablePct: 0,
    dietPattern: 'mixed',
    flightKmYearly: 1500,
    wasteKgMonthly: 45,
  };
}
