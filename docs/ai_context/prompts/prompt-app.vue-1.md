# Prompt App.vue 1: timers, debounce e cleanup

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `docs/ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md`
- `docs/principios-e-padroes-mvp.md`
- `frontend/src/App.vue`
- `frontend/src/features/library/useDeckLibrary.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/app/useRouteLifecycle.ts`

Objetivo:

Remover timers manuais de `App.vue` e melhorar ownership de timers/rAF em
composables, sem alterar comportamento de busca, paginacao, highlight, textos,
rotas ou contratos de API.

Escopo recomendado:

1. Criar `frontend/src/composables/useDebouncedWatch.ts`.
2. Implementar debounce com cleanup do proprio `watch`:
   - usar o terceiro parametro `onCleanup`;
   - limpar timeout na proxima mudanca e ao parar watcher;
   - aceitar `delayMs` e callback async/sync;
   - manter tipo simples, sem dependencia externa.
3. Mover o debounce de `librarySearch` de `App.vue` para um composable pequeno,
   provavelmente `frontend/src/app/useLibrarySearchLifecycle.ts`.
4. Mover o debounce de `managedCardsSearch` para `useDeckManagement` ou para um
   composable dedicado, desde que o timer nao fique no root.
5. Melhorar `useDeckLibrary`:
   - armazenar id de `requestAnimationFrame`;
   - cancelar timeout e rAF em cleanup;
   - usar `onScopeDispose`;
   - evitar setar highlight depois do scope ser descartado.

Cuidados obrigatorios:

- nao duplicar requests de busca;
- preservar `showLoading: false` nos debounces;
- preservar `clearOnStart: false` nos syncs de rota;
- nao alterar debounce de 300ms;
- nao alterar duracao visual de highlight;
- nao carregar todas as cartas/baralhos;
- nao adicionar VueUse/lodash sem decisao explicita;
- manter `git diff` pequeno e revisavel.

Testes esperados:

- adicionar/ajustar testes com fake timers para debounce e highlight quando
  aplicavel;
- manter testes existentes verdes.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- nenhum `setTimeout`/`clearTimeout` manual deve permanecer em `App.vue`;
- timers restantes devem estar encapsulados com cleanup local;
- `App.vue` deve perder os timers e parte do cleanup manual;
- buscas e highlight devem continuar funcionando.
