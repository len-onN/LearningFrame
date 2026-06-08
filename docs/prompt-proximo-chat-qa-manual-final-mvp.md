# Prompt para o Proximo Chat: QA Manual Final do MVP

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch atual encerrada: codex/study-session-polish
- Proxima branch de trabalho prevista: codex/qa-manual-final
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e
  se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- A proxima branch deve partir de develop atualizado, depois que
  codex/study-session-polish estiver integrada na base.
- Se codex/study-session-polish ainda nao estiver integrada em develop, nao
  comece a proxima implementacao; primeiro alinhe a base com o usuario.

Resumo do projeto:
- LearningFrame e um MVP academico para estudo com recordacao ativa, repeticao
  espacada e pratica intercalada.
- Visitantes podem estudar baralhos publicos sem conta e fazer preview de APKG.
- Usuarios autenticados podem persistir baralhos, cartas, midias, revisoes e
  progresso essencial.
- O MVP nao tenta replicar o Anki; ele usa APKG como interoperabilidade basica e
  inicia uma agenda propria de revisao.

Stack e execucao:
- Backend: Java 21, Spring Boot 4.0.x, Maven.
- Banco: MySQL 8.4 LTS.
- Frontend: Vue 3, Vite, TypeScript, Vue Router.
- Testes E2E: Playwright em Chromium.
- Infra local: Docker Compose.
- App dev/prod local:
  - frontend: http://localhost:8080
  - backend: http://localhost:8081
  - MySQL: localhost:3307
- E2E dedicado:
  - frontend: http://localhost:18080
  - backend: http://localhost:18081
  - MySQL: localhost:3317

Estado recente das branches de estabilizacao:
- codex/audit-vitest-decision atualizou Vitest para 4.1.8 e removeu a pendencia
  critica de npm audit em vitest <4.1.0.
- codex/e2e-risk-flows expandiu a suite Playwright de 9 para 14 testes,
  cobrindo refresh direto, back/forward, metadata de baralho e exclusoes em
  lote de baralhos/cartas.
- codex/study-session-polish poliu a tela de estudo com progresso de sessao,
  feedback local apos rating, resumo final e empty states especificos.
- A mesma branch tambem adicionou, em commits separados, ajuste de midia grande
  ao card e controle local de tamanho de fonte.
- Text-to-speech ficou fora do roadmap atual; deve permanecer apenas como
  horizonte distante de possibilidades futuras.

Validacoes registradas em codex/study-session-polish:
- npm test: 33 testes frontend passando.
- npm run build: passou apos o polimento principal e apos os ajustes
  incrementais de midia/fonte.
- npm run e2e: 14 testes Playwright passando em Chromium na validacao do
  polimento principal.
- git diff --check: sem problemas.
- docker compose up -d --build: passou na validacao final local.
- frontend respondeu 200 em http://127.0.0.1:8080/.
- API publica respondeu 200 em http://127.0.0.1:8081/api/decks/public, com 8
  baralhos publicos.

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
- App.vue ainda atua como orquestrador temporario de estado e workflows.
- Paginas como StudyPage.vue, LibraryPage.vue e ImportPage.vue devem continuar
  como superficies visuais controladas por props/eventos.
- Route adapters conectam router e contexto sem transformar paginas em donos de
  estado transversal.
- Evitar store global nesta fase.
- Evitar refatoracoes amplas antes da entrega academica.
- Preferir mudancas pequenas, reversiveis e alinhadas ao padrao local.
- Backend novo somente se um bug real bloquear o QA.
- O scheduler/SRS simplificado nao deve ser alterado nesta etapa.
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
  dashboard avancado, perfil, recuperacao de senha, storage externo e busca
  full-text ficam fora do MVP atual.
- Text-to-speech fica fora do roadmap atual.

Objetivo da proxima branch:
- Preparar e executar QA manual integrado em container.
- Registrar evidencias, problemas encontrados, decisoes e eventuais correcoes.
- Atualizar documentacao final apenas com o estado real do produto.
- Corrigir somente bugs bloqueantes ou pequenos desalinhamentos que aparecam no
  QA.
- Nao adicionar feature nova.

Resultado esperado da branch:
- Um plano/checklist de QA manual final versionado em docs.
- Execucao do checklist em ambiente Docker local.
- Registro do resultado no diario de bordo.
- Ajustes documentais finais no README e docs principais, se estiverem
  defasados.
- Lista clara de riscos aceitos e itens pos-MVP.
- Se houver bug bloqueante, um commit separado de correcao com validacao
  objetiva.

Documentos obrigatorios para ler antes de planejar:
- README.md
- docs/diario-de-bordo.md
- docs/consideracoes-pre-finalizacao.md
- docs/arquitetura-ux-baralhos.md
- docs/arquitetura-frontend-roteamento-ciclo-de-vida.md
- docs/plano-momento-8-testes-e2e.md
- docs/plano-e2e-risk-flows-mvp.md
- docs/plano-study-session-polish-mvp.md
- docs/prompt-proximo-chat-qa-manual-final-mvp.md

Arquivos tecnicos a inspecionar conforme o plano:
- package.json
- docker-compose.yml
- docker-compose.e2e.yml
- frontend/package.json
- frontend/src/App.vue
- frontend/src/routes/routeContext.ts
- frontend/src/pages/StudyPage.vue
- frontend/src/pages/LibraryPage.vue
- frontend/src/pages/ImportPage.vue
- frontend/src/services/api.ts
- frontend/e2e/specs/*.spec.ts
- backend/pom.xml
- backend/src/main/resources/db/migration/*.sql

Fluxos minimos do QA manual:
1. Abrir app anonimo e confirmar carregamento de baralhos publicos.
2. Estudar baralho publico anonimamente.
3. Validar progresso, feedback local, resumo, controle de fonte e ajuste de
   midia no estudo.
4. Criar conta e fazer login.
5. Salvar baralho publico para "Meus baralhos".
6. Criar baralho manual.
7. Criar, editar e excluir cartas.
8. Fazer upload de imagem e audio em carta persistida.
9. Importar APKG com preview antes de salvar.
10. Salvar APKG autenticado e validar midias persistidas.
11. Estudar deck salvo e confirmar progresso autenticado.
12. Usar pratica intercalada.
13. Validar pagina de progresso.
14. Testar exclusao multipla de cartas e baralhos.
15. Alternar tema claro/escuro.
16. Validar refresh direto e back/forward em rotas principais.
17. Fazer checagem responsiva basica em viewport mobile.
18. Confirmar que erros esperados exibem mensagens compreensiveis.

Validacoes automatizadas esperadas:
- npm test
- npm run build
- npm run e2e
- Testes backend Maven se houver alteracao backend ou se o QA final exigir
  bateria completa.
- git diff --check
- docker compose up -d --build para a validacao manual final.

Praticas de desenvolvimento:
- Trabalhar em branch curta.
- Usar commits em portugues com Conventional Commits.
- Separar commits documentais de correcoes funcionais.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, explicar o que sera alterado.
- Manter escopo pequeno e defensavel.
- Registrar comandos executados e resultados em documento, sem exagerar em log
  bruto.
- Se encontrar problema nao bloqueante, documentar como risco aceito ou pos-MVP.

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar se codex/study-session-polish ja esta integrada na base correta;
- confirmar leitura dos documentos obrigatorios;
- resumir o estado atual do MVP em 5 a 8 pontos;
- propor o plano da branch codex/qa-manual-final com ordem de commits;
- definir o checklist de QA manual e as validacoes automatizadas;
- aguardar alinhamento se houver duvida de base/merge; caso contrario, iniciar a
  implementacao documental do plano de QA.
```
