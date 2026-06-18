import express, { type Express } from 'express';
import { prisma } from '@/db/prisma.js';
import { trpcMiddleware } from '@/middleware/trpc.middleware.js';

const app: Express = express();

app.use(express.json());

app.use('/trpc', trpcMiddleware);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'db_unreachable' });
  }
});

export { app };
