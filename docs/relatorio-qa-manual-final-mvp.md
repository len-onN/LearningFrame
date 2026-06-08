# Relatório de QA Manual Final do MVP

Data: 2026-06-08
Branch: `codex/qa-manual-final`
Commit base testado: `0bb77cf`
Ambiente: Docker Compose local
Frontend: `http://localhost:8080`
Backend: `http://localhost:8081`
Banco: `learningframe` em `localhost:3307`
Navegador usado no QA assistido: Chromium via Playwright headless

## 1. Resumo

O QA manual final foi executado em ambiente Docker principal, complementado por
validações automatizadas e por uma rodada assistida por Playwright contra
`http://127.0.0.1:8080`.

Resultado geral:
- checklist manual final: 18 de 18 fluxos passaram;
- bugs bloqueantes encontrados: nenhum;
- erros de console/pageerror nos fluxos assistidos: nenhum;
- suite E2E dedicada: 14 testes passando;
- testes frontend: 33 testes passando;
- testes backend: 27 testes passando.

Observação: a primeira rodada assistida teve falhas de seletor no próprio roteiro
de QA, não no produto. Os itens foram repetidos com seletores mais fieis ao DOM
real e passaram. A prática intercalada foi checada novamente depois da rodada e
abriu corretamente com fila de estudo.

## 2. Comandos e Resultados

| Comando | Resultado | Observações |
| --- | --- | --- |
| `docker compose up -d --build` | Passou | Containers `db`, `backend` e `frontend` ficaram em execução; banco healthy |
| HTTP `http://127.0.0.1:8080/` | Passou | Status `200` |
| HTTP `http://127.0.0.1:8081/api/decks/public` | Passou | Status `200` |
| `npm test` | Passou | 33 testes frontend; primeira tentativa bloqueada pelo sandbox, repetida fora dele |
| `npm run build` | Passou | `vue-tsc --noEmit` e `vite build`; primeira tentativa bloqueada pelo sandbox, repetida fora dele |
| `npm run e2e` | Passou | 14 testes Playwright em Chromium; Compose dedicado `learningframe-e2e`; teardown com `down -v` |
| `docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test` | Passou | 27 testes backend; build success |
| `git diff --check` | Passou | Sem problemas de whitespace |

## 3. Checklist Executado

| ID | Fluxo | Status | Evidência resumida |
| --- | --- | --- | --- |
| QA-01 | Abrir app anônimo em `/biblioteca/publicos` | Passou | Biblioteca carregou sem login, com baralhos públicos, busca e botão Atualizar sem erro |
| QA-02 | Estudar baralho público anonimamente | Passou | Estudo abriu, resposta foi revelada e rating `Bom` funcionou localmente |
| QA-03 | Validar estudo polido | Passou | Controles `A-`, `A+`, ajuste de mídia, progresso e feedback local responderam |
| QA-04 | Criar conta e fazer login | Passou | Conta QA criada; rota privada redirecionou para login e retornou após autenticação |
| QA-05 | Salvar baralho público para Meus baralhos | Passou | Ação `Salvar para mim` criou cópia privada e navegou para Meus baralhos |
| QA-06 | Criar baralho manual | Passou | Baralho `QA Final Manual` foi criado e abriu gerenciamento contextual |
| QA-07 | Criar, editar e excluir cartas | Passou | Carta textual foi criada, editada, reaberta e excluída |
| QA-08 | Fazer upload de imagem e audio em carta persistida | Passou | Marcadores foram inseridos e imagem/audio renderizaram no estudo |
| QA-09 | Importar APKG com preview antes de salvar | Passou | Fixture APKG exibiu preview anônimo e limpou estado ao sair da rota |
| QA-10 | Salvar APKG autenticado e validar mídias persistidas | Passou | Preview foi preservado no fluxo de login para salvar e baralho importado apareceu em Meus baralhos |
| QA-11 | Estudar deck salvo autenticado | Passou | Review autenticado foi enviado para `/api/study/reviews` e Progresso abriu após revisão |
| QA-12 | Usar prática intercalada | Passou | Rota `/estudo/intercalado` abriu fluxo de estudo/estado coerente e foi rechecada com fila disponível |
| QA-13 | Validar página de progresso | Passou | Página exibiu métricas essenciais para usuário autenticado |
| QA-14 | Testar exclusão multipla de cartas e baralhos | Passou | Exclusão em lote de cartas funcionou; cancelamento de exclusão de baralho preservou dados |
| QA-15 | Alternar tema claro/escuro | Passou | Tema alternou e Biblioteca, Estudo, Importar e Progresso continuaram renderizando |
| QA-16 | Validar refresh direto e back/forward | Passou | Rotas principais recarregaram e histórico não gerou estado incoerente |
| QA-17 | Fazer checagem responsiva mobile | Passou | Viewport `390x844` sem overflow horizontal em Biblioteca, Meus baralhos, Importar, Progresso e Gerenciamento |
| QA-18 | Confirmar mensagens de erro esperadas | Passou | Login invalido e cadastro invalido exibiram mensagens compreensiveis |

## 4. Bugs Encontrados

Nenhum bug bloqueante foi encontrado.

## 5. Observações Não Bloqueantes

- A rodada manual assistida criou dados descartaveis no banco dev local, como
  usuários `qa-final-*` e baralhos `QA Final Manual` / `QA APKG Final`.
- A primeira tentativa de QA assistido falhou em alguns itens por seletores
  frageis do roteiro, especialmente nos controles de fonte e na espera do
  salvamento de baralho público. A repetição ajustada passou.
- Os avisos do Maven sobre carregamento dinamico de agente do Mockito não
  quebram a suite atual, mas podem exigir ajuste futuro quando a política do JDK
  mudar.

## 6. Riscos Aceitos e Pós-MVP

| Item | Classificação | Justificativa |
| --- | --- | --- |
| Token em `localStorage` | Risco aceito MVP | Produto acadêmico/local; hardening fica para produção |
| Token em query string para mídia privada | Risco aceito MVP | Decisão pragmatica para renderização de `img`/`audio`; revisar em produção |
| Mídias como BLOB no MySQL | Risco aceito MVP | Simples e demonstravel no MVP; storage externo fica pós-MVP |
| APKG parcial | Limite documentado | Sem cloze avançado, templates complexos, histórico, scheduler original ou `.colpkg` |
| Editor simples sem rich text completo | Pós-MVP | Fluxo atual já permite HTML/mídia básicos |
| Dashboard avançado, filtros e favoritos | Pós-MVP | Fora do escopo da entrega acadêmica atual |

## 7. Decisão

O MVP não apresentou bloqueios funcionais nos fluxos principais testados. A
branch pode seguir para fechamento documental final, mantendo correções
funcionais apenas se surgir regressao objetiva em revisão posterior.
