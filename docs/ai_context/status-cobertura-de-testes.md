# Análise de Cobertura de Testes (Front, Back e E2E)

Realizei um levantamento detalhado da arquitetura de testes atual da aplicação para identificar pontos fortes e potenciais lacunas. A estratégia de testes atual é muito boa, cobrindo a maioria dos fluxos críticos de negócio, mas há áreas de infraestrutura e integração que precisam de atenção.

Abaixo, um mapa da situação atual e recomendações de onde podemos enriquecer a cobertura.

---

## 1. Frontend (Unitários via Vitest)

Atualmente temos **107 testes** passando em **21 arquivos**. 

**✅ Pontos Fortes (Bem Cobertos):**
- **Regras de Negócio e Lógica de Estado**: Quase todas as fachadas e composables críticos (`useDeckLibrary`, `useDeckManagement`, `useStudySession`, `useApkgImport`, `useAuthFlow`) possuem excelente cobertura de comportamento (chamadas de API, transformações de estado, lógica de paginação).
- **Utilitários Puros**: Algoritmos cruciais como o `srs.ts` (Spaced Repetition), higienizadores de HTML (`html.ts`) e parseadores (`apkgMedia.ts`) estão muito bem testados.

**⚠️ Lacunas (Onde Enriquecer):**
- **Testes de Componentes (Vue Test Utils / Testing Library)**: Atualmente, os testes focam massivamente no "JavaScript/TypeScript" (composables/stores) e quase não há testes montando os componentes do Vue (ex: `CardEditorOverlay.vue`, `StudyPage.vue`). É vital testar se a interface reage corretamente aos estados, se os botões emitem os eventos esperados (`@click`) e se diretivas (`v-if`, `v-for`) comportam-se bem visualmente.
- **Testes de Integração com o DOM**: Garantir que as validações de formulários reativas mostram o erro correto na tela do usuário.

## 2. Backend (Unitários via JUnit / Mockito)

Atualmente identifiquei **7 classes de teste** no backend (ex: `DeckServiceTest`, `SpacedRepetitionServiceTest`, `ApkgImportServiceTest`).

**✅ Pontos Fortes (Bem Cobertos):**
- **Core Domain**: A lógica pesada da aplicação, como o algoritmo do `SpacedRepetitionService`, o parsing complexo no `ApkgImportService` e o gerenciamento de permissões no `DeckService`, estão com testes isolados validando regras de negócio.

**⚠️ Lacunas (Onde Enriquecer):**
- **Camada de Repositório (`@DataJpaTest`)**: Muitas vezes, queries customizadas no Spring Data JPA (`@Query`) escondem bugs de banco de dados e de N+1. É crucial criar testes transacionais para os repositórios (ex: `DeckRepositoryTest`) em um banco de dados em memória (H2) ou Testcontainers.
- **Testes de Controladores (Security & Validation)**: Faltam testes via `@WebMvcTest` para validar a camada HTTP. Precisamos atestar se os endpoints rejeitam (401/403) requisições sem tokens JWT válidos, e se as constraints de `@Valid` (ex: campos obrigatórios, tamanho mínimo de senha) nos DTOs funcionam corretamente e retornam 400 Bad Request.
- **Camada de Autenticação / AuthController**: O fluxo de geração e validação do token JWT costuma ser o coração da segurança e merece testes incisivos.

## 3. End-to-End (E2E via Playwright)

Atualmente temos **14 testes** passando em **7 arquivos**.

**✅ Pontos Fortes (Bem Cobertos):**
- **Fluxos Felizes (Happy Paths)**: A navegação do usuário (Login, Criação de Baralho, Estudo Autenticado, Biblioteca Pública e Importação APKG) é validada com maestria do início ao fim com um banco de dados real dedicado.
- **Gestão de Risco**: Casos como "edição em lote" e "comportamento do botão back/forward do navegador" que são suscetíveis a falhas de estado foram inteligentemente cobertos (`routing-risk.spec.ts`, `deck-risk-flows.spec.ts`).

**⚠️ Lacunas (Onde Enriquecer):**
- **Testes de Fluxos Negativos (Error Handling)**: O que o usuário vê se a API retornar um erro 500 ou demorar para responder? O E2E deveria interceptar uma rota (usando `page.route()`) e forçar uma falha de rede para validar se o Notification/Feedback Store avisa o usuário elegantemente.
- **Responsividade (Mobile)**: O Playwright permite rodar a mesma suíte emulando o viewport de celulares. Podemos adicionar um *project* de Mobile Chrome/Safari no `playwright.config.ts` para atestar que o Layout (hambúrguer menu, overlays em telas pequenas) não quebra.
- **Fluxos de Perfil**: O gerenciamento de credenciais (mudança de senha, deleção de conta) ainda precisa de uma passagem do Playwright caso exista na UI.

---

## Onde você quer focar primeiro?

Podemos abordar essa melhoria sob diferentes perspectivas. Sugiro escolhermos uma por vez:

1. **(Frontend)** Introduzir **Testes de Componentes Vue (VTU)** para validar interfaces complexas (ex: Editor de Cartas ou Tela de Estudo).
2. **(Backend)** Criar **Testes de Integração de Segurança e Repositórios**, blindando as rotas da API contra falhas de injeção e segurança.
3. **(E2E)** Adicionar testes de **Comportamento Resiliente (Tratamento de Falhas)** interceptando conexões no Playwright e rodando em simuladores mobile.
