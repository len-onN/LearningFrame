# Prompt para o Proximo Chat: Decisao do npm audit e Vitest

Use este prompt para iniciar o proximo chat do LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch de trabalho prevista: codex/audit-vitest-decision
- A branch deve ter sido criada a partir da consolidacao documental em
  codex/mvp-finalization-planning.
- Antes de qualquer implementacao, confirme a branch atual, o estado do Git e
  se ha mudancas nao commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; investigue e avise.
- Nao iniciar por npm audit fix --force.
- Primeiro analisar o impacto, propor plano e so entao aplicar qualquer mudanca
  de dependencia.

Estado do projeto:
- develop contem o merge de frontend-refactor.
- frontend-refactor contem o merge do Momento 8, branch codex/e2e-dedicated-db.
- O Momento 8 adicionou Playwright e ambiente E2E dedicado.
- A suite E2E usa Compose dedicado learningframe-e2e, banco learningframe_e2e,
  servico db-e2e, porta MySQL host 3317 e teardown com down -v.
- Nunca usar banco dev nos testes E2E.

Validacoes ja registradas apos o merge em develop:
- npm test: passou, 33 testes frontend.
- npm run build: passou com vue-tsc e vite build.
- npm run e2e: passou, 9 testes Playwright em Chromium.
- Testes backend via container Maven/Java 21: passaram, 27 testes.

Pendencia especifica desta branch:
- npm audit ainda aponta vulnerabilidade critica em vitest <4.1.0.
- O package atual usa vitest ^3.2.0, com lock em vitest 3.2.4.
- A correcao sugerida anteriormente foi npm audit fix --force, levando para
  vitest@4.1.8, mas isso pode ser breaking.
- O objetivo e decidir com responsabilidade entre:
  1. atualizar Vitest para uma versao corrigida e validar tudo;
  2. aplicar uma correcao mais controlada se existir;
  3. documentar risco aceito para MVP academico/local se a correcao for
     desproporcional ou incompatibilizar a entrega.

Documentos obrigatorios para ler antes de propor implementacao:
- README.md
- docs/diario-de-bordo.md
- docs/consideracoes-pre-finalizacao.md
- docs/plano-momento-8-testes-e2e.md
- docs/prompt-proximo-chat-estabilizacao-mvp.md
- docs/prompt-proximo-chat-audit-vitest-mvp.md

Arquivos tecnicos obrigatorios para inspecionar:
- package.json
- frontend/package.json
- frontend/package-lock.json
- frontend/vitest.config.ts, se existir
- frontend/playwright.config.ts
- scripts/e2e/run-e2e.mjs

Praticas de desenvolvimento:
- Trabalhar nesta branch curta.
- Usar commits em portugues com Conventional Commits.
- Nao reverter mudancas do usuario.
- Antes de editar arquivos, explicar o que sera alterado.
- Se npm audit precisar de rede e falhar por sandbox/restricao, solicitar
  permissao de execucao conforme o fluxo da ferramenta.
- Se mexer em dependencias, rodar validacao completa.

Validacao esperada se houver mudanca de dependencia:
- npm test
- npm run build
- npm run e2e
- testes backend via container Maven/Java 21, se a validacao final do MVP for
  exigida ou se houver duvida de impacto indireto.

Resposta esperada no inicio:
- confirmar branch/estado do Git;
- confirmar leitura dos documentos obrigatorios;
- confirmar versoes atuais de Vitest e dependencias relacionadas;
- confirmar se o audit atual ainda reproduz;
- apresentar um plano curto de decisao/validacao antes de editar arquivos.
```
