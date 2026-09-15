/**
 * Simulator → scenarios handoff.
 *
 * "Save as scenario" must carry the user's CURRENT simulator settings,
 * not discard them. The simulator page stores a snapshot in
 * localStorage; the scenarios page offers to create the new scenario
 * from that snapshot instead of from the stored baseline.
 *
 * The activity mapping mirrors app/api/simulator/route.ts (server
 * remains the source of truth and reprices everything on create).
 */

export interface SnapshotActivity {
  category: string;
  activityType: string;
  subtype: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  quantity: number;
  unit: string;
  region: string;
}

export interface SimulatorInput {
  carKmMonthly: number;
  vehicleSubtype: string;
  electricityKwhMonthly: number;
  renewablePct: number;
  dietPattern: string;
  flightKmYearly: number;
  wasteKgMonthly: number;
  region: string;
}

export interface SimulatorSnapshot {
  activities: SnapshotActivity[];
  createdAt: string;
  summary: string;
}

const STORAGE_KEY = 'offset.simulatorSnapshot.v1';

/** Builds scenario-ready activities from simulator controls (mirrors the API route). */
export function buildSimulatorActivities(input: SimulatorInput): SnapshotActivity[] {
  const region = input.region || 'GLOBAL';
  const gridSubtype = `grid_${region.toLowerCase()}`;
  const activities: SnapshotActivity[] = [];

  if (input.carKmMonthly > 0) {
    activities.push({
      category: 'TRANSPORTATION',
      activityType: 'car',
      subtype: input.vehicleSubtype,
      frequency: 'MONTHLY',
      quantity: input.carKmMonthly,
      unit: 'km',
      region,
    });
  }
  if (input.flightKmYearly > 0) {
    activities.push({
      category: 'TRANSPORTATION',
      activityType: 'flight',
      subtype: 'short_haul',
      frequency: 'YEARLY',
      quantity: input.flightKmYearly,
      unit: 'km',
      region: 'GLOBAL',
    });
  }
  const gridKwh = input.electricityKwhMonthly * (1 - input.renewablePct / 100);
  const solarKwh = (input.electricityKwhMonthly * input.renewablePct) / 100;
  if (gridKwh > 0) {
    activities.push({
      category: 'ENERGY',
      activityType: 'electricity',
      subtype: gridSubtype,
      frequency: 'MONTHLY',
      quantity: Math.round(gridKwh * 10) / 10,
      unit: 'kWh',
      region,
    });
  }
  if (solarKwh > 0) {
    activities.push({
      category: 'ENERGY',
      activityType: 'solar',
      subtype: 'renewable',
      frequency: 'MONTHLY',
      quantity: Math.round(solarKwh * 10) / 10,
      unit: 'kWh',
      region: 'GLOBAL',
    });
  }
  activities.push({
    category: 'FOOD',
    activityType: 'diet',
    subtype: input.dietPattern,
    frequency: 'DAILY',
    quantity: 1,
    unit: 'day',
    region: 'GLOBAL',
  });
  if (input.wasteKgMonthly > 0) {
    activities.push({
      category: 'WASTE',
      activityType: 'waste',
      subtype: 'landfill',
      frequency: 'MONTHLY',
      quantity: input.wasteKgMonthly,
      unit: 'kg',
      region: 'GLOBAL',
    });
  }
  return activities;
}

/** Defensively validates a parsed snapshot (never trust raw storage). */
export function isValidSnapshot(value: unknown): value is SimulatorSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snap = value as Partial<SimulatorSnapshot>;
  if (!Array.isArray(snap.activities) || snap.activities.length === 0) return false;
  return snap.activities.every(
    (a) =>
      a &&
      typeof a.category === 'string' &&
      typeof a.activityType === 'string' &&
      typeof a.subtype === 'string' &&
      typeof a.frequency === 'string' &&
      typeof a.quantity === 'number' &&
      a.quantity >= 0 &&
      typeof a.unit === 'string'
  );
}

export function saveSimulatorSnapshot(snapshot: SimulatorSnapshot): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage unavailable (private mode etc.) — the scenarios page falls back to baseline.
  }
}

export function loadSimulatorSnapshot(): SimulatorSnapshot | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValidSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSimulatorSnapshot(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
