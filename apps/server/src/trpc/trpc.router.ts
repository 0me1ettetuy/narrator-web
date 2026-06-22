import { router, publicProcedure } from '@/trpc/trpc.config.js';
import { authRouter } from '../modules/auth/auth.router.js';

export const appRouter = router({
  health: router({
    message: publicProcedure.query(() => {
      return { message: 'trpc is working!' };
    }),
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
