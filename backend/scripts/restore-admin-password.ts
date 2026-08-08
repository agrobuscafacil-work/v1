import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/common/utils/prisma-adapter';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: createPrismaPgAdapter(process.env.DATABASE_URL, process.env.DATABASE_SSL === 'true'),
});

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const hash = await bcrypt.hash('@123123123', saltRounds);
  await prisma.user.updateMany({
    where: { email: 'admin@agrobuscafacil.com.br' },
    data: { password: hash },
  });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@agrobuscafacil.com.br' }, select: { id: true, email: true } });
  console.log('admin restaurado:', admin?.email, admin?.id);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());