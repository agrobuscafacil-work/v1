SELECT sp.id, sp."companyName", sp."userId", u.email
FROM "SupplierProfile" sp
JOIN "User" u ON sp."userId" = u.id
WHERE sp.id = '3f27a882-9f1b-4714-b5b7-45af0f8a0101';