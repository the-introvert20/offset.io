import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth/jwt';
import { COOKIE_NAME } from '@/lib/auth/session';
import {
  getGoogleConfig,
  verifyOAuthState,
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  OAUTH_STATE_COOKIE_NAME,
} from '@/lib/auth/google';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const config = getGoogleConfig(origin);
  const searchParams = req.nextUrl.searchParams;

  const errorParam = searchParams.get('error');
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Handle OAuth cancellation or errors from Google
  if (errorParam) {
    console.warn('Google OAuth returned error:', errorParam);
    const loginUrl = new URL('/auth/login', req.url);
    if (errorParam === 'access_denied') {
      loginUrl.searchParams.set('error', 'cancelled');
    } else {
      loginUrl.searchParams.set('error', 'oauth_error');
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  }

  // Validate presence of code and state
  if (!code || !state) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('error', 'invalid_request');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  }

  // Validate CSRF state against cookie
  const stateCookie = req.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
  const { isValid, redirectPath } = verifyOAuthState(state, stateCookie);

  if (!isValid) {
    console.warn('Invalid or expired OAuth state token');
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('error', 'invalid_state');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, config);

    // 2. Fetch Google user profile
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    if (!googleUser || !googleUser.email || !googleUser.sub) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('error', 'profile_missing');
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
      return response;
    }

    const email = googleUser.email.toLowerCase().trim();
    const googleId = googleUser.sub;
    const name = googleUser.name?.trim() || email.split('@')[0];
    const image = googleUser.picture || null;

    // 3. Find or link or create user
    let user = await prisma.user.findUnique({
      where: { googleId },
      include: { profile: true },
    });

    let isNewUser = false;

    if (!user) {
      // Check if user exists by email (account linking)
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (existingByEmail) {
        // Link Google ID and update image if missing
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId,
            image: existingByEmail.image || image,
            name: existingByEmail.name || name,
          },
          include: { profile: true },
        });
      } else {
        // Create new account
        isNewUser = true;
        user = await prisma.user.create({
          data: {
            email,
            name,
            googleId,
            image,
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
      }
    } else if (image && !user.image) {
      // Update image if available and previously unset
      user = await prisma.user.update({
        where: { id: user.id },
        data: { image },
        include: { profile: true },
      });
    }

    // 4. Generate application JWT session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
    });

    // 5. Determine redirect target
    let destination = redirectPath || '/dashboard';
    if (isNewUser || !user.profile?.onboardingComplete) {
      destination = '/onboarding';
    }

    const destinationUrl = new URL(destination, req.url);
    const response = NextResponse.redirect(destinationUrl);

    // Set session cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Clear state cookie
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Google OAuth callback handler error:', error);
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_callback_failed');
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
    return response;
  }
}
