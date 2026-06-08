# Planejamento do Momento 4: Biblioteca, Importacao e Editor

**Status:** investigacao e desenho arquitetural antes da implementacao.
**Branch de planejamento:** `codex/frontend-library-import-plan`
**Branch de implementacao recomendada:** `codex/frontend-library-import-surfaces`
**Base:** `frontend-refactor`
**Destino do PR:** `frontend-refactor`
**Dependencia concluida:** Momento 3, com `AppShell` e paginas simples extraidas.

## 1. Objetivo

Separar as superficies restantes que ainda mantem o `App.vue` grande demais:
- Biblioteca publica e Meus baralhos;
- gerenciamento de baralho;
- browser/preview/selecao de cartas;
- Importacao APKG;
- avaliacao cuidadosa do `CardEditorOverlay`.

O objetivo e reduzir o acoplamento visual sem reescrever regra de negocio, preservando o comportamento validado no MVP.

Nao objetivos:
- alterar endpoints do backend;
- alterar o mapa de rotas;
- introduzir Pinia/store global;
- mover chamadas API para dentro dos componentes visuais;
- resolver toda a politica futura de cache/memoria;
- redesenhar a UX;
- trocar o fluxo de "carregar mais" por virtualizacao nesta etapa.

## 2. Estado Atual Confirmado

Depois do Momento 3:
- `frontend/src/App.vue` tem cerca de 1864 linhas;
- `frontend/src/layouts/AppShell.vue` concentra shell, sidebar, topbar e feedbacks;
- `frontend/src/pages/AuthPage.vue`, `StudyPage.vue`, `CreateDeckPage.vue` e `ProgressPage.vue` ja existem;
- `frontend/src/router/index.ts` ja fornece rotas reais e route guard simples;
- Biblioteca, Importacao e `CardEditorOverlay` continuam no `App.vue`;
- estado, watchers, chamadas API e workflows seguem centralizados no `App.vue`.

Blocos de template ainda no `App.vue`:
- Biblioteca: listas publica/meus, busca, carregar mais, salvar para mim;
- gerenciamento: metadata do deck, cartas, busca, selecao multipla, preview;
- Importacao: upload APKG, preview, picker de cartas, midias locais, salvar;
- `CardEditorOverlay`: form de frente/verso, preview, upload de midia e insercao no cursor.

Estados sensiveis ainda no `App.vue`:
- `publicDecks`, `myDecks`, paginas e query atual;
- `managedDeck`, `managedDeckForm`, `managedCards`, pagina de cartas e selecoes;
- `cardEditorForm`, refs de textarea/input e estado de upload;
- `selectedFile`, `importPreview`, `previewMediaIndex`, `previewMediaUrls`;
- timers de busca e highlight.

## 3. Diagnostico Arquitetural

### 3.1 Biblioteca

A Biblioteca hoje mistura quatro responsabilidades:
- navegacao entre publicos/meus/gerenciamento;
- listas paginadas de decks;
- gerenciamento de metadata do deck;
- gerenciamento paginado de cartas.

O backend ja fornece contratos adequados:
- `GET /api/decks/public?page&size&q`;
- `GET /api/decks/mine?page&size&q`;
- `GET /api/decks/{deckId}/metadata`;
- `GET /api/decks/{deckId}/cards?page&size&q`;
- endpoints de criacao/edicao/exclusao/copia de deck e cartas.

Conclusao:
- nao ha necessidade de reestruturar backend para o Momento 4;
- a rota direta de gerenciamento ja esta coberta pelo contrato leve de metadata;
- a refatoracao deve ser de superficie/componentes.

### 3.2 Importacao APKG

A Importacao e a area mais sensivel para memoria:
- `selectedFile` mantem referencia ao arquivo original;
- `createApkgMediaIndex(file)` cria indice local para midia;
- `previewMediaUrls` usa `URL.createObjectURL`;
- `resetImportPreviewState()` revoga URLs, mas hoje nao e chamado automaticamente ao sair de `/importar`;
- a excecao atual e o fluxo anonimo "Entrar para salvar", que precisa preservar o preview durante login/cadastro.

Conclusao:
- a extracao de `ImportPage` deve vir junto de uma politica explicita de ciclo de vida;
- ao sair de `/importar`, limpar arquivo, preview, indice e object URLs;
- se o destino for login/cadastro por causa de `returnToImportAfterAuth`, preservar o estado;
- apos salvar com sucesso, limpar tudo como ja ocorre hoje.

### 3.3 CardEditorOverlay

O editor de cartas e acoplado a:
- `managedDeck`;
- `cardEditorForm` e dirty state;
- refs de textarea para foco e cursor;
- upload de midia;
- insercao de marcador no ponto do cursor;
- preview sanitizado.

Conclusao:
- extrair o overlay e desejavel, mas deve ser uma fatia propria dentro do Momento 4;
- se for extraido junto com `LibraryPage`, o risco de diff grande sobe bastante;
- melhor separar em duas implementacoes ou dois commits bem claros.

## 4. Estrategia Recomendada

Usar um hibrido:
- componentes de pagina/feature controlados por props, `v-model` e eventos;
- view models pequenos para reduzir excesso de props;
- workflows, API, roteamento e estado central continuam no `App.vue` nesta etapa;
- limpeza de memoria da Importacao entra como ajuste de ciclo de vida, nao como composable completo.

Esta estrategia evita dois extremos:
- apenas mover o monolito para `LibraryPage.vue`;
- reescrever estado/API/composables antes de estabilizar as fronteiras visuais.

## 5. Estrutura Proposta

Criar gradualmente:

```txt
frontend/src/
  pages/
    LibraryPage.vue
    ImportPage.vue
  features/
    library/
      DeckListPanel.vue
      DeckManagementView.vue
      ManagedCardsBrowser.vue
      ManagedCardPreview.vue
      libraryTypes.ts
    import/
      ImportPreviewPicker.vue
      importTypes.ts
```

Opcional, em fatia separada:

```txt
frontend/src/features/library/
  CardEditorOverlay.vue
```

Manter por enquanto:
- `api.ts` sem alteracoes;
- `router/index.ts` sem alteracoes;
- `styles.css` como fonte global de estilos;
- `App.vue` como orquestrador temporario.

## 6. Plano de Implementacao Detalhado

### Passo 1 - Tipos de View Model

Criar tipos leves para dados de tela:
- `LibraryDeckListsView`;
- `DeckManagementViewState`;
- `ManagedCardsViewState`;
- `ImportPreviewViewState`.

Cuidados:
- nao criar DTOs de backend duplicados;
- nao criar objeto gigante com tudo;
- preferir tipos por area de tela;
- manter tipos de dominio em `frontend/src/types/api.ts`.

Aceite:
- build continua passando;
- sem mudanca visual.

### Passo 2 - Extrair `LibraryPage.vue`

Mover a moldura da Biblioteca:
- abas Publicos/Meus;
- toolbar de busca e atualizar;
- alternancia entre lista de decks e gerenciamento;
- encaminhamento de props/eventos para subcomponentes.

`LibraryPage` nao deve:
- chamar `api`;
- chamar `useRouter`;
- decidir permissao de auth;
- manter copia local de decks/cartas.

Eventos esperados:
- `go-public`;
- `go-mine`;
- `refresh`;
- `update:search`;
- `start-deck`;
- `save-public-deck`;
- `load-more-public`;
- `load-more-mine`;
- `open-managed-deck`;
- eventos vindos do gerenciamento.

Aceite:
- tabs de biblioteca funcionam;
- busca continua debounceada no pai;
- carregar mais continua igual;
- salvar para mim continua igual;
- login CTA em Meus baralhos continua igual.

### Passo 3 - Extrair Listas de Decks

Criar `DeckListPanel.vue` para reduzir duplicacao entre publicos e meus.

Props:
- `decks`;
- `emptyMessage`;
- `hasMore`;
- `highlightedDeckId`;
- `showSaveAction`;
- `showManageAction`;

Eventos:
- `start`;
- `save`;
- `manage`;
- `load-more`;

Cuidados:
- preservar `data-deck-id` para `highlightDeck`;
- preservar altura uniforme dos cards;
- preservar textos e botoes existentes.

Aceite:
- meus baralhos e publicos mantem layout;
- highlight apos importar/copiar continua funcionando.

### Passo 4 - Extrair Gerenciamento de Baralho

Criar `DeckManagementView.vue`, que recebe:
- `managedDeck`;
- `managedDeckForm`;
- `managedDeckDirty`;
- estado de cartas;
- previews ja sanitizados;
- selecoes.

`DeckManagementView` pode renderizar:
- form de metadata;
- `ManagedCardsBrowser`;
- `ManagedCardPreview`.

Eventos:
- `back`;
- `save-deck`;
- `delete-deck`;
- `update:deck-title`;
- `update:deck-description`;
- `update:deck-visibility`;
- `create-card`;
- `search-cards`;
- `toggle-page-selection`;
- `clear-selection`;
- `delete-selected`;
- `select-card`;
- `toggle-card-selection`;
- `load-more-cards`;
- `edit-card`;
- `delete-card`.

Cuidados:
- nao alterar o modelo de busca de cartas;
- nao carregar todas as cartas;
- manter fallback visual `Carta 1`, `Carta 2`;
- manter selecao multipla por `Set<number>` no pai;
- nao copiar `managedCards` para estado local.

Aceite:
- rota direta `/biblioteca/meus/:deckId/gerenciar` funciona;
- metadata carrega via endpoint leve;
- cartas paginam e filtram;
- selecao multipla funciona;
- preview de carta continua sanitizado;
- exclusao individual e em lote funcionam.

### Passo 5 - Avaliar Extracao do `CardEditorOverlay`

Recomendacao:
- fazer como commit/fatia separada dentro da mesma branch de implementacao, ou ate em branch propria se o diff crescer.

Opcao segura:
- manter `CardEditorOverlay` temporariamente no `App.vue` nesta implementacao;
- extrair apenas Biblioteca e Importacao.

Opcao completa:
- criar `features/library/CardEditorOverlay.vue`;
- o componente fica dono dos refs de textarea e input file;
- o pai continua dono de salvar carta e chamar API;
- para upload de midia, usar um contrato explicito.

Contrato recomendado se extrair:
- `v-model:front-html`;
- `v-model:back-html`;
- `v-model:tags`;
- props de preview ja sanitizado;
- eventos `save`, `close`;
- callback controlado `uploadMedia(file, kind): Promise<string>` retornando marcador a inserir.

Justificativa do callback:
- o ponto do cursor mora no componente;
- o upload HTTP deve continuar fora do componente;
- o componente precisa inserir o marcador apos o upload;
- isso evita expor refs de DOM para o pai.

Aceite se extrair:
- abrir nova carta foca Frente;
- editar carta preenche dados;
- cancelar com dirty confirma;
- salvar cria/atualiza;
- upload de imagem/audio insere marcador no cursor;
- preview continua igual;
- input de arquivo limpa apos selecionar.

### Passo 6 - Extrair `ImportPage.vue`

Criar `pages/ImportPage.vue` como componente controlado.

Props/modelos:
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
- `update:preview-picker-open`;
- `update:preview-card-search`;
- `select-preview-card`;
- `move-preview-card`;
- `toggle-preview-face`;
- `persist-import`;
- `update:import-title`;
- `update:import-visibility`.

Subcomponente recomendado:
- `ImportPreviewPicker.vue` para o seletor de cartas.

Cuidados:
- manter o evento bruto de `change` do input de arquivo no pai, ou passar `File | null` e limpar o input no filho;
- preservar `@keydown.esc`, `@keydown.enter` e `@keydown.space`;
- preservar `v-html` com HTML ja sanitizado;
- nao copiar `importPreview` para estado local;
- nao criar object URLs no componente visual.

Aceite:
- selecionar APKG;
- preview carrega;
- midias aparecem enquanto arquivo esta selecionado;
- busca no picker funciona;
- alternar frente/verso funciona;
- salvar logado funciona;
- anonimo clica "Entrar para salvar", faz login e volta sem perder preview.

### Passo 7 - Politica de Ciclo de Vida da Importacao

Adicionar limpeza ao sair de `/importar`.

Regra:
- se sair de `/importar` para qualquer rota comum: limpar `selectedFile`, `importPreview`, `previewMediaIndex`, `previewMediaUrls`, `importTitle`, picker e search;
- se sair de `/importar` para `/entrar` ou `/cadastro` com `returnToImportAfterAuth === true`: preservar;
- apos login, se `returnToImportAfterAuth` e `importPreview` existirem, voltar para `/importar`;
- apos salvar com sucesso: limpar tudo e ir para Meus baralhos.

Implementacao provavel:
- criar helper `shouldPreserveImportAcrossAuth(toRouteName)`;
- criar helper `clearImportState({ keepFile?: boolean } = {})`, ou reutilizar `resetImportPreviewState()` e zerar `selectedFile`;
- ajustar watcher de rota ou `syncRouteState()`.

Aceite:
- navegar de Importar para Biblioteca libera preview/midias;
- fluxo "Entrar para salvar" preserva preview;
- object URLs continuam revogados;
- testes/build passam.

## 7. Colateralidades

### 7.1 Router

Nao alterar rotas neste momento.

Riscos:
- filhos chamarem `router.push` diretamente e espalharem navegacao;
- quebra da rota direta de gerenciamento.

Mitigacao:
- componentes emitem eventos;
- `App.vue` segue controlando `router.push`;
- validar refresh direto em `/biblioteca/publicos`, `/biblioteca/meus` e `/biblioteca/meus/:deckId/gerenciar`.

### 7.2 Backend/API

Nao ha mudanca requerida.

Riscos:
- confundir metadata de deck com detalhe completo;
- voltar a carregar cartas demais.

Mitigacao:
- manter `api.deckMetadata(deckId)` para gerenciamento direto;
- manter `api.deckCards(deckId, page, CARD_PAGE_SIZE, query)` para cartas;
- nao usar `api.deck(deckId)` no gerenciamento.

### 7.3 Memoria

Melhorias seguras nesta etapa:
- limpar estado de importacao ao sair da rota;
- revogar object URLs sempre;
- manter cartas paginadas, sem carregar deck completo.

Nao resolver agora:
- virtualizacao de listas;
- cache LRU de estudos anonimos;
- abort de requests em andamento;
- paginacao substitutiva em vez de "carregar mais".

Observacao:
- `managedCards` ainda cresce conforme "Carregar mais" e isso e aceitavel no MVP se o usuario aciona explicitamente;
- para decks muito grandes, a melhoria futura ideal e pagina atual substituivel ou virtualizacao, nao no mesmo PR de componentizacao.

### 7.4 UX

Preservar:
- altura uniforme dos cards;
- busca de decks e cartas;
- "Salvar para mim";
- estados vazios;
- selecao multipla;
- dirty confirm de deck/carta;
- destaque do deck importado/copied.

Nao alterar textos/fluxos sem necessidade.

### 7.5 Acessibilidade

Preservar:
- `role="tablist"` e `role="tab"`;
- `aria-selected`;
- labels dos campos;
- `aria-label` de botoes iconicos;
- interacao por teclado no preview APKG.

Se criar componentes:
- nao duplicar ids;
- manter `id="preview-card-search"` somente se houver uma instancia;
- manter checkboxes reais para selecao.

### 7.6 CSS

Nao mover estilos ainda.

Cuidados:
- manter classes atuais;
- nao adicionar wrappers que quebrem grid/flex;
- conferir mobile e desktop se wrappers forem inevitaveis.

### 7.7 Testes e Validacao

Obrigatorio:
- `npm run build` em container Node;
- `npm test` em container Node;
- `diff --check`;
- frontend em container respondendo;
- backend `/api/decks/public` respondendo.

Validacao manual recomendada:
- biblioteca publica;
- meus baralhos;
- salvar para mim;
- gerenciar deck por clique;
- gerenciar deck por refresh direto;
- buscar cartas;
- selecionar e excluir cartas;
- criar/editar carta;
- importar APKG com preview;
- fluxo anonimo "Entrar para salvar".

## 8. Divisao Recomendada de Branches/PRs

Para manter retrocognibilidade, a melhor divisao e:

### PR 4A - Superficies de Biblioteca e Importacao

Branch:
- `codex/frontend-library-import-surfaces`

Escopo:
- `LibraryPage.vue`;
- subcomponentes de lista/gerenciamento;
- `ImportPage.vue`;
- politica de limpeza da Importacao ao sair da rota;
- diario de bordo.

Nao incluir:
- composables de dominio;
- store global;
- grandes mudancas de UX.

### PR 4B - Editor de Cartas

Branch:
- `codex/frontend-card-editor-overlay`

Escopo:
- extrair `CardEditorOverlay.vue`;
- resolver contrato de upload/insercao no cursor;
- preservar foco/dirty/save/upload.

Motivo para separar:
- refs de DOM e upload tornam o risco maior;
- fica mais facil revisar e reverter se necessario.

Se durante o PR 4A o overlay ficar como ultimo bloco visual relevante no `App.vue`, o 4B passa a ser a etapa natural seguinte.

## 9. Criterios de Aceite do Momento 4A

Obrigatorios:
- `LibraryPage.vue` extraida;
- listas de decks extraidas ou, no minimo, isoladas em subcomponentes claros;
- gerenciamento de deck/cartas extraido como superficie controlada;
- `ImportPage.vue` extraida;
- `App.vue` continua dono de API, rotas e estado;
- cleanup da Importacao ao sair da rota implementado;
- rotas existentes preservadas;
- backend sem alteracoes;
- build e testes passando;
- diario de bordo atualizado.

Desejaveis:
- `App.vue` ficar abaixo de 1300 linhas;
- tipos de view model documentarem contratos de props;
- nenhum componente novo com mais de uma responsabilidade dominante;
- importacao anonima com login preservando preview validada manualmente.

Nao obrigatorios:
- extrair `CardEditorOverlay`;
- criar composables;
- adicionar testes de componente;
- mudar `q` para query string de rota;
- virtualizar listas.

## 10. Riscos e Mitigacoes

Risco: props/eventos demais em `LibraryPage`.
Mitigacao: usar view models pequenos por area e subcomponentes por responsabilidade.

Risco: mover a complexidade sem reduzir legibilidade.
Mitigacao: nao criar uma unica `LibraryPage.vue` gigante; separar listas, gerenciamento e browser de cartas.

Risco: quebrar fluxo de Importacao anonima.
Mitigacao: testar explicitamente "Entrar para salvar" antes de concluir.

Risco: vazamento de object URLs.
Mitigacao: centralizar limpeza e garantir revogacao em rota e unmount.

Risco: quebrar highlight de deck.
Mitigacao: preservar `data-deck-id` nos cards.

Risco: quebrar selecao multipla.
Mitigacao: manter `Set<number>` no pai e passar `selectedManagedCardIds` sem copia local.

Risco: quebrar preview sanitizado.
Mitigacao: manter `safeStudyHtml` e `safePreviewHtml` no pai por enquanto.

## 11. Ordem Recomendada de Commits

Commit 1:
- `refactor(frontend): cria contratos visuais da biblioteca`

Commit 2:
- `refactor(frontend): extrai biblioteca e gerenciamento de cartas`

Commit 3:
- `refactor(frontend): extrai importacao apkg`

Commit 4:
- `fix(frontend): limpa estado de importacao ao sair da rota`

Commit 5:
- `docs(frontend): registra decisoes do momento 4`

Se o diff ficar menor, commits 2 e 3 podem ser combinados. Se `CardEditorOverlay` entrar, deve ter commit proprio.

## 12. Proxima Acao Recomendada

Antes de implementar, revisar este plano e decidir:
- se `CardEditorOverlay` fica para PR 4B, como recomendado;
- se a limpeza de Importacao deve entrar obrigatoriamente no PR 4A;
- se a extracao deve criar subcomponentes de biblioteca imediatamente ou primeiro uma `LibraryPage` superficial.

Recomendacao tecnica:
- PR 4A deve incluir `LibraryPage`, subcomponentes de lista/gerenciamento, `ImportPage` e cleanup de Importacao;
- `CardEditorOverlay` deve ficar para PR 4B, a menos que a implementacao do PR 4A mostre que o contrato do overlay ficou trivial.
