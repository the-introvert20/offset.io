import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';
import { signToken } from '../lib/auth/jwt';

describe('Middleware Route Protection', () => {
  it('allows public routes like landing page without token', async () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('allows login page without token', async () => {
    const req = new NextRequest('http://localhost:3000/auth/login');
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it('redirects unauthenticated user accessing protected route (/dashboard)', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login');
  });

  it('redirects invalid token accessing protected route', async () => {
    const req = new NextRequest('http://localhost:3000/dashboard', {
      headers: { cookie: 'offset_session=invalid-garbage-token' },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login');
  });

  it('allows valid token accessing protected route', async () => {
    const token = await signToken({ userId: 'user-123', email: 'test@offset.io', role: 'USER', name: 'Test User' });
    const req = new NextRequest('http://localhost:3000/dashboard', {
      headers: { cookie: `offset_session=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
