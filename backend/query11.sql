SELECT p.id, p.name, p."supplierId", sp."companyName", u.email
FROM "Product" p
JOIN "SupplierProfile" sp ON p."supplierId" = sp.id
JOIN "User" u ON sp."userId" = u.id
WHERE u.email IN (
    'contato@agroquimica.com.br',
    'vendas@sementessilva.com',
    'admin@agrotech.com',
    'contato@fertabc.com',
    'contato@boavista.com',
    'vendas@irrigafacil.com',
    'contato@maquinasagri.com',
    'pedidos@defensivosnac.com',
    'comercial@sementesgenetix.com',
    'vendas@agrotecsistemas.com',
    'contato@pecuariaforte.com',
    'logistica@transporterural.com',
    'admin@armazenagemtotal.com',
    'contato@organicosdovale.com',
    'pedidos@biodefensivos.com',
    'vendas@tratoresecia.com',
    'suporte@irrigatech.com',
    'admin@nutriplant.com'
)
LIMIT 10;