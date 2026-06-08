# Plano: continuacao da refatoracao do App.vue pos-primeira fatia

**Status:** plano de continuidade apos a primeira extracao pos-MVP.
**Branch:** `codex/refactor-app-vue-responsibilities`.
**Data de referencia:** 2026-06-08.
**Escopo:** continuar reduzindo `frontend/src/App.vue` sem alterar rotas, UX, textos, contratos de API, SRS, importacao APKG ou regras de paginacao.

## 1. Estado atual

A primeira fatia ja foi aplicada e validada:

- helpers puros extraidos:
  - `frontend/src/features/study/studyFeedback.ts`;
  - `frontend/src/features/import/importPreview.ts`;
  - `frontend/src/features/library/deckFormatters.ts`;
  - `frontend/src/features/library/cardText.ts`;
- testes unitarios adicionados para esses helpers;
- `frontend/src/features/library/useDeckManagement.ts` criado;
- parte relevante do gerenciamento de deck/cartas saiu de `App.vue`;
- `App.vue` caiu para aproximadamente 1168 linhas;
- validacoes executadas:
  - `cd frontend && npm test`;
  - `cd frontend && npm run build`;
  - `git diff --check`.

O `App.vue` ainda continua grande porque permanece como composition root e ainda concentra:

- shell e navegacao;
- derivacoes de rota;
- auth flow;
- importacao APKG;
- estudo anonimo/autenticado;
- stats/progresso;
- watchers de rota;
- limpeza de timers, object URLs e caches temporarios;
- providers dos contextos de rota.

## 2. Principio da continuacao

A proxima etapa nao deve mirar apenas numero de linhas. O objetivo e transformar `App.vue` em um integrador legivel:

- composables de dominio assumem estado e ciclo de vida proprio;
- callbacks transversais ficam nomeados e explicitos no root;
- `App.vue` ainda pode coordenar rotas, auth, feedback e refreshes quando isso preservar clareza;
- object URLs, caches e timers devem ficar perto do estado que eles protegem;
- nenhuma abstracao nova deve esconder router, stats, auth ou feedback sem contrato claro.

## 3. Ordem recomendada

### Etapa 1 - Extrair `app/useStatsSummary.ts`

Objetivo:

- mover `stats`;
- mover `refreshStats`;
- mover limpeza de stats no logout, se a fronteira ficar simples;
- manter `syncProgressRoute` no `App.vue` ou em lifecycle apenas se ele ainda precisar do contexto da rota.

Contrato sugerido:

```ts
useStatsSummary({
  user,
  client: api,
  withFeedback
})
```

Retorno esperado:

- `stats`;
- `refreshStats`;
- `syncProgressRoute`, se for natural;
- `clearStats`.

Cuidados:

- nao esconder chamadas de stats feitas por biblioteca/importacao/estudo; elas devem continuar aparecendo como `refreshStats`;
- nao recarregar stats quando usuario anonimo;
- preservar opcoes de feedback atuais na rota de progresso.

Validacao:

- testes unitarios se o composable ficar mockavel;
- `npm test`;
- `npm run build`.

### Etapa 2 - Extrair `app/useAppNavigation.ts`

Objetivo:

- mover derivacoes de navegacao e shell:
  - `tab`;
  - `librarySection`;
  - `libraryView`;
  - `authMode`;
  - `sidebarCollapsed`;
  - `sidebarToggleLabel`;
  - `navTabs`;
  - `visibleTabs`;
  - `currentTitle`;
  - `toggleSidebar`;
  - `navigateTo`;
  - possivelmente `routeDeckId`.

Contrato sugerido:

```ts
useAppNavigation({
  route,
  router,
  user,
  managedDeck
})
```

Cuidados:

- nao carregar dados nesse composable;
- nao limpar estado pesado;
- nao chamar API;
- se `routeDeckId` for usado por estudo e biblioteca, pode ficar no root temporariamente ate `useRouteLifecycle`.

Validacao:

- build TypeScript;
- revisar manualmente titulos das rotas:
  - Biblioteca;
  - Gerenciar baralho;
  - Estudo;
  - Importar;
  - Criar;
  - Progresso;
  - Entrar/Criar conta.

### Etapa 3 - Extrair `app/useRouteLifecycle.ts`

Objetivo:

- concentrar watchers de rota e limpeza de rota;
- deixar `App.vue` apenas passando callbacks nomeados;
- preservar ordem atual dos efeitos.

Contrato sugerido:

```ts
useRouteLifecycle({
  route,
  syncLibraryRoute,
  syncStudyRoute,
  syncProgressRoute,
  clearFeedbackForRouteChange,
  clearImportStateForRouteChange
})
```

Cuidados:

- manter a regra especial da importacao APKG durante auth;
- nao duplicar watchers;
- nao disparar rede extra;
- manter debounce de busca na biblioteca e gerenciamento.

Essa etapa pode ser adiada se a extracao de estudo/importacao ainda deixar o ciclo de rota mudando muito.

### Etapa 4 - Extrair `features/study/useStudySession.ts`

Objetivo:

- mover:
  - `studyQueue`;
  - `sessionTitle`;
  - `answerVisible`;
  - `studyInitialTotal`;
  - `studyReviewedCount`;
  - `studyRatingCounts`;
  - `lastStudyFeedback`;
  - `studyEmptyReason`;
  - `currentCard`;
  - `frontHtml`;
  - `backHtml`;
  - `currentDueLabel`;
  - `studyProgress`;
  - `studySummary`;
  - `resetStudySession`;
  - `setStudySessionCards`;
  - `loadStudyDeck`;
  - `loadInterleavedPractice`;
  - `reviewCurrent`;
  - `serverCardToStudyCard`;
  - cache de estudo publico, se a limpeza ficar clara.

Dependencias explicitas:

- `user`;
- `publicDecks`;
- `loadPublicDecks`;
- `refreshStats`;
- `showNotice`;
- `withFeedback`;
- `client: api`;
- helpers de estudo local:
  - `loadLocalStates`;
  - `saveLocalStates`;
  - `deckDetailToLocal`;
  - `localDeckToStudyCards`;
  - `nextReview`.

Cuidados:

- preservar estudo anonimo com `localStorage`;
- preservar cache limitado de decks publicos;
- nao recarregar stats em revisao anonima;
- nao alterar SRS;
- nao esconder navegacao no composable;
- manter sanitizacao por `safeStudyHtml`;
- nao buscar todos os baralhos/cartas fora da logica atual.

Validacao manual minima:

- abrir Biblioteca publica;
- estudar um deck publico anonimo;
- revisar cartas com pelo menos `GOOD`;
- concluir sessao;
- autenticar e estudar deck proprio;
- iniciar pratica intercalada.

### Etapa 5 - Extrair `features/import/useApkgImport.ts`

Objetivo:

- mover:
  - `selectedFile`;
  - `importVisibility`;
  - `importTitle`;
  - `importPreview`;
  - `importResult`;
  - `returnToImportAfterAuth`;
  - `previewCardIndex`;
  - `previewFace`;
  - `previewPickerOpen`;
  - `previewCardSearch`;
  - `previewMediaIndex`;
  - `previewMediaUrls`;
  - `importSaving`;
  - `currentPreviewCard`;
  - `currentPreviewHtml`;
  - `previewCardOptions`;
  - `handleApkgChange`;
  - `selectPreviewCard`;
  - `movePreviewCard`;
  - `togglePreviewFace`;
  - `persistImport`;
  - `clearImportStateForRouteChange`;
  - limpeza/revogacao de object URLs.

Dependencias explicitas:

- `user`;
- `openAuth`;
- `loadMyDecks`;
- `refreshStats`;
- `highlightDeck`;
- `navigateToMyDecks`;
- `showNotice`;
- `showError`;
- `withFeedback`;
- `client: api`.

Cuidados:

- preservar fluxo "entrar para salvar";
- revogar object URLs antes de trocar referencias;
- manter cancelamento logico por request id;
- limpar arquivo, preview, media index e URLs ao sair de `/importar`;
- nao preservar APKG fora do fluxo auth intencional;
- manter sanitizacao por `safePreviewHtml`;
- nao mudar textos do preview/importacao.

Validacao manual minima:

- selecionar APKG;
- navegar entre cartas do preview;
- alternar frente/verso;
- testar midia quando houver APKG com imagem/audio;
- clicar "entrar para salvar" e voltar preservando preview;
- salvar importacao autenticada;
- confirmar baralho importado destacado em Meus baralhos.

### Etapa 6 - Extrair `features/auth/useAuthFlow.ts`

Objetivo:

- mover formulario de auth:
  - `authForm`;
  - `authTouched`;
  - `authSubmitted`;
  - `authErrors`;
  - `authFieldError`;
  - `touchAuthField`;
  - `submitAuth`;
  - `openAuth`;
  - `toggleAuthMode`;
  - reset de validacao.

Dependencias explicitas:

- `authMode`;
- `route`;
- `persistSession`;
- `refreshAll`;
- callbacks para preservar/retomar APKG;
- `navigateToMyDecks`;
- `goHome` ou callback equivalente;
- `showNotice`;
- `dismissError`;
- `clearFeedback`;
- `withFeedback`.

Cuidados:

- nao quebrar redirect `?redirect=...`;
- preservar limpeza de senha;
- preservar fluxo APKG "entrar para salvar";
- nao transformar `useAuthSession` em dono do fluxo visual.

### Etapa 7 - Revisar providers e `routeContext.ts`

Objetivo:

- verificar se os contexts continuam com contratos claros;
- remover props/eventos que ficaram mortos;
- manter route adapters como consumidores simples;
- evitar que paginas visuais virem donas de estado transversal.

Cuidados:

- nao alterar rotas;
- nao alterar UX;
- nao mudar nomes de eventos em paginas sem necessidade;
- nao introduzir Pinia/store global.

## 4. Validacao esperada ao fim de cada fatia

Sempre rodar:

```txt
cd frontend
npm test
npm run build
```

Quando alterar importacao APKG ou gerenciamento:

- validar manualmente fluxo correspondente;
- observar se object URLs nao ficam presos funcionalmente;
- confirmar que paginação continua funcionando.

Quando alterar estudo:

- validar estudo anonimo;
- validar estudo autenticado;
- validar pratica intercalada;
- confirmar que stats so recarrega quando deve.

## 5. Criterios de aceite da continuacao

Ao final da proxima rodada, idealmente:

- `App.vue` deve ficar abaixo de 900 linhas sem perda de clareza;
- `App.vue` deve ler como composicao de subsistemas;
- efeitos transversais devem aparecer por callbacks nomeados;
- `useStatsSummary` e `useAppNavigation` devem existir ou haver justificativa para adiar;
- estudo ou importacao deve ter ao menos uma primeira extracao de dominio iniciada;
- todos os testes e build devem passar.

## 6. Alertas para o proximo chat

Nao fazer:

- mover tudo de uma vez;
- criar store global;
- passar `router` para todo composable por comodidade;
- carregar todas as cartas de um deck;
- alterar SRS;
- alterar fluxo APKG "entrar para salvar";
- esconder `refreshStats` dentro de operacoes sem nome;
- duplicar watchers de rota;
- deixar object URLs fora do dominio de importacao.

Fazer:

- preferir fatias pequenas e verificaveis;
- manter callbacks transversais explicitos;
- adicionar testes unitarios quando a regra for pura ou mockavel;
- rodar validacao apos cada etapa relevante;
- documentar qualquer decisao que mude este plano.
