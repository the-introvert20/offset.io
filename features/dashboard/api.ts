import { DashboardData } from './types';

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}
