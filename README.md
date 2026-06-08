# LearningFrame

LearningFrame e um MVP academico para estudo com recordacao ativa,
repeticao espacada e pratica intercalada.

O produto permite que visitantes estudem baralhos publicos sem conta, facam
preview de arquivos Anki `.apkg` antes de salvar e usem uma conta opcional para
persistir baralhos, cartas, midias, revisoes e progresso essencial.

## Status do MVP

Estado atual:

- MVP funcional e validado para entrega academica;
- QA manual final com 18 de 18 fluxos passando;
- suite frontend com 33 testes passando;
- suite E2E com 14 testes Playwright em Chromium e banco dedicado;
- testes backend Maven com 27 testes passando;
- sugestao de marco final: `v0.1.0-mvp`.

## Stack

- Java 21, Spring Boot 4.0.x e Maven
- MySQL 8.4 LTS
- Vue 3, Vite, TypeScript e Vue Router
- Playwright para testes end-to-end
- Docker Compose para execucao local e E2E

## Executar com Docker Compose

```powershell
docker compose up --build
```

Depois, abrir:

- Frontend: http://localhost:8080
- Backend API: http://localhost:8081
- MySQL local: localhost:3307

## Desenvolvimento Local

Backend:

```powershell
cd backend
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Validacoes

Na raiz do repositorio:

```powershell
npm test
npm run build
npm run e2e
```

Testes backend via container Maven:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

Observacao: o comando acima usa o caminho local atual do projeto. Em outro
ambiente, ajuste o caminho absoluto montado em `/workspace`.

## Ambiente E2E

A suite E2E usa um Compose dedicado:

```powershell
npm run e2e
```

Esse comando:

- sobe `db-e2e`, `backend-e2e` e `frontend-e2e`;
- usa banco MySQL separado, `learningframe_e2e`;
- usa portas separadas, incluindo frontend `18080`, backend `18081` e MySQL `3317`;
- executa Playwright em Chromium;
- derruba o ambiente com `docker compose down -v`, removendo o volume do banco E2E.

Regras importantes:

- testes E2E nao devem usar o banco dev;
- reset/seed de teste passam pelo endpoint interno `POST /api/e2e/reset`;
- o endpoint de reset existe apenas no profile backend `e2e` e exige `X-E2E-Token`.

Comandos auxiliares para depuracao:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

## Escopo do MVP

Incluido:

- biblioteca publica com estudo anonimo;
- conta opcional com login/cadastro;
- criacao, edicao, exclusao e selecao de baralhos proprios;
- gerenciamento paginado de cartas;
- upload e renderizacao de midia em baralhos persistidos;
- importacao `.apkg` basica com preview antes de salvar;
- estudo por baralho e pratica intercalada;
- SRS simplificado proprio do LearningFrame;
- progresso essencial para usuarios autenticados;
- rotas reais com guards de autenticacao;
- suite inicial E2E com banco dedicado.

Fora do MVP imediato:

- replicar o Anki por completo;
- cloze avancado;
- templates complexos do Anki;
- preservar historico ou configuracoes originais de agendamento do Anki;
- `.colpkg`;
- favoritos, marketplace ou colaboracao multiusuario;
- dashboard estatistico avancado;
- storage externo para midia.

## Limites e Decisoes Tecnicas

- Arquivos `.apkg` sao usados como interoperabilidade basica, mas o LearningFrame
  inicia uma agenda propria de revisao.
- O preview anonimo de APKG e temporario. Ao sair da rota de importacao, arquivo,
  preview, indice de midia e object URLs devem ser limpos, exceto no fluxo
  explicito de entrar para salvar.
- Midias persistidas ficam como BLOB no MySQL. Isso e aceitavel para o MVP
  academico, mas nao e a arquitetura recomendada para escala.
- Tokens de sessao ficam em `localStorage`, aceitavel para demonstracao local do
  MVP, mas exigiria hardening para producao sensivel.
- Midias privadas podem usar token em query string para renderizacao por
  `<img>`/`audio`, uma decisao pragmatica do MVP que deve ser revisada em
  producao.

## Documentacao de Projeto

Guias finais do MVP:

- [Principios e padroes do MVP](docs/principios-e-padroes-mvp.md)
- [Guia de uso do MVP](docs/guia-de-uso-mvp.md)
- [Guia de integracao com Anki/APKG](docs/guia-anki-apkg-mvp.md)
- [Guia de execucao local](docs/guia-execucao-local-mvp.md)
- [Estado final do MVP](docs/estado-final-mvp.md)
- [Relatorio de QA manual final](docs/relatorio-qa-manual-final-mvp.md)
- [Diario de bordo](docs/diario-de-bordo.md)

Contexto historico e de desenvolvimento assistido:

- [README do contexto de IA](docs/ai_context/README.md)
- [Linha do tempo](docs/ai_context/linha-do-tempo.md)
- [Memoria de decisoes](docs/ai_context/memoria-de-decisoes.md)
- [Planos](docs/ai_context/planos/)
- [Prompts](docs/ai_context/prompts/)
- [Arquitetura e decisoes historicas](docs/ai_context/arquitetura-e-decisoes/)
- [Snapshots](docs/ai_context/snapshots/)
