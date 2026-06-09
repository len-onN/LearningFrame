# Prompt para o proximo chat: continuar refatoracao do App.vue pos-primeira fatia

Voce esta no repositorio `LearningFrame`, na branch `codex/refactor-app-vue-responsibilities`. A primeira fatia da refatoracao pos-MVP de `frontend/src/App.vue` ja foi aplicada.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md`
- `docs/ai_context/planos/plano-refatoracao-app-vue-continuacao-pos-primeira-fatia.md`
- `docs/principios-e-padroes-mvp.md`
- `frontend/src/App.vue`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/features/library/libraryTypes.ts`
- `frontend/src/features/import/importTypes.ts`
- `frontend/src/router/index.ts`

Estado atual importante:

- `App.vue` esta com aproximadamente 1168 linhas.
- Helpers puros ja foram extraidos:
  - `frontend/src/features/study/studyFeedback.ts`
  - `frontend/src/features/import/importPreview.ts`
  - `frontend/src/features/library/deckFormatters.ts`
  - `frontend/src/features/library/cardText.ts`
- Testes unitarios pequenos ja foram criados para esses helpers.
- `frontend/src/features/library/useDeckManagement.ts` ja existe e concentra gerenciamento de deck/cartas:
  - deck gerenciado;
  - formulario de metadata;
  - dirty state;
  - cartas paginadas;
  - busca de cartas;
  - selecao unica e multipla;
  - editor de carta;
  - upload de midia;
  - CRUD de deck/cartas;
  - previews sanitizados.
- `App.vue` ainda atua como composition root e provider dos contextos de rota.
- Validacoes da primeira fatia passaram:
  - `cd frontend && npm test`
  - `cd frontend && npm run build`
  - `git diff --check`

Objetivo desta conversa:

Continuar reduzindo `App.vue` de forma incremental, mantendo comportamento do MVP. Nao busque apenas reduzir linhas: preserve significado cognitivo e computacional.

Prioridade recomendada:

1. Confirmar branch/status e ler os arquivos acima.
2. Rodar baseline se o ambiente permitir:
   - `cd frontend`
   - `npm test`
   - `npm run build`
3. Extrair `frontend/src/app/useStatsSummary.ts`.
4. Extrair `frontend/src/app/useAppNavigation.ts`.
5. Se a fronteira estiver clara, iniciar `frontend/src/app/useRouteLifecycle.ts`.
6. Se ainda houver tempo e seguranca, iniciar `frontend/src/features/study/useStudySession.ts` com uma fatia pequena.

Detalhes esperados para `useStatsSummary`:

- mover `stats`;
- expor `refreshStats`;
- expor `clearStats`, se fizer sentido;
- possivelmente expor `syncProgressRoute`, se o contrato com rota ficar claro;
- nao recarregar stats sem usuario autenticado;
- manter chamadas de outros dominios como callbacks explicitos chamados `refreshStats`.

Detalhes esperados para `useAppNavigation`:

- mover:
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
  - talvez `routeDeckId`, se nao piorar a clareza.
- nao chamar API;
- nao limpar estado pesado;
- nao esconder workflow de dominio.

Detalhes esperados para `useRouteLifecycle`, se iniciado:

- coordenar watchers de rota;
- receber callbacks nomeados:
  - `syncLibraryRoute`;
  - `syncStudyRoute`;
  - `syncProgressRoute`;
  - `clearFeedbackForRouteChange`;
  - `clearImportStateForRouteChange`;
- preservar a regra especial de importacao APKG durante auth;
- nao duplicar watchers;
- nao gerar requests extras.

Se iniciar `useStudySession`, mover apenas uma fatia segura primeiro:

- estado e computeds de estudo;
- helpers internos como `resetStudySession` e `setStudySessionCards`;
- manter workflows de rede no `App.vue` temporariamente se a fronteira ficar confusa.

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
- nao esconder `router`, `stats`, `feedback`, `auth` ou refresh de outro dominio dentro de composables sem contrato claro.

Validacao minima esperada:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Se houver mudanca funcional em estudo:

- testar estudo anonimo de baralho publico;
- testar estudo autenticado;
- testar pratica intercalada;
- revisar uma carta e confirmar feedback/stats.

Se houver mudanca funcional em importacao APKG:

- testar preview;
- navegar entre cartas;
- alternar frente/verso;
- testar fluxo "entrar para salvar";
- salvar importacao autenticada.

Resultado esperado:

- `App.vue` deve ficar menor e mais legivel como composition root;
- novos composables devem deixar dominio e ciclo de vida claros;
- efeitos transversais devem continuar explicitos por callbacks nomeados;
- testes e build devem passar;
- o diff deve continuar incremental e revisavel.
