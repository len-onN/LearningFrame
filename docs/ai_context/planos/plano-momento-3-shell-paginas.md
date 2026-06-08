# Planejamento do Momento 3: Shell e Paginas

**Status:** investigacao e desenho arquitetural antes da implementacao.
**Branch de planejamento:** `codex/frontend-page-shell-plan`
**Branch de implementacao recomendada:** `codex/frontend-page-shell`
**Base:** `frontend-refactor`
**Destino do PR:** `frontend-refactor`
**Dependencia concluida:** Momento 2, com `vue-router`, rotas reais e navegacao derivada da rota.

## 1. Estamos no Final?

Ainda nao.

O projeto ja passou por duas viradas importantes:
- Momento 1: contratos leves de backend para rotas diretas;
- Momento 2: roteamento principal no frontend.

Isso removeu dois bloqueios estruturais. Porem o `App.vue` continua concentrando a maior parte da aplicacao. Ele agora esta melhor orientado por rota, mas ainda mistura:
- shell visual;
- sidebar;
- topbar;
- notificacoes;
- formularios;
- templates das paginas;
- orquestracao de dados;
- efeitos de ciclo de vida;
- handlers de negocio;
- estados temporarios pesados.

Depois do Momento 3 ainda restam, no minimo:
- Momento 4: modulo Biblioteca;
- Momento 5: modulos Importacao e Estudo;
- Momento 6: composables de dominio;
- Momento 7: politica fina de ciclo de vida e memoria.

O Momento 3 deve ser uma etapa de separacao visual e estrutural, nao uma reescrita de estado.

## 2. Objetivo do Momento 3

Extrair o shell da aplicacao e paginas principais preservando comportamento visual e funcional.

Objetivos:
- reduzir o tamanho do template do `App.vue`;
- criar fronteiras de tela que os momentos seguintes possam refinar;
- deixar `App.vue` como orquestrador temporario;
- manter estado, chamadas API e regras de negocio majoritariamente onde estao;
- evitar introduzir store global ou composables de dominio antes da hora;
- manter build, testes e fluxo containerizado funcionando a cada fatia.

Nao objetivos:
- componentizar internamente a biblioteca;
- quebrar o editor de carta em subcomponentes finos;
- mover regras de importacao APKG para composable;
- mover estudo para composable;
- resolver cache, abort de requests e limpeza profunda de memoria;
- criar Pinia;
- alterar contratos de backend;
- redesenhar a UI.

## 3. Estado Atual Pos-Momento 2

### 3.1 Arquivos Frontend

Arquivos relevantes:
- `frontend/src/App.vue`: aproximadamente 2077 linhas;
- `frontend/src/main.ts`: registra `App` e `router`;
- `frontend/src/router/index.ts`: mapa de rotas, meta e guard simples;
- `frontend/src/services/api.ts`: fronteira HTTP;
- `frontend/src/types/api.ts`: tipos de payload;
- `frontend/src/assets/styles.css`: estilos globais;
- `frontend/src/utils/*`: utilitarios ja separados.

Ainda nao existem:
- `layouts/`;
- `pages/`;
- `components/`;
- `features/`;
- composables de dominio.

### 3.2 Responsabilidades do App.vue

O `App.vue` hoje concentra:
- tipos locais (`Tab`, `LibrarySection`, `LibraryView`, `ThemePreference`, `PreviewFace`, `CardEditorMode`, `CardEditorFace`);
- estado global leve: usuario, tema, sidebar, notificacoes, loading;
- estado de biblioteca: listas, paginas, busca, highlight;
- estado de gerenciamento: baralho, metadata form, cartas, selecao, editor;
- estado de importacao: arquivo, preview, midia, card atual, salvamento;
- estado de estudo: fila, carta atual, resposta visivel;
- estado de auth: formulario, touched, errors;
- estado de progresso: stats;
- watchers de busca, rota e limpeza;
- funcoes de API e workflow;
- todo o template das superficies.

O Momento 2 melhorou a navegacao:
- `tab`, `librarySection`, `libraryView` e `authMode` sao derivados da rota;
- sidebar usa `RouterLink custom`;
- rotas privadas redirecionam para login;
- gerenciamento direto usa `api.deckMetadata` + `api.deckCards`.

Mas o arquivo ainda mistura UI e orquestracao.

## 4. Principio de Extracao

O Momento 3 deve seguir uma regra simples:

**Extrair estrutura visual antes de extrair regra de negocio.**

Na pratica:
- componentes novos devem ser majoritariamente apresentacionais;
- `App.vue` continua dono do estado e dos handlers;
- filhos recebem props e emitem eventos;
- nao mover chamadas API para dentro das paginas nesta etapa;
- nao criar provide/inject para escapar de props;
- nao criar stores globais;
- nao duplicar estado local dentro de paginas filhas.

Isso parece menos ambicioso, mas reduz risco. A refatoracao fica revisavel e prepara o terreno para os momentos 4, 5 e 6.

## 5. Estrutura Recomendada

Criar a estrutura:

```txt
frontend/src/
  layouts/
    AppShell.vue
  pages/
    AuthPage.vue
    LibraryPage.vue
    StudyPage.vue
    ImportPage.vue
    CreateDeckPage.vue
    ProgressPage.vue
  components/
    AppStatus.vue
```

Observacao:
- `components/AppStatus.vue` e opcional. Se o `AppShell` ficar simples o bastante, status pode ficar dentro dele.
- `CardEditorOverlay.vue` deve ser avaliado com cuidado. Ele pode ficar para o Momento 4, porque esta intimamente ligado ao gerenciamento de cartas.

## 6. O Que Extrair Agora

### 6.1 AppShell

Extrair agora.

Responsabilidades:
- layout `.app-shell`;
- sidebar;
- brand button;
- collapse/expand da sidebar;
- nav principal;
- botao de pratica intercalada;
- usuario/login/logout no rodape da sidebar;
- topbar;
- toggle de tema;
- titulo atual;
- area de status;
- slot para pagina ativa.

Props provaveis:
- `sidebarCollapsed`;
- `visibleTabs`;
- `activeTab`;
- `currentTitle`;
- `themePreference`;
- `nextThemeLabel`;
- `sidebarToggleLabel`;
- `user`;
- `userDisplayName`;
- `loading`;
- `loadingMessage`;
- `notice`;
- `error`.

Eventos provaveis:
- `go-home`;
- `toggle-sidebar`;
- `toggle-theme`;
- `start-interleaved`;
- `login`;
- `logout`;
- `dismiss-notice`;
- `dismiss-error`.

Lateralidades:
- precisa importar icones atualmente usados no shell;
- precisa continuar usando `RouterLink custom`;
- nao deve conhecer detalhes de biblioteca, estudo ou importacao;
- nao deve chamar API;
- nao deve modificar rota diretamente, exceto via eventos para o pai.

### 6.2 AuthPage

Extrair agora.

Motivo:
- superficie relativamente pequena;
- baixo acoplamento com outras telas;
- ja recebe `authMode` da rota;
- validacao continua no pai.

Responsabilidades:
- formulario de login/cadastro;
- campos;
- mensagens de validacao;
- botoes de submit/toggle/fechar.

Dados:
- `authMode`;
- `authForm`;
- erros por campo;
- informacao de touched/submitted pode continuar sendo resolvida por funcoes do pai.

Melhor pratica:
- evitar mutar props diretamente;
- usar `v-model`/`defineModel` por campo ou emitir eventos `update:*`;
- se o diff ficar grande demais, aceitar uma primeira extracao com handlers do pai, mas sem mover regra.

Eventos:
- `submit`;
- `close`;
- `toggle-mode`;
- `touch-field`;
- updates dos campos.

### 6.3 StudyPage

Extrair agora como pagina visual.

Motivo:
- a UI de estudo e pequena;
- estudo profundo vira modulo no Momento 5;
- agora basta separar a superficie.

Props:
- `sessionTitle`;
- `queueLength`;
- `currentCard`;
- `frontHtml`;
- `backHtml`;
- `answerVisible`;
- `currentDueLabel`.

Eventos:
- `start-interleaved`;
- `reveal-answer`;
- `review`.

Cuidados:
- manter `v-html` recebendo HTML ja sanitizado por `safeStudyHtml`;
- nao mover `reviewCurrent`, `loadStudyDeck`, `loadInterleavedPractice` nesta etapa;
- nao criar estado local de fila no componente.

### 6.4 CreateDeckPage

Extrair agora.

Motivo:
- superficie pequena;
- bom ganho de legibilidade;
- comportamento simples.

Props/modelos:
- `deckForm.title`;
- `deckForm.description`;
- `deckForm.visibility`;
- `user`.

Eventos:
- `submit`;
- updates dos campos.

Cuidados:
- nao mudar o fluxo de criacao;
- manter rota privada pelo router.

### 6.5 ProgressPage

Extrair agora.

Motivo:
- superficie simples e isolada.

Props:
- `user`;
- `stats`.

Eventos:
- nenhum obrigatorio.

Dependencias:
- `formatDueIn` pode continuar no pai e passar label pronto, ou o componente pode importar o utilitario.

Recomendacao:
- o componente pode importar `formatDueIn`, pois e utilitario puro e nao regra de orquestracao.

### 6.6 ImportPage

Extrair com cautela, mas pode entrar no Momento 3 se a extracao for apenas visual.

Motivo a favor:
- e uma pagina principal;
- removeria um bloco grande do `App.vue`.

Risco:
- muita dependencia de estado temporario pesado;
- file input precisa preservar o comportamento de limpar `input.value`;
- preview APKG usa object URLs e midia local;
- importacao profunda esta prevista para o Momento 5.

Recomendacao:
- extrair `ImportPage.vue` apenas como componente controlado;
- manter `handleApkgChange`, `persistImport`, `showPreviewCard`, `readPreviewMediaUrls`, `revokePreviewMediaUrls` no pai;
- o filho pode emitir o evento bruto de `change` do input, mantendo a limpeza atual no handler do pai.

Props:
- `selectedFile`;
- `loading`;
- `importPreview`;
- `currentPreviewCard`;
- `previewCardIndex`;
- `previewFace`;
- `previewPickerOpen`;
- `previewCardSearch`;
- `previewCardOptions`;
- `currentPreviewHtml`;
- `importTitle`;
- `importVisibility`;
- `user`.

Eventos:
- `file-change`;
- `toggle-picker`;
- `update-preview-search`;
- `select-preview-card`;
- `move-preview-card`;
- `toggle-preview-face`;
- `persist-import`;
- updates de titulo/visibilidade.

Ponto de corte:
- se a quantidade de props ficar grande demais, adiar `ImportPage` para o Momento 5 e documentar a decisao.

### 6.7 LibraryPage

Extrair com cautela minima, sem componentizar internamente.

Motivo:
- e a maior superficie do app;
- precisa sair do `App.vue` em algum momento;
- o Momento 4 sera dedicado a quebrar biblioteca internamente.

Risco:
- virar um componente enorme que apenas move o problema;
- gerar muitos props/eventos;
- misturar extracao de pagina com componentizacao fina de deck/card.

Recomendacao:
- no Momento 3, extrair `LibraryPage.vue` como pagina de superficie, mantendo a estrutura interna praticamente igual;
- nao criar ainda `DeckList`, `DeckCard`, `ManageDeckView`, `CardBrowser`, `CardPreview` ou `CardEditorOverlay`;
- deixar essa decomposicao para o Momento 4;
- manter o `CardEditorOverlay` no `App.vue` ou, se for extraido, documentar que e apenas uma separacao visual.

Props provaveis:
- `librarySection`;
- `libraryView`;
- `librarySearch`;
- `activeLibraryCountLabel`;
- `publicDecks`;
- `myDecks`;
- `publicDecksHasMore`;
- `myDecksHasMore`;
- `user`;
- `managedDeck`;
- `managedDeckForm`;
- `managedDeckDirty`;
- `managedCards`;
- `managedCardsSearch`;
- `managedCardsHasMore`;
- `managedCardsCountLabel`;
- `selectedManagedCard`;
- `selectedManagedCardId`;
- `selectedManagedCardIds`;
- `selectedManagedCardsCount`;
- `allVisibleManagedCardsSelected`;
- `selectedManagedCardFrontPreview`;
- `selectedManagedCardBackPreview`;
- `highlightedDeckId`.

Eventos provaveis:
- navegar para publicos/meus;
- atualizar busca;
- refresh;
- estudar deck;
- salvar publico;
- carregar mais publicos;
- carregar mais meus;
- abrir gerenciador;
- voltar do gerenciador;
- salvar/deletar deck;
- atualizar form de metadata;
- criar carta;
- buscar cartas;
- selecionar pagina;
- limpar selecao;
- excluir selecionadas;
- selecionar carta;
- alternar selecao de carta;
- carregar mais cartas;
- editar/deletar carta.

Como reduzir explosao de props:
- agrupar dados em objetos de view model no `App.vue`, por exemplo:
  - `libraryListView`;
  - `managedDeckView`;
  - `managedCardsView`;
- agrupar handlers em objetos, por exemplo:
  - `libraryActions`;
  - `managedDeckActions`;
  - `managedCardsActions`.

Cuidados:
- objetos de actions podem ser criados como constantes/funcoes simples;
- nao criar um "mega objeto" opaco demais;
- manter nomes claros para facilitar futura quebra no Momento 4.

## 7. O Que Nao Extrair Agora

### 7.1 Composables de Dominio

Adiar.

Nao criar ainda:
- `useAuth`;
- `useDeckLibrary`;
- `useDeckManagement`;
- `useApkgImport`;
- `useStudySession`;
- `useNotifications`.

Motivo:
- o Momento 3 deve separar template/shell;
- composables mudam fronteiras de estado e efeitos;
- isso pertence aos momentos 5 e 6.

### 7.2 CardEditorOverlay

Preferencia: adiar para Momento 4.

Motivo:
- depende de gerenciamento de baralho;
- usa refs de textarea e input de midia;
- tem fluxo de upload;
- esta ligado ao browser/preview de cartas.

Se for extraido no Momento 3:
- manter apenas como componente controlado;
- nao mover upload nem save;
- expor eventos bem claros;
- validar foco e upload de midia manualmente.

### 7.3 Estilos

Nao mover estilos agora.

Manter `frontend/src/assets/styles.css` como esta.

Motivo:
- mover CSS junto com componentes aumenta risco visual;
- a UI atual esta estabilizada;
- CSS modular pode ser avaliado depois se virar dor real.

## 8. Sequencia Recomendada de Implementacao

### Passo 1 - Preparar Estrutura

Criar:
- `frontend/src/layouts/AppShell.vue`;
- `frontend/src/pages/`;
- opcionalmente `frontend/src/components/AppStatus.vue`.

Sem alterar comportamento.

Validar:
- build.

### Passo 2 - Extrair AppShell

Mover do template:
- `<div class="app-shell">`;
- `<aside class="sidebar">`;
- `<main class="workspace">`;
- topbar;
- loading/notice/error;
- slot default para pagina ativa.

`App.vue` passa a usar:

```vue
<AppShell ...>
  <!-- pagina ativa aqui -->
</AppShell>
```

Aceite:
- UI visualmente igual;
- sidebar funciona;
- tema funciona;
- login/logout no rodape funciona;
- status aparece e fecha.

### Passo 3 - Extrair Paginas Simples

Extrair nesta ordem:
1. `ProgressPage`;
2. `CreateDeckPage`;
3. `StudyPage`;
4. `AuthPage`.

Motivo:
- do menor risco para maior interacao.

Aceite:
- rotas continuam funcionando;
- forms continuam editaveis;
- review de estudo continua funcionando;
- login/cadastro mantem validacao.

### Passo 4 - Avaliar ImportPage

Extrair `ImportPage` se a interface de props/eventos ficar legivel.

Se ficar excessiva:
- registrar adiamento para Momento 5;
- nao forcar.

Aceite se extrair:
- selecionar APKG;
- preview;
- busca no seletor de cartas;
- alternar frente/verso;
- salvar APKG logado;
- login para salvar preservando preview durante navegacao interna.

### Passo 5 - Extrair LibraryPage Superficial

Extrair `LibraryPage` sem quebrar subcomponentes internos.

Aceite:
- publicos/meus;
- busca e carregar mais;
- salvar para mim;
- gerenciar deck;
- rota direta de gerenciamento;
- metadata;
- cartas paginadas;
- selecao multipla;
- preview de carta;
- fallback `Carta 1`, `Carta 2`;
- edicao/exclusao existentes.

### Passo 6 - Revisao de Props e Eventos

Depois das extracoes:
- revisar se algum componente esta mutando prop diretamente;
- revisar nomes de eventos;
- agrupar props se houver excesso gritante;
- evitar abstrair antes de enxergar duplicacao real.

### Passo 7 - Validacao

Obrigatoria:
- `npm run build` em container Node;
- `npm test` em container Node;
- refresh direto pelo Nginx em rotas principais;
- validacao manual minima no browser.

## 9. Lateralidades

### 9.1 Router

O router nao deve mudar no Momento 3.

Lateralidade esperada:
- componentes filhos recebem rotas via props/eventos, nao devem chamar `useRouter` por conta propria, exceto se houver justificativa forte.

Motivo:
- manter `App.vue` como orquestrador temporario;
- evitar navegacao espalhada antes da componentizacao por dominio.

### 9.2 API

Nao alterar `api.ts`.

Chamadas continuam no pai:
- biblioteca;
- gerenciamento;
- estudo;
- importacao;
- auth;
- stats.

Motivo:
- mover chamadas API junto com template tornaria o diff mais arriscado;
- a extracao de composables vem depois.

### 9.3 Tipos

Pode ser necessario criar tipos de props locais.

Boas praticas:
- se o tipo for usado por varios componentes, criar `frontend/src/types/ui.ts`;
- se for usado por uma pagina apenas, declarar no proprio componente;
- evitar types gigantes que escondem o contrato.

### 9.4 CSS

Manter classes existentes.

Cuidados:
- evitar renomear classes;
- evitar mover estilos;
- verificar responsividade em mobile/desktop se qualquer wrapper novo afetar layout.

### 9.5 Acessibilidade

Manter:
- `aria-label`;
- `aria-selected`;
- `title`;
- foco dos inputs;
- botoes com icones e texto onde ja existe;
- `RouterLink custom` preservando semantica atual.

Ponto sensivel:
- `AuthPage` e `CardEditorOverlay` usam controles de formulario; nao quebrar ids e `aria-describedby`.

### 9.6 Memoria

Momento 3 nao resolve memoria profunda, mas nao deve piorar.

Preservar:
- `revokePreviewMediaUrls` no `onBeforeUnmount`;
- limpeza de timers;
- fechamento de editor ao sair da biblioteca;
- `closeManagedDeck(true, false)` ao sair de gerenciamento.

Nao criar:
- copias locais de `importPreview`;
- copias locais de `managedCards`;
- copias locais de `studyQueue`.

### 9.7 Testes

Hoje existem testes de utilitarios, nao testes de componente.

No Momento 3:
- build e testes existentes sao obrigatorios;
- testes de componente podem ser avaliados, mas nao devem bloquear a refatoracao se exigirem infraestrutura extra.

Se criar helpers de view model puros, adicionar testes unitarios leves pode valer a pena.

### 9.8 Container

Como nao ha dependencia nova prevista, nao deve ser necessario rebuild do backend.

Frontend:
- `frontend-builder` deve recompilar em watch;
- se watch falhar, rodar build pontual em container Node;
- Nginx ja serve `dist` montado.

## 10. Criterios de Aceite

Obrigatorios:
- `AppShell` extraido;
- pelo menos as paginas simples extraidas;
- `App.vue` menor e mais focado em orquestracao;
- visual preservado;
- rotas do Momento 2 preservadas;
- sem nova dependencia;
- sem alteracao de backend;
- sem store global;
- sem composables de dominio;
- build frontend passando;
- testes frontend passando;
- diario de bordo atualizado.

Desejaveis:
- `LibraryPage` extraida superficialmente;
- `ImportPage` extraida se nao gerar contrato ilegivel;
- props agrupadas em view models quando reduzir ruido;
- nenhum componente com mais responsabilidade do que a superficie visual que representa.

Nao obrigatorios:
- quebrar biblioteca em componentes finos;
- quebrar editor de cartas;
- mover logica APKG;
- mover estudo para composable;
- criar testes de componente.

## 11. Riscos e Mitigacoes

Risco: apenas mover o monolito para varios arquivos grandes.
Mitigacao: extrair paginas como fronteiras de superficie e deixar decomposicao fina para momentos dedicados.

Risco: props demais em `LibraryPage`.
Mitigacao: agrupar view models e actions, ou adiar parte da biblioteca para Momento 4.

Risco: componentes filhos passarem a mutar props.
Mitigacao: usar eventos e `v-model` controlado para formularios.

Risco: quebrar fluxo de arquivo APKG.
Mitigacao: manter handler no pai e passar evento bruto se `ImportPage` for extraida.

Risco: quebrar foco/upload no editor de carta.
Mitigacao: preferir nao extrair `CardEditorOverlay` neste momento.

Risco: mudar comportamento visual por wrappers novos.
Mitigacao: manter classes existentes e validar no browser.

Risco: introduzir navegacao espalhada.
Mitigacao: filhos emitem eventos; pai segue controlando router.

## 12. Ordem Recomendada de Commits

Commit 1:
- `refactor(frontend): extrai shell da aplicacao`

Commit 2:
- `refactor(frontend): extrai paginas simples`

Commit 3:
- `refactor(frontend): extrai superficies de biblioteca e importacao`

Commit 4, se necessario:
- `docs(frontend): registra validacoes do momento 3`

Se o diff ficar menor do que o esperado, um commit unico tambem e aceitavel. Ainda assim, a preferencia e separar shell de paginas.

## 13. Proxima Acao

Implementar o Momento 3 em `codex/frontend-page-shell`, com a seguinte primeira fatia:
1. criar `AppShell.vue`;
2. mover sidebar/topbar/status;
3. validar build;
4. extrair `ProgressPage` e `CreateDeckPage`;
5. validar de novo;
6. seguir para `StudyPage` e `AuthPage`;
7. decidir, com base no diff real, se `ImportPage` e `LibraryPage` entram nesta branch ou se a biblioteca fica para o Momento 4.
