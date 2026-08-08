-- AlterTable
ALTER TABLE "SessionLog" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE INDEX "SessionLog_sessionId_idx" ON "SessionLog"("sessionId");