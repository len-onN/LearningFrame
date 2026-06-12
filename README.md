# LearningFrame

LearningFrame é um MVP acadêmico para estudo com recordação ativa,
repetição espaçada e prática intercalada.

O produto permite que visitantes estudem baralhos públicos sem conta, façam
preview de arquivos Anki `.apkg` antes de salvar e usem uma conta opcional para
persistir baralhos, cartas, mídias, revisões e progresso essencial.

Como horizonte de produto, o LearningFrame pode ser entendido como uma aplicação
gratuita de suporte ao aprendizado ofertada por uma instituição de ensino. A
integração institucional real fica fora do MVP e é tratada no roadmap
pós-MVP.

## Status da Versão

Estado atual (v0.2.0):

- Aplicação funcional e validada com novas capacidades avançadas;
- Editor de Cartas Avançado (WYSIWYG com TipTap);
- Gravação nativa de áudio pelo microfone;
- Gerenciamento completo de Perfil de Usuário com alteração segura de senhas;
- Gestão global de estado migrada para **Pinia**;
- Fluxo de login reformulado com redirecionamento na raiz;
- QA manual finalizado e suites de testes mantidas.

## Stack

- Java 21, Spring Boot 4.0.x e Maven
- MySQL 8.4 LTS
- Vue 3, Vite, TypeScript e Vue Router
- Playwright para testes end-to-end
- Docker Compose para execução local e E2E

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

## Validações

Na raiz do repositório:

```powershell
npm test
npm run build
npm run e2e
```

Testes backend via container Maven:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

Observação: o comando acima usa o caminho local atual do projeto. Em outro
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

- testes E2E não devem usar o banco dev;
- reset/seed de teste passam pelo endpoint interno `POST /api/e2e/reset`;
- o endpoint de reset existe apenas no profile backend `e2e` e exige `X-E2E-Token`.

Comandos auxiliares para depuracao:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

## Escopo do MVP

Incluído:

- biblioteca pública com estudo anônimo;
- conta opcional com login/cadastro;
- criação, edição, exclusão e seleção de baralhos próprios;
- gerenciamento paginado de cartas;
- upload e renderização de mídia em baralhos persistidos;
- importação `.apkg` básica com preview antes de salvar;
- estudo por baralho e prática intercalada;
- SRS simplificado próprio do LearningFrame;
- progresso essencial para usuários autenticados;
- rotas reais com guards de autenticação;
- suite inicial E2E com banco dedicado.

Fora do MVP imediato:

- replicar o Anki por completo;
- cloze avançado;
- templates complexos do Anki;
- preservar histórico ou configurações originais de agendamento do Anki;
- `.colpkg`;
- favoritos, marketplace ou colaboração multiusuário;
- dashboard estatístico avançado;
- storage externo para mídia.

## Limites e Decisões Técnicas

- Arquivos `.apkg` são usados como interoperabilidade básica, mas o LearningFrame
  inicia uma agenda própria de revisão.
- O preview anônimo de APKG é temporário. Ao sair da rota de importação, arquivo,
  preview, índice de mídia e object URLs devem ser limpos, exceto no fluxo
  explícito de entrar para salvar.
- Mídias persistidas ficam como BLOB no MySQL. Isso é aceitável para o MVP
  acadêmico, mas não é a arquitetura recomendada para escala.
- Tokens de sessão ficam em `localStorage`, aceitável para demonstração local do
  MVP, mas exigiria hardening para produção sensível.
- Mídias privadas podem usar token em query string para renderização por
  `<img>`/`audio`, uma decisão pragmática do MVP que deve ser revisada em
  produção.

## Documentação de Projeto

Guias da Aplicação:

- [Princípios e padrões](docs/principios-e-padroes.md)
- [Guia de uso](docs/guia-de-uso.md)
- [Guia de integração com Anki/APKG](docs/guia-anki-apkg.md)
- [Guia de execução local](docs/guia-execucao-local.md)
- [Roadmap de profissionalização pós-MVP](docs/roadmap-profissionalizacao-pos-mvp.md)
- [Diário de bordo](docs/diario-de-bordo.md)

Contexto histórico e de desenvolvimento assistido:

- [README do contexto de IA](docs/ai_context/README.md)
- [Linha do tempo](docs/ai_context/linha-do-tempo.md)
- [Memória de decisões](docs/ai_context/memoria-de-decisoes.md)
- [Arquitetura e decisões históricas](docs/ai_context/arquitetura-e-decisoes/)
