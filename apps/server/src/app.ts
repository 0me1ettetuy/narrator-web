import express, { type Express } from 'express';
import { prisma } from '@/db/prisma.js';
import { trpcMiddleware } from '@/trpc/trpc.middleware.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth.js';

const app: Express = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use(express.json());

app.use(cookieParser());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'db_unreachable' });
  }
});

app.use('/', trpcMiddleware);

export { app };
