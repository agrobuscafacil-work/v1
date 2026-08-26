-- Alter SellerReview unique constraint from [userId, orderId] to [userId, supplierId]
DROP INDEX IF EXISTS "SellerReview_userId_orderId_key"; ALTER TABLE "SellerReview" DROP CONSTRAINT IF EXISTS "SellerReview_userId_orderId_key";
DELETE FROM "SellerReview" WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (PARTITION BY "userId", "supplierId" ORDER BY "createdAt" DESC) as rn FROM "SellerReview") t WHERE rn > 1); CREATE UNIQUE INDEX "SellerReview_userId_supplierId_key" ON "SellerReview"("userId", "supplierId");

