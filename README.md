# 🌱 AgroBuscaFácil v2

**Marketplace B2B e B2C para o Agronegócio**

Plataforma completa conectando fornecedores de produtos e serviços agrícolas aos clientes de forma simples, rápida, segura e confiável.

---

## 🏗️ Arquitetura

```
AgroBuscaFacil_v2/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # NestJS + Prisma
├── database/          # Migrations, seeds, schema
├── docker/            # Dockerfiles e configs
├── docs/              # Documentação técnica
└── scripts/           # Scripts de deploy e backup
```

## 🚀 Tecnologias

### Frontend
- **Next.js 14** (React) com App Router
- **TypeScript** - Tipagem forte
- **TailwindCSS** - Estilização utilitária
- **TanStack Query** - Gerenciamento de estado do servidor
- **React Hook Form + Zod** - Formulários com validação
- **Zustand** - Gerenciamento de estado global
- **Framer Motion** - Animações
- **Socket.io Client** - Chat em tempo real
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
- **Winston** - Logging estruturado
- **Helmet + Throttler** - Segurança

### Infraestrutura
- **Docker** - Containerização
- **NGINX** - Proxy reverso
- **CI/CD** - GitHub Actions

## 📋 Funcionalidades

### 👤 Cliente
- Cadastro e autenticação segura
- Pesquisa avançada de produtos, fornecedores e serviços
- Carrinho de compras e checkout
- Favoritos
- Chat em tempo real com fornecedores
- Avaliação de produtos e fornecedores
- Histórico de pedidos
- Notificações

### 🏪 Fornecedor
- Painel administrativo próprio
- Gerenciamento de produtos e serviços
- Controle de estoque
- Promoções e cupons
- Gerenciamento de pedidos
- Chat com clientes
- Relatórios e métricas
- Configuração de fretes

### 🔧 Administrador
- Painel completo de administração
- Gestão de usuários, fornecedores e clientes
- Moderação de conteúdo
- Relatórios do sistema
- Auditoria completa
- Configurações gerais

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

## 📚 Documentação da API

Com o servidor rodando, acesse:
- **Swagger**: http://localhost:4000/docs

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
