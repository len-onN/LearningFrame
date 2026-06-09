# Prompt App.vue explosion 4: continuar apos extracao APKG

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`. A refatoracao pos-MVP de
`frontend/src/App.vue` ja passou por tres fatias.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md`
- `docs/ai_context/planos/plano-refatoracao-app-vue-continuacao-pos-primeira-fatia.md`
- `docs/principios-e-padroes-mvp.md`
- `docs/diario-de-bordo.md`, entradas 59, 60 e 61
- `frontend/src/App.vue`
- `frontend/src/app/useStatsSummary.ts`
- `frontend/src/app/useAppNavigation.ts`
- `frontend/src/app/useRouteLifecycle.ts`
- `frontend/src/features/import/useApkgImport.ts`
- `frontend/src/features/import/useApkgImport.test.ts`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/features/study/useStudySession.ts`
- `frontend/src/features/study/studySessionTypes.ts`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/router/index.ts`

Estado atual importante:

- `App.vue` esta com aproximadamente 867 linhas.
- Ja foram extraidos:
  - helpers puros de estudo/importacao/biblioteca;
  - `frontend/src/features/library/useDeckManagement.ts`;
  - `frontend/src/app/useStatsSummary.ts`;
  - `frontend/src/app/useAppNavigation.ts`;
  - `frontend/src/app/useRouteLifecycle.ts`;
  - primeira fatia de `frontend/src/features/study/useStudySession.ts`;
  - `frontend/src/features/import/useApkgImport.ts`.
- O fluxo APKG preserva:
  - preview com midia e object URLs locais;
  - cancelamento logico por request id;
  - limpeza ao sair de `/importar`;
  - preservacao intencional durante `/entrar` e `/cadastro`;
  - retomada pos-auth por `consumeReturnToImportAfterAuth`.
- Validacoes da terceira fatia passaram:
  - `cd frontend && npm test` com 16 arquivos e 73 testes;
  - `cd frontend && npm run build`;
  - `git diff --check`.

Objetivo desta conversa:

Continuar reduzindo `App.vue` de forma incremental, mantendo comportamento do
MVP. O criterio continua sendo clareza de ownership e preservacao de ciclo de
vida, nao apenas contagem de linhas.

Prioridade recomendada:

1. Confirmar branch/status e ler os arquivos acima.
2. Rodar baseline se o ambiente permitir:
   - `cd frontend`
   - `npm test`
   - `npm run build`
3. Completar mais uma fatia segura de
   `frontend/src/features/study/useStudySession.ts`.
4. Se estudo ficar arriscado, extrair
   `frontend/src/features/create/useCreateDeckFlow.ts`.
5. Se auth estiver mais claro depois de APKG, extrair
   `frontend/src/features/auth/useAuthFlow.ts`.
6. Atualizar documentacao/prompt de continuidade se a rodada abrir nova
   fronteira grande.

## Foco 1: completar `useStudySession`

Pode migrar, se a fronteira estiver clara:

- `loadStudyDeck`;
- `loadInterleavedPractice`;
- `reviewCurrent`;
- `ensurePublicDeck`;
- `serverCardToStudyCard`;
- cache `publicStudyDeckCache`;
- `localStates`, desde que a limpeza continue clara.

Dependencias devem ser explicitas:

- `user`;
- `publicDecks`;
- `loadPublicDecks`;
- `refreshStats`;
- `showNotice`;
- `withFeedback`;
- `client: api`;
- helpers locais de estudo (`loadLocalStates`, `saveLocalStates`,
  `deckDetailToLocal`, `localDeckToStudyCards`, `nextReview`).

Cuidados obrigatorios para estudo:

- nao alterar SRS;
- preservar estudo anonimo com `localStorage`;
- preservar estudo autenticado via backend;
- preservar pratica intercalada;
- nao buscar stats para revisao anonima;
- nao esconder navegacao dentro de estudo;
- nao carregar todos os decks/cartas fora da logica atual;
- manter sanitizacao por `safeStudyHtml`.

## Fatias menores alternativas

### `features/create/useCreateDeckFlow.ts`

- mover `deckForm`;
- mover `createDeck`;
- receber callbacks `loadMyDecks`, `setManagedDeck`, `navigateToManagedDeck`,
  `showNotice`, `withFeedback`;
- nao alterar textos nem rota de destino.

### `features/auth/useAuthFlow.ts`

- mover formulario de auth, touched/submitted e validacao;
- mover `submitAuth`, `openAuth`, `toggleAuthMode` se o contrato com APKG
  continuar claro;
- preservar redirect `?redirect=...`;
- preservar limpeza de senha;
- preservar fluxo APKG "entrar para salvar";
- nao transformar `useAuthSession` em dono do fluxo visual.

Guardrails obrigatorios:

- nao alterar rotas;
- nao alterar UX;
- nao alterar textos;
- nao alterar contratos de API;
- nao introduzir Pinia/store global;
- nao carregar todas as cartas de um deck;
- manter paginacao de cartas e decks;
- manter debounce de buscas;
- manter `Set<number>` para selecao multipla;
- manter `Map<number, CardResponse>` para merge sem duplicidade;
- nao quebrar fluxo APKG "entrar para salvar";
- nao mexer no algoritmo SRS;
- nao mover object URLs para estado global;
- nao esconder `router`, `stats`, `feedback`, `auth` ou refresh de outro dominio
  dentro de composables sem contrato claro.

Validacao minima esperada:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` deve continuar caindo sem perder legibilidade;
- novos composables devem deixar ownership e ciclo de vida mais claros;
- efeitos transversais devem continuar explicitos por callbacks nomeados;
- testes e build devem passar;
- o diff deve continuar incremental e revisavel.
