-- Create PaymentCustomer table
CREATE TABLE "PaymentCustomer" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'MERCADOPAGO',
    "providerCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCustomer_pkey" PRIMARY KEY ("id")
);

-- Create indexes for PaymentCustomer
CREATE UNIQUE INDEX "PaymentCustomer_userId_provider_key" ON "PaymentCustomer"("userId", "provider");
CREATE UNIQUE INDEX "PaymentCustomer_provider_providerCustomerId_key" ON "PaymentCustomer"("provider", "providerCustomerId");
CREATE INDEX "PaymentCustomer_userId_idx" ON "PaymentCustomer"("userId");
CREATE INDEX "PaymentCustomer_provider_idx" ON "PaymentCustomer"("provider");

-- Create PaymentCard table
CREATE TABLE "PaymentCard" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "paymentCustomerId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'MERCADOPAGO',
    "providerCardId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentCard_pkey" PRIMARY KEY ("id")
);

-- Create indexes for PaymentCard
CREATE UNIQUE INDEX "PaymentCard_userId_providerCardId_key" ON "PaymentCard"("userId", "providerCardId");
CREATE INDEX "PaymentCard_userId_isDefault_idx" ON "PaymentCard"("userId", "isDefault");
CREATE INDEX "PaymentCard_paymentCustomerId_idx" ON "PaymentCard"("paymentCustomerId");

-- Add foreign keys
ALTER TABLE "PaymentCustomer" ADD CONSTRAINT "PaymentCustomer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentCard" ADD CONSTRAINT "PaymentCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentCard" ADD CONSTRAINT "PaymentCard_paymentCustomerId_fkey" FOREIGN KEY ("paymentCustomerId") REFERENCES "PaymentCustomer"("id") ON DELETE CASCADE ON UPDATE CASCADE;