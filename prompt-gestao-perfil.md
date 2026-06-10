# Objetivo: Gestão de Perfil de Usuário

## Contexto
O nosso sistema já possui registro, login (com JWT) e logout funcionando perfeitamente. No entanto, uma vez logado, o usuário fica "preso" aos seus dados originais. Ele não possui autonomia para gerenciar a própria conta.

## O que precisamos implementar
1. **No Backend (Java/Spring Boot)**:
   - Endpoint para atualizar o "Nome de Exibição" (`DisplayName`).
   - Endpoint para atualizar a Senha (exigindo a verificação da senha antiga antes de gravar a nova).
   - Endpoint para Excluir a Conta (um *Hard Delete* que remova todos os dados em cascata: Progresso, Baralhos Privados e Cartas do usuário).

2. **No Frontend (Vue 3)**:
   - Criar uma tela "Meu Perfil" acessível pelo menu do usuário na barra lateral.
   - Componentes visuais para edição dos dados.
   - Adicionar o botão "Excluir minha conta" com uma confirmação de segurança severa (ex: digitar o e-mail para confirmar ou mostrar um modal de alerta vermelho).

Por favor, faça uma análise de como as entidades do backend estão mapeadas (para garantir que o delete em cascata vai funcionar corretamente) e escreva um Plano de Implementação.
