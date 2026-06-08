# Prompt para o Proximo Chat: Finalizacao e Documentacao do MVP

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch atual encerrada: codex/qa-manual-final
- Proxima branch de trabalho prevista: codex/mvp-final-documentation
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e
  se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- A proxima branch deve partir de develop atualizado, depois que
  codex/qa-manual-final estiver integrada na base.
- Se codex/qa-manual-final ainda nao estiver integrada em develop, nao comece a
  proxima implementacao; primeiro alinhe a base com o usuario.

Resumo do projeto:
- LearningFrame e um MVP academico para estudo com recordacao ativa, repeticao
  espacada e pratica intercalada.
- Visitantes podem estudar baralhos publicos sem conta e fazer preview de APKG.
- Usuarios autenticados podem persistir baralhos, cartas, midias, revisoes e
  progresso essencial.
- O MVP nao tenta replicar o Anki; ele usa APKG como interoperabilidade basica e
  inicia uma agenda propria de revisao.
- A fase de estabilizacao tecnica ja passou por audit de Vitest, expansao E2E,
  polimento do estudo e QA manual final.

Estado recente:
- codex/audit-vitest-decision atualizou Vitest para 4.1.8 e removeu a pendencia
  critica de npm audit em vitest <4.1.0.
- codex/e2e-risk-flows expandiu a suite Playwright de 9 para 14 testes,
  cobrindo refresh direto, back/forward, metadata de baralho e exclusoes em
  lote de baralhos/cartas.
- codex/study-session-polish poliu a tela de estudo com progresso de sessao,
  feedback local apos rating, resumo final, empty states, ajuste de midia grande
  ao card e controle local de fonte.
- codex/qa-manual-final criou o plano de QA manual final e registrou a execucao
  integrada do checklist.

Resultado do QA manual final:
- checklist manual final: 18 de 18 fluxos passaram;
- bugs bloqueantes encontrados: nenhum;
- erros de console/pageerror nas rodadas assistidas: nenhum;
- npm test: 33 testes frontend passando;
- npm run build: passando;
- npm run e2e: 14 testes Playwright passando em Chromium, com Compose dedicado
  learningframe-e2e e teardown com down -v;
- testes backend via container Maven: 27 testes passando;
- docker compose up -d --build: ambiente principal subiu;
- frontend respondeu 200 em http://127.0.0.1:8080/;
- API publica respondeu 200 em http://127.0.0.1:8081/api/decks/public;
- git diff --check: sem problemas.

Stack e execucao:
- Backend: Java 21, Spring Boot 4.0.x, Maven.
- Banco: MySQL 8.4 LTS.
- Frontend: Vue 3, Vite, TypeScript, Vue Router.
- Testes E2E: Playwright em Chromium.
- Infra local: Docker Compose.
- App local:
  - frontend: http://localhost:8080
  - backend: http://localhost:8081
  - MySQL: localhost:3307
- E2E dedicado:
  - frontend: http://localhost:18080
  - backend: http://localhost:18081
  - MySQL: localhost:3317

Regras criticas de E2E:
- Nunca usar banco dev nos testes E2E.
- A suite E2E deve usar o Compose dedicado learningframe-e2e.
- O banco E2E e learningframe_e2e.
- O servico de banco E2E e db-e2e.
- A porta host do MySQL E2E e 3317.
- O script npm run e2e deve subir o ambiente, rodar Playwright e derrubar com
  down -v.
- O endpoint interno POST /api/e2e/reset existe apenas no profile backend e2e e
  exige X-E2E-Token.

Padroes arquiteturais a preservar:
- Evitar novas features nesta fase.
- Evitar refatoracoes amplas antes da entrega academica.
- Backend novo somente se surgir bug bloqueante real.
- O scheduler/SRS simplificado nao deve ser alterado nesta etapa.
- App.vue ainda atua como orquestrador temporario de estado e workflows.
- Paginas como StudyPage.vue, LibraryPage.vue e ImportPage.vue devem continuar
  como superficies visuais controladas por props/eventos.
- Route adapters conectam router e contexto sem transformar paginas em donos de
  estado transversal.
- Evitar store global nesta fase.
- O HTML de cartas deve continuar passando pela sanitizacao existente.
- Midias persistidas continuam como BLOB no MySQL para o MVP, com limites
  documentados.

Decisoes de produto e escopo:
- Conta continua opcional para experimentar o produto.
- Baralhos publicos continuam estudaveis sem login.
- Persistencia de baralhos, midias, progresso e revisoes exige autenticacao.
- APKG anonimo e temporario; preview, arquivo, indice de midia e object URLs
  devem ser limpos ao sair da importacao, exceto no fluxo "entrar para salvar".
- Importacao APKG nao preserva agenda original do Anki, historico, cloze
  avancado, templates complexos nem .colpkg.
- Favoritos, marketplace, filtros avancados, rich text editor completo,
  dashboard avancado, perfil, recuperacao de senha, storage externo, busca
  full-text e text-to-speech ficam fora do MVP atual.

Objetivo da proxima branch:
- Fechar a documentacao final do MVP com base no produto real validado.
- Consolidar a narrativa academica e tecnica: problema, objetivos, escopo,
  arquitetura, principais fluxos, validacoes, riscos aceitos e trabalhos
  futuros.
- Atualizar README e documentos principais apenas quando estiverem defasados.
- Criar um plano de fechamento da branch antes de editar conteudo.
- Nao adicionar feature nova.
- Corrigir apenas inconsistencias documentais ou divergencias pequenas entre
  documentacao e produto real.

Resultado esperado da branch:
- Um plano versionado da finalizacao/documentacao do MVP.
- README revisado com instrucoes atuais, escopo real, validacoes e links
  relevantes.
- Diario de bordo atualizado com a entrada de finalizacao.
- Documento final ou consolidacao final em docs, se fizer sentido, contendo:
  - estado final do MVP;
  - funcionalidades incluidas;
  - funcionalidades fora do MVP;
  - evidencias de validacao;
  - riscos aceitos;
  - itens pos-MVP;
  - sugestao de tag/marco final, como v0.1.0-mvp.
- Nenhuma alteracao funcional, salvo bug bloqueante descoberto durante a revisao.

Documentos obrigatorios para ler antes de planejar:
- README.md
- docs/diario-de-bordo.md
- docs/consideracoes-pre-finalizacao.md
- docs/arquitetura-ux-baralhos.md
- docs/arquitetura-frontend-roteamento-ciclo-de-vida.md
- docs/plano-momento-8-testes-e2e.md
- docs/plano-e2e-risk-flows-mvp.md
- docs/plano-study-session-polish-mvp.md
- docs/plano-qa-manual-final-mvp.md
- docs/relatorio-qa-manual-final-mvp.md
- docs/prompt-proximo-chat-finalizacao-documentacao-mvp.md

Arquivos tecnicos a inspecionar apenas se necessario para conferir divergencias:
- package.json
- docker-compose.yml
- docker-compose.e2e.yml
- frontend/package.json
- frontend/e2e/specs/*.spec.ts
- backend/pom.xml

Validacoes esperadas:
- Para alteracoes documentais puras:
  - git diff --check
  - revisao manual dos documentos alterados
- Se algum arquivo tecnico ou comportamento funcional for alterado:
  - npm test
  - npm run build
  - npm run e2e, se a alteracao tocar fluxos cobertos por E2E
  - testes backend Maven, se houver alteracao backend

Ordem sugerida de commits:
1. docs(mvp): planeja finalizacao documental
   - criar plano da branch e registrar no diario.
2. docs(mvp): consolida documentacao final
   - atualizar README e docs finais com estado real validado.
3. docs(mvp): registra fechamento do MVP
   - consolidar riscos aceitos, pos-MVP, validacoes finais e sugestao de tag.

Praticas de desenvolvimento:
- Trabalhar em branch curta.
- Usar commits em portugues com Conventional Commits.
- Separar plano, consolidacao e fechamento em commits documentais claros.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, explicar o que sera alterado.
- Manter escopo pequeno e defensavel.
- Registrar comandos executados e resultados em documento, sem exagerar em log
  bruto.
- Se encontrar divergencia nao bloqueante, documentar como ajuste documental,
  risco aceito ou pos-MVP.

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar se codex/qa-manual-final ja esta integrada em develop;
- confirmar leitura dos documentos obrigatorios;
- resumir o estado atual do MVP em 5 a 8 pontos;
- propor o plano da branch codex/mvp-final-documentation com ordem de commits;
- listar quais documentos serao atualizados e por que;
- definir validacoes para a fase documental;
- aguardar alinhamento se houver duvida de base/merge; caso contrario, iniciar
  a implementacao documental do plano.
```
