const { PrismaClient } = require('./src/generated/prisma/client');
const prisma = new PrismaClient();
async function main() {
  const suppliers = await prisma.supplierProfile.findMany({
    where: { companyName: 'fornecedorTeste' },
    select: { companyName: true, rating: true, totalReviews: true, sellerRating: true, sellerTotalReviews: true }
  });
  console.log(JSON.stringify(suppliers, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());