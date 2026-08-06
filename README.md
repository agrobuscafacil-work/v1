# 🌱 AgroBuscaFácil v2

**Marketplace B2B e B2C para o Agronegócio**

Plataforma completa conectando fornecedores de produtos e serviços agrícolas aos clientes de forma simples, rápida, segura e confiável.

---

## 🏗️ Arquitetura

```
AgroBuscaFacil_v2/
├── frontend/              # Next.js 14 (App Router) + TypeScript
├── backend/               # NestJS + Prisma + PostgreSQL
├── database/              # Migrations, seeds, schema SQL
├── docker/                # Dockerfiles, nginx, docker-compose
├── docs/                  # Documentação técnica e fluxogramas
├── scripts/               # Scripts de deploy e backup
└── v1/                    # Versão legada (referência/backup)
```

### Backend (NestJS — módulos em `backend/src/`)

```
backend/src/
├── auth/           # Autenticação (JWT + refresh token, registro, roles)
├── users/          # Gestão de usuários e perfis
├── admin/          # Painel administrativo (gestão geral, configs do sistema)
├── suppliers/      # Cadastro, aprovação e perfis de fornecedores
├── products/       # Produtos (CRUD, status, categorias, filtro por status)
├── services/       # Serviços agrícolas
├── categories/     # Categorias
├── banner/         # Banners da home
├── company/        # Dados institucionais da empresa
├── institutional/  # Páginas institucionais (sobre, contato, FAQ, termos)
├── cart/           # Carrinho de compras
├── checkout/       # Checkout (endereço, frete, pagamento)
├── orders/         # Pedidos (criação, status, histórico, cancelamento)
├── payments/       # Pagamentos e conciliação
├── stripe/         # Integração Stripe (checkout sessions, webhooks)
├── shipping/       # Configuração de fretes
├── dashboard/      # Métricas dos painéis
├── reports/        # Relatórios e exportação
├── reviews/        # Avaliações e respostas (público + moderação admin)
├── favorites/      # Favoritos
├── promotions/     # Promoções de fornecedores (CRUD próprio + públicas)
├── chat/           # Chat em tempo real (REST + WebSocket gateway; settings + rotas admin)
├── notifications/  # Sistema de notificações (sino, unread, ler)
├── support/        # Suporte / Helpdesk (tickets, notas, anexos, rotas admin)
├── search/         # Busca unificada (produtos, fornecedores, serviços)
├── common/         # Infra compartilhada (pipes, guards, interceptors)
└── prisma/         # PrismaService
```

### Frontend (Next.js — rotas em `frontend/src/app/`)

```
frontend/src/app/
├── (landing)/            # Home
├── (auth)/               # login, register, forgot-password
├── (admin)/admin/        # Painel admin (users, suppliers, products,
│                         #   orders, reports, reviews, support, messages, settings)
├── (supplier)/supplier/  # Painel fornecedor (dashboard, products, orders,
│                         #   messages, reports, reviews, promotions, shipping, settings)
├── (products)/products/  # Catálogo + [slug] detalhe
├── (services)/services/  # Catálogo de serviços
├── (suppliers)/suppliers/# Fornecedores + [id] página do fornecedor
├── (search)/search/      # Resultados de busca
├── (cart)/cart/          # Carrinho
├── (checkout)/checkout/  # Checkout
├── (orders)/orders/      # Meus pedidos
├── (dashboard)/dashboard # Minha área
├── (favorites)/favorites # Favoritos
├── (reviews)/reviews/    # Avaliações
├── (chat)/chat/          # Chat em tempo real
├── (notifications)/      # Notificações
├── (payments)/           # Pagamentos
├── (reports)/reports/    # Relatórios
├── (shipping)/shipping/  # Fretes
├── (profile)/profile     # Perfil + suporte (meus relatos)
├── (profile)/suporte     # Suporte (novo ticket, [id] detalhe)
├── (banner)/             # Banners
├── (categories)/categories  # Categorias
├── (company)/            # Páginas da empresa
├── (institutional)/      # Sobre, contato, FAQ, privacidade, termos, promoções
└── payment-success | payment-failure   # Retorno do Stripe
```

### Banco de dados (Prisma — principais modelos)

`User`, `CustomerProfile`, `SupplierProfile`, `Address`, `Category`, `Product`, `Service`, `Promotion`, `Coupon`, `WorkingHours`, `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderCoupon`, `OrderStatusHistory`, `Review`, `ReviewResponse`, `Favorite`, `Conversation`, `Message`, `Payment`, `ChatSettings`, `SystemSetting`, `Notification`, `Banner`, `AuditLog`, `SystemConfig`, `Report`, `SupportCategory`, `SupportType`, `SupportTicket`, `SupportAttachment`, `SupportTicketNote`, `SupportTicketStatusHistory`.

---

## 🚀 Tecnologias

### Frontend
- **Next.js 14** (React) com App Router
- **TypeScript** - Tipagem forte
- **TailwindCSS** - Estilização utilitária
- **TanStack Query** - Gerenciamento de estado do servidor
- **React Hook Form + Zod** - Formulários com validação
- **Zustand** - Gerenciamento de estado global
- **Framer Motion** - Animações
- **Socket.io Client** - Chat e notificações em tempo real
- **next-themes** - Dark Mode
- **Lucide Icons** - Iconografia

### Backend
- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Código tipado
- **Prisma ORM** - ORM moderno para Node.js
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **JWT + Refresh Token** - Autenticação segura
- **Passport** - Estratégias de autenticação
- **Swagger** - Documentação de API
- **Socket.io** - WebSockets para chat
- **Stripe SDK** - Pagamentos online
- **Winston** - Logging estruturado
- **Helmet + Throttler** - Segurança

### Infraestrutura
- **Docker** - Containerização
- **NGINX** - Proxy reverso
- **CI/CD** - GitHub Actions

---

## 📋 Funcionalidades

### 👤 Cliente
- Cadastro e autenticação segura
- Pesquisa avançada de produtos, fornecedores e serviços
- Catálogo de produtos e serviços com detalhes, avaliações e promoções
- Carrinho de compras e **checkout com Stripe** (cartão de crédito/débito)
- Favoritos
- Chat em tempo real com fornecedores
- Avaliação de produtos e fornecedores
- Histórico de pedidos e status
- **Notificações em tempo real** (novas mensagens, pedidos e respostas de suporte)
- **Suporte/Helpdesk** (relatar problema, acompanhar ticket, anexos)
- Páginas institucionais (sobre, contato, FAQ, termos, privacidade)

### 🏪 Fornecedor
- Painel administrativo próprio
- Gerenciamento de produtos e serviços
- Controle de promoções (CRUD, tipo percentual/fixo, vigência)
- Gerenciamento de pedidos (novos pedidos chegam como notificação)
- Chat com clientes (mensagens em tempo real, status online/offline)
- Configuração de fretes
- Relatórios e métricas de vendas (receita, ticket médio, top produtos)
- Avaliações recebidas (filtradas pelo seu fornecedor)
- Configurações da loja e do chat (resposta automática, mensagem de boas-vindas)
- Notificações de novos pedidos e mensagens

### 🔧 Administrador
- Painel completo de administração (dashboard com métricas em tempo real)
- Gestão de usuários (papel e status ativo/inativo)
- Aprovação e bloqueio de fornecedores
- Gestão de produtos (filtro por status, edição, exclusão)
- Gestão de pedidos (status, cancelamento, exportação CSV)
- Moderação de avaliações (aprovar/rejeitar/sinalizar)
- Moderação de suporte/helpdesk (tickets, notas internas, status)
- Chat da central de atendimento (conversas cliente x fornecedor)
- Relatórios do sistema (receita, ticket médio, comissão, top produtos/fornecedores)
- Configurações gerais do sistema (`SystemSetting` + `SystemConfig`)
- Auditoria completa (AuditLog)
- Notificações de mensagens de suporte

### ⚙️ Sistema
- **Notificações** (`notifications/`): criadas automaticamente para mensagens novas, pedidos criados e respostas de suporte; badge de não-lidas e marcação como lida
- **Chat em tempo real** via WebSocket (`/chat`, gateway com JWT) + persistência em banco; conversas com cliente/fornecedor e **rotas admin** (`/chat/admin/conversations` para central de atendimento)
- **Configurações do chat** (`/chat/settings`): status online, resposta automática e mensagens por fornecedor (`ChatSettings`)
- **Configurações do sistema** (`/admin/settings`): chave-valor em `SystemSetting` (JSON)
- **Promoções** (`/promotions`): listagem pública e CRUD por fornecedor (`/promotions/mine`)
- **Pagamentos Stripe**: checkout session, webhook com `rawBody`, páginas de sucesso/falha
- **Auditoria** de alterações em entidades sensíveis
- **Soft delete** em todas as entidades
- **RBAC** (UserRole: ADMIN, SUPER_ADMIN, SUPPLIER, CUSTOMER)

---

## 🛠️ Instalação e Uso (Desenvolvimento)

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (opcional)

### Passo a passo

```powershell
# Terminal 1 - Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

> **Stripe:** para testar pagamentos, preencha `STRIPE_SECRET_KEY` e `STRIPE_WEBHOOK_SECRET` em `backend/.env`.

### Acessos (após seed)

**Senha única para todos:** `@123123123`

| Papel | Nome | Email | Empresa |
|---|---|---|---|
| Super Admin | Administrador | admin@agrobuscafacil.com.br | — |
| Cliente | Maria Cliente | cliente@agrobuscafacil.com.br | — |
| **Fornecedor** | Carlos Almeida | contato@agroquimica.com.br | AgroQuímica Brasil |
| **Fornecedor** | Pedro Silva | vendas@sementessilva.com | Sementes Silva |
| **Fornecedor** | Roberto Lima | admin@agrotech.com | Agro Tech Ltda |
| **Fornecedor** | Fernando Costa | contato@fertabc.com | Fertilizantes ABC |
| **Fornecedor** | Juliana Campos | contato@boavista.com | Fazenda Boa Vista |
| **Fornecedor** | André Oliveira | vendas@irrigafacil.com | IrrigaFácil |
| **Fornecedor** | Marcos Santos | contato@maquinasagri.com | Máquinas Agrícolas LTDA |
| **Fornecedor** | Paulo Rocha | pedidos@defensivosnac.com | Defensivos Nacional |
| **Fornecedor** | Luiz Mendes | comercial@sementesgenetix.com | Sementes Genetix |
| **Fornecedor** | Tiago Barbosa | vendas@agrotecsistemas.com | AgroTec Sistemas |
| **Fornecedor** | Gustavo Pereira | contato@pecuariaforte.com | Pecuária Forte |
| **Fornecedor** | Ricardo Teixeira | logistica@transporterural.com | Transporte Rural Log |
| **Fornecedor** | Fábio Carvalho | admin@armazenagemtotal.com | Armazenagem Total |
| **Fornecedor** | Marina Duarte | contato@organicosdovale.com | Orgânicos do Vale |
| **Fornecedor** | Rafael Nunes | pedidos@biodefensivos.com | BioDefensivos Naturais |
| **Fornecedor** | Diego Martins | vendas@tratoresecia.com | Tratores e Cia |
| **Fornecedor** | Eduardo Araújo | suporte@irrigatech.com | IrrigaTech Solutions |
| **Fornecedor** | Bruno Ferreira | admin@nutriplant.com | NutriPlant Fertilizantes |

> _Rodar `npx prisma db seed` para criar todos os usuários acima._

| Onde | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/docs |

---

## 🚀 Deploy em Produção

### Opção 1: Docker (recomendado)

```bash
# Build e inicie todos os serviços
docker-compose up -d --build

# Execute migrações e seed
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

Sobe automaticamente: **Nginx (80)** → **Frontend** → **Backend** → **PostgreSQL** + **Redis**

### Opção 2: Manual (servidor Linux)

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm run start
```

### Opção 3: Nginx como reverse proxy

Após buildar frontend e backend, configure o Nginx apontando para:
- Frontend rodando em `localhost:3000`
- Backend rodando em `localhost:4000`

O arquivo de configuração Nginx de exemplo está em `docker/nginx/sites/agrobuscafacil.conf`.

### Requisitos do servidor de produção
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (opcional)
- 2GB RAM mínimo
- Ubuntu 22.04+ ou similar

---

## 📚 Documentação da API

Com o servidor rodando, acesse:
- **Swagger**: http://localhost:4000/docs

### Endpoints recentes (admin e fornecedor)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/suppliers/admin` | Lista fornecedores para gestão (admin) |
| `PUT` | `/suppliers/:id/approval` | Aprova/rejeita cadastro de fornecedor |
| `PUT` | `/users/:id` | Admin atualiza papel/status do usuário |
| `PUT` | `/products/:id` / `DELETE /products/:id` | Edição/exclusão por admin |
| `GET` | `/products?status=ALL` | Lista produtos com filtro de status (admin) |
| `GET` | `/reviews/admin` | Avaliações para moderação (admin) |
| `PUT` | `/reviews/:id/moderate` | Modera avaliação (aprovado/rejeitado/sinalizado) |
| `GET` | `/orders/admin` | Lista pedidos (admin) |
| `PUT` | `/orders/:id/status` | Atualiza status do pedido (admin) |
| `GET` | `/promotions/mine` | Promoções do fornecedor autenticado |
| `POST` / `PUT` / `DELETE` | `/promotions` | CRUD de promoções (fornecedor) |
| `GET` / `PUT` | `/chat/settings` | Configurações do chat (fornecedor) |
| `GET` / `PUT` | `/admin/settings` | Configurações do sistema (admin) |
| `GET` | `/support/admin/tickets` | Tickets de suporte (admin) |
| `PATCH` | `/support/admin/tickets/:id/status` | Muda status do ticket (admin) |
| `POST` | `/support/admin/tickets/:id/notes` | Nota interna (admin) |
| `POST` | `/support/admin/tickets/:id/respond` | Responde ticket (admin) |
| `GET` | `/chat/admin/conversations` | Conversas da central de atendimento (admin) |
| `GET` | `/chat/admin/conversations/:id` | Conversa com mensagens (admin) |
| `POST` | `/chat/admin/conversations/:id/messages` | Envia mensagem como admin |
| `POST` | `/chat/admin/conversations/:id/read` | Marca conversa como lida (admin) |

> Convenção: a API responde no formato `{ data: ... }` (via `TransformInterceptor`), prefixo `/api/v1`. Rotas sem `admin` exigem JWT; as admin exigem `ADMIN`/`SUPER_ADMIN`.

## 🧪 Testes

```bash
# Backend
cd backend && npm test
npm run test:e2e
npm run test:cov

# Frontend
cd frontend && npm test
```

## 🔒 Segurança

- JWT com refresh token rotation
- Bcrypt com 12 rounds de salt
- Rate limiting por IP
- Helmet headers de segurança
- CORS configurável
- Validação rigorosa de entrada
- Soft delete em todas as entidades
- Auditoria de alterações
- RBAC (Role-Based Access Control)
- Proteção contra XSS e SQL Injection
- CSP (Content Security Policy)

## 📈 SEO e Performance

- Metadata API para SEO
- Server Components (SSR) e Client Components
- ISR (Incremental Static Regeneration)
- Image Optimization com next/image
- Lazy Loading e Dynamic Imports
- Skeleton Loading
- Core Web Vitals otimizados
- Cache inteligente com Redis
- Gzip/Compression

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'feat: add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">Feito com 💚 pelo agronegócio brasileiro</p>
