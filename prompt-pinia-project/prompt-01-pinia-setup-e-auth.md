# Refatoração com Pinia - Fase 1: Setup, Tema e Autenticação

## Contexto do Projeto e Padrões
Você é um assistente de IA focado em arquitetura Vue 3 + TypeScript.
O projeto `LearningFrame` é um sistema de repetição espaçada. Toda a lógica de estado foi extraída para "composables" (ex: `useAuthSession`, `useTheme`, `useDeckLibrary`), mas o `App.vue` tornou-se um "God Component" que instancia tudo e passa dados por `provide` ou props.
O objetivo de longo prazo é usar **Pinia (Setup Stores)** para substituir estados globais, aliviando o `App.vue` e facilitando a performance e o acesso direto aos dados.

## Objetivos Constantes
Performance e coesão, extraídas das melhores práticas de desenvolvimento, são objetivos constantes. Todo planejamento deve ser multidimensional.

## Seu Papel: Planejamento (NÃO EXECUTE AINDA)
A sua primeira e única tarefa ao receber este prompt é **acionar o seu modo de planejamento** (Planning Mode) e gerar um Plano de Implementação detalhado (`implementation_plan.md`). 

Você **NÃO DEVE** modificar nenhum código fonte nesta etapa. 

O plano gerado deve ser multidimensional e conter obrigatoriamente:
1.  **Próximos Passos:** Passo a passo técnico para resolver a demanda desta fase.
2.  **Limites e Escopo:** O que estritamente *não* será feito nesta fase para não inflar o contexto.
3.  **Correlações e Consequências:** Como essa mudança afeta outros arquivos, como a inicialização do app, testes, e o que precisará ser adaptado em cadeia (ripple effect).
4.  **Performance e Coesão:** Avaliação de como as mudanças se alinham com as melhores práticas do Vue/Pinia (ex: não reatividade desnecessária).

## Objetivo Específico do Planejamento desta Fase
Gere um plano abordando a Fase 1:
- **Setup Base:** Instalação e registro do `createPinia()` no `main.ts`.
- **Tema (Theme):** Substituição de `useTheme` por uma store dedicada (`useThemeStore`).
- **Autenticação (Auth):** Substituição de `useAuthSession` por `useAuthStore`.
- **Limpeza:** Remoção destas responsabilidades do `App.vue`.

**Aguarde a revisão:** Ao finalizar a criação/atualização do documento `implementation_plan.md`, peça a aprovação explícita do usuário. Somente após a aprovação e a posterior execução, avaliaremos em conjunto se o cenário implementado conflita com os passos futuros.
