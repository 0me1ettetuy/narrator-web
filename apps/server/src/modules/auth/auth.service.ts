import { type CredentialsSchemaType } from '@narrator/schema';
import { Prisma } from '@/db/generated/prisma/client.js';
import { prisma } from '@/db/prisma.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from './tokens.js';
import type { AuthUser, AuthSession } from './auth.types.js';

export class InvalidCredentialsError extends Error {}

export class EmailAlreadyRegisteredError extends Error {}

export class InvalidRefreshTokenError extends Error {}

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

export const login = async (input: CredentialsSchemaType): Promise<AuthSession> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  return createAuthSession({
    id: user.id,
    email: user.email,
  });
};

export const register = async (input: CredentialsSchemaType): Promise<AuthSession> => {
  const passwordHash = await hashPassword(input.password);

  let user: AuthUser;

  try {
    user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new EmailAlreadyRegisteredError();
    }

    throw error;
  }

  return createAuthSession(user);
};

export const refresh = async (refreshToken: string): Promise<AuthSession> => {
  const currentRefreshTokenHash = hashRefreshToken(refreshToken);

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
    throw new InvalidRefreshTokenError();
  }

  if (storedRefreshToken.expiresAt <= new Date()) {
    await prisma.refreshToken.deleteMany({
      where: { id: storedRefreshToken.id },
    });

    throw new InvalidRefreshTokenError();
  }

  const nextRefreshToken = createRefreshToken();

  try {
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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new InvalidRefreshTokenError();
    }

    throw error;
  }

  const accessToken = await createAccessToken({
    sub: storedRefreshToken.user.id,
    email: storedRefreshToken.user.email,
  });

  return { user: storedRefreshToken.user, accessToken, refreshToken: nextRefreshToken };
};

export const logout = async (refreshToken: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token: hashRefreshToken(refreshToken) },
  });
};
