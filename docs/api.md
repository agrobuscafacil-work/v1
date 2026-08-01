# Documentação da API - AgroBuscaFácil v2

**Base URL**: `/api/v1`
**Base URL (dev)**: `http://localhost:4000/api/v1`
**Swagger**: `http://localhost:4000/docs`

## Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. O token deve ser enviado no header `Authorization` no formato `Bearer <token>`.

### Fluxo de Autenticação

1. POST `/auth/register` ou `/auth/login` → recebe `accessToken` + `refreshToken`
2. Enviar `accessToken` em todas as requisições autenticadas
3. Quando `accessToken` expirar (15min), usar `/auth/refresh` com `refreshToken`
4. O refresh token expira em 7 dias

## Endpoints

### Auth

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/auth/register` | Registrar novo usuário | Público |
| POST | `/auth/login` | Autenticar usuário | Público |
| POST | `/auth/refresh` | Renovar access token | Público |
| POST | `/auth/logout` | Encerrar sessão | Autenticado |

### Users

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/users` | Listar usuários | Admin |
| GET | `/users/me` | Perfil do usuário logado | Autenticado |
| GET | `/users/:id` | Buscar usuário por ID | Admin |
| PUT | `/users/me` | Atualizar perfil | Autenticado |
| PUT | `/users/me/password` | Alterar senha | Autenticado |
| DELETE | `/users/me` | Excluir conta | Autenticado |

### Suppliers

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/suppliers` | Listar fornecedores | Público |
| GET | `/suppliers/:id` | Detalhes do fornecedor | Público |
| POST | `/suppliers` | Criar perfil de fornecedor | Fornecedor |
| PUT | `/suppliers/:id` | Atualizar perfil | Fornecedor |
| PUT | `/suppliers/:id/approve` | Aprovar fornecedor | Admin |
| PUT | `/suppliers/:id/reject` | Rejeitar fornecedor | Admin |

### Products

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/products` | Listar produtos | Público |
| GET | `/products/:id` | Detalhes do produto | Público |
| GET | `/products/slug/:slug` | Produto por slug | Público |
| POST | `/products` | Criar produto | Fornecedor/Admin |
| PUT | `/products/:id` | Atualizar produto | Fornecedor/Admin |
| DELETE | `/products/:id` | Excluir produto | Fornecedor/Admin |

### Services

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/services` | Listar serviços | Público |
| GET | `/services/:id` | Detalhes do serviço | Público |
| POST | `/services` | Criar serviço | Fornecedor |
| PUT | `/services/:id` | Atualizar serviço | Fornecedor |
| DELETE | `/services/:id` | Excluir serviço | Fornecedor/Admin |

### Categories

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/categories` | Listar categorias | Público |
| GET | `/categories/:id` | Detalhes da categoria | Público |
| GET | `/categories/slug/:slug` | Categoria por slug | Público |
| POST | `/categories` | Criar categoria | Admin |
| PUT | `/categories/:id` | Atualizar categoria | Admin |
| DELETE | `/categories/:id` | Excluir categoria | Admin |

### Orders

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/orders` | Listar pedidos | Autenticado |
| GET | `/orders/:id` | Detalhes do pedido | Autenticado |
| POST | `/orders` | Criar pedido | Cliente |
| PUT | `/orders/:id/status` | Atualizar status | Fornecedor/Admin |
| PUT | `/orders/:id/cancel` | Cancelar pedido | Cliente/Admin |

### Cart

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/cart` | Ver carrinho | Cliente |
| POST | `/cart/items` | Adicionar item | Cliente |
| PUT | `/cart/items/:id` | Atualizar quantidade | Cliente |
| DELETE | `/cart/items/:id` | Remover item | Cliente |
| DELETE | `/cart` | Limpar carrinho | Cliente |

### Checkout

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/checkout` | Processar checkout | Cliente |

### Chat

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/chat/conversations` | Listar conversas | Autenticado |
| POST | `/chat/conversations` | Criar conversa | Autenticado |
| GET | `/chat/conversations/:id/messages` | Listar mensagens | Autenticado |
| POST | `/chat/conversations/:id/messages` | Enviar mensagem | Autenticado |

### Reviews

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/reviews` | Listar avaliações | Público |
| POST | `/reviews` | Criar avaliação | Cliente |
| PUT | `/reviews/:id` | Atualizar avaliação | Cliente/Admin |
| DELETE | `/reviews/:id` | Excluir avaliação | Cliente/Admin |
| PUT | `/reviews/:id/moderate` | Moderar avaliação | Admin |

### Payments

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/payments/process` | Processar pagamento | Cliente |
| GET | `/payments/:id` | Status do pagamento | Autenticado |

### Shipping

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/shipping/calculate` | Calcular frete | Público |
| GET | `/shipping/config/:supplierId` | Config de frete | Público |
| PUT | `/shipping/config/:id` | Atualizar config | Fornecedor |

### Search

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/search` | Busca avançada | Público |

### Favorites

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/favorites` | Listar favoritos | Autenticado |
| POST | `/favorites` | Adicionar aos favoritos | Autenticado |
| DELETE | `/favorites/:id` | Remover dos favoritos | Autenticado |

### Dashboard

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/dashboard/stats` | Estatísticas do fornecedor | Fornecedor |
| GET | `/dashboard/sales` | Relatório de vendas | Fornecedor |
| GET | `/dashboard/products` | Produtos mais vendidos | Fornecedor |

### Admin

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/admin/stats` | Estatísticas do sistema | Admin |
| GET | `/admin/reports` | Relatórios gerais | Admin |
| GET | `/admin/logs` | Logs de auditoria | Admin |
| PUT | `/admin/config` | Configurações do sistema | Admin |

### Notifications

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/notifications` | Listar notificações | Autenticado |
| PUT | `/notifications/:id/read` | Marcar como lida | Autenticado |
| PUT | `/notifications/read-all` | Marcar todas como lidas | Autenticado |

### Company

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/company` | Página da empresa | Público |
| PUT | `/company` | Atualizar página | Admin |

### Institutional

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/institutional/:slug` | Página institucional | Público |
| POST | `/institutional` | Criar página | Admin |
| PUT | `/institutional/:id` | Atualizar página | Admin |

### Banners

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| GET | `/banners` | Listar banners ativos | Público |
| POST | `/banners` | Criar banner | Admin |
| PUT | `/banners/:id` | Atualizar banner | Admin |
| DELETE | `/banners/:id` | Excluir banner | Admin |

## Modelos de Resposta

### Sucesso
```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/products",
  "statusCode": 200
}
```

### Lista Paginada
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/products",
  "statusCode": 200
}
```

### Erro
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Error description",
    "errors": [{ "property": "field", "constraints": { "isEmail": "Invalid email" } }],
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/v1/products"
}
```

## Códigos de Status

| Status | Descrição |
|--------|-----------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
