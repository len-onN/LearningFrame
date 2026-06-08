# LearningFrame - Snapshot do projeto

Data/hora: 2026-05-30 18:53:40 America/Sao_Paulo

## Resumo

LearningFrame e um MVP academico para estudo por recordacao ativa, repeticao espacada e pratica intercalada. A aplicacao permite estudar baralhos publicos sem login, importar arquivos Anki `.apkg` para estudo local, criar uma conta para persistir baralhos/revisoes/progresso e alternar entre estudo focado em um baralho ou modo misto.

O objetivo do MVP nao e replicar todo o Anki. A proposta e validar um fluxo web simples, com importacao basica, agenda propria de revisao e uma experiencia de estudo limpa para usuarios anonimos e autenticados.

## Decisoes de negocio

- Usuarios anonimos podem estudar baralhos publicos e importar `.apkg` no navegador, usando memoria/local storage.
- Usuarios autenticados podem persistir baralhos, cards, revisoes, publicacao e estatisticas essenciais.
- Baralhos podem ser `PUBLIC` ou `PRIVATE`.
- O "modo caos" representa pratica intercalada: mistura cards vencidos de diferentes baralhos.
- A agenda de revisao do LearningFrame comeca do zero, mesmo quando o conteudo vem de `.apkg`.
- Importacao `.apkg` cobre baralhos basicos e midias associadas; templates complexos, cloze avancado, historico original de agendamento e `.colpkg` estao fora do escopo inicial.
- O produto prioriza um caminho academico e reproduzivel antes de recursos sociais, marketplace, recomendacoes ou colaboracao.

## Decisoes tecnicas

- Execucao principal: Docker Compose.
- Servicos do Compose:
  - `db`: MySQL 8.4, exposto localmente em `3307`.
  - `backend`: Spring Boot em Java 21, exposto em `8081`.
  - `frontend`: build Vue servido por Nginx, exposto em `8080`.
- Backend:
  - Java 21, Spring Boot 4.0.x, Maven.
  - Spring Web MVC, Security, Validation, Jackson, JPA e Flyway.
  - MySQL como banco persistente.
  - JWT stateless para autenticacao.
  - BCrypt para hash de senha.
  - Flyway controla o schema inicial.
  - Midias importadas ficam inicialmente em `media_assets` como BLOB, decisao aceitavel para MVP.
- Frontend:
  - Vue 3, Vite, TypeScript e lucide-vue.
  - Aplicacao em tela unica com abas de biblioteca, estudo, importacao, criacao e progresso.
  - Estado anonimo usa `localStorage`.
  - A logica de SRS local espelha a logica do backend para estudo anonimo.
- Infra local:
  - `.env.example` documenta variaveis de desenvolvimento.
  - `.env`, `.env.*`, `node_modules`, `dist`, `target` e logs estao ignorados pelo Git.

## Modelo atual

Entidades principais:

- `app_users`: usuarios autenticados.
- `decks`: baralhos com dono opcional, visibilidade e formato de origem.
- `cards`: cards associados a baralhos.
- `tags` e `card_tags`: taxonomia simples para cards.
- `media_assets`: midias importadas por baralho.
- `review_states`: estado atual de revisao por usuario/card.
- `review_logs`: historico de revisoes.

Seed inicial:

- `Metodologia Cientifica`
- `Arquitetura Web`

## APIs atuais

- `POST /api/auth/register`: cria usuario e retorna token.
- `POST /api/auth/login`: autentica usuario e retorna token.
- `GET /api/decks/public`: lista baralhos publicos.
- `GET /api/decks/mine`: lista baralhos do usuario autenticado.
- `GET /api/decks/{deckId}`: detalha baralho acessivel.
- `POST /api/decks`: cria baralho autenticado.
- `PUT /api/decks/{deckId}`: atualiza baralho do usuario.
- `DELETE /api/decks/{deckId}`: remove baralho do usuario.
- `POST /api/decks/{deckId}/cards`: cria card.
- `PUT /api/decks/{deckId}/cards/{cardId}`: atualiza card.
- `DELETE /api/decks/{deckId}/cards/{cardId}`: remove card.
- `GET /api/decks/{deckId}/media/{fileName}`: entrega midia acessivel.
- `POST /api/import/apkg/preview`: pre-visualiza importacao `.apkg`.
- `POST /api/decks/import/apkg`: importa `.apkg` para usuario autenticado.
- `GET /api/study/due`: lista cards vencidos por modo de estudo.
- `POST /api/study/reviews`: registra revisao autenticada.
- `POST /api/study/anonymous/review`: calcula revisao anonima.
- `GET /api/stats/summary`: retorna resumo de progresso do usuario.

## Estado atual da aplicacao

- Repositorio local inicializado com commit base `a91f60e feat(app): bootstrap LearningFrame MVP`.
- Branch local no momento do snapshot: `master`; decisao tomada para renomear para `main` antes do primeiro push.
- Remote GitHub ainda nao configurado no momento deste documento.
- Repositorio GitHub alvo: `LearningFrame`, inicialmente privado.
- GitHub CLI foi instalado localmente para criar o repositorio e fazer push.
- Compose validado com `docker compose config`.
- `docker compose ps` mostrou que nao havia containers do projeto em execucao no momento da checagem.
- Teste frontend rapido executado fora do sandbox: `npm test` passou com 1 arquivo e 2 testes.
- Testes backend nao foram executados localmente porque `mvn` nao esta disponivel no PATH do host; como o backend e construido via Dockerfile com imagem Maven, a verificacao preferencial deve ocorrer por container.

## Execucao padrao

O caminho principal para rodar a aplicacao deve ser:

```powershell
docker compose up --build
```

URLs esperadas:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8081`
- MySQL local: `localhost:3307`

Quando houver necessidade de testes ou validacao mais forte, a preferencia do projeto e evoluir comandos containerizados em vez de depender de Maven/Node instalados no host.

## Politica de commits

O projeto deve usar Conventional Commits a partir deste ponto.

Tipos recomendados:

- `feat`: nova capacidade de produto ou API.
- `fix`: correcao de bug.
- `docs`: documentacao.
- `test`: testes sem mudanca de comportamento de producao.
- `refactor`: reorganizacao sem alterar comportamento.
- `build`: Docker, dependencias, empacotamento ou build system.
- `chore`: manutencao sem impacto direto em produto.
- `ci`: pipelines e automacoes.

Regra de granularidade:

- Um commit deve representar uma unidade logica revisavel e reversivel.
- O criterio pratico e: "isso tem um motivo unico para existir e um motivo unico para ser revertido?"
- E aceitavel agrupar multiplos metodos, endpoints e testes quando todos pertencem a mesma entrega coesa.
- Nao e necessario criar um commit por metodo, por `describe` de teste ou por detalhe interno sem valor historico proprio.
- Mudancas de runtime e documentacao estrutural devem ficar separadas quando possivel.
- Commits grandes sao aceitaveis para bootstrap inicial ou fatias verticais completas, desde que a mensagem explique bem o escopo.

Exemplos de granularidade saudavel:

- `feat(auth): add jwt registration and login`
- `feat(deck): add deck and card crud`
- `feat(study): add spaced repetition review flow`
- `feat(import): support basic apkg import`
- `test(study): cover spaced repetition scheduling`
- `docs(project): add application snapshot`
- `build(compose): containerize web api and database`

Para commits com mais contexto, usar multiplos `-m`:

```powershell
git commit -m "feat(deck): add deck and card crud" -m "Adds owner-aware deck management, card upserts, visibility rules, and API validation."
```

## Proximos passos imediatos

- Renomear branch local para `main`.
- Confirmar login do GitHub CLI.
- Criar repositorio privado `LearningFrame`.
- Configurar `origin`.
- Fazer push inicial.
- Depois do push, priorizar validacao via `docker compose up --build`.
