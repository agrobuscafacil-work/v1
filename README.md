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
| Deploy      | Docker + Docker Compose                                |

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
├── docker-compose.yml       # Stack de produção
└── docker-compose.override.yml  # Stack de desenvolvimento
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

### 1. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (junto ao `docker-compose.yml`) com pelo menos:

```env
JWT_SECRET=<chave-forte-aleatoria>
JWT_REFRESH_SECRET=<outra-chave-forte-aleatoria>
REDIS_PASSWORD=<senha-do-redis>
```

Para o backend, preencha também as variáveis de `backend/.env` (copie de `.env.example`):

```env
DATABASE_URL=postgresql://agrobusca:agrobusca123@postgres:5432/agrobuscafacil?schema=public
CORS_ORIGIN=https://agrobuscafacil.com.br
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SMTP_HOST=...            # para e-mails transacionais
SMTP_USER=...
SMTP_PASS=...
```

> **Importante:** em produção use segredos fortes (ex.: `openssl rand -base64 48`) e nunca os versione.

### 2. Suba a stack de produção

```bash
# Usa apenas o docker-compose.yml (ignora o override de desenvolvimento)
docker compose -f docker-compose.yml up -d --build

# Aplique as migrações do banco
docker compose -f docker-compose.yml exec backend npx prisma migrate deploy
```

Serviços iniciados:

- **frontend** — Next.js standalone, porta `3000`
- **backend** — API NestJS, porta `4000`
- **postgres** — banco de dados, porta `5432`
- **redis** — cache/sessão, porta `6379`
- **nginx** — reverse proxy, portas `80`/`443`

### 3. Configure o NGINX e o SSL

Coloque os certificados TLS no caminho esperado pelo nginx e recarregue o serviço:

```bash
mkdir -p docker/nginx/ssl
# Copie fullchain.pem e privkey.pem (ex.: Let's Encrypt / certbot) para docker/nginx/ssl/
```

A configuração do proxy (`docker/nginx/sites/agrobuscafacil.conf`) já roteia:

| Rota              | Destino                        |
|-------------------|--------------------------------|
| `/`               | Frontend (Next.js)             |
| `/api/`           | Backend (NestJS)               |
| `/socket.io/`     | Backend (chat WebSocket)       |
| `/docs`           | Swagger do backend             |
| `/` assets estáticos | Cacheado 1 ano (immutable)  |

Ajuste o `server_name` e os caminhos SSL conforme seu domínio.

### 4. Atualizações / Deploy incremental

```bash
git pull                      # traga as alterações
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml exec backend npx prisma migrate deploy
```

Também existe um script auxiliar: `scripts/deploy/deploy.sh` (para Linux) e `scripts/backup/backup-db.sh` (backup do banco).

## 🧪 Testes e Verificação

```bash
cd backend && npm test -- --runInBand      # testes unitários (suites *.spec.ts)
cd frontend && npm run typecheck && npm run lint
npm run lint                               # lint em ambos
```

## 🛡️ Segurança

- JWT (15 min) + Refresh Token (7 dias) com rotação
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
