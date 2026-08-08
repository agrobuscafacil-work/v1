import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/common/utils/prisma-adapter';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

const NEW_PASSWORD = 'Senha@123';

(async () => {
  const prisma = new PrismaClient({
    adapter: createPrismaPgAdapter(process.env.DATABASE_URL, process.env.DATABASE_SSL === 'true'),
  });
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hash = await bcrypt.hash(NEW_PASSWORD, saltRounds);
  const res = await prisma.user.updateMany({ data: { password: hash } });
  console.log(`senha de ${res.count} usuario(s) alterada para '${NEW_PASSWORD}'`);
  await prisma.$disconnect();
})();