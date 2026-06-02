# Planejamento do Momento 6: Composables de Dominio

**Status:** planejamento fino antes da implementacao.  
**Branch:** `codex/frontend-domain-composables-plan`  
**Base:** `frontend-refactor` atualizada apos merge do Momento 5  
**Destino do PR:** `frontend-refactor`  
**Dependencias concluidas:** infraestrutura global em `useFeedback`, `useTheme` e `useAuthSession`.

## 1. Objetivo

Extrair do `App.vue` os estados, computeds e operacoes de dominio para composables pequenos, coesos e testaveis, sem alterar comportamento visual, rotas, contratos de API ou fluxos ja validados.

Objetivos:
- reduzir o `App.vue` como orquestrador monolitico;
- mover estado/cache de Biblioteca, Gerenciamento, Importacao e Estudo para composables de dominio;
- preservar componentes visuais atuais como componentes controlados por props/eventos;
- preparar a troca futura de `RouteSurface` por route components reais;
- manter lateralidades explicitas: auth, router, feedback, stats, memoria e localStorage nao devem vazar de um dominio para outro sem contrato claro.

Nao objetivos:
- nao alterar URLs, nomes de rotas ou guards;
- nao trocar `RouteSurface` por paginas reais ainda;
- nao introduzir Pinia/store global;
- nao alterar backend ou contratos de API;
- nao redesenhar UI;
- nao mover CSS;
- nao resolver midias orfas;
- nao criar WYSIWYG;
- nao fazer uma unica extracao gigante.

## 2. Estado Atual Confirmado

Depois do Momento 5:
- `App.vue` tem cerca de 1307 linhas;
- infraestrutura global ja saiu parcialmente do componente raiz:
  - `useFeedback`;
  - `useTheme`;
  - `useAuthSession`;
- o router ja define paths e guards, mas ainda usa `RouteSurface`;
- o `App.vue` ainda renderiza paginas por `v-if` baseado em `tab`;
- paginas e componentes visuais ja existem:
  - `AppShell`;
  - `AuthPage`;
  - `LibraryPage`;
  - `StudyPage`;
  - `ImportPage`;
  - `CreateDeckPage`;
  - `ProgressPage`;
  - `CardEditorOverlay`;
- workflows de dominio continuam no `App.vue`.

Principais blocos ainda concentrados no `App.vue`:
- Biblioteca:
  - `publicDecks`, `myDecks`, pages, queries, busca debounceada, load more, refresh;
  - copia de baralho publico;
  - highlight do baralho salvo.
- Gerenciamento de baralho/cartas:
  - `managedDeck`, form, dirty state, cartas paginadas, busca de cartas, selecao multipla;
  - criar/editar/excluir deck;
  - criar/editar/excluir cartas;
  - upload de midia no editor;
  - preview sanitizado.
- Importacao APKG:
  - arquivo selecionado, preview, resultado, indice de midia, object URLs;
  - limpeza ao sair da rota;
  - preservar fluxo "entrar para salvar";
  - salvar APKG e destacar deck salvo.
- Estudo:
  - fila, sessao, carta atual, frente/verso sanitizados;
  - estudo anonimo com estado local;
  - estudo autenticado via backend;
  - revisao e atualizacao de stats.
- Autenticacao de workflow:
  - formulario, validacao, touched/submitted;
  - login/registro, redirects e refresh pos-auth.
- Roteamento/orquestracao:
  - `syncRouteState`;
  - `routeDeckId`;
  - navegacao principal;
  - limpeza coordenada ao trocar de rota.

## 3. Diagnostico

O momento 6 e o ponto mais sensivel da refatoracao ate agora. Diferente dos momentos anteriores, nao estamos apenas movendo UI ou infraestrutura global: vamos mover estado vivo com caches, requests, selecao, timers, object URLs, auth condicional e dependencias com outros dominios.

Riscos principais:
- mover uma funcao de dominio e esconder que ela atualiza outro dominio;
- quebrar fluxo de navegacao por mover `router.push` para dentro do lugar errado;
- reter dados pesados de importacao em memoria;
- limpar feedback ou loading fora de hora;
- duplicar chamadas de API;
- perder selecao/preview ao paginar cartas;
- quebrar estudo anonimo por misturar cache local e backend.

Conclusao:
- composables de dominio devem nascer com fronteiras conservadoras;
- cada composable deve concentrar estado e operacoes internas do seu dominio;
- orquestracoes transversais continuam inicialmente no `App.vue`;
- a etapa deve ser subdividida em fatias menores, todas validaveis.

## 4. Principio de Fronteira

Regra central:

> Um composable de dominio pode conhecer seu proprio estado, seus computeds, suas chamadas diretas de API e seus helpers internos. Quando uma acao depender de router, auth, feedback, stats ou outro dominio, essa dependencia deve ser injetada explicitamente ou permanecer no `App.vue` ate a fronteira ficar segura.

Exemplos:
- `useDeckLibrary` pode carregar listas de decks.
- `useDeckLibrary` nao deve decidir sozinho que o usuario precisa ir para `/entrar`.
- `useDeckManagement` pode atualizar deck e cartas.
- `useDeckManagement` nao deve atualizar stats sem receber um callback ou sem o `App.vue` orquestrar.
- `useApkgImport` pode cuidar de preview, object URLs e persistencia do APKG.
- `useApkgImport` nao deve conhecer regra visual de highlight de deck salvo sem contrato explicito.
- `useStudySession` pode carregar fila e revisar cards.
- `useStudySession` nao deve manipular sidebar, tema ou pagina atual.

## 5. Estrutura Proposta

Criar composables por feature:

```txt
frontend/src/features/
  auth/
    useAuthFlow.ts
  library/
    useDeckLibrary.ts
    useDeckManagement.ts
  import/
    useApkgImport.ts
  study/
    useStudySession.ts
```

Manter em `frontend/src/composables/` apenas infraestrutura compartilhada:
- `useFeedback`;
- `useTheme`;
- `useAuthSession`.

Motivo:
- composables de dominio devem morar perto da feature que representam;
- composables de infraestrutura continuam globais;
- isso facilita a etapa seguinte de transformar paginas em route components reais.

## 6. Ordem Recomendada

### 6A - Biblioteca e Gerenciamento

Primeira fatia recomendada.

Motivo:
- Biblioteca/Gerenciamento ainda sao o maior bloco do `App.vue`;
- os componentes visuais ja estao mais maduros;
- os fluxos recentes de cartas/baralhos precisam continuar protegidos;
- extrair esse dominio abre caminho para `LibraryPage` virar route component real depois.

Arquivos:

```txt
frontend/src/features/library/useDeckLibrary.ts
frontend/src/features/library/useDeckManagement.ts
```

### 6B - Importacao APKG

Segunda fatia.

Motivo:
- importacao tem estado pesado e ciclo de memoria proprio;
- depende de object URLs e preservacao parcial no fluxo de auth;
- deve ser extraida quando a fronteira de biblioteca/highlight ja estiver mais clara.

Arquivo:

```txt
frontend/src/features/import/useApkgImport.ts
```

### 6C - Estudo

Terceira fatia.

Motivo:
- estudo cruza backend, estudo anonimo, cache de decks publicos e `localStorage`;
- precisa preservar comportamento offline/anonimo e autenticado.

Arquivo:

```txt
frontend/src/features/study/useStudySession.ts
```

### 6D - Auth Flow

Quarta fatia ou parte de uma etapa posterior.

Motivo:
- `useAuthSession` ja separou sessao persistida;
- o workflow de login/registro ainda cruza formulario, API, refresh global, importacao e router;
- mover isso cedo demais pode embaralhar redirects e preservacao de APKG.

Arquivo possivel:

```txt
frontend/src/features/auth/useAuthFlow.ts
```

Recomendacao:
- adiar `useAuthFlow` ate Importacao APKG estar extraida;
- por enquanto, manter `submitAuth`, `openAuth` e `toggleAuthMode` no `App.vue`.

## 7. Detalhamento 6A: `useDeckLibrary`

Responsabilidade:
- listas de baralhos publicos e meus baralhos;
- paginas e metadados de paginacao;
- query aplicada em cada lista;
- busca de biblioteca;
- computeds de `hasMore`, labels e listas filtradas;
- carregar primeira pagina e paginas seguintes;
- merge seguro de paginas;
- destaque temporario de deck salvo, se a dependencia com DOM for mantida localmente ou encapsulada com cuidado.

Estado candidato:
- `librarySearch`;
- `publicDecks`;
- `myDecks`;
- `publicDeckPage`;
- `myDeckPage`;
- `publicDeckQuery`;
- `myDeckQuery`;
- `highlightedDeckId`;
- `highlightDeckTimer`.

Computeds candidatos:
- `publicDecksHasMore`;
- `myDecksHasMore`;
- `publicDecksCountLabel`;
- `myDecksCountLabel`;
- `filteredPublicDecks`;
- `filteredMyDecks`;
- `activeLibraryCountLabel`.

Funcoes candidatas:
- `loadPublicDecks`;
- `loadMyDecks`;
- `loadMorePublicDecks`;
- `loadMoreMyDecks`;
- `currentLibraryQuery`;
- `mergeDeckPages`;
- `deckPageCountLabel`;
- `highlightDeck`;
- limpeza de timer de highlight.

Funcoes que podem ficar no `App.vue` inicialmente:
- `savePublicDeck`;
- `refreshAll`.

Motivo:
- `savePublicDeck` cruza auth, feedback, API, stats, router, `loadMyDecks` e highlight;
- `refreshAll` cruza biblioteca e stats.

Alternativa segura:
- `useDeckLibrary` expor `loadMyDecks`, `loadPublicDecks` e `highlightDeck`;
- `App.vue` continuar orquestrando `savePublicDeck` e `refreshAll` chamando metodos do composable.

Dependencias explicitamente permitidas:
- `api`;
- `nextTick`;
- `UserResponse | null` somente se necessario para decidir carregar meus baralhos;
- constantes de pagina.

Dependencias a evitar:
- `router`;
- `useFeedback`;
- `stats`;
- `CardEditorOverlay`;
- `ImportPage`.

## 8. Detalhamento 6A: `useDeckManagement`

Responsabilidade:
- deck em gerenciamento;
- formulario de metadata do deck;
- dirty state;
- cartas paginadas;
- busca de cartas;
- selecao unica e multipla;
- estado do editor de cartas;
- preview sanitizado da carta selecionada/editor;
- operacoes CRUD de deck/cartas quando nao criarem efeito transversal oculto.

Estado candidato:
- `managedDeck`;
- `managedDeckForm`;
- `managedCards`;
- `managedCardsPage`;
- `managedCardsSearch`;
- `selectedManagedCardId`;
- `selectedManagedCardIds`;
- `cardEditorOpen`;
- `cardEditorMode`;
- `cardEditorCardId`;
- `cardEditorForm`;
- `cardEditorInitial`.

Computeds candidatos:
- `managedDeckDirty`;
- `cardEditorDirty`;
- `cardEditorTitle`;
- `managedCardsHasMore`;
- `managedCardsCountLabel`;
- `selectedManagedCard`;
- `selectedManagedCardsCount`;
- `allVisibleManagedCardsSelected`;
- `selectedManagedCardFrontPreview`;
- `selectedManagedCardBackPreview`;
- `managedCardsView`;
- `cardEditorFrontPreview`;
- `cardEditorBackPreview`.

Funcoes candidatas:
- `setManagedDeck`;
- `updateManagedDeckForm`;
- `closeManagedDeck` com cuidado;
- `loadManagedCards`;
- `loadMoreManagedCards`;
- `saveManagedDeck`;
- `deleteManagedDeck`;
- `openCreateCardEditor`;
- `openEditCardEditor`;
- `openCardEditor`;
- `closeCardEditor`;
- `saveCardEditor`;
- `deleteManagedCard`;
- `deleteSelectedManagedCards`;
- `selectManagedCard`;
- `toggleManagedCardSelection`;
- `toggleVisibleManagedCardsSelection`;
- `clearManagedCardSelection`;
- `uploadCardEditorMedia`;
- `handleCardEditorUploadError`;
- `splitTags`;
- `cardTextSummary`;
- `fallbackCardLabel`;
- `mergeCardsPages`.

Funcoes que podem exigir orquestracao no `App.vue`:
- `closeManagedDeck`, quando precisa navegar para `library-mine`;
- `saveManagedDeck`, quando precisa recarregar `myDecks`;
- `deleteManagedDeck`, quando precisa atualizar biblioteca, stats e navegar;
- `saveCardEditor`, quando precisa recarregar `myDecks`;
- `deleteManagedCard` e `deleteSelectedManagedCards`, quando precisam atualizar `myDecks`;
- `uploadCardEditorMedia`, quando precisa notificar sucesso/erro global.

Recomendacao de fronteira para 6A:
- mover estado, computeds e helpers internos;
- mover chamadas diretas de API apenas quando as dependencias transversais forem injetadas como callbacks;
- manter no `App.vue` as orquestracoes que cruzam router/stats/biblioteca durante a primeira extracao, ou injeta-las explicitamente.

Interface sugerida:

```ts
interface DeckManagementDependencies {
  showNotice(message: string): void
  showError(message: string): void
  withFeedback(task: () => Promise<void>, options?: FeedbackOptions): Promise<void>
  loadMyDecks(reset?: boolean): Promise<void>
  refreshStats(): Promise<void>
  navigateToMyDecks(): Promise<void>
}
```

Cuidados:
- nao passar `router` inteiro se um callback `navigateToMyDecks` basta;
- nao passar o objeto `feedback` inteiro se apenas `showNotice/showError/withFeedback` sao usados;
- evitar callbacks genericos demais como `onChanged`, pois escondem lateralidades.

## 9. Detalhamento 6B: `useApkgImport`

Responsabilidade:
- arquivo APKG selecionado;
- visibilidade e titulo;
- preview e resultado;
- indice de midia;
- object URLs da previa;
- carta/face atual do preview;
- seletor de preview;
- busca no preview;
- leitura de midia local do APKG;
- limpeza profunda ao sair da rota;
- preservacao controlada durante fluxo auth.

Estado candidato:
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
- `previewMediaRequest`.

Computeds candidatos:
- `loadingMessage`, talvez parcialmente, pois depende de `importSaving`;
- `currentPreviewCard`;
- `currentPreviewHtml`;
- `previewCardOptions`.

Funcoes candidatas:
- `handleApkgChange`;
- `persistImport`;
- `resetImportPreviewState`;
- `clearImportWorkflowState`;
- `clearImportStateForRouteChange`;
- `shouldPreserveImportAcrossAuth`;
- `isAuthPath`;
- `selectPreviewCard`;
- `movePreviewCard`;
- `togglePreviewFace`;
- `previewCardTitle`;
- `previewCardOptionLabel`;
- `previewCardSearchText`;
- `htmlSummary`, se nao ficar compartilhado;
- `showPreviewCard`;
- `readPreviewMediaUrls`;
- `decodeImage`;
- `revokePreviewMediaUrls`.

Dependencias transversais:
- `user`;
- `openAuth`;
- `loadMyDecks`;
- `stats`;
- `router.push`;
- `highlightDeck`;
- `showNotice/showError`;
- `withFeedback`.

Recomendacao:
- extrair primeiro estado, computeds e limpeza de memoria;
- manter `persistImport` no `App.vue` ou injeta-lo com dependencias explicitas, porque cruza auth, biblioteca, stats, router e feedback;
- garantir teste ou validacao manual forte de object URLs.

Pontos de performance/memoria:
- sempre revogar object URLs ao trocar carta/face;
- sempre revogar object URLs ao sair de `/importar`, salvo preservacao auth;
- limpar `File`, `ApkgMediaIndex` e preview quando o fluxo terminar;
- manter `previewMediaRequest` para evitar corrida assincroma.

## 10. Detalhamento 6C: `useStudySession`

Responsabilidade:
- fila de estudo;
- titulo da sessao;
- carta atual;
- frente/verso sanitizados;
- label de vencimento;
- visibilidade da resposta;
- carregar estudo de um deck;
- carregar pratica intercalada;
- revisar carta atual;
- resetar sessao.

Estado candidato:
- `studyQueue`;
- `sessionTitle`;
- `answerVisible`;
- `publicStudyDeckCache`;
- `localStates`.

Computeds candidatos:
- `currentCard`;
- `frontHtml`;
- `backHtml`;
- `currentDueLabel`.

Funcoes candidatas:
- `startDeck`, talvez fique no `App.vue` por navegar;
- `startInterleavedPractice`, talvez fique no `App.vue` por navegar;
- `loadStudyDeck`;
- `loadInterleavedPractice`;
- `resetStudySession`;
- `reviewCurrent`;
- `ensurePublicDeck`;
- `serverCardToStudyCard`;

Dependencias transversais:
- `router`;
- `user`;
- `publicDecks` ou `loadPublicDecks`;
- `stats`;
- `showNotice`;
- `withFeedback`;
- `api`;
- `localStorage` via `loadLocalStates/saveLocalStates`.

Recomendacao:
- mover estado e operacoes internas;
- manter `startDeck` e `startInterleavedPractice` no `App.vue` inicialmente, pois sao navegacao;
- injetar `publicDecks`/`loadPublicDecks` se pratica anonima depender dos decks publicos carregados;
- injetar `refreshStats` ou callback para atualizar stats apos review autenticado.

Pontos de comportamento:
- preservar estudo anonimo sem login;
- preservar estudo autenticado via `api.due`;
- preservar mensagem "sem cards vencidos";
- preservar `answerVisible = false` ao trocar de carta/sessao;
- preservar `localStates` em `localStorage`.

## 11. Auth Flow: Adiar ou Extrair com Cuidado

Auth tem duas camadas:
- sessao persistida: ja extraida em `useAuthSession`;
- workflow de autenticacao: ainda no `App.vue`.

Workflow atual cruza:
- formulario e validacao;
- API login/register;
- token/user;
- refresh de biblioteca/stats;
- retorno para importacao;
- redirect via query;
- feedback.

Recomendacao:
- nao mover auth flow na primeira implementacao do Momento 6;
- se houver tempo e estabilidade depois de 6B, criar `features/auth/useAuthFlow.ts`;
- manter redirects em `App.vue` ate Importacao e Biblioteca estarem extraidas.

## 12. Roteamento e Route Components

Nao alterar neste momento.

Motivo:
- route components reais devem vir depois dos composables de dominio;
- mover router agora exigiria passar composables por props/provide ou criar singleton prematuro;
- o risco de efeito domino ainda e alto.

Estado desejado apos Momento 6:
- `App.vue` ainda renderiza paginas;
- paginas recebem menos props/eventos porque estado de dominio vem de objetos retornados por composables;
- proximo momento pode substituir `RouteSurface` por pages reais com menor custo.

## 13. Lateralidades por Area

### 13.1 API

Sem alterar endpoints.

Cuidados:
- manter paginacao `page/size/q`;
- manter importacao APKG com `FormData`;
- manter upload de midia por deck;
- manter bulk delete de cartas.

### 13.2 Feedback e Loading

Usar `useFeedback` existente.

Cuidados:
- composables de dominio nao devem criar outro estado de loading global;
- quando houver loading local necessario, nomear explicitamente (`importSaving`, por exemplo);
- preservar `clearOnStart: false` em cargas acionadas por rota quando necessario.

### 13.3 Router

Evitar passar `router` inteiro para composables.

Preferir callbacks:
- `navigateToMyDecks`;
- `navigateToManagedDeck(deckId)`;
- `navigateToStudyDeck(deckId)`;
- `navigateToInterleavedPractice`;
- `openAuth`.

Motivo:
- callbacks explicitam lateralidade;
- reduzem acoplamento e facilitam teste.

### 13.4 Auth

Passar `user` como `Ref<UserResponse | null>` ou valor lido pelo chamador.

Cuidados:
- nao duplicar estado de usuario;
- nao tentar persistir sessao dentro de composable de biblioteca/importacao/estudo;
- manter `useAuthSession` como fonte de usuario.

### 13.5 Stats

Stats ainda e transversal.

Recomendacao:
- manter `stats` no `App.vue` por enquanto;
- criar helper local `refreshStats` no `App.vue`;
- composables de dominio recebem callback quando precisarem atualizar stats.

Possivel futuro:
- `useStatsSummary`.

Nao recomendado agora:
- misturar stats dentro de `useDeckLibrary` ou `useStudySession`.

### 13.6 Memoria

Importacao APKG e o ponto critico.

Obrigatorio preservar:
- revogacao de object URLs;
- descarte de `File`;
- descarte de `ApkgMediaIndex`;
- cancelamento logico via `previewMediaRequest`;
- limpeza ao sair de rota.

### 13.7 Performance

Cuidados:
- manter debounce de busca;
- evitar recarregar listas duplicadas apos salvar/excluir;
- manter merge por `Map<number, ...>`;
- nao reprocessar preview HTML mais que o necessario;
- manter computed para derivados usados no template.

### 13.8 UX

Sem alteracao visual.

Validacoes manuais:
- trocar entre Biblioteca publica e Meus baralhos;
- buscar e carregar mais;
- salvar baralho publico;
- gerenciar deck;
- buscar cartas;
- selecionar/excluir multiplas cartas;
- criar/editar carta com midia;
- importar APKG com e sem midia;
- entrar para salvar importacao;
- estudar deck anonimo e autenticado;
- pratica intercalada.

## 14. Estrategia de Implementacao

### Passo 1 - Preparar Tipos Compartilhados

Avaliar se tipos de view model atuais em `libraryTypes.ts` bastam.

Criar tipos novos somente se houver ganho real:
- dependencias dos composables;
- retornos de composables;
- callbacks transversais.

### Passo 2 - Extrair `useDeckLibrary`

Mover:
- estado de listas;
- query;
- computeds de paginacao;
- carga de decks;
- merge de paginas;
- highlight/timer.

Manter no `App.vue`:
- `savePublicDeck`;
- `refreshAll`;
- navegacao.

Validar:
- listas publica/meus;
- busca;
- carregar mais;
- destaque apos salvar/importar.

### Passo 3 - Extrair `useDeckManagement`

Mover:
- estado de deck/cartas/editor;
- computeds de dirty/preview/selecao;
- helpers de selecao e rotulo;
- carga de cartas;
- abertura/fechamento do editor.

Decidir com cuidado:
- se CRUD fica inteiro no composable com dependencias injetadas;
- ou se primeiro ficam wrappers no `App.vue`.

Recomendacao:
- mover CRUD apenas quando dependencias forem explicitas e pequenas;
- caso contrario, mover estado/computeds primeiro e deixar workflows no `App.vue` temporariamente.

Validar:
- abrir gerenciador;
- editar metadata;
- excluir deck;
- buscar cartas;
- selecionar pagina;
- excluir uma ou varias cartas;
- criar/editar carta;
- upload de imagem/audio.

### Passo 4 - Extrair `useApkgImport`

Mover:
- estado pesado;
- preview;
- leitura de midia;
- limpeza de memoria;
- navegacao interna do preview.

Manter no `App.vue` se necessario:
- persistencia final do APKG;
- redirect para auth;
- highlight do deck salvo.

Validar:
- preview APKG;
- preview com midia;
- trocar carta/face;
- sair de `/importar`;
- entrar para salvar;
- salvar e destacar baralho.

### Passo 5 - Extrair `useStudySession`

Mover:
- fila;
- estado de resposta;
- carregamento de sessoes;
- review;
- cache local.

Manter no `App.vue`:
- funcoes que apenas navegam para rota de estudo.

Validar:
- estudo anonimo;
- estudo autenticado;
- pratica intercalada;
- revisao e fim de sessao.

### Passo 6 - Revisao de `App.vue`

Objetivo:
- `App.vue` fica como integrador temporario;
- sem listas longas de estado de dominio;
- sem helpers internos duplicados;
- com fronteiras claras para o Momento 7.

Conferir:
- imports removidos;
- timers limpos;
- watchers ainda coerentes;
- nenhum estado pesado duplicado;
- nenhum composable com dependencia circular.

## 15. Testes

Testes unitarios recomendados:
- `useDeckLibrary.test.ts`:
  - merge de paginas sem duplicar;
  - labels de contagem;
  - query atual;
- `useDeckManagement.test.ts`:
  - dirty state de deck;
  - selecao multipla;
  - fallback `Carta N`;
  - split de tags;
- `useApkgImport.test.ts`:
  - labels/opcoes de preview;
  - limpeza de estado;
  - preservacao durante auth;
- `useStudySession.test.ts`:
  - conversao de card servidor;
  - reset de sessao;
  - comportamento sem cards vencidos, se mockar API for simples.

Evitar nesta etapa:
- testes de componente complexos se exigirem infraestrutura nova;
- mocks extensos do router antes de route components reais.

Validacoes obrigatorias:
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend-builder npm test`;
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend-builder npm run build`;
- teste manual containerizado dos fluxos criticos.

## 16. Criterios de Aceite

Funcionais:
- nenhuma URL muda;
- login/logout continuam funcionando;
- Biblioteca publica e Meus baralhos continuam paginando e buscando;
- salvar baralho publico continua redirecionando/destacando;
- gerenciar deck/cartas preserva selecao, busca, CRUD e editor;
- importacao APKG preserva preview, midia e limpeza de memoria;
- estudo anonimo e autenticado continuam funcionando;
- notificacoes seguem route-scoped.

Arquiteturais:
- `App.vue` perde estado de dominio de forma mensuravel;
- composables de dominio ficam em `features/*`;
- composables nao importam componentes Vue;
- composables nao conhecem CSS;
- dependencias transversais sao injetadas ou ficam no `App.vue`;
- nenhum singleton global novo e introduzido;
- router permanece estavel.

Performance/memoria:
- busca continua debounceada;
- listas continuam paginadas;
- object URLs continuam revogados;
- caches nao crescem indefinidamente alem do comportamento ja existente.

## 17. Recomendacao de Escopo do PR

O Momento 6 inteiro pode ficar grande. Existem duas estrategias aceitaveis:

### Estrategia A - Um PR de Momento 6 Completo

Vantagem:
- menos ciclos de merge.

Risco:
- diff grande e maior chance de regressao.

### Estrategia B - Sub-PRs Dentro do Momento 6

Recomendado se o diff crescer demais.

Divisao:
- 6A1: `useDeckLibrary`;
- 6A2: `useDeckManagement`;
- 6B: `useApkgImport`;
- 6C: `useStudySession`;
- 6D opcional: `useAuthFlow`.

Destino de todos:
- `frontend-refactor`.

Recomendacao atual:
- comecar por 6A1, validar, e so entao seguir para 6A2;
- so seguir para 6B se build/testes e validacao manual ficarem estaveis;
- pausar antes de 6C se o custo de verificacao ficar alto.

## 18. Proximo Momento

Depois do Momento 6, o Momento 7 deve atacar o router de fato:
- substituir `RouteSurface` por route components reais;
- reduzir props/eventos do `App.vue`;
- aproximar cada pagina do seu composable de dominio;
- manter `AppShell` como layout;
- revisar guards, redirects e limpeza por rota.

O objetivo final:
- `App.vue` vira layout/integrador minimo;
- cada pagina roteada usa composables de dominio;
- estados pesados vivem apenas enquanto a rota/feature precisar deles.

## 19. Guardrails de Implementacao: Faca e Nao Faca

Esta secao valida o planejamento contra o objetivo de manter codigo coeso, funcional, performatico e sem complexidade desnecessaria.

### 19.1 Faca

- Extraia primeiro estado, computeds e helpers puros; mova workflows com API apenas quando as dependencias transversais estiverem explicitas.
- Prefira callbacks nomeados a objetos grandes de dependencia: `refreshStats`, `navigateToMyDecks`, `openAuth`, `highlightDeck`.
- Mantenha carregamentos lazy: listas, cartas, APKG e estudo so devem carregar quando rota/acao exigir.
- Preserve paginacao e busca debounceada; nenhum composable deve transformar listas paginadas em carregamento completo.
- Retorne funcoes de limpeza para timers, object URLs e caches temporarios.
- Mantenha estado derivado como `computed`, nao como refs duplicadas que precisam ser sincronizadas manualmente.
- Mantenha componentes visuais burros/controlados: props entram, eventos saem, sem importar `api.ts`.
- Use nomes que revelem lateralidade: `loadMyDecks`, `clearImportWorkflowState`, `refreshStats`, `navigateToManagedDeck`.
- Adicione testes unitarios para regras puras de cada composable antes de depender apenas de validacao manual.
- Mantenha `App.vue` como integrador temporario quando uma acao ainda cruzar mais de um dominio.

### 19.2 Nao Faca

- Nao passe `router`, `feedback`, `api` ou `user` inteiro sem necessidade; injete apenas o que o composable realmente usa.
- Nao crie watchers dentro de composables que disparem requests automaticamente sem contrato claro com a rota.
- Nao duplique estado entre `App.vue` e composables.
- Nao esconda efeitos transversais em callbacks genericos como `onChanged` ou `afterSave`.
- Nao mova `RouteSurface`/`RouterView` neste momento.
- Nao introduza Pinia para resolver uma fronteira que ainda pode ser resolvida com composables pequenos.
- Nao mova CSS, textos de UI ou layout junto com composables de dominio.
- Nao carregue todas as cartas de um baralho para simplificar selecao/exclusao.
- Nao mantenha object URLs, arquivos APKG ou indices de midia vivos apos sair da rota.
- Nao transforme um composable em "mini App.vue"; se ele precisar de muitas dependencias, a fronteira esta errada ou a fatia esta grande demais.

## 20. Controle de Carga Computacional

O Momento 6 deve reduzir complexidade sem aumentar custo de CPU, memoria ou rede.

Regras:
- buscar baralhos e cartas sempre com pagina, `size` e query atual;
- manter debounce unico por campo de busca, preferencialmente no integrador ou com ownership explicito no composable;
- evitar deep watchers em arrays grandes de cartas/decks;
- evitar recalcular HTML sanitizado para listas inteiras; sanitizar apenas preview/carta atual;
- manter `Map<number, ...>` para merge de paginas sem duplicidade;
- preservar `Set<number>` para selecao multipla, criando novo `Set` apenas quando houver mudanca real de selecao;
- cancelar logicamente leituras assincronas de preview APKG com contador/request id, como ja acontece hoje;
- revogar object URLs antes de substituir referencias;
- nao criar caches globais para dados que ja sao de rota/feature;
- nao buscar stats em cascata quando a acao nao altera dados que impactam progresso.

Sinais de alerta durante implementacao:
- composable importando `vue-router`;
- composable chamando `localStorage` fora de estudo/auth/tema;
- composable de Biblioteca chamando API de Estudo ou Importacao;
- composable com mais dependencias do que estado proprio;
- aumento de chamadas duplicadas no fluxo de salvar/excluir;
- teste manual exigindo reload para recuperar estado apos navegacao.

## 21. Lacunas Confirmadas e Decisoes

### 21.1 Criacao de Baralho

`createDeck` e `deckForm` ainda estao no `App.vue`.

Decisao:
- nao criar um composable separado apenas para criacao neste momento;
- tratar `deckForm/createDeck` como parte de `useDeckManagement` ou manter no `App.vue` ate 6A2;
- preservar navegacao para gerenciador apos criar deck.

### 21.2 Progresso e Stats

`stats` continua transversal.

Decisao:
- manter `stats` no `App.vue` durante Momento 6;
- criar helper local `refreshStats` quando houver repeticao;
- avaliar `useStatsSummary` apenas depois de Estudo e Gerenciamento estarem extraidos.

### 21.3 Auth Flow

Formulario e redirect de login continuam no `App.vue`.

Decisao:
- nao mover `submitAuth` antes de `useApkgImport`;
- preservar retorno para Importacao APKG como criterio obrigatorio.

## 22. Sequencia Recomendada Refinada

Para controlar risco e carga cognitiva:

1. Implementar 6A1: `useDeckLibrary`.
2. Rodar build/testes e validar Biblioteca publica/Meus baralhos.
3. Implementar 6A2: `useDeckManagement`.
4. Rodar build/testes e validar CRUD de deck/cartas/editor.
5. Decidir se a branch segue para 6B ou se 6A vira PR proprio.

Esta sequencia evita carregar Importacao e Estudo no mesmo diff em que Biblioteca/Gerenciamento ainda estao sendo estabilizados.
