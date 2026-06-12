# Refatoração com Pinia - Fase 3: Biblioteca e Gerenciamento de Baralhos

## Contexto do Projeto e Padrões
Você é um assistente de IA focado em arquitetura Vue 3 + TypeScript.
O projeto `LearningFrame` avança para a Fase 3 da adoção do **Pinia**.
Agora lidaremos com as abstrações pesadas: `useDeckLibrary` e `useDeckManagement`. Ambas atualmente gerenciam estado global com "refs soltos" fora das funções e são instanciadas de forma fragmentada entre o `App.vue` e o `LibraryRoute.vue`. Além disso, o componente global `CardEditorOverlay` ainda exige inúmeras props (via `v-model`) passadas a partir do `App.vue`.

## Objetivos Constantes
Performance e coesão, extraídas das melhores práticas de desenvolvimento, são objetivos constantes. Todo planejamento deve ser multidimensional.

## Seu Papel: Planejamento (NÃO EXECUTE AINDA)
A sua primeira e única tarefa ao receber este prompt é **acionar o seu modo de planejamento** (Planning Mode) e gerar um Plano de Implementação detalhado (`implementation_plan.md`). 

Você **NÃO DEVE** modificar nenhum código fonte nesta etapa. 

O plano gerado deve ser multidimensional e conter obrigatoriamente:
1.  **Próximos Passos:** Passo a passo técnico para fatiar o gerenciamento em Stores.
2.  **Testes Unitários:** Incluir a exigência de utilizar `setActivePinia(createPinia())` no `beforeEach` de todos os testes impactados, conforme estabelecido na migração do Feedback.
3.  **Limites e Escopo:** Não adentrar o fluxo de Estudo e Limpeza do App.vue.
4.  **Correlações e Consequências:** Como as páginas dependem de carregamento inicial ("lazy" state), e como o `CardEditorOverlay` mudará sua interface de dependências.
5.  **Performance e Coesão:** Como manter a páginação eficiente sem acumular lixo na memória do Vue ou no estado da Pinia (lembrando que os leaks do `onScopeDispose` foram recentemente corrigidos, então o Pinia consolidará essa segurança).

## Objetivo Específico do Planejamento desta Fase
Gere um plano abordando a Fase 3:
- Extração de `useDeckLibrary` para `useLibraryStore` focada em listas paginadas e cache.
- Extração de `useDeckManagement` para `useDeckManagementStore` focada no fluxo de edição ativa.
- Re-ancoragem do `CardEditorOverlay` e páginas da biblioteca para consumirem dados diretos do Pinia em vez do `App.vue`.

**Aguarde a revisão:** Ao finalizar a criação/atualização do documento `implementation_plan.md`, peça a aprovação explícita do usuário. Somente após a aprovação e execução, avaliaremos os resultados de coesão versus o que está por vir.

---

## Status Atual: Fase 1 (Gerenciamento e Biblioteca) Concluída, Aguardando Validação Final E2E

### O que já foi feito detalhadamente:
1. **Criação das Stores Pinia**:
   - `useFeedbackStore.ts`: Responsável por notificações globais (UI) e tratamento de erros através do wrapper `withFeedback()`.
   - `useLibraryStore.ts`: Centraliza as buscas e paginação. Expõe `publicDecks`, `myDecks`, e os métodos robustos `loadPublicDecks` e `loadMyDecks` com controle de concorrência (`requestId`) para evitar *race conditions* quando rotas são trocadas rapidamente ou callbacks ocorrem fora de ordem.
   - `useDeckManagementStore.ts`: Centraliza o estado do `managedDeck` (deck sendo editado/visualizado), a lista de `managedCards` (paginada) e o estado do modal `cardEditorOpen`. Responsável direto por métodos CRUD e recarregamento local (ex: `reloadManagedDeck()`).

2. **Refatoração dos Composables Fachadas (Facades)**:
   - Os composables originais (`useDeckLibrary.ts`, `useDeckManagement.ts`) foram convertidos de "detentores de estado local fora do setup" para meros conectores. Agora eles injetam as stores respectivas (`useLibraryStore()` e `useDeckManagementStore()`) e exportam exatamente a mesma API reativa (ex: usando `storeToRefs`), preservando compatibilidade com dezenas de componentes.
   - `useLibraryActions.ts` atualizado para consumir as stores ao delegar ações de importação/cópia.

3. **Arquitetura de Ciclo de Vida e Rotas (`App.vue` refatorado)**:
   - Foram extraídos composables isolados do `App.vue`: `useLibraryRouteSync.ts` (mantém as tabs e paginação sincronizadas com a URL), `useLibrarySearchLifecycle.ts` (escuta mudanças na barra de pesquisa global e dispara requisições para a Store), e `useRouteLifecycle.ts`.
   - Remoção de código redundante e acoplamento forte entre o Header, Footer e os overlays modais. O `CardEditorOverlay` agora escuta as variáveis diretamente da Store (via facade) em vez de receber `v-model` pesados perfurando os componentes via `App.vue`.

4. **Identificação do Erro no Teste E2E (`import-apkg.spec.ts`)**:
   - Estávamos perseguindo uma falha de sincronia na DOM onde o deck recém-importado ("E2E APKG Importado") não aparecia na tela após o redirecionamento.
   - Após extensa investigação, concluímos que os testes E2E do Playwright (`playwright.config.ts`) apontam para a URL `http://127.0.0.1:18080`, que é servida pelo contêiner Docker do Nginx baseada na pasta estática `dist/`.
   - Como os testes Playwright rodavam sempre na versão *buildada* de horas atrás, as modificações em tempo real que aplicamos na Store, remoção de watchers conflituosos e logs não estavam sendo executados no ambiente do E2E.
   - Rodamos `npm run build` localmente para atualizar o bundle (`dist/`) do frontend, alinhando a versão testada aos arquivos fontes atualizados.

### O que falta para concluir este prompt (Escopo Atual):
1. **Reiniciar o Ambiente Docker**: O usuário deve reconstruir/reiniciar os contêineres (`docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build`) para carregar o bundle mais recente de Frontend gerado pelo Vite.
2. **Executar a Bateria E2E**: Rodar `npx playwright test` novamente. A expectativa é que todos os fluxos (incluindo o de importação de arquivo APKG e visibilidade no DOM) passem de primeira, confirmando que não quebramos nenhum comportamento de interface e que os dados são perfeitamente consistentes através do Pinia.
3. Se os testes E2E passarem limpos, as modificações de arquitetura do `prompt-03-pinia-biblioteca-gerenciamento.md` podem ser marcadas como concluídas com sucesso. O gerenciamento global não dependerá mais do `App.vue` para ancoragem de estado reativo.
