# Fluxograma do Sistema — AgroBuscaFácil

> Renderiza em qualquer visualizador Mermaid (GitHub, VS Code, mermaid.live). Para gerar PNG/SVG: `npx @mermaid-js/mermaid-cli -i fluxograma.md -o fluxograma.png`.

## 1. Visão geral dos atores

```mermaid
flowchart TB
    V([Visitante]) -->|Registrar| REG[Página de Registro]
    V -->|Entrar| LOGIN[Página de Login]
    REG --> LOGIN

    LOGIN -->|credenciais válidas| AUTH{Auth Guard}
    AUTH -->|role CUSTOMER| C[Área do Cliente]
    AUTH -->|role SUPPLIER| S[Painel do Fornecedor]
    AUTH -->|role ADMIN / SUPER_ADMIN| A[Painel Administrativo]

    subgraph CLIENTE[Cliente]
        C --> DASH[Meus Pedidos / Dashboard]
        C --> PROF[Perfil]
        C --> FAV[Favoritos]
        C --> CHATC[Chat com Admin / Fornecedor]
    end

    subgraph FORNECEDOR[Fornecedor]
        S --> SD[Dashboard de Vendas]
        S --> SP[Gerenciar Produtos]
        S --> SO[Pedidos Recebidos]
        S --> SS[Config da Loja]
        S --> SM[Chat com Clientes / Admin]
        S --> SR[Relatórios]
    end

    subgraph ADMIN[Admin]
        A --> AD[Dashboard Geral]
        A --> AU[Gestão de Usuários]
        A --> AS[Gestão de Fornecedores]
        A --> AM[Chat Central]
        A --> AR[Relatórios do Sistema]
    end
```

## 2. Fluxo de compra do cliente

```mermaid
flowchart TD
    START([Início]) --> HOME[Home / Landing]
    HOME --> BROWSE{Como navegar?}
    BROWSE -->|Busca| SEARCH[Página de Busca]
    BROWSE -->|Categorias| CAT[Página de Categorias]
    BROWSE -->|Fornecedores| SUP[Lista de Fornecedores]
    BROWSE -->|Produtos| PROD[Lista de Produtos]

    SEARCH --> DETAIL[Detalhe do Produto]
    CAT --> DETAIL
    SUP --> SUP_DET[Perfil do Fornecedor]
    PROD --> DETAIL
    SUP_DET --> DETAIL

    DETAIL --> CART{Adicionar ao carrinho?}
    CART -->|Sim| CARTP[Favoritos / Carrinho]
    CARTP --> CHECK{Continuar compra?}
    CHECK -->|Sim| CHECKOUT[Checkout]
    CHECKOUT --> PAY{Pagamento aprovado?}
    PAY -->|Não| FAIL[Pagamento reprovado - tentar novamente]
    FAIL --> CHECKOUT
    PAY -->|Sim| ORDER[Pedido criado]
    ORDER --> SUPPLIER_PROCESS[Fornecedor processa pedido]
    SUPPLIER_PROCESS -->|Enviado| SHIP[Status: Enviado]
    SHIP -->|Entregue| DEL[Status: Entregue]
    DEL --> REVIEW[Cliente avalia produto / fornecedor]
```

## 3. Fluxo do fornecedor

```mermaid
flowchart TD
    LOGIN_F([Login do Fornecedor]) --> APPROVED{Loja aprovada pelo admin?}
    APPROVED -->|Não| PENDENTE[Aguardando aprovação]
    APPROVED -->|Sim| DASHF[Dashboard do Fornecedor]

    DASHF --> OP{Qual operação?}
    OP -->|Produtos| CRUDP[CRUD de Produtos]
    OP -->|Pedidos| ORDERF[Gerenciar Pedidos / Atualizar status]
    OP -->|Promoções| PROMO[Criar Promoções]
    OP -->|Fretes| FREIGHT[Configurar Fretes]
    OP -->|Chat| CHATF[Chat com Clientes / Admin]
    OP -->|Relatórios| REPF[Relatórios de Vendas]
    OP -->|Config| CONFF[Config da Loja + Chat Settings]

    ORDERF -->|Status: Enviado| STATUS[Atualiza status do pedido]
    STATUS --> CLIENT_VIEW[Cliente acompanha no painel]
```

## 4. Fluxo do administrador

```mermaid
flowchart TD
    LOGIN_A([Login do Admin]) --> DASHA[Dashboard Administrativo]

    DASHA --> OP2{Qual módulo?}
    OP2 -->|Usuários| USERS[Gestão de Usuários<br/>ativar / desativar]
    OP2 -->|Fornecedores| SUPS[Gestão de Fornecedores]
    SUPS --> APROV{Aprovar cadastro?}
    APROV -->|Sim| OK[Fornecedor aprovado - ativo no portal]
    APROV -->|Não| REJ[Fornecedor rejeitado]
    OP2 -->|Produtos| PRODA[Moderar Produtos]
    OP2 -->|Pedidos| ORDA[Gestão de Pedidos]
    OP2 -->|Avaliações| REVA[Moderação de Reviews]
    OP2 -->|Chat| CHATA[Chat Central com todos]
    OP2 -->|Relatórios| REPA[Relatórios + Export CSV/PDF]
    OP2 -->|Config| SETA[Configurações do Sistema]
```

## 5. Fluxo do chat (tempo real)

```mermaid
flowchart LR
    subgraph CLIENTE_CHAT[Cliente]
        C_INIT[Inicia conversa / Novo Chat] --> C_SEND[Envia mensagem]
    end

    subgraph FORNECEDOR_CHAT[Fornecedor]
        F_RECV[Recebe em Conversas com Clientes] --> F_REPLY[Responde]
    end

    subgraph ADMIN_CHAT[Admin]
        A_RECV[Recebe no Chat Central] --> A_REPLY[Responde]
    end

    subgraph STORAGE[Chat Store - localStorage]
        CONV[Conversas] --- MSGS[Mensagens]
        SETT[Config: online / auto-reply]
    end

    C_SEND --> STORAGE
    F_REPLY --> STORAGE
    A_REPLY --> STORAGE
    STORAGE -->|polling 3s| C_INIT
    STORAGE --> F_RECV
    STORAGE --> A_RECV
    STORAGE -->|resposta automática| C_SEND
```

## 6. Fluxo de autenticação

```mermaid
flowchart TD
    START_A([Acesso à rota protegida]) --> TOKEN{Token no localStorage?}
    TOKEN -->|Não| REDIR[Redireciona para /auth/login]
    TOKEN -->|Sim| VALID{Valida token}
    VALID -->|Expirado| REFRESH{Tenta refresh token}
    REFRESH -->|OK| AUTHED[Autenticado]
    REFRESH -->|Falha| LOGOUT[Logout - limpa tokens]
    VALID -->|Válido| AUTHED
    AUTHED --> ROLE{Verifica role}
    ROLE -->|CUSTOMER| CLIENTE_AREA
    ROLE -->|SUPPLIER| FORN_AREA
    ROLE -->|ADMIN| ADM_AREA
```

## 7. Fluxo de dados geral (arquitetura)

```mermaid
flowchart LR
    FE[Frontend Next.js<br/>:3000] -->|HTTP/JSON| API[API NestJS<br/>:4000/api/v1]
    FE -->|WebSocket/Socket.io| CHATS[Chat em tempo real]

    API --> AUTH_S[Auth - JWT]
    API --> MOD[Feature Modules<br/>Users, Suppliers, Products,<br/>Orders, Cart, Checkout,<br/>Payments, Reviews, Favorites]
    API --> REDIS[Redis - cache/sessão]

    MOD --> ORM[Prisma ORM]
    ORM --> PG[(PostgreSQL)]

    CHATS --> REDIS
    CHATS --> PG
```
