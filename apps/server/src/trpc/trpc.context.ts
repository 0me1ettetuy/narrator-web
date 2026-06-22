import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE,
  setRefreshTokenCookie,
} from '@/modules/auth/cookies.js';
import { verifyAccessToken } from '@/modules/auth/tokens.js';
import type { AuthUser } from '@/modules/auth/auth.types.js';
import { prisma } from '@/db/prisma.js';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export type Context = {
  user: AuthUser | null;
  auth: {
    refreshToken: string | null;
    setRefreshToken: (refreshToken: string) => void;
    clearRefreshToken: () => void;
  };
};

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length);
};

export const createContext = async (opts: CreateExpressContextOptions): Promise<Context> => {
  const accessToken = getBearerToken(opts.req.headers.authorization);
  const refreshTokenCookie: unknown = opts.req.cookies[REFRESH_TOKEN_COOKIE];
  let user: AuthUser | null = null;

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);

      user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      });
    } catch {
      user = null;
    }
  }

  return {
    user,
    auth: {
      refreshToken: typeof refreshTokenCookie === 'string' ? refreshTokenCookie : null,
      setRefreshToken: (refreshToken) => setRefreshTokenCookie(opts.res, refreshToken),
      clearRefreshToken: () => clearRefreshTokenCookie(opts.res),
    },
  };
};
