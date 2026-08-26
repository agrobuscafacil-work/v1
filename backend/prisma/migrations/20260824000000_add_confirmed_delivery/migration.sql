-- Add confirmedDeliveryAt column to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN "confirmedDeliveryAt" TIMESTAMP(3);

-- Add confirmedDeliveryAt column to Order
ALTER TABLE "Order" ADD COLUMN "confirmedDeliveryAt" TIMESTAMP(3);