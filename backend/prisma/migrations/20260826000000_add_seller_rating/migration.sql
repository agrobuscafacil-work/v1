-- Add sellerRating and sellerTotalReviews to SupplierProfile
ALTER TABLE "SupplierProfile" ADD COLUMN "sellerRating" DECIMAL(3,2) NOT NULL DEFAULT 0;
ALTER TABLE "SupplierProfile" ADD COLUMN "sellerTotalReviews" INTEGER NOT NULL DEFAULT 0;
