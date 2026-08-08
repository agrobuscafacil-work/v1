import { PrismaClient } from '../src/generated/prisma/client';
import { createPrismaPgAdapter } from '../src/common/utils/prisma-adapter';
import 'dotenv/config';
import { readdirSync, rmSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient({
  adapter: createPrismaPgAdapter(process.env.DATABASE_URL, process.env.DATABASE_SSL === 'true'),
});

const ADMIN_EMAIL = 'admin@agrobuscafacil.com.br';

async function main() {
  const report: Array<[string, number]> = [];
  const track = async (label: string, fn: () => Promise<{ count: number }>) => {
    const { count } = await fn();
    report.push([label, count]);
    console.log(`${label.padEnd(42)} ${count.toString().padStart(4)} removidos`);
  };

  await prisma.$transaction(async (tx) => {
    await track('AuditLog', () => tx.auditLog.deleteMany());
    await track('Report', () => tx.report.deleteMany());
    await track('Favorite', () => tx.favorite.deleteMany());
    await track('Notification', () => tx.notification.deleteMany());
    await track('Message', () => tx.message.deleteMany());
    await track('Conversation', () => tx.conversation.deleteMany());

    await track('OrderStatusHistory', () => tx.orderStatusHistory.deleteMany());
    await track('OrderCoupon', () => tx.orderCoupon.deleteMany());
    await track('OrderItem', () => tx.orderItem.deleteMany());
    await track('Payment', () => tx.payment.deleteMany());
    await track('Order', () => tx.order.deleteMany());

    await track('ReviewResponse', () => tx.reviewResponse.deleteMany());
    await track('Review', () => tx.review.deleteMany());

    await track('CartItem', () => tx.cartItem.deleteMany());
    await track('Cart', () => tx.cart.deleteMany());

    await track('Promotion', () => tx.promotion.deleteMany());
    await track('Coupon', () => tx.coupon.deleteMany());

    await track('WorkingHours', () => tx.workingHours.deleteMany());
    await track('Product', () => tx.product.deleteMany());
    await track('Service', () => tx.service.deleteMany());

    await track('SupportAttachment', () => tx.supportAttachment.deleteMany());
    await track('SupportTicketNote', () => tx.supportTicketNote.deleteMany());
    await track('SupportTicketStatusHistory', () => tx.supportTicketStatusHistory.deleteMany());
    await track('SupportTicket', () => tx.supportTicket.deleteMany());

    await track('Address', () => tx.address.deleteMany());
    await track('CustomerProfile', () => tx.customerProfile.deleteMany());
    await track('SupplierProfile', () => tx.supplierProfile.deleteMany());

    const kept = await tx.user.findMany({ where: { email: ADMIN_EMAIL }, select: { id: true } });
    await track('User (exceto admin)', () =>
      tx.user.deleteMany({ where: { email: { not: ADMIN_EMAIL } } }),
    );
    if (kept.length === 0) {
      console.log('ATENCAO: admin padrão nao encontrado — nenhum usuario sera mantido.');
    }
  });

  const [root] = [...report].reduce(
    ([sum], [, n]) => [sum + n, 0] as [number, number],
    [0, 0] as [number, number],
  );
  console.log('--------------------------------');
  console.log(`TOTAL: ${root} registros de dominio removidos.`);

  const uploadsRoot = process.env.UPLOAD_DIR
    ? join(process.cwd(), process.env.UPLOAD_DIR)
    : join(process.cwd(), 'uploads');
  let filesRemoved = 0;
  for (const dir of ['products', 'support']) {
    const target = join(uploadsRoot, dir);
    try {
      for (const f of readdirSync(target)) {
        rmSync(join(target, f), { force: true });
        filesRemoved++;
      }
    } catch {}
  }
  console.log(`Arquivos de imagem removidos do disco: ${filesRemoved}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());