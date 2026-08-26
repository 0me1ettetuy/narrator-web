import 'dotenv/config';
import { prisma } from '../src/db/prisma.ts';
import { auth } from '../src/utils/auth.ts';

const devUser = {
  email: 'dev@example.com',
  password: 'password123',
  name: 'Dev User',
};

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email: devUser.email },
  });

  if (!existingUser) {
    await auth.api.signUpEmail({
      body: devUser,
    });
  }

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
