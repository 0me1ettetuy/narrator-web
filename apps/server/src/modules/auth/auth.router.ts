import { credentialsSchema } from '@narrator/schema';
import { protectedProcedure, publicProcedure, router } from '@/trpc/trpc.config.js';
import { TRPCError } from '@trpc/server';
import {
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  login,
  logout,
  refresh,
  register,
} from './auth.service.js';

const throwAuthError = (error: unknown): never => {
  if (error instanceof EmailAlreadyRegisteredError) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'Email is already registered',
    });
  }

  if (error instanceof InvalidCredentialsError) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid email or password',
    });
  }

  if (error instanceof InvalidRefreshTokenError) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  throw error;
};

export const authRouter = router({
  register: publicProcedure.input(credentialsSchema).mutation(async ({ input, ctx }) => {
    try {
      const session = await register(input);

      ctx.auth.setRefreshToken(session.refreshToken);

      return { user: session.user, accessToken: session.accessToken };
    } catch (error) {
      throwAuthError(error);
    }
  }),

  login: publicProcedure.input(credentialsSchema).mutation(async ({ input, ctx }) => {
    try {
      const session = await login(input);

      ctx.auth.setRefreshToken(session.refreshToken);

      return {
        user: session.user,
        accessToken: session.accessToken,
      };
    } catch (error) {
      throwAuthError(error);
    }
  }),

  refresh: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.auth.refreshToken;

    if (typeof refreshToken !== 'string') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      const session = await refresh(refreshToken);

      ctx.auth.setRefreshToken(session.refreshToken);

      return {
        user: session.user,
        accessToken: session.accessToken,
      };
    } catch (error) {
      throwAuthError(error);
    }
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    const refreshToken = ctx.auth.refreshToken;

    if (typeof refreshToken === 'string') {
      await logout(refreshToken);
    }

    ctx.auth.clearRefreshToken();

    return { success: true };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return { user: ctx.user };
  }),
});
