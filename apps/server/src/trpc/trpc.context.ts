import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../utils/auth.js';

type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null | undefined;
  emailVerified: boolean;
};

export type Context = {
  user: AuthUser | null;
};

export const createContext = async (opts: CreateExpressContextOptions): Promise<Context> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(opts.req.headers),
  });

  return {
    user: session?.user ?? null,
  };
};
