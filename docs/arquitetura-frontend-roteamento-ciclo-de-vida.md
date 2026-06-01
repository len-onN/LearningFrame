# Plano de Arquitetura: Roteamento, Componentizacao e Ciclo de Vida do Frontend

**Status:** Planejamento fino antes da refatoracao.
**Branch de planejamento:** `codex/frontend-routing-lifecycle-plan`
**Branch de integracao da refatoracao:** `frontend-refactor`
**Contexto:** apos o merge do PR de gerenciamento de biblioteca, o `App.vue` passou a concentrar navegacao, estado, fluxos de negocio, telas e overlays. A aplicacao ainda e funcional, mas o custo cognitivo e o risco de regressao cresceram demais para a reta final do MVP.

## 1. Objetivos

Este plano existe para orientar uma refatoracao incremental, rastreavel e de baixo risco.

Objetivos principais:
- transformar a navegacao implicita por `tab`/estado em rotas reais e recuperaveis por URL;
- componentizar a aplicacao sem alterar comportamento de usuario de uma vez;
- separar estado permanente, estado de tela e estado temporario pesado;
- reduzir o tamanho e a responsabilidade do `App.vue`;
- proteger a experiencia atual do MVP enquanto a arquitetura melhora;
- definir quais ajustes de backend sao realmente necessarios para suportar rotas diretas.

Nao objetivos neste momento:
- reescrever a aplicacao;
- adotar microfrontends;
- introduzir roteamento excessivamente profundo;
- mover tudo para uma store global antes de haver necessidade clara;
- versionar toda a API como `/api/v1` apenas por organizacao;
- alterar regras centrais de estudo, importacao ou gerenciamento durante o refactor estrutural.

## 2. Diagnostico do Estado Atual

### 2.1 Frontend

Hoje o frontend nao usa `vue-router`. A navegacao principal e controlada por estado local:
- `tab`: `library`, `study`, `import`, `create`, `progress`, `auth`;
- `librarySection`: `public`, `mine`;
- `libraryView`: `decks`, `manage-deck`.

O template usa `v-if` para desmontar a interface nao visivel. Isso reduz DOM ativo, mas nao remove automaticamente os dados reativos mantidos no topo do `App.vue`.

Consequencias:
- refresh sempre volta para estado inicial;
- nao ha URL compartilhavel para uma tela;
- back/forward do navegador nao representam a navegacao interna;
- a sidebar nao e composta por links reais;
- telas, estado e efeitos colaterais ficam no mesmo arquivo;
- a memoria de dados nao visiveis depende de limpeza manual.

### 2.2 Backend

O backend ja tem uma separacao razoavel por controllers:
- autenticacao: `/api/auth`;
- baralhos/cartas: `/api/decks`;
- midia de baralhos: `/api/decks/{deckId}/media`;
- estudo: `/api/study`;
- estatisticas: `/api/stats`;
- preview/importacao APKG: `/api/import/apkg/preview` e `/api/decks/import/apkg`.

O ponto problematico para rotas diretas e o endpoint:
- `GET /api/decks/{deckId}` retorna `DeckDetail`, incluindo todas as cartas.

Isso conflita com a decisao recente de nao carregar todas as cartas no gerenciamento de biblioteca. A rota direta de gerenciamento precisa carregar metadados do baralho sem trazer todas as cartas.

## 3. Taxonomia de Navegacao e Estado

### 3.1 O Que Deve Ser Rota

Uma rota deve existir quando o usuario entende aquilo como um lugar da aplicacao, quando faz sentido recarregar a pagina nele, ou quando o destino deve aparecer no historico do navegador.

Rotas candidatas para o MVP:
- biblioteca de baralhos publicos;
- biblioteca de baralhos do usuario;
- gerenciamento de um baralho;
- estudo sem sessao ativa;
- estudo focado em um baralho;
- estudo intercalado;
- importacao APKG;
- criacao de baralho;
- progresso;
- login;
- cadastro.

### 3.2 O Que Nao Deve Ser Rota Agora

Estados internos que nao merecem rota no MVP:
- pagina atual carregada por "Carregar mais";
- termo de busca, exceto se decidirmos persistir via query string;
- carta ativa no preview de gerenciamento;
- selecao multipla de cartas;
- abertura do editor de carta;
- face frente/verso no preview APKG;
- card atual do preview APKG;
- notificacoes;
- tema;
- sidebar expandida/recolhida.

Alguns desses estados podem virar query string no futuro, mas nao devem bloquear a primeira etapa.

### 3.3 O Que E Estado Temporario Pesado

Estados que precisam politica explicita de limpeza:
- arquivo `.apkg` selecionado;
- preview APKG com lista de cartas;
- indice local de midia APKG, que segura `ArrayBuffer` do arquivo;
- object URLs criadas para imagens/audios do preview;
- fila de estudo;
- cache de baralhos publicos convertidos para estudo anonimo;
- cartas carregadas no gerenciamento;
- timers de busca;
- requests assincronas de busca/paginacao.

## 4. Mapa de Rotas Proposto

### 4.1 Rotas Principais

```txt
/                              -> redirect para /biblioteca/publicos
/biblioteca/publicos
/biblioteca/meus
/biblioteca/meus/:deckId/gerenciar
/estudo
/estudo/baralho/:deckId
/estudo/intercalado
/importar
/criar
/progresso
/entrar
/cadastro
```

### 4.2 Regras de Autenticacao

Rotas publicas:
- `/`;
- `/biblioteca/publicos`;
- `/estudo`;
- `/estudo/baralho/:deckId`, quando o baralho for publico;
- `/importar`, para preview anonimo;
- `/entrar`;
- `/cadastro`.

Rotas que exigem usuario:
- `/biblioteca/meus`;
- `/biblioteca/meus/:deckId/gerenciar`;
- `/criar`;
- `/progresso`, se quisermos manter progresso persistido apenas logado.

Regra de redirecionamento:
- se usuario anonimo acessa rota privada, ir para `/entrar?redirect=<rota-original>`;
- apos login, voltar para `redirect` se existir;
- se nao existir redirect, ir para `/biblioteca/meus` ou `/biblioteca/publicos`.

### 4.3 Query Strings

Query strings recomendadas para etapa posterior, nao obrigatorias na primeira:
- `/biblioteca/publicos?q=anatomia`;
- `/biblioteca/meus?q=neuro`;
- `/biblioteca/meus/:deckId/gerenciar?q=nervo`.

No primeiro momento, a busca pode continuar como estado local para reduzir risco.

## 5. Design Flow Atual e Destino Proposto

### 5.1 Entrada Inicial

Atual:
- `App.vue` monta, chama `refreshAll()`, abre `tab = 'library'`, `librarySection = 'public'`.

Destino:
- `/` redireciona para `/biblioteca/publicos`;
- `LibraryPublicPage` carrega baralhos publicos paginados;
- estado de busca e pagina fica dentro do modulo de biblioteca.

Pontos de atencao:
- evitar carregar "Meus baralhos" quando usuario anonimo;
- nao carregar estatisticas fora de rotas que precisam delas.

### 5.2 Biblioteca Publica

Atual:
- renderizada quando `tab === 'library'` e `librarySection === 'public'`;
- a acao "Estudar" chama `startDeck(deck)`;
- a acao "Salvar para mim" chama `savePublicDeck(deck)`.

Destino:
- rota `/biblioteca/publicos`;
- componente de pagina `LibraryPage`;
- subcomponente `PublicDeckList`;
- "Estudar" navega para `/estudo/baralho/:deckId`;
- "Salvar para mim" continua acao, com login redirect se necessario.

Dados carregados:
- `GET /api/decks/public?page&size&q`.

Memoria:
- manter apenas paginas carregadas na lista atual;
- limpar cache se query mudar;
- opcionalmente manter lista ao alternar entre publicos/meus.

### 5.3 Meus Baralhos

Atual:
- renderizada por `librarySection === 'mine'`;
- usuario anonimo ve estado vazio com CTA de login;
- "Gerenciar" chama `openManagedDeck(deck)`.

Destino:
- rota `/biblioteca/meus`;
- exigir login via route guard;
- componente `MyDeckList`.

Dados carregados:
- `GET /api/decks/mine?page&size&q`.

Pontos de atencao:
- route guard deve preservar redirect;
- se usuario fizer logout, limpar `myDecks`, stats e qualquer gerenciamento aberto.

### 5.4 Gerenciamento de Baralho

Atual:
- estado `libraryView = 'manage-deck'`;
- precisa vir de um `DeckSummary` ja presente na lista ou de baralho recem-criado;
- cartas sao carregadas por `GET /api/decks/{deckId}/cards`.

Destino:
- rota `/biblioteca/meus/:deckId/gerenciar`;
- componente `DeckManagementPage`;
- subcomponentes:
  - `DeckMetadataForm`;
  - `ManagedCardsBrowser`;
  - `ManagedCardPreview`;
  - `CardEditorOverlay`.

Novo contrato necessario:
- `GET /api/decks/{deckId}/metadata` ou `GET /api/decks/{deckId}/summary`;
- retorna metadados e contadores sem cartas.

Contratos existentes mantidos:
- `GET /api/decks/{deckId}/cards?page&size&q`;
- `POST /api/decks/{deckId}/cards`;
- `PUT /api/decks/{deckId}/cards/{cardId}`;
- `DELETE /api/decks/{deckId}/cards/{cardId}`;
- `POST /api/decks/{deckId}/cards/bulk-delete`;
- `POST /api/decks/{deckId}/media`.

Pontos de atencao:
- rota direta deve funcionar sem lista previamente carregada;
- cartas nunca devem ser carregadas integralmente;
- ao sair da rota, fechar editor e limpar cartas carregadas;
- se houver alteracoes sujas, pedir confirmacao antes de navegar.

### 5.5 Criacao de Baralho

Atual:
- rota implicita `tab === 'create'`;
- apos criar, muda para biblioteca e gerenciamento do baralho criado.

Destino:
- rota `/criar`;
- componente `CreateDeckPage`;
- exige login;
- apos criar, navegar para `/biblioteca/meus/:deckId/gerenciar`.

Dados:
- `POST /api/decks`.

Pontos de atencao:
- formulario deve ser pequeno e descartavel;
- se usuario sair com campos preenchidos, pode descartar sem confirmacao ou confirmar apenas se houver dirty state.

### 5.6 Importacao APKG

Atual:
- `selectedFile`, `importPreview`, `previewMediaIndex`, `previewMediaUrls` ficam no topo do `App.vue`;
- `createApkgMediaIndex(file)` le o arquivo inteiro para `ArrayBuffer`;
- sair da aba nao necessariamente limpa o arquivo e o indice.

Destino:
- rota `/importar`;
- componente `ImportPage`;
- composable `useApkgImport`;
- estado pesado vive no escopo do componente/composable.

Contratos:
- `POST /api/import/apkg/preview`;
- `POST /api/decks/import/apkg`.

Pontos de atencao de memoria:
- ao sair de `/importar`, limpar `selectedFile`, `importPreview`, `previewMediaIndex`;
- revogar todos os object URLs;
- excecao: se usuario anonimo clicar para salvar e for para `/entrar`, preservar estado com flag explicita de retorno;
- apos login e persistencia, limpar tudo.

Possivel melhoria futura:
- mover preview anonimo pesado para backend com sessao temporaria;
- manter fora do MVP.

### 5.7 Estudo

Atual:
- `startDeck(deck)` muda `tab = 'study'` e carrega fila;
- `startInterleavedPractice()` tambem muda `tab = 'study'`;
- a fila fica em `studyQueue`.

Destino:
- `/estudo`: estado vazio/instrucional;
- `/estudo/baralho/:deckId`: sessao focada;
- `/estudo/intercalado`: sessao intercalada.

Dados:
- usuario logado: `GET /api/study/due?mode=SINGLE_DECK&deckId=...`;
- usuario logado intercalado: `GET /api/study/due?mode=MIXED_DUE`;
- anonimo em baralho publico: `GET /api/decks/{deckId}` ainda pode ser usado no curto prazo para estudo publico, pois precisa das cartas;
- anonimo intercalado: precisa de decisao futura; hoje usa ate 4 baralhos publicos em cache.

Pontos de atencao:
- decidir se sair da rota descarta a fila. Recomendacao MVP: descartar;
- se quisermos preservar sessao, usar query/estado dedicado depois;
- limitar `publicStudyDeckCache` com LRU simples.

### 5.8 Autenticacao

Atual:
- `tab === 'auth'`;
- `authMode` alterna login/cadastro.

Destino:
- `/entrar`;
- `/cadastro`;
- route query `redirect`.

Dados:
- `POST /api/auth/login`;
- `POST /api/auth/register`.

Pontos de atencao:
- apos login, recarregar dados necessarios para a rota de destino;
- se destino for `/importar` com APKG pendente, preservar estado apenas nesse caso;
- ao logout, redirecionar para `/biblioteca/publicos` e limpar dados privados.

### 5.9 Progresso

Atual:
- `tab === 'progress'`;
- mostra stats se `user && stats`.

Destino:
- `/progresso`;
- exige login ou mostra CTA de login.

Dados:
- `GET /api/stats/summary`.

Pontos de atencao:
- carregar stats ao entrar na rota, nao necessariamente no `refreshAll()` global;
- apos reviews, invalidar/recarregar stats.

## 6. Avaliacao dos Endpoints

### 6.1 Manter Como Esta

Endpoints que podem permanecer:
- `POST /api/auth/register`;
- `POST /api/auth/login`;
- `GET /api/decks/public`;
- `GET /api/decks/mine`;
- `POST /api/decks`;
- `PUT /api/decks/{deckId}`;
- `DELETE /api/decks/{deckId}`;
- `POST /api/decks/{deckId}/copy`;
- `GET /api/decks/{deckId}/cards`;
- `POST /api/decks/{deckId}/cards`;
- `PUT /api/decks/{deckId}/cards/{cardId}`;
- `DELETE /api/decks/{deckId}/cards/{cardId}`;
- `POST /api/decks/{deckId}/cards/bulk-delete`;
- `GET /api/study/due`;
- `POST /api/study/reviews`;
- `POST /api/study/anonymous/review`;
- `GET /api/stats/summary`.

### 6.2 Adicionar Agora

Endpoint leve para rotas diretas de gerenciamento:

```txt
GET /api/decks/{deckId}/metadata
```

Retorno sugerido:
- igual ou muito proximo de `DeckSummary`;
- sem lista de cartas.

Justificativa:
- evita carregar todas as cartas ao abrir `/biblioteca/meus/:deckId/gerenciar`;
- suporta refresh direto;
- preserva contrato paginado de cartas.

### 6.3 Avaliar Depois

Possiveis melhorias pos-MVP:
- mover import persistido para `/api/import/apkg`;
- separar `CardController` sob `/api/decks/{deckId}/cards`;
- separar favoritos em `/api/deck-favorites`;
- versionar API como `/api/v1`;
- oferecer `GET /api/decks/{deckId}/study` com payload adequado a estudo publico, separado de gerenciamento.

## 7. Politica de Ciclo de Vida e Memoria

### 7.1 Regras Gerais

- Dados globais pequenos podem sobreviver entre rotas: usuario, tema, notificacoes, resumo de listas.
- Dados de tela podem sobreviver enquanto a rota pai esta ativa.
- Dados pesados devem ser limpos ao sair da rota que os criou.
- Requests antigas devem ser abortadas ou ignoradas.
- Object URLs devem ser revogadas sempre.
- Timers devem ser limpos no unmount e na troca de contexto.

### 7.2 Por Fluxo

Biblioteca:
- manter listas paginadas enquanto o modulo biblioteca estiver ativo;
- limpar ou substituir ao trocar query;
- nao carregar detalhe completo de baralho para gerenciamento.

Gerenciamento:
- limpar `managedDeck`, `managedCards`, selecao e editor ao sair da rota;
- confirmar navegacao se formulario do baralho ou carta estiver sujo;
- abortar busca de cartas anterior quando termo mudar.

Importacao:
- limpar arquivo, preview, indice e object URLs ao sair da rota;
- preservar apenas se destino for autenticacao para concluir salvamento;
- limpar imediatamente apos importacao persistida.

Estudo:
- descartar `studyQueue` ao sair de `/estudo/*` no MVP;
- limitar cache anonimo de baralhos publicos;
- revisar se estudo intercalado anonimo deve permanecer com limite de 4 baralhos.

Autenticacao:
- limpar senha apos tentativa;
- preservar redirect;
- nao reter APKG por padrao, exceto fluxo explicito "entrar para salvar".

## 8. Componentizacao Proposta

### 8.1 Estrutura Inicial

```txt
frontend/src/
  App.vue
  router/
    index.ts
    routes.ts
  layouts/
    AppShell.vue
  pages/
    LibraryPage.vue
    StudyPage.vue
    ImportPage.vue
    CreateDeckPage.vue
    ProgressPage.vue
    AuthPage.vue
  features/
    library/
      PublicDeckList.vue
      MyDeckList.vue
      DeckCard.vue
      DeckManagementPage.vue
      DeckMetadataForm.vue
      ManagedCardsBrowser.vue
      ManagedCardPreview.vue
      CardEditorOverlay.vue
      useDeckLibrary.ts
      useDeckManagement.ts
    import/
      ApkgImportPage.vue
      ApkgPreviewCard.vue
      useApkgImport.ts
    study/
      StudySessionPage.vue
      StudyCard.vue
      RatingControls.vue
      useStudySession.ts
    auth/
      AuthPage.vue
      useAuth.ts
    notifications/
      useNotifications.ts
  services/
    api.ts
```

### 8.2 Papel do `App.vue`

Destino do `App.vue`:
- montar providers/composables globais minimos;
- renderizar `AppShell`;
- renderizar `RouterView`;
- nao conter regra de negocio de baralhos, importacao ou estudo.

### 8.3 Composables Antes de Store Global

Composables recomendados:
- `useAuth`;
- `useDeckLibrary`;
- `useDeckManagement`;
- `useStudySession`;
- `useApkgImport`;
- `useNotifications`;
- `useTheme`.

Pinia:
- adiar ate haver compartilhamento complexo entre rotas;
- provavel candidato futuro: autenticacao, notificacoes e preferencias;
- evitar mover dados pesados para store global.

## 9. Plano de Branches e Momentos Reescrito

### Estrategia de Integracao

A refatoracao sera grande demais para ir direto para `develop` em PRs independentes. Para preservar retrospectividade e reduzir risco, a frente usara uma branch intermediaria de integracao:

```txt
develop
  -> frontend-refactor
       -> codex/backend-deck-route-contracts
       -> codex/frontend-router-foundation
       -> codex/frontend-page-shell
       -> codex/frontend-library-module
       -> codex/frontend-import-study-modules
       -> codex/frontend-domain-composables
       -> codex/frontend-memory-lifecycle
```

Regras:
- `frontend-refactor` nasce de `develop` atualizada;
- cada momento nasce de `frontend-refactor`;
- cada PR de momento faz merge em `frontend-refactor`, nao em `develop`;
- apos cada merge em `frontend-refactor`, a aplicacao deve ser validada no fluxo containerizado;
- `develop` deve receber apenas hotfixes e features fora da refatoracao, quando necessario;
- se `develop` avancar durante a refatoracao, `frontend-refactor` deve ser atualizada por merge ou rebase coordenado;
- quando todos os momentos estiverem estaveis, abrir um PR final `frontend-refactor -> develop`;
- se uma etapa falhar, ela pode ser revertida em `frontend-refactor` sem contaminar `develop`.

Beneficios:
- permite revisar e testar cada fatia sem jogar uma arquitetura incompleta na branch principal de desenvolvimento;
- preserva historico atomico dos PRs;
- cria uma area de estabilizacao para problemas que so aparecem quando as fatias se juntam;
- reduz pressao para fazer uma refatoracao "big bang".

Custos:
- exige disciplina para manter `frontend-refactor` atualizada com `develop`;
- aumenta o numero de PRs e validacoes;
- pode haver conflitos se outras features alterarem `App.vue` durante a frente;
- requer uma validacao final completa antes de promover para `develop`.

### Momento 0 - Planejamento Arquitetural

Branch:
- `codex/frontend-routing-lifecycle-plan`

Base e destino:
- base: `develop`;
- destino recomendado: `frontend-refactor` se a branch ja existir; caso contrario, pode entrar em `develop` como documento fundador antes da criacao da branch intermediaria.

Objetivos:
- criar documento de rotas, fluxos e memoria;
- atualizar diario de bordo;
- alinhar escopo antes de alterar codigo.

Commit sugerido:
- `docs(arquitetura): planeja roteamento e ciclo de vida do frontend`

### Momento 1 - Contratos de Backend Para Rotas Diretas

Branch:
- `codex/backend-deck-route-contracts`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- adicionar `GET /api/decks/{deckId}/metadata`;
- adicionar wrapper em `api.ts`;
- cobrir com teste de servico/controller;
- nao alterar endpoints existentes.

Riscos:
- duplicar DTOs desnecessariamente;
- expor metadata privada sem ownership correto;
- usar endpoint de detalhe pesado por comodidade.

Saida esperada:
- rota direta de gerenciamento podera carregar baralho sem cartas.

Commit sugerido:
- `refactor(backend): adiciona metadata leve de baralho`

### Momento 2 - Fundacao de Roteamento Frontend

Branch:
- `codex/frontend-router-foundation`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- instalar/configurar `vue-router`;
- criar mapa de rotas;
- trocar a sidebar para links roteados;
- criar guards simples de autenticacao;
- manter o maximo possivel do template atual enquanto o router entra.

Planejamento fino:
- `docs/plano-momento-2-roteamento-frontend.md`.

Riscos:
- quebrar refresh direto;
- duplicar fontes de verdade (`tab` e rota);
- navegar sem limpar estado pesado.

Decisao:
- transicao pode manter `tab` temporariamente, mas a rota deve virar fonte de verdade ao fim da branch.

Commit sugerido:
- `refactor(frontend): introduz roteamento principal`

### Momento 3 - Shell e Paginas

Branch:
- `codex/frontend-page-shell`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- extrair `AppShell`;
- extrair paginas principais;
- reduzir o `App.vue` para orquestracao minima;
- manter comportamento visual.

Riscos:
- passar props demais;
- mover regra de negocio junto com template sem criterio;
- criar componentes grandes demais que apenas transferem o monolito.

Commit sugerido:
- `refactor(frontend): extrai shell e paginas principais`

### Momento 4 - Modulo Biblioteca

Branch:
- `codex/frontend-library-module`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- componentizar biblioteca e gerenciamento;
- separar lista de decks, card de deck, formulario de metadata, browser de cartas, preview e overlay;
- usar endpoint de metadata para rota direta.

Riscos:
- quebrar fluxos de edicao/exclusao;
- perder comportamento de destaque do baralho salvo/importado;
- misturar gerenciamento de cards com lista de decks.

Commit sugerido:
- `refactor(frontend): componentiza modulo de biblioteca`

### Momento 5 - Modulos Importacao e Estudo

Branch:
- `codex/frontend-import-study-modules`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- extrair importacao APKG;
- extrair estudo;
- preparar ciclo de vida de dados pesados.

Riscos:
- perder preservacao do APKG ao ir para login;
- revogar object URL ainda em uso;
- descartar fila de estudo sem decisao explicita.

Commit sugerido:
- `refactor(frontend): componentiza importacao e estudo`

### Momento 6 - Composables de Dominio

Branch:
- `codex/frontend-domain-composables`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- extrair logica de estado para composables;
- reduzir acoplamento entre componentes;
- centralizar padroes de loading, erro e sucesso.

Riscos:
- criar composables grandes demais;
- transformar composables em store global informal;
- aumentar acoplamento por imports circulares.

Commit sugerido:
- `refactor(frontend): extrai composables de dominio`

### Momento 7 - Ciclo de Vida e Memoria

Branch:
- `codex/frontend-memory-lifecycle`

Base e destino:
- base: `frontend-refactor`;
- PR para: `frontend-refactor`.

Objetivos:
- limpar APKG ao sair da rota;
- limitar cache anonimo de baralhos publicos;
- abortar/ignorar requests antigas;
- limpar timers faltantes;
- garantir que estado pesado nao fique em escopo global.

Riscos:
- limpar estado que o usuario esperava preservar;
- race conditions em busca e preview;
- mudancas invisiveis que exigem teste manual cuidadoso.

Commit sugerido:
- `refactor(frontend): controla ciclo de vida de estados temporarios`

## 10. Criterios de Aceite

Ao fim da frente arquitetural:
- URLs principais podem ser abertas diretamente no navegador;
- back/forward do navegador funcionam para telas principais;
- `App.vue` deixa de conter a maior parte das telas;
- gerenciamento de baralho pode ser aberto por URL sem carregar todas as cartas;
- importacao APKG limpa memoria ao sair da rota;
- object URLs sao revogadas;
- listas e buscas continuam paginadas;
- testes existentes continuam passando;
- fluxo containerizado continua funcionando em `http://localhost:8080`;
- nao ha regressao funcional nas features do MVP.

## 11. Ordem Recomendada

Ordem final recomendada:

1. Planejamento documentado.
2. Criar a branch intermediaria `frontend-refactor` a partir de `develop`.
3. Endpoint leve de metadata no backend, via PR para `frontend-refactor`.
4. Vue Router como fonte de verdade para navegacao principal, via PR para `frontend-refactor`.
5. Extracao de shell e paginas.
6. Componentizacao do modulo Biblioteca.
7. Componentizacao de Importacao e Estudo.
8. Composables por dominio.
9. Politica fina de memoria, aborts e limpeza.
10. Validacao integrada completa em `frontend-refactor`.
11. PR final `frontend-refactor -> develop`.

Essa ordem preserva rastreabilidade e evita big bang. Cada branch responde a uma pergunta arquitetural unica e pode ser revisada/mergeada sem carregar toda a reestruturacao de uma vez. A diferenca essencial e que a estabilizacao acontece em `frontend-refactor`, mantendo `develop` livre de estados intermediarios da refatoracao.
