import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

const PROTECTED_PATHS = [
  '/dashboard',
  '/calculate',
  '/simulator',
  '/scenarios',
  '/reduction-plan',
  '/diary',
  '/goals',
  '/insights',
  '/coach',
  '/profile',
  '/admin',
];

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes (they handle their own auth via requireAuth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip for static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if route is explicitly public
  const isPublic = PUBLIC_PATHS.some((publicPath) => {
    if (publicPath === '/') return pathname === '/';
    return pathname === publicPath || pathname.startsWith(publicPath + '/');
  });

  if (isPublic) {
    // B.5: signed-in users visiting the landing page should go straight to their dashboard.
    // Auth pages (/auth/login, /auth/register) stay accessible even when signed in
    // (e.g. the user wants to log into a different account).
    if (pathname === '/') {
      const token = request.cookies.get('offset_session')?.value;
      if (token) {
        try {
          const session = await verifyToken(token);
          if (session?.userId) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch {
          // Invalid/expired token — serve the public landing page as normal.
        }
      }
    }
    return NextResponse.next();
  }

  // All other page routes are protected by default.
  const token = request.cookies.get('offset_session')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  try {
    const session = await verifyToken(token);
    if (session && session.userId) {
      return NextResponse.next();
    }
  } catch {
    // Treat verification failures as invalid session
  }

  // Invalid or expired token
  const response = NextResponse.redirect(new URL('/auth/login', request.url));
  response.cookies.delete('offset_session');
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
