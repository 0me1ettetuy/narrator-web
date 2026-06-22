import type { CookieOptions, Response } from 'express';
import { getRefreshTokenExpiresAt } from './tokens.js';

const isProduction = process.env.NODE_ENV === 'production';

export const REFRESH_TOKEN_COOKIE = isProduction ? '__Host-refresh_token' : 'refresh_token';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax',
  path: '/',
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    expires: getRefreshTokenExpiresAt(),
  });

  res.setHeader('Cache-Control', 'no-store');
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
};
