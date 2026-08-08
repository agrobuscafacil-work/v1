import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/common/utils/prisma-adapter';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

(async () => {
  const prisma = new PrismaClient({
    adapter: createPrismaPgAdapter(process.env.DATABASE_URL, process.env.DATABASE_SSL === 'true'),
  });
  const users = await prisma.user.findMany({ select: { email: true, name: true, role: true } });
  console.log('total usuarios:', users.length);
  for (const u of users) {
    const row = await prisma.user.findUnique({ where: { email: u.email }, select: { password: true } });
    const isSeedPw = await bcrypt.compare('@123123123', row?.password || '');
    console.log(
      `${u.email} | ${u.name} | ${u.role} | senha conhecida? ${
        isSeedPw ? 'SIM @123123123 (seed)' : 'NAO (acesso/hash definido por quem criou)'
      }`,
    );
  }
  await prisma.$disconnect();
})();