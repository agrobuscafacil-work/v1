-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchLog_term_key" ON "SearchLog"("term");

-- CreateIndex
CREATE INDEX "SearchLog_count_idx" ON "SearchLog"("count");

-- CreateTable
CREATE TABLE "SessionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "pagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionLog_userId_idx" ON "SessionLog"("userId");

-- CreateIndex
CREATE INDEX "SessionLog_createdAt_idx" ON "SessionLog"("createdAt");