import { type CredentialsSchemaType } from '@narrator/schema';
import { Prisma } from '@/db/generated/prisma/client.js';
import { prisma } from '@/db/prisma.js';
import { hashPassword, verifyPassword } from './password.js';
import {
  createAccessToken,
  createRefreshToken,
  createTokenFamilyId,
  getRefreshTokenExpiresAt,
  getRotationGraceMs,
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
      familyId: createTokenFamilyId(),
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
  const storedRefreshToken = await prisma.refreshToken.findUnique({
    where: { token: hashRefreshToken(refreshToken) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (!storedRefreshToken || storedRefreshToken.expiresAt <= new Date()) {
    throw new InvalidRefreshTokenError();
  }

  if (storedRefreshToken.rotatedAt) {
    const withinGraceWindow =
      Date.now() - storedRefreshToken.rotatedAt.getTime() <= getRotationGraceMs();

    if (!withinGraceWindow) {
      await prisma.refreshToken.deleteMany({
        where: { familyId: storedRefreshToken.familyId },
      });

      throw new InvalidRefreshTokenError();
    }
  }

  const nextRefreshToken = createRefreshToken();

  await prisma.$transaction(async (tx) => {
    const created = await tx.refreshToken.create({
      data: {
        token: hashRefreshToken(nextRefreshToken),
        userId: storedRefreshToken.userId,
        familyId: storedRefreshToken.familyId,
        expiresAt: getRefreshTokenExpiresAt(),
      },
    });

    if (!storedRefreshToken.rotatedAt) {
      await tx.refreshToken.update({
        where: { id: storedRefreshToken.id },
        data: { rotatedAt: new Date(), replacedById: created.id },
      });
    }
  });

  const accessToken = await createAccessToken({
    sub: storedRefreshToken.user.id,
    email: storedRefreshToken.user.email,
  });

  return { user: storedRefreshToken.user, accessToken, refreshToken: nextRefreshToken };
};

export const logout = async (refreshToken: string): Promise<void> => {
  const storedRefreshToken = await prisma.refreshToken.findUnique({
    where: { token: hashRefreshToken(refreshToken) },
    select: { familyId: true },
  });

  if (!storedRefreshToken) return;

  await prisma.refreshToken.deleteMany({
    where: { familyId: storedRefreshToken.familyId },
  });
};
