import 'dotenv/config';
import { register, refresh } from './src/modules/auth/auth.service.js';
import { prisma } from './src/db/prisma.js';

const log = (m: string) => console.log(`• ${m}`);

async function main() {
  const email = `reuse-test+${Date.now()}@example.com`;
  const password = 'password123';

  const s1 = await register({ email, password });
  log(`registered          → rt1 = ${s1.refreshToken.slice(0, 8)}…`);

  const s2 = await refresh(s1.refreshToken);
  log(`rotated rt1         → rt2 = ${s2.refreshToken.slice(0, 8)}…`);

  // Immediate replay of the already-rotated rt1 = the cross-tab race.
  const s3 = await refresh(s1.refreshToken);
  log(`grace replay of rt1 → rt3 = ${s3.refreshToken.slice(0, 8)}…  (tolerated ✅)`);

  log('waiting out the 10s grace window…');
  await new Promise((r) => setTimeout(r, 11_000));

  // Replay rt1 after the window = theft → must reject AND revoke the family.
  try {
    await refresh(s1.refreshToken);
    log('post-grace replay   → ❌ BUG: did not throw');
  } catch {
    log('post-grace replay   → rejected (reuse detected ✅)');
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } });
  const remaining = await prisma.refreshToken.count({ where: { userId: user.id } });
  log(`tokens left for user = ${remaining}  (expect 0 → family revoked ✅)`);

  await prisma.user.delete({ where: { email } }); // cleanup the test user
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
