CREATE TABLE "ReviewLike" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewLike_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerReviewLike" (
    "id" TEXT NOT NULL,
    "sellerReviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerReviewLike_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReviewLike_reviewId_userId_key" ON "ReviewLike"("reviewId", "userId");
CREATE INDEX "ReviewLike_userId_idx" ON "ReviewLike"("userId");
CREATE UNIQUE INDEX "SellerReviewLike_sellerReviewId_userId_key" ON "SellerReviewLike"("sellerReviewId", "userId");
CREATE INDEX "SellerReviewLike_userId_idx" ON "SellerReviewLike"("userId");

ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReviewLike" ADD CONSTRAINT "ReviewLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerReviewLike" ADD CONSTRAINT "SellerReviewLike_sellerReviewId_fkey" FOREIGN KEY ("sellerReviewId") REFERENCES "SellerReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerReviewLike" ADD CONSTRAINT "SellerReviewLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;