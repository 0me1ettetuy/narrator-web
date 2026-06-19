import { verifyAccessToken } from '@/auth/tokens.js';
import { prisma } from '@/db/prisma.js';
import { appRouter } from '@/routes/trpc.router.js';
import * as trpcExpress from '@trpc/server/adapters/express';

const getBearerToken = (authorizationHeader: string | undefined) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length);
};

const createContext = async (opts: trpcExpress.CreateExpressContextOptions) => {
  const accessToken = getBearerToken(opts.req.headers.authorization);

  if (!accessToken) {
    return { user: null };
  }

  try {
    const payload = await verifyAccessToken(accessToken);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    return { user };
  } catch {
    return { user: null };
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});
