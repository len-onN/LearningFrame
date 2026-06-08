# Roadmap de Profissionalizacao Pos-MVP

Data: 2026-06-08
Branch de registro: `codex/post-mvp-context-roadmap`

Este documento consolida o contexto de produto e as frentes de evolucao apos o
MVP academico do LearningFrame. Ele nao substitui o
[Estado final do MVP](estado-final-mvp.md), mas serve como ponte entre o MVP
validado e uma possivel versao publicavel para uso amplo.

## 1. Contexto de produto

O LearningFrame deve ser entendido como uma aplicacao gratuita de suporte ao
aprendizado, ofertada por uma instituicao de ensino para estudantes.

O MVP atual demonstra a experiencia essencial do estudante:
- acesso inicial sem conta;
- estudo de baralhos publicos;
- conta opcional para persistir baralhos, revisoes, midias e progresso;
- recordacao ativa;
- repeticao espacada;
- pratica intercalada;
- interoperabilidade basica com Anki por `.apkg`.

Esse contexto institucional fortalece a narrativa academica porque transforma o
produto em uma ferramenta de apoio educacional, nao apenas em um aplicativo
pessoal de estudos.

## 2. Decisao de escopo institucional

O MVP nao integra sistemas reais de uma instituicao de ensino.

Para o MVP, a instituicao aparece como contexto, proponente ou ofertante da
ferramenta. A integracao com dados academicos reais fica para fases futuras,
pois envolve autenticacao institucional, turmas, cursos, disciplinas, papeis,
governanca de conteudo e privacidade.

Decisao atual:
- manter o MVP como demonstracao funcional local;
- tratar integracao institucional como roadmap;
- nao reabrir o MVP para SSO, turmas, disciplinas ou sincronizacao de dados;
- documentar que a Biblioteca publica pode representar conteudos curados pela
  instituicao no cenario demonstrado.

## 3. Pratica intercalada

A pratica intercalada e uma das tres bases pedagogicas do LearningFrame. Por
isso, ela merece uma avaliacao mais cuidadosa do que outras melhorias comuns de
produto.

### 3.1 Estado atual

No backend, o endpoint de estudo ja aceita `deckIds` em:

```txt
GET /api/study/due?mode=MIXED_DUE&deckIds=1&deckIds=2
```

Quando `deckIds` nao e informado, o backend busca cartas vencidas de todos os
baralhos acessiveis ao usuario autenticado:
- baralhos publicos;
- baralhos proprios do usuario.

A ordenacao inicial considera:
- cartas ja vencidas antes de cartas novas;
- `dueAt`;
- atualizacao do baralho;
- criacao da carta.

Depois disso, o backend aplica uma mistura simples por baralho, em round-robin:
pega uma carta do primeiro baralho, uma do segundo, e assim sucessivamente ate
atingir o limite.

No frontend autenticado, a pratica intercalada atual chama apenas:

```txt
GET /api/study/due?mode=MIXED_DUE
```

Ou seja:
- o usuario nao escolhe de quais baralhos quer intercalar;
- o suporte a `deckIds` existe no backend, mas ainda nao foi exposto pelo
  cliente;
- nao ha selecao explicita de recorte de estudo.

No estudo anonimo, o frontend usa uma estrategia local simples:
- carrega baralhos publicos;
- considera ate quatro baralhos publicos carregados;
- mistura as cartas elegiveis localmente.

### 3.2 Limite conhecido

A logica atual nao analisa variabilidade de tags, topicos, disciplinas ou grau
de semelhanca semantica entre cartas.

Ela entrega uma pratica intercalada basica por baralho, suficiente para
demonstrar a ideia no MVP, mas ainda distante de uma logica pedagogica mais
sofisticada.

### 3.3 Classificacao

Selecao de baralhos para pratica intercalada:
- classificacao: candidata forte a ajuste de MVP ou MVP+;
- motivo: a pratica intercalada e parte central da narrativa pedagogica;
- risco: sem selecao, o usuario perde controle sobre o recorte de estudo;
- recomendacao: implementar em branch curta antes de evolucoes maiores, se o
  objetivo for reforcar a defesa academica do produto.

Intercalamento por tags ou variabilidade pedagogica:
- classificacao: pos-MVP;
- motivo: exige criterios de diversidade, testes, talvez alteracao de modelo e
  definicao de heuristicas pedagogicas;
- recomendacao: documentar como evolucao futura, nao como correcao urgente do
  MVP.

### 3.4 Escopo sugerido para selecao de baralhos

Branch sugerida:

```txt
codex/mvp-interleaved-deck-selection
```

Escopo inicial:
- permitir selecionar baralhos para iniciar pratica intercalada;
- reutilizar o suporte backend existente a `deckIds`;
- ajustar `frontend/src/services/api.ts` para enviar multiplos `deckIds`;
- escolher uma superficie simples, preferencialmente na Biblioteca ou no inicio
  da tela de Estudo;
- manter a logica de mistura por baralho;
- nao implementar algoritmo por tags nesta branch.

Criterios de aceite:
- usuario autenticado consegue escolher dois ou mais baralhos acessiveis e
  iniciar pratica intercalada apenas com esse recorte;
- se nenhum baralho for escolhido, o comportamento global atual continua
  disponivel ou vira uma opcao explicita;
- mensagens deixam claro quando nao ha cartas vencidas no recorte selecionado;
- E2E cobre inicio da pratica com baralhos selecionados;
- testes backend cobrem `MIXED_DUE` com `deckIds`;
- a documentacao explica o limite da mistura por baralho.

Questoes de produto antes da implementacao:
- a selecao deve incluir apenas `Meus baralhos`, apenas publicos, ou ambos?
- baralhos publicos estudados anonimamente devem poder ser escolhidos para
  intercalamento anonimo?
- a selecao deve morar na Biblioteca, no Estudo ou em uma tela dedicada de
  configuracao simples?
- a rota `/estudo/intercalado` deve preservar `deckIds` em query string para
  refresh/back-forward?

## 4. Integracao institucional

A integracao com dados de uma instituicao de ensino deve ser tratada como uma
frente de produto propria.

Evolucao possivel:

1. Conteudo institucional curado manualmente
   - baralhos publicos representam materiais oficiais ou recomendados;
   - sem integracao tecnica com sistemas externos.

2. Papeis institucionais
   - estudante;
   - professor ou autor de conteudo;
   - administrador institucional;
   - governanca de publicacao de baralhos oficiais.

3. Organizacao academica
   - cursos;
   - disciplinas;
   - turmas;
   - periodos;
   - colecoes de baralhos por contexto.

4. Autenticacao institucional
   - SSO ou login federado;
   - vinculo entre usuario e instituicao;
   - politicas de sessao e seguranca mais fortes.

5. Sincronizacao de dados
   - importacao de estudantes, turmas e disciplinas;
   - associacao de conteudos a turmas;
   - sincronizacao incremental;
   - trilha de auditoria.

6. Interface generica de integracao
   - contratos de API para multiplas instituicoes;
   - adaptadores por fonte externa;
   - mapeamento configuravel de cursos, turmas e usuarios;
   - isolamento entre instituicoes.

7. Relatorios institucionais
   - dados agregados de uso;
   - indicadores por turma ou disciplina;
   - preservacao de privacidade individual;
   - politicas alinhadas a LGPD.

## 5. Debitos tecnicos para produto publicavel

Os itens abaixo nao bloqueiam o MVP academico, mas devem ser tratados antes de
uso amplo ou sensivel.

### 5.1 Seguranca e privacidade

- substituir ou endurecer o armazenamento de token em `localStorage`;
- revisar token em query string para midias privadas;
- definir politica de expiracao, refresh e revogacao de sessoes;
- revisar CORS para ambientes reais;
- documentar tratamento de dados pessoais;
- avaliar LGPD para contexto institucional.

### 5.2 Observabilidade e operacao

- adicionar logging estruturado no backend;
- registrar erros inesperados sem vazar detalhes ao cliente;
- definir correlacao de requisicoes;
- preparar health checks reais;
- criar estrategia de monitoramento e alertas.

### 5.3 Qualidade e CI

- adicionar lint frontend;
- adicionar format/check Java, como Spotless ou Checkstyle;
- criar comando agregado de qualidade;
- impedir `console.*`, `debugger`, `System.out` e `printStackTrace` em codigo
  principal;
- rodar testes frontend, backend e E2E em CI;
- ampliar testes multi-browser quando o produto mirar usuarios reais.

### 5.4 Arquitetura frontend

- reduzir gradualmente o papel do `App.vue`;
- extrair workflows de dominio para composables pequenos e testaveis;
- evitar store global ate haver necessidade real;
- manter paginas visuais como superficies controladas por props/eventos;
- dividir CSS global em camadas mais claras quando isso reduzir custo real de
  manutencao.

### 5.5 Midias e importacao

- migrar midias de BLOB no MySQL para storage externo;
- manter metadados no banco relacional;
- avaliar fila/job assincrono para APKGs grandes;
- oferecer progresso real de importacao;
- revisar limites de upload por ambiente.

### 5.6 Modelo pedagogico

- documentar a heuristica atual de SRS;
- evitar alterar o scheduler sem testes;
- evoluir pratica intercalada de "por baralho" para criterios mais ricos apenas
  quando houver definicao pedagogica clara;
- considerar tags, disciplinas, topicos e historico de erro em uma fase futura.

## 6. Roadmap recomendado

### Fase 0 - Fechamento consciente do MVP

Objetivo:
- preservar o MVP como entrega academica valida;
- documentar contexto institucional e limites;
- decidir se selecao de baralhos na pratica intercalada entra como ajuste curto
  antes do marco final.

Possiveis branches:
- `codex/post-mvp-context-roadmap`;
- `codex/mvp-interleaved-deck-selection`, se a selecao for priorizada.

### Fase 1 - Profissionalizacao tecnica

Objetivo:
- transformar o projeto em base mais segura para evolucao continua.

Frentes:
- quality gates;
- CI;
- logging;
- hardening de autenticacao;
- documentacao operacional;
- reducao gradual de concentracao no frontend.

### Fase 2 - Produto institucional inicial

Objetivo:
- tornar a narrativa institucional visivel no produto sem integrar sistemas
  externos complexos.

Frentes:
- conteudos oficiais ou curados;
- perfis de autor/professor;
- organizacao por disciplina;
- publicacao controlada de baralhos;
- relatorios agregados simples.

### Fase 3 - Integracao institucional real

Objetivo:
- conectar o LearningFrame a sistemas academicos reais.

Frentes:
- SSO;
- turmas;
- matriculas;
- sincronizacao;
- contratos de API;
- privacidade e auditoria;
- multi-instituicao.

### Fase 4 - Plataforma educacional ampliada

Objetivo:
- evoluir de MVP institucional para produto amplo.

Frentes:
- marketplace ou catalogo institucional;
- editor rico;
- busca full-text;
- recomendacoes;
- dashboards avancados;
- mecanismos pedagogicos mais sofisticados.

## 7. Criterios para considerar publicavel

Antes de ofertar para uso amplo, o produto deve ter:
- autenticacao e sessao endurecidas;
- politica de privacidade e retencao de dados;
- logs e monitoramento basicos;
- CI com testes automatizados;
- deploy reproduzivel;
- storage de midia adequado;
- migracoes revisadas;
- testes E2E dos fluxos principais;
- documentacao de administracao;
- definicao clara de suporte e manutencao;
- criterios de acessibilidade revisados;
- decisao sobre como a instituicao cura e publica conteudos.

## 8. Regra de evolucao

Cada frente futura deve responder:
1. Qual problema real ela resolve?
2. Ela pertence ao MVP, ao MVP+, ou a profissionalizacao?
3. Quais riscos ela reduz ou introduz?
4. Quais testes validam a mudanca?
5. Qual documento precisa ser atualizado?

Essa regra evita que o projeto cresca por ansiedade de completude e preserva a
narrativa central: uma ferramenta gratuita, institucional e tecnicamente
defensavel para apoiar o aprendizado.
