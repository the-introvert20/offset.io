/**
 * Dashboard fetch-state classification.
 *
 * A failed request must never be mistaken for "user has no data".
 * Pages use this helper to pick exactly one of:
 * loading → unauthorized → error → empty → ready
 */

export type DashboardViewState = 'loading' | 'unauthorized' | 'error' | 'empty' | 'ready';

export interface DashboardPayloadLike {
  footprint?: {
    calculations?: Array<unknown> | null;
    totalAnnualEmissionsKg?: number;
  } | null;
}

/**
 * Classifies an already-completed dashboard fetch.
 * Pass the HTTP status (0 when the network itself failed).
 */
export function classifyDashboardResponse(
  httpStatus: number,
  payload: DashboardPayloadLike | null
): Exclude<DashboardViewState, 'loading'> {
  if (httpStatus === 401) return 'unauthorized';
  if (httpStatus === 0 || httpStatus >= 400 || !payload || !payload.footprint) return 'error';
  if (!payload.footprint.calculations || payload.footprint.calculations.length === 0) return 'empty';
  return 'ready';
}

/** True when the payload carries at least one calculated activity. */
export function hasUsableFootprint(payload: DashboardPayloadLike | null): boolean {
  return !!payload?.footprint?.calculations && payload.footprint.calculations.length > 0;
}
