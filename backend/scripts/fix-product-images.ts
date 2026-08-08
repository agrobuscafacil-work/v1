import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/common/utils/prisma-adapter';
import 'dotenv/config';
import { mkdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  adapter: createPrismaPgAdapter(process.env.DATABASE_URL, process.env.DATABASE_SSL === 'true'),
});

const uploadsRoot = process.env.UPLOAD_DIR
  ? require('path').resolve(process.env.UPLOAD_DIR)
  : join(process.cwd(), 'uploads');
const productDir = join(uploadsRoot, 'products');
mkdirSync(productDir, { recursive: true });

async function download(seed: string): Promise<Buffer | null> {
  const url = `https://picsum.photos/seed/${seed}/800/600`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
      if (res.ok && res.headers.get('content-type')?.includes('image')) {
        return Buffer.from(await res.arrayBuffer());
      }
      console.log(`  tentativa ${attempt}: HTTP ${res.status} para ${seed}`);
    } catch (e) {
      console.log(`  tentativa ${attempt}: erro baixando ${seed}: ${(e as Error).message}`);
    }
  }
  return null;
}

async function main() {
  const products = await prisma.product.findMany({
    where: { images: { isEmpty: true } },
    select: { id: true, slug: true, name: true },
  });
  console.log(`Produtos sem imagem: ${products.length}`);

  let ok = 0;
  for (const p of products) {
    const filename = `${p.slug}.jpg`;
    const filePath = join(productDir, filename);
    const has = existsSync(filePath) && statSync(filePath).size > 0;
    if (has) {
      console.log(`JA EXISTE: ${p.name}`);
      continue;
    }
    const buf = await download(`agro-${p.slug}`);
    if (!buf) {
      console.log(`FALHOU: ${p.name}`);
      continue;
    }
    writeFileSync(filePath, buf);
    await prisma.product.update({
      where: { id: p.id },
      data: { images: [`/products/images/${filename}`] },
    });
    ok++;
    console.log(`OK: ${p.name} -> ${filename} (${buf.length} bytes)`);
  }
  console.log(`Concluido: ${ok}/${products.length} produtos com imagem.`);
}

async function repairAll() {
  const products = await prisma.product.findMany({
    where: { images: { isEmpty: false } },
    select: { id: true, slug: true, name: true, images: true },
  });
  let rebaixados = 0;
  for (const p of products) {
    const novas: string[] = [];
    for (const img of p.images) {
      const filename = img.split('/').pop()!;
      const filePath = join(productDir, filename);
      if (existsSync(filePath) && statSync(filePath).size > 0) {
        novas.push(img);
        continue;
      }
      const buf = await download(`agro-${p.slug}`);
      if (!buf) { novas.push(img); continue; }
      writeFileSync(filePath, buf);
      novas.push(`/products/images/${filename}`);
      rebaixados++;
      console.log(`REBAIXOU: ${p.name} -> ${filename} (${buf.length} bytes)`);
    }
    if (rebaixados > 0 || novas.join('|') !== p.images.join('|')) {
      await prisma.product.update({ where: { id: p.id }, data: { images: novas } });
    }
  }
  console.log(`Reparo: ${rebaixados} arquivos refeitos em ${products.length} produtos.`);
}

main().then(repairAll)

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());