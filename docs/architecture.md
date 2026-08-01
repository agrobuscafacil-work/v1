# Arquitetura do AgroBuscaFácil v2

## Visão Geral

O AgroBuscaFácil v2 é uma plataforma moderna marketplace B2B/B2C para o agronegócio, construída com arquitetura de microsserviços monolíticos (modular monolith), utilizando Next.js no frontend e NestJS no backend.

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Cliente (Browser)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                         CDN / DNS                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    NGINX (Reverse Proxy)                      │
│                    - SSL Termination                          │
│                    - Load Balancing                           │
│                    - Static Assets Cache                      │
└────────┬──────────────────────────────────┬──────────────────┘
         │                                  │
         ▼                                  ▼
┌──────────────────┐            ┌──────────────────┐
│   Next.js App     │            │   NestJS API     │
│   (Frontend)      │◄──────────►│   (Backend)      │
│   :3000           │    REST    │   :4000           │
│                   │   + WebSocket                │
│   - SSR/SSG/ISR   │            │   - REST API     │
│   - Server Actions│            │   - WebSocket    │
│   - API Routes    │            │   - Swagger Docs │
└──────────────────┘            └────────┬──────────┘
         │                               │
         │                    ┌──────────┴──────────┐
         │                    │       Prisma        │
         │                    │       (ORM)         │
         │                    └──────────┬──────────┘
         │                               │
         │                    ┌──────────▼──────────┐
         │                    │     PostgreSQL      │
         │                    │     (Database)      │
         │                    └─────────────────────┘
         │                               │
         │                    ┌──────────▼──────────┐
         │                    │       Redis         │
         │                    │   (Cache/Session)   │
         │                    └─────────────────────┘
```

## Estrutura de Diretórios

### Frontend (Next.js App Router)

```
frontend/src/
├── app/                    # App Router (rotas e páginas)
│   ├── (landing)/          # Página inicial
│   ├── (auth)/             # Login e registro
│   ├── (products)/         # Produtos
│   ├── (suppliers)/        # Fornecedores
│   ├── (cart)/             # Carrinho
│   ├── (search)/           # Busca
│   ├── (profile)/          # Perfil do usuário
│   └── (dashboard)/        # Dashboard
├── components/             # Componentes reutilizáveis
│   ├── layout/             # Header, Footer
│   ├── ui/                 # Componentes base (Button, Input, Card)
│   └── {feature}/          # Componentes por funcionalidade
├── hooks/                  # Custom hooks
├── lib/                    # Utilitários (api, providers)
├── styles/                 # Estilos globais
└── types/                  # Tipos TypeScript
```

### Backend (NestJS)

```
backend/src/
├── {feature}/              # Módulos por funcionalidade
│   ├── dto/                # Data Transfer Objects
│   ├── entities/           # Entidades
│   ├── interfaces/         # Interfaces
│   ├── {feature}.module.ts
│   ├── {feature}.service.ts
│   └── {feature}.controller.ts
├── common/                 # Código compartilhado
│   ├── decorators/         # Decorators customizados
│   ├── filters/            # Exception filters
│   ├── guards/             # Guards de autenticação
│   ├── interceptors/       # Interceptors
│   └── redis/              # Módulo Redis
├── prisma/                 # Prisma service
├── app.module.ts           # Módulo principal
└── main.ts                 # Bootstrap
```

### Database

```
database/
├── migrations/             # Migrations do Prisma
├── seeds/                  # Scripts de seed
└── schema/                 # Diagramas e documentação do schema
```

## Padrões de Design

### Clean Architecture / SOLID

O backend segue princípios de Clean Architecture:
- **Entities**: Regras de negócio da empresa
- **Use Cases**: Regras de negócio da aplicação
- **Interface Adapters**: Controllers, Presenters, Gateways
- **Frameworks & Drivers**: NestJS, Prisma, Redis

### Repository Pattern

O Prisma ORM atua como camada de repositório, abstraindo o acesso a dados.

### Service Layer

Toda lógica de negócio fica nos Services, mantendo os Controllers enxutos.

### Dependency Injection

NestJS gerencia a injeção de dependências naturalmente.

## Fluxo de Dados

### Autenticação

```
Client → Login → Backend → Validate Credentials → Generate JWT + Refresh Token
  ↓                                                                       ↓
  └────── Store Token ← Response ← Store Refresh Token in DB ←───────────┘
```

### Compra

```
Add to Cart → Checkout → Create Order → Process Payment → Update Stock
     ↓                                                        ↓
Send Confirmation ← Update Order Status ← Payment Confirmation
```

## Segurança

- **Autenticação**: JWT (15min) + Refresh Token (7d) com rotação
- **Senhas**: Bcrypt com 12 rounds de salt
- **Headers**: Helmet (CSP, XSS, Frame-Options)
- **Rate Limit**: ThrottlerModule (100 req/min por IP)
- **Validação**: ValidationPipe com whitelist
- **RBAC**: RolesGuard para controle de acesso
- **Auditoria**: AuditLog para operações críticas
- **Soft Delete**: Todas as entidades têm deletedAt

## Performance

- **Cache**: Redis para queries frequentes e sessões
- **CDN**: Next.js Image Optimization + Cache de assets
- **ISR**: Páginas estáticas com revalidação incremental
- **Lazy Loading**: Dynamic imports no Next.js
- **Compression**: Gzip habilitado
- **Indexação**: Índices compostos no PostgreSQL

## Escalabilidade

- Horizontal scaling via Docker Compose / Kubernetes
- Stateless API (sessões no Redis)
- Cache distribuído
- Banco de dados com connection pooling
- Static assets servidos via CDN
