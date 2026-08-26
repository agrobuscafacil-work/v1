-- Create ReviewReportReason enum if not exists
DO $$ BEGIN
  CREATE TYPE "ReviewReportReason" AS ENUM ('SPAM', 'OFFENSIVE_CONTENT', 'FAKE_REVIEW', 'IRRELEVANT', 'PERSONAL_INFORMATION', 'ADVERTISEMENT', 'OTHER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create ReviewReportStatus enum if not exists
DO $$ BEGIN
  CREATE TYPE "ReviewReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Create SellerReview table if not exists
CREATE TABLE IF NOT EXISTS "SellerReview" (
    id TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    title TEXT,
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    status "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "moderatorId" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerReview_pkey" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "SellerReview_userId_orderId_key" ON "SellerReview"("userId", "orderId");
CREATE INDEX IF NOT EXISTS "SellerReview_supplierId_idx" ON "SellerReview"("supplierId");
CREATE INDEX IF NOT EXISTS "SellerReview_orderId_idx" ON "SellerReview"("orderId");
CREATE INDEX IF NOT EXISTS "SellerReview_status_idx" ON "SellerReview"(status);

-- Create SellerReviewResponse table if not exists
CREATE TABLE IF NOT EXISTS "SellerReviewResponse" (
    id TEXT NOT NULL,
    "sellerReviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    comment TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerReviewResponse_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "SellerReviewResponse_sellerReviewId_idx" ON "SellerReviewResponse"("sellerReviewId");
CREATE INDEX IF NOT EXISTS "SellerReviewResponse_supplierId_idx" ON "SellerReviewResponse"("supplierId");

-- Create ReviewReport table if not exists
CREATE TABLE IF NOT EXISTS "ReviewReport" (
    id TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    reason "ReviewReportReason" NOT NULL,
    description TEXT,
    status "ReviewReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReviewReport_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "ReviewReport_reviewId_idx" ON "ReviewReport"("reviewId");
CREATE INDEX IF NOT EXISTS "ReviewReport_reportedBy_idx" ON "ReviewReport"("reportedBy");
CREATE INDEX IF NOT EXISTS "ReviewReport_status_idx" ON "ReviewReport"(status);

-- Create SellerReviewReport table if not exists
CREATE TABLE IF NOT EXISTS "SellerReviewReport" (
    id TEXT NOT NULL,
    "sellerReviewId" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL,
    reason "ReviewReportReason" NOT NULL,
    description TEXT,
    status "ReviewReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SellerReviewReport_pkey" PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS "SellerReviewReport_sellerReviewId_idx" ON "SellerReviewReport"("sellerReviewId");
CREATE INDEX IF NOT EXISTS "SellerReviewReport_reportedBy_idx" ON "SellerReviewReport"("reportedBy");
CREATE INDEX IF NOT EXISTS "SellerReviewReport_status_idx" ON "SellerReviewReport"(status);

-- Add foreign keys if not exists
DO $$ BEGIN
  ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReview" ADD CONSTRAINT "SellerReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewResponse" ADD CONSTRAINT "SellerReviewResponse_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES "SellerReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewResponse" ADD CONSTRAINT "SellerReviewResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewResponse" ADD CONSTRAINT "SellerReviewResponse_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "ReviewReport" ADD CONSTRAINT "ReviewReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewReport" ADD CONSTRAINT "SellerReviewReport_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES "SellerReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewReport" ADD CONSTRAINT "SellerReviewReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
  ALTER TABLE "SellerReviewReport" ADD CONSTRAINT "SellerReviewReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
