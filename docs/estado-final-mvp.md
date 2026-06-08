# Estado Final do MVP

Data: 2026-06-08
Branch de consolidacao: `codex/mvp-final-documentation`
Base: `develop` apos merge de `codex/qa-manual-final`

## 1. Leitura executiva

O LearningFrame chegou a um estado de MVP academico funcional, demonstravel e
validado.

O produto permite estudar com recordacao ativa, repeticao espacada e pratica
intercalada, preservando conta opcional para reduzir atrito inicial. Visitantes
podem estudar baralhos publicos e fazer preview de APKG. Usuarios autenticados
podem persistir baralhos, cartas, midias, revisoes e progresso essencial.

O MVP nao tenta replicar o Anki. Ele usa `.apkg` como interoperabilidade basica
e inicia uma agenda propria de revisao.

## 2. Racional pedagogico

O MVP foi delimitado em torno de tres praticas de estudo:

- recordacao ativa: o usuario tenta recuperar a resposta antes de ve-la;
- repeticao espacada: as revisoes futuras dependem do desempenho percebido;
- pratica intercalada: cartas elegiveis podem ser misturadas para reduzir o
  estudo em blocos rigidos.

Essas praticas orientam o produto, mas o MVP nao pretende medir eficacia
pedagogica em estudo clinico ou experimental. A contribuicao principal e
demonstrar uma aplicacao funcional e tecnicamente defensavel baseada nessas
ideias.

## 3. Funcionalidades incluidas

Incluido no MVP:
- biblioteca publica com estudo anonimo;
- cadastro e login;
- rotas reais com guards de autenticacao;
- criacao de baralhos proprios;
- edicao de titulo, descricao e visibilidade;
- exclusao individual e em lote de baralhos proprios;
- gerenciamento paginado de cartas;
- busca de cartas no gerenciamento;
- criacao, edicao e exclusao de cartas;
- exclusao em lote de cartas;
- upload de imagem e audio para cartas persistidas;
- renderizacao sanitizada de HTML de cartas;
- estudo por baralho;
- pratica intercalada;
- SRS simplificado proprio;
- progresso essencial para usuario autenticado;
- preview de APKG sem conta;
- preservacao intencional do APKG no fluxo de login para salvar;
- importacao APKG autenticada;
- persistencia de midias importadas;
- limpeza de estado temporario da importacao ao sair da rota;
- tema claro/escuro;
- sidebar retratil;
- responsivo basico;
- suite E2E com banco dedicado;
- QA manual final documentado.

## 4. Fora do MVP

Fora do MVP atual:
- replicar o Anki por completo;
- `.colpkg`;
- cloze avancado;
- templates complexos do Anki;
- historico e agenda original do Anki;
- add-ons do Anki;
- favoritos;
- marketplace;
- filtros avancados;
- busca full-text;
- rich text editor completo;
- dashboard estatistico avancado;
- perfil de usuario;
- recuperacao de senha;
- colaboracao multiusuario;
- storage externo para midia;
- text-to-speech;
- job assincrono de importacao com progresso real.

## 5. Arquitetura resumida

Stack:
- Java 21;
- Spring Boot 4.0.x;
- Maven;
- MySQL 8.4 LTS;
- Vue 3;
- Vite;
- TypeScript;
- Vue Router;
- Playwright;
- Docker Compose.

Backend:
- API REST organizada por autenticacao, decks, importacao, estudo e progresso;
- persistencia relacional com JPA;
- migrations com Flyway;
- MySQL como banco principal;
- midias persistidas como BLOB no MVP;
- endpoint interno de reset apenas no profile E2E.

Frontend:
- SPA Vue com rotas reais;
- paginas visuais controladas por props/eventos;
- route adapters conectam router e contexto;
- `App.vue` ainda atua como orquestrador temporario de estado e workflows;
- sem store global nesta fase;
- sanitizacao de HTML de cartas antes da renderizacao.

Infra local:
- Compose principal para desenvolvimento/demonstracao;
- Compose E2E separado para testes automatizados;
- portas separadas entre dev e E2E.

## 6. Validacoes finais

Resultado do QA manual final:
- 18 de 18 fluxos passaram;
- nenhum bug bloqueante encontrado;
- nenhum erro de console/pageerror nas rodadas assistidas;
- frontend respondeu `200` em `http://127.0.0.1:8080/`;
- API publica respondeu `200` em
  `http://127.0.0.1:8081/api/decks/public`.

Validacoes automatizadas registradas:
- `npm test`: 33 testes frontend passando;
- `npm run build`: passando;
- `npm run e2e`: 14 testes Playwright em Chromium passando;
- testes backend Maven via container: 27 testes passando;
- `git diff --check`: sem problemas.

O E2E usou:
- Compose dedicado `learningframe-e2e`;
- banco `learningframe_e2e`;
- servico `db-e2e`;
- porta MySQL host `3317`;
- teardown com `down -v`.

## 7. Riscos aceitos

| Item | Classificacao | Justificativa |
| --- | --- | --- |
| Token em `localStorage` | Risco aceito MVP | Adequado para demonstracao academica/local; producao exigiria hardening |
| Token em query string para midia privada | Risco aceito MVP | Solucao pragmatica para renderizar `img`/`audio`; revisar em producao |
| Midias como BLOB no MySQL | Risco aceito MVP | Simples e demonstravel; storage externo fica para escala |
| Importacao APKG parcial | Limite documentado | MVP nao preserva cloze avancado, templates, historico ou scheduler original |
| Editor HTML simples | Pos-MVP | Fluxo atual permite texto, HTML basico e midia |
| Sem job assincrono de APKG | Pos-MVP | Salvamento pode demorar em arquivos grandes; progresso real fica para evolucao |

## 8. Trabalhos futuros

Possiveis evolucoes:
- storage externo para midias;
- hardening de autenticacao e sessoes;
- recuperacao de senha;
- perfil de usuario;
- favoritos;
- filtros e ordenacao avancados;
- busca full-text em cartas;
- editor rico de cartas;
- dashboard de progresso;
- configurador de sessao de estudo;
- melhorias de APKG;
- job assincrono de importacao;
- testes multi-browser;
- CI completo.

## 9. Sugestao de marco

Marco sugerido:

```txt
v0.1.0-mvp
```

Descricao sugerida:

```txt
MVP academico do LearningFrame com biblioteca publica, conta opcional,
gerenciamento de baralhos/cartas, importacao APKG basica, estudo com SRS
simplificado, pratica intercalada, progresso essencial, suite E2E dedicada e QA
manual final aprovado.
```

## 10. Roteiro de demonstracao academica

Roteiro sugerido:
1. Subir o ambiente com Docker Compose.
2. Abrir a Biblioteca publica sem login.
3. Estudar um baralho publico anonimamente.
4. Fazer preview de um APKG em `Importar`.
5. Criar conta.
6. Salvar APKG ou baralho publico.
7. Abrir `Meus baralhos`.
8. Gerenciar um baralho e criar uma carta com midia.
9. Estudar como usuario autenticado.
10. Abrir `Progresso`.
11. Iniciar `Pratica intercalada`.
12. Explicar limites e trabalhos futuros.

Esse roteiro demonstra o valor para visitante, o valor para usuario autenticado
e as decisoes tecnicas do MVP.

## 11. Documentacao final

Documentos principais:
- [Principios e padroes do MVP](principios-e-padroes-mvp.md);
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integracao com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execucao local](guia-execucao-local-mvp.md);
- [Relatorio de QA manual final](relatorio-qa-manual-final-mvp.md);
- [Diario de bordo](diario-de-bordo.md).

Contexto historico e de desenvolvimento assistido:
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memoria de decisoes](ai_context/memoria-de-decisoes.md).
