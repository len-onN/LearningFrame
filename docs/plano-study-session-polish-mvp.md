# Plano da Branch: Polimento do Modo de Estudo do MVP

Branch de trabalho:
- `codex/study-session-polish`

Base confirmada:
- `develop` atualizado ate `bec6648`;
- branch criada a partir de `develop` sem mudancas locais pendentes;
- `develop` ja contem a expansao E2E de fluxos de risco.

## 1. Objetivo

Polir o modo de estudo com uma fatia pequena, de alto retorno perceptivo e baixo
risco arquitetural.

O objetivo nao e transformar o estudo em uma nova feature grande. O objetivo e
fazer a tela parecer uma sessao guiada: o usuario entende onde esta, percebe
progresso, recebe retorno local apos cada avaliacao e termina com uma conclusao
clara.

Objetivos principais:
- mostrar progresso da sessao sem criar dashboard;
- registrar feedback local do ultimo rating sem usar notificacao global para
  cada carta;
- apresentar um resumo simples ao finalizar;
- melhorar empty states do estudo;
- preservar o scheduler/SRS atual e os contratos do MVP;
- manter a implementacao pequena, reversivel e coberta por testes focados.

Nao objetivos:
- criar dashboard estatistico;
- trocar algoritmo SRS;
- criar configurador avancado de sessao;
- escolher novos vs revisao;
- implementar pausa/retomada persistida;
- criar gamificacao;
- mover o estudo inteiro para store global;
- refatorar amplamente `App.vue`;
- adicionar backend novo, salvo bug real indispensavel.

## 2. Contexto Obrigatorio Considerado

Documentos lidos para este planejamento:
- `README.md`;
- `docs/diario-de-bordo.md`;
- `docs/consideracoes-pre-finalizacao.md`;
- `docs/arquitetura-ux-baralhos.md`;
- `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`;
- `docs/plano-momento-8-testes-e2e.md`;
- `docs/plano-e2e-risk-flows-mvp.md`;
- `docs/prompt-proximo-chat-study-session-polish-mvp.md`.

Arquivos tecnicos inspecionados:
- `package.json`;
- `frontend/package.json`;
- `frontend/src/pages/StudyPage.vue`;
- `frontend/src/routes/StudyRoute.vue`;
- `frontend/src/routes/routeContext.ts`;
- `frontend/src/App.vue`;
- `frontend/src/services/api.ts`;
- `frontend/src/types/api.ts`;
- `frontend/src/utils/srs.ts`;
- `frontend/src/utils/dueTime.ts`;
- `frontend/src/utils/localStudy.ts`;
- `frontend/src/assets/styles.css`;
- `frontend/e2e/specs/study-session.spec.ts`;
- `frontend/e2e/specs/public-library.spec.ts`;
- `frontend/e2e/specs/routing-risk.spec.ts`.

## 3. Diagnostico do Estado Atual

### 3.1 Superficie visual

`StudyPage.vue` e uma pagina visual controlada por props/eventos. Ela recebe:
- titulo da sessao;
- tamanho atual da fila;
- carta atual;
- HTML seguro da frente e do verso;
- estado de resposta revelada.

Ela emite:
- iniciar pratica intercalada;
- revelar resposta;
- revisar com rating.

Isso esta alinhado com a arquitetura pos-Momento 7: a pagina e uma superficie
visual, enquanto o estado transversal ainda vive no integrador.

### 3.2 Orquestracao

O estado real do estudo ainda fica em `App.vue`:
- `studyQueue`;
- `sessionTitle`;
- `answerVisible`;
- `currentCard`;
- `frontHtml`;
- `backHtml`;
- `currentDueLabel`;
- `loadStudyDeck`;
- `loadInterleavedPractice`;
- `reviewCurrent`;
- `resetStudySession`.

`StudyRoute.vue` chama `syncStudyRoute()` no mount e em mudancas de rota, e
chama `cleanupStudyRoute()` ao sair das rotas de estudo. Isso ja da uma
fronteira de ciclo de vida adequada para a branch.

### 3.3 Experiencia atual

Hoje o usuario consegue:
- abrir estudo por baralho;
- abrir pratica intercalada;
- revelar resposta;
- avaliar com `De novo`, `Dificil`, `Bom` ou `Facil`;
- ter revisoes persistidas quando autenticado;
- ter revisoes locais quando anonimo;
- sair da rota e limpar a fila.

Mas ainda falta:
- progresso baseado no total inicial da sessao;
- feedback local do que aconteceu depois do rating;
- resumo final;
- empty state diferenciado entre "sem sessao", "sem cartas vencidas" e "sessao
  concluida";
- indicacao mais clara de que a experiencia e uma sessao guiada.

### 3.4 Contratos existentes aproveitaveis

Nao e necessario alterar backend para esta branch.

O endpoint autenticado `POST /api/study/reviews` ja retorna `ReviewResult`,
incluindo:
- rating;
- `nextDueAt`;
- `intervalDays`;
- `repetitions`;
- `easeFactor`.

O modo anonimo ja usa `nextReview()` no frontend, que produz informacao
equivalente para feedback local. O wrapper `api.anonymousReview()` existe, mas
nao precisa ser introduzido agora porque isso mudaria o comportamento atual de
estudo anonimo.

## 4. Principios de Produto e UX

### 4.1 Sessao, nao painel

O estudo deve continuar sendo uma tela focada. O usuario veio recordar, nao
analisar graficos. O progresso deve ser discreto e sempre subordinado ao card.

### 4.2 Feedback perto da acao

O resultado do rating deve aparecer no proprio contexto do estudo. Notificacoes
globais para cada carta competem com a tarefa principal e criam ruido.

### 4.3 Encerramento claro

Quando a fila termina, a tela deve reconhecer a conclusao. Isso aumenta a
sensacao de fechamento e ajuda a demonstrar o proposito do produto.

### 4.4 Sem promessa estatistica falsa

O resumo deve usar apenas dados da sessao atual. Nao deve parecer analitica
historica, acuracia global ou dashboard.

### 4.5 Baixa surpresa

O comportamento atual da revisao deve ser preservado. Clicar rating ainda avanca
a fila. Sair da rota ainda descarta a sessao em memoria.

## 5. Escopo Selecionado

### 5.1 Progresso de sessao

Adicionar estado local de sessao:
- total inicial de cartas;
- quantidade revisada;
- quantidade restante;
- percentual de progresso derivado.

Exibicao proposta:
- texto pequeno: `3 de 12 revisadas`;
- texto auxiliar: `9 restantes`;
- barra horizontal discreta.

Regras:
- se a sessao nao tem cartas, nao mostrar barra artificial;
- se a sessao esta concluida, mostrar 100%;
- nao recalcular total a partir do tamanho atual da fila, pois a fila diminui.

### 5.2 Feedback local apos rating

Guardar o ultimo resultado de revisao:
- rating escolhido;
- label do rating;
- proxima revisao formatada;
- intervalo em dias, quando util;
- titulo do deck ou identificador de contexto leve.

Exibicao proposta:
- bloco pequeno e discreto abaixo do header ou dentro da area do card;
- exemplo conceitual: `Bom registrado. Volta em 1d.`;
- para `AGAIN`, destacar que volta em poucos minutos quando o resultado apontar
  para isso.

Regras:
- limpar feedback ao iniciar nova sessao;
- substituir feedback a cada nova avaliacao;
- nao usar `showNotice()` para cada rating;
- manter mensagens curtas.

### 5.3 Resumo simples ao finalizar

Quando a fila acaba depois de pelo menos uma revisao, mostrar uma conclusao
local em vez do empty state generico.

Resumo proposto:
- total revisado;
- distribuicao por rating:
  - `De novo`;
  - `Dificil`;
  - `Bom`;
  - `Facil`;
- ultima proxima revisao, se houver resultado disponivel;
- acoes claras:
  - voltar para Biblioteca;
  - iniciar pratica intercalada.

Regras:
- nao incluir graficos;
- nao incluir estatisticas historicas;
- nao persistir resumo ao sair da rota;
- nao chamar backend adicional so para compor o resumo.

### 5.4 Empty states do estudo

Separar estados:
- `idle`: nenhuma sessao ativa;
- `no-due`: uma sessao foi aberta, mas nao ha cartas vencidas agora;
- `completed`: a sessao terminou com revisoes;
- `empty-deck`: baralho sem cartas, se for detectavel de forma barata.

Observacao:
- hoje `loadStudyDeck()` sabe quando a fila veio vazia, mas nem sempre distingue
  "sem vencidas" de "baralho sem cartas" sem carregar detalhe adicional;
- para manter baixo risco, a primeira implementacao pode tratar `empty-deck`
  como melhoria opcional somente se a informacao ja estiver disponivel via
  metadata ou detalhe publico.

### 5.5 Atalhos de teclado

Atalhos sao valiosos, mas devem ser segunda prioridade nesta branch.

Possivel desenho:
- `Espaco` ou `Enter`: revelar resposta quando o foco nao estiver em campo de
  texto;
- `1`, `2`, `3`, `4`: ratings depois da resposta revelada;
- ignorar atalhos quando `event.target` for input, textarea, select, button com
  comportamento proprio ou elemento editavel.

Decisao inicial:
- implementar apenas se os quatro primeiros polimentos ficarem pequenos e
  estaveis;
- se entrar, cobrir com teste E2E focal;
- nao colocar texto visivel longo explicando atalhos.

## 6. Modelo de Estado Proposto

Adicionar tipos pequenos no frontend, preferencialmente perto da orquestracao
atual ou em um arquivo leve de feature se a tipagem crescer.

Tipos conceituais:

```ts
type StudyEmptyReason = 'idle' | 'no-due' | 'completed' | 'empty-deck'

interface StudySessionProgress {
  initialTotal: number
  reviewed: number
  remaining: number
  percent: number
}

interface StudyRatingCounts {
  AGAIN: number
  HARD: number
  GOOD: number
  EASY: number
}

interface StudyReviewFeedback {
  rating: ReviewRating
  ratingLabel: string
  nextDueLabel: string
  intervalLabel: string
}

interface StudySessionSummary {
  reviewed: number
  ratingCounts: StudyRatingCounts
  lastFeedback: StudyReviewFeedback | null
}
```

Implementacao recomendada:
- `studyInitialTotal = ref(0)`;
- `studyReviewedCount = ref(0)`;
- `studyRatingCounts = ref(...)`;
- `lastStudyFeedback = ref(...)`;
- `studyCompleted = ref(false)`;
- `studyEmptyReason = ref<StudyEmptyReason>('idle')`;
- computed para `studyProgress` e `studySummary`.

Regras de transicao:
- ao carregar uma sessao com cartas:
  - `initialTotal = fila.length`;
  - `reviewed = 0`;
  - contadores zerados;
  - `completed = false`;
  - `emptyReason = 'idle'` ou vazio equivalente;
- ao carregar uma sessao sem cartas:
  - `initialTotal = 0`;
  - `reviewed = 0`;
  - `completed = false`;
  - `emptyReason = 'no-due'`;
- ao avaliar:
  - usar o resultado do SRS para montar feedback;
  - incrementar contador do rating;
  - incrementar revisadas;
  - remover a carta da fila;
  - se fila acabou, marcar `completed`;
- ao sair da rota:
  - limpar tudo.

## 7. Desenho Visual

### 7.1 Header

Manter `sessionTitle` como eyebrow ou contexto curto.

Substituir o foco em `queueLength` por contexto de sessao:
- sessao ativa: `X de Y revisadas`;
- sessao vazia: texto operacional curto;
- concluida: `Sessao concluida`.

Adicionar uma barra fina sob o header ou no topo do card:
- altura pequena;
- sem animacao chamativa;
- cores do tema atual;
- largura derivada de `percent`.

### 7.2 Card

Manter a hierarquia:
1. metadata da carta;
2. frente;
3. botao revelar;
4. verso;
5. ratings.

O feedback local nao deve empurrar demais o conteudo. Preferencia:
- um bloco pequeno abaixo dos ratings apos a avaliacao anterior;
- ou um bloco no topo do card, antes da proxima frente.

### 7.3 Resumo

Usar uma area parecida com `empty-state`, mas com densidade maior:
- titulo claro;
- contagem revisada;
- grid pequeno com os quatro ratings;
- acoes.

Evitar card dentro de card. A propria area de resumo pode ser a superficie
principal.

### 7.4 Responsivo

Cuidados:
- ratings ja quebram em duas colunas no mobile;
- progresso nao pode causar overflow;
- contadores devem quebrar linha naturalmente;
- botoes de acao do resumo devem empilhar em telas estreitas;
- nao usar tipografia hero dentro do estudo.

## 8. Colateralidades e Riscos

### 8.1 Scheduler/SRS

Risco:
- feedback local divergir do resultado real do backend.

Mitigacao:
- no estudo autenticado, montar feedback a partir do `ReviewResult` retornado
  por `api.review()`;
- no estudo anonimo, usar o resultado de `nextReview()` que ja atualiza
  `localStorage`;
- nao recalcular backend no frontend para usuario logado.

### 8.2 Estado de rota

Risco:
- resumo ou feedback sobreviver ao sair da tela.

Mitigacao:
- `cleanupStudyRoute()` deve chamar a limpeza completa da sessao;
- `syncStudyRoute()` deve resetar progresso ao carregar nova sessao;
- `StudyRoute.vue` ja tem `onBeforeRouteLeave`.

### 8.3 Notificacoes globais

Risco:
- duplicar feedback local com notice global.

Mitigacao:
- remover ou evitar `showNotice('Sessao concluida.')` para a conclusao normal;
- reservar notificacoes globais para erro ou eventos transversais;
- conclusao normal deve ser estado da pagina.

### 8.4 Modo anonimo

Risco:
- mudar comportamento anonimo e criar dependencia de rede desnecessaria.

Mitigacao:
- manter `nextReview()` local;
- manter `learningframe.localStates`;
- nao introduzir `api.anonymousReview()` nesta fatia.

### 8.5 Modo autenticado

Risco:
- aumentar latencia por chamadas extras.

Mitigacao:
- reaproveitar a chamada `api.review()`;
- manter apenas o `api.stats()` ja existente apos review autenticado;
- nao buscar stats para compor resumo.

### 8.6 E2E e banco dedicado

Risco:
- novo E2E depender de banco dev ou dados manuais.

Mitigacao:
- usar a suite existente com Compose dedicado `learningframe-e2e`;
- continuar usando `seed` e reset por teste;
- validar via `npm run e2e`, que executa `down -v`.

### 8.7 Layout e acessibilidade

Risco:
- progresso visual nao ser anunciado ou ratings ficarem menos acessiveis.

Mitigacao:
- usar texto visivel junto da barra;
- usar `aria-label`/`aria-valuenow` se a barra for representada como progressbar;
- manter botoes por role/name;
- nao depender apenas de cor para rating counts.

### 8.8 Escopo

Risco:
- atalhos ou resumo crescerem para um novo painel de estudo.

Mitigacao:
- implementar primeiro progresso, feedback e resumo;
- atalhos ficam opcionais;
- nenhuma configuracao nova de sessao nesta branch.

## 9. Plano de Arquivos

Alteracoes provaveis:

- `frontend/src/App.vue`
  - adicionar estado de progresso/resumo;
  - resetar estado ao carregar/sair de sessao;
  - capturar `ReviewResult` em reviews autenticados;
  - montar feedback local;
  - remover notice global de conclusao normal, se substituido por resumo.

- `frontend/src/routes/routeContext.ts`
  - estender `StudyRouteContext` com progresso, feedback, resumo e empty reason.

- `frontend/src/routes/StudyRoute.vue`
  - repassar props novas para `StudyPage.vue`;
  - opcionalmente conectar atalhos, se entrarem.

- `frontend/src/pages/StudyPage.vue`
  - renderizar progresso;
  - renderizar feedback local;
  - renderizar resumo final;
  - melhorar empty states;
  - manter componente controlado por props/eventos.

- `frontend/src/assets/styles.css`
  - estilos de barra, resumo, feedback e estado vazio;
  - responsivo sem overflow.

- `frontend/e2e/specs/study-session.spec.ts`
  - validar progresso/resumo no estudo autenticado;
  - manter validacao de progresso persistido.

- `frontend/e2e/specs/public-library.spec.ts`
  - ajustar ou ampliar estudo anonimo para validar feedback local ou resumo
    simples, se barato.

Arquivos opcionais:
- `frontend/src/features/study/studySessionTypes.ts`;
- `frontend/src/features/study/studySessionFormatters.ts`;
- testes unitarios para formatadores, se a logica passar de trivial.

Decisao inicial:
- evitar criar `useStudySession` nesta branch, salvo se o estado novo tornar
  `App.vue` claramente pior;
- preferir helpers puros pequenos se necessario;
- manter a arquitetura incremental atual.

## 10. Desenho Tecnico dos Testes

### 10.1 Unitarios

Adicionar teste unitario apenas se houver helper puro para:
- labels de rating;
- labels de intervalo;
- calculo de progresso;
- resumo de ratings.

Se a logica ficar simples em computed/local state, os testes E2E podem ser
suficientes para esta branch.

### 10.2 E2E autenticado

Atualizar `frontend/e2e/specs/study-session.spec.ts`.

Fluxo:
1. login;
2. abrir `/estudo/baralho/:privateProgrammingId`;
3. validar progresso inicial;
4. revelar resposta;
5. avaliar como `Bom`;
6. validar feedback local de rating;
7. se a fila terminar, validar resumo;
8. abrir `/progresso`;
9. validar `Revisados hoje`.

Cuidados:
- a seed atual pode ter mais de uma carta vencida dependendo do deck;
- assercoes devem considerar o total real visivel;
- evitar depender de texto de data absoluto.

### 10.3 E2E anonimo

Possivel ampliacao em `public-library.spec.ts`.

Fluxo:
1. abrir biblioteca publica;
2. estudar deck publico;
3. revelar resposta;
4. avaliar uma carta;
5. validar feedback local;
6. confirmar que `learningframe.localStates` foi atualizado.

Cuidados:
- nao exigir login;
- nao chamar endpoint autenticado;
- manter teste curto.

## 11. Criterios de Aceite

A branch sera considerada concluida quando:
- estudo mostra progresso coerente de sessao;
- feedback local aparece apos rating;
- conclusao da sessao aparece sem depender de notificacao global;
- empty states ficam mais especificos e operacionais;
- comportamento anonimo continua local;
- comportamento autenticado continua persistindo revisoes e stats;
- nao ha alteracao no scheduler/SRS central;
- nao ha backend novo;
- nao ha store global nova;
- `StudyPage.vue` continua sendo componente controlado por props/eventos;
- `npm test` passa;
- `npm run build` passa;
- `npm run e2e` passa se E2E for alterado;
- `git diff --check` nao aponta problemas.

## 12. Ordem Recomendada de Implementacao

1. Adicionar estado de sessao e helpers minimos em `App.vue`.
   - total inicial;
   - revisadas;
   - contadores por rating;
   - feedback local;
   - summary/completed state.

2. Estender `StudyRouteContext` e `StudyRoute.vue`.
   - manter a rota como adaptador;
   - nao mover orquestracao para a pagina visual.

3. Atualizar `StudyPage.vue`.
   - progresso;
   - feedback local;
   - resumo;
   - empty states.

4. Ajustar CSS.
   - desktop e mobile;
   - temas claro/escuro;
   - sem deslocamentos bruscos.

5. Atualizar E2E de estudo.
   - cobrir comportamento observavel principal;
   - nao criar suite extensa.

6. Rodar validacoes.
   - `npm test`;
   - `npm run build`;
   - `npm run e2e`;
   - `git diff --check`.

## 13. Ideias Para Brainstorm Futuro, Fora Desta Branch

Ideias boas, mas grandes demais agora:
- limite configuravel de cartas por sessao;
- escolher decks para pratica intercalada;
- separar novas/revisoes;
- pausar e retomar sessao;
- tempo de resposta por carta;
- leitura por voz;
- painel pos-sessao com tendencia de acerto;
- historico de sessoes;
- metas diarias;
- favoritos para montar pratica intercalada curada.

Essas ideias podem entrar no roadmap depois do MVP academico. Para esta branch,
o melhor resultado e uma tela de estudo mais madura sem aumentar o contrato do
produto.

## 14. Decisao Final de Escopo

Implementar primeiro:
- progresso de sessao;
- feedback local apos rating;
- resumo simples ao finalizar;
- empty states mais especificos.

Avaliar depois, ainda na mesma branch apenas se o custo ficar baixo:
- atalhos de teclado para revelar e avaliar.

Nao implementar nesta branch:
- novo scheduler;
- dashboard;
- configurador de sessao;
- backend novo;
- store global;
- refatoracao ampla do estudo.

## 15. Implementacao Executada

Arquivos alterados:
- `frontend/src/App.vue`;
- `frontend/src/routes/routeContext.ts`;
- `frontend/src/routes/StudyRoute.vue`;
- `frontend/src/pages/StudyPage.vue`;
- `frontend/src/assets/styles.css`;
- `frontend/e2e/specs/study-session.spec.ts`;
- `frontend/e2e/specs/public-library.spec.ts`.

Implementacoes:
- adicionados estado e computeds de sessao para total inicial, revisadas,
  restantes, percentual, contadores por rating, feedback local e resumo final;
- `loadStudyDeck()` e `loadInterleavedPractice()` passaram a inicializar a
  sessao com total fixo e empty reason;
- `reviewCurrent()` passou a capturar o resultado da revisao para feedback
  local, incrementando contadores antes de avancar a fila;
- o estudo autenticado usa o `ReviewResult` retornado por `api.review()`;
- o estudo anonimo continua usando `nextReview()` local e
  `learningframe.localStates`;
- a conclusao normal da sessao passou a ser estado da pagina, sem notice global
  de "sessao concluida";
- `StudyPage.vue` passou a exibir progresso, feedback local, resumo final,
  empty states especificos e acoes para Biblioteca/Pratica intercalada;
- os estilos foram adicionados com barra discreta, bloco de feedback, resumo de
  ratings e responsivo mobile;
- E2E autenticado cobre progresso, feedback local, resumo e progresso
  persistido;
- E2E anonimo cobre progresso, feedback local e persistencia em localStorage.

Decisoes preservadas:
- nenhum endpoint novo foi criado;
- o scheduler/SRS central nao foi alterado;
- `StudyPage.vue` continua controlada por props/eventos;
- `StudyRoute.vue` continua como adaptador;
- nao foi criado `useStudySession`, store global ou refatoracao ampla.

## 16. Validacoes Executadas

Validacoes finais:
- `npm test`: passou, 33 testes frontend com Vitest 4.1.8;
- `npm run build`: passou com `vue-tsc` e `vite build`;
- `npm run e2e`: passou, 14 testes Playwright em Chromium;
- `git diff --check`: sem problemas.

Observacoes:
- `npm test` e `npm run build` precisaram ser repetidos fora do sandbox porque
  a primeira execucao foi bloqueada por permissao ao carregar
  `frontend/vite.config.ts`;
- `npm run e2e` tambem precisou de permissao elevada para acessar o Docker no
  Windows;
- a suite E2E usou o Compose dedicado `learningframe-e2e` e derrubou o ambiente
  com `down -v`, removendo o volume `learningframe-e2e_mysql-e2e-data`.

## 17. Ideias Pos-Validacao Para Proxima Sessao

A validacao manual indicou dois eixos de melhoria relacionados a conforto de
leitura e controle da apresentacao do card. Eles nao devem entrar de imediato
nesta branch sem novo recorte, mas sao candidatos fortes para uma proxima sessao
curta de polimento do estudo.

### 17.1 Ajuste de cards com midia grande

Problema observado:
- alguns cards podem conter imagens maiores que a viewport;
- mesmo com `max-width: 100%`, imagens muito altas podem exigir scroll demais e
  quebrar a sensacao de estudo focado;
- em telas menores, isso pode esconder resposta, ratings ou contexto da sessao.

Ideia:
- adicionar um controle local para adaptar o card a tela quando houver midia
  grande;
- o controle pode alternar entre modo natural e modo ajustado;
- no modo ajustado, imagens do card ficariam limitadas por altura relativa a
  viewport, com `object-fit: contain`;
- o ajuste deve preservar proporcao, legibilidade e acesso ao conteudo completo.

Recorte recomendado:
- implementar primeiro como toggle visual no modo de estudo, sem alterar HTML
  salvo das cartas;
- aplicar somente aos elementos renderizados em `.prompt` e `.answer`;
- manter o default atual ou escolher default ajustado apenas se os testes
  manuais mostrarem que nao prejudica cards pequenos;
- se houver overflow, permitir abrir/voltar ao tamanho natural.

Colateralidades:
- imagens podem ficar pequenas demais em cards ricos se o limite for agressivo;
- audio e texto nao devem ser afetados;
- o comportamento precisa ser bom em desktop e mobile;
- deve evitar layout shift forte ao revelar resposta;
- se houver zoom natural do navegador, o controle nao deve competir com ele.

Validacao futura:
- testar card com imagem alta;
- testar card com imagem larga;
- testar card com apenas texto;
- testar frente e verso com midia;
- conferir que ratings continuam acessiveis sem scroll excessivo.

Viabilidade:
- alta para MVP se tratado como CSS + estado local de exibicao;
- baixo risco se nao persistir preferencia ainda;
- bom candidato para a proxima branch curta.

### 17.2 Controle de fonte no estudo

Problema/necessidade:
- usuarios podem ter necessidades diferentes de leitura;
- cards importados podem variar muito em densidade textual;
- um controle de fonte pode melhorar acessibilidade e conforto sem mudar o
  conteudo.

Ideia:
- adicionar controle simples de tamanho de fonte no modo de estudo;
- possiveis niveis: pequeno, normal, grande;
- aplicar ao conteudo de frente/verso e talvez ao resumo do card, nao ao layout
  inteiro da aplicacao;
- futuramente considerar familia de fonte ou espacamento, mas nao na primeira
  fatia.

Recorte recomendado:
- comecar por tres niveis fixos de escala no estudo;
- manter controle local na sessao ou preferencia simples no navegador;
- evitar slider livre no primeiro momento para reduzir estados e edge cases;
- nao aplicar ao editor de cartas nesta mesma etapa.

Colateralidades:
- fonte maior aumenta altura do card e pode piorar o problema de midia se os
  dois ajustes nao forem pensados juntos;
- cards com tabelas ou HTML importado podem reagir de forma irregular;
- controles demais na tela de estudo podem competir com o foco;
- se a preferencia for persistida, precisa decidir chave de `localStorage` e
  reset/compatibilidade.

Validacao futura:
- testar texto curto, texto longo e lista HTML;
- testar tema claro/escuro;
- testar mobile;
- testar com progresso, feedback e resumo atuais.

Viabilidade:
- media-alta;
- melhor se vier depois ou junto do ajuste de midia, com um pequeno bloco de
  "preferencias de leitura" no estudo.

### 17.3 Text-to-speech

Ideia futura:
- oferecer leitura por voz do texto do card.

Classificacao:
- pos-MVP ou branch propria, nao como polimento pequeno imediato.

Motivos:
- exige decidir Web Speech API vs servico externo;
- precisa tratar idioma, vozes, disponibilidade por navegador e acessibilidade;
- cards com HTML, imagens e audio importado exigem extracao/sanitizacao de texto;
- pode conflitar com cards que ja possuem audio `[sound:...]`;
- testes automatizados sao mais limitados.

Recorte futuro possivel:
- primeiro prototipo apenas com Web Speech API do navegador;
- botao de ouvir frente/verso;
- fallback silencioso quando API nao estiver disponivel;
- nao persistir audio gerado;
- nao enviar conteudo a servicos externos no MVP academico.

Viabilidade:
- boa como pesquisa/prototipo;
- risco e escopo maiores que os dois ajustes visuais;
- recomendado documentar como roadmap, nao como proxima microbranch.
