CREATE TABLE "ProductCode" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductCode_productId_key" ON "ProductCode"("productId");
CREATE UNIQUE INDEX "ProductCode_code_key" ON "ProductCode"("code");
CREATE INDEX "ProductCode_code_idx" ON "ProductCode"("code");

INSERT INTO "ProductCode" ("id", "productId", "code", "createdAt")
SELECT md5(random()::text || clock_timestamp()::text || p."id"), p."id", 'PROD-' || upper(substr(md5(p."id"), 1, 10)), p."createdAt"
FROM "Product" p;

ALTER TABLE "ProductCode" ADD CONSTRAINT "ProductCode_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;