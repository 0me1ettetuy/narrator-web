import { appRouter } from '@/routes/trpc.router.js';
import * as trpcExpress from '@trpc/server/adapters/express';

const createContext = (_opts: trpcExpress.CreateExpressContextOptions) => ({});
export type Context = Awaited<ReturnType<typeof createContext>>;

export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
});
