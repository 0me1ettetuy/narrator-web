import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '../db/prisma.js';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  trustedOrigins: process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : [],
  emailAndPassword: {
    enabled: true,
  },
});
