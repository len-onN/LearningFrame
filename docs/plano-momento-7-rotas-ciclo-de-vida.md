# Plano do Momento 7: Rotas Reais e Ciclo de Vida por Tela

Branch de trabalho:
- `codex/frontend-moment-7-route-lifecycle`

Base e destino:
- base: `frontend-refactor`;
- destino do PR: `frontend-refactor`.

Regra de processo:
- planejamento e implementacao compartilham a mesma branch;
- o planejamento deve ficar em commit proprio;
- a implementacao deve vir em commits separados por fatia funcional.

## 1. Objetivo

O Momento 7 deve transformar o roteamento em uma camada efetiva da aplicacao, sem fazer uma reescrita ampla do estado de dominio.

Objetivos principais:
- substituir o `RouteSurface` vazio por componentes reais de rota;
- manter `AppShell` como layout persistente;
- reduzir a responsabilidade visual do `App.vue`;
- mover carregamentos e limpezas para fronteiras de rota mais explicitas;
- garantir que estados pesados ou temporarios sejam limpos quando a rota deixa de precisar deles;
- reduzir risco de respostas antigas sobrescreverem estados recentes em fluxos com busca, preview e paginacao.

O objetivo nao e terminar toda a extracao de dominio. O objetivo e criar a camada de rotas reais com custo controlado, preservando o MVP funcional.

## 2. Estado Atual

`frontend-refactor` ja contem:
- `vue-router` como fonte de verdade para URLs principais;
- rotas para Biblioteca, estudo, importacao, criacao, progresso e autenticacao;
- guard de autenticacao para rotas privadas;
- `AppShell.vue` extraido;
- paginas visuais controladas por props/eventos;
- `useFeedback`, `useTheme`, `useAuthSession` e `useDeckLibrary`;
- `LibraryPage.vue`, `DeckListPanel.vue`, `DeckManagementView.vue`, `ImportPage.vue`, `StudyPage.vue`, `CreateDeckPage.vue`, `ProgressPage.vue` e `AuthPage.vue`.

Ainda permanece no `App.vue`:
- renderizacao condicional de todas as telas por `tab`;
- `syncRouteState()` centralizando carregamentos por `route.name`;
- estado de gerenciamento de deck/cartas;
- estado de importacao APKG, arquivo selecionado, preview, indice de midia e object URLs;
- estado da sessao de estudo;
- cache anonimo de baralhos publicos usados em estudo;
- workflows com API, navegacao, feedback e atualizacao de stats;
- timers de busca e destaque.

O router atual ainda usa:
- `RouteSurface`, um componente vazio compartilhado por todas as rotas.

Conclusao:
- as URLs funcionam, mas as rotas ainda nao possuem superficie propria;
- o `App.vue` segue como integrador grande;
- a proxima melhoria deve trocar o roteamento superficial por route components reais, sem esconder dependencias em uma store global.

## 3. Tensao Arquitetural

Existem duas leituras historicas para o Momento 7:
- no plano do Momento 6, o proximo passo e "atacar o router de fato";
- no documento de arquitetura de ciclo de vida, o Momento 7 aparece como "Ciclo de Vida e Memoria".

Essas leituras nao competem. A rota real e o melhor ponto para aplicar ciclo de vida:
- rota montou: carregar o que ela precisa;
- rota mudou: atualizar somente o escopo relevante;
- rota saiu: limpar o que nao deve sobreviver.

Portanto, este plano une as duas frentes:
1. criar route components reais;
2. mover carregamentos/limpezas para limites de rota;
3. revisar memoria, caches e respostas antigas.

## 4. Estrategia Recomendada

Usar route adapters finos.

Em vez de transformar as paginas visuais atuais em componentes com API propria, criar componentes de rota em `frontend/src/routes/` que:
- recebem contexto por injecao tipada;
- renderizam as paginas ja existentes;
- chamam handlers do dominio expostos pelo integrador;
- cuidam de `onMounted`, `watch` de rota e `onBeforeRouteLeave` quando fizer sentido.

Estrutura proposta:

```text
frontend/src/routes/
  routeContext.ts
  AuthRoute.vue
  LibraryRoute.vue
  StudyRoute.vue
  ImportRoute.vue
  CreateDeckRoute.vue
  ProgressRoute.vue
```

Racional:
- `pages/` continuam sendo superficies visuais controladas;
- `routes/` viram adaptadores stateful de roteamento;
- `App.vue` pode manter os workflows por enquanto, mas deixa de renderizar todas as telas por `v-if`;
- a futura extracao de `useDeckManagement`, `useApkgImport` e `useStudySession` fica mais simples, pois cada rota ja tera uma fronteira explicita.

## 5. Como o `App.vue` Deve Mudar

Estado atual:
- `App.vue` renderiza `AppShell` e, dentro do slot, decide manualmente qual pagina mostrar.

Estado desejado nesta etapa:
- `App.vue` renderiza `AppShell`;
- dentro do slot principal, renderiza `<RouterView />`;
- `App.vue` fornece contextos especificos por dominio/rota via `provide`;
- route components consomem apenas o contexto que precisam.

Exemplo conceitual:

```vue
<AppShell ...>
  <RouterView />
  <CardEditorOverlay v-if="cardEditorOpen && managedDeck" ... />
</AppShell>
```

Observacao:
- `CardEditorOverlay` pode continuar em `App.vue` nesta fatia, porque ele depende do workflow de gerenciamento de cartas e upload de midia;
- mover o overlay junto com todo gerenciamento pode tornar o Momento 7 grande demais.

## 6. Contextos de Rota

Evitar um unico "appContext" gigante.

Criar chaves tipadas por superficie:
- `authRouteKey`;
- `libraryRouteKey`;
- `studyRouteKey`;
- `importRouteKey`;
- `createDeckRouteKey`;
- `progressRouteKey`.

Cada contexto deve expor:
- estado/computed necessario para a rota;
- handlers ja existentes;
- funcoes de sincronizacao ou limpeza especificas.

Nao expor:
- `router` inteiro sem necessidade;
- `api` inteiro;
- `feedback` inteiro;
- refs de outros dominios que a rota nao usa;
- objetos globais com dezenas de funcoes irrelevantes.

Risco:
- provide/inject pode esconder dependencias.

Mitigacao:
- nomes explicitos por dominio;
- interfaces pequenas;
- route components simples;
- manter pages visuais por props/eventos.

## 7. Fase 7A: Substituir `RouteSurface` Por Rotas Reais

Objetivo:
- remover o componente vazio do router;
- apontar cada rota para um componente real;
- trocar o bloco condicional do `App.vue` por `<RouterView />`.

Arquivos esperados:
- `frontend/src/router/index.ts`;
- `frontend/src/routes/routeContext.ts`;
- `frontend/src/routes/LibraryRoute.vue`;
- `frontend/src/routes/StudyRoute.vue`;
- `frontend/src/routes/ImportRoute.vue`;
- `frontend/src/routes/AuthRoute.vue`;
- `frontend/src/routes/CreateDeckRoute.vue`;
- `frontend/src/routes/ProgressRoute.vue`;
- `frontend/src/App.vue`.

Comportamento esperado:
- `/biblioteca/publicos` renderiza Biblioteca publica;
- `/biblioteca/meus` renderiza Meus baralhos;
- `/biblioteca/meus/:deckId/gerenciar` renderiza gerenciamento;
- `/estudo`, `/estudo/baralho/:deckId` e `/estudo/intercalado` renderizam estudo;
- `/importar` renderiza importacao;
- `/criar`, `/progresso`, `/entrar` e `/cadastro` renderizam suas paginas;
- rotas protegidas continuam redirecionando para login quando nao autenticado.

O que nao fazer na 7A:
- nao mover workflows de API para os route components;
- nao criar Pinia;
- nao alterar endpoints;
- nao recriar paginas visuais;
- nao refatorar CSS sem necessidade.

## 8. Fase 7B: Sincronizacao Por Rota

Objetivo:
- reduzir o papel de `syncRouteState()` como switch central;
- aproximar carregamento da rota que precisa dele.

Abordagem:
- `LibraryRoute` chama sincronizacao da biblioteca conforme `route.name` e `deckId`;
- `StudyRoute` chama carregamento/reset conforme rota de estudo;
- `ProgressRoute` carrega stats ao montar quando ha usuario;
- `AuthRoute` aplica modo login/cadastro e preserva redirect;
- `ImportRoute` preserva o estado apenas dentro do fluxo permitido.

Ainda e aceitavel que os route components chamem funcoes providas pelo `App.vue`, desde que:
- a funcao tenha nome especifico, como `syncLibraryRoute`, `loadStudyDeckRoute`, `loadProgressSummary`;
- a rota nao precise conhecer detalhes de API;
- o carregamento continue paginado ou sob demanda.

Ponto de atencao:
- `LibraryRoute` provavelmente sera usado por tres rotas diferentes. Ela deve observar `route.name` e `route.params.deckId` sem forcar remount desnecessario.

## 9. Fase 7C: Ciclo de Vida e Memoria

Objetivo:
- limpar estados temporarios quando a rota deixa de precisar deles;
- limitar caches;
- evitar sobrescrita por respostas antigas.

### 9.1 Importacao APKG

Estado atual:
- ja existe limpeza ao sair de `/importar`, com preservacao no fluxo "Entrar para salvar";
- object URLs sao revogadas;
- `previewMediaRequest` evita aplicar URLs antigas em parte do fluxo.

Melhorias:
- manter a regra de preservar importacao apenas no caminho `/importar -> /entrar|/cadastro -> /importar`;
- garantir limpeza no unmount da rota de importacao;
- ignorar resultado de preview APKG antigo se o usuario selecionar outro arquivo rapidamente;
- avaliar `AbortController` para `previewApkg` se a alteracao de API ficar pequena e segura.

Nao fazer:
- nao limpar o arquivo durante o fluxo de autenticacao necessario para salvar;
- nao manter object URLs vivos apos sair definitivamente da importacao.

### 9.2 Estudo

Estado atual:
- `studyQueue` permanece em `App.vue`;
- ao entrar em `/estudo`, a sessao e resetada;
- ao sair de estudo para outra aba, a fila pode continuar em memoria.

Melhorias:
- limpar `studyQueue` e `answerVisible` ao sair de rotas de estudo, salvo se a navegacao continuar dentro de `/estudo`;
- limitar `publicStudyDeckCache`, usado por estudo anonimo com baralhos publicos;
- preservar estados locais de revisao em `localStorage`, mas nao manter filas invisiveis em memoria.

Politica sugerida para cache anonimo:
- maximo de 6 baralhos publicos em memoria;
- comportamento LRU simples: deck usado recentemente vai para o topo;
- ao exceder limite, remover os mais antigos;
- limpar cache no logout/login se isso reduzir confusao entre modo anonimo e autenticado.

### 9.3 Biblioteca e Gerenciamento

Estado atual:
- listas de decks sao paginadas;
- cartas gerenciadas sao paginadas;
- selecao multipla de cartas e decks ja e podada quando a pagina recarrega;
- gerenciamento de deck e fechado quando sai da rota de gerenciamento.

Melhorias:
- manter selecao de decks somente em `/biblioteca/meus`;
- limpar selecao ao sair de `Meus baralhos`;
- garantir que busca debounceada nao aplique resposta antiga sobre query nova;
- manter cartas paginadas, sem carregar todo o baralho;
- preservar a busca atual apenas enquanto a Biblioteca for a rota ativa.

### 9.4 Timers e Requests

Pontos atuais:
- timers de busca sao limpos no unmount do `App.vue`;
- com `App.vue` persistente, timers podem sobreviver a trocas de rota se nao forem geridos explicitamente;
- requests de busca podem resolver fora de ordem.

Melhorias:
- limpar timers de busca quando a rota associada sai de escopo;
- adicionar controle de sequencia para respostas de busca/paginacao;
- preferir `AbortController` quando a API ja puder aceitar `signal` sem grande mudanca;
- evitar watchers profundos em arrays grandes.

## 10. Fase 7D: Validacao e Testes

Testes automatizados recomendados:
- manter testes existentes de `useDeckLibrary`;
- adicionar teste unitario para limitador de cache anonimo, se extraido como helper puro;
- adicionar teste para ignorar resposta antiga em composable/helper, se a regra ficar isolada;
- build com `vue-tsc` para validar os contextos tipados e route components.

Validacao manual obrigatoria:
- abrir direto `/biblioteca/publicos`;
- abrir direto `/biblioteca/meus` deslogado e confirmar redirect para `/entrar?redirect=...`;
- abrir direto `/biblioteca/meus/:deckId/gerenciar` autenticado;
- alternar entre publicos/meus/gerenciar e conferir selecoes limpas corretamente;
- iniciar estudo por baralho e voltar para Biblioteca;
- iniciar pratica intercalada anonima;
- importar APKG, ir para login e voltar sem perder preview;
- sair da importacao para Biblioteca e confirmar limpeza do preview;
- criar baralho e confirmar navegacao para gerenciamento;
- testar back/forward do navegador nas principais rotas.

Validacao containerizada:
- `npm test`;
- `npm run build`;
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build` quando houver alteracao que precise refletir no ambiente;
- checar `GET /api/decks/public` e frontend em `http://localhost:8080`.

Ponte para o Momento 8:
- apos concluir o Momento 7, transformar os fluxos manuais acima em uma suite Playwright;
- usar banco MySQL dedicado para e2e, sem reutilizar dados de desenvolvimento;
- automatizar subida e descida do ambiente e2e com Compose;
- priorizar primeiro os fluxos que mais dependem das rotas reais: redirects de auth, refresh direto, gerenciamento por URL, limpeza ao sair de Estudo e Importacao.

## 11. Custos Arquiteturais

### Opção A: Route components com provide/inject tipado

Vantagens:
- menor diff;
- permite `RouterView` real;
- preserva pages visuais atuais;
- reduz risco de quebrar fluxos de API;
- prepara a extracao futura de composables.

Custos:
- `App.vue` ainda mantem bastante estado;
- dependencias ficam mediadas por injecao;
- pode virar contexto grande se nao houver disciplina.

Recomendacao:
- usar esta opcao no Momento 7.

### Opção B: Mover todos os workflows para route components

Vantagens:
- `App.vue` fica muito menor rapidamente;
- cada rota passa a ser dona do proprio dominio.

Custos:
- diff grande;
- alto risco em importacao, estudo e gerenciamento;
- exigiria extrair `useDeckManagement`, `useApkgImport` e `useStudySession` ao mesmo tempo;
- maior chance de duplicar feedback, stats e navegacao.

Recomendacao:
- nao usar agora.

### Opção C: Introduzir store global

Vantagens:
- simplifica acesso de route components ao estado.

Custos:
- dependencia nova;
- risco de esconder ciclo de vida;
- pode manter estados pesados vivos por padrao;
- desnecessario para o estagio atual do MVP.

Recomendacao:
- nao usar.

## 12. Faca

- Faca route components pequenos e focados.
- Faca contextos tipados por dominio, nao um contexto unico gigante.
- Faca `AppShell` continuar persistente.
- Faca paginas visuais permanecerem controladas por props/eventos.
- Faca carregamento sob demanda por rota.
- Faca limpeza explicita de importacao, estudo, selecoes e timers.
- Faca controle contra respostas antigas em buscas e previews.
- Faca cache anonimo de estudo ter limite claro.
- Faca commits pequenos: planejamento, rotas reais, ciclo de vida, validacoes.
- Faca build e testes antes de pedir validacao manual.

## 13. Nao Faca

- Nao transformar route components em novas versoes gigantes do `App.vue`.
- Nao mover API para componentes visuais de `pages/`.
- Nao criar store global nesta etapa.
- Nao alterar backend sem necessidade.
- Nao carregar todas as cartas ou todos os baralhos para simplificar estado.
- Nao limpar preview APKG durante o fluxo intencional de login para salvar.
- Nao usar `key=route.fullPath` no `RouterView` sem necessidade, pois isso pode forcar remounts caros e perda de estado.
- Nao trocar toda a estrutura de CSS junto com roteamento.
- Nao esconder efeitos transversais em callbacks genericos como `onChanged`.

## 14. Ordem de Implementacao Sugerida

### Commit 1 - Planejamento

Mensagem sugerida:
- `docs(frontend): planeja momento 7 de rotas e ciclo de vida`

Conteudo:
- este documento.

### Commit 2 - Rotas reais

Mensagem sugerida:
- `refactor(frontend): substitui RouteSurface por rotas reais`

Conteudo:
- criar `frontend/src/routes`;
- criar `routeContext.ts`;
- atualizar router para usar route components;
- trocar renderizacao condicional do `App.vue` por `RouterView`;
- manter workflows no integrador por enquanto.

### Commit 3 - Sincronizacao e limpeza por rota

Mensagem sugerida:
- `refactor(frontend): move sincronizacao para limites de rota`

Conteudo:
- mover chamadas de sincronizacao para route components;
- limpar estudo ao sair de rotas de estudo;
- reforcar limpeza de importacao por rota;
- limpar selecao de Biblioteca ao sair de `Meus baralhos`.

### Commit 4 - Memoria e respostas antigas

Mensagem sugerida:
- `refactor(frontend): controla caches e respostas temporarias`

Conteudo:
- limitar cache anonimo de baralhos publicos;
- adicionar controle de sequencia ou abort para requests sensiveis;
- manter busca e paginacao sem carregamento excessivo.

### Commit 5 - Diario e validacao

Mensagem sugerida:
- `docs(frontend): registra implementacao do momento 7`

Conteudo:
- atualizar diario de bordo;
- registrar validacoes executadas.

## 15. Criterios de Aceite

O Momento 7 deve ser considerado aprovado quando:
- `RouteSurface` nao existir mais;
- router apontar para componentes reais;
- `App.vue` renderizar conteudo de rota via `RouterView`;
- URLs principais continuarem abrindo diretamente;
- guards de autenticacao continuarem preservando redirect;
- importacao APKG preservar estado apenas no fluxo de auth esperado;
- object URLs forem revogadas ao sair da importacao;
- estudo nao mantiver fila invisivel apos sair das rotas de estudo;
- cache anonimo de baralhos publicos tiver limite;
- selecoes de Biblioteca nao sobreviverem fora do escopo correto;
- listas e cartas continuarem paginadas;
- testes e build passarem;
- ambiente containerizado seguir funcional em `http://localhost:8080`.

## 16. Recomendacao Final

Implementar o Momento 7 como uma camada de rotas reais com ciclo de vida explicito, nao como uma extracao completa de dominio.

O melhor primeiro passo e a Fase 7A:
- criar route adapters;
- substituir `RouteSurface`;
- inserir `RouterView` no `App.vue`;
- preservar handlers atuais por contextos tipados.

Depois disso, aplicar 7B e 7C com cuidado, porque limpeza de memoria e comportamento de back/forward sao areas onde regressao pode ser sutil.

A proxima etapa recomendada apos a conclusao do Momento 7 e o Momento 8, descrito em `docs/plano-momento-8-testes-e2e.md`: testes E2E com banco dedicado para automatizar a validacao dos fluxos que hoje exigem checagem manual.
