SELECT p.id, p.name, p."supplierId", sp."companyName", sp."userId", u.email
FROM "Product" p
JOIN "SupplierProfile" sp ON p."supplierId" = sp.id
JOIN "User" u ON sp."userId" = u.id
WHERE p.id = 'd03b8e36-9189-4ee0-a9cd-2d42afc90358';