# Plano: tratamento final do App.vue como composition root

**Status:** Prompts 1, 2, 3, 4 e 5 concluidos; revisao final planejada.
**Branch:** `codex/refactor-app-vue-responsibilities`.
**Data de referencia:** 2026-06-09.
**Escopo:** continuar reduzindo `frontend/src/App.vue` sem alterar rotas, UX,
textos, contratos de API, SRS, fluxo APKG, paginacao, debounce ou regras de
limpeza de recursos.

Este plano consolida a frente de refatoracao depois da extracao de APKG. A
meta nao e diminuir linhas a qualquer custo. A meta e deixar `App.vue` como
composition root: instancia composables, conecta portas transversais e publica
contexts de rota, enquanto dominios e recursos temporarios ficam perto de seu
ciclo de vida real.

## 1. Estado atual do App.vue

`frontend/src/App.vue` esta com aproximadamente 586 linhas e ainda concentra:

- composicao dos fluxos extraidos de biblioteca, criacao, importacao, auth e
  estudo em `App.vue:181-324`;
- sync de rotas de estudo em `App.vue:358-382`;
- wrappers transversais de navegacao, como `openAuth`, em `App.vue:397-404`;
- navegacao de estudo em `App.vue:407-421`;
- providers de rota em `App.vue:440-542`.

A implementacao de carga e revisao de estudo saiu do root. `useStudySession`
agora possui cache publico de estudo, estados locais, carga de baralho,
pratica intercalada, revisao e conversao de cartas vindas do backend.

O sync de rotas de biblioteca saiu do root para `useLibraryRouteSync`, e as
acoes transversais de biblioteca sairam para `useLibraryActions`. `App.vue`
continua como composition root, instanciando os composables e passando portas
nomeadas para navegacao, auth, feedback e stats.

O formulario e o workflow visual de auth sairam do root para `useAuthFlow`.
`App.vue` apenas instancia o fluxo, passa portas nomeadas para navegacao,
refresh, APKG e feedback, e publica o contexto de rota.

O root nao contem mais `setTimeout`, `clearTimeout` ou
`requestAnimationFrame` manuais. Debounces e highlight passaram a ter ownership
local nos composables.

Arquivos ja extraidos e relevantes:

- `frontend/src/app/useStatsSummary.ts`;
- `frontend/src/app/useAppNavigation.ts`;
- `frontend/src/app/useRouteLifecycle.ts`;
- `frontend/src/app/useLibraryRouteSync.ts`;
- `frontend/src/app/useLibrarySearchLifecycle.ts`;
- `frontend/src/composables/useDebouncedWatch.ts`;
- `frontend/src/features/library/useLibraryActions.ts`;
- `frontend/src/features/library/useDeckLibrary.ts`;
- `frontend/src/features/library/useDeckManagement.ts`;
- `frontend/src/features/auth/useAuthFlow.ts`;
- `frontend/src/features/create/useCreateDeckFlow.ts`;
- `frontend/src/features/import/useApkgImport.ts`;
- `frontend/src/features/study/useStudySession.ts`.

## 2. Decisao arquitetural

Usar a stack atual em vez de introduzir store global ou dependencias novas:

- Vue `watch` com cleanup por `onCleanup` para debounce;
- Vue `onScopeDispose` para recursos criados por composables;
- Composition API para application services de feature;
- `provide/inject` ja existente como adapter entre root e route components;
- callbacks nomeados como portas de navegacao, feedback, auth e stats.

Nao adicionar Pinia/VueUse/lodash nesta frente sem decisao explicita. O projeto
ja tem recursos suficientes para resolver debounce, cleanup e composicao. Uma
dependencia nova so se justifica se o codigo local ficar repetitivo ou dificil
de testar apos uma primeira extracao pequena.

## 3. Padrao alvo para composables

Cada composable de dominio deve seguir este formato:

```ts
useFeatureFlow({
  user,
  client: api,
  showNotice,
  showError,
  withFeedback,
  navigateToSomething,
  refreshStats
})
```

Regras:

- efeitos externos entram como portas nomeadas;
- router inteiro so entra em composables de `app/*`, nao em `features/*`;
- recursos temporarios devem ter cleanup local;
- watchers/timers devem usar cleanup automatico ou `onScopeDispose`;
- requests potencialmente obsoletos precisam de cancelamento logico ou
  comparacao de estado atual;
- stores globais nao devem ser criadas para resolver organizacao de arquivo.

APKG ja e o exemplo positivo: `useApkgImport` recebe portas transversais,
mantem object URLs e request ids no proprio dominio, e expoe apenas
`consumeReturnToImportAfterAuth` para o root coordenar a navegacao pos-auth.

## 4. Tratamento especifico de timers e memory leaks

Timers atuais apos o Prompt 1:

- debounce da busca de biblioteca em `useLibrarySearchLifecycle`;
- debounce da busca de cartas gerenciadas em `useDeckManagement`;
- highlight temporario em `useDeckLibrary`, com timeout e rAF cancelaveis.

Status:

- `App.vue` nao possui timers manuais;
- `useDebouncedWatch` usa `watch` com `onCleanup`;
- `useDeckLibrary` usa `onScopeDispose` e flag de descarte para evitar
  highlight depois do fim do escopo;
- os testes de debounce e highlight usam fake timers.

Padrao preservado para proximas fatias:

- implementar novos debounces com `watch(..., (_next, _old, onCleanup) => {...})`;
- limpar o timeout no `onCleanup`, que roda na proxima mudanca e no stop do
  watcher;
- usar `onScopeDispose` dentro de composables que criam timeout/rAF proprio;
- testar com fake timers apenas no composable responsavel.

Nao usar `setTimeout` diretamente em `App.vue` depois da primeira nova fatia.
Se `setTimeout` continuar existindo, ele deve estar encapsulado em um composable
com ownership claro.

## 5. Colateralidades principais

### Requests duplicados

O maior risco esta no cruzamento entre watchers de busca e sync de rota:

- `useLibrarySearchLifecycle.ts` dispara carregamentos por busca;
- `useLibraryRouteSync.ts` tambem carrega biblioteca ao entrar em rota;
- `useRouteLifecycle.ts:27-52` chama syncs imediatamente.

Qualquer extracao precisa preservar:

- `showLoading: false` nos debounces;
- `clearOnStart: false` nos syncs de rota;
- comparacao de query atual antes de recarregar;
- paginacao incremental de decks e cartas.

### Auth e APKG

O pos-login em `App.vue:453-477` depende da ordem:

1. persistir sessao;
2. limpar senha/validacao;
3. `refreshAll`;
4. retomar APKG se `consumeReturnToImportAfterAuth()` retornar true;
5. senao respeitar `?redirect=...`;
6. senao ir para Meus baralhos.

Esse fluxo nao deve ser escondido dentro de auth sem contrato explicito.

### Logout

`App.vue:494-503` limpa gerenciamento, selecao, cache publico de estudo por
porta do composable, sessao, stats, decks privados e rota. Deve ficar no root
ate biblioteca e auth estarem mais isolados.

### Estudo

Depois do Prompt 3, `useStudySession` cruza estudo anonimo, backend
autenticado, SRS local, feedback e stats. A extracao manteve:

- `nextReview` apenas para cartas locais;
- `refreshStats` apenas em revisao autenticada;
- cache publico limitado;
- pratica intercalada com os primeiros 4 decks publicos carregados;
- sanitizacao por `safeStudyHtml` dentro de `useStudySession`.

## 6. Sequencia de implementacao

### Prompt 1 - Timers, debounce e cleanup

Status: concluido em 2026-06-09.

Objetivo: remover timers manuais do root e melhorar ownership de recursos.

Criar:

- `frontend/src/composables/useDebouncedWatch.ts`;
- possivelmente `frontend/src/app/useLibrarySearchLifecycle.ts`.

Mover:

- debounce de `librarySearch`;
- debounce de `managedCardsSearch`;
- cleanup do highlight para dentro de `useDeckLibrary`.

Validar:

- busca publica;
- busca em Meus baralhos;
- busca de cartas gerenciadas;
- highlight apos salvar/importar;
- testes com fake timers quando aplicavel.

### Prompt 2 - Criacao de baralho

Status: concluido em 2026-06-09.

Objetivo: extrair fatia pequena e consolidar padrao de portas de navegacao.

Criar:

- `frontend/src/features/create/useCreateDeckFlow.ts`;
- teste unitario do fluxo.

Mover:

- `deckForm`;
- `createDeck`.

Contrato:

- `client.createDeck`;
- `loadMyDecks`;
- `setManagedDeck`;
- `navigateToManagedDeck`;
- `showNotice`;
- `withFeedback`.

Implementado:

- `useCreateDeckFlow` passou a possuir `deckForm` e `createDeck`;
- `App.vue` apenas instancia o fluxo e publica o mesmo contrato visual de
  `CreateDeckRouteContext`;
- `useAppNavigation` expoe `navigateToManagedDeck(deckId)` para manter o
  router fora de `features/create`.

Validado:

- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `git diff --check`.

### Prompt 3 - Estudo

Status: concluido em 2026-06-09.

Objetivo: promover `useStudySession` de estado visual para fluxo de estudo.

Mover com cuidado:

- `publicStudyDeckCache`;
- `localStates`;
- `loadStudyDeck`;
- `loadInterleavedPractice`;
- `reviewCurrent`;
- `ensurePublicDeck`;
- `serverCardToStudyCard`.

Manter no root/app:

- navegacao `startDeck`;
- navegacao `startInterleavedPractice`;
- fallback de rota invalida no `syncStudyRoute`.

Implementado:

- `useStudySession` passou a receber `user`, `publicDecks`,
  `loadPublicDecks`, `refreshStats`, `showNotice`, `withFeedback`, `client` e
  limite de cache publico;
- `useStudySession` assumiu `publicStudyDeckCache`, `localStates`,
  `loadStudyDeck`, `loadInterleavedPractice`, `reviewCurrent`,
  `ensurePublicDeck` e `serverCardToStudyCard`;
- `App.vue` manteve somente navegacao de estudo, sync de rota e limpeza de
  cache por porta do composable no logout;
- revisao anonima permaneceu local, sem chamada ao backend e sem
  `refreshStats`;
- pratica intercalada anonima continuou limitada aos quatro primeiros decks
  publicos carregados;
- sanitizacao continuou em `safeStudyHtml` dentro de `useStudySession`.

Validado:

- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `git diff --check`.

### Prompt 4 - Biblioteca e route sync

Status: concluido em 2026-06-09.

Objetivo: remover lifecycle de biblioteca do root sem duplicar requests.

Criar:

- `frontend/src/app/useLibraryRouteSync.ts` ou nome equivalente;
- opcionalmente `frontend/src/features/library/useLibraryActions.ts`.

Mover:

- sync de rotas de biblioteca;
- load more;
- save public deck;
- delete selected my decks;
- open managed deck, se o contrato ficar claro.

Nao mover ainda se isso exigir passar router inteiro para feature.

Implementado:

- `useLibraryRouteSync` assumiu o sync de rotas de biblioteca, incluindo
  fechamento de deck gerenciado ao sair da rota, saida do modo selecao fora de
  Meus baralhos, carga condicional de publicos/meus e carga do deck gerenciado
  por `deckId`;
- `useLibraryActions` assumiu `refreshAll`, load more de publicos/meus,
  salvamento de deck publico, exclusao em lote de Meus baralhos e abertura de
  deck gerenciado;
- `useLibrarySearchLifecycle` passou a receber guards opcionais
  `shouldLoadPublicDecks` e `shouldLoadMyDecks`, evitando request duplicado
  quando o sync de rota ja carregou a query atual;
- o router inteiro ficou fora de `features/library`; a feature recebe apenas
  callbacks como `openAuth`, `navigateToMyDecks`,
  `navigateToManagedDeck` e `refreshStats`;
- `App.vue` manteve apenas a composicao dos contratos e providers.

Validado:

- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `git diff --check`.

### Prompt 5 - Auth flow

Status: concluido em 2026-06-09.

Objetivo: extrair formulario e fluxo visual de auth depois que APKG, estudo e
biblioteca estiverem com contratos mais estaveis.

Criar:

- `frontend/src/features/auth/useAuthFlow.ts`;
- testes de validacao/redirect.

Mover:

- `authForm`;
- `authTouched`;
- `authSubmitted`;
- `authErrors`;
- `submitAuth`;
- `openAuth`;
- `toggleAuthMode`;
- validacao/touched helpers.

Contrato critico:

- `persistSession`;
- `refreshAfterAuth`;
- `consumeReturnToImportAfterAuth`;
- `navigateToImport`;
- `navigateToRedirect`;
- `navigateToMyDecks`;
- `closeManagedDeck`;
- `clearFeedback`;
- `dismissError`;
- `showNotice`;
- `withFeedback`.

Implementado:

- `useAuthFlow` passou a possuir `authForm`, `authTouched`,
  `authSubmitted`, `authErrors`, `submitAuth`, `openAuth`,
  `toggleAuthMode` e helpers de validacao/touched;
- `App.vue` manteve apenas a composicao do fluxo, um wrapper `openAuth` para
  as features ja instanciadas e as portas nomeadas de navegacao;
- o router inteiro continuou fora de `features/auth`; a feature recebe apenas
  `navigateToImport`, `navigateToRedirect` e `navigateToMyDecks`;
- a ordem pos-login foi preservada: persistir sessao, limpar senha, resetar
  validacao, atualizar dados, retomar APKG, respeitar redirect, cair em Meus
  baralhos e mostrar notice;
- `?redirect=...`, troca login/cadastro e APKG "entrar para salvar" ganharam
  cobertura em `useAuthFlow.test.ts`.

Validado:

- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `git diff --check`.

### Prompt 6 - Revisao final do composition root

Objetivo: remover sobra acidental e revisar contexts.

Atividades:

- revisar imports mortos;
- avaliar se providers estao legiveis;
- manter providers no root se extrair piorar clareza;
- revisar `routeContext.ts` para remover campos mortos;
- validar todos os testes/build;
- atualizar documentacao final.

## 7. Validacao minima por fatia

Sempre:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Quando mexer em timers:

- testar com fake timers;
- confirmar cleanup em unmount/scope dispose;
- confirmar que busca nao dispara rede duplicada.

Quando mexer em estudo:

- testar estudo anonimo;
- testar estudo autenticado;
- testar pratica intercalada;
- confirmar que stats nao recarrega em revisao anonima.

Quando mexer em auth:

- testar redirect `?redirect=...`;
- testar APKG "entrar para salvar";
- testar limpeza de senha;
- testar troca login/cadastro.

## 8. Criterios de aceite final

- `App.vue` deve ser lido como composition root, nao como implementacao de
  dominios;
- nenhum timer manual deve permanecer no root;
- recursos temporarios devem ter cleanup local;
- sem store global nova;
- sem requests extras por rota/busca;
- rotas, UX, textos e API devem permanecer estaveis;
- `npm test`, `npm run build` e `git diff --check` devem passar ao fim de cada
  fatia.
