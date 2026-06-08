# Planejamento do Momento 4B: Editor de Cartas

**Status:** planejamento fino antes da implementacao.
**Branch unica de planejamento e implementacao:** `codex/frontend-card-editor-overlay`
**Base:** `frontend-refactor`
**Destino do PR:** `frontend-refactor`
**Dependencia concluida:** Momento 4A, com `LibraryPage`, `ImportPage` e subcomponentes de biblioteca extraidos.

## 1. Objetivo

Extrair o `CardEditorOverlay` do `App.vue` para um componente de feature sem alterar o comportamento do editor.

Objetivos:
- remover do `App.vue` o ultimo grande bloco visual da Biblioteca;
- isolar a UI do editor em `frontend/src/features/library/CardEditorOverlay.vue`;
- manter `App.vue` como orquestrador temporario de estado, API, rotas, notificacoes e persistencia;
- preservar o split view atual: edicao bruta de frente/verso/tags e preview ao vivo;
- preservar foco inicial, cursor, upload de midia, insercao de marcador e confirmacao de descarte;
- reduzir imports, refs e handlers DOM no `App.vue`;
- preparar o terreno para um futuro composable de gerenciamento de cartas, sem cria-lo agora.

Nao objetivos:
- redesenhar o editor;
- criar WYSIWYG;
- alterar backend ou contratos de upload;
- mudar o fluxo de midias orfas;
- mover `saveCardEditor()` inteiro para o componente;
- criar store global;
- mover estilos para CSS scoped;
- criar testes de componente se isso exigir infraestrutura nova.

## 2. Estado Atual Confirmado

Depois do Momento 4A:
- `App.vue` tem cerca de 1602 linhas;
- Biblioteca e Importacao ja foram extraidas como superficies controladas;
- `CardEditorOverlay` permanece dentro do template de `App.vue`;
- o editor usa estilos globais em `frontend/src/assets/styles.css`;
- o editor ainda possui refs de DOM dentro do `App.vue`.

Estado atual do editor no `App.vue`:
- `cardEditorOpen`;
- `cardEditorMode`;
- `cardEditorCardId`;
- `cardEditorForm`;
- `cardEditorInitial`;
- `activeEditorFace`;
- `frontEditorRef`;
- `backEditorRef`;
- `mediaInputRef`;
- `mediaUploadKind`;
- `cardEditorDirty`;
- `cardEditorTitle`;
- `cardEditorFrontPreview`;
- `cardEditorBackPreview`.

Funcoes relacionadas:
- `openCreateCardEditor()`;
- `openEditCardEditor(card)`;
- `openCardEditor(mode, card?)`;
- `closeCardEditor(force)`;
- `saveCardEditor()`;
- `triggerMediaUpload(kind, face)`;
- `handleEditorMediaChange(event)`;
- `insertIntoEditor(face, text)`;
- `splitTags(tags)`.

Template atual:
- overlay fixo fullscreen;
- header com titulo, salvar e fechar;
- form com textarea de Frente, textarea de Verso e Tags;
- botoes de inserir imagem/audio por face;
- preview duplo de Frente/Verso;
- input file invisivel compartilhado.

## 3. Diagnostico Arquitetural

O editor mistura duas naturezas de responsabilidade:

Responsabilidades de orquestracao:
- saber qual deck esta sendo editado;
- criar ou atualizar carta via API;
- recarregar cartas e lista de decks;
- controlar notificacoes globais;
- decidir se pode fechar quando ha dirty state;
- preservar selecao da carta salva.

Responsabilidades locais de UI/DOM:
- manter foco inicial na textarea Frente;
- lembrar face ativa;
- abrir input de arquivo escondido;
- limpar `input.value` apos selecionar arquivo;
- conhecer `selectionStart` e `selectionEnd`;
- inserir marcador no cursor correto;
- renderizar layout split view do editor.

Conclusao:
- a extracao deve mover UI/DOM para o componente;
- `App.vue` deve continuar dono de API, fluxo de save e dirty confirmation;
- o upload deve ser chamado por um callback controlado passado pelo pai, para que o componente possa inserir no cursor sem conhecer `api.ts`.

## 4. Fronteira Recomendada

Criar:

```txt
frontend/src/features/library/
  CardEditorOverlay.vue
  cardEditorTypes.ts
```

### 4.1 `cardEditorTypes.ts`

Tipos propostos:

```ts
export type CardEditorMode = 'create' | 'edit'
export type CardEditorFace = 'front' | 'back'
export type CardEditorMediaKind = 'image' | 'audio'

export interface CardEditorFormState {
  frontHtml: string
  backHtml: string
  tags: string
}

export type CardEditorMediaUploader = (
  file: File,
  kind: CardEditorMediaKind
) => Promise<string>
```

Motivo:
- `CardEditorFace` e `CardEditorMediaKind` pertencem ao editor, nao ao `App.vue`;
- o callback de upload retorna apenas o marcador a inserir;
- o componente continua sem importar `api.ts`.

### 4.2 `CardEditorOverlay.vue`

Props/modelos:
- `deckTitle: string`;
- `title: string`;
- `frontPreviewHtml: string`;
- `backPreviewHtml: string`;
- `uploadMedia: CardEditorMediaUploader`;
- `v-model:front-html`;
- `v-model:back-html`;
- `v-model:tags`.

Eventos:
- `save`;
- `close`;
- `upload-success`;
- `upload-error`.

Estado local do componente:
- `activeEditorFace`;
- `mediaUploadKind`;
- `frontEditorRef`;
- `backEditorRef`;
- `mediaInputRef`;
- `uploadingMedia`.

O componente deve:
- focar Frente ao montar/abrir;
- renderizar os mesmos controles e classes existentes;
- abrir input escondido para imagem/audio;
- limpar `input.value`;
- chamar `uploadMedia(file, kind)`;
- inserir o marcador retornado no cursor da face ativa;
- manter foco apos inserir marcador;
- emitir `upload-success` ou `upload-error` sem decidir mensagem global.

O componente nao deve:
- chamar `api.uploadMedia`;
- saber `deckId`;
- chamar `loadManagedCards`;
- chamar `loadMyDecks`;
- decidir `notice` ou `error` global, salvo por evento;
- executar confirmacao de dirty state;
- sanitizar HTML.

## 5. Mudancas no `App.vue`

Remover do `App.vue`:
- `activeEditorFace`;
- `frontEditorRef`;
- `backEditorRef`;
- `mediaInputRef`;
- `mediaUploadKind`;
- `triggerMediaUpload()`;
- `handleEditorMediaChange()`;
- `insertIntoEditor()`;
- imports de `ImageIcon` e `Volume2`, caso fiquem usados apenas no overlay.

Manter no `App.vue`:
- `cardEditorOpen`;
- `cardEditorMode`;
- `cardEditorCardId`;
- `cardEditorForm`;
- `cardEditorInitial`;
- `cardEditorDirty`;
- `cardEditorTitle`;
- `cardEditorFrontPreview`;
- `cardEditorBackPreview`;
- `openCardEditor()`;
- `closeCardEditor(force)`;
- `saveCardEditor()`;
- `splitTags(tags)`.

Adicionar no `App.vue`:
- `uploadCardEditorMedia(file, kind): Promise<string>`.

Responsabilidade de `uploadCardEditorMedia`:
- validar `managedDeck`;
- chamar `api.uploadMedia(deck.id, file)`;
- montar marcador `<img src="arquivo" alt="">` ou `[sound:arquivo]`;
- atualizar `notice` de sucesso;
- retornar marcador para o componente inserir.

`openCardEditor()` deve deixar de chamar `nextTick(() => frontEditorRef.value?.focus())`.
O foco passa a ser responsabilidade do componente.

## 6. Fluxo de Dados Esperado

Criar carta:
1. `DeckManagementView` emite `create-card`.
2. `App.vue` chama `openCardEditor('create')`.
3. `CardEditorOverlay` monta com modelos vazios.
4. Overlay foca Frente.
5. Usuario edita frente/verso/tags.
6. Usuario clica salvar.
7. Overlay emite `save`.
8. `App.vue` executa `saveCardEditor()`.
9. API cria carta, listas recarregam, overlay fecha.

Editar carta:
1. `DeckManagementView` emite `edit-card`.
2. `App.vue` chama `openCardEditor('edit', card)`.
3. Overlay recebe modelos preenchidos.
4. Usuario edita.
5. Save segue o mesmo fluxo de persistencia.

Upload de midia:
1. Usuario clica icone de imagem/audio na face desejada.
2. Overlay registra `mediaUploadKind` e `activeEditorFace`.
3. Overlay abre `input[type=file]`.
4. Usuario seleciona arquivo.
5. Overlay limpa o input.
6. Overlay chama `uploadMedia(file, kind)`.
7. `App.vue` executa API e retorna marcador.
8. Overlay insere marcador no cursor da face ativa.
9. Overlay restaura foco no campo editado.

Fechar editor:
1. Usuario clica X.
2. Overlay emite `close`.
3. `App.vue` chama `closeCardEditor()`.
4. Se houver dirty state, confirmacao segue no pai.

## 7. Lateralidades

### 7.1 Biblioteca

`DeckManagementView` ja emite `create-card` e `edit-card`.
Nao deve mudar.

Risco:
- quebrar o fluxo de abertura do editor.

Mitigacao:
- manter os mesmos eventos em `LibraryPage` e `DeckManagementView`;
- validar criar/editar carta por clique no gerenciador.

### 7.2 API e Backend

Nao alterar backend.

Contratos existentes:
- `POST /api/decks/{deckId}/media`;
- `POST /api/decks/{deckId}/cards`;
- `PUT /api/decks/{deckId}/cards/{cardId}`.

Risco:
- componente passar a conhecer `api.ts` e acoplar UI a backend.

Mitigacao:
- usar prop callback `uploadMedia`;
- manter save no pai.

### 7.3 Estado e Memoria

O editor nao cria object URLs.
O principal ponto de memoria e arquivo selecionado no input.

Regra:
- sempre limpar `input.value = ''` apos selecionar arquivo;
- nao manter `File` em estado persistente;
- nao criar cache de uploads no componente.

Debito existente:
- midias orfas podem ser criadas se usuario fizer upload e descartar a carta.

Decisao:
- nao resolver neste PR; requer politica backend de garbage collector ou reconciliacao futura.

### 7.4 Dirty State

Dirty state deve continuar no `App.vue`.

Motivo:
- o pai conhece `cardEditorInitial`;
- o pai decide se pode fechar;
- a confirmacao atual deve ser preservada.

Risco:
- componente fechar diretamente e ignorar confirmacao.

Mitigacao:
- overlay nunca altera `cardEditorOpen`;
- overlay apenas emite `close`.

### 7.5 Foco, Cursor e Acessibilidade

O componente deve assumir foco/cursor porque possui as refs.

Manter:
- foco inicial na Frente;
- foco na face apos inserir marcador;
- `title` e `aria-label` nos botoes iconicos;
- `aria-label="Editor de carta"` no overlay;
- input file invisivel;
- textarea com `required`, `maxlength` e rows atuais.

Nao adicionar agora:
- fechamento por Escape;
- focus trap completo;
- atalhos de teclado;
- dialog ARIA complexo.

Motivo:
- sao melhorias reais, mas mudariam o escopo e precisam de revisao de UX dedicada.

### 7.6 UI/UX e Design

Preservar:
- overlay fullscreen sobre a workspace;
- split view editor/preview;
- duas faces com acoes de midia no topo;
- preview ao vivo a direita;
- formato bruto com marcadores HTML/Anki;
- icones nos botoes de midia;
- botoes principais atuais.

Nao transformar:
- editor em card aninhado;
- overlay em modal pequeno;
- textareas em WYSIWYG;
- tags em componente complexo.

Melhoria aceitavel se nao alterar fluxo:
- desabilitar botoes de midia durante upload local;
- manter feedback global via `notice/error`.

### 7.7 CSS

Manter estilos em `frontend/src/assets/styles.css`.

Motivo:
- classes ja estao estabilizadas;
- mover CSS para scoped pode alterar especificidade e responsividade;
- Momento 4B e refatoracao estrutural, nao visual.

### 7.8 Seguranca

Preservar:
- preview continua recebendo HTML sanitizado por `safeStudyHtml` no pai;
- componente nao deve usar HTML bruto de entrada para preview;
- nomes de arquivos vem do backend e sao inseridos como marcador;
- backend continua validando ownership do deck.

Risco:
- mover sanitizacao para componente e duplicar regra.

Mitigacao:
- componente recebe `frontPreviewHtml` e `backPreviewHtml` prontos.

### 7.9 Testes e Validacao

Obrigatorio:
- `npm run build` em container Node;
- `npm test` em container Node;
- `git diff --check`;
- frontend containerizado respondendo.

Validacao manual recomendada:
- abrir editor de nova carta;
- foco inicial em Frente;
- editar Frente, Verso e Tags;
- fechar com dirty state e confirmar/cancelar;
- salvar carta nova;
- editar carta existente;
- upload de imagem na Frente;
- upload de audio no Verso;
- marcador inserido no cursor, nao no fim por engano;
- input file permite selecionar o mesmo arquivo novamente;
- preview permanece igual;
- listas de cartas recarregam apos salvar;
- exclusao/selecoes da Biblioteca continuam funcionando.

## 8. Ordem Recomendada de Implementacao

1. Criar `cardEditorTypes.ts`.
2. Criar `CardEditorOverlay.vue` copiando a estrutura visual atual.
3. Mover refs e helpers de cursor/upload para o componente.
4. Criar callback `uploadCardEditorMedia` no `App.vue`.
5. Substituir o bloco de template em `App.vue` por `<CardEditorOverlay />`.
6. Remover imports, refs e funcoes DOM que sobrarem no `App.vue`.
7. Rodar build.
8. Rodar testes.
9. Validar containers e atualizar diario de bordo.

## 9. Criterios de Aceite

Obrigatorios:
- `CardEditorOverlay.vue` extraido;
- `App.vue` sem refs de textarea/input do editor;
- `App.vue` sem `triggerMediaUpload`, `handleEditorMediaChange` e `insertIntoEditor`;
- save/create/update continuam no pai;
- upload continua usando API existente;
- marcador continua inserido no cursor;
- dirty confirmation preservada;
- preview sanitizado preservado;
- build e testes passam;
- diario de bordo atualizado.

Desejaveis:
- `App.vue` ficar abaixo de 1450 linhas;
- componente sem dependencia de router ou api;
- nenhum wrapper visual novo alterando layout;
- contrato do editor documentado por tipos.

Nao obrigatorios:
- focus trap;
- Escape para fechar;
- testes de componente;
- garbage collector de midias orfas;
- WYSIWYG.

## 10. Riscos e Mitigacoes

Risco: componente virar dono de API.
Mitigacao: callback `uploadMedia` e eventos `save/close`.

Risco: perder insercao no cursor.
Mitigacao: manter refs e `selectionStart/selectionEnd` dentro do componente; validar manualmente.

Risco: quebrar dirty confirmation.
Mitigacao: overlay nunca fecha sozinho; pai decide.

Risco: preview usar HTML nao sanitizado.
Mitigacao: passar preview ja sanitizado por props.

Risco: input file nao permitir reescolher o mesmo arquivo.
Mitigacao: limpar `input.value` no componente apos cada `change`.

Risco: alterar layout responsivo.
Mitigacao: preservar classes globais e nao mover CSS.

Risco: upload em andamento e fechamento do editor.
Mitigacao: nao mudar comportamento atual nesta fatia; se virar problema em teste manual, avaliar bloqueio de close durante upload como ajuste pequeno.

## 11. Ordem Recomendada de Commits

Como planejamento e implementacao ficam na mesma branch:

Commit 1:
- `docs(frontend): planeja extracao do editor de cartas`

Commit 2:
- `refactor(frontend): extrai overlay do editor de cartas`

Commit 3, se necessario:
- `docs(frontend): registra validacoes do editor de cartas`

Se a implementacao ficar pequena, os commits 2 e 3 podem ser combinados. O planejamento deve permanecer no mesmo PR para manter contexto e rastreabilidade.

## 12. Proxima Acao

Apos validacao deste plano:
1. implementar `CardEditorOverlay.vue`;
2. remover do `App.vue` as responsabilidades locais de DOM/cursor/upload;
3. manter `App.vue` como orquestrador de API e persistencia;
4. validar build, testes e fluxo containerizado.
