# Prompt para o Proximo Chat: Selecao de Baralhos na Pratica Intercalada

Use este prompt para iniciar ou retomar a implementacao da segunda parte da
branch `codex/study-mode-interleaved-polish`.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch de trabalho atual: codex/study-mode-interleaved-polish
- A primeira parte da branch, tipografia do estudo, ja foi concluida e commitada:
  887fe26 feat(estudo): ajusta controle incremental de fonte
- Antes de editar, confirme branch atual, estado do Git e se ha mudancas nao
  commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; leia e trabalhe com elas.
- Commits devem seguir Conventional Commits e ser escritos em portugues.

Objetivo desta proxima fatia:
- Expor selecao de baralhos para a rota /estudo/intercalado.
- Fazer a pratica intercalada autenticada enviar deckIds selecionados para
  /api/study/due?mode=MIXED_DUE.
- Fazer a pratica intercalada anonima usar apenas os baralhos publicos
  selecionados.
- Intercalar cartas anonimas por baralho, nao apenas concatenar listas.
- Preservar progresso, feedback local, resumo final, SRS e fluxo de estudo ja
  existentes.

Fora de escopo:
- Alterar a tipografia do estudo novamente, salvo bug diretamente relacionado.
- Alterar o algoritmo SRS.
- Criar dashboard, metas, tags/topicos, configurador avancado ou store global.
- Refatorar amplamente App.vue.
- Mudar o backend se o contrato atual de deckIds for suficiente.
- Criar endpoint novo para listar todos os baralhos, a menos que seja realmente
  indispensavel apos inspecao.

Documentos obrigatorios para ler:
- docs/principios-e-padroes-mvp.md
- docs/ai_context/README.md
- docs/ai_context/memoria-de-decisoes.md
- docs/ai_context/linha-do-tempo.md
- docs/ai_context/planos/plano-ajuste-modo-estudo-pratica-intercalada.md
- docs/ai_context/prompts/prompt-proximo-chat-ajuste-modo-estudo-pratica-intercalada.md

Arquivos tecnicos obrigatorios para inspecionar:
- frontend/src/features/study/useStudySession.ts
- frontend/src/features/study/useStudySession.test.ts
- frontend/src/features/study/studySessionTypes.ts
- frontend/src/pages/StudyPage.vue
- frontend/src/routes/StudyRoute.vue
- frontend/src/routes/routeContext.ts
- frontend/src/App.vue
- frontend/src/services/api.ts
- frontend/src/types/api.ts
- frontend/src/utils/localStudy.ts
- backend/src/main/java/com/learningframe/api/study/StudyController.java
- backend/src/main/java/com/learningframe/api/study/StudyService.java
- backend/src/main/java/com/learningframe/api/repository/CardRepository.java

Diagnostico atual:
- A rota /estudo/intercalado existe, mas entrar nela inicia a sessao
  imediatamente.
- App.vue chama loadInterleavedPractice() ao sincronizar a rota
  study-interleaved.
- useStudySession.loadInterleavedPractice() faz duas coisas misturadas:
  preparar o fluxo e carregar as cartas da sessao.
- Usuario autenticado chama client.due('MIXED_DUE') sem deckIds.
- Visitante anonimo usa publicDecks.slice(0, 4), carrega cada deck e concatena
  as cartas vencidas.
- api.due(mode, deckId?) ainda nao expoe deckIds nem limit como parametro
  explicito.
- O backend ja aceita @RequestParam List<Long> deckIds em /api/study/due e
  StudyService ja usa findMixedDueInDecks quando deckIds vem preenchido.
- CardRepository.findMixedDueInDecks ja valida acesso por deck publico ou do
  usuario.

Principios de desenho:
- Manter a tela de estudo simples e guiada.
- Fazer mudanca incremental, com testes antes ou junto de cada comportamento.
- Aplicar SRP: separar selecao de baralhos, carga de cartas e renderizacao.
- Aplicar DIP: useStudySession deve depender de um contrato StudySessionApi,
  nao diretamente de detalhes de fetch.
- Aplicar Parameter Object: trocar a assinatura fragil api.due(mode, deckId?)
  por uma assinatura com objeto, por exemplo:
  due({ mode, deckId, deckIds, limit }).
- Aplicar "small functions" e nomes explicitos no estilo Clean Code:
  prepareInterleavedPracticeSelection, startInterleavedPracticeSession,
  toggleInterleavedDeckSelection, interleaveCardsByDeck.
- Evitar "speculative generality": nao criar engine generica de configuracao de
  estudo; resolver apenas selecao de decks para MIXED_DUE.
- Puxar helper puro para logica de intercalacao anonima, porque isso e facil de
  testar e reduz risco.
- Manter StudyPage como pagina visual controlada por props/eventos.
- Manter App.vue como composition root que conecta composables, rotas e
  callbacks transversais.

Plano de implementacao recomendado:

1. Caracterizar o comportamento atual com testes focados.
   - Em useStudySession.test.ts, preservar cobertura de estudo por baralho,
     review anonimo/autenticado, resumo e reset.
   - Ajustar ou substituir o teste "carrega pratica intercalada anonima pelos
     primeiros quatro decks publicos" para refletir o novo fluxo de selecao.

2. Atualizar o contrato de API do frontend.
   - Criar um tipo local em frontend/src/services/api.ts, por exemplo:
     interface DueRequestOptions {
       mode: StudyMode
       deckId?: number
       deckIds?: number[]
       limit?: number
     }
   - Implementar api.due(options), com limit default 24.
   - Serializar deckIds como parametros repetidos:
     deckIds=1&deckIds=2
   - Atualizar StudySessionApi e chamadas existentes:
     client.due({ mode: 'SINGLE_DECK', deckId })
     client.due({ mode: 'MIXED_DUE', deckIds: selectedIds })
   - Cobrir por teste indireto em useStudySession; teste especifico de api so
     vale se houver padrao local para mockar fetch sem aumentar ruido.

3. Modelar selecao de baralhos no dominio de estudo.
   - Criar tipos em studySessionTypes.ts ou arquivo pequeno dedicado:
     InterleavedDeckOption
     InterleavedSelectionState
   - Cada opcao deve conter id, title, description, cardCount, dueCount,
     visibility/source quando util.
   - Limite sugerido: maximo 8 baralhos selecionados.
   - Se houver dueCount disponivel, priorizar selecao inicial de baralhos com
     dueCount > 0; caso contrario, selecionar os primeiros ate 4.
   - Se nada estiver selecionavel, deixar estado vazio com mensagem apropriada.

4. Separar preparar selecao de iniciar sessao.
   - Trocar a semantica de loadInterleavedPractice().
   - Recomendar nomes:
     prepareInterleavedPracticeSelection()
     startInterleavedPracticeSession()
   - Ao entrar em /estudo/intercalado, App.vue deve preparar a selecao, nao
     iniciar a sessao automaticamente.
   - O botao lateral/acoes "Pratica intercalada" deve navegar para
     /estudo/intercalado; se ja estiver nessa rota, deve preparar/reabrir a
     selecao de forma previsivel.
   - O botao dentro do seletor deve iniciar a sessao com os deckIds selecionados.

5. Definir origem dos decks disponiveis.
   - Visitante anonimo:
     - usar publicDecks;
     - se publicDecks estiver vazio, chamar loadPublicDecks(true);
     - permitir selecionar apenas baralhos publicos carregados.
   - Usuario autenticado:
     - usar myDecks e publicDecks como fontes disponiveis se isso couber sem
       endpoint novo;
     - se myDecks/publicDecks estiverem vazios, carregar as primeiras paginas
       com loadMyDecks(true) e loadPublicDecks(true), conforme dependencias
       disponiveis no App.vue;
     - evitar carregar "todos os baralhos" sem paginacao.
   - Tratar duplicidade por id mantendo uma unica opcao por baralho.

6. Implementar helper puro para anonimo.
   - Criar helper testavel em useStudySession.ts ou arquivo dedicado:
     interleaveStudyCardsByDeck(cards, limit)
   - Melhor ainda: receber grupos de cartas por baralho:
     interleaveDeckCardGroups(groups, limit)
   - Garantir ordem rodada por baralho:
     deck1-card1, deck2-card1, deck1-card2, deck2-card2...
   - Usar esse helper apenas no fluxo anonimo; o backend ja intercala o fluxo
     autenticado.

7. Atualizar StudyPage como superficie visual.
   - Renderizar seletor quando a rota estiver em modo de selecao intercalada e
     nao houver currentCard ativo.
   - Preferir componente dedicado se a pagina ficar pesada:
     frontend/src/features/study/InterleavedDeckSelector.vue
   - Usar checkboxes para selecao.
   - Mostrar contador de selecionados.
   - Desabilitar "Iniciar pratica" quando zero selecionados.
   - Desabilitar checkboxes nao selecionados ao atingir o limite.
   - Empty states esperados:
     - sem baralhos disponiveis;
     - nenhum baralho selecionado;
     - baralhos selecionados sem cartas vencidas apos iniciar.
   - Nao adicionar textos instrucionais longos; a interface deve ser operacional.

8. Atualizar routeContext e StudyRoute.
   - Expor apenas o necessario para StudyPage:
     interleavedSelection ou props derivadas;
     toggleInterleavedDeckSelection;
     startSelectedInterleavedPractice;
     prepare/start interleaved conforme nomes finais.
   - Evitar expor detalhes internos desnecessarios do composable.

9. Preservar reset e ciclo de vida.
   - resetStudySession deve limpar fila, resposta, feedback e resumo.
   - Decidir explicitamente se reset tambem fecha a selecao; recomendacao:
     sair da rota de estudo fecha a selecao; permanecer em /estudo/intercalado
     pode reabrir/preparar a selecao.
   - logout deve limpar cache publico e qualquer selecao de deck autenticado.

10. Validar sem backend novo, se possivel.
   - Confirmar que StudyController ja aceita deckIds.
   - Confirmar que CardRepository.findMixedDueInDecks preserva regra de acesso.
   - Nao alterar backend se o contrato atual funcionar.

Testes unitarios esperados:
- useStudySession prepara selecao anonima com publicDecks carregados.
- useStudySession chama loadPublicDecks(true) quando visitante entra em
  /estudo/intercalado sem publicDecks.
- useStudySession prepara selecao autenticada usando myDecks/publicDecks
  disponiveis.
- Selecionar/desselecionar decks respeita limite maximo.
- startInterleavedPracticeSession autenticado chama client.due com:
  { mode: 'MIXED_DUE', deckIds: [...] }.
- startInterleavedPracticeSession anonimo carrega apenas os decks selecionados.
- Fluxo anonimo intercala por baralho, em vez de concatenar.
- Nenhum deck selecionado nao inicia sessao e mantem estado de selecao.
- Se decks selecionados nao tiverem cartas vencidas, emptyReason fica no-due e
  notice continua coerente.

Teste E2E recomendado, se a mudanca visual ficar estavel:
- Expandir frontend/e2e/specs/study-session.spec.ts:
  - abrir /estudo/intercalado;
  - selecionar dois baralhos;
  - iniciar pratica;
  - confirmar que a sessao aparece e permite revelar/responder;
  - no fluxo autenticado, preferir seed/controlado para verificar deckIds se o
    mock/ambiente permitir.

Validacao obrigatoria:
- cd frontend && npm test
- cd frontend && npm run build
- git diff --check
- cd frontend && npm run e2e se houver teste E2E novo/alterado.
- Testes Maven backend apenas se houver alteracao backend.

Observacao operacional:
- Neste workspace, npm test/npm run build podem falhar dentro do sandbox com
  erro de acesso ao vite.config.ts. Se isso ocorrer, repetir fora do sandbox
  com permissao elevada, como registrado nos chats anteriores.
- Docker no Windows tambem costuma exigir permissao elevada para acessar o
  daemon.

Resposta esperada antes de editar:
- Confirmar branch e worktree.
- Resumir o estado atual: tipografia ja commitada; pratica intercalada ainda
  inicia direto.
- Apresentar plano curto de arquivos a alterar.
- Explicar quais testes vao proteger:
  - contrato api.due com deckIds;
  - selecao de baralhos;
  - intercalacao anonima;
  - preservacao de progresso/resumo/review.
```
