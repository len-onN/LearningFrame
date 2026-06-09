# Prompt App.vue 2: extrair fluxo de criacao de baralho

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `docs/ai_context/prompts/prompt-app.vue-1.md`
- `frontend/src/App.vue`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/features/library/useDeckManagement.ts`
- `frontend/src/app/useAppNavigation.ts`

Objetivo:

Extrair a fatia pequena de criacao de baralho para consolidar o padrao de
feature composable com portas nomeadas.

Escopo recomendado:

1. Criar `frontend/src/features/create/useCreateDeckFlow.ts`.
2. Mover de `App.vue`:
   - `deckForm`;
   - `createDeck`.
3. Usar contrato explicito:
   - `client.createDeck`;
   - `loadMyDecks`;
   - `setManagedDeck`;
   - `navigateToManagedDeck`;
   - `showNotice`;
   - `withFeedback`.
4. Se necessario, adicionar callback em `useAppNavigation` ou no root:
   - `navigateToManagedDeck(deckId: number)`.

Cuidados obrigatorios:

- nao alterar texto `Baralho criado. Adicione as primeiras cartas.`;
- nao alterar rota final de gerenciamento;
- nao passar `router` inteiro para `features/create`;
- nao alterar contrato de `CreateDeckRouteContext`;
- nao mexer em gerenciamento de cartas nesta fatia.

Testes esperados:

- criar `frontend/src/features/create/useCreateDeckFlow.test.ts`;
- testar chamada de API, reset do formulario, reload de meus baralhos,
  `setManagedDeck`, navegacao e notice.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` nao deve conter `deckForm` nem implementacao de `createDeck`;
- `CreateDeckRouteContext` deve continuar expondo o mesmo contrato visual;
- a fatia deve ser pequena e facil de revisar.
