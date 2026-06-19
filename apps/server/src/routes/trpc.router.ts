import { router, publicProcedure } from '@/config/trpc.config.js';
import { authRouter } from './auth.router.js';

export const appRouter = router({
  health: router({
    message: publicProcedure.query(() => {
      return { message: 'trpc is working!' };
    }),
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
