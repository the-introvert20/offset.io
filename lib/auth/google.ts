import crypto from 'crypto';

export const OAUTH_STATE_COOKIE_NAME = 'offset_oauth_state';

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function isGoogleAuthAvailable(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleConfig(requestOrigin?: string): GoogleConfig {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

  // Use configured redirect URI, or compute dynamically from request origin if available
  let redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!redirectUri) {
    const origin = requestOrigin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    redirectUri = `${origin.replace(/\/$/, '')}/api/auth/google/callback`;
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
  };
}

export interface OAuthStatePayload {
  token: string;
  redirectPath?: string;
  timestamp: number;
}

export function generateOAuthState(redirectPath?: string): { state: string; cookieValue: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const payload: OAuthStatePayload = {
    token,
    redirectPath: redirectPath && redirectPath.startsWith('/') ? redirectPath : '/dashboard',
    timestamp: Date.now(),
  };

  const cookieValue = Buffer.from(JSON.stringify(payload)).toString('base64url');
  // State sent to Google is the cookie value so we can verify integrity and recover redirect destination
  return {
    state: cookieValue,
    cookieValue,
  };
}

export function verifyOAuthState(stateParam: string | null, cookieValue: string | null | undefined): { isValid: boolean; redirectPath: string } {
  if (!stateParam || !cookieValue || stateParam !== cookieValue) {
    return { isValid: false, redirectPath: '/dashboard' };
  }

  try {
    const decoded = JSON.parse(Buffer.from(cookieValue, 'base64url').toString('utf-8')) as OAuthStatePayload;
    // Check state freshness (15 minutes expiry)
    const isExpired = Date.now() - decoded.timestamp > 15 * 60 * 1000;
    if (isExpired) {
      return { isValid: false, redirectPath: '/dashboard' };
    }

    return {
      isValid: true,
      redirectPath: decoded.redirectPath && decoded.redirectPath.startsWith('/') ? decoded.redirectPath : '/dashboard',
    };
  } catch {
    return { isValid: false, redirectPath: '/dashboard' };
  }
}

export function buildGoogleAuthUrl(config: GoogleConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokens {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForTokens(code: string, config: GoogleConfig): Promise<GoogleTokens> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google token exchange error response:', errorBody);
    throw new Error(`Google token exchange failed with status ${response.status}`);
  }

  return response.json();
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Google userinfo error response:', errorBody);
    throw new Error(`Failed to fetch Google user info: status ${response.status}`);
  }

  return response.json();
}
