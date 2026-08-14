# 🌾 AgroBuscaFácil v2

Marketplace B2B/B2C para o agronegócio. Plataforma onde fornecedores anunciam produtos e serviços, e compradores pesquisam, se comunicam, fecham pedidos e pagam com cartão (Stripe).

## 🧱 Stack

| Camada      | Tecnologia                                             |
|-------------|--------------------------------------------------------|
| Frontend    | Next.js 16 (App Router), React 19, Tailwind CSS 3.4, TypeScript 5.9 |
| Backend     | NestJS 11, Prisma 7 (ORM), Socket.IO (chat)            |
| Banco       | PostgreSQL 16                                          |
| Cache/Sessão| Redis 7                                                |
| Pagamento   | Stripe                                                 |
| Proxy/HTTP  | NGINX (reverse proxy + SSL)                            |
| Deploy      | Frontend no Vercel · Backend no Docker + Docker Compose |

## 📁 Estrutura do Projeto

```
AgroBuscaFacil_v2/
├── backend/                 # API NestJS (porta 4000)
│   ├── prisma/              # Schema, migrações e seed
│   ├── src/                 # Módulos (auth, users, products, orders, chat, ...)
│   ├── test/                # Testes e2e (jest)
│   └── .env.example         # Variáveis de ambiente de referência
├── frontend/                # Next.js (porta 3000)
│   └── src/app/             # App Router (rotas e páginas)
├── docker/                  # Dockerfiles (backend/frontend), NGINX, init.sql
├── docs/                    # Arquitetura, API e fluxogramas
├── scripts/                 # Backup e deploy
├── docker-compose.yml       # Stack de produção (backend + Postgres + Redis + NGINX)
├── docker-compose.override.yml  # Stack de desenvolvimento
├── frontend/vercel.json     # Rewrites de produção (frontend no Vercel -> backend)
└── frontend/.env.example    # Variáveis de ambiente do frontend (Vercel)
```

## 🚀 Rodando em Desenvolvimento

### Pré-requisitos

- Node.js **20.19+** (recomendado: 22 LTS) e npm
- PostgreSQL 16 e Redis 7 (ou Docker Desktop)
- Docker + Docker Compose (opcional, via containers)

### Opção A — Tudo via Docker

```bash
# 1. Suba os serviços de infraestrutura (postgres, redis, backend, frontend, nginx)
docker compose up -d

# 2. Aplique as migrações do banco (primeira vez)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed   # opcional: dados de exemplo

# Acesse:
# - Frontend: http://localhost:3000
# - API:      http://localhost:4000/api/v1
# - Swagger:  http://localhost:4000/docs
```

> O `docker-compose.override.yml` monta o código em modo watch (hot reload), sendo ideal para desenvolvimento.

### Opção B — Local (sem Docker)

```bash
# 1. Configure o banco e Redis localmente e copie os .env
cd backend
cp .env.example .env        # ajuste DATABASE_URL, REDIS_HOST, JWT_SECRET etc.

# 2. Instale dependências
npm install                 # na raiz, backend e frontend

# 3. Prepare o banco
cd backend
npx prisma migrate deploy
npx prisma db seed          # opcional

# 4. Rode tudo (na raiz do projeto)
npm run dev                 # sobe backend (:4000) e frontend (:3000)
```

## 📖 Documentação da API

Com o backend rodando, acesse o Swagger em `http://localhost:4000/docs` para explorar todos os endpoints (Auth, Users, Suppliers, Products, Orders, Chat, Payments, Admin etc.).

Referência complementar em [`docs/api.md`](docs/api.md) e [`docs/architecture.md`](docs/architecture.md).

## 💳 Sistema de Pagamentos com Cartão

Pagamentos com cartão via **abstração de provider** (Mercado Pago em produção, MOCK em desenvolvimento). O cartão completo (PAN/CVV) **nunca** passa pelo backend — a tokenização acontece no navegador (MercadoPago.js v2); o banco guarda apenas os 4 últimos dígitos e a referência no gateway.

| Tema | Detalhe |
|---|---|
| **Fluxo** | Checkout → `POST /orders` → `POST /payments` (token ou `cardId`) → status `APPROVED/DECLINED/PENDING` → webhook assinado atualiza pedido |
| **Cartões salvos** | `GET/POST /api/v1/payments/cards`, `DELETE/PATCH /:id` e `/:id/default` — soft-delete, default automático |
| **Idempotência** | Header `Idempotency-Key` obrigatório em `POST /payments` (UNIQUE no banco) |
| **Webhook** | `POST /api/v1/webhooks/mercadopago` — HMAC-SHA256 (±5 min), deduplicado por `providerEventId`, confirma status via provider antes de aplicar |
| **MOCK (dev)** | Tokens `mock-approved:last4:brand` / `mock-rejected:...` / `mock:...`; webhook com `x-signature: mock-signature` |
| **Config** | `MP_ENABLED`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_TIMEOUT_MS` (backend) · `NEXT_PUBLIC_MP_PUBLIC_KEY` (frontend) |
| **Testes** | `cd backend && npx jest src/payments --silent` (39 testes unitários) |

Documentação completa (arquitetura, componentes, modelo de dados e segurança): [`docs/payments.md`](docs/payments.md).

## ✅ Scripts Úteis (raiz do projeto)

| Comando            | Descrição                                    |
|--------------------|----------------------------------------------|
| `npm run dev`      | Backend e frontend em modo desenvolvimento   |
| `npm run build`    | Build de produção de backend e frontend      |
| `npm run start`    | Inicia builds de produção                    |
| `npm run lint`     | ESLint em backend e frontend                 |
| `npm test`         | Testes de backend e frontend                 |
| `npm run db:migrate` | Cria/aplica migrações Prisma               |
| `npm run db:seed`  | Popula o banco com dados de exemplo          |
| `npm run db:studio`| Abre o Prisma Studio (UI do banco)           |
| `npm run docker:up`/`docker:down` | Sobe/desce a stack Docker   |
| `npm run deps:check`/`deps:update` | Verifica/atualiza dependências do frontend |

Scripts equivalentes também existem dentro de `backend/` e `frontend/` (ex.: `npm run typecheck` no frontend).

## ☁️ Executando em Produção

A arquitetura de produção é dividida em duas partes:

| Camada     | Onde roda                | URL                                    |
|------------|--------------------------|----------------------------------------|
| **Frontend (Next.js)** | Vercel                 | `https://www.agrobuscafacil.com.br`    |
| **Backend (NestJS)** | Servidor (Docker + NGINX) | `https://api.agrobuscafacil.com.br` |
| Postgres / Redis | Servidor (Docker)     | interno à rede do compose              |

O frontend no Vercel chama a própria URL `<domínio>/api/*`; o **`vercel.json`** faz o rewrite encaminhando `/api/*` e `/socket.io/*` para `api.agrobuscafacil.com.br`. Isso mantém os cookies (`httpOnly + SameSite=None; Secure`) no mesmo domínio do navegador, essencial para o fluxo de autenticação.

### 1. Variáveis de ambiente no Vercel

No painel do Vercel (**Settings → General → Root Directory = `frontend`**), adicione em **Environment Variables** (Production e Preview):

```env
NEXT_PUBLIC_API_URL=/api/v1
NEXT_PUBLIC_SOCKET_URL=
NEXT_PUBLIC_APP_NAME=AgroBuscaFácil
NEXT_PUBLIC_APP_URL=https://www.agrobuscafacil.com.br
```

Referência em `frontend/.env.example`. O `vercel.json` aponta os rewrites para `https://api.agrobuscafacil.com.br` — ajuste as rotas se o domínio mudar.

### 2. Variáveis de ambiente no backend

Copie `backend/.env.production.example` para `backend/.env` no servidor e ajuste os valores:

```env
NODE_ENV=production
DATABASE_URL="postgresql://agrobusca:agrobusca123@postgres:5432/agrobuscafacil?schema=public"
CORS_ORIGIN=https://www.agrobuscafacil.com.br
JWT_SECRET=<chave-forte-aleatoria>
JWT_REFRESH_SECRET=<outra-chave-forte-aleatoria>
SWAGGER_ENABLED=true
```

Crie também o `.env` na raiz do projeto (junto ao `docker-compose.yml`), que alimenta os segredos usados pelo compose:

```env
JWT_SECRET=<chave-forte-aleatoria>
JWT_REFRESH_SECRET=<outra-chave-forte-aleatoria>
REDIS_PASSWORD=<senha-do-redis>
```

> **Importante:** gere segredos fortes com `openssl rand -base64 48` e nunca os versione.

### 3. DNS e certificados

1. Crie o registro DNS **`api.agrobuscafacil.com.br`** apontando para o IP do servidor.
2. Configure o SSL no servidor (Let's Encrypt / certbot):
   ```bash
   mkdir -p docker/nginx/ssl
   # Copie fullchain.pem e privkey.pem para docker/nginx/ssl/
   ```

### 4. Suba a stack no servidor

```bash
# Usa apenas o docker-compose.yml (ignora o override de desenvolvimento)
docker compose -f docker-compose.yml up -d --build

# Aplique as migrações do banco
docker compose -f docker-compose.yml exec backend npx prisma migrate deploy

# Recarregue o nginx após colocar os certificados SSL
docker compose -f docker-compose.yml restart nginx
```

Serviços iniciados:

- **backend** — API NestJS, porta `4000` (exposto via `api.agrobuscafacil.com.br`)
- **postgres** — banco de dados, porta `5432`
- **redis** — cache/sessão, porta `6379`
- **nginx** — reverse proxy SSL, portas `80`/`443`
- **frontend** — mantido no compose para dev/local; em produção o frontend ativo é o do Vercel

O nginx (`docker/nginx/sites/agrobuscafacil.conf`) roteia no domínio `api.agrobuscafacil.com.br`:

| Rota              | Destino                  |
|-------------------|--------------------------|
| `/api/`           | Backend (NestJS)         |
| `/socket.io/`     | Backend (chat WebSocket) |
| `/docs`           | Swagger do backend       |
| `/uploads/`       | Imagens enviadas         |

### 5. Deploy do frontend no Vercel

```bash
# Na raiz do repositório
git add frontend/vercel.json frontend/.env.example
git commit -m "chore: configurar deploy Vercel"
git push
```

O Vercel detecta o push, usa **Root Directory = `frontend`** e publica automaticamente. Caso não tenha importado o repositório ainda: **New Project → repositório → Root Directory `frontend`** → adicione as variáveis da etapa 1 → Deploy.

### 6. Atualizações / Deploy incremental

```bash
git pull                      # traga as alterações

# Backend (servidor)
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml exec backend npx prisma migrate deploy

# Frontend: automaticamente no Vercel por push
```

Também existem os scripts auxiliares `scripts/deploy/deploy.sh` (Linux) e `scripts/backup/backup-db.sh` (backup do banco).

## 🧪 Testes e Verificação

```bash
cd backend && npm test -- --runInBand      # testes unitários (suites *.spec.ts)
cd frontend && npm run typecheck && npm run lint
npm run lint                               # lint em ambos
```

## 🛡️ Segurança

- JWT (15 min) + Refresh Token (7 dias) com rotação
- Refresh token em **cookie httpOnly** (SameSite=None; Secure em produção) — nunca exposto ao JS
- Senhas com bcrypt (12 rounds)
- Helmet (headers de segurança) + CORS restrito
- Rate limiting (Throttler)
- Validação estrita de entrada (`ValidationPipe` com whitelist)
- RBAC: `ADMIN`, `SUPER_ADMIN`, `SUPPLIER`, `CUSTOMER`
- Auditoria via `AuditLog` e soft delete (`deletedAt`)
- Prisma Migrations versionadas (pasta `backend/prisma/migrations`)

## 📦 Observações de Dependências

- Mantidas as majors atuais do projeto (Next 16, Nest 11, React 19, Prisma 7, Tailwind 3.4, TypeScript 5.9).
- Atualização segura: `npx npm-check-updates@latest --target minor -u` + `npm install`.
- Vulnerabilidades de dependências: `npm audit` em cada pasta (`backend/`, `frontend/`, raiz).

## 📄 Licença

Projeto privado — todos os direitos reservados.
