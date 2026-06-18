import 'dotenv/config';
import { app } from '@/app.js';
import { prisma } from '@/db/prisma.js';

const PORT = process.env.PORT ?? 3000;
const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
