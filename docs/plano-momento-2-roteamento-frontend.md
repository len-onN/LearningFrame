# Planejamento do Momento 2: Fundacao de Roteamento Frontend

**Status:** implementado na branch do Momento 2.
**Branch:** `codex/frontend-router-foundation`
**Base:** `frontend-refactor`
**Destino do PR:** `frontend-refactor`
**Dependencia concluida:** Momento 1, com `GET /api/decks/{deckId}/metadata` e `api.deckMetadata(deckId)`.

## 1. Objetivo do Momento

Introduzir `vue-router` como fonte de verdade da navegacao principal sem componentizar toda a aplicacao ainda.

O Momento 2 deve resolver:
- URLs reais para as superficies principais da aplicacao;
- refresh direto em rotas conhecidas;
- historico do navegador compativel com a navegacao interna;
- sidebar baseada em links roteados;
- redirecionamento simples para login/cadastro em rotas privadas;
- base tecnica para o Momento 3, quando `App.vue` passa a virar shell com paginas extraidas.

O Momento 2 nao deve tentar resolver tudo:
- nao extrair todas as paginas ainda;
- nao criar store global;
- nao reescrever estudo, importacao ou biblioteca;
- nao alterar contratos de backend alem do que ja foi entregue no Momento 1;
- nao mover estilos extensivamente;
- nao transformar editor de carta, preview APKG ou selecao multipla em rotas.

## 2. Estado Atual Confirmado

### 2.1 Estrutura Frontend

Arquivos principais atuais:
- `frontend/src/main.ts` monta `createApp(App).mount('#app')`;
- `frontend/src/App.vue` concentra script, template, estado, navegacao e fluxos;
- `frontend/src/services/api.ts` concentra chamadas HTTP;
- `frontend/src/types/api.ts` concentra tipos de resposta;
- `frontend/src/assets/styles.css` concentra a UI;
- `frontend/nginx.conf` ja possui fallback SPA com `try_files $uri $uri/ /index.html`;
- `frontend/package.json` ainda nao possui `vue-router`.

O `App.vue` tem aproximadamente 1947 linhas e hoje faz papel de:
- layout principal;
- sidebar;
- header/topbar;
- sistema de notificacoes;
- tela de autenticacao;
- biblioteca publica;
- biblioteca privada;
- gerenciamento de baralho;
- gerenciamento de cartas;
- editor overlay de cartas;
- estudo;
- importacao APKG;
- criacao manual de baralho;
- progresso;
- coordenador de chamadas API;
- coordenador de estados temporarios pesados.

### 2.2 Modelo Atual de Navegacao

A navegacao principal e controlada por tres refs:

```ts
const tab = ref<Tab>('library')
const librarySection = ref<LibrarySection>('public')
const libraryView = ref<LibraryView>('decks')
```

Estados derivados:
- `tab = 'library'` abre a area de biblioteca;
- `librarySection = 'public'` mostra baralhos publicos;
- `librarySection = 'mine'` mostra baralhos do usuario;
- `libraryView = 'manage-deck'` mostra gerenciamento de um baralho;
- `tab = 'study'` mostra estudo;
- `tab = 'import'` mostra importacao APKG;
- `tab = 'create'` mostra criacao manual;
- `tab = 'progress'` mostra progresso;
- `tab = 'auth'` mostra login/cadastro, definido por `authMode`.

O template usa `v-if` para alternar as superficies:
- `tab === 'auth'`;
- `tab === 'library'`;
- `tab === 'study'`;
- `tab === 'import'`;
- `tab === 'create'`;
- `tab === 'progress'`;
- `cardEditorOpen && managedDeck`.

Consequencias:
- a URL nao representa a tela;
- refresh volta ao estado inicial;
- back/forward do navegador nao representam a navegacao interna;
- a sidebar nao usa links;
- funcoes de dominio alteram navegacao diretamente;
- nao ha uma fronteira clara entre "lugar da aplicacao" e "estado interno da tela".

### 2.3 Modelo Atual de Dados e Memoria

Mesmo quando uma superficie sai do DOM por `v-if`, muitos dados continuam vivos no topo do `App.vue`.

Estados leves que podem sobreviver:
- usuario;
- tema;
- sidebar recolhida;
- notificacoes;
- pagina carregada de baralhos;
- estatisticas.

Estados de tela que devem ser controlados por rota ou por modulo:
- lista publica de baralhos;
- lista de meus baralhos;
- metadata do baralho em gerenciamento;
- cartas paginadas do baralho em gerenciamento;
- fila de estudo;
- formulario de criacao;
- formulario de autenticacao.

Estados pesados que precisam limpeza explicita:
- `selectedFile`;
- `importPreview`;
- `previewMediaIndex`;
- `previewMediaUrls`;
- `publicStudyDeckCache`;
- `studyQueue`;
- `managedCards`;
- timers `librarySearchTimer`, `managedCardsSearchTimer`, `highlightDeckTimer`;
- requests assincronas iniciadas por busca ou troca de contexto.

O Momento 2 nao precisa resolver toda a politica de memoria, mas precisa evitar piorar o problema. Ao trocar rotas, os mesmos pontos de limpeza atuais devem continuar sendo chamados.

## 3. Mapa de Rotas do Momento 2

Rotas recomendadas para a primeira fundacao:

```txt
/                              -> redirect para /biblioteca/publicos
/biblioteca/publicos           -> library-public
/biblioteca/meus               -> library-mine
/biblioteca/meus/:deckId/gerenciar -> library-deck-manage
/estudo                        -> study
/estudo/baralho/:deckId        -> study-deck
/estudo/intercalado            -> study-interleaved
/importar                      -> import
/criar                         -> create
/progresso                     -> progress
/entrar                        -> login
/cadastro                      -> register
```

### 3.1 Rotas Publicas

Publicas:
- `/`;
- `/biblioteca/publicos`;
- `/estudo`;
- `/estudo/baralho/:deckId`, quando o baralho for publico;
- `/estudo/intercalado`;
- `/importar`;
- `/entrar`;
- `/cadastro`.

Observacao importante:
- `/estudo/baralho/:deckId` pode ser acessada sem login para baralhos publicos, usando o fluxo anonimo ja existente;
- se o baralho nao for publico, o backend deve responder erro e a UI deve mostrar feedback sem vazar metadados privados.

### 3.2 Rotas Privadas

Privadas:
- `/biblioteca/meus`;
- `/biblioteca/meus/:deckId/gerenciar`;
- `/criar`;
- `/progresso`.

Regra:
- usuario anonimo em rota privada deve ir para `/entrar?redirect=<rota-original>`;
- apos login, retornar para o `redirect`;
- se nao houver redirect, ir para `/biblioteca/meus` ou `/biblioteca/publicos`.

### 3.3 Estados Que Nao Viram Rota Agora

Continuam como estado interno:
- termo de busca de baralhos;
- paginacao carregada por "Carregar mais";
- termo de busca de cartas;
- carta selecionada no gerenciamento;
- selecao multipla;
- abertura do editor de carta;
- modo criar/editar do editor;
- face frente/verso no preview APKG;
- carta selecionada no preview APKG;
- tema;
- sidebar recolhida;
- notificacoes.

Query strings como `?q=neuro` podem entrar depois. Para o Momento 2, manter busca como estado local reduz risco.

## 4. Substituicoes Planejadas

### 4.1 `tab`

Atual:

```ts
const tab = ref<Tab>('library')
```

Destino:
- substituir por estado derivado da rota;
- manter o nome `tab` temporariamente como `computed`, se isso reduzir diff no template;
- remover atribuicoes diretas como `tab.value = 'library'`;
- toda mudanca de superficie deve chamar `router.push()` ou `router.replace()`.

Exemplo conceitual:

```ts
const tab = computed<Tab>(() => route.meta.tab as Tab ?? 'library')
```

Impacto:
- template pode continuar usando `tab === 'library'` nesta branch;
- funcoes que hoje escrevem em `tab` precisam virar navegacao roteada;
- `watch(tab, ...)` deve virar watcher de rota ou de `tab` computado.

### 4.2 `librarySection`

Atual:

```ts
const librarySection = ref<LibrarySection>('public')
```

Destino:
- derivar de `route.name`;
- `/biblioteca/publicos` implica `public`;
- `/biblioteca/meus` e `/biblioteca/meus/:deckId/gerenciar` implicam `mine`;
- remover atribuicoes diretas como `librarySection.value = 'mine'`.

Impacto:
- os botoes "Baralhos publicos" e "Meus baralhos" viram links roteados;
- `watch(librarySection, ...)` continua possivel, mas deve reagir ao valor derivado da rota;
- funcoes como `savePublicDeck`, `createDeck` e `persistImport` devem navegar para a rota correta em vez de setar `librarySection`.

### 4.3 `libraryView`

Atual:

```ts
const libraryView = ref<LibraryView>('decks')
```

Destino:
- derivar de `route.name`;
- rotas de lista usam `decks`;
- rota `/biblioteca/meus/:deckId/gerenciar` usa `manage-deck`.

Impacto:
- `openManagedDeck(deck)` passa a navegar para a rota de gerenciamento;
- `closeManagedDeck()` volta para `/biblioteca/meus`;
- rota direta de gerenciamento deve carregar `api.deckMetadata(deckId)` e `api.deckCards(deckId, ...)`.

### 4.4 `authMode`

Atual:

```ts
const authMode = ref<AuthMode>('login')
```

Destino:
- derivar de rota;
- `/entrar` implica `login`;
- `/cadastro` implica `register`.

Impacto:
- `openAuth('login')` vira navegacao para `login`;
- `openAuth('register')` vira navegacao para `register`;
- `toggleAuthMode()` alterna entre as duas rotas, preservando `redirect` se existir;
- validacao existente pode continuar usando `authMode` como computed.

### 4.5 `currentTitle`

Atual:
- usa `tab`, `authMode` e `managedDeck`.

Destino:
- usar `route.meta.title` como base;
- manter excecao para gerenciamento quando `managedDeck` ja carregou;
- nao hardcodar titulos da sidebar em multiplos lugares.

Impacto:
- route records passam a carregar `meta.title`;
- `currentTitle` fica mais previsivel para refresh direto.

## 5. Novos Elementos Tecnicos

### 5.1 Dependencia

Adicionar:

```json
"vue-router": "^4"
```

Arquivos afetados:
- `frontend/package.json`;
- `frontend/package-lock.json`.

### 5.2 Router

Novo arquivo recomendado:
- `frontend/src/router/index.ts`.

Responsabilidades:
- criar `createRouter`;
- usar `createWebHistory`;
- declarar route records;
- declarar nomes de rotas;
- declarar meta de titulo, tab e autenticacao;
- exportar `router`;
- exportar tipos auxiliares, se necessario.

Exemplo de meta desejada:

```ts
meta: {
  title: 'Biblioteca',
  tab: 'library',
  requiresAuth: false
}
```

### 5.3 Guard de Autenticacao

O guard deve ser simples e previsivel:
- se rota nao exige auth, segue;
- se rota exige auth e existe token armazenado, segue;
- se rota exige auth e nao existe token, redireciona para login com `redirect`.

Fonte de auth possivel:
- `getAuthToken()` em `services/api.ts`;
- fallback para `localStorage.getItem('learningframe.token')`, se necessario.

Ponto de atencao:
- token presente nao garante token valido. Se o backend rejeitar depois, o fluxo atual de erro continua responsavel por informar falha. Validacao fina de sessao expirada fica para momento posterior.

### 5.4 Registro no `main.ts`

Atual:

```ts
createApp(App).mount('#app')
```

Destino:

```ts
createApp(App).use(router).mount('#app')
```

### 5.5 Links de Navegacao

Sidebar deve deixar de escrever em `tab`.

Como o design atual usa botoes com icones, evitar `<a>` cru se isso quebrar a UI. Duas opcoes aceitaveis:

1. `RouterLink` custom com slot:

```vue
<RouterLink custom :to="{ name: item.routeName }" v-slot="{ navigate, isActive }">
  <button :class="{ active: isActive }" type="button" @click="navigate">
    ...
  </button>
</RouterLink>
```

2. `button` com `router.push`, se for mais simples neste momento.

Preferencia:
- usar `RouterLink custom` nos itens principais da sidebar;
- usar `router.push` em acoes de workflow, como salvar, importar, criar e estudar.

## 6. Funcoes Atuais Afetadas

### 6.1 Navegacao Global

Funcoes afetadas:
- `goHome()`;
- `openAuth(mode)`;
- `toggleAuthMode()`;
- `logout()`;
- clique direto nos itens da sidebar;
- clique em "Pratica intercalada".

Substituicao:
- trocar mutacoes de `tab` por `router.push` ou `router.replace`.

Cuidados:
- `logout()` deve limpar dados privados antes de navegar;
- `goHome()` deve voltar a `/biblioteca/publicos`;
- `openAuth()` deve preservar redirect quando vier de rota privada.

### 6.2 Biblioteca

Funcoes afetadas:
- `refreshAll()`;
- `loadPublicDecks()`;
- `loadMyDecks()`;
- `loadMorePublicDecks()`;
- `loadMoreMyDecks()`;
- `savePublicDeck(deck)`;
- `openManagedDeck(deck)`;
- `closeManagedDeck(force)`;
- `createDeck()`;
- `persistImport()`;
- `highlightDeck(deckId)`.

Substituicoes:
- `savePublicDeck()` navega para `/biblioteca/meus` depois de copiar;
- `openManagedDeck()` navega para `/biblioteca/meus/:deckId/gerenciar`;
- `closeManagedDeck()` navega para `/biblioteca/meus`;
- `createDeck()` navega para gerenciamento do baralho criado;
- `persistImport()` navega para `/biblioteca/meus` e preserva highlight.

Novo comportamento esperado:
- refresh direto em `/biblioteca/meus/:deckId/gerenciar` deve carregar metadata via `api.deckMetadata(deckId)` e cartas via `api.deckCards`;
- se o usuario nao estiver logado, guard envia para `/entrar?redirect=...`;
- apos login, voltar para a rota de gerenciamento.

### 6.3 Gerenciamento de Baralho

Funcoes afetadas:
- `setManagedDeck(deck)`;
- `loadManagedCards(reset)`;
- `saveManagedDeck()`;
- `deleteManagedDeck()`;
- `openCreateCardEditor()`;
- `openEditCardEditor(card)`;
- `closeCardEditor(force)`;
- `saveCardEditor()`;
- `deleteManagedCard(card)`;
- `deleteSelectedManagedCards()`.

Substituicoes:
- `setManagedDeck()` continua existindo, mas pode receber metadata carregada pela rota;
- `openManagedDeck()` nao deve depender de o deck ja existir na lista local;
- `loadManagedCards()` passa a depender do `deckId` da rota quando `managedDeck` ainda estiver vazio.

Cuidados:
- ao sair da rota de gerenciamento, chamar limpeza equivalente a `closeManagedDeck(true)`;
- se houver alteracoes nao salvas no metadata ou editor, decidir se o Momento 2 mantem `window.confirm` em navegacao de saida. Recomendacao: manter confirmacao apenas nos botoes internos nesta branch; guard de saida refinado pode ficar para ciclo de vida posterior.

### 6.4 Autenticacao

Funcoes afetadas:
- `submitAuth()`;
- `openAuth(mode)`;
- `toggleAuthMode()`;
- `resetAuthValidation()`;
- `logout()`.

Substituicoes:
- `authMode` vem da rota;
- depois de login, ler `route.query.redirect`;
- se redirect existir, `router.replace(redirect)`;
- se nao existir, `router.replace({ name: 'library-mine' })` ou `library-public`.

Cuidados:
- quando `returnToImportAfterAuth` estiver ativo, preservar o comportamento atual da importacao. Esse estado nao deve competir com `redirect`; prioridade recomendada:
  1. se existe `returnToImportAfterAuth` e `importPreview`, voltar para `/importar`;
  2. senao, se existe `redirect`, voltar para redirect;
  3. senao, ir para biblioteca.

### 6.5 Estudo

Funcoes afetadas:
- `startDeck(deck)`;
- `startInterleavedPractice()`;
- `reviewCurrent(rating)`;
- `ensurePublicDeck(deckId)`.

Substituicoes:
- `startDeck(deck)` deve virar navegacao para `/estudo/baralho/:deckId`;
- `startInterleavedPractice()` deve virar navegacao para `/estudo/intercalado`;
- carregamento da fila deve ser disparado pela rota de estudo, nao apenas pelo clique.

Cuidados:
- usuario logado usa `api.due('SINGLE_DECK', deckId)`;
- usuario anonimo usa `ensurePublicDeck(deckId)`, que ainda depende de `api.deck(deckId)` e carrega as cartas do baralho publico;
- `publicStudyDeckCache` continua existindo por enquanto, mas deve ser limpo/limitado no Momento 7;
- entrar em `/estudo` sem deck deve mostrar estado vazio.

### 6.6 Importacao APKG

Funcoes afetadas:
- `handleApkgChange(event)`;
- `persistImport()`;
- `resetImportPreviewState()`;
- `showPreviewCard(index, face)`;
- `readPreviewMediaUrls(card, face)`;
- `revokePreviewMediaUrls(urls)`.

Substituicoes:
- `tab = 'import'` vira navegacao para `/importar`;
- apos login para salvar APKG, voltar para `/importar` quando houver preview em memoria;
- apos persistir importacao, navegar para `/biblioteca/meus`.

Cuidados:
- nao transformar preview em rota;
- nao perder `selectedFile` durante login interno se a aplicacao nao recarregar;
- se houver refresh em `/importar`, o preview deve sumir, pois o arquivo local nao e recuperavel;
- object URLs devem continuar revogadas no unmount e ao trocar preview.

### 6.7 Progresso

Funcoes afetadas:
- `refreshAll()`;
- carregamento de `stats`;
- `reviewCurrent()`;
- `savePublicDeck()`;
- `persistImport()`;
- `deleteManagedDeck()`.

Substituicoes:
- rota `/progresso` exige login;
- ao entrar nela, garantir `stats`;
- atualizacoes que ja recarregam stats podem permanecer.

Cuidados:
- nao carregar stats anonimo;
- nao forcar `refreshAll()` global se a rota nao precisa.

## 7. Lateralidades e Efeitos Indiretos

### 7.1 Backend

Nao deve haver novo contrato de backend no Momento 2.

Contratos usados:
- `GET /api/decks/public`;
- `GET /api/decks/mine`;
- `GET /api/decks/{deckId}/metadata`;
- `GET /api/decks/{deckId}/cards`;
- `GET /api/decks/{deckId}`;
- `GET /api/study/due`;
- `POST /api/study/reviews`;
- `GET /api/stats/summary`;
- contratos de auth e importacao ja existentes.

Ponto sensivel:
- `/biblioteca/meus/:deckId/gerenciar` deve usar `metadata`, nao `deck`;
- `/estudo/baralho/:deckId` anonimo ainda pode usar `deck`, porque estudo publico precisa das cartas.

### 7.2 Nginx e Container

`frontend/nginx.conf` ja suporta refresh direto com:

```nginx
try_files $uri $uri/ /index.html;
```

Portanto, nao deve ser necessario alterar Nginx para history mode.

Validacao obrigatoria depois da implementacao:
- acessar diretamente `/biblioteca/publicos`;
- acessar diretamente `/importar`;
- acessar diretamente `/entrar`;
- acessar diretamente `/biblioteca/meus` anonimo e confirmar redirect;
- acessar diretamente `/biblioteca/meus/:deckId/gerenciar` logado e confirmar carga via metadata.

### 7.3 Build e Dependencias

Adicionar `vue-router` altera lockfile.

Cuidados:
- rodar `npm install vue-router@^4` no ambiente correto ou dentro de container Node;
- nao editar `package-lock.json` manualmente;
- validar `npm run build`;
- validar que o builder containerizado continua funcionando.

### 7.4 Testes

Testes recomendados no Momento 2:
- teste unitario do mapa de rotas, se a estrutura permitir exportar records puros;
- teste de guard simples para rotas privadas, se a logica for extraida para funcao pequena;
- build frontend como validacao minima obrigatoria.

Sem Playwright configurado hoje, a validacao manual em navegador/container deve cobrir:
- refresh direto;
- back/forward;
- login com redirect;
- navegacao por sidebar;
- gerenciamento direto de baralho;
- estudo por deck;
- importacao com preview.

### 7.5 UX

O comportamento visual deve permanecer igual.

Mudancas perceptiveis e desejadas:
- URL muda ao navegar;
- back/forward passa a funcionar;
- refresh preserva a superficie principal;
- rotas privadas levam ao login e retornam ao destino.

Mudancas que nao devem acontecer:
- perder botoes e icones da sidebar;
- alterar layout principal;
- transformar editor de carta em pagina separada;
- alterar comportamento de busca/carregar mais;
- abrir todas as cartas do baralho de uma vez.

## 8. Estrategia de Implementacao

### Passo 1 - Dependencia e Router Basico

Tarefas:
- instalar `vue-router`;
- criar `frontend/src/router/index.ts`;
- declarar rotas e metadados;
- registrar router em `main.ts`.

Aceite:
- build compila;
- `/` redireciona para `/biblioteca/publicos`.

### Passo 2 - Guard de Auth

Tarefas:
- adicionar `requiresAuth` em meta;
- criar guard para redirect a `/entrar?redirect=...`;
- preservar query `redirect`.

Aceite:
- anonimo em `/biblioteca/meus` vai para login;
- login consegue voltar ao destino.

### Passo 3 - Substituir Fonte de Verdade da Navegacao

Tarefas:
- substituir `tab`, `librarySection`, `libraryView` por computed derivados da rota;
- remover atribuicoes diretas a esses refs;
- adaptar `currentTitle`.

Aceite:
- template continua usando as condicoes atuais, mas alimentado pela rota;
- nao ha duplicidade entre rota e estado local.

### Passo 4 - Sidebar Roteada

Tarefas:
- transformar itens principais em links roteados;
- manter estilos e icones atuais;
- preservar botao de pratica intercalada, agora navegando para rota.

Aceite:
- item ativo reflete rota;
- back/forward atualiza item ativo.

### Passo 5 - Workflows de Navegacao

Tarefas:
- adaptar `goHome`, `openAuth`, `toggleAuthMode`, `logout`;
- adaptar `startDeck` e `startInterleavedPractice`;
- adaptar `openManagedDeck`, `closeManagedDeck`, `createDeck`, `persistImport`, `savePublicDeck`.

Aceite:
- nenhum workflow importante depende de `tab.value = ...`;
- gerenciamento criado/importado/salvo navega para a rota correta.

### Passo 6 - Loaders Baseados em Rota

Tarefas:
- ao entrar em `/biblioteca/publicos`, garantir baralhos publicos;
- ao entrar em `/biblioteca/meus`, garantir baralhos do usuario;
- ao entrar em `/biblioteca/meus/:deckId/gerenciar`, carregar metadata e cartas;
- ao entrar em `/estudo/baralho/:deckId`, carregar fila do deck;
- ao entrar em `/estudo/intercalado`, carregar fila intercalada;
- ao entrar em `/progresso`, carregar stats.

Aceite:
- refresh direto funciona nas rotas principais;
- gerenciamento usa `api.deckMetadata`;
- estudo por deck funciona por URL.

### Passo 7 - Limpeza Basica em Troca de Rota

Tarefas:
- ao sair da rota de gerenciamento, fechar editor e limpar cartas gerenciadas;
- ao sair de biblioteca, fechar editor de carta;
- ao sair de importacao, decidir se preview deve permanecer ou ser limpo. Recomendacao para Momento 2: manter em memoria durante navegacao interna curta, mas limpar no Momento 7 com politica mais explicita;
- manter revogacao de object URLs no unmount.

Aceite:
- nao ficam overlays abertos em rotas erradas;
- nao ha erro visual por estado antigo.

## 9. Criterios de Aceite do Momento 2

Obrigatorios:
- `vue-router` instalado e registrado;
- mapa de rotas criado com nomes e meta;
- `/` redireciona para `/biblioteca/publicos`;
- sidebar navega por rotas;
- rota ativa aparece corretamente;
- rotas privadas redirecionam para login;
- login respeita `redirect`;
- refresh direto funciona pelo Nginx SPA fallback;
- `/biblioteca/meus/:deckId/gerenciar` carrega metadata sem carregar todas as cartas;
- build frontend passa;
- diario de bordo atualizado.

Nao obrigatorios neste momento:
- extrair paginas para arquivos proprios;
- criar store global;
- persistir busca em query string;
- criar guards de saida sofisticados para formularios sujos;
- resolver toda politica de memoria.

## 10. Riscos e Mitigacoes

Risco: duplicar fonte de verdade entre rota e refs.
Mitigacao: ao fim da branch, `tab`, `librarySection`, `libraryView` devem ser derivados da rota, nao refs editaveis.

Risco: quebrar fluxo de login/importacao.
Mitigacao: preservar prioridade de `returnToImportAfterAuth` antes de `redirect`.

Risco: rota direta de gerenciamento carregar endpoint pesado.
Mitigacao: usar apenas `api.deckMetadata` + `api.deckCards`.

Risco: back/forward deixar overlay aberto.
Mitigacao: fechar editor quando a rota sair de biblioteca/gerenciamento.

Risco: refresh direto funcionar no Vite mas falhar no container Nginx.
Mitigacao: validar no container, aproveitando `try_files` ja configurado.

Risco: estudo por rota duplicar carregamentos.
Mitigacao: route watcher deve comparar `route.name` e `deckId` antes de recarregar, quando viavel.

## 11. Ordem Recomendada de Commits

Commit 1:
- `build(frontend): adiciona vue-router`
- altera `package.json` e `package-lock.json`.

Commit 2:
- `refactor(frontend): define mapa de rotas principal`
- cria router, meta e guard.

Commit 3:
- `refactor(frontend): conecta navegacao ao router`
- adapta `main.ts`, sidebar e funcoes de navegacao.

Commit 4:
- `refactor(frontend): carrega telas a partir da rota`
- adiciona loaders por rota e uso de metadata.

Commit unico tambem e aceitavel se o diff ficar pequeno, mas a preferencia e separar dependencia, mapa de rotas e integracao.

## 12. Proxima Acao

Validar manualmente no container:
1. refresh direto em `/biblioteca/publicos`;
2. redirect anonimo de `/biblioteca/meus` para `/entrar?redirect=...`;
3. login com retorno para `redirect`;
4. rota direta `/biblioteca/meus/:deckId/gerenciar` usando metadata e cartas paginadas;
5. `/estudo/baralho/:deckId`;
6. `/estudo/intercalado`;
7. `/importar`, `/criar` e `/progresso`;
8. back/forward entre rotas principais.

## 13. Resultado da Implementacao

Implementado:
- dependencia `vue-router`;
- `frontend/src/router/index.ts` com mapa de rotas, route meta, guard simples de autenticacao e catch-all para biblioteca publica;
- registro do router em `frontend/src/main.ts`;
- `tab`, `librarySection`, `libraryView` e `authMode` derivados da rota;
- sidebar com `RouterLink custom`, preservando botoes, icones e estado visual ativo;
- tabs internas de biblioteca navegando para rotas reais;
- workflows de login, logout, salvar baralho publico, criar baralho, importar APKG, gerenciar baralho e estudo usando `router.push`/`router.replace`;
- loader por rota para biblioteca publica, meus baralhos, gerenciamento, estudo por baralho, estudo intercalado e progresso;
- gerenciamento direto usando `api.deckMetadata(deckId)` + `api.deckCards`;
- estudo anonimo por rota mantendo `api.deck(deckId)` apenas onde as cartas completas sao necessarias;
- recarregamento explicito quando a rota de pratica intercalada ja esta ativa;
- limpeza basica de gerenciamento ao sair da rota.

Validacoes executadas:
- `npm run build` em container Node;
- `npm test` em container Node.

Observacao:
- `npm audit` passou a reportar uma vulnerabilidade critica apos a instalacao das dependencias. Nao foi aplicado `npm audit fix --force`, pois isso poderia introduzir alteracoes de versao fora do escopo do Momento 2.

Ao final, abrir PR de `codex/frontend-router-foundation` para `frontend-refactor`.
