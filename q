[33mcommit ea5c01a364bbb84c4cc037524264dfd3dc757935[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m)[m
Merge: d479cb2 1bd5b84
Author: Renan <agrobuscafacil@gmail.com>
Date:   Sun Aug 23 16:21:32 2026 -0300

    .

[33mcommit 1bd5b84952c5cba1f9d0394813bdfc2f92774806[m[33m ([m[1;31morigin/main[m[33m)[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Thu Aug 20 16:50:48 2026 -0300

    efetuado atualizações de Seguranca
    
    corrigido possivel vulnerabilidades

[33mcommit d479cb2b1d1f14db9d19892dfe6cc5831127128b[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Sat Aug 15 22:18:43 2026 -0300

    feat: avaliações com editar/apagar, aviso de avaliação duplicada, painel do fornecedor com remoção de avaliações, confirmações na tela, correção da mensagem de login e carrinho individualizado por conta

[33mcommit e0319825fcae4364b15ed2624404197f043bd353[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Fri Aug 14 17:20:19 2026 -0300

    feat: pagamentos com cartão (Mercado Pago/MOCK), navegação com voltar/início, docs e melhorias

[33mcommit 95d0dd87bc01657de3c0b1b2d439f93c17d6f771[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Fri Aug 14 11:08:20 2026 -0300

    vercel
    
    teste

[33mcommit 7944028cb99bdda0f3f57918bbea71242ad4f74d[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Fri Aug 14 10:39:42 2026 -0300

    Atualização e segurança
    
    atualizar todas as dependencias deste projeto, atualizar os dados em readme.me, verificar se encontra erros, bugs e falhas, exibir como posso executar em produção
    Refresh token em localStorage
    Exclusão arbitrária de arquivos
    Preço manipulado pelo cliente em orders

[33mcommit 948c3d16f2479ec76084f373877080828798653b[m
Merge: 0eceb33 4883759
Author: Renan <agrobuscafacil@gmail.com>
Date:   Fri Aug 7 22:58:31 2026 -0300

    Merge branch 'main' of github.com:agrobuscafacil-work/v1

[33mcommit 0eceb33110c2677b9c42b8d50a9c085d161e87ee[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Fri Aug 7 22:51:41 2026 -0300

    modificações

[33mcommit 4883759a6dd6064993266bd1b96fb086f3fba6ee[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Fri Aug 7 22:49:22 2026 -0300

    Atualizações
    
    produtos, pagina de admin,retirada de dados mocados, fornecedores e demais erros

[33mcommit d935c83c3c45f306d840b4289e2ef26a7340c365[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Fri Aug 7 14:02:16 2026 -0300

    Migra chat para armazenamento em banco de dados

[33mcommit a9c84c514373dc3effcf52b22f6e95c6dbae2478[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Fri Aug 7 11:05:12 2026 -0300

    Corrige todos os warnings de lint no frontend

[33mcommit 2aa2fadbedc2810f912fb97033b434045d76f02e[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Thu Aug 6 16:23:34 2026 -0300

    Melhorias de performance e segurança
    
    7 críticos de segurança + 6 funcionais: corrigidos e validados (nest build ✅).
    Frontend: checkout real (endereços → pedido → Stripe com orderId), dashboard e pedidos do fornecedor conectados (tsc + next build ✅).
    
    pedir para atualizar toda as dependencias

[33mcommit 7f9d75e03cb31766c96772f4a9cd9dd59f279ef1[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Thu Aug 6 16:06:03 2026 -0300

    Atualiza dependencias para as versoes mais recentes
    
    Backend (major):
    - NestJS 11, Prisma 7, @nestjs/swagger 11, ioredis 6, multer 2, bcrypt 6
    - Prisma 7: novo prisma.config.ts, gerador prisma-client (output em src/generated/prisma),
      driver adapter @prisma/adapter-pg, SSL condicional via DATABASE_SSL
    - Imports do client generado nos services e DTOs; corrige tipagem do @nestjs/jwt 11 (expiresIn)
    - npm audit fix: remove vulnerabilidades de js-yaml transitiva
    
    Frontend:
    - Next 16, React 19, axios 1.19, jest 30, eslint 9 (flat config eslint.config.mjs)
    - Mantidos Tailwind 3.4 e TypeScript 5.9
    - Movido @import de fontes para o topo do globals.css (Turbopack)
    - next.config.js atualizado (turbopack.root, optimizePackageImports em experimental)
    
    Extras ja presentes no working tree: modulo de promocoes, helper de paginacao, etc.

[33mcommit 8cc3c88726b6d2fae764fad9302981531e0429fc[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Wed Aug 5 22:49:28 2026 -0300

    Melhorias na Página de Produtos do Fornecedor: Adicinar produtos(funcionando), Adicionar Imagens nos produtos(funcionando), Editar imagens dos produtos, Excluir produto: exclui do banco de dados, Melhoria na estilização do Modal de Confirmação de excluir produto.

[33mcommit 848e94626d7d4543a794c32cfb2b376bd9e03c00[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Wed Aug 5 11:10:53 2026 -0300

    folder publicitario
    
    folder
    
    Co-Authored-By: jefersonls <7173464+jefersonls@users.noreply.github.com>
    Co-Authored-By: Renan Maziero <renanmaziero48@gmail.com>

[33mcommit c8224f9f735f032e9e1b20303d39167256eb0701[m
Author: jefersonls <jef.abc.2008@gmail.com>
Date:   Tue Aug 4 08:39:18 2026 -0300

    Atualização da forma de pagamento e notificações
    
    implementado stripe - metodo de pagamento, aproveitado a implementação de notificação, notificar nao somente a parte de suporte, mas tambem as outras mensagerias
    
    Co-Authored-By: jefersonls <7173464+jefersonls@users.noreply.github.com>
    Co-Authored-By: Renan Maziero <renanmaziero48@gmail.com>

[33mcommit 4acdee5e8df1e8fcad1128f890eb13ce00ff4e3c[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Sat Aug 1 18:39:03 2026 -0300

    Registro de Usuário: corrigido e add+

[33mcommit e9ce2b7e926fae3dd80fa62f5041808443d148bd[m
Author: Renan <agrobuscafacil@gmail.com>
Date:   Fri Jul 31 23:55:48 2026 -0300

    .

[33mcommit ea346cdedc7b9cf6398fae2f4129d6e1a38691f7[m
Author: Renan Maziero <renanmaziero48@gmail.com>
Date:   Fri Jul 31 23:32:28 2026 -0300

    First Commit
