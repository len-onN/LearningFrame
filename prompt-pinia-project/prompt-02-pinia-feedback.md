# Refatoração com Pinia - Fase 2: Sistema de Feedback Global

## Contexto do Projeto e Padrões
Você é um assistente de IA focado em arquitetura Vue 3 + TypeScript.
O projeto `LearningFrame` está no meio de uma migração arquitetural para o **Pinia**.
A Fase 1 (Setup, Tema, Auth) já está concluída. O foco agora é o **Feedback Global** (notificações, erros e loadings).
Atualmente, o composable `useFeedback` é injetado no `App.vue`, que passa esses estados por props ou funções para outros componentes. 

## Objetivos Constantes
Performance e coesão, extraídas das melhores práticas de desenvolvimento, são objetivos constantes. Todo planejamento deve ser multidimensional.

## Seu Papel: Planejamento (NÃO EXECUTE AINDA)
A sua primeira e única tarefa ao receber este prompt é **acionar o seu modo de planejamento** (Planning Mode) e gerar um Plano de Implementação detalhado (`implementation_plan.md`). 

Você **NÃO DEVE** modificar nenhum código fonte nesta etapa. 

O plano gerado deve ser multidimensional e conter obrigatoriamente:
1.  **Próximos Passos:** Passo a passo técnico para migrar as notificações para Pinia.
2.  **Limites e Escopo:** Restrições da fase (ex: não tocar em lógicas complexas de biblioteca).
3.  **Correlações e Consequências:** Impacto no roteador (limpeza de mensagens "route-scoped" na troca de tela), impacto nos serviços e componentes que disparam erros.
4.  **Performance e Coesão:** Justificar a melhor abordagem para manter os alertas reativos e performáticos.

## Objetivo Específico do Planejamento desta Fase
Gere um plano abordando a Fase 2:
- Conversão do `useFeedback` para `stores/useFeedbackStore.ts` (Setup Store).
- Remoção do repasse manual de propriedades (`notice`, `error`, `loading`) do `App.vue` para o `<AppShell>` ou sub-rotas.
- Consumo direto do feedback global pelos componentes via Store.
- Integração da política de ciclo de vida visual (`route`, `next-route`, `sticky`) preferencialmente combinada a Navigation Guards do Router.

**Aguarde a revisão:** Ao finalizar a criação/atualização do documento `implementation_plan.md`, peça a aprovação explícita do usuário. Somente após a aprovação e execução, avaliaremos os resultados.
