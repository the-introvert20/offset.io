import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '../lib/db';
import { requireAuth } from '../lib/auth/session';

vi.mock('../lib/db', () => ({
  prisma: {
    diaryEntry: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('../lib/auth/session', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('../lib/services/emission-factor.service', () => ({
  emissionFactorService: {
    resolveFactor: vi.fn().mockResolvedValue({
      factor: 0.21,
      unit: 'km',
    }),
  },
}));

describe('Diary CRUD & Session Ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enforces authentication on GET diary entries', async () => {
    vi.mocked(requireAuth).mockRejectedValue(new Error('UNAUTHORIZED'));
    const { GET } = await import('../app/api/diary/route');
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('deletes diary entry belonging to current user', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: 'user-123', email: 'user@test.com', role: 'USER', name: 'User' });
    vi.mocked(prisma.diaryEntry.deleteMany).mockResolvedValue({ count: 1 });

    const { DELETE } = await import('../app/api/diary/[id]/route');
    const req = new Request('http://localhost:3000/api/diary/entry-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'entry-1' } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(prisma.diaryEntry.deleteMany).toHaveBeenCalledWith({
      where: { id: 'entry-1', userId: 'user-123' },
    });
  });

  it('returns 404 when deleting another user entry', async () => {
    vi.mocked(requireAuth).mockResolvedValue({ userId: 'user-123', email: 'user@test.com', role: 'USER', name: 'User' });
    vi.mocked(prisma.diaryEntry.deleteMany).mockResolvedValue({ count: 0 });

    const { DELETE } = await import('../app/api/diary/[id]/route');
    const req = new Request('http://localhost:3000/api/diary/entry-other', { method: 'DELETE' });
    const res = await DELETE(req, { params: { id: 'entry-other' } });

    expect(res.status).toBe(404);
  });
});
