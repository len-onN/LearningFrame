# Plano da Branch: Ajuste do Modo de Estudo e Pratica Intercalada

Branch de trabalho:
- `codex/study-mode-interleaved-polish`

Base confirmada:
- branch criada a partir de `develop`;
- commit base observado: `b59e02b`;
- worktree limpa no inicio da branch.

## 1. Objetivo

Corrigir e polir dois pontos do modo de estudo sem reabrir arquitetura ampla:

- tornar o controle de fonte dos cards de estudo incremental, previsivel e
  limitado;
- permitir que o usuario selecione baralhos para sessoes de pratica
  intercalada.

Esta frente e uma correcao de MVP/MVP+, nao uma reformulacao do estudo. O foco
e manter a sessao simples, guiada e coerente com os principios atuais do
LearningFrame.

## 2. Diagnostico Atual

### 2.1 Tipografia dos cards de estudo

Arquivos relevantes:
- `frontend/src/pages/StudyPage.vue`;
- `frontend/src/assets/styles.css`;
- `frontend/src/utils/html.ts`;
- `frontend/src/utils/html.test.ts`.

Estado atual:
- `StudyPage.vue` usa `studyFontSize` com tres valores fixos:
  `compact`, `default` e `large`;
- a UI mostra tres opcoes: `A-`, `A` e `A+`;
- o CSS do estado padrao usa `clamp(1.35rem, 2.5vw, 2rem)` para a frente;
- os estados `compact` e `large` usam valores fixos em `rem`;
- `safeStudyHtml()` remove scripts/event handlers, mas nao remove `style` de
  fonte vindo do HTML da carta.

Hipotese tecnica do bug:
- o estado inicial pode aparecer com uma escala diferente das opcoes fixas
  porque mistura `vw`/`clamp` com classes fixas;
- cartas importadas ou editadas podem trazer `style="font-size: ..."` ou
  atributos semelhantes, fazendo o HTML interno escapar do controle visual da
  tela de estudo.

Direcao recomendada:
- substituir os tres estados fixos por uma escala numerica com `A-` e `A+`;
- remover a dependencia de `vw` na fonte do estudo;
- normalizar a tipografia exibida no estudo para que o controle local mande na
  leitura, sem alterar o conteudo salvo do card.

### 2.2 Pratica intercalada

Arquivos relevantes:
- `frontend/src/features/study/useStudySession.ts`;
- `frontend/src/features/study/useStudySession.test.ts`;
- `frontend/src/pages/StudyPage.vue`;
- `frontend/src/routes/routeContext.ts`;
- `frontend/src/App.vue`;
- `frontend/src/services/api.ts`;
- `backend/src/main/java/com/learningframe/api/study/StudyController.java`;
- `backend/src/main/java/com/learningframe/api/study/StudyService.java`;
- `backend/src/main/java/com/learningframe/api/repository/CardRepository.java`.

Estado atual:
- a rota `/estudo/intercalado` existe;
- `App.vue` chama `loadInterleavedPractice()` ao entrar nessa rota;
- usuario autenticado chama `api.due('MIXED_DUE')` sem `deckIds`;
- visitante mistura localmente os primeiros quatro baralhos publicos carregados;
- o backend ja aceita `deckIds` em `/api/study/due` e possui
  `findMixedDueInDecks`;
- o servico TypeScript `api.due()` ainda nao expoe `deckIds`.

Lacuna de produto:
- o usuario nao escolhe o recorte da pratica intercalada;
- a sessao pode misturar baralhos demais, ou baralhos que o usuario nao quer
  revisar naquele momento;
- para visitante, a selecao atual "primeiros quatro publicos" e util como
  demonstracao, mas pouco intencional.

## 3. Escopo

Incluido:
- trocar o controle visual de fonte para dois botoes incrementais `A-` e `A+`;
- definir limites explicitos de fonte, com pelo menos uma ou duas etapas acima
  do maior tamanho atual;
- garantir que o estado padrao e os ajustes usem uma escala consistente;
- impedir que font-size embutido no HTML da carta quebre a escala visual do
  estudo;
- criar uma superficie simples de selecao de baralhos para pratica intercalada;
- passar `deckIds` para o backend no fluxo autenticado;
- respeitar os baralhos publicos selecionados no fluxo anonimo;
- preservar a rota `/estudo/intercalado`;
- cobrir os novos comportamentos com testes focados.

Fora de escopo:
- alterar o algoritmo SRS;
- criar dashboard ou configurador avancado de sessao;
- persistir preferencia de fonte;
- intercalar por tags, topicos, dificuldade ou objetivos pedagogicos;
- criar store global;
- reabrir refatoracao ampla de `App.vue`;
- mudar o backend se o contrato atual de `deckIds` for suficiente.

## 4. Plano de Implementacao

### 4.1 Controle incremental de fonte

1. Trocar `studyFontSize` em `StudyPage.vue` por `studyFontLevel`.
2. Definir constantes locais ou helper pequeno:
   - minimo sugerido: `-1`;
   - padrao: `0`;
   - maximo sugerido: `3`.
3. Usar apenas dois botoes principais:
   - `A-` decrementa ate o minimo;
   - `A+` incrementa ate o maximo;
   - ambos ficam desabilitados nos limites.
4. Se necessario, manter um botao/icone discreto de reset, mas nao transformar a
   barra em seletor de muitas opcoes.
5. Substituir classes `font-compact`, `font-default`, `font-large` por classes
   ou variaveis estaveis baseadas no nivel.
6. Remover a fonte com `vw` do estudo e usar valores previsiveis em `rem`.
7. Aplicar a escala em `.prompt` e `.answer`, com line-height consistente.
8. Normalizar a tipografia interna do HTML renderizado:
   - opcao preferida: helper testavel em `frontend/src/utils/html.ts` que remove
     apenas declaracoes de fonte no HTML retornado por `safeStudyHtml()`;
   - alternativa aceitavel: CSS restrito a `.study-card` com override de
     `font-size` nos descendentes, sem alterar editor, preview ou conteudo salvo.

Sugestao de escala:
- nivel `-1`: frente `1.15rem`, verso `1rem`;
- nivel `0`: frente `1.35rem`, verso `1.08rem`;
- nivel `1`: frente `1.65rem`, verso `1.2rem`;
- nivel `2`: frente `1.95rem`, verso `1.35rem`;
- nivel `3`: frente `2.25rem`, verso `1.5rem`.

### 4.2 Selecao de baralhos para pratica intercalada

1. Atualizar `api.due()` para aceitar opcoes:
   - `deckId`;
   - `deckIds`;
   - `limit`.
2. Manter compatibilidade com chamadas atuais de estudo por baralho.
3. Adicionar estado de selecao no dominio de estudo, preferencialmente em
   `useStudySession` ou em composable pequeno de apoio:
   - lista de baralhos disponiveis;
   - ids selecionados;
   - limite maximo sugerido de selecao: 8 baralhos;
   - selecao inicial com os primeiros baralhos carregados, ate 4;
   - acoes de selecionar, limpar e iniciar sessao.
4. Para usuario autenticado:
   - carregar `Meus baralhos` e, se for simples, tambem publicos acessiveis;
   - enviar `deckIds` selecionados para `MIXED_DUE`;
   - preservar autorizacao do backend, que ja filtra por publicos ou proprios.
5. Para visitante:
   - usar baralhos publicos selecionados;
   - carregar detalhes apenas dos selecionados;
   - intercalar localmente por baralho, em vez de apenas concatenar listas.
6. Alterar o comportamento da rota `/estudo/intercalado`:
   - entrar na rota prepara a selecao;
   - o usuario confirma para iniciar;
   - se ja houver selecao e ele clicar novamente em pratica intercalada, recarrega
     a selecao ou reinicia a sessao de forma previsivel.
7. Renderizar a selecao como painel simples dentro de `StudyPage.vue` ou como
   componente `frontend/src/features/study/InterleavedDeckSelector.vue`.
8. Usar checkboxes para selecao de baralhos e botoes com icones para comandos.
9. Definir empty states:
   - visitante sem publicos carregados;
   - usuario logado sem baralhos proprios;
   - nenhum baralho selecionado;
   - baralhos selecionados sem cards vencidos.

## 5. Testes e Validacao

Testes unitarios esperados:
- `frontend/src/features/study/useStudySession.test.ts`
  - carrega pratica intercalada autenticada com `deckIds` selecionados;
  - carrega pratica intercalada anonima apenas com publicos selecionados;
  - intercala cartas anonimas por baralho, sem simples concatenacao;
  - respeita limites de selecao.
- `frontend/src/utils/html.test.ts`
  - confirma que `safeStudyHtml()` nao permite que font-size interno quebre a
    escala do estudo, se a normalizacao for feita no helper.

Teste E2E recomendado:
- expandir `frontend/e2e/specs/study-session.spec.ts` com um fluxo curto:
  - login;
  - abrir `/estudo/intercalado`;
  - selecionar dois baralhos;
  - iniciar pratica intercalada;
  - confirmar que aparecem cartas dos baralhos escolhidos;
  - registrar pelo menos uma revisao.

Validacoes de comando:
- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `cd frontend && npm run e2e` se houver novo E2E ou mudanca observavel no fluxo;
- `git diff --check`.

Testes backend:
- nao sao obrigatorios se o backend permanecer sem alteracao;
- se for necessario ajustar validacao de `deckIds`, rodar a suite Maven do
  backend e adicionar teste focado em `StudyService`.

## 6. Riscos e Cuidados

- Nao remover estilo visual util de cartas importadas de forma global. A
  normalizacao deve valer para a exibicao de estudo, nao para o conteudo salvo.
- Nao transformar a pratica intercalada em configurador grande.
- Nao carregar todos os baralhos do usuario de uma vez se a paginacao atual for
  suficiente para uma primeira versao.
- Nao quebrar a rota existente `/estudo/intercalado`.
- Nao usar banco dev em E2E.
- Nao alterar SRS como efeito colateral de UI.

## 7. Criterios de Aceite

- O card de estudo abre com a mesma escala base que os controles incrementais
  usam.
- `A-` e `A+` alteram a fonte em passos previsiveis e param nos limites.
- O usuario consegue aumentar a fonte pelo menos uma ou duas etapas alem do
  tamanho grande atual.
- HTML com fonte embutida nao impede o ajuste de tamanho no estudo.
- A pratica intercalada permite escolher baralhos antes de iniciar a sessao.
- O fluxo autenticado envia os `deckIds` escolhidos para `MIXED_DUE`.
- O fluxo anonimo usa apenas os publicos escolhidos.
- A sessao continua mostrando progresso, feedback local e resumo final.
- Testes e build passam.
