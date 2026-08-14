# 💳 Sistema de Pagamentos com Cartão de Crédito

Documentação completa do sistema de pagamentos com cartão do AgroBuscaFácil: arquitetura, componentes, fluxos, modelo de dados e segurança.

## 1. Visão geral

O sistema suporta pagamentos com cartão de crédito através de uma **abstração de provider**, com duas implementações intercambiáveis:

| Provider | Ativação | Uso |
|---|---|---|
| **MOCK** | `MP_ENABLED != 'true'` (padrão) | Desenvolvimento e testes |
| **Mercado Pago** | `MP_ENABLED=true` + `MP_ACCESS_TOKEN` | Produção |

**Regra de ouro:** o número completo do cartão (PAN) e o CVV **nunca** passam pelo backend nem são armazenados no banco. A tokenização acontece no **navegador** (MercadoPago.js v2) — o backend só manipula tokens e referências.

## 2. Arquitetura

```
                        ┌────────────────────────────────────────────────┐
                        │                  NAVEGADOR                     │
                        │                                                │
   Cliente digita       │   ┌──────────────┐   PAN/CVV nunca saem        │
   o cartão ──────────► │   │  MP.js v2    │   do navegador              │
                        │   │ (SDK) token  │                             │
                        │   └──────┬───────┘                             │
                        │          │ token (1x, descartável)             │
                        └──────────┼─────────────────────────────────────┘
                                   │ POST /api/v1/payments
                                   │ POST /api/v1/payments/cards
                                   ▼
                        ┌───────────────────────────┐
                        │   PaymentsModule (NestJS) │
                        │                           │
                        │  payments.controller      │  cardToken / savedCard
                        │  payment-cards.controller │ ──────────────┐
                        │  payments-webhooks...     │               ▼
                        │                           │   ┌──────────────────────┐
                        │  PaymentsService          │   │  IPaymentProvider    │
                        │  PaymentCardsService      │   │  (interface)         │
                        │  PaymentCustomersService  │   │  ├─ MockPayment...   │
                        │  PaymentsWebhooksService  │   │  └─ MercadoPago...   │
                        └───────────┬───────────────┘   └──────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  PostgreSQL (Prisma)  │
                        │  PaymentCustomer      │
                        │  PaymentCard          │
                        │  Payment              │
                        │  PaymentEvent         │
                        └───────────────────────┘
                                    ▲
                                    │ webhook assinado (x-signature)
                        ┌───────────┴────────────┐
                        │  Mercado Pago / MOCK   │
                        └────────────────────────┘
```

### Fluxo principal

1. O cliente finaliza o checkout com cartão → o frontend gera um **token de cartão** (MP.js real ou token MOCK). O PAN nunca sai do navegador.
2. `POST /api/v1/orders` cria o pedido (status `PENDING`, `paymentStatus=PENDING`).
3. `POST /api/v1/payments` com `{ orderId, cardId | cardToken, installments }` + header `Idempotency-Key`:
   - O **valor pago vem do banco** (`order.total`), nunca do cliente.
   - Com `cardId` → usa o cartão salvo (provider recebe `savedCard.providerCardId`).
   - Com `cardToken` → usa o token; se `saveCard=true`, salva o cartão antes e passa a usar `savedCard`.
   - O provider retorna `approved | rejected | pending` → status local `APPROVED | DECLINED | PENDING`.
   - `requiresAction=true` quando o status é `PENDING` (aguardando webhook).
4. O Mercado Pago (ou o MOCK em testes) envia o **webhook assinado** → `transitionFromWebhook` atualiza o pagamento e o pedido.

## 3. Componentes — Frontend

| Arquivo | Responsabilidade |
|---|---|
| `frontend/src/lib/card-token.ts` | **Tokenização**: `getCardToken(card)` carrega o SDK MP.js e chama `mp.fields.createCardToken()`. Sem `NEXT_PUBLIC_MP_PUBLIC_KEY`, gera token MOCK `mock-approved:<last4>:<brand>`. Também exporta `detectBrand()` (visa/master/amex/elo por prefixo do BIN). |
| `frontend/src/app/(checkout)/checkout/page.tsx` | Fluxo de checkout: form de cartão, estado `newCard` (memória do navegador), seleção de cartão salvo, parcelas, chamadas a `POST /orders` e `POST /payments`. |
| `frontend/src/app/(profile)/profile/page.tsx` | Seção "Meus Cartões": lista, adiciona, remove e define cartão padrão. |
| `frontend/src/lib/api.ts` | Cliente HTTP com autenticação (envia `Idempotency-Key` nos POSTs de pagamento). |

## 4. Componentes — Backend

Módulo `backend/src/payments/`:

| Arquivo | Responsabilidade |
|---|---|
| `payments.module.ts` | Declara controllers/serviços e exporta `PaymentsService`. |
| `payments.controller.ts` | Rotas REST de pagamento e cartões (autenticadas, `JwtAuthGuard`). |
| `payments.service.ts` | `createCardPayment` (regra de negócio do checkout), `transitionFromWebhook` (máquina de estados), controle de acesso por escopo (`assertOrderAccess`), idempotência. |
| `payment-cards.service.ts` | CRUD de cartões salvos: `list`, `create` (via token), `remove` (soft-delete), `setDefault`. |
| `payment-customers.service.ts` | Cria/obtém o cliente no provider (`providerCustomerId`) por usuário. |
| `payments-webhooks.controller.ts` | `POST /api/v1/webhooks/mercadopago` (público, raw body). |
| `payments-webhooks.service.ts` | Valida assinatura, parseia evento, deduplica por `providerEventId`, confirma via `getPayment()` no provider e aplica a transição. |
| `providers/payment-provider.interface.ts` | Contrato `IPaymentProvider` + token `PAYMENT_PROVIDER` (injeção). |
| `providers/mock.provider.ts` | Implementação MOCK (dev/testes). |
| `providers/mercadopago.provider.ts` | Implementação Mercado Pago (produção, chamadas HTTP via fetch). |
| `payment-provider.module.ts` | Seleciona o provider por `MP_ENABLED` (factory). |
| `dto/create-card.dto.ts`, `dto/create-payment.dto.ts`, `dto/process-payment.dto.ts` | Validação de entrada (ValidationPipe). |
| `*.spec.ts` | 39 testes unitários (cards, payments, webhooks). |

### Contrato do provider (`IPaymentProvider`)

```ts
createCustomer(email, name) → { providerCustomerId }
saveCard(customerId, token) → { providerCardId, brand, last4, expMonth, expYear }
deleteCard(customerId, cardId)
createPayment({ amount, description, externalReference, payerEmail, cardToken | savedCard, installments, idempotencyKey }) → { gatewayId, status, ... }
getPayment(gatewayId) → { gatewayId, status, ... }
verifyWebhook(event) → boolean
parseWebhook(event) → { type, gatewayPaymentId } | null
```

> `savedCard` recebe `{ providerCardId, paymentMethodId }` — o provider nunca vê o número do cartão no pagamento com cartão salvo.

## 5. Modelo de dados (Prisma)

| Tabela | Campos-chave | Papel |
|---|---|---|
| `PaymentCustomer` | `userId` (1:1), `providerCustomerId` | Cliente no gateway por usuário. |
| `PaymentCard` | `userId`, `paymentCustomerId`, `provider`, `providerCardId`, `brand`, `last4`, `expMonth`, `expYear`, `isDefault`, `active` | Cartão salvo. **Só dados não sensíveis** (4 últimos dígitos + referência). UNIQUE `[userId, providerCardId]`. |
| `Payment` | `orderId` (1:1), `amount`, `method`, `status`, `gateway`, `gatewayId`, `cardLastDigits`, `cardBrand`, `installments`, `idempotencyKey`, `paidAt`, `refundedAt` | Cobrança. `idempotencyKey` UNIQUE. |
| `PaymentEvent` | `provider`, `providerEventId` (UNIQUE), `eventType`, `status`, `paymentId` | Auditoria/deduplicação de webhooks. |

### Máquina de estados do `Payment.status`

```
PROCESSING/PENDING → APPROVED / DECLINED / CANCELLED
APPROVED           → REFUNDED / PARTIALLY_REFUNDED / CHARGEBACK
(terminais: DECLINED, REFUNDED, PARTIALLY_REFUNDED, CANCELLED, CHARGEBACK)
```

Transições inválidas vindas de webhook são **ignoradas** (`ALLOWED_TRANSITIONS` em `payments.service.ts:30`).

O `Order` acompanha: `paymentStatus` espelha o `Payment.status`; `status` vira `CONFIRMED` quando aprovado, `REFUNDED`/`PARTIALLY_REFUNDED` em reembolso.

## 6. API — Rotas

### Cartões (`/api/v1/payments/cards`) — autenticado

| Método | Rota | Descrição |
|---|---|---|
| GET | `/cards` | Lista cartões ativos do usuário (default primeiro). |
| POST | `/cards` | Salva cartão via `{ token }` (1º cartão vira default; re-cadastro reativa). |
| DELETE | `/cards/:id` | Soft-delete (`active=false`); remover default promove o mais recente. |
| PATCH | `/cards/:id/default` | Define cartão padrão. |

### Pagamentos (`/api/v1/payments`) — autenticado

| Método | Rota | Descrição |
|---|---|---|
| POST | `/` | Cria pagamento com cartão (`Idempotency-Key` obrigatório). |
| GET | `/order/:orderId` | Status do pagamento do pedido. |
| GET | `/:id` | Pagamento por ID. |
| POST | `/process/:orderId` | Legado (sem provider). |

### Webhook — público

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/v1/webhooks/mercadopago` | Notificação assinada (raw body; `data.id` e `type` na query string). |

## 7. Segurança

- **Sem PAN/CVV**: apenas `last4`, `brand` e validade são persistidos; logs sem dados sensíveis.
- **Idempotência**: header `Idempotency-Key` obrigatório em `POST /payments`; replays retornam o pagamento já criado sem nova cobrança. O header deve estar em `Access-Control-Allow-Headers` (já configurado em `backend/src/main.ts`).
- **Escopo**: acesso a cartões/pagamentos filtrado por `userId`/`role` (cliente, fornecedor do pedido ou admin). Fora do escopo → `403`; recurso inexistente → `404`.
- **Webhook**: assinatura HMAC-SHA256 (MP) com janela de ±5 min, ou `x-signature: mock-signature` (MOCK). Deduplicação por `providerEventId` UNIQUE. Eventos de payment são sempre **confirmados via `GET` no provider** antes da transição.
- **Valor confiável**: o valor cobrado vem de `order.total` no banco — o cliente não envia o valor.

## 8. Provider MOCK (desenvolvimento)

Tokens aceitos em `POST /payments/cards` e `POST /payments`:

| Token | Resultado |
|---|---|
| `mock-approved:last4:brand` | `APPROVED` imediato |
| `mock-rejected:last4:brand` | `DECLINED` |
| `mock:last4:brand` | `PENDING` (aguarda webhook) |

Sem `NEXT_PUBLIC_MP_PUBLIC_KEY`, o frontend gera `mock-approved:<last4>:<brand>` automaticamente.

Webhook MOCK — `POST /api/v1/webhooks/mercadopago?data.id=<gatewayId>&type=payment` com header `x-signature: mock-signature` e body JSON qualquer. O `gatewayId` vem na resposta de `POST /payments` (formato `mock-payment-<timestamp>`):

```bash
curl -X POST "http://localhost:4000/api/v1/webhooks/mercadopago?data.id=mock-payment-1786734292923&type=payment" \
  -H "x-signature: mock-signature" \
  -H "Content-Type: application/json" \
  -d '{"action":"payment.approved","type":"payment","data":{"id":"mock-payment-1786734292923"}}'
```

## 9. Configuração

`backend/.env`:

```env
MP_ENABLED=false            # true = Mercado Pago real
MP_ACCESS_TOKEN=            # access token da conta MP
MP_WEBHOOK_SECRET=          # segredo de assinatura do webhook
MP_TIMEOUT_MS=10000
```

`frontend/.env.local`:

```env
NEXT_PUBLIC_MP_PUBLIC_KEY=  # chave pública MP (TEST-xxxx em sandbox)
```

## 10. Webhook do Mercado Pago (produção)

- URL: `POST /api/v1/webhooks/mercadopago` (sem prefixo `payments`; controller é `Webhooks`).
- Assinatura: header `x-signature` (MP v2: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;v1:<hmac>`), validada com HMAC-SHA256 sobre o raw body e janela de ±5 minutos.
- Eventos não-`payment` (ex.: `plan.created`) são registrados e ignorados; eventos sem `data.id` na query string são ignorados (`note: 'ignored'`); eventos duplicados retornam `note: 'duplicate'`.

## 11. Testes

```bash
cd backend
npx jest src/payments --silent    # 39 testes unitários (cards, payments, webhooks)
```