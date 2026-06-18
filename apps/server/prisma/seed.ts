import 'dotenv/config';
import { prisma } from '../src/db/prisma.ts';

const devUser = {
  email: 'dev@example.com',
  passwordHash: '$2b$12$8dhh/l0nWcrt9djhcwRNMOQhTuhADzLd1FohFf4qCy.XY8O13/xcS',
};

async function main() {
  await prisma.user.upsert({
    where: { email: devUser.email },
    update: { passwordHash: devUser.passwordHash },
    create: devUser,
  });

  console.log(`Seeded dev user: ${devUser.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
