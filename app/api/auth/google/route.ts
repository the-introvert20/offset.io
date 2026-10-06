import { NextRequest, NextResponse } from 'next/server';
import {
  getGoogleConfig,
  isGoogleAuthAvailable,
  generateOAuthState,
  buildGoogleAuthUrl,
  OAUTH_STATE_COOKIE_NAME,
} from '@/lib/auth/google';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;
    const config = getGoogleConfig(origin);

    if (!isGoogleAuthAvailable()) {
      console.warn('Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.');
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('error', 'google_not_configured');
      return NextResponse.redirect(loginUrl);
    }

    const searchParams = req.nextUrl.searchParams;
    const redirectParam = searchParams.get('redirect') || '/dashboard';

    const { state, cookieValue } = generateOAuthState(redirectParam);
    const authUrl = buildGoogleAuthUrl(config, state);

    const response = NextResponse.redirect(authUrl);

    // Store state in an HTTP-only cookie for CSRF protection
    response.cookies.set(OAUTH_STATE_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    return response;
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('error', 'oauth_init_failed');
    return NextResponse.redirect(loginUrl);
  }
}
