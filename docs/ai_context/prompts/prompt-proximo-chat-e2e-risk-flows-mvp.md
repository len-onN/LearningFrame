# Prompt para o Proximo Chat: E2E de Fluxos de Risco do MVP

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch atual encerrada: codex/audit-vitest-decision
- Proxima branch de trabalho prevista: codex/e2e-risk-flows
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e
  se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- Se a branch codex/audit-vitest-decision ainda nao tiver sido integrada na
  base de trabalho, nao comece a proxima implementacao sem alinhar a base.
- Criar a proxima branch curta apenas depois de confirmar a base correta.

Estado do projeto:
- develop contem o merge de frontend-refactor.
- frontend-refactor contem o merge do Momento 8, branch codex/e2e-dedicated-db.
- O Momento 8 adicionou Playwright e ambiente E2E dedicado.
- A suite E2E usa Compose dedicado learningframe-e2e, banco learningframe_e2e,
  servico db-e2e, porta MySQL host 3317 e teardown com down -v.
- Nunca usar banco dev nos testes E2E.
- A branch codex/audit-vitest-decision tratou a pendencia critica de npm audit
  em vitest <4.1.0.
- Vitest foi atualizado para 4.1.8 em frontend/package.json e
  frontend/package-lock.json.
- O build E2E com npm ci reportou found 0 vulnerabilities apos a atualizacao.

Validacoes registradas na branch codex/audit-vitest-decision:
- npm test: passou, 33 testes frontend com Vitest 4.1.8.
- npm run build: passou com vue-tsc e vite build.
- npm run e2e: passou, 9 testes Playwright em Chromium.
- O E2E usou Compose dedicado learningframe-e2e e derrubou o ambiente com
  down -v.
- Testes backend Maven nao foram reexecutados nesta branch porque a mudanca foi
  restrita a dependencia dev-only do frontend e o E2E integrado passou.

Objetivo da proxima branch:
- Expandir a suite E2E apenas em fluxos de maior risco para a estabilizacao do
  MVP.
- Nao transformar esta etapa em uma suite exaustiva nem adicionar features.
- Preferir poucos cenarios de alto valor, estaveis e legiveis.

Cenarios candidatos de maior risco:
1. Refresh direto em rotas principais:
   - /biblioteca/publicos;
   - /biblioteca/meus apos login;
   - /biblioteca/meus/:deckId/gerenciar;
   - /estudo/baralho/:deckId;
   - /importar.
2. Back/forward do navegador:
   - biblioteca publica;
   - meus baralhos;
   - gerenciamento;
   - criar;
   - retorno para telas anteriores sem tela branca ou estado incoerente.
3. Edicao de metadata de baralho:
   - alterar titulo;
   - alterar descricao;
   - alterar visibilidade;
   - reabrir gerenciamento e confirmar persistencia.
4. Selecao e exclusao em lote:
   - baralhos em Meus baralhos;
   - cartas dentro do gerenciamento;
   - confirmar que selecao limpa e contadores/estado ativo nao ficam quebrados.
5. Acessibilidade basica dos fluxos criticos:
   - priorizar seletores por role/name/label;
   - adicionar data-testid apenas quando texto/role nao forem estaveis;
   - registrar debito se algum controle importante nao tiver nome acessivel.

Documentos obrigatorios para ler antes de propor implementacao:
- README.md
- docs/diario-de-bordo.md
- docs/consideracoes-pre-finalizacao.md
- docs/plano-momento-8-testes-e2e.md
- docs/prompt-proximo-chat-estabilizacao-mvp.md
- docs/prompt-proximo-chat-audit-vitest-mvp.md
- docs/prompt-proximo-chat-e2e-risk-flows-mvp.md

Arquivos tecnicos obrigatorios para inspecionar:
- package.json
- frontend/package.json
- frontend/playwright.config.ts
- scripts/e2e/run-e2e.mjs
- docker-compose.e2e.yml
- frontend/e2e/support/api.ts
- frontend/e2e/support/auth.ts
- frontend/e2e/specs/*.spec.ts

Praticas de desenvolvimento:
- Trabalhar em branch curta.
- Usar commits em portugues com Conventional Commits.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, explicar o que sera alterado.
- Nao usar banco dev nos testes E2E.
- Manter a suite deterministica, com reset e2e antes dos testes conforme o
  padrao existente.
- Evitar sleeps arbitrarios; usar auto-waiting do Playwright, roles e textos
  finais.
- Nao criar uma suite longa demais nesta etapa; escolher a menor cobertura que
  reduza risco real.

Validacao esperada se houver alteracao de testes E2E:
- npm test
- npm run build
- npm run e2e

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar leitura dos documentos obrigatorios;
- resumir a suite E2E atual e os helpers existentes;
- propor uma selecao curta de cenarios para implementar primeiro;
- apresentar um plano curto de arquivos/validacao antes de editar.
```
