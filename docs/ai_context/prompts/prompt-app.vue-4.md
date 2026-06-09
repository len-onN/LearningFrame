# Prompt App.vue 4: biblioteca, route sync e acoes transversais

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `frontend/src/App.vue`
- `frontend/src/app/useRouteLifecycle.ts`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/features/library/useDeckLibrary.test.ts`
- `frontend/src/features/library/useDeckManagement.test.ts`
- `frontend/src/routes/routeContext.ts`

Objetivo:

Reduzir o bloco de biblioteca restante em `App.vue` sem duplicar requests,
sem quebrar paginacao e sem esconder efeitos transversais.

Escopo recomendado:

1. Avaliar criar `frontend/src/app/useLibraryRouteSync.ts`.
2. Mover o sync de rotas de biblioteca:
   - fechamento de deck gerenciado ao sair da rota;
   - saida do modo selecao quando nao estiver em Meus baralhos;
   - carga condicional de publicos/meus;
   - carga de deck gerenciado por `deckId`.
3. Avaliar criar `frontend/src/features/library/useLibraryActions.ts` para:
   - `refreshAll`;
   - `loadMorePublicDecks`;
   - `loadMoreMyDecks`;
   - `savePublicDeck`;
   - `deleteSelectedMyDecks`;
   - `openManagedDeck`.

Padrao de contrato:

- se o composable estiver em `app/*`, pode receber callbacks de navegacao e
  route helpers;
- se estiver em `features/library/*`, nao receber `router` inteiro;
- usar callbacks como `openAuth`, `navigateToMyDecks`,
  `navigateToManagedDeck`, `routeDeckId`, `refreshStats`.

Cuidados obrigatorios:

- nao duplicar requests entre debounce e route sync;
- preservar `showLoading: false` em load more/debounce;
- preservar `clearOnStart: false` em sync de rota;
- manter `Set<number>` para selecao multipla;
- manter merge por `Map<number, ...>` nos helpers existentes;
- nao carregar todas as cartas de um deck;
- preservar confirmacao de exclusao em lote;
- preservar highlight apos salvar/copy.

Testes esperados:

- adicionar testes se `useLibraryActions` ficar mockavel;
- manter testes de `useDeckLibrary` e `useDeckManagement` verdes.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` deve perder sync/acoes longas de biblioteca;
- route lifecycle deve continuar centralizado por callbacks nomeados;
- comportamento de busca/paginacao deve permanecer igual.
