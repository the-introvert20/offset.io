import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db';
import { requireAuth } from '../lib/auth/session';

vi.mock('../lib/db', () => ({
  prisma: {
    scenario: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    scenarioActivity: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation((cb) => cb(prisma)),
  },
}));

vi.mock('../lib/auth/session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('../lib/services/footprint.service', () => ({
  footprintService: {
    calculateFootprintFromActivities: vi.fn().mockResolvedValue({
      footprint: { totalAnnualEmissionsKg: 3500 },
    }),
  },
}));

describe('Scenario CRUD & Session Ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces authentication on GET scenarios', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('UNAUTHORIZED'));
    const { GET } = await import('../app/api/scenarios/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('filters GET scenarios by session userId', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: 'user-777', email: 'user@test.com', role: 'USER', name: 'User' });
    vi.mocked(prisma.scenario.findMany).mockResolvedValue([{ id: 'scen-1', userId: 'user-777', name: 'Eco Plan' }] as any);

    const { GET } = await import('../app/api/scenarios/route');
    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.scenarios).toHaveLength(1);
    expect(prisma.scenario.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-777' } })
    );
  });

  it('enforces session ownership when deleting scenario by ID', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: 'user-777', email: 'user@test.com', role: 'USER', name: 'User' });
    vi.mocked(prisma.scenario.deleteMany).mockResolvedValue({ count: 1 });

    const { DELETE } = await import('../app/api/scenarios/[id]/route');
    const req = new Request('http://localhost:3000/api/scenarios/scen-123', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'scen-123' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.scenario.deleteMany).toHaveBeenCalledWith({
      where: { id: 'scen-123', userId: 'user-777' },
    });
  });

  it('returns 404 when deleting scenario belonging to another user', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: 'user-777', email: 'user@test.com', role: 'USER', name: 'User' });
    vi.mocked(prisma.scenario.deleteMany).mockResolvedValue({ count: 0 });

    const { DELETE } = await import('../app/api/scenarios/[id]/route');
    const req = new Request('http://localhost:3000/api/scenarios/scen-other', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'scen-other' } });

    expect(res.status).toBe(404);
  });
});
