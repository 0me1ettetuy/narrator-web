import crypto from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const DEFAULT_REFRESH_TOKEN_TTL_DAYS = 30;

type AccessTokenPayload = {
  sub: string;
  email: string;
};

const getJwtSecret = () => {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret) {
    throw new Error('AUTH_JWT_SECRET is required');
  }

  return new TextEncoder().encode(secret);
};

const getAccessTokenTtlSeconds = () => {
  const ttl = Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS ?? DEFAULT_ACCESS_TOKEN_TTL_SECONDS);

  if (!Number.isInteger(ttl) || ttl <= 0) {
    return DEFAULT_ACCESS_TOKEN_TTL_SECONDS;
  }

  return ttl;
};

const getRefreshTokenTtlDays = () => {
  const ttl = Number(process.env.AUTH_REFRESH_TOKEN_TTL_DAYS ?? DEFAULT_REFRESH_TOKEN_TTL_DAYS);

  if (!Number.isInteger(ttl) || ttl <= 0) {
    return DEFAULT_REFRESH_TOKEN_TTL_DAYS;
  }

  return ttl;
};

export const createAccessToken = async (payload: AccessTokenPayload) => {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${getAccessTokenTtlSeconds()}s`)
    .sign(getJwtSecret());
};

export const verifyAccessToken = async (token: string) => {
  const { payload } = await jwtVerify(token, getJwtSecret());

  if (!payload.sub || typeof payload.email !== 'string') {
    throw new Error('Invalid access token payload');
  }

  return {
    userId: payload.sub,
    email: payload.email,
  };
};

export const createRefreshToken = () => {
  return crypto.randomBytes(48).toString('base64url');
};

export const hashRefreshToken = (refreshToken: string) => {
  return crypto.createHash('sha256').update(refreshToken).digest('hex');
};

export const getRefreshTokenExpiresAt = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + getRefreshTokenTtlDays());

  return expiresAt;
};
