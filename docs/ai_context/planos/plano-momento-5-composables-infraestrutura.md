# Planejamento do Momento 5: Composables de Infraestrutura

**Status:** implementado na branch de planejamento e implementacao.  
**Branch:** `codex/frontend-next-refactor-plan`  
**Base:** `frontend-refactor`  
**Destino do PR:** `frontend-refactor`  
**Dependencias concluidas:** Router principal, AppShell, paginas controladas, Biblioteca/Importacao extraidas e `CardEditorOverlay`.

## 1. Objetivo

Extrair do `App.vue` os estados e efeitos globais de infraestrutura que ainda impedem uma evolucao segura para rotas reais e composables de dominio.

Objetivos:
- reduzir responsabilidades globais do `App.vue` sem alterar comportamento visual;
- consolidar notificacoes, loading e `withFeedback` fora do componente raiz;
- mover preferencia de tema e persistencia de sessao para composables pequenos;
- tornar os efeitos globais testaveis e reaproveitaveis pelas futuras paginas roteadas;
- preparar o terreno para uma etapa posterior com composables de dominio e `RouterView` real.

Nao objetivos:
- nao trocar `RouteSurface` por paginas reais no router ainda;
- nao introduzir Pinia ou outra store global;
- nao mover fluxos de Biblioteca, Importacao, Estudo ou Gerenciamento de cartas;
- nao alterar contratos do backend;
- nao alterar CSS ou UX visual;
- nao mudar URLs publicas;
- nao criar uma camada nova de API.

## 2. Estado Atual Confirmado

Depois do Momento 4B:
- `App.vue` tem cerca de 1380 linhas;
- `frontend/src/router/index.ts` ja define paths e guards, mas cada rota aponta para `RouteSurface`, um componente vazio;
- o `App.vue` ainda decide qual pagina renderizar com `v-if` baseado em `tab`;
- `AppShell`, paginas simples, Biblioteca, Importacao e `CardEditorOverlay` ja foram extraidos como componentes controlados;
- estado, chamadas API, watchers, notificacoes, tema, auth, estudo, importacao e biblioteca continuam orquestrados no `App.vue`.

Responsabilidades globais ainda presentes no `App.vue`:
- `notice`, `error`, `feedbackLifetime`, `loading` e `withFeedback`;
- `themePreference`, `nextThemeLabel`, `toggleThemePreference`, `applyThemePreference`;
- `user`, leitura/gravacao de `localStorage`, `setAuthToken` e `clearAuthToken`;
- `navTabs`, `visibleTabs`, `currentTitle`;
- watchers de rota, busca e limpeza de ciclo de vida;
- workflows de dominio.

## 3. Diagnostico

O roteamento ja existe, mas ainda nao e a fonte de composicao das telas. O router informa estado via `meta`, enquanto o `App.vue` renderiza manualmente as paginas. Isso foi aceitavel nas etapas anteriores porque evitou mover regra de negocio junto com a UI.

O problema agora e que mover paginas diretamente para o router, sem antes extrair estado compartilhado, causaria uma das tres opcoes ruins:
- passar dezenas de props e eventos por um `RouterView` central;
- criar `provide/inject` amplo demais, com dependencias implicitas e dificeis de rastrear;
- duplicar estado entre paginas, quebrando cache, notificacoes, auth e limpeza de memoria.

Conclusao:
- a proxima etapa nao deve ser `RouterView` real ainda;
- a proxima etapa deve extrair infraestrutura compartilhada pequena e testavel;
- depois disso, fica mais barato separar composables de dominio e transformar as paginas em route components reais.

## 4. Fronteira Recomendada

Criar uma pasta de composables compartilhados:

```txt
frontend/src/composables/
  useFeedback.ts
  useTheme.ts
  useAuthSession.ts
```

### 4.1 `useFeedback.ts`

Responsabilidade:
- controlar `notice`;
- controlar `error`;
- controlar `loading`;
- controlar lifetime de feedback;
- expor `showNotice`, `showError`, `clearFeedback`, `clearFeedbackForRouteChange`, `dismissNotice`, `dismissError`;
- expor `withFeedback`.

Tipos sugeridos:

```ts
export type FeedbackLifetime = 'route' | 'next-route' | 'sticky'

export interface FeedbackOptions {
  showLoading?: boolean
  clearOnStart?: boolean
}
```

Assinatura recomendada:

```ts
async function withFeedback(
  task: () => Promise<void>,
  options?: FeedbackOptions
): Promise<void>
```

Motivo:
- substituir chamadas pouco expressivas como `withFeedback(task, false, false)`;
- manter a correcao do bug de notificacoes persistentes;
- permitir teste unitario do ciclo `route`, `next-route` e `sticky`;
- preparar uso futuro por paginas roteadas sem copiar estado.

Pontos de atencao:
- manter mensagem amigavel para `Failed to fetch`;
- preservar comportamento de cargas de rota que nao devem apagar feedback recem-criado;
- evitar que `loading` fique preso em `true` se a task falhar;
- garantir que dismiss manual reseta lifetime apenas quando nao ha outro feedback ativo.

### 4.2 `useTheme.ts`

Responsabilidade:
- carregar preferencia de tema de `localStorage`;
- expor `themePreference`;
- expor `nextThemeLabel`;
- expor `toggleThemePreference`;
- aplicar `document.documentElement.dataset.theme`;
- aplicar `document.documentElement.style.colorScheme`.

Motivo:
- tema e uma preferencia global independente das paginas;
- remover efeito de DOM do `App.vue`;
- manter `AppShell` apenas como superficie visual.

Pontos de atencao:
- preservar chave `learningframe.theme`;
- manter fallback para `light`;
- chamar aplicacao inicial no `onMounted` ou encapsular isso no composable com funcao explicita;
- evitar depender de APIs de navegador durante importacao do modulo.

### 4.3 `useAuthSession.ts`

Responsabilidade:
- inicializar `user` a partir de `localStorage`;
- persistir usuario e token apos login/registro;
- limpar usuario e token no logout;
- manter a chave `learningframe.user`;
- continuar usando `setAuthToken` e `clearAuthToken` do `services/api`.

O composable nao deve:
- chamar `api.login`;
- chamar `api.register`;
- decidir rotas de redirect;
- carregar biblioteca, stats ou importacao;
- conhecer `returnToImportAfterAuth`.

Motivo:
- separar persistencia de sessao do workflow de autenticacao;
- preservar o router guard atual baseado em token;
- preparar um futuro `useAuth` completo sem misturar login, redirect e refresh de dados em uma unica mudanca.

Pontos de atencao:
- se `localStorage` tiver JSON invalido, retornar `null` sem quebrar a aplicacao;
- manter usuario em memoria e storage sincronizados;
- garantir que logout limpe token antes de navegar para areas publicas.

## 5. Mudancas no `App.vue`

Remover do `App.vue`:
- tipo `FeedbackLifetime`;
- refs `notice`, `error`, `feedbackLifetime`, `loading`;
- funcoes locais de feedback;
- funcoes locais de tema;
- funcoes locais `loadStoredUser` e `loadStoredThemePreference`.

Substituir por:
- `const feedback = useFeedback()`;
- `const theme = useTheme()`;
- `const authSession = useAuthSession()`.

Uso esperado no `App.vue`:
- desestruturar refs e funcoes necessarias mantendo nomes atuais quando isso reduzir diff;
- atualizar chamadas de `withFeedback` para a assinatura com objeto de opcoes;
- manter workflows de dominio no `App.vue`;
- manter `submitAuth()` no `App.vue`, mas trocar persistencia direta por `authSession.persistSession(response.user, response.token)`;
- manter `logout()` no `App.vue`, mas trocar limpeza direta por `authSession.clearSession()`;
- manter `onMounted` para aplicar tema, caso o composable exponha `applyThemePreference`.

## 6. O Que Nao Mover Nesta Etapa

Nao mover ainda:
- `syncRouteState`;
- `loadPublicDecks`, `loadMyDecks`, `loadManagedCards`;
- `savePublicDeck`, `createDeck`, `saveManagedDeck`, `deleteManagedDeck`;
- `handleApkgChange`, `persistImport`, preview APKG e object URLs;
- `loadStudyDeck`, `loadInterleavedPractice`, `reviewCurrent`;
- `CardEditorOverlay` workflows;
- `navTabs`, se a extracao aumentar acoplamento com icones e usuario.

Motivo:
- esses blocos sao dominio, nao infraestrutura;
- move-los agora mudaria muitas fronteiras ao mesmo tempo;
- a etapa deve ser pequena o bastante para revisar diffs com seguranca.

## 7. Lateralidades

### 7.1 Router

Sem alteracao de paths, nomes de rota ou guards.

Impacto esperado:
- apenas o watcher de `route.fullPath` passa a chamar `feedback.clearFeedbackForRouteChange(previousFullPath)`;
- cargas acionadas por `syncRouteState` continuam usando `clearOnStart: false` quando apropriado.

Risco:
- limpar mensagens cedo demais ou tarde demais.

Mitigacao:
- testes unitarios de lifetime do feedback;
- validacao manual de exclusao de baralho, copia de baralho publico, importacao APKG e login.

### 7.2 Autenticacao

Sem mudanca de contrato com backend.

Impacto esperado:
- login/registro continuam chamando `api.login`/`api.register` no `App.vue`;
- persistencia passa a ser delegada ao composable;
- logout passa a limpar sessao via composable.

Risco:
- router guard nao reconhecer token apos login;
- token permanecer apos logout.

Mitigacao:
- manter uso de `setAuthToken` e `clearAuthToken`;
- testar login, logout e redirect para rota protegida.

### 7.3 Notificacoes

Impacto esperado:
- nenhuma mudanca visual;
- mensagens comuns continuam fechaveis pelo `AppShell`;
- mensagens route-scoped somem na proxima navegacao.

Risco:
- regressao do bug corrigido no Momento 4B.

Mitigacao:
- teste unitario do composable;
- validacao manual de exclusao de baralho seguida de troca de pagina.

### 7.4 Tema

Impacto esperado:
- nenhuma mudanca visual;
- chave `learningframe.theme` preservada.

Risco:
- tema inicial piscar ou nao aplicar ao carregar.

Mitigacao:
- aplicar tema em `onMounted` como hoje;
- validar alternancia claro/escuro.

### 7.5 Importacao APKG e Memoria

Sem mudanca direta.

Cuidados:
- nao tocar na politica de `clearImportStateForRouteChange`;
- nao mover `previewMediaUrls`, `previewMediaIndex` ou `selectedFile`;
- preservar revogacao de object URLs.

### 7.6 Biblioteca e Gerenciamento

Sem mudanca direta.

Cuidados:
- preservar fluxo de `closeManagedDeck`;
- preservar notificacao apos excluir deck;
- preservar busca debounceada e paginacao.

### 7.7 Testes

Adicionar ou ajustar testes em:

```txt
frontend/src/composables/useFeedback.test.ts
```

Cenarios minimos:
- `showNotice` limpa erro e define lifetime;
- `showError` limpa notice e define lifetime;
- `clearFeedbackForRouteChange` limpa lifetime `route`;
- `clearFeedbackForRouteChange` preserva `next-route` uma vez e depois permite limpeza;
- `sticky` nao limpa na troca de rota;
- `withFeedback` sempre encerra loading em sucesso e erro;
- `withFeedback` traduz `Failed to fetch`.

Build e testes:
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend-builder npm run build`;
- `docker compose -f docker-compose.yml -f docker-compose.dev.yml run --rm frontend-builder npm test`.

## 8. Sequencia Recomendada de Implementacao

### Passo 1 - Extrair Feedback

Criar `useFeedback.ts` e migrar o estado atual sem alterar comportamento.

Alteracoes:
- mover tipo de lifetime;
- mover refs e helpers;
- trocar `withFeedback(task, false, false)` por `withFeedback(task, { showLoading: false, clearOnStart: false })`;
- atualizar watcher de rota.

Validar:
- `npm test`;
- fluxo manual de notificacoes principais.

### Passo 2 - Testar Feedback

Criar testes unitarios focados no ciclo de vida.

Motivo:
- essa e a parte que ja gerou bug real;
- os testes documentam a regra antes de novas paginas usarem o composable.

### Passo 3 - Extrair Tema

Criar `useTheme.ts`.

Alteracoes:
- mover load/apply/toggle;
- manter props do `AppShell` iguais;
- preservar `onMounted`.

Validar:
- build;
- alternancia claro/escuro manual.

### Passo 4 - Extrair Sessao Armazenada

Criar `useAuthSession.ts`.

Alteracoes:
- mover leitura inicial do usuario;
- trocar persistencia direta no login por `persistSession`;
- trocar limpeza direta no logout por `clearSession`.

Validar:
- login;
- logout;
- rota protegida redirecionando para `/entrar`;
- redirect de volta para `/importar` quando aplicavel.

### Passo 5 - Revisao Final do `App.vue`

Conferir:
- imports removidos;
- nenhum helper duplicado;
- nenhuma alteracao de template desnecessaria;
- nenhum estado pesado movido por acidente;
- line count reduzido sem perda de clareza.

## 9. Criterios de Aceite

Funcionais:
- notificacoes continuam aparecendo e desaparecendo com o mesmo comportamento corrigido;
- exclusao de baralho nao deixa notificacao persistente apos navegar;
- login, registro, logout e redirect funcionam;
- tema claro/escuro persiste;
- Biblioteca, Importacao, Estudo, Criar e Progresso continuam acessiveis pelas mesmas URLs;
- importacao APKG ainda limpa estado pesado ao sair da rota, exceto fluxo de auth preservado.

Arquiteturais:
- `App.vue` deixa de conter implementacao de feedback, tema e persistencia basica de sessao;
- composables novos nao importam componentes Vue;
- composables novos nao conhecem regras de dominio de Biblioteca, Importacao ou Estudo;
- nenhuma store global nova e introduzida;
- router permanece com os mesmos paths e guards.

Validacao tecnica:
- build frontend em container passando;
- testes frontend em container passando;
- novos testes de feedback cobrindo lifetime.

## 10. Proxima Etapa Depois do Momento 5

Com a infraestrutura fora do `App.vue`, a proxima etapa deve ser um dos dois caminhos:

1. **Composables de dominio por feature**  
   Extrair `useDeckLibrary`, `useDeckManagement`, `useApkgImport` e `useStudySession`, mantendo `App.vue` como integrador temporario.

2. **Route components reais**  
   Trocar `RouteSurface` por paginas reais somente quando cada pagina puder obter seus dados por composables claros, sem exigir um `RouterView` cheio de props/eventos.

Recomendacao:
- seguir primeiro para composables de dominio;
- transformar o router em composicao real logo depois, quando as paginas ja estiverem menos dependentes do `App.vue`.
