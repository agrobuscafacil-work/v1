SELECT o.id, o."orderNumber", o."supplierId", sp."companyName", sp."userId"
FROM "Order" o
JOIN "SupplierProfile" sp ON o."supplierId" = sp.id
WHERE o.id = 'e0b6425b-11df-4f0c-968a-54438e76b650';