UPDATE "Product" AS product
SET "saleMode" = CASE
  WHEN category.slug IN ('servicos', 'infraestrutura-rural', 'pecuaria', 'maquinas-e-implementos') THEN 'CONTACT_ONLY'::"SaleMode"
  ELSE 'DIRECT'::"SaleMode"
END
FROM "Category" AS category
WHERE product."categoryId" = category."id";
