import { createContext } from '@/trpc/trpc.context.js';
import { appRouter } from '@/trpc/trpc.router.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

export const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});
