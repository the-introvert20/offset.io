import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  generateOAuthState,
  verifyOAuthState,
  buildGoogleAuthUrl,
  getGoogleConfig,
  isGoogleAuthAvailable,
  OAUTH_STATE_COOKIE_NAME,
} from '../lib/auth/google';
import { signToken, verifyToken } from '../lib/auth/jwt';
import { COOKIE_NAME } from '../lib/auth/session';
import { GET as initiateGoogleAuth } from '../app/api/auth/google/route';
import { GET as handleGoogleCallback } from '../app/api/auth/google/callback/route';
import { POST as handleEmailLogin } from '../app/api/auth/login/route';
import { prisma } from '../lib/db';

vi.mock('../lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock global fetch for Google token and userinfo endpoints
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Google OAuth 2.0 Utilities', () => {
  it('generates valid cryptographic state and verifies correctly', () => {
    const { state, cookieValue } = generateOAuthState('/reduction-plan');
    expect(state).toBeTruthy();
    expect(cookieValue).toEqual(state);

    const verification = verifyOAuthState(state, cookieValue);
    expect(verification.isValid).toBe(true);
    expect(verification.redirectPath).toBe('/reduction-plan');
  });

  it('rejects tampered or mismatched state', () => {
    const { state } = generateOAuthState('/dashboard');
    const verification = verifyOAuthState('tampered-state-token', state);
    expect(verification.isValid).toBe(false);
  });

  it('rejects expired state', () => {
    // Generate payload with expired timestamp (20 minutes ago)
    const expiredPayload = {
      token: 'some-random-token',
      redirectPath: '/dashboard',
      timestamp: Date.now() - 20 * 60 * 1000,
    };
    const expiredCookie = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');

    const verification = verifyOAuthState(expiredCookie, expiredCookie);
    expect(verification.isValid).toBe(false);
  });

  it('builds a secure Google authorization URL with all required OpenID parameters', () => {
    const config = {
      clientId: 'test-client-id.apps.googleusercontent.com',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/api/auth/google/callback',
    };

    const url = buildGoogleAuthUrl(config, 'sample-state-value');
    const parsedUrl = new URL(url);

    expect(parsedUrl.origin).toBe('https://accounts.google.com');
    expect(parsedUrl.pathname).toBe('/o/oauth2/v2/auth');
    expect(parsedUrl.searchParams.get('client_id')).toBe('test-client-id.apps.googleusercontent.com');
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/auth/google/callback');
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedUrl.searchParams.get('scope')).toBe('openid email profile');
    expect(parsedUrl.searchParams.get('state')).toBe('sample-state-value');
  });

  it('signs and verifies JWT tokens containing user avatar image', async () => {
    const payload = {
      userId: 'test-uuid-1',
      email: 'alex@example.com',
      name: 'Alex Rivera',
      role: 'USER',
      image: 'https://lh3.googleusercontent.com/a/sample-avatar',
    };

    const token = await signToken(payload);
    const verified = await verifyToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe('test-uuid-1');
    expect(verified?.email).toBe('alex@example.com');
    expect(verified?.name).toBe('Alex Rivera');
    expect(verified?.image).toBe('https://lh3.googleusercontent.com/a/sample-avatar');
  });
});

describe('Google OAuth Initiate Route (/api/auth/google)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it('redirects to login with error if Google credentials are missing', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;

    const req = new NextRequest('http://localhost:3000/api/auth/google');
    const res = await initiateGoogleAuth(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login?error=google_not_configured');
  });

  it('sets OAuth state cookie and redirects to Google when configured', async () => {
    process.env.GOOGLE_CLIENT_ID = 'my-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'my-client-secret';

    const req = new NextRequest('http://localhost:3000/api/auth/google?redirect=/scenarios');
    const res = await initiateGoogleAuth(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(location).toContain('client_id=my-client-id');

    const stateCookie = res.cookies.get(OAUTH_STATE_COOKIE_NAME);
    expect(stateCookie).toBeDefined();
    expect(stateCookie?.value).toBeTruthy();
  });
});

describe('Google OAuth Callback Route (/api/auth/google/callback)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GOOGLE_CLIENT_ID: 'test-google-id',
      GOOGLE_CLIENT_SECRET: 'test-google-secret',
      GOOGLE_REDIRECT_URI: 'http://localhost:3000/api/auth/google/callback',
    };
    vi.clearAllMocks();
  });

  it('handles user cancellation gracefully', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/google/callback?error=access_denied');
    const res = await handleGoogleCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login?error=cancelled');
  });

  it('handles missing or invalid state (CSRF prevention)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/google/callback?code=mock_code&state=invalid_state');
    const res = await handleGoogleCallback(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/auth/login?error=invalid_state');
  });

  it('signs up a new Google user and creates default profile', async () => {
    const { state, cookieValue } = generateOAuthState('/dashboard');

    // Mock Google token endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      }),
    });

    // Mock Google userinfo endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'google-sub-12345',
        email: 'newuser@gmail.com',
        email_verified: true,
        name: 'New Google User',
        picture: 'https://lh3.googleusercontent.com/avatar.jpg',
      }),
    });

    // Mock DB: user not found by googleId or email
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null); // by googleId
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null); // by email

    const createdUser = {
      id: 'new-user-uuid',
      email: 'newuser@gmail.com',
      name: 'New Google User',
      googleId: 'google-sub-12345',
      image: 'https://lh3.googleusercontent.com/avatar.jpg',
      role: 'USER',
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'profile-uuid',
        userId: 'new-user-uuid',
        region: 'GLOBAL',
        dietPattern: 'MIXED',
        householdSize: 1,
        primaryTransport: 'CAR_PETROL',
        targetReductionPct: 20.0,
        monthlyBudget: 2000.0,
        currency: 'USD',
        onboardingComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
    vi.mocked(prisma.user.create).mockResolvedValueOnce(createdUser as any);

    const req = new NextRequest(`http://localhost:3000/api/auth/google/callback?code=valid_code&state=${state}`, {
      headers: { cookie: `${OAUTH_STATE_COOKIE_NAME}=${cookieValue}` },
    });

    const res = await handleGoogleCallback(req);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: 'newuser@gmail.com',
        name: 'New Google User',
        googleId: 'google-sub-12345',
        emailVerified: true,
        image: 'https://lh3.googleusercontent.com/avatar.jpg',
        role: 'USER',
        profile: {
          create: {
            region: 'GLOBAL',
            dietPattern: 'MIXED',
            householdSize: 1,
            primaryTransport: 'CAR_PETROL',
            targetReductionPct: 20.0,
            monthlyBudget: 2000.0,
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
      include: { profile: true },
    });

    // Checks session cookie is set
    const sessionCookie = res.cookies.get(COOKIE_NAME);
    expect(sessionCookie).toBeDefined();

    // Directs new user to onboarding
    expect(res.headers.get('location')).toContain('/onboarding');
  });

  it('links Google account to an existing user with the same email', async () => {
    const { state, cookieValue } = generateOAuthState('/dashboard');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'google-sub-99999',
        email: 'existing@offset.io',
        email_verified: true,
        name: 'Existing User',
        picture: 'https://lh3.googleusercontent.com/newpic.jpg',
      }),
    });

    // Not found by googleId, but found by email - VERIFIED email
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null); // by googleId
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'existing-user-uuid',
      email: 'existing@offset.io',
      name: 'Existing User',
      googleId: null,
      image: null,
      passwordHash: 'hashedpassword',
      emailVerified: true, // Verified account - linking allowed
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'p-1',
        userId: 'existing-user-uuid',
        region: 'GLOBAL',
        dietPattern: 'MIXED',
        householdSize: 1,
        primaryTransport: 'CAR_PETROL',
        targetReductionPct: 20,
        monthlyBudget: 2000,
        currency: 'USD',
        onboardingComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: 'existing-user-uuid',
      email: 'existing@offset.io',
      name: 'Existing User',
      googleId: 'google-sub-99999',
      image: 'https://lh3.googleusercontent.com/newpic.jpg',
      role: 'USER',
      passwordHash: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'p-1',
        userId: 'existing-user-uuid',
        region: 'GLOBAL',
        dietPattern: 'MIXED',
        householdSize: 1,
        primaryTransport: 'CAR_PETROL',
        targetReductionPct: 20,
        monthlyBudget: 2000,
        currency: 'USD',
        onboardingComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/auth/google/callback?code=valid_code&state=${state}`, {
      headers: { cookie: `${OAUTH_STATE_COOKIE_NAME}=${cookieValue}` },
    });

    const res = await handleGoogleCallback(req);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'existing-user-uuid' },
      data: {
        googleId: 'google-sub-99999',
        emailVerified: true,
        image: 'https://lh3.googleusercontent.com/newpic.jpg',
        name: 'Existing User',
      },
      include: { profile: true },
    });

    expect(res.cookies.get(COOKIE_NAME)).toBeDefined();
    expect(res.headers.get('location')).toContain('/dashboard');
  });

  it('logs in existing Google user without modifying account needlessly', async () => {
    const { state, cookieValue } = generateOAuthState('/scenarios');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        expires_in: 3600,
        token_type: 'Bearer',
        scope: 'openid email profile',
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sub: 'google-sub-existing',
        email: 'user@gmail.com',
        email_verified: true,
        name: 'Returning Google User',
        picture: 'https://lh3.googleusercontent.com/existing.jpg',
      }),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'existing-google-user-uuid',
      email: 'user@gmail.com',
      name: 'Returning Google User',
      googleId: 'google-sub-existing',
      image: 'https://lh3.googleusercontent.com/existing.jpg',
      role: 'USER',
      passwordHash: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: 'p-2',
        userId: 'existing-google-user-uuid',
        region: 'GLOBAL',
        dietPattern: 'MIXED',
        householdSize: 1,
        primaryTransport: 'CAR_PETROL',
        targetReductionPct: 20,
        monthlyBudget: 2000,
        currency: 'USD',
        onboardingComplete: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as any);

    const req = new NextRequest(`http://localhost:3000/api/auth/google/callback?code=valid_code&state=${state}`, {
      headers: { cookie: `${OAUTH_STATE_COOKIE_NAME}=${cookieValue}` },
    });

    const res = await handleGoogleCallback(req);

    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(res.cookies.get(COOKIE_NAME)).toBeDefined();
    expect(res.headers.get('location')).toContain('/scenarios');
  });
});

describe('Email/Password Login Route with Google Accounts', () => {
  it('returns a clear message when a Google-only user attempts email/password login', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'google-only-user-id',
      email: 'googleonly@gmail.com',
      name: 'Google Only User',
      googleId: 'google-sub-123',
      image: null,
      passwordHash: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const req = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'googleonly@gmail.com',
        password: 'SomePassword123!',
      }),
    });

    const res = await handleEmailLogin(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Google Sign-In');
  });
});
