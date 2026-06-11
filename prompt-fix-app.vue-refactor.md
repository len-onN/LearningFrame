# Contexto: Refatoração do App.vue e Quebra de Renderização da Biblioteca

Olá! Você está assumindo a sessão para resolver um problema crítico que foi introduzido durante uma refatoração arquitetural.

## O Que Foi Feito (O Contexto)
1. Estávamos removendo o anti-pattern "God Component" do `App.vue`. Antes, o `App.vue` instanciava `useDeckLibrary`, `useDeckManagement` e `useLibraryActions` e injetava TUDO através de um `provide(libraryRouteKey, { ... })` massivo.
2. Refatoramos esses composables (`useDeckLibrary.ts`, etc.) para o padrão **Module-Level Singleton** no Vue 3. Isso significa que as variáveis de estado (`publicDecks`, `myDecks`, `librarySearch`) agora são definidas **fora** da função do composable, tornando-se singletons globais.
3. No `LibraryRoute.vue`, substituímos a injeção via `useRequiredRouteContext` pela importação direta e desestruturação desses composables:
   ```typescript
   const { filteredPublicDecks, filteredMyDecks } = useDeckLibrary({ librarySection })
   ```
4. Removemos o `librarySearch` e estados residuais não utilizados do `App.vue` (mas mantivemos a orquestração do router `useLibraryRouteSync` no `App.vue`).

## O Sintoma Atual
A estrutura da página Biblioteca carrega normalmente, mas as listas de **Baralhos Públicos** e **Meus baralhos** estão completamente vazias na interface, mesmo a requisição inicial sendo orquestrada pelo `App.vue` via `useRouteLifecycle -> syncLibraryRoute -> loadPublicDecks`. 

- O usuário testou em janela anônima e logado: nada aparece.
- Havia um aviso no console de `[Vue warn] onScopeDispose() is called when there is no active effect scope`, que já tentamos resolver desestruturando o `useDeckLibrary` corretamente e instanciando o `useStudySession()` no topo do setup do `App.vue`.

## Possíveis Causas a Investigar
Como as requisições iniciais estão sendo coordenadas por instâncias dos composables no `App.vue` (passadas ao `useRouteLifecycle`), mas consumidas por instâncias independentes em `LibraryRoute.vue`, pode haver:
1. Um vazamento no pattern Singleton (ex: alguma ref não está no nível do módulo).
2. O Vue `<template>` não está atualizando a prop `:public-decks` por algum problema de unwrap (mesmo com destructuring).
3. O `loadPublicDecks()` (chamado no `App.vue`) não está preenchendo a `ref` global por algum overwrite, ou a dependência `client.publicDecks` falhou no mock.
4. Conflito entre a `librarySection` local (computed no `LibraryRoute`) e a `librarySection` passada para a inicialização da busca no `App.vue`.

## Instruções Para Você (O Agente)
1. **Leia as diretrizes** usando as skills: `vue`, `vue-best-practices`. Nosso stack é Vue 3 (Composition API / `<script setup>`).
2. **Revise os arquivos**:
   - `src/features/library/useDeckLibrary.ts` (Onde o state global vive).
   - `src/App.vue` (Onde o load inicial é disparado no setup).
   - `src/routes/LibraryRoute.vue` (Onde a UI tenta ler e exibir).
   - `src/app/useLibraryRouteSync.ts` (Onde o watcher de rota atinge o load).
3. Entenda por que `filteredPublicDecks` chega no template de `LibraryRoute.vue` vazio mesmo após a montagem da rota.
4. Proponha um diagnóstico cirúrgico (não faça rewrite de tudo) e valide o estado da aplicação. Use console logs estrategicamente ou recrie a ponte reativa.
5. Inicie sua atuação com uma investigação direta da linha do tempo da variável `publicDecks.value` entre o disparador (`App.vue`) e o consumidor (`LibraryRoute.vue`).
