import 'dotenv/config';
import { prisma } from '../src/db/prisma.ts';

await prisma.$connect();

console.log('Seed complete!');

await prisma.$disconnect();
