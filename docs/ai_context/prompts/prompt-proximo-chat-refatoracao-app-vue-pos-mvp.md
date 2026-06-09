# Prompt para o proximo chat: iniciar refatoracao do App.vue pos-MVP

Voce esta no repositorio `LearningFrame`, na branch `codex/refactor-app-vue-responsibilities`, criada a partir de `develop` atualizada em 2026-06-08. O objetivo desta conversa e iniciar a refatoracao de `frontend/src/App.vue`, que hoje tem cerca de 1548 linhas e concentra responsabilidades demais.

Antes de escrever codigo, leia estes arquivos:

- `docs/ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md`
- `docs/principios-e-padroes-mvp.md`
- `frontend/src/App.vue`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/libraryTypes.ts`
- `frontend/src/features/import/importTypes.ts`
- `frontend/src/router/index.ts`

Contexto arquitetural atual:

- O MVP esta funcional.
- Vue Router ja esta configurado.
- As rotas visuais vivem em `frontend/src/routes`.
- As paginas controladas por props/eventos vivem em `frontend/src/pages`.
- `AppShell` ja foi extraido.
- `useTheme`, `useFeedback` e `useAuthSession` ja existem em `frontend/src/composables`.
- `useDeckLibrary` ja existe em `frontend/src/features/library/useDeckLibrary.ts`.
- `App.vue` ainda atua como composition root, provider de contextos de rota e implementacao de varios dominios.

Problema principal:

`App.vue` mistura responsabilidades com ciclos de vida diferentes:

- shell e navegacao;
- autenticacao;
- biblioteca;
- gerenciamento de baralho/cartas;
- criacao de baralho;
- importacao APKG;
- estudo;
- progresso/stats;
- limpeza de timers, object URLs e caches temporarios.

O objetivo nao e simplesmente reduzir linhas. A refatoracao precisa preservar ou melhorar o significado cognitivo e computacional do codigo:

- estado deve morar perto do ciclo de vida que cria, invalida e limpa esse estado;
- dominios devem ficar reconheciveis pelo produto: Biblioteca, Gerenciamento, Importacao, Estudo, Auth, Progresso;
- efeitos transversais devem continuar explicitos por callbacks nomeados;
- nao esconda `router`, `stats`, `feedback`, `auth` ou refresh de outro dominio dentro de composables sem contrato claro;
- nao introduza Pinia/store global nesta frente;
- nao altere rotas, UX, textos, contratos de API ou regras de SRS/importacao como efeito colateral.

Prioridade de implementacao para este chat:

1. Confirmar estado da branch e ler os arquivos acima.
2. Rodar baseline frontend se o ambiente permitir:
   - `cd frontend`
   - `npm test`
   - `npm run build`
3. Comecar por helpers puros, com baixo risco:
   - `frontend/src/features/study/studyFeedback.ts`
   - `frontend/src/features/import/importPreview.ts`
   - `frontend/src/features/library/deckFormatters.ts`
   - `frontend/src/features/library/cardText.ts`
4. Adicionar testes unitarios pequenos para helpers quando fizer sentido.
5. Depois iniciar a extracao de `useDeckManagement`, mantendo `App.vue` como orquestrador de dependencias transversais.

Helpers candidatos a extracao:

- Estudo:
  - `emptyStudyRatingCounts`
  - `studyFeedbackFromReviewResult`
  - `studyFeedbackFromResult`
  - `ratingLabel`
  - `intervalLabel`

- Importacao:
  - `previewCardTitle`
  - `previewCardOptionLabel`
  - `previewCardSearchText`
  - `htmlSummary`

- Biblioteca/Gerenciamento:
  - `cardCountLabel`
  - `deckDueLabel`
  - `splitTags`
  - `mergeCardsPages`
  - possivelmente `cardTextSummary` e `fallbackCardLabel`, se a dependencia de `managedCards` ficar bem modelada.

Cuidados ao extrair helpers:

- helpers puros nao devem importar componentes Vue;
- helpers puros nao devem importar `router`;
- helpers puros nao devem chamar API;
- preserve exatamente os retornos atuais, inclusive textos;
- preserve sanitizacao existente por `safeStudyHtml` e `safePreviewHtml`;
- se uma funcao depende de estado reativo vivo, talvez ainda pertença ao composable e nao ao helper puro.

Depois dos helpers, iniciar `frontend/src/features/library/useDeckManagement.ts`.

Responsabilidades esperadas de `useDeckManagement`:

- `managedDeck`;
- `managedDeckForm`;
- `managedDeckDirty`;
- `managedCards`;
- `managedCardsPage`;
- `managedCardsSearch`;
- `selectedManagedCardId`;
- `selectedManagedCardIds`;
- `managedCardsView`;
- estado do editor de cartas;
- dirty state do editor;
- previews sanitizados;
- carga paginada de cartas;
- selecao unica e multipla;
- abertura/fechamento do editor;
- helpers de tags e merge de paginas.

Dependencias transversais devem ser explicitas, por exemplo:

- `showNotice`;
- `showError`;
- `withFeedback`;
- `loadMyDecks`;
- `refreshStats`;
- `navigateToMyDecks`;
- `api` ou cliente injetavel.

Nao mova tudo de uma vez se a fronteira ficar confusa. E aceitavel:

- primeiro mover estado, computeds e helpers;
- manter workflows CRUD no `App.vue` temporariamente;
- depois mover operacoes com dependencias injetadas.

Guardrails obrigatorios:

- nao alterar rotas;
- nao alterar UX;
- nao carregar todas as cartas de um deck;
- manter paginacao de cartas e decks;
- manter debounce de buscas;
- manter `Set<number>` para selecao multipla;
- manter `Map<number, CardResponse>` para merge sem duplicidade;
- nao quebrar fluxo de APKG "entrar para salvar";
- nao mexer no algoritmo SRS;
- nao mover object URLs para estado global;
- nao introduzir store global.

Validacao minima esperada ao fim da primeira fatia:

- `cd frontend && npm test`
- `cd frontend && npm run build`
- se houver mudanca funcional em gerenciamento, validar manualmente:
  - abrir Biblioteca publica;
  - abrir Meus baralhos;
  - abrir gerenciamento de baralho;
  - buscar cartas;
  - selecionar/desmarcar cartas;
  - criar carta;
  - editar carta;
  - excluir carta;
  - salvar metadata do deck.

Resumo do resultado esperado:

- `App.vue` deve perder implementacao de helpers puros e, se possivel, parte do gerenciamento de deck/cartas;
- nenhum comportamento do MVP deve mudar;
- os novos arquivos devem deixar claro o significado de cada dominio;
- o diff deve ser incremental e revisavel.
