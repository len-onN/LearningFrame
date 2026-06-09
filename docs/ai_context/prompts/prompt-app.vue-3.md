# Prompt App.vue 3: completar useStudySession com cuidado

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `docs/principios-e-padroes-mvp.md`
- `frontend/src/App.vue`
- `frontend/src/features/study/useStudySession.ts`
- `frontend/src/features/study/useStudySession.test.ts`
- `frontend/src/features/study/studySessionTypes.ts`
- `frontend/src/features/study/studyFeedback.ts`
- `frontend/src/utils/localStudy.ts`
- `frontend/src/utils/srs.ts`
- `frontend/src/types/api.ts`

Objetivo:

Promover `useStudySession` de composable de estado visual para dono do fluxo de
estudo, preservando SRS, estudo anonimo, estudo autenticado e pratica
intercalada.

Escopo recomendado:

Mover para `useStudySession`:

- `publicStudyDeckCache`;
- `localStates`;
- `loadStudyDeck`;
- `loadInterleavedPractice`;
- `reviewCurrent`;
- `ensurePublicDeck`;
- `serverCardToStudyCard`.

Contrato sugerido:

```ts
useStudySession({
  user,
  publicDecks,
  loadPublicDecks,
  refreshStats,
  showNotice,
  withFeedback,
  client: api,
  publicDeckCacheLimit: PUBLIC_STUDY_DECK_CACHE_LIMIT
})
```

Manter fora do composable:

- navegacao `startDeck`;
- navegacao `startInterleavedPractice`;
- fallback de rota invalida em `syncStudyRoute`;
- qualquer chamada direta a `router`.

Cuidados obrigatorios:

- nao alterar `nextReview`;
- nao chamar backend para revisao anonima;
- nao chamar `refreshStats` em revisao anonima;
- nao carregar todos os decks publicos fora da logica atual;
- manter pratica intercalada anonima limitada aos primeiros 4 decks publicos;
- manter cache publico limitado;
- manter sanitizacao por `safeStudyHtml`;
- preservar mensagens atuais de sessao vazia.

Testes esperados:

- ampliar `useStudySession.test.ts`;
- testar estudo anonimo com local state;
- testar estudo autenticado via `due`;
- testar pratica intercalada anonima;
- testar `reviewCurrent` anonimo sem `refreshStats`;
- testar `reviewCurrent` autenticado com `refreshStats`.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` nao deve conter implementacao de carga/revisao de estudo;
- `App.vue` ainda pode coordenar rota e navegacao de estudo;
- nenhuma regra de SRS deve mudar.
