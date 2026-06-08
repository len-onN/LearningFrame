# Roadmap de Profissionalização Pós-MVP

Data: 2026-06-08
Branch de registro: `codex/post-mvp-context-roadmap`

Este documento consolida o contexto de produto e as frentes de evolução após o
MVP acadêmico do LearningFrame. Ele não substitui o
[Estado final do MVP](estado-final-mvp.md), mas serve como ponte entre o MVP
validado e uma possível versão publicável para uso amplo.

## 1. Contexto de produto

O LearningFrame deve ser entendido como uma aplicação gratuita de suporte ao
aprendizado, ofertada por uma instituição de ensino para estudantes.

O MVP atual demonstra a experiência essencial do estudante:
- acesso inicial sem conta;
- estudo de baralhos públicos;
- conta opcional para persistir baralhos, revisões, mídias e progresso;
- recordação ativa;
- repetição espaçada;
- prática intercalada;
- interoperabilidade básica com Anki por `.apkg`.

Esse contexto institucional fortalece a narrativa acadêmica porque transforma o
produto em uma ferramenta de apoio educacional, não apenas em um aplicativo
pessoal de estudos.

## 2. Decisão de escopo institucional

O MVP não integra sistemas reais de uma instituição de ensino.

Para o MVP, a instituição aparece como contexto, proponente ou ofertante da
ferramenta. A integração com dados acadêmicos reais fica para fases futuras,
pois envolve autenticação institucional, turmas, cursos, disciplinas, papéis,
governança de conteúdo e privacidade.

Decisão atual:
- manter o MVP como demonstração funcional local;
- tratar integração institucional como roadmap;
- não reabrir o MVP para SSO, turmas, disciplinas ou sincronização de dados;
- documentar que a Biblioteca pública pode representar conteúdos curados pela
  instituição no cenário demonstrado.

## 3. Prática intercalada

A prática intercalada é uma das três bases pedagógicas do LearningFrame. Por
isso, ela merece uma avaliação mais cuidadosa do que outras melhorias comuns de
produto.

### 3.1 Estado atual

No backend, o endpoint de estudo já aceita `deckIds` em:

```txt
GET /api/study/due?mode=MIXED_DUE&deckIds=1&deckIds=2
```

Quando `deckIds` não é informado, o backend busca cartas vencidas de todos os
baralhos acessíveis ao usuário autenticado:
- baralhos públicos;
- baralhos próprios do usuário.

A ordenação inicial considera:
- cartas já vencidas antes de cartas novas;
- `dueAt`;
- atualização do baralho;
- criação da carta.

Depois disso, o backend aplica uma mistura simples por baralho, em round-robin:
pega uma carta do primeiro baralho, uma do segundo, e assim sucessivamente até
atingir o limite.

No frontend autenticado, a prática intercalada atual chama apenas:

```txt
GET /api/study/due?mode=MIXED_DUE
```

Ou seja:
- o usuário não escolhe de quais baralhos quer intercalar;
- o suporte a `deckIds` existe no backend, mas ainda não foi exposto pelo
  cliente;
- não há seleção explícita de recorte de estudo.

No estudo anônimo, o frontend usa uma estratégia local simples:
- carrega baralhos públicos;
- considera até quatro baralhos públicos carregados;
- mistura as cartas elegíveis localmente.

### 3.2 Limite conhecido

A lógica atual não analisa variabilidade de tags, tópicos, disciplinas ou grau
de semelhança semântica entre cartas.

Ela entrega uma prática intercalada básica por baralho, suficiente para
demonstrar a ideia no MVP, mas ainda distante de uma lógica pedagógica mais
sofisticada.

### 3.3 Classificação

Seleção de baralhos para prática intercalada:
- classificação: candidata forte a ajuste de MVP ou MVP+;
- motivo: a prática intercalada é parte central da narrativa pedagógica;
- risco: sem seleção, o usuário perde controle sobre o recorte de estudo;
- recomendação: implementar em branch curta antes de evoluções maiores, se o
  objetivo for reforçar a defesa acadêmica do produto.

Intercalamento por tags ou variabilidade pedagógica:
- classificação: pós-MVP;
- motivo: exige critérios de diversidade, testes, talvez alteração de modelo e
  definição de heurísticas pedagógicas;
- recomendação: documentar como evolução futura, não como correção urgente do
  MVP.

### 3.4 Escopo sugerido para seleção de baralhos

Branch sugerida:

```txt
codex/mvp-interleaved-deck-selection
```

Escopo inicial:
- permitir selecionar baralhos para iniciar prática intercalada;
- reutilizar o suporte backend existente a `deckIds`;
- ajustar `frontend/src/services/api.ts` para enviar múltiplos `deckIds`;
- escolher uma superfície simples, preferencialmente na Biblioteca ou no início
  da tela de Estudo;
- manter a lógica de mistura por baralho;
- não implementar algoritmo por tags nesta branch.

Critérios de aceite:
- usuário autenticado consegue escolher dois ou mais baralhos acessíveis e
  iniciar prática intercalada apenas com esse recorte;
- se nenhum baralho for escolhido, o comportamento global atual continua
  disponível ou vira uma opção explícita;
- mensagens deixam claro quando não há cartas vencidas no recorte selecionado;
- E2E cobre início da prática com baralhos selecionados;
- testes backend cobrem `MIXED_DUE` com `deckIds`;
- a documentação explica o limite da mistura por baralho.

Questoes de produto antes da implementação:
- a seleção deve incluir apenas `Meus baralhos`, apenas públicos, ou ambos?
- baralhos públicos estudados anonimamente devem poder ser escolhidos para
  intercalamento anônimo?
- a seleção deve morar na Biblioteca, no Estudo ou em uma tela dedicada de
  configuração simples?
- a rota `/estudo/intercalado` deve preservar `deckIds` em query string para
  refresh/back-forward?

## 4. Integração institucional

A integração com dados de uma instituição de ensino deve ser tratada como uma
frente de produto própria.

Evolução possível:

1. Conteúdo institucional curado manualmente
   - baralhos públicos representam materiais oficiais ou recomendados;
   - sem integração técnica com sistemas externos.

2. Papéis institucionais
   - estudante;
   - professor ou autor de conteúdo;
   - administrador institucional;
   - governança de públicação de baralhos oficiais.

3. Organização acadêmica
   - cursos;
   - disciplinas;
   - turmas;
   - periodos;
   - coleções de baralhos por contexto.

4. Autenticação institucional
   - SSO ou login federado;
   - vínculo entre usuário e instituição;
   - políticas de sessão e segurança mais fortes.

5. Sincronização de dados
   - importação de estudantes, turmas e disciplinas;
   - associacao de conteúdos a turmas;
   - sincronização incremental;
   - trilha de auditoria.

6. Interface genérica de integração
   - contratos de API para múltiplas instituições;
   - adaptadores por fonte externa;
   - mapeamento configuravel de cursos, turmas e usuários;
   - isolamento entre instituições.

7. Relatórios institucionais
   - dados agregados de uso;
   - indicadores por turma ou disciplina;
   - preservacao de privacidade individual;
   - políticas alinhadas a LGPD.

## 5. Debitos técnicos para produto publicável

Os itens abaixo não bloqueiam o MVP acadêmico, mas devem ser tratados antes de
uso amplo ou sensível.

### 5.1 Segurança e privacidade

- substituir ou endurecer o armazenamento de token em `localStorage`;
- revisar token em query string para mídias privadas;
- definir política de expiracao, refresh e revogacao de sessões;
- revisar CORS para ambientes reais;
- documentar tratamento de dados pessoais;
- avaliar LGPD para contexto institucional.

### 5.2 Observabilidade e operação

- adicionar logging estruturado no backend;
- registrar erros inesperados sem vazar detalhes ao cliente;
- definir correlacao de requisições;
- preparar health checks reais;
- criar estratégia de monitoramento e alertas.

### 5.3 Qualidade e CI

- adicionar lint frontend;
- adicionar format/check Java, como Spotless ou Checkstyle;
- criar comando agregado de qualidade;
- impedir `console.*`, `debugger`, `System.out` e `printStackTrace` em código
  principal;
- rodar testes frontend, backend e E2E em CI;
- ampliar testes multi-browser quando o produto mirar usuários reais.

### 5.4 Arquitetura frontend

- reduzir gradualmente o papel do `App.vue`;
- extrair workflows de domínio para composables pequenos e testáveis;
- evitar store global até haver necessidade real;
- manter páginas visuais como superfícies controladas por props/eventos;
- dividir CSS global em camadas mais claras quando isso reduzir custo real de
  manutenção.

### 5.5 Mídias e importação

- migrar mídias de BLOB no MySQL para storage externo;
- manter metadados no banco relacional;
- avaliar fila/job assíncrono para APKGs grandes;
- oferecer progresso real de importação;
- revisar limites de upload por ambiente.

### 5.6 Modelo pedagógico

- documentar a heurística atual de SRS;
- evitar alterar o scheduler sem testes;
- evoluir prática intercalada de "por baralho" para critérios mais ricos apenas
  quando houver definição pedagógica clara;
- considerar tags, disciplinas, tópicos e histórico de erro em uma fase futura.

## 6. Roadmap recomendado

### Fase 0 - Fechamento consciente do MVP

Objetivo:
- preservar o MVP como entrega acadêmica valida;
- documentar contexto institucional e limites;
- decidir se seleção de baralhos na prática intercalada entra como ajuste curto
  antes do marco final.

Possíveis branches:
- `codex/post-mvp-context-roadmap`;
- `codex/mvp-interleaved-deck-selection`, se a seleção for priorizada.

### Fase 1 - Profissionalização técnica

Objetivo:
- transformar o projeto em base mais segura para evolução continua.

Frentes:
- quality gates;
- CI;
- logging;
- hardening de autenticação;
- documentação operacional;
- redução gradual de concentracao no frontend.

### Fase 2 - Produto institucional inicial

Objetivo:
- tornar a narrativa institucional visível no produto sem integrar sistemas
  externos complexos.

Frentes:
- conteúdos oficiais ou curados;
- perfis de autor/professor;
- organização por disciplina;
- públicação controlada de baralhos;
- relatórios agregados simples.

### Fase 3 - Integração institucional real

Objetivo:
- conectar o LearningFrame a sistemas acadêmicos reais.

Frentes:
- SSO;
- turmas;
- matriculas;
- sincronização;
- contratos de API;
- privacidade e auditoria;
- multi-instituição.

### Fase 4 - Plataforma educacional ampliada

Objetivo:
- evoluir de MVP institucional para produto amplo.

Frentes:
- marketplace ou catalogo institucional;
- editor rico;
- busca full-text;
- recomendações;
- dashboards avançados;
- mecanismos pedagógicos mais sofisticados.

## 7. Critérios para considerar publicável

Antes de ofertar para uso amplo, o produto deve ter:
- autenticação e sessão endurecidas;
- política de privacidade e retenção de dados;
- logs e monitoramento básicos;
- CI com testes automatizados;
- deploy reproduzível;
- storage de mídia adequado;
- migracoes revisadas;
- testes E2E dos fluxos principais;
- documentação de administração;
- definição clara de suporte e manutenção;
- critérios de acessibilidade revisados;
- decisão sobre como a instituição cura e pública conteúdos.

## 8. Regra de evolução

Cada frente futura deve responder:
1. Qual problema real ela resolve?
2. Ela pertence ao MVP, ao MVP+, ou a profissionalização?
3. Quais riscos ela reduz ou introduz?
4. Quais testes validam a mudança?
5. Qual documento precisa ser atualizado?

Essa regra evita que o projeto cresca por ansiedade de completude e preserva a
narrativa central: uma ferramenta gratuita, institucional e tecnicamente
defensável para apoiar o aprendizado.
