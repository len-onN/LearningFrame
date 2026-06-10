# Objetivo: Configurações de Limites Diários de Estudo

## Contexto
Atualmente, no nosso MVP do LearningFrame, o algoritmo de Repetição Espaçada (SRS) entrega as cartas vencidas usando um parâmetro fixo no código do frontend (`limit = 24` em `api.due(...)`). Em aplicativos clássicos como o Anki, o usuário tem a capacidade de ditar o próprio ritmo.

## O que precisamos implementar
1. **No Backend (Java/Spring Boot)**:
   - Adicionar configurações atreladas ao usuário (pode ser estendendo a entidade `User` ou criando `UserSettings`).
   - Precisamos de pelo menos dois campos: `dailyNewCardsLimit` (ex: padrão 20) e `dailyReviewCardsLimit` (ex: padrão 100).
   - Criar endpoints para ler e atualizar essas configurações.
   - Atualizar a lógica que busca as cartas pendentes (`DueCards`) para respeitar esses limites (entregar no máximo X novas e Y revisões diárias).

2. **No Frontend (Vue 3)**:
   - Criar uma nova tela ou modal de "Configurações" (Settings), acessível pelo menu lateral (`AppShell`).
   - Fazer os inputs de configuração se comunicarem com a nova API do backend.
   - Garantir que as sessões de estudo respeitem a configuração global (remover o *hardcode* de limite 24 no `api.ts` caso necessário).

Gostaria que avaliasse o código atual da geração de filas de estudo no Backend e propusesse um Plano de Implementação (Implementation Plan) detalhando as mudanças nas entidades e nos endpoints.
