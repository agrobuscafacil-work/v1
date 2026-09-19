-- Align legacy User token columns with the current Prisma schema.
ALTER TABLE "User"
  RENAME COLUMN "verificationToken" TO "emailConfirmationToken";

ALTER TABLE "User"
  RENAME COLUMN "resetToken" TO "resetPasswordToken";

ALTER TABLE "User"
  RENAME COLUMN "resetTokenExp" TO "resetPasswordExpires";

ALTER TABLE "User"
  ADD COLUMN "emailConfirmationExpires" TIMESTAMP(3);