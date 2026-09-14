import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return 'default-dev-secret-key-offset-io-minimum-32-chars';
  }
  return secret;
}

const secretKey = new TextEncoder().encode(getJwtSecret());

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload || !payload.userId || typeof payload.userId !== 'string') {
      return null;
    }
    return {
      userId: payload.userId,
      email: (payload.email as string) || '',
      role: (payload.role as string) || 'USER',
      name: (payload.name as string) || '',
    };
  } catch {
    return null;
  }
}
