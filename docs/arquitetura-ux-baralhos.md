# Plano de Arquitetura e UX: Gerenciamento de Baralhos e Cartas

**Status:** Aprovado e em implementação inicial (Backend concluído em commit local).
**Branch:** `feature/library-deck-management`

Este documento consolida as decisões arquiteturais de front-end e UX relativas à gerência de baralhos, abordando a listagem, edição, seleção, exclusão e o ciclo de vida das cartas (criação e edição de mídia). Serve como contexto para desenvolvimento e manutenções futuras em formato agêntico.

## 1. O Problema Original
Antes dessa refatoração, a plataforma separava as intenções do usuário em telas isoladas. A tela "Criar" exigia que o usuário selecionasse o baralho em um dropdown "às cegas" para criar cartas, perdendo o contexto de visualização do conteúdo já existente. A edição e exclusão não tinham espaço adequado na interface da Biblioteca, forçando uma fragmentação na navegação.

## 2. Decisões Centrais de Design

A nova abordagem é fundamentada no princípio de **Proximidade Contextual**. Onde o usuário vê o baralho, ele deve ser capaz de operá-lo.

### 2.1 View de Gerenciamento Contextual (Content Swap)
- **Onde acontece:** Na aba de navegação da Biblioteca (`Meus baralhos`).
- **Gatilho:** Botão secundário compacto `[Gerenciar]` ao lado de `[Estudar]` no card do baralho.
- **Como funciona:** Para evitar a complexidade de adicionar novas abas fixas ou rotas complexas na SPA, utilizamos **Content Swap**. O conteúdo atual da lista de baralhos é ocultado e a "View de Gerenciamento" é renderizada mantendo o layout global (Sidebar e Topbar).
- **Ações na View de Gerenciamento:**
  - Editar metadados inline (Título, Descrição e Visibilidade).
  - Botão global de "Excluir Baralho" com modal rápido de confirmação (perigo).
  - Visualizar lista das cartas que compõem o baralho.
  - Selecionar, remover individualmente cartas, ou chamar o gatilho de edição/criação de cartas.

### 2.2 Overlay Dedicado para Edição/Criação de Cartas
- A criação de uma carta ou edição de uma existente não ocorrerá em modais tradicionais pequenos nem em swaps hierárquicos profundos (que dificultam o tratamento de "discard changes").
- **A Abordagem:** Um **Overlay Fullscreen (ou cobrindo a Workspace)** específico para o editor.
- **Formato Visual:** *Split View* (Editor e Tags à esquerda, Renderização/Preview ao vivo à direita).
- **O Fator "Future-Proof":** O overlay foi escolhido estrategicamente porque, no futuro, o LearningFrame pretende comportar editores gráficos avançados (diagramas visuais ricos). Ferramentas complexas de edição brigam com scrollings herdados de listas. O overlay nos fornece um sandbox visual flexível (Canvas).
- **Lógica de Guarda:** Como o overlay tem um `[X]` de fechamento único, qualquer "unsaved change" dispara apenas um dialog nativo de alerta (sem risco de navegação de browser não rastreada).

### 2.3 Tratamento de Mídias (Imagens e Áudios)
- Seguindo o padrão clássico testado e comprovado (ex: Anki), abandonou-se a ideia inicial de componentes WYSIWYG complexos por um editor bruto que injeta **marcadores HTML**.
- O upload da mídia ocorre de forma "independente", sem bloquear o salvamento final do form da carta.
- Ao clicar em "Inserir imagem" / "Inserir áudio", a API é chamada e o backend devolve o nome único e tokenizado. Injetamos o marcador (`<img src="xx">` ou `[sound:xx]`) direto na posição do cursor do campo de texto bruto.
- Débito técnico anotado: Mídias não usadas (usuário faz o upload mas desiste da carta) viram mídias orfãs e exigirão jobs futuros de cleanup/garbage collector no banco de dados.

### 2.4 Simplificação do Fluxo Global
- A área/aba original de `[Criar]` do menu esquerdo passa a focar puramente em atalhos para **criação macro** (Novo Baralho).
- Logo após um baralho ser criado por esse atalho, o usuário é direcionado imediatamente para a "View de Gerenciamento Contextual" deste novo baralho para seguir adicionando suas cartas.

---

## 3. Topologia Técnica Esperada

### Backend (Java Spring Boot)
- **`PUT /api/decks/{id}`**: Atualiza metadados.
- **`DELETE /api/decks/{id}`**: Exclui o deck.
- **`POST /api/decks/{id}/media`**: (Implementado nesta task) Upload isolado de arquivo binário (`MultipartFile`). Validado por ownership, sanitiza o path traversal, normaliza espaços, devolve Content-Type seguro (fallback `.bin`) e injeta no model `MediaAsset`. Sobrescreve com método `updateContent()` caso arquivo de mesmo nome retorne.
- **`GET /api/decks/{id}/cards?page&size&q`**: Lista cartas do baralho do usuario em pagina, com busca por frente, verso e tags.
- **`POST /api/decks/{id}/cards/bulk-delete`**: Remove cartas selecionadas em lote, validando ownership do baralho e pertencimento das cartas.
- **`POST /api/decks/{id}/copy`**: Salva um baralho publico como copia privada em "Meus baralhos", incluindo cartas, tags e midias.

### Frontend (Vue.js + TypeScript)
- Arquitetura de Estado:
  - `libraryView: 'decks' | 'manage-deck'` (Troca do Swap)
  - `cardEditorOpen: boolean`, mode (`create` | `edit`), flags de `dirty` form.
- Funções da Camada de Serviço (`api.ts`):
  - Inclusão dos wrappers `updateDeck()`, `deleteDeck()`, `uploadMedia()`.
- Lógica Visual (App.vue):
  - Integração do parser de HTML seguro (`safeStudyHtml()`) para a área de preview em tempo real do overlay do editor.

## 4. Próximos Passos
O frontend receberá a implementação do "Gerenciamento Contextual" (metadados e listagem de exclusão) seguidos do Overlay de Edição, validando cada etapa com o novo endpoint de Mídia consolidado.

## 5. Atualizacao de Implementacao Local
A primeira fatia vertical do plano ja foi implementada localmente:
- wrappers de API para atualizar/excluir baralhos, atualizar/excluir cartas e enviar midia;
- view de gerenciamento contextual em `Biblioteca > Meus baralhos`;
- edicao inline de metadados do baralho;
- exclusao de baralho e cartas com confirmacao;
- listagem paginada e buscavel de cartas no gerenciamento, evitando renderizacao integral de baralhos grandes;
- selecao multipla de cartas para exclusao em lote, separada da carta ativa em preview;
- overlay dedicado para criar/editar cartas em split view;
- preview seguro usando `safeStudyHtml()`;
- upload independente de imagem/audio, com injecao de `<img src="arquivo">` ou `[sound:arquivo]`;
- acao "Salvar para mim" em baralhos publicos, criando copia privada editavel;
- aba `Criar` reduzida para criacao macro de baralho, redirecionando para gerenciamento apos criar.

Favoritar baralhos publicos fica como roadmap: deve ser uma relacao leve do usuario com o baralho original, sem duplicar conteudo. Isso complementa, mas nao substitui, "Salvar para mim", que significa possuir uma copia editavel.

O proximo passo e validar manualmente no navegador via fluxo containerizado (`http://localhost:8080`), com foco em login, biblioteca, gerenciamento, editor de cartas, upload de midia e comportamento responsivo.
