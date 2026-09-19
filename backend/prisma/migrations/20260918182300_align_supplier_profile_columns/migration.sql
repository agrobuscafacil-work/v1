-- Align SupplierProfile with the current Prisma schema.
DO $$
BEGIN
  CREATE TYPE "SupplierTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "SupplierProfile"
  ADD COLUMN "tier" "SupplierTier" NOT NULL DEFAULT 'BASIC',
  ADD COLUMN "profileTheme" TEXT NOT NULL DEFAULT 'A';