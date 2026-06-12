# Princípios e Padrões do MVP

Este documento registra o estado normativo atual do LearningFrame para futuras
branches. Ele resume decisões que devem ser preservadas enquanto o produto
evolui a partir do MVP.

Quando houver dúvida entre um plano antigo e este documento, siga este
documento e consulte a [memória de decisões](ai_context/memoria-de-decisoes.md)
para entender a origem da decisão.

## 1. Visão do produto

LearningFrame é um MVP acadêmico para estudo com:
- recordação ativa;
- repetição espaçada;
- prática intercalada.

O objetivo é demonstrar uma aplicação funcional, explicável e defensável, não
criar uma plataforma completa de aprendizagem.

Como contexto de produto, o LearningFrame pode ser apresentado como uma
aplicação gratuita de suporte ao aprendizado ofertada por uma instituição de
ensino. A integração real com sistemas institucionais fica fora do MVP e esta
registrada no
[Roadmap de profissionalização pós-MVP](roadmap-profissionalizacao-pos-mvp.md).

## 2. Escopo atual

Incluído:
- estudo anônimo de baralhos públicos;
- conta opcional;
- persistência autenticada de baralhos, cartas, mídias, revisões e progresso;
- gerenciamento de baralhos e cartas;
- importação APKG básica;
- estudo por baralho;
- prática intercalada;
- progresso essencial;
- E2E dedicado;
- QA manual final aprovado;
- gestão de perfil (atualização de dados e exclusão de conta).

Fora do MVP:
- clone completo do Anki;
- `.colpkg`;
- cloze avançado;
- templates complexos;
- histórico e scheduler original do Anki;
- marketplace;
- favoritos;
- filtros avançados;
- busca full-text;
- dashboard avançado;
- recuperacao de senha;
- storage externo de mídia;
- text-to-speech.

## 3. Princípios de produto

- Experimentar deve ser possível sem conta.
- Persistir conhecimento exige conta.
- Biblioteca deve conter baralhos prontos para uso, não rascunhos temporários.
- Importação APKG deve ser honesta sobre limites.
- Estudo deve priorizar foco, clareza e baixa fricção.
- Funcionalidades futuras devem respeitar a narrativa acadêmica do MVP.

## 4. Princípios de UX

- Preferir superfícies simples e operacionais.
- Evitar telas de marketing dentro do app.
- Manter Biblioteca como entrada principal.
- Manter `Meus baralhos` como área de gerenciamento do usuário.
- Manter estudo como sessão guiada, não dashboard.
- Usar mensagens curtas e próximas da ação.
- Evitar controles avançados antes de haver necessidade real.

## 5. Padrões frontend

Stack:
- Vue 3;
- Vite;
- TypeScript;
- Vue Router.

Padrões atuais:
- páginas principais ficam em `frontend/src/pages`;
- route adapters ficam em `frontend/src/routes`;
- páginas visuais devem ser controladas por props/eventos;
- `App.vue` ainda atua como orquestrador temporário de estado e workflows;
- evitar store global nesta fase;
- preferir composables locais quando reduzirem complexidade real;
- preservar limpeza de estados pesados ao sair de rotas;
- manter HTML de cartas passando pela sanitização existente.

Ao evoluir:
- não transformar páginas visuais em donas de estado transversal sem decisão
  explícita;
- não introduzir Pinia/store global apenas por organização;
- não reabrir refatoração ampla perto de entrega sem plano e validação.

## 6. Padrões backend

Stack:
- Java 21;
- Spring Boot 4.0.x;
- Maven;
- MySQL 8.4 LTS;
- Flyway;
- JPA.

Padrões atuais:
- API REST simples e direta;
- ownership validado em operações privadas;
- DTOs explícitos para contratos principais;
- páginação em listas potencialmente grandes;
- mídias persistidas como BLOB no MySQL para o MVP;
- endpoint E2E de reset apenas no profile `e2e`;
- scheduler/SRS simplificado próprio.

Ao evoluir:
- backend novo deve responder a necessidade real;
- não alterar scheduler/SRS sem testes e decisão documentada;
- manter limites de upload e sanitização sob revisão;
- migração de mídias para storage externo e pós-MVP.

## 7. APKG e Anki

Regras atuais:
- `.apkg` é formato de interoperabilidade básica;
- preview é anônimo e temporário;
- salvar APKG exige autenticação;
- o fluxo `entrar para salvar` preserva o preview intencionalmente;
- ao sair da importação, limpar arquivo, preview, índice de mídia e object URLs;
- ao salvar, o LearningFrame inicia agenda própria de revisão.

Fora do suporte atual:
- `.colpkg`;
- cloze avançado;
- templates complexos;
- agenda original do Anki;
- histórico de revisões;
- add-ons.

## 8. Estudo e SRS

Regras atuais:
- ratings são `AGAIN`, `HARD`, `GOOD`, `EASY`;
- estudo autenticado persiste revisões no backend;
- estudo anônimo usa estado local do navegador;
- prática intercalada existe como fluxo simples por baralho;
- sessão de estudo mostra progresso, feedback local e resumo final;
- controles de fonte e ajuste de mídia são locais ao estudo.

Ao evoluir:
- não trocar o algoritmo de revisão como efeito colateral de UI;
- tratar seleção de baralhos para prática intercalada como candidata forte a
  ajuste de MVP/MVP+;
- tratar variabilidade por tags/tópicos como pós-MVP, com decisão e testes
  próprios;
- configurador de sessão, metas, pausar/retomar e dashboards ficam pós-MVP;
- preservar acessibilidade básica dos controles de estudo.

## 9. E2E e validação

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

Validações esperadas:
- documentação pura: `git diff --check` e revisão manual;
- frontend: `npm test` e `npm run build`;
- fluxos integrados: `npm run e2e`;
- backend: testes Maven quando houver alteração backend.

## 10. Documentação

Documentação canônica atual:
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integração com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execução local](guia-execucao-local-mvp.md);
- [Estado final do MVP](estado-final-mvp.md);
- [Relatório de QA manual final](relatorio-qa-manual-final-mvp.md);
- [Roadmap de profissionalização pós-MVP](roadmap-profissionalizacao-pos-mvp.md);
- [Diário de bordo](diario-de-bordo.md).

Contexto histórico e de IA:
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memória de decisões](ai_context/memoria-de-decisoes.md);
- [Planos](ai_context/planos/);
- [Prompts](ai_context/prompts/);
- [Arquitetura e decisões históricas](ai_context/arquitetura-e-decisoes/);
- [Snapshots](ai_context/snapshots/).

Ao criar nova frente:
1. Se a mudança altera princípio atual, atualize este documento.
2. Se a mudança muda uma decisão relevante, atualize a
   [memória de decisões](ai_context/memoria-de-decisoes.md).
3. Se a mudança tem planejamento próprio, registre em
   [planos](ai_context/planos/).
4. Se houver prompt de continuidade, registre em
   [prompts](ai_context/prompts/).
