"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SUPPLIERS = [
    { companyName: 'AgroQuímica Brasil', tradingName: 'AgroQuímica', email: 'contato@agroquimica.com.br', user: 'Carlos Almeida', document: '00.000.001/0001-01', phone: '(11) 91111-1111', city: 'Ribeirão Preto', state: 'SP', category: 'insumos', status: client_1.SupplierStatus.APPROVED, rating: 4.8, products: 78 },
    { companyName: 'Sementes Silva', tradingName: 'Sementes Silva', email: 'vendas@sementessilva.com', user: 'Pedro Silva', document: '00.000.002/0001-02', phone: '(11) 92222-2222', city: 'Londrina', state: 'PR', category: 'sementes', status: client_1.SupplierStatus.APPROVED, rating: 4.8, products: 48 },
    { companyName: 'Agro Tech Ltda', tradingName: 'AgroTech', email: 'admin@agrotech.com', user: 'Roberto Lima', document: '00.000.003/0001-03', phone: '(11) 93333-3333', city: 'Campinas', state: 'SP', category: 'implementos', status: client_1.SupplierStatus.APPROVED, rating: 4.6, products: 24 },
    { companyName: 'Fertilizantes ABC', tradingName: 'Fert ABC', email: 'contato@fertabc.com', user: 'Fernando Costa', document: '00.000.004/0001-04', phone: '(11) 94444-4444', city: 'Uberlândia', state: 'MG', category: 'fertilizantes', status: client_1.SupplierStatus.PENDING, rating: 0, products: 15 },
    { companyName: 'Fazenda Boa Vista', tradingName: 'Boa Vista', email: 'contato@boavista.com', user: 'Juliana Campos', document: '00.000.005/0001-05', phone: '(11) 95555-5555', city: 'Campo Grande', state: 'MS', category: 'diversos', status: client_1.SupplierStatus.PENDING, rating: 0, products: 0 },
    { companyName: 'IrrigaFácil', tradingName: 'IrrigaFácil', email: 'vendas@irrigafacil.com', user: 'André Oliveira', document: '00.000.006/0001-06', phone: '(11) 96666-6666', city: 'Campinas', state: 'SP', category: 'irrigacao', status: client_1.SupplierStatus.APPROVED, rating: 4.9, products: 32 },
    { companyName: 'Máquinas Agrícolas LTDA', tradingName: 'Máq. Agrícolas', email: 'contato@maquinasagri.com', user: 'Marcos Santos', document: '00.000.007/0001-07', phone: '(11) 97777-7777', city: 'Cuiabá', state: 'MT', category: 'maquinas', status: client_1.SupplierStatus.APPROVED, rating: 4.5, products: 18 },
    { companyName: 'Defensivos Nacional', tradingName: 'Def. Nacional', email: 'pedidos@defensivosnac.com', user: 'Paulo Rocha', document: '00.000.008/0001-08', phone: '(21) 98888-8888', city: 'Goiânia', state: 'GO', category: 'defensivos', status: client_1.SupplierStatus.APPROVED, rating: 4.7, products: 56 },
    { companyName: 'Sementes Genetix', tradingName: 'Genetix', email: 'comercial@sementesgenetix.com', user: 'Luiz Mendes', document: '00.000.009/0001-09', phone: '(21) 99999-9999', city: 'Passo Fundo', state: 'RS', category: 'sementes', status: client_1.SupplierStatus.APPROVED, rating: 4.9, products: 34 },
    { companyName: 'AgroTec Sistemas', tradingName: 'AgroTec', email: 'vendas@agrotecsistemas.com', user: 'Tiago Barbosa', document: '00.000.010/0001-10', phone: '(31) 91111-1111', city: 'Sorriso', state: 'MT', category: 'tecnologia', status: client_1.SupplierStatus.APPROVED, rating: 4.3, products: 12 },
    { companyName: 'Pecuária Forte', tradingName: 'Pec. Forte', email: 'contato@pecuariaforte.com', user: 'Gustavo Pereira', document: '00.000.011/0001-11', phone: '(31) 92222-2222', city: 'Campo Grande', state: 'MS', category: 'pecuaria', status: client_1.SupplierStatus.APPROVED, rating: 4.5, products: 24 },
    { companyName: 'Transporte Rural Log', tradingName: 'Rural Log', email: 'logistica@transporterural.com', user: 'Ricardo Teixeira', document: '00.000.012/0001-12', phone: '(41) 91111-1111', city: 'Ribeirão Preto', state: 'SP', category: 'logistica', status: client_1.SupplierStatus.APPROVED, rating: 4.2, products: 5 },
    { companyName: 'Armazenagem Total', tradingName: 'Arm. Total', email: 'admin@armazenagemtotal.com', user: 'Fábio Carvalho', document: '00.000.013/0001-13', phone: '(41) 92222-2222', city: 'Passo Fundo', state: 'RS', category: 'armazenagem', status: client_1.SupplierStatus.APPROVED, rating: 4.4, products: 9 },
    { companyName: 'Orgânicos do Vale', tradingName: 'Org. Vale', email: 'contato@organicosdovale.com', user: 'Marina Duarte', document: '00.000.014/0001-14', phone: '(51) 91111-1111', city: 'Londrina', state: 'PR', category: 'organicos', status: client_1.SupplierStatus.PENDING, rating: 0, products: 0 },
    { companyName: 'BioDefensivos Naturais', tradingName: 'BioDef.', email: 'pedidos@biodefensivos.com', user: 'Rafael Nunes', document: '00.000.015/0001-15', phone: '(51) 92222-2222', city: 'Uberlândia', state: 'MG', category: 'defensivos', status: client_1.SupplierStatus.APPROVED, rating: 4.6, products: 22 },
    { companyName: 'Tratores e Cia', tradingName: 'Tratores Cia', email: 'vendas@tratoresecia.com', user: 'Diego Martins', document: '00.000.016/0001-16', phone: '(61) 91111-1111', city: 'Cuiabá', state: 'MT', category: 'maquinas', status: client_1.SupplierStatus.APPROVED, rating: 4.5, products: 14 },
    { companyName: 'IrrigaTech Solutions', tradingName: 'IrrigaTech', email: 'suporte@irrigatech.com', user: 'Eduardo Araújo', document: '00.000.017/0001-17', phone: '(61) 92222-2222', city: 'Sorriso', state: 'MT', category: 'irrigacao', status: client_1.SupplierStatus.BLOCKED, rating: 4.7, products: 28 },
    { companyName: 'NutriPlant Fertilizantes', tradingName: 'NutriPlant', email: 'admin@nutriplant.com', user: 'Bruno Ferreira', document: '00.000.018/0001-18', phone: '(71) 91111-1111', city: 'Goiânia', state: 'GO', category: 'fertilizantes', status: client_1.SupplierStatus.APPROVED, rating: 4.8, products: 41 },
];
async function main() {
    console.log('Seeding database...');
    const hashedPassword = await bcrypt.hash('@123123123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@agrobuscafacil.com.br' },
        update: { password: hashedPassword },
        create: {
            email: 'admin@agrobuscafacil.com.br',
            password: hashedPassword,
            name: 'Administrador',
            document: '000.000.000-00',
            phone: '(11) 99999-9999',
            role: client_1.UserRole.SUPER_ADMIN,
            verified: true,
        },
    });
    await prisma.user.upsert({
        where: { email: 'cliente@agrobuscafacil.com.br' },
        update: { password: hashedPassword },
        create: {
            email: 'cliente@agrobuscafacil.com.br',
            password: hashedPassword,
            name: 'Maria Cliente',
            document: '111.111.111-11',
            phone: '(11) 97777-7777',
            role: client_1.UserRole.CUSTOMER,
            verified: true,
        },
    });
    const supplierMap = new Map();
    for (const s of SUPPLIERS) {
        const user = await prisma.user.upsert({
            where: { email: s.email },
            update: { password: hashedPassword },
            create: {
                email: s.email,
                password: hashedPassword,
                name: s.user,
                document: s.document,
                phone: s.phone,
                role: client_1.UserRole.SUPPLIER,
                verified: s.status === client_1.SupplierStatus.APPROVED,
            },
        });
        const profile = await prisma.supplierProfile.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                companyName: s.companyName,
                tradingName: s.tradingName,
                document: s.document,
                description: `${s.companyName} — fornecedora de produtos para o agronegócio.`,
                phone: s.phone,
                whatsapp: s.phone,
                email: s.email,
                website: `https://${s.tradingName.toLowerCase().replace(/\s+/g, '')}.com.br`,
                status: s.status,
                rating: s.rating,
                totalProducts: s.products,
                foundedYear: 2015 + Math.floor(Math.random() * 10),
                employeesCount: 10 + Math.floor(Math.random() * 90),
                certifications: ['ISO 9001'],
                badges: ['Fornecedor Verificado'],
                featured: s.status === client_1.SupplierStatus.APPROVED && s.rating >= 4.5,
                businessHours: {
                    monday: { open: '08:00', close: '18:00' },
                    tuesday: { open: '08:00', close: '18:00' },
                    wednesday: { open: '08:00', close: '18:00' },
                    thursday: { open: '08:00', close: '18:00' },
                    friday: { open: '08:00', close: '17:00' },
                    saturday: { open: '08:00', close: '12:00' },
                },
            },
        });
        supplierMap.set(s.companyName, profile.id);
    }
    const CATEGORIES = [
        { name: 'Sementes', slug: 'sementes', description: 'Sementes para plantio' },
        { name: 'Fertilizantes', slug: 'fertilizantes', description: 'Fertilizantes e nutrientes' },
        { name: 'Defensivos', slug: 'defensivos', description: 'Defensivos agrícolas' },
        { name: 'Máquinas', slug: 'maquinas', description: 'Máquinas e equipamentos' },
        { name: 'Irrigação', slug: 'irrigacao', description: 'Sistemas de irrigação' },
        { name: 'Implementos', slug: 'implementos', description: 'Implementos agrícolas' },
        { name: 'Pecuária', slug: 'pecuaria', description: 'Insumos pecuários' },
        { name: 'Tecnologia', slug: 'tecnologia', description: 'Tecnologia agrícola' },
        { name: 'Armazenagem', slug: 'armazenagem', description: 'Soluções de armazenagem' },
        { name: 'Diversos', slug: 'diversos', description: 'Diversos' },
    ];
    const categoryMap = new Map();
    for (const c of CATEGORIES) {
        const cat = await prisma.category.upsert({
            where: { slug: c.slug },
            update: {},
            create: { name: c.name, slug: c.slug, description: c.description, active: true },
        });
        categoryMap.set(c.name, cat.id);
    }
    const PRODUCTS = [
        { name: 'Semente de Soja Transgênica RR', slug: 'semente-soja-transgenica-rr', description: 'Semente de soja transgênica Roundup Ready de alta produtividade.', price: 189.90, stock: 45, supplierName: 'Sementes Silva', categoryName: 'Sementes' },
        { name: 'Fertilizante NPK 20-10-10', slug: 'fertilizante-npk-20-10-10', description: 'Fertilizante granulado NPK para diversas culturas.', price: 89.90, stock: 120, supplierName: 'Fertilizantes ABC', categoryName: 'Fertilizantes' },
        { name: 'Defensivo Agrícola Glifosato', slug: 'defensivo-agricola-glifosato', description: 'Herbicida sistêmico não seletivo para controle de plantas daninhas.', price: 45.90, stock: 3, supplierName: 'Agro Tech Ltda', categoryName: 'Defensivos' },
        { name: 'Trator Agrícola 75cv', slug: 'trator-agricola-75cv', description: 'Trator agrícola 75cv 4x2 ideal para médias propriedades.', price: 89990.00, stock: 5, supplierName: 'Máquinas Agrícolas LTDA', categoryName: 'Máquinas' },
        { name: 'Arado de Disco 4 Discos', slug: 'arado-disco-4-discos', description: 'Arado de disco reversível com 4 discos de 26 polegadas.', price: 3499.90, stock: 10, supplierName: 'Agro Tech Ltda', categoryName: 'Implementos' },
        { name: 'Sistema de Irrigação por Gotejamento', slug: 'sistema-irrigacao-gotejamento', description: 'Sistema completo de irrigação por gotejamento para 1000m².', price: 1299.90, stock: 8, supplierName: 'IrrigaFácil', categoryName: 'Irrigação' },
        { name: 'Milho Híbrido Safrinha', slug: 'milho-hibrido-safrinha', description: 'Semente de milho híbrido para safrinha de alta produtividade.', price: 259.90, stock: 72, supplierName: 'Sementes Genetix', categoryName: 'Sementes' },
        { name: 'Inseticida Biológico Lagarta', slug: 'inseticida-biologico-lagarta', description: 'Inseticida biológico para controle de lagartas.', price: 78.50, stock: 34, supplierName: 'BioDefensivos Naturais', categoryName: 'Defensivos' },
        { name: 'Colheitadeira Automotriz', slug: 'colheitadeira-automotriz', description: 'Colheitadeira automotriz de alto desempenho para grãos.', price: 349990.00, stock: 2, supplierName: 'Máquinas Agrícolas LTDA', categoryName: 'Máquinas' },
        { name: 'Fungicida Tratamento Sementes', slug: 'fungicida-tratamento-sementes', description: 'Fungicida para tratamento de sementes com amplo espectro.', price: 112.30, stock: 56, supplierName: 'Defensivos Nacional', categoryName: 'Defensivos' },
        { name: 'Kit Irrigação por Aspersão', slug: 'kit-irrigacao-aspersao', description: 'Kit completo de irrigação por aspersão para 500m².', price: 2450.00, stock: 6, supplierName: 'IrrigaTech Solutions', categoryName: 'Irrigação' },
        { name: 'Pulverizador Costal 20L', slug: 'pulverizador-costal-20l', description: 'Pulverizador costal manual com capacidade para 20 litros.', price: 549.90, stock: 22, supplierName: 'Agro Tech Ltda', categoryName: 'Implementos' },
        { name: 'Sistema de GPS Agrícola', slug: 'sistema-gps-agricola', description: 'Sistema de GPS para agricultura de precisão com correção RTK.', price: 3899.00, stock: 7, supplierName: 'AgroTec Sistemas', categoryName: 'Tecnologia' },
        { name: 'Silo Metálico 5000Kg', slug: 'silo-metalico-5000kg', description: 'Silo metálico para armazenagem de grãos com capacidade de 5000kg.', price: 18990.00, stock: 3, supplierName: 'Armazenagem Total', categoryName: 'Armazenagem' },
        { name: 'Fertilizante Orgânico Húmus', slug: 'fertilizante-organico-humus', description: 'Húmus de minhoca 100% orgânico para adubação.', price: 42.50, stock: 66, supplierName: 'Orgânicos do Vale', categoryName: 'Fertilizantes' },
        { name: 'Defensivo Natural Neem', slug: 'defensivo-natural-neem', description: 'Defensivo natural à base de óleo de neem.', price: 36.90, stock: 41, supplierName: 'BioDefensivos Naturais', categoryName: 'Defensivos' },
        { name: 'Adubo Foliar Líquido', slug: 'adubo-foliar-liquido', description: 'Adubo foliar líquido concentrado com micronutrientes.', price: 67.80, stock: 93, supplierName: 'NutriPlant Fertilizantes', categoryName: 'Fertilizantes' },
        { name: 'Conjunto de Grade Aradora', slug: 'conjunto-grade-aradora', description: 'Grade aradora de arrasto com 24 discos de 20 polegadas.', price: 7890.00, stock: 4, supplierName: 'Agro Tech Ltda', categoryName: 'Implementos' },
        { name: 'Cerca Elétrica Rural', slug: 'cerca-eletrica-rural', description: 'Kit cerca elétrica rural para pastagem com 1000m de alcance.', price: 1299.00, stock: 15, supplierName: 'Agro Tech Ltda', categoryName: 'Diversos' },
        { name: 'Drone Agrícola Pulverizador', slug: 'drone-agricola-pulverizador', description: 'Drone agrícola para pulverização com capacidade de 10L.', price: 45990.00, stock: 2, supplierName: 'AgroTec Sistemas', categoryName: 'Tecnologia' },
        { name: 'Veículo Utilitário Rural', slug: 'veiculo-utilitario-rural', description: 'Veículo utilitário 4x4 para trabalho no campo.', price: 129990.00, stock: 1, supplierName: 'Máquinas Agrícolas LTDA', categoryName: 'Máquinas' },
        { name: 'Semente de Pastagem Braquiária', slug: 'semente-pastagem-braquiaria', description: 'Semente de pastagem Braquiária brizantha para 1 hectare.', price: 79.90, stock: 155, supplierName: 'Sementes Silva', categoryName: 'Sementes' },
        { name: 'Ração para Gado Leiteiro', slug: 'racao-gado-leiteiro', description: 'Ração balanceada para gado leiteiro com 22% de proteína.', price: 89.90, stock: 200, supplierName: 'Pecuária Forte', categoryName: 'Pecuária' },
        { name: 'Suplemento Mineral Bovino', slug: 'suplemento-mineral-bovino', description: 'Suplemento mineral para bovinos com 90 dias de consumo.', price: 145.00, stock: 88, supplierName: 'Pecuária Forte', categoryName: 'Pecuária' },
    ];
    for (const p of PRODUCTS) {
        const supplierId = supplierMap.get(p.supplierName);
        const categoryId = categoryMap.get(p.categoryName);
        if (!supplierId || !categoryId) {
            console.warn(`  Pulando produto "${p.name}" — supplier or category not found`);
            continue;
        }
        await prisma.product.upsert({
            where: { slug: p.slug },
            update: { price: p.price, stock: p.stock },
            create: {
                supplierId,
                categoryId,
                name: p.name,
                slug: p.slug,
                description: p.description,
                shortDescription: p.description.substring(0, 100),
                price: p.price,
                stock: p.stock,
                unit: p.supplierName === 'Máquinas Agrícolas LTDA' ? 'un' : 'sc',
                status: client_1.ProductStatus.ACTIVE,
                images: [],
                tags: [p.categoryName],
                featured: p.stock > 50,
                specifications: { peso: '1kg', garantia: '12 meses' },
            },
        });
    }
    const SUPPORT_CATEGORIES = [
        { slug: 'conta-cadastro', name: 'Conta e Cadastro', description: 'Problemas relacionados à criação e gerenciamento de conta', icon: 'user', types: [
                { name: 'Erro ao cadastrar', description: 'Falha ao tentar criar uma conta' },
                { name: 'Não recebi e-mail de confirmação', description: 'E-mail de verificação não chega' },
                { name: 'Não consigo alterar meus dados', description: 'Erro ao editar informações do perfil' },
                { name: 'Conta bloqueada', description: 'Conta indisponível ou bloqueada' },
                { name: 'Dados incorretos', description: 'Dados cadastrais divergentes' },
                { name: 'Excluir conta', description: 'Solicitação de exclusão de conta' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'login-seguranca', name: 'Login e Segurança', description: 'Problemas de autenticação e segurança da conta', icon: 'lock', types: [
                { name: 'Não consigo fazer login', description: 'Falha ao entrar no sistema' },
                { name: 'Senha incorreta', description: 'Senha não reconhecida' },
                { name: 'Erro ao redefinir senha', description: 'Problema no fluxo de recuperação de senha' },
                { name: 'Suspeita de acesso não autorizado', description: 'Possível invasão ou acesso indevido' },
                { name: 'Verificação em duas etapas', description: 'Problema com autenticação de dois fatores' },
                { name: 'Sessão expirada', description: 'Login encerrado inesperadamente' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'pesquisa', name: 'Pesquisa', description: 'Problemas na busca de produtos, serviços e fornecedores', icon: 'search', types: [
                { name: 'Sem resultados', description: 'Busca não retorna resultados esperados' },
                { name: 'Resultados irrelevantes', description: 'Resultados não correspondem à pesquisa' },
                { name: 'Filtros não funcionam', description: 'Filtros de busca apresentam falhas' },
                { name: 'Busca lenta', description: 'Pesquisa demorando para carregar' },
                { name: 'Ordenação incorreta', description: 'Resultados fora da ordem selecionada' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'carrinho', name: 'Carrinho', description: 'Problemas ao adicionar ou gerenciar itens no carrinho', icon: 'cart', types: [
                { name: 'Produto não adiciona', description: 'Falha ao adicionar produto ao carrinho' },
                { name: 'Produto desapareceu', description: 'Item sumiu do carrinho' },
                { name: 'Carrinho vazio', description: 'Carrinho esvaziado indevidamente' },
                { name: 'Quantidade incorreta', description: 'Quantidade dos itens incorreta' },
                { name: 'Cupom inválido', description: 'Cupom não aplicado corretamente' },
                { name: 'Frete incorreto', description: 'Valor do frete divergente' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'produtos', name: 'Produtos', description: 'Problemas relacionados ao catálogo de produtos', icon: 'package', types: [
                { name: 'Produto não encontrado', description: 'Produto não localizado no site' },
                { name: 'Informações incorretas', description: 'Dados do produto divergentes' },
                { name: 'Imagens não carregam', description: 'Fotos do produto indisponíveis' },
                { name: 'Preço errado', description: 'Preço exibido incorretamente' },
                { name: 'Produto sem estoque', description: 'Estoque não atualizado' },
                { name: 'Descrição incompleta', description: 'Descrição insuficiente do produto' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'frete', name: 'Frete', description: 'Problemas com cálculo e prazos de frete', icon: 'truck', types: [
                { name: 'Cálculo de frete errado', description: 'Valor do frete calculado incorretamente' },
                { name: 'Prazo de entrega incorreto', description: 'Prazo estimado divergente' },
                { name: 'Frete indisponível', description: 'Opção de frete não disponível' },
                { name: 'Código de rastreio inválido', description: 'Rastreio não localizado' },
                { name: 'Região não atendida', description: 'Entrega não disponível na região' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'pagamento', name: 'Pagamento', description: 'Problemas relacionados a pagamentos e cobranças', icon: 'card', types: [
                { name: 'PIX não confirmado', description: 'Pagamento via PIX não confirmado' },
                { name: 'Cartão recusado', description: 'Cartão não aceito no pagamento' },
                { name: 'Cobrança duplicada', description: 'Cobrança realizada mais de uma vez' },
                { name: 'Pagamento pendente', description: 'Pagamento travado em pendente' },
                { name: 'Estorno não recebido', description: 'Estorno não creditado' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'pedido', name: 'Pedido', description: 'Problemas ao realizar ou gerenciar pedidos', icon: 'bag', types: [
                { name: 'Não consigo realizar pedido', description: 'Falha na finalização do pedido' },
                { name: 'Pedido sumiu', description: 'Pedido não encontrado no histórico' },
                { name: 'Erro na finalização', description: 'Erro ao confirmar a compra' },
                { name: 'Pedido cancelado indevidamente', description: 'Cancelamento sem solicitação' },
                { name: 'Cupom não aplicado', description: 'Desconto não aplicado no pedido' },
                { name: 'Desconto incorreto', description: 'Valor de desconto divergente' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'entrega', name: 'Entrega', description: 'Problemas com recebimento e entregas', icon: 'package-check', types: [
                { name: 'Atraso na entrega', description: 'Entrega fora do prazo estimado' },
                { name: 'Endereço errado', description: 'Endereço de entrega incorreto' },
                { name: 'Não recebi meu pedido', description: 'Pedido não entregue' },
                { name: 'Produto danificado', description: 'Produto chegou danificado' },
                { name: 'Pedido devolvido', description: 'Pedido retornou ao remetente' },
                { name: 'Assinatura incorreta', description: 'Recebimento confirmado por terceiro' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'fornecedor', name: 'Fornecedor', description: 'Problemas com perfis e páginas de fornecedores', icon: 'store', types: [
                { name: 'Perfil não carrega', description: 'Página do fornecedor indisponível' },
                { name: 'Produtos não aparecem', description: 'Catálogo do fornecedor vazio' },
                { name: 'Chat indisponível', description: 'Não é possível contatar o fornecedor' },
                { name: 'Informações erradas', description: 'Dados do fornecedor divergentes' },
                { name: 'Avaliação não publicada', description: 'Avaliação não aparece no perfil' },
                { name: 'Cadastro pendente', description: 'Cadastro de fornecedor sem retorno' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'chat', name: 'Chat', description: 'Problemas com o chat em tempo real', icon: 'chat', types: [
                { name: 'Mensagem não envia', description: 'Falha ao enviar mensagem' },
                { name: 'Chat não carrega', description: 'Conversa não abre' },
                { name: 'Notificações de chat', description: 'Sem notificação de novas mensagens' },
                { name: 'Mensagem duplicada', description: 'Mensagem enviada mais de uma vez' },
                { name: 'Não consigo iniciar conversa', description: 'Falha ao abrir novo chat' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'avaliacoes', name: 'Avaliações', description: 'Problemas ao avaliar produtos e fornecedores', icon: 'star', types: [
                { name: 'Não consigo avaliar', description: 'Falha ao enviar avaliação' },
                { name: 'Avaliação não publica', description: 'Avaliação não aparece' },
                { name: 'Editar avaliação', description: 'Não consigo editar minha avaliação' },
                { name: 'Avaliação sumiu', description: 'Avaliação removida do perfil' },
                { name: 'Comentário inapropriado', description: 'Denunciar conteúdo inadequado' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'favoritos', name: 'Favoritos', description: 'Problemas com a lista de favoritos', icon: 'heart', types: [
                { name: 'Não consigo favoritar', description: 'Falha ao salvar favorito' },
                { name: 'Favorito sumiu', description: 'Item removido da lista' },
                { name: 'Lista não carrega', description: 'Lista de favoritos indisponível' },
                { name: 'Sincronização', description: 'Favoritos não sincronizam entre dispositivos' },
                { name: 'Limite de favoritos', description: 'Erro ao atingir limite' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'notificacoes', name: 'Notificações', description: 'Problemas com o recebimento de notificações', icon: 'bell', types: [
                { name: 'Não recebo notificações', description: 'Notificações não chegam' },
                { name: 'Recebo notificações demais', description: 'Volume excessivo de notificações' },
                { name: 'Notificação com erro', description: 'Notificação com conteúdo incorreto' },
                { name: 'Não consigo configurar', description: 'Configurações de notificação não salvam' },
                { name: 'Marcar como lida não funciona', description: 'Leitura não é registrada' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'promocoes', name: 'Promoções', description: 'Problemas com promoções e cupons', icon: 'ticket', types: [
                { name: 'Cupom não funciona', description: 'Cupom de desconto inválido' },
                { name: 'Promoção não aparece', description: 'Oferta não encontrada' },
                { name: 'Desconto não aplicado', description: 'Desconto não aplicado na compra' },
                { name: 'Condições confusas', description: 'Regras da promoção pouco claras' },
                { name: 'Promoção encerrada prematuramente', description: 'Promoção finalizada antes do prazo' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'interface', name: 'Interface', description: 'Problemas visuais e de layout', icon: 'monitor', types: [
                { name: 'Layout quebrado', description: 'Layout exibido incorretamente' },
                { name: 'Elementos sobrepostos', description: 'Elementos se sobrepõem na tela' },
                { name: 'Fonte ilegível', description: 'Texto difícil de ler' },
                { name: 'Cores confusas', description: 'Contraste ou cores inadequados' },
                { name: 'Botões não funcionam', description: 'Botões sem ação ao clicar' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'desempenho', name: 'Desempenho', description: 'Problemas de velocidade e estabilidade', icon: 'zap', types: [
                { name: 'Site lento', description: 'Carregamento demorado' },
                { name: 'Página não carrega', description: 'Página fica em branco' },
                { name: 'Erro 500', description: 'Erro interno do servidor' },
                { name: 'Travamentos', description: 'Congelamento durante o uso' },
                { name: 'Demora no upload', description: 'Upload de arquivos lento' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'navegacao', name: 'Navegação', description: 'Problemas de navegação entre páginas', icon: 'compass', types: [
                { name: 'Link quebrado', description: 'Link não leva ao destino' },
                { name: 'Página não encontrada', description: 'Erro 404 em página esperada' },
                { name: 'Menu não funciona', description: 'Menu de navegação com falhas' },
                { name: 'Voltar não funciona', description: 'Botão voltar do navegador inoperante' },
                { name: 'Página errada', description: 'Redirecionamento para página incorreta' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'sistema', name: 'Sistema', description: 'Falhas gerais do sistema', icon: 'cloud', types: [
                { name: 'Erro de servidor', description: 'Erro inesperado no servidor' },
                { name: 'Aplicativo indisponível', description: 'Serviço fora do ar' },
                { name: 'Erro inesperado', description: 'Falha sem causa identificada' },
                { name: 'Manutenção', description: 'Sistema em manutenção sem aviso' },
                { name: 'Bug geral', description: 'Comportamento incorreto geral' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'uploads', name: 'Uploads', description: 'Problemas com envio de arquivos', icon: 'upload', types: [
                { name: 'Upload falha', description: 'Arquivo não enviado' },
                { name: 'Arquivo não aceito', description: 'Formato ou tamanho não aceito' },
                { name: 'Upload demorado', description: 'Envio de arquivo muito lento' },
                { name: 'Arquivo corrompido', description: 'Arquivo chega corrompido' },
                { name: 'Formato inválido', description: 'Extensão não suportada' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'dashboard', name: 'Dashboard', description: 'Problemas com painéis e métricas', icon: 'dashboard', types: [
                { name: 'Métricas erradas', description: 'Números divergentes do esperado' },
                { name: 'Gráfico não carrega', description: 'Gráficos indisponíveis' },
                { name: 'Dados desatualizados', description: 'Informações não atualizam' },
                { name: 'Dashboard vazio', description: 'Painel sem dados' },
                { name: 'Exportação falha', description: 'Erro ao exportar relatório' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'financeiro', name: 'Financeiro', description: 'Problemas com valores e movimentações financeiras', icon: 'dollar', types: [
                { name: 'Saldo incorreto', description: 'Saldo divergente do esperado' },
                { name: 'Extrato errado', description: 'Movimentações incorretas' },
                { name: 'Comissão não paga', description: 'Pagamento de comissão pendente' },
                { name: 'Nota fiscal', description: 'Emissão de nota fiscal' },
                { name: 'Conciliação', description: 'Divergência entre valores' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'documentacao-fiscal', name: 'Documentação Fiscal', description: 'Problemas com documentos fiscais', icon: 'file', types: [
                { name: 'Nota fiscal não emite', description: 'Falha na emissão da NF' },
                { name: 'Nota fiscal com erro', description: 'NF emitida com dados incorretos' },
                { name: 'CFOP incorreto', description: 'CFOP divergente do produto' },
                { name: 'Impostos errados', description: 'Valores de impostos incorretos' },
                { name: 'XML inválido', description: 'Arquivo XML não aceito' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'acessibilidade', name: 'Acessibilidade', description: 'Problemas de acessibilidade do sistema', icon: 'accessibility', types: [
                { name: 'Contraste inadequado', description: 'Cores com baixo contraste' },
                { name: 'Sem legenda', description: 'Conteúdo sem descrição alternativa' },
                { name: 'Leitor de tela', description: 'Incompatibilidade com leitor de tela' },
                { name: 'Tamanho de fonte', description: 'Fonte sem opção de ajuste' },
                { name: 'Navegação por teclado', description: 'Falha na navegação via teclado' },
                { name: 'Outro', description: 'Outro problema relacionado' },
            ] },
        { slug: 'sugestao', name: 'Sugestão', description: 'Ideias e sugestões de melhoria', icon: 'lightbulb', types: [
                { name: 'Nova funcionalidade', description: 'Sugestão de recurso inédito' },
                { name: 'Melhoria existente', description: 'Aperfeiçoamento de recurso atual' },
                { name: 'Mudança de layout', description: 'Proposta de alteração visual' },
                { name: 'Outro', description: 'Outra sugestão' },
            ] },
        { slug: 'outro', name: 'Outro', description: 'Problemas não enquadrados nas demais categorias', icon: 'help', types: [
                { name: 'Outro', description: 'Problema não listado' },
            ] },
    ];
    for (const [catIndex, c] of SUPPORT_CATEGORIES.entries()) {
        const category = await prisma.supportCategory.upsert({
            where: { slug: c.slug },
            update: {
                name: c.name,
                description: c.description,
                icon: c.icon,
                order: catIndex,
                active: true,
                deletedAt: null,
            },
            create: {
                slug: c.slug,
                name: c.name,
                description: c.description,
                icon: c.icon,
                order: catIndex,
                active: true,
            },
        });
        for (const [typeIndex, t] of c.types.entries()) {
            await prisma.supportType.upsert({
                where: { categoryId_name: { categoryId: category.id, name: t.name } },
                update: { description: t.description, order: typeIndex, active: true },
                create: {
                    categoryId: category.id,
                    name: t.name,
                    description: t.description,
                    order: typeIndex,
                    active: true,
                },
            });
        }
    }
    console.log('Seed completed successfully!');
    console.log('--- Acessos ---');
    console.log(`Super Admin: admin@agrobuscafacil.com.br / @123123123`);
    console.log(`Cliente:     cliente@agrobuscafacil.com.br / @123123123`);
    for (const s of SUPPLIERS) {
        console.log(`Fornecedor:  ${s.email} / @123123123 (${s.companyName})`);
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map