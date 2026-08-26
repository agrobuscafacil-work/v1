BEGIN;

-- Delete all data except admin
-- First delete child records
DELETE FROM "ReviewResponse";
DELETE FROM "Review" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "OrderItem" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "OrderCoupon" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Payment" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "OrderStatusHistory" WHERE "orderId" IN (SELECT id FROM "Order" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Order" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "CartItem" WHERE "cartId" IN (SELECT id FROM "Cart" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Cart" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "Favorite" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "Message" WHERE "senderId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');
DELETE FROM "Conversation" WHERE "customerId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br') OR "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));

DELETE FROM "Notification" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "SupportTicketNote" WHERE "ticketId" IN (SELECT id FROM "SupportTicket" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "SupportTicket" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "Address" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

DELETE FROM "RefreshToken" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

-- Products and services of non-admin suppliers
DELETE FROM "Product" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Service" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Promotion" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Coupon" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "WorkingHours" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Banner" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));
DELETE FROM "Category" WHERE "supplierId" IN (SELECT id FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br'));

DELETE FROM "SupplierProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');
DELETE FROM "CustomerProfile" WHERE "userId" != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');
DELETE FROM "User" WHERE id != (SELECT id FROM "User" WHERE email = 'admin@agrobuscafacil.com.br');

COMMIT;