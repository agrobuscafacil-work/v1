CREATE TABLE "SupplierFoundationHistory" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "foundationDate" DATE NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierFoundationHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SupplierFoundationHistory_supplierId_foundationDate_key" ON "SupplierFoundationHistory"("supplierId", "foundationDate");
CREATE INDEX "SupplierFoundationHistory_supplierId_recordedAt_idx" ON "SupplierFoundationHistory"("supplierId", "recordedAt");

INSERT INTO "SupplierFoundationHistory" ("id", "supplierId", "foundationDate", "recordedAt")
SELECT md5(random()::text || clock_timestamp()::text || sp."id"), sp."id", sp."createdAt"::date, sp."createdAt"
FROM "SupplierProfile" sp;

ALTER TABLE "SupplierFoundationHistory" ADD CONSTRAINT "SupplierFoundationHistory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;