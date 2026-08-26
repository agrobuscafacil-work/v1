-- Add verifiedPurchase column to Review
ALTER TABLE "Review" ADD COLUMN "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false;