# Linha do Tempo dos Planejamentos e Decisoes

Esta linha do tempo conecta os documentos de planejamento, prompts e memoria de
decisoes do LearningFrame. Ela serve como mapa para navegar o historico sem
misturar plano antigo com estado atual.

Para o estado atual, consulte:
- [Principios e padroes do MVP](../principios-e-padroes-mvp.md);
- [Estado final do MVP](../estado-final-mvp.md);
- [Relatorio de QA manual final](../relatorio-qa-manual-final-mvp.md).

## 1. Visao resumida

| Data | Fase | Branch/documento | Mudanca importante | Resultado |
| --- | --- | --- | --- | --- |
| 2026-05-30 | Snapshot inicial | [Snapshot inicial](snapshots/2026-05-30_18-53-40_learningframe-snapshot.md) | Registro do estado inicial do MVP | Base historica do projeto |
| 2026-05-31 | Diario consolidado | [Diario de bordo](../diario-de-bordo.md) | Narrativa inicial do projeto e decisoes de escopo | Diario virou memoria principal |
| 2026-06-02 | Pre-finalizacao | [Consideracoes pre-finalizacao](arquitetura-e-decisoes/consideracoes-pre-finalizacao.md) | Avaliacao do que faltava para fechar o MVP | Priorizou rotas, E2E, estudo, QA e docs |
| 2026-06-02 | UX de baralhos | [Arquitetura UX de baralhos](arquitetura-e-decisoes/arquitetura-ux-baralhos.md) | Gerenciamento contextual e overlay de cartas | Biblioteca virou superficie real de gerenciamento |
| 2026-06-02 a 2026-06-07 | Arquitetura frontend | [Roteamento e ciclo de vida](arquitetura-e-decisoes/arquitetura-frontend-roteamento-ciclo-de-vida.md) | Planejamento de rotas reais, paginas e ciclo de vida | Base para a refatoracao incremental |
| 2026-06-07 | Momento 8 | [Plano Momento 8 E2E](planos/plano-momento-8-testes-e2e.md) | E2E com Compose e banco dedicados | Suite inicial Playwright criada |
| 2026-06-07 | Estabilizacao | [Prompt de estabilizacao](prompts/prompt-proximo-chat-estabilizacao-mvp.md) | Entrada na fase final do MVP | Planejamento por branches curtas |
| 2026-06-07 | Audit Vitest | [Prompt audit Vitest](prompts/prompt-proximo-chat-audit-vitest-mvp.md) | Decisao sobre vulnerabilidade do Vitest | Atualizacao para `vitest@4.1.8` |
| 2026-06-07 | Fluxos E2E de risco | [Plano E2E de risco](planos/plano-e2e-risk-flows-mvp.md) | Refresh direto, back/forward, metadata e exclusoes em lote | Suite E2E passou de 9 para 14 testes |
| 2026-06-07 | Polimento de estudo | [Plano de polimento do estudo](planos/plano-study-session-polish-mvp.md) | Progresso, feedback local, resumo, fonte e midia | Estudo ficou mais guiado |
| 2026-06-08 | QA manual final | [Plano de QA manual final](planos/plano-qa-manual-final-mvp.md) | Checklist final em container | 18 de 18 fluxos passaram |
| 2026-06-08 | Relatorio QA | [Relatorio de QA manual final](../relatorio-qa-manual-final-mvp.md) | Evidencias, comandos e riscos aceitos | Sem bug bloqueante |
| 2026-06-08 | Documentacao final | [Plano de documentacao final](planos/plano-finalizacao-documentacao-mvp.md) | Guias finais, estado final e reorganizacao documental | Documentacao separou uso atual de contexto historico |
| 2026-06-08 | Roadmap pos-MVP | [Roadmap de profissionalizacao pos-MVP](../roadmap-profissionalizacao-pos-mvp.md) | Contexto institucional, pratica intercalada e profissionalizacao | Base para proximas branches de ajuste e produto |

## 2. Sequencia arquitetural do frontend

A frente de arquitetura frontend foi planejada como uma refatoracao incremental:

| Momento | Documento | Intencao |
| --- | --- | --- |
| Momento 2 | [Roteamento frontend](planos/plano-momento-2-roteamento-frontend.md) | Introduzir Vue Router e guards |
| Momento 3 | [Shell e paginas](planos/plano-momento-3-shell-paginas.md) | Extrair shell e paginas principais |
| Momento 4 | [Biblioteca e importacao](planos/plano-momento-4-biblioteca-importacao.md) | Componentizar Biblioteca e Importacao |
| Momento 4b | [Editor de cartas](planos/plano-momento-4b-editor-cartas.md) | Extrair overlay/editor de cartas |
| Momento 5 | [Composables de infraestrutura](planos/plano-momento-5-composables-infraestrutura.md) | Extrair composables de infraestrutura |
| Momento 6 | [Composables de dominio](planos/plano-momento-6-composables-dominio.md) | Planejar composables de dominio |
| Momento 7 | [Rotas e ciclo de vida](planos/plano-momento-7-rotas-ciclo-de-vida.md) | Consolidar rotas reais e ciclo de vida |
| Momento 8 | [E2E com banco dedicado](planos/plano-momento-8-testes-e2e.md) | Criar E2E com banco dedicado |

Resultado atual:
- rotas reais existem;
- paginas visuais foram extraidas;
- route adapters conectam router e contexto;
- `App.vue` ainda orquestra workflows transversais;
- store global foi adiada;
- estados pesados de importacao/estudo ganharam politica de ciclo de vida.

## 3. Sequencia final de estabilizacao

| Branch | Documento principal | Resultado |
| --- | --- | --- |
| `codex/audit-vitest-decision` | [Prompt audit Vitest](prompts/prompt-proximo-chat-audit-vitest-mvp.md) | Vitest atualizado para `4.1.8` |
| `codex/e2e-risk-flows` | [Plano E2E de risco](planos/plano-e2e-risk-flows-mvp.md) | Suite E2E expandida para fluxos de risco |
| `codex/study-session-polish` | [Plano de polimento do estudo](planos/plano-study-session-polish-mvp.md) | Estudo polido com progresso, feedback e resumo |
| `codex/qa-manual-final` | [Plano de QA manual final](planos/plano-qa-manual-final-mvp.md) | QA manual final executado e aprovado |
| `codex/mvp-final-documentation` | [Plano de documentacao final](planos/plano-finalizacao-documentacao-mvp.md) | Documentacao final consolidada |

## 4. Como atualizar esta linha do tempo

Ao criar nova branch relevante:
1. Adicione a branch na tabela apropriada.
2. Linke o plano ou relatorio principal.
3. Registre a decisao ou mudanca em uma frase curta.
4. Se a mudanca alterar um principio atual, atualize tambem:
   - [Principios e padroes do MVP](../principios-e-padroes-mvp.md);
   - [Memoria de decisoes](memoria-de-decisoes.md), quando houver mudanca de
     direcao relevante.
