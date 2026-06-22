import { credentialsSchema, refreshTokenSchema } from '@narrator/schema';
import { hashPassword, verifyPassword } from '@/auth/password.js';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from '@/auth/tokens.js';
import { prisma } from '@/db/prisma.js';
import { protectedProcedure, publicProcedure, router } from '@/config/trpc.config.js';
import { TRPCError } from '@trpc/server';

type AuthUser = {
  id: string;
  email: string;
};

const createAuthSession = async (user: AuthUser) => {
  const refreshToken = createRefreshToken();

  await prisma.refreshToken.create({
    data: {
      token: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });

  const accessToken = await createAccessToken({
    sub: user.id,
    email: user.email,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

const invalidCredentialsError = () => {
  return new TRPCError({
    code: 'UNAUTHORIZED',
    message: 'Invalid email or password',
  });
};

export const authRouter = router({
  register: publicProcedure.input(credentialsSchema).mutation(async ({ input }) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Email is already registered',
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return createAuthSession(user);
  }),

  login: publicProcedure.input(credentialsSchema).mutation(async ({ input }) => {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw invalidCredentialsError();
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw invalidCredentialsError();
    }

    return createAuthSession({
      id: user.id,
      email: user.email,
    });
  }),

  refresh: publicProcedure.input(refreshTokenSchema).mutation(async ({ input }) => {
    const currentRefreshTokenHash = hashRefreshToken(input.refreshToken);

    const storedRefreshToken = await prisma.refreshToken.findUnique({
      where: { token: currentRefreshTokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!storedRefreshToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }

    if (storedRefreshToken.expiresAt <= new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedRefreshToken.id },
      });

      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const nextRefreshToken = createRefreshToken();

    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedRefreshToken.id },
      }),
      prisma.refreshToken.create({
        data: {
          token: hashRefreshToken(nextRefreshToken),
          userId: storedRefreshToken.userId,
          expiresAt: getRefreshTokenExpiresAt(),
        },
      }),
    ]);

    const accessToken = await createAccessToken({
      sub: storedRefreshToken.user.id,
      email: storedRefreshToken.user.email,
    });

    return {
      user: storedRefreshToken.user,
      accessToken,
      refreshToken: nextRefreshToken,
    };
  }),

  logout: publicProcedure.input(refreshTokenSchema).mutation(async ({ input }) => {
    await prisma.refreshToken.deleteMany({
      where: { token: hashRefreshToken(input.refreshToken) },
    });

    return { success: true };
  }),

  me: protectedProcedure.query(({ ctx }) => {
    return { user: ctx.user };
  }),
});
