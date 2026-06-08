# Principios e Padroes do MVP

Este documento registra o estado normativo atual do LearningFrame para futuras
branches. Ele resume decisoes que devem ser preservadas enquanto o produto
evolui a partir do MVP.

Quando houver duvida entre um plano antigo e este documento, siga este
documento e consulte a [memoria de decisoes](ai_context/memoria-de-decisoes.md)
para entender a origem da decisao.

## 1. Visao do produto

LearningFrame e um MVP academico para estudo com:
- recordacao ativa;
- repeticao espacada;
- pratica intercalada.

O objetivo e demonstrar uma aplicacao funcional, explicavel e defensavel, nao
criar uma plataforma completa de aprendizagem.

Como contexto de produto, o LearningFrame pode ser apresentado como uma
aplicacao gratuita de suporte ao aprendizado ofertada por uma instituicao de
ensino. A integracao real com sistemas institucionais fica fora do MVP e esta
registrada no
[Roadmap de profissionalizacao pos-MVP](roadmap-profissionalizacao-pos-mvp.md).

## 2. Escopo atual

Incluido:
- estudo anonimo de baralhos publicos;
- conta opcional;
- persistencia autenticada de baralhos, cartas, midias, revisoes e progresso;
- gerenciamento de baralhos e cartas;
- importacao APKG basica;
- estudo por baralho;
- pratica intercalada;
- progresso essencial;
- E2E dedicado;
- QA manual final aprovado.

Fora do MVP:
- clone completo do Anki;
- `.colpkg`;
- cloze avancado;
- templates complexos;
- historico e scheduler original do Anki;
- marketplace;
- favoritos;
- filtros avancados;
- busca full-text;
- dashboard avancado;
- perfil e recuperacao de senha;
- storage externo de midia;
- text-to-speech.

## 3. Principios de produto

- Experimentar deve ser possivel sem conta.
- Persistir conhecimento exige conta.
- Biblioteca deve conter baralhos prontos para uso, nao rascunhos temporarios.
- Importacao APKG deve ser honesta sobre limites.
- Estudo deve priorizar foco, clareza e baixa friccao.
- Funcionalidades futuras devem respeitar a narrativa academica do MVP.

## 4. Principios de UX

- Preferir superficies simples e operacionais.
- Evitar telas de marketing dentro do app.
- Manter Biblioteca como entrada principal.
- Manter `Meus baralhos` como area de gerenciamento do usuario.
- Manter estudo como sessao guiada, nao dashboard.
- Usar mensagens curtas e proximas da acao.
- Evitar controles avancados antes de haver necessidade real.

## 5. Padroes frontend

Stack:
- Vue 3;
- Vite;
- TypeScript;
- Vue Router.

Padroes atuais:
- paginas principais ficam em `frontend/src/pages`;
- route adapters ficam em `frontend/src/routes`;
- paginas visuais devem ser controladas por props/eventos;
- `App.vue` ainda atua como orquestrador temporario de estado e workflows;
- evitar store global nesta fase;
- preferir composables locais quando reduzirem complexidade real;
- preservar limpeza de estados pesados ao sair de rotas;
- manter HTML de cartas passando pela sanitizacao existente.

Ao evoluir:
- nao transformar paginas visuais em donas de estado transversal sem decisao
  explicita;
- nao introduzir Pinia/store global apenas por organizacao;
- nao reabrir refatoracao ampla perto de entrega sem plano e validacao.

## 6. Padroes backend

Stack:
- Java 21;
- Spring Boot 4.0.x;
- Maven;
- MySQL 8.4 LTS;
- Flyway;
- JPA.

Padroes atuais:
- API REST simples e direta;
- ownership validado em operacoes privadas;
- DTOs explicitos para contratos principais;
- paginacao em listas potencialmente grandes;
- midias persistidas como BLOB no MySQL para o MVP;
- endpoint E2E de reset apenas no profile `e2e`;
- scheduler/SRS simplificado proprio.

Ao evoluir:
- backend novo deve responder a necessidade real;
- nao alterar scheduler/SRS sem testes e decisao documentada;
- manter limites de upload e sanitizacao sob revisao;
- migracao de midias para storage externo e pos-MVP.

## 7. APKG e Anki

Regras atuais:
- `.apkg` e formato de interoperabilidade basica;
- preview anonimo e temporario;
- salvar APKG exige autenticacao;
- o fluxo `entrar para salvar` preserva o preview intencionalmente;
- ao sair da importacao, limpar arquivo, preview, indice de midia e object URLs;
- ao salvar, o LearningFrame inicia agenda propria de revisao.

Fora do suporte atual:
- `.colpkg`;
- cloze avancado;
- templates complexos;
- agenda original do Anki;
- historico de revisoes;
- add-ons.

## 8. Estudo e SRS

Regras atuais:
- ratings sao `AGAIN`, `HARD`, `GOOD`, `EASY`;
- estudo autenticado persiste revisoes no backend;
- estudo anonimo usa estado local do navegador;
- pratica intercalada existe como fluxo simples por baralho;
- sessao de estudo mostra progresso, feedback local e resumo final;
- controles de fonte e ajuste de midia sao locais ao estudo.

Ao evoluir:
- nao trocar o algoritmo de revisao como efeito colateral de UI;
- tratar selecao de baralhos para pratica intercalada como candidata forte a
  ajuste de MVP/MVP+;
- tratar variabilidade por tags/topicos como pos-MVP, com decisao e testes
  proprios;
- configurador de sessao, metas, pausar/retomar e dashboards ficam pos-MVP;
- preservar acessibilidade basica dos controles de estudo.

## 9. E2E e validacao

Regra critica:
- E2E nunca deve usar banco dev.

Ambiente E2E:
- Compose project `learningframe-e2e`;
- banco `learningframe_e2e`;
- servico `db-e2e`;
- MySQL host `3317`;
- frontend `18080`;
- backend `18081`;
- teardown com `down -v`.

Validacoes esperadas:
- documentacao pura: `git diff --check` e revisao manual;
- frontend: `npm test` e `npm run build`;
- fluxos integrados: `npm run e2e`;
- backend: testes Maven quando houver alteracao backend.

## 10. Documentacao

Documentacao canonica atual:
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integracao com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execucao local](guia-execucao-local-mvp.md);
- [Estado final do MVP](estado-final-mvp.md);
- [Relatorio de QA manual final](relatorio-qa-manual-final-mvp.md);
- [Roadmap de profissionalizacao pos-MVP](roadmap-profissionalizacao-pos-mvp.md);
- [Diario de bordo](diario-de-bordo.md).

Contexto historico e de IA:
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memoria de decisoes](ai_context/memoria-de-decisoes.md);
- [Planos](ai_context/planos/);
- [Prompts](ai_context/prompts/);
- [Arquitetura e decisoes historicas](ai_context/arquitetura-e-decisoes/);
- [Snapshots](ai_context/snapshots/).

Ao criar nova frente:
1. Se a mudanca altera principio atual, atualize este documento.
2. Se a mudanca muda uma decisao relevante, atualize a
   [memoria de decisoes](ai_context/memoria-de-decisoes.md).
3. Se a mudanca tem planejamento proprio, registre em
   [planos](ai_context/planos/).
4. Se houver prompt de continuidade, registre em
   [prompts](ai_context/prompts/).
