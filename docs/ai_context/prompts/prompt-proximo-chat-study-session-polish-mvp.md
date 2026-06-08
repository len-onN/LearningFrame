# Prompt para o Proximo Chat: Polimento Limitado do Modo de Estudo

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch atual encerrada: codex/e2e-risk-flows
- Proxima branch de trabalho prevista: codex/study-session-polish
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e
  se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- Se a branch codex/e2e-risk-flows ainda nao tiver sido integrada na base de
  trabalho, nao comece a proxima implementacao sem alinhar a base.
- Criar a proxima branch curta apenas depois de confirmar a base correta.

Estado do projeto:
- develop contem o merge de frontend-refactor.
- frontend-refactor contem o merge do Momento 8, branch codex/e2e-dedicated-db.
- A branch codex/audit-vitest-decision tratou a pendencia critica de npm audit
  em vitest <4.1.0.
- Vitest foi atualizado para 4.1.8 em frontend/package.json e
  frontend/package-lock.json.
- A branch codex/e2e-risk-flows expandiu a suite E2E de 9 para 14 testes.
- A suite E2E usa Compose dedicado learningframe-e2e, banco learningframe_e2e,
  servico db-e2e, porta MySQL host 3317 e teardown com down -v.
- Nunca usar banco dev nos testes E2E.

Validacoes registradas na branch codex/e2e-risk-flows:
- npm test: passou, 33 testes frontend com Vitest 4.1.8.
- npm run build: passou com vue-tsc e vite build.
- npm run e2e: passou, 14 testes Playwright em Chromium.
- O E2E usou Compose dedicado learningframe-e2e e derrubou o ambiente com
  down -v, removendo o volume learningframe-e2e_mysql-e2e-data.
- git diff --check: sem problemas.

O que a branch codex/e2e-risk-flows adicionou:
- docs/plano-e2e-risk-flows-mvp.md;
- frontend/e2e/specs/routing-risk.spec.ts;
- frontend/e2e/specs/deck-risk-flows.spec.ts;
- refresh direto em rotas principais:
  /biblioteca/publicos, /importar, /biblioteca/meus,
  /biblioteca/meus/:deckId/gerenciar e /estudo/baralho/:deckId;
- back/forward entre Biblioteca publica, Meus baralhos, gerenciamento e Criar;
- edicao persistida de metadata de baralho;
- selecao e exclusao em lote de cartas;
- selecao e exclusao em lote de baralhos.

Objetivo da proxima branch:
- Aplicar apenas polimentos pequenos e de alto retorno no modo de estudo.
- Nao transformar esta etapa em feature grande.
- Nao alterar o scheduler/SRS central, nao criar dashboard e nao mudar o
  contrato do MVP.
- Melhorar a percepcao de sessao guiada sem reabrir arquitetura ampla.

Candidatos de polimento para avaliar:
1. Progresso de sessao:
   - mostrar contexto simples como cards revisados/restantes ou barra discreta;
   - evitar layout grande ou dashboard.
2. Feedback local apos rating:
   - mostrar discretamente o resultado do ultimo rating;
   - evitar notificacao global para cada carta.
3. Resumo simples ao finalizar:
   - quantidade revisada;
   - distribuicao por rating, se o custo for baixo;
   - acao clara para voltar a Biblioteca ou iniciar pratica intercalada.
4. Atalhos simples:
   - revelar resposta;
   - ratings por teclado;
   - implementar somente se nao gerar complexidade ou conflito de foco.
5. Empty states do estudo:
   - quando nao ha cards vencidos;
   - quando o baralho nao tem cartas;
   - manter texto curto e operacional.

Fora de escopo nesta branch:
- dashboard estatistico complexo;
- novo algoritmo SRS;
- configurador avancado de sessao;
- escolha fina de novos vs revisao;
- gamificacao;
- rich text/editor;
- backend novo, salvo bug real indispensavel;
- refatoracao ampla de `App.vue` ou criacao de store global.

Documentos obrigatorios para ler antes de propor implementacao:
- README.md
- docs/diario-de-bordo.md
- docs/consideracoes-pre-finalizacao.md
- docs/arquitetura-frontend-roteamento-ciclo-de-vida.md
- docs/plano-momento-8-testes-e2e.md
- docs/plano-e2e-risk-flows-mvp.md
- docs/prompt-proximo-chat-study-session-polish-mvp.md

Arquivos tecnicos obrigatorios para inspecionar:
- package.json
- frontend/package.json
- frontend/src/pages/StudyPage.vue
- frontend/src/App.vue
- frontend/src/services/api.ts
- frontend/src/types/api.ts
- frontend/e2e/specs/study-session.spec.ts
- frontend/e2e/specs/public-library.spec.ts
- frontend/e2e/specs/routing-risk.spec.ts

Praticas de desenvolvimento:
- Trabalhar em branch curta.
- Usar commits em portugues com Conventional Commits.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, explicar o que sera alterado.
- Manter escopo pequeno e reversivel.
- Preferir testes unitarios ou E2E focados conforme o risco da mudanca.
- Se alterar o fluxo de estudo observavel, atualizar ou adicionar E2E pequeno.
- Nao usar banco dev nos testes E2E.

Validacao esperada se houver alteracao de estudo/frontend:
- npm test
- npm run build
- npm run e2e, se o comportamento coberto por E2E for alterado ou novo teste
  E2E for adicionado.

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar leitura dos documentos obrigatorios;
- resumir o estado atual do modo de estudo;
- propor uma selecao curta de polimentos para implementar primeiro;
- apresentar plano de arquivos/validacao antes de editar.
```
