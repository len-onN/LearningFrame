# Linha do Tempo dos Planejamentos e Decisões

Esta linha do tempo conecta os documentos de planejamento, prompts e memória de
decisões do LearningFrame. Ela serve como mapa para navegar o histórico sem
misturar plano antigo com estado atual.

Para o estado atual, consulte:
- [Princípios e padrões do MVP](../principios-e-padroes-mvp.md);
- [Estado final do MVP](../estado-final-mvp.md);
- [Relatório de QA manual final](../relatorio-qa-manual-final-mvp.md).

## 1. Visão resumida

| Data | Fase | Branch/documento | Mudança importante | Resultado |
| --- | --- | --- | --- | --- |
| 2026-05-30 | Snapshot inicial | [Snapshot inicial](snapshots/2026-05-30_18-53-40_learningframe-snapshot.md) | Registro do estado inicial do MVP | Base histórica do projeto |
| 2026-05-31 | Diário consolidado | [Diário de bordo](../diario-de-bordo.md) | Narrativa inicial do projeto e decisões de escopo | Diário virou memória principal |
| 2026-06-02 | Pré-finalização | [Considerações pré-finalização](arquitetura-e-decisoes/consideracoes-pre-finalizacao.md) | Avaliação do que faltava para fechar o MVP | Priorizou rotas, E2E, estudo, QA e docs |
| 2026-06-02 | UX de baralhos | [Arquitetura UX de baralhos](arquitetura-e-decisoes/arquitetura-ux-baralhos.md) | Gerenciamento contextual e overlay de cartas | Biblioteca virou superfície real de gerenciamento |
| 2026-06-02 a 2026-06-07 | Arquitetura frontend | [Roteamento e ciclo de vida](arquitetura-e-decisoes/arquitetura-frontend-roteamento-ciclo-de-vida.md) | Planejamento de rotas reais, páginas e ciclo de vida | Base para a refatoração incremental |
| 2026-06-07 | Momento 8 | [Plano Momento 8 E2E](planos/plano-momento-8-testes-e2e.md) | E2E com Compose e banco dedicados | Suite inicial Playwright criada |
| 2026-06-07 | Estabilização | [Prompt de estabilização](prompts/prompt-proximo-chat-estabilizacao-mvp.md) | Entrada na fase final do MVP | Planejamento por branches curtas |
| 2026-06-07 | Audit Vitest | [Prompt audit Vitest](prompts/prompt-proximo-chat-audit-vitest-mvp.md) | Decisão sobre vulnerabilidade do Vitest | Atualização para `vitest@4.1.8` |
| 2026-06-07 | Fluxos E2E de risco | [Plano E2E de risco](planos/plano-e2e-risk-flows-mvp.md) | Refresh direto, back/forward, metadata e exclusões em lote | Suite E2E passou de 9 para 14 testes |
| 2026-06-07 | Polimento de estudo | [Plano de polimento do estudo](planos/plano-study-session-polish-mvp.md) | Progresso, feedback local, resumo, fonte e mídia | Estudo ficou mais guiado |
| 2026-06-08 | QA manual final | [Plano de QA manual final](planos/plano-qa-manual-final-mvp.md) | Checklist final em container | 18 de 18 fluxos passaram |
| 2026-06-08 | Relatório QA | [Relatório de QA manual final](../relatorio-qa-manual-final-mvp.md) | Evidências, comandos e riscos aceitos | Sem bug bloqueante |
| 2026-06-08 | Documentação final | [Plano de documentação final](planos/plano-finalizacao-documentacao-mvp.md) | Guias finais, estado final e reorganização documental | Documentação separou uso atual de contexto histórico |
| 2026-06-08 | Roadmap pós-MVP | [Roadmap de profissionalização pós-MVP](../roadmap-profissionalizacao-pos-mvp.md) | Contexto institucional, prática intercalada e profissionalização | Base para próximas branches de ajuste e produto |
| 2026-06-08 | Refatoração pós-MVP | [Plano App.vue pós-MVP](planos/plano-refatoracao-app-vue-pos-mvp.md) | Primeira fatia de redução do composition root | Helpers puros e `useDeckManagement` extraídos |

## 2. Sequencia arquitetural do frontend

A frente de arquitetura frontend foi planejada como uma refatoração incremental:

| Momento | Documento | Intencao |
| --- | --- | --- |
| Momento 2 | [Roteamento frontend](planos/plano-momento-2-roteamento-frontend.md) | Introduzir Vue Router e guards |
| Momento 3 | [Shell e páginas](planos/plano-momento-3-shell-paginas.md) | Extrair shell e páginas principais |
| Momento 4 | [Biblioteca e importação](planos/plano-momento-4-biblioteca-importacao.md) | Componentizar Biblioteca e Importação |
| Momento 4b | [Editor de cartas](planos/plano-momento-4b-editor-cartas.md) | Extrair overlay/editor de cartas |
| Momento 5 | [Composables de infraestrutura](planos/plano-momento-5-composables-infraestrutura.md) | Extrair composables de infraestrutura |
| Momento 6 | [Composables de domínio](planos/plano-momento-6-composables-dominio.md) | Planejar composables de domínio |
| Momento 7 | [Rotas e ciclo de vida](planos/plano-momento-7-rotas-ciclo-de-vida.md) | Consolidar rotas reais e ciclo de vida |
| Momento 8 | [E2E com banco dedicado](planos/plano-momento-8-testes-e2e.md) | Criar E2E com banco dedicado |

Resultado atual:
- rotas reais existem;
- páginas visuais foram extraidas;
- route adapters conectam router e contexto;
- `App.vue` ainda orquestra workflows transversais;
- store global foi adiada;
- estados pesados de importação/estudo ganharam política de ciclo de vida.

## 3. Sequencia final de estabilização

| Branch | Documento principal | Resultado |
| --- | --- | --- |
| `codex/audit-vitest-decision` | [Prompt audit Vitest](prompts/prompt-proximo-chat-audit-vitest-mvp.md) | Vitest atualizado para `4.1.8` |
| `codex/e2e-risk-flows` | [Plano E2E de risco](planos/plano-e2e-risk-flows-mvp.md) | Suite E2E expandida para fluxos de risco |
| `codex/study-session-polish` | [Plano de polimento do estudo](planos/plano-study-session-polish-mvp.md) | Estudo polido com progresso, feedback e resumo |
| `codex/qa-manual-final` | [Plano de QA manual final](planos/plano-qa-manual-final-mvp.md) | QA manual final executado e aprovado |
| `codex/mvp-final-documentation` | [Plano de documentação final](planos/plano-finalizacao-documentacao-mvp.md) | Documentação final consolidada |
| `codex/refactor-app-vue-responsibilities` | [Plano App.vue pós-MVP](planos/plano-refatoracao-app-vue-pos-mvp.md) | Primeira fatia da refatoração do composition root |

## 4. Como atualizar esta linha do tempo

Ao criar nova branch relevante:
1. Adicione a branch na tabela apropriada.
2. Linke o plano ou relatório principal.
3. Registre a decisão ou mudança em uma frase curta.
4. Se a mudança alterar um princípio atual, atualize também:
   - [Princípios e padrões do MVP](../principios-e-padroes-mvp.md);
   - [Memória de decisões](memoria-de-decisoes.md), quando houver mudança de
     direção relevante.
