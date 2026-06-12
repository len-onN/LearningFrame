# Refatoração com Pinia - Fase 4: Sessão de Estudo e Limpeza Final

## Contexto do Projeto e Padrões
Você é um assistente de IA focado em arquitetura Vue 3 + TypeScript.
Esta é a Fase 4 e a culminação da migração para **Pinia** no projeto `LearningFrame`. As Fases 1 (Feedback), 2 (Auth) e 3 (Library) já foram concluídas e validadas com sucesso (100% dos testes Unitários e E2E passando).
As lógicas pesadas de Domínio já saíram do `App.vue`. Restam os ganchos da Sessão de Estudo (`useStudySession`, estatísticas `useStatsSummary`) e resquícios de injeção legada (`provide/inject` do Router no App.vue). O estado de estudo tem ciclo de vida estrito e deve ser destruído/resetado quando a sessão terminar.

## Objetivos Constantes
Performance e coesão, extraídas das melhores práticas de desenvolvimento, são objetivos constantes. Todo planejamento deve ser multidimensional.

## Seu Papel: Planejamento (NÃO EXECUTE AINDA)
A sua primeira e única tarefa ao receber este prompt é **acionar o seu modo de planejamento** (Planning Mode) e gerar um Plano de Implementação detalhado (`implementation_plan.md`). 

Você **NÃO DEVE** modificar nenhum código fonte nesta etapa. 

O plano gerado deve ser multidimensional e conter obrigatoriamente:
1.  **Próximos Passos:** Passo a passo técnico para extrair a lógica de SRS/Revisão.
2.  **Limites e Escopo:** Esta é a etapa final. Qualquer faxina restante do contexto antigo e remoção de "prop drilling" final deve ser abordada aqui.
3.  **Correlações e Consequências:** Garantir que o estado transiente da revisão não vaze quando o usuário navegar para fora do módulo de estudo (limpeza via Guards/Unmount).
4.  **Performance e Coesão:** Avaliação técnica do resultado obtido no `App.vue` (agora despido de lógicas) e comprovação de estabilidade.

## Objetivo Específico do Planejamento desta Fase
Gere um plano abordando a Fase 4:
- Migração de `useStudySession` para uma Store transiente (`useStudyStore`).
- Acúmulo de estatísticas realocadas de acordo.
- Faxina final no `App.vue` (remoção de `provide` legados e imports sem uso).
- Desacoplamento final do `StudyRoute`.

**Aguarde a revisão:** Ao finalizar a criação/atualização do documento `implementation_plan.md`, peça a aprovação explícita do usuário. Somente após a aprovação e execução documentaremos o "Walkthrough" de vitória provando as métricas e o fim do God Component!
