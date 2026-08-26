import { router, publicProcedure } from '@/trpc/trpc.config.js';

export const appRouter = router({
  health: router({
    message: publicProcedure.query(() => {
      return { message: 'trpc is working!' };
    }),
  }),
});

export type AppRouter = typeof appRouter;
