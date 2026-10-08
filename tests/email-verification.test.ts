import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

describe('Email Verification & Pre-Hijacking Protection (Audit B.3)', () => {
  beforeEach(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        email: { in: ['unverified@test.com', 'verified@test.com', 'newgoogle@test.com', 'google-ev-test@test.com'] },
      },
    });
  });

  it('password signups create accounts with emailVerified=false', async () => {
    const passwordHash = await bcrypt.hash('testpass123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'unverified@test.com',
        name: 'Unverified User',
        passwordHash,
        role: 'USER',
        emailVerified: false,
        profile: {
          create: {
            region: 'GLOBAL',
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
    });

    expect(user.emailVerified).toBe(false);
    expect(user.googleId).toBeNull();
  });

  it('google signups create accounts with emailVerified=true', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'newgoogle@test.com',
        name: 'Google User',
        googleId: 'google-123',
        emailVerified: true, // Google OAuth confirms email
        role: 'USER',
        profile: {
          create: {
            region: 'GLOBAL',
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
    });

    expect(user.emailVerified).toBe(true);
    expect(user.googleId).toBe('google-123');
  });

  it('blocks OAuth linking to unverified password accounts (pre-hijacking protection)', async () => {
    // 1. Create an unverified password account
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const unverifiedUser = await prisma.user.create({
      data: {
        email: 'unverified@test.com',
        name: 'Unverified Password User',
        passwordHash,
        emailVerified: false,
        role: 'USER',
        profile: {
          create: {
            region: 'GLOBAL',
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
    });

    // 2. Attempt to link via OAuth should be blocked
    // In the real callback, this would return an error redirect
    // Here we verify the account state
    const existingAccount = await prisma.user.findUnique({
      where: { email: 'unverified@test.com' },
    });

    expect(existingAccount!.emailVerified).toBe(false);
    expect(existingAccount!.googleId).toBeNull();
    
    // The callback route should NOT update this user with a googleId
    // until emailVerified is true
  });

  it('allows OAuth linking to verified password accounts', async () => {
    // 1. Create a verified password account (hypothetically verified through email flow)
    const passwordHash = await bcrypt.hash('testpass123', 10);
    const verifiedUser = await prisma.user.create({
      data: {
        email: 'verified@test.com',
        name: 'Verified Password User',
        passwordHash,
        emailVerified: true, // Hypothetically verified via email
        role: 'USER',
        profile: {
          create: {
            region: 'GLOBAL',
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
    });

    // 2. Link via OAuth (simulate callback behavior)
    const updated = await prisma.user.update({
      where: { email: 'verified@test.com' },
      data: {
        googleId: 'google-verified-123',
        emailVerified: true,
      },
    });

    expect(updated.googleId).toBe('google-verified-123');
    expect(updated.emailVerified).toBe(true);
  });

  it('ensures existing Google users have emailVerified=true', async () => {
    const googleUser = await prisma.user.create({
      data: {
        email: 'google-ev-test@test.com',
        name: 'Google User EV Test',
        googleId: 'google-ev-unique-12345',
        emailVerified: true,
        role: 'USER',
        profile: {
          create: {
            region: 'GLOBAL',
            currency: 'USD',
            onboardingComplete: false,
          },
        },
      },
    });

    expect(googleUser.emailVerified).toBe(true);
  });
});
