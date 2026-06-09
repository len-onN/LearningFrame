# Prompt App.vue explosion 3: continuar reducao do composition root

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`. A refatoracao pos-MVP de
`frontend/src/App.vue` ja passou por duas fatias.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md`
- `docs/ai_context/planos/plano-refatoracao-app-vue-continuacao-pos-primeira-fatia.md`
- `docs/principios-e-padroes-mvp.md`
- `docs/diario-de-bordo.md`, entradas 59 e 60
- `frontend/src/App.vue`
- `frontend/src/app/useStatsSummary.ts`
- `frontend/src/app/useAppNavigation.ts`
- `frontend/src/app/useRouteLifecycle.ts`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/features/study/useStudySession.ts`
- `frontend/src/features/study/studySessionTypes.ts`
- `frontend/src/features/import/importPreview.ts`
- `frontend/src/features/import/importTypes.ts`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/router/index.ts`

Estado atual importante:

- `App.vue` esta com aproximadamente 1085 linhas.
- `frontend/src/features/library/useDeckManagement.test.ts` deve ser incluido na
  leva de testes da refatoracao, nao tratado como sobra externa.
- Ja foram extraidos:
  - helpers puros de estudo/importacao/biblioteca;
  - `frontend/src/features/library/useDeckManagement.ts`;
  - `frontend/src/app/useStatsSummary.ts`;
  - `frontend/src/app/useAppNavigation.ts`;
  - `frontend/src/app/useRouteLifecycle.ts`;
  - primeira fatia de `frontend/src/features/study/useStudySession.ts`.
- Route adapters de Biblioteca, Estudo e Progresso nao chamam mais lifecycle de
  dominio; o lifecycle fica centralizado no root por callbacks nomeados.
- `routeContext.ts` reexporta tipos de sessao de estudo para manter contrato com
  `StudyPage.vue`.
- Validacoes da segunda fatia passaram:
  - `cd frontend && npm test` com 15 arquivos e 69 testes;
  - `cd frontend && npm run build`;
  - `git diff --check`.

Objetivo desta conversa:

Continuar reduzindo `App.vue` de forma incremental, mantendo comportamento do
MVP. Ainda da para diminuir bastante o arquivo, mas o criterio continua sendo
clareza de ownership e preservacao de ciclo de vida, nao apenas contagem de
linhas.

Prioridade recomendada:

1. Confirmar branch/status e ler os arquivos acima.
2. Rodar baseline se o ambiente permitir:
   - `cd frontend`
   - `npm test`
   - `npm run build`
3. Extrair `frontend/src/features/import/useApkgImport.ts`.
4. Se APKG ficar verde e revisavel, completar mais uma fatia de
   `frontend/src/features/study/useStudySession.ts`.
5. Se estudo ficar arriscado, extrair `frontend/src/features/create/useCreateDeckFlow.ts`
   ou `frontend/src/features/auth/useAuthFlow.ts` como fatias menores.
6. Atualizar documentacao/prompt de continuidade se a rodada abrir uma nova
   fronteira grande.

## Foco 1: `useApkgImport`

Esta deve ser a proxima grande reducao, porque o bloco de APKG ainda concentra:

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
- `previewCardTitle`;
- `handleApkgChange`;
- `selectPreviewCard`;
- `movePreviewCard`;
- `togglePreviewFace`;
- `persistImport`;
- `resetImportPreviewState`;
- `clearImportWorkflowState`;
- `clearImportStateForRouteChange`;
- `shouldPreserveImportAcrossAuth`;
- `isAuthPath`;
- `showPreviewCard`;
- `readPreviewMediaUrls`;
- `decodeImage`;
- `revokePreviewMediaUrls`.

Contrato sugerido:

```ts
useApkgImport({
  route,
  user,
  loading,
  openAuth,
  loadMyDecks,
  refreshStats,
  highlightDeck,
  navigateToMyDecks,
  showNotice,
  showError,
  withFeedback,
  client: api
})
```

Se passar `router` inteiro parecer a opcao mais simples, prefira primeiro um
callback como `navigateToMyDecks`, porque APKG nao deve virar dono generico de
navegacao.

Cuidados obrigatorios para APKG:

- preservar o fluxo "entrar para salvar";
- preservar preview ao navegar de `/importar` para `/entrar` ou `/cadastro`
  quando `returnToImportAfterAuth` estiver ativo;
- limpar arquivo, preview, media index e object URLs ao sair da importacao fora
  do fluxo preservado;
- revogar object URLs antes de substituir referencias;
- manter cancelamento logico por request id;
- manter sanitizacao por `safePreviewHtml`;
- nao mover object URLs para store global;
- nao alterar textos, UX, rotas ou contratos de API;
- nao gerar requests extras no preview.

Validacao manual recomendada se APKG mudar:

- selecionar APKG e ver preview;
- navegar entre cartas;
- alternar frente/verso;
- testar APKG com midia se houver arquivo disponivel;
- clicar "entrar para salvar" e confirmar preservacao do preview;
- salvar importacao autenticada;
- confirmar baralho importado destacado em Meus baralhos.

## Foco 2: completar `useStudySession`

Se APKG ficar concluido e ainda houver margem, continuar `useStudySession` por
uma fatia segura.

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

Se APKG ou estudo ficarem grandes demais para uma rodada segura, prefira uma
destas:

### `features/create/useCreateDeckFlow.ts`

- mover `deckForm`;
- mover `createDeck`;
- receber callbacks `loadMyDecks`, `setManagedDeck`, `navigateToManagedDeck`,
  `showNotice`, `withFeedback`;
- nao alterar textos nem rota de destino.

### `features/auth/useAuthFlow.ts`

- mover formulario de auth, touched/submitted e validacao;
- mover `submitAuth`, `openAuth`, `toggleAuthMode` se o contrato com APKG estiver
  claro;
- preservar redirect `?redirect=...`;
- preservar limpeza de senha;
- preservar fluxo APKG "entrar para salvar";
- nao transformar `useAuthSession` em dono do fluxo visual.

### `app/useLibrarySearchLifecycle.ts` ou similar

- considerar somente se os watchers de busca ficarem claramente isolaveis;
- manter debounce;
- nao duplicar requests;
- nao carregar todas as cartas de um deck;
- preservar paginacao.

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

- `App.vue` deve cair substancialmente, idealmente abaixo de 950 linhas se APKG
  for extraido com sucesso;
- novos composables devem deixar ownership e ciclo de vida mais claros;
- efeitos transversais devem continuar explicitos por callbacks nomeados;
- testes e build devem passar;
- o diff deve continuar incremental e revisavel.
