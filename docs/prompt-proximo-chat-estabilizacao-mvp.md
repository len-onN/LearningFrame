# Prompt para o Proximo Chat: Estabilizacao Final do MVP

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch base de integracao: develop
- Branch criada para a proxima fase: codex/mvp-finalization-planning
- A branch codex/mvp-finalization-planning foi criada a partir de develop em 2026-06-07.
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- Se nao estiver na branch codex/mvp-finalization-planning, volte para develop, faca pull e recrie/atualize a branch de trabalho conforme necessario.

Estado do projeto:
- develop contem o merge de frontend-refactor.
- frontend-refactor contem o merge do Momento 8, branch codex/e2e-dedicated-db.
- O Momento 8 implementou:
  - Playwright;
  - docker-compose.e2e.yml;
  - banco MySQL E2E dedicado;
  - profile backend e2e;
  - endpoint interno POST /api/e2e/reset protegido por X-E2E-Token;
  - seed deterministico;
  - primeira suite E2E cobrindo smoke publico, autenticacao, rotas privadas, criacao/gerenciamento basico de baralho, cartas, estudo, importacao APKG e progresso.
- O projeto ja esta em fase de estabilizacao/finalizacao academica. Nao ha bloqueio funcional critico conhecido apos o merge.

Validacoes ja executadas em develop apos o merge:
- npm test: passou, 33 testes frontend.
- npm run build: passou com vue-tsc e vite build.
- npm run e2e: passou, 9 testes Playwright em Chromium.
- Testes backend via container Maven/Java 21: passaram, 27 testes.

Regra critica de E2E:
- Nunca usar banco dev nos testes E2E.
- A suite E2E deve usar o Compose dedicado learningframe-e2e.
- O banco E2E e learningframe_e2e, servico db-e2e, porta host 3317, volume mysql-e2e-data.
- O script npm run e2e deve subir o ambiente, rodar Playwright e derrubar com down -v.

Praticas de desenvolvimento:
- Trabalhar em branches curtas a partir de develop.
- Usar prefixo codex/ para branches.
- Manter commits em portugues com Conventional Commits.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, ler o contexto local e explicar o que sera alterado.
- Evitar features grandes nesta fase.
- Priorizar hardening, documentacao, QA integrado e pequenos polimentos de alto retorno.
- Se for mexer em dependencias, fazer em branch curta e rodar a bateria completa.

Documentos obrigatorios para ler antes de propor qualquer implementacao:
- README.md
- docs/diario-de-bordo.md
- docs/arquitetura-frontend-roteamento-ciclo-de-vida.md
- docs/consideracoes-pre-finalizacao.md
- docs/plano-momento-8-testes-e2e.md
- docs/prompt-proximo-chat-estabilizacao-mvp.md

Pontos importantes ja registrados:
- README foi atualizado para refletir scripts raiz, ambiente E2E dedicado, limites de APKG e decisoes de seguranca do MVP.
- docs/consideracoes-pre-finalizacao.md recebeu um adendo pos-merge do Momento 8.
- docs/diario-de-bordo.md recebeu o registro da avaliacao pos-merge e da entrada em estabilizacao.

Pendencias atuais conhecidas:
1. npm audit ainda aponta vulnerabilidade critica em vitest <4.1.0.
   - A correcao sugerida e npm audit fix --force.
   - Isso atualiza para vitest@4.1.8 e pode ser breaking.
   - Antes de aplicar, analisar impacto e propor plano de validacao.
2. QA manual integrado em container ainda deve ser planejado/executado.
3. A suite E2E inicial passa, mas pode ser expandida em cenarios de maior risco:
   - refresh direto em rotas principais;
   - back/forward;
   - edicao de metadata de baralho;
   - selecao/exclusao em lote de baralhos e cartas;
   - acessibilidade basica dos fluxos criticos.
4. O modo de estudo funciona, mas e o melhor candidato a polimento pequeno:
   - progresso de sessao;
   - feedback local apos rating;
   - resumo ao finalizar;
   - atalhos simples, se nao aumentarem demais a complexidade.

Fora de escopo para a proxima fase:
- favoritos;
- filtros avancados;
- rich text editor completo;
- perfil e recuperacao de senha;
- marketplace;
- storage externo para midia;
- busca full-text;
- dashboard estatistico avancado;
- nova store global;
- grandes refatoracoes de arquitetura.

Objetivo deste proximo chat:
- Nao implementar imediatamente.
- Primeiro fazer uma fase curta de analise com base nos documentos e no estado real do repositorio.
- Depois propor um plano de implementacao curto, priorizado e dividido em branches/commits pequenos.
- O plano deve decidir a ordem entre:
  1. tratar/documentar npm audit;
  2. expandir E2E de alto risco;
  3. preparar QA manual final;
  4. polir modo de estudo, se ainda couber;
  5. finalizar documentacao academica.

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar leitura dos documentos obrigatorios;
- confirmar se as validacoes ainda passam ou se precisam ser reexecutadas;
- apresentar um plano curto de implementacao para revisao antes de editar codigo.
```
