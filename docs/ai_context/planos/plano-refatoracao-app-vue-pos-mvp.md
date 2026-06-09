# Plano: Refatoracao do App.vue Pos-MVP

**Status:** diagnostico e plano inicial antes de implementacao.
**Branch:** `codex/refactor-app-vue-responsibilities`
**Base:** `develop` atualizada em 2026-06-08.
**Escopo:** reduzir `frontend/src/App.vue` como concentrador de responsabilidades sem alterar comportamento, rotas, UX, contratos de API ou regras de estudo/importacao.

## 1. Contexto

O MVP chegou a um ponto funcional, mas `frontend/src/App.vue` voltou a acumular responsabilidades demais. No estado atual, o arquivo tem 1548 linhas:

- `script setup`: linhas 1-1504;
- `template`: linhas 1506-1548;
- providers de rotas: linhas 1388-1503;
- shell visual e overlay: linhas 1506-1548.

O problema nao e apenas tamanho. O problema principal e que o arquivo mistura responsabilidades com ciclos de vida computacionais diferentes:

- estado global pequeno: sessao, tema, feedback, shell;
- estado de rota: rota atual, titulo, abas, guards indiretos;
- dominios persistentes: biblioteca, gerenciamento, estudo, importacao, progresso;
- estado pesado temporario: arquivo APKG, indice de midia, object URLs, fila de estudo, cache anonimo;
- efeitos transversais: router, loading, notice/error, stats, auth, destaque visual de deck.

Essa mistura aumenta custo cognitivo porque obriga a ler o aplicativo inteiro para entender um fluxo. Tambem aumenta risco computacional porque limpeza de timers, object URLs, caches e requests antigas fica longe do estado que ela protege.

## 2. Diagnostico do App.vue Atual

### 2.1 O que ja melhorou

A base atual ja tem boas fronteiras que devem ser preservadas:

- Vue Router esta configurado em `frontend/src/router/index.ts`;
- rotas visuais vivem em `frontend/src/routes`;
- paginas controladas por props/eventos vivem em `frontend/src/pages`;
- `AppShell` ja foi extraido;
- `useTheme`, `useFeedback` e `useAuthSession` ja retiraram infraestrutura global do componente raiz;
- `useDeckLibrary` ja concentra parte da biblioteca de decks.

Isso significa que a proxima etapa nao deve reabrir a arquitetura inteira. O caminho mais seguro e continuar a extracao por dominios, mantendo `App.vue` como composition root temporario.

### 2.2 Responsabilidades concentradas

`App.vue` hoje concentra estes blocos:

- Shell e navegacao:
  - calculo de `tab`, `librarySection`, `libraryView`, `authMode`;
  - estado de sidebar;
  - tabs da navegacao;
  - titulo atual;
  - handlers globais de home, login, logout, tema e pratica intercalada.

- Biblioteca:
  - uso de `useDeckLibrary`;
  - watchers de busca e secao;
  - `refreshAll`, `loadMorePublicDecks`, `loadMoreMyDecks`;
  - salvar deck publico em "Meus baralhos";
  - exclusao em lote de decks proprios.

- Autenticacao:
  - formulario, touched/submitted, validacao;
  - login/cadastro;
  - redirect pos-login;
  - preservacao do fluxo "entrar para salvar APKG".

- Estudo:
  - fila de estudo;
  - carta atual e HTML sanitizado;
  - progresso e resumo;
  - estudo anonimo com `localStorage`;
  - estudo autenticado via backend;
  - pratica intercalada;
  - revisao e atualizacao de stats.

- Importacao APKG:
  - arquivo selecionado;
  - preview e titulo;
  - indice local de midia;
  - object URLs;
  - busca e navegacao no preview;
  - persistencia do APKG;
  - limpeza ao sair da rota e preservacao controlada durante auth.

- Criacao e gerenciamento:
  - formulario de criacao de deck;
  - deck gerenciado e formulario de metadata;
  - busca/paginacao de cartas;
  - selecao unica e multipla;
  - editor de carta;
  - upload de midia;
  - CRUD de deck/cartas.

- Progresso:
  - `stats`;
  - carregamento de resumo na rota de progresso;
  - invalidacao apos acoes que alteram revisoes/decks.

### 2.3 Padrao de acoplamento observado

O acoplamento mais sensivel aparece quando uma funcao de dominio faz tambem:

- navegacao por `router`;
- notificacao global;
- loading global;
- atualizacao de `stats`;
- refresh de biblioteca;
- highlight visual;
- limpeza de outro dominio.

Exemplos:

- salvar APKG cruza importacao, auth, biblioteca, stats, router, feedback e highlight;
- salvar deck publico cruza biblioteca publica, auth, meus baralhos, stats, router e highlight;
- revisar card cruza estudo, SRS local ou backend, stats e feedback;
- logout limpa auth, biblioteca privada, estudo publico em cache, stats e rota.

Essas funcoes nao devem ser escondidas dentro de composables sem contrato explicito, porque isso reduziria linhas mas pioraria a compreensao.

## 3. Principio de Redesenho

A refatoracao deve seguir duas leituras ao mesmo tempo:

1. Significado cognitivo: o codigo deve ficar organizado por fluxos que o usuario e o produto reconhecem.
2. Significado computacional: o estado deve morar perto do ciclo de vida que o cria, limpa e invalida.

Portanto, a divisao proposta nao e "tirar 300 linhas para qualquer arquivo". A divisao correta e:

- `App.vue` fica como composition root e shell;
- cada feature assume seu estado de dominio;
- efeitos transversais ficam no integrador ou entram por dependencias nomeadas;
- helpers puros saem para arquivos testaveis;
- estado pesado temporario nao vira store global;
- rotas continuam com contratos estaveis via `routeContext.ts`.

## 4. Arquitetura Alvo

Estrutura alvo inicial:

```txt
frontend/src/
  app/
    useAppNavigation.ts
    useRouteLifecycle.ts
    useStatsSummary.ts
  features/
    auth/
      useAuthFlow.ts
    library/
      useDeckLibrary.ts
      useDeckManagement.ts
      deckFormatters.ts
      cardText.ts
    import/
      useApkgImport.ts
      importPreview.ts
    study/
      useStudySession.ts
      studyFeedback.ts
    create/
      useCreateDeckFlow.ts
  routes/
    routeContext.ts
```

Essa estrutura e uma direcao, nao uma exigencia de criar todos os arquivos de uma vez. O criterio e: criar um arquivo somente quando ele reduz complexidade real e tem uma fronteira clara.

## 5. Papel Final do App.vue

Ao final desta frente, `App.vue` deve:

- instanciar composables globais pequenos: auth session, theme, feedback, stats;
- instanciar composables de dominio;
- conectar dependencias transversais com callbacks nomeados;
- fazer `provide` dos contextos de rota;
- renderizar `AppShell`, `RouterView` e overlays globais realmente globais;
- conter pouca ou nenhuma regra interna de biblioteca, importacao, estudo ou gerenciamento.

`App.vue` ainda pode continuar como composition root. O objetivo nao e zera-lo, e sim impedir que ele seja a unica memoria operacional do app.

## 6. Fronteiras Propostas

### 6.1 `app/useAppNavigation.ts`

Responsabilidade:

- derivar `tab`, `librarySection`, `libraryView`, `authMode`;
- expor `navTabs`, `visibleTabs`, `currentTitle`;
- controlar `sidebarCollapsed`;
- expor `navigateTo` e `routeDeckId`, se fizer sentido.

Dependencias:

- `route`;
- `router`;
- `user`;
- `managedDeck`, apenas para titulo da rota de gerenciamento.

Cuidados:

- nao importar dominios inteiros;
- nao carregar dados;
- nao limpar estado pesado.

### 6.2 `app/useRouteLifecycle.ts`

Responsabilidade:

- coordenar watchers de rota;
- chamar `syncLibraryRoute`, `syncStudyRoute`, `syncProgressRoute`;
- chamar limpezas de rota;
- limpar feedback por troca de rota;
- preservar a regra especial de importacao durante auth.

Cuidados:

- manter nomes explicitos;
- evitar watchers escondidos dentro de muitos composables;
- documentar quando uma rota limpa estado pesado.

### 6.3 `app/useStatsSummary.ts`

Responsabilidade:

- manter `stats`;
- carregar stats quando a rota exigir;
- oferecer `refreshStats` para acoes que alteram progresso;
- limpar stats no logout.

Motivo:

- stats e transversal, mas pequeno;
- deixar stats dentro de estudo ou biblioteca criaria acoplamento enganoso.

### 6.4 `features/auth/useAuthFlow.ts`

Responsabilidade:

- formulario de login/cadastro;
- touched/submitted;
- validacao;
- `submitAuth`;
- `openAuth`;
- `toggleAuthMode`;
- `resetAuthValidation`.

Dependencias explicitas:

- `authMode`;
- `route`;
- callbacks `persistSession`, `refreshAfterAuth`, `goToImportIfPreserved`, `goToRedirectOrMine`;
- `withFeedback`, `showNotice`, `dismissError`, `clearFeedback`.

Cuidados:

- `useAuthSession` continua sendo a fonte da sessao persistida;
- fluxo APKG nao deve ficar escondido dentro de auth sem contrato;
- senha deve continuar sendo limpa depois da tentativa.

### 6.5 `features/library/useDeckManagement.ts`

Responsabilidade:

- deck gerenciado;
- formulario de metadata;
- dirty state;
- cartas paginadas;
- busca de cartas;
- selecao de cartas;
- estado do editor;
- previews sanitizados;
- CRUD de metadata/cartas quando dependencias forem explicitas.

Dependencias explicitas:

- `loadMyDecks`;
- `refreshStats`;
- `navigateToMyDecks`;
- `showNotice`, `showError`, `withFeedback`;
- `api` ou cliente injetavel.

Cuidados:

- nao carregar todas as cartas;
- manter `Set<number>` para selecao;
- manter merge por `Map<number, CardResponse>`;
- manter confirmacoes de descarte/exclusao visiveis na fronteira.

### 6.6 `features/create/useCreateDeckFlow.ts`

Responsabilidade:

- formulario simples de criacao;
- `createDeck`;
- apos criar, carregar meus baralhos, abrir gerenciamento e navegar.

Alternativa:

- pode ficar dentro de `useDeckManagement` se isso reduzir acoplamento. So deve virar composable separado se a criacao comecar a ter ciclo proprio.

### 6.7 `features/import/useApkgImport.ts`

Responsabilidade:

- arquivo APKG selecionado;
- preview, resultado, titulo e visibilidade;
- indice de midia;
- object URLs;
- carta/face atual;
- busca no seletor de preview;
- cancelamento logico por request id;
- limpeza profunda do workflow;
- preservacao controlada durante auth.

Dependencias explicitas:

- `user`;
- `openAuth`;
- `loadMyDecks`;
- `refreshStats`;
- `highlightDeck`;
- `navigateToMyDecks`;
- `showNotice`, `showError`, `withFeedback`.

Cuidados:

- revogar object URLs antes de substituir;
- limpar `File`, `ApkgMediaIndex` e preview ao sair da rota;
- preservar APKG apenas no fluxo "entrar para salvar";
- manter `importSaving` como loading local, nao confundir com loading global.

### 6.8 `features/study/useStudySession.ts`

Responsabilidade:

- fila de estudo;
- titulo da sessao;
- carta atual;
- HTML sanitizado de frente/verso;
- label de vencimento;
- progresso, feedback e resumo;
- estudo anonimo;
- estudo autenticado;
- pratica intercalada;
- revisao atual.

Dependencias explicitas:

- `user`;
- `publicDecks`;
- `loadPublicDecks`;
- `refreshStats`;
- `showNotice`, `withFeedback`;
- `api` ou cliente injetavel.

Cuidados:

- preservar estado local anonimo;
- limitar cache de decks publicos;
- nao buscar stats quando revisao for anonima;
- nao transformar navegacao em efeito escondido do composable.

### 6.9 Helpers Puros

Extrair helpers que podem ser testados sem Vue:

- `studyFeedback.ts`: `ratingLabel`, `intervalLabel`, `studyFeedbackFromResult`;
- `importPreview.ts`: `htmlSummary`, `previewCardOptionLabel`, `previewCardSearchText`;
- `deckFormatters.ts`: `cardCountLabel`, `deckDueLabel`;
- `cardText.ts`: `splitTags`, `mergeCardsPages`, `cardTextSummary` se nao depender de estado.

Cuidados:

- helpers nao devem importar `router`, `api`, componentes ou estado Vue;
- se um helper depender de `user`, `managedCards` ou deck atual, provavelmente ainda e parte do composable.

## 7. Ordem Recomendada

### Etapa 0 - Baseline e Mapa

Objetivo:

- registrar plano;
- confirmar status limpo;
- rodar testes/build antes de mexer no codigo, se o ambiente permitir.

Validacao:

- `npm test`;
- `npm run build`.

### Etapa 1 - Helpers Puros

Objetivo:

- extrair funcoes sem efeito colateral;
- adicionar testes unitarios pequenos.

Arquivos provaveis:

- `features/study/studyFeedback.ts`;
- `features/import/importPreview.ts`;
- `features/library/deckFormatters.ts`;
- `features/library/cardText.ts`.

Risco:

- baixo, desde que os imports sejam trocados sem alterar comportamento.

### Etapa 2 - Stats e Navegacao de App

Objetivo:

- extrair `useStatsSummary`;
- extrair derivacoes de shell/navegacao que nao carregam dados.

Risco:

- baixo a medio, porque o titulo atual depende do deck gerenciado.

Regra:

- nenhum composable desta etapa deve chamar API de biblioteca, estudo ou importacao.

### Etapa 3 - Gerenciamento de Deck e Cartas

Objetivo:

- extrair `useDeckManagement`;
- reduzir o maior bloco restante de biblioteca;
- manter `useDeckLibrary` como esta;
- deixar o App apenas conectando biblioteca, stats, router e feedback.

Risco:

- medio/alto, porque envolve CRUD, dirty state, selecao, editor e upload.

Validacao manual:

- abrir gerenciamento por lista e por URL;
- editar metadata;
- buscar cartas;
- carregar mais;
- selecionar/desmarcar cartas;
- excluir uma carta;
- excluir varias cartas;
- criar e editar carta;
- upload de imagem/audio.

### Etapa 4 - Importacao APKG

Objetivo:

- extrair estado pesado e limpeza de memoria para `useApkgImport`;
- preservar fluxo "entrar para salvar";
- manter object URLs sob ownership claro.

Risco:

- alto, por memoria e corrida assincrona.

Validacao manual:

- preview APKG sem midia;
- preview APKG com midia;
- trocar carta e face;
- sair da rota e verificar limpeza funcional;
- entrar para salvar e voltar;
- salvar importacao e destacar deck.

### Etapa 5 - Estudo

Objetivo:

- extrair `useStudySession`;
- preservar estudo anonimo e autenticado;
- preservar pratica intercalada;
- preservar resumo e feedback final.

Risco:

- medio/alto, porque cruza localStorage, backend, stats e cache publico.

Validacao manual:

- estudar deck publico anonimo;
- estudar deck autenticado;
- pratica intercalada;
- revisar cartas com todos os ratings;
- finalizar sessao;
- sair e voltar para estudo.

### Etapa 6 - Auth Flow

Objetivo:

- extrair formulario e workflow de auth depois que importacao ja tiver contrato claro.

Risco:

- medio, por redirects e preservacao de importacao.

Regra:

- nao mover antes de APKG estar estabilizado.

### Etapa 7 - Revisao Final do Composition Root

Objetivo:

- remover imports mortos;
- revisar providers;
- revisar watchers;
- garantir que `App.vue` ficou legivel como integrador;
- documentar decisoes que sobraram.

Meta qualitativa:

- `App.vue` deve ser lido de cima para baixo como montagem de subsistemas, nao como implementacao dos subsistemas.

## 8. Guardrails

Fazer:

- manter rotas, textos e UX estaveis;
- preservar componentes visuais controlados por props/eventos;
- manter HTML de cartas passando por sanitizacao existente;
- preferir callbacks nomeados a objetos de dependencia grandes;
- deixar lateralidades explicitas nos nomes;
- manter estado derivado como `computed`;
- manter timers e object URLs com limpeza no mesmo dominio;
- adicionar testes para helpers e regras puras;
- validar build depois de cada etapa relevante.

Nao fazer:

- introduzir Pinia/store global so para organizar;
- mover dados pesados para singleton global;
- passar `router` inteiro para composables quando um callback basta;
- esconder atualizacao de stats em composable de biblioteca ou importacao sem nome claro;
- duplicar estado entre `App.vue` e composables;
- criar watchers que disparam rede sem ownership explicito;
- carregar todas as cartas de um deck para simplificar codigo;
- alterar regras de SRS como efeito colateral da refatoracao;
- alterar endpoints de API nesta frente, salvo bug descoberto e documentado.

## 9. Controle de Carga Computacional

Regras a preservar:

- decks e cartas continuam paginados;
- buscas continuam debounceadas;
- preview HTML deve ser calculado apenas para a carta/face atual;
- selecao multipla continua usando `Set`;
- merge de paginas continua removendo duplicatas por id;
- APKG continua com cancelamento logico por contador de request;
- object URLs sao revogados antes de perder referencia;
- cache anonimo de decks publicos continua limitado;
- stats so recarrega quando a acao altera progresso ou quando a rota de progresso exige.

Sinais de alerta:

- composable de importacao importando componente visual;
- composable de biblioteca chamando API de estudo;
- composable de estudo manipulando router diretamente sem decisao explicita;
- App.vue continuando com blocos longos de estado duplicado;
- aumento de chamadas de rede apos salvar/excluir;
- importacao preservada fora do fluxo auth intencional.

## 10. Testes e Validacao

Comandos frontend:

```txt
cd frontend
npm test
npm run build
```

Testes unitarios recomendados:

- `studyFeedback.test.ts`;
- `importPreview.test.ts`;
- `deckFormatters.test.ts`;
- `cardText.test.ts`;
- `useDeckManagement.test.ts`, se a fronteira ficar testavel sem montar componentes;
- `useApkgImport.test.ts`, pelo menos para limpeza/labels quando mocks forem simples.

E2E/manual:

- manter E2E existente como rede de seguranca;
- validar manualmente APKG e editor de carta, porque sao fluxos com memoria local, arquivo e midia.

## 11. Criterios de Aceite

Funcionais:

- nenhuma rota muda;
- login/logout continuam funcionando;
- biblioteca publica e meus baralhos continuam carregando, buscando e paginando;
- salvar deck publico continua copiando, navegando e destacando;
- gerenciamento de deck/cartas preserva CRUD, busca, selecao e editor;
- importacao APKG preserva preview, midia, auth redirect e limpeza;
- estudo anonimo e autenticado continuam funcionando;
- pratica intercalada continua funcionando;
- progresso continua atualizando apos revisoes relevantes.

Arquiteturais:

- `App.vue` deixa de conter implementacoes longas de dominio;
- composables de dominio moram em `features/*`;
- infraestrutura compartilhada fica em `composables/*` ou `app/*`;
- route contexts continuam como contrato entre provider e route adapters;
- efeitos transversais aparecem por callbacks nomeados;
- estado pesado vive perto da limpeza correspondente;
- nenhum singleton global novo e introduzido.

Computacionais:

- sem carregamento integral de cartas;
- sem object URLs vazando;
- sem timers vivos apos unmount;
- sem duplicacao de requests por watchers duplicados;
- sem crescimento ilimitado de cache anonimo.

## 12. Decisao Inicial

A primeira implementacao deve comecar por helpers puros e depois por `useDeckManagement`.

Justificativa:

- helpers puros reduzem ruido com baixo risco;
- gerenciamento de deck/cartas e o maior bloco restante dentro do `App.vue`;
- `useDeckLibrary` ja existe, entao a extracao de gerenciamento completa a fronteira da Biblioteca;
- importacao APKG deve vir depois, porque tem o ciclo de memoria mais delicado.

Sequencia curta recomendada para o primeiro PR desta branch:

1. extrair helpers puros de estudo/importacao/biblioteca;
2. criar testes para helpers;
3. extrair `useDeckManagement`;
4. manter `App.vue` como orquestrador de dependencias transversais;
5. rodar `npm test` e `npm run build`;
6. validar manualmente gerenciamento de baralho/cartas.
