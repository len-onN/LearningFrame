# Estado Final do MVP

Data: 2026-06-08
Branch de consolidacao: `codex/mvp-final-documentation`
Base: `develop` após merge de `codex/qa-manual-final`

## 1. Leitura executiva

O LearningFrame chegou a um estado de MVP acadêmico funcional, demonstravel e
validado.

O produto permite estudar com recordação ativa, repetição espaçada e prática
intercalada, preservando conta opcional para reduzir atrito inicial. Visitantes
podem estudar baralhos públicos e fazer preview de APKG. Usuários autenticados
podem persistir baralhos, cartas, mídias, revisões e progresso essencial.

Como narrativa de produto, o MVP pode representar uma aplicação gratuita de
suporte ao aprendizado ofertada por uma instituição de ensino. A integração com
dados institucionais reais fica fora do MVP e pertence ao roadmap pós-MVP.

O MVP não tenta replicar o Anki. Ele usa `.apkg` como interoperabilidade básica
e inicia uma agenda própria de revisão.

## 2. Racional pedagógico

O MVP foi delimitado em torno de três práticas de estudo:

- recordação ativa: o usuário tenta recuperar a resposta antes de ve-la;
- repetição espaçada: as revisões futuras dependem do desempenho percebido;
- prática intercalada: cartas elegíveis podem ser misturadas para reduzir o
  estudo em blocos rigidos.

Essas práticas orientam o produto, mas o MVP não pretende medir eficacia
pedagógica em estudo clinico ou experimental. A contribuicao principal e
demonstrar uma aplicação funcional e tecnicamente defensável baseada nessas
ideias.

## 3. Funcionalidades incluídas

Incluído no MVP:
- biblioteca pública com estudo anônimo;
- cadastro e login;
- rotas reais com guards de autenticação;
- criação de baralhos próprios;
- edição de título, descrição e visibilidade;
- exclusão individual e em lote de baralhos próprios;
- gerenciamento paginado de cartas;
- busca de cartas no gerenciamento;
- criação, edição e exclusão de cartas;
- exclusão em lote de cartas;
- upload de imagem e audio para cartas persistidas;
- renderização sanitizada de HTML de cartas;
- estudo por baralho;
- prática intercalada;
- SRS simplificado próprio;
- progresso essencial para usuário autenticado;
- preview de APKG sem conta;
- preservacao intencional do APKG no fluxo de login para salvar;
- importação APKG autenticada;
- persistência de mídias importadas;
- limpeza de estado temporário da importação ao sair da rota;
- tema claro/escuro;
- sidebar retratil;
- responsivo básico;
- suite E2E com banco dedicado;
- QA manual final documentado.

## 4. Fora do MVP

Fora do MVP atual:
- replicar o Anki por completo;
- `.colpkg`;
- cloze avançado;
- templates complexos do Anki;
- histórico e agenda original do Anki;
- add-ons do Anki;
- favoritos;
- marketplace;
- filtros avançados;
- busca full-text;
- rich text editor completo;
- dashboard estatístico avançado;
- perfil de usuário;
- recuperacao de senha;
- colaboração multiusuário;
- storage externo para mídia;
- text-to-speech;
- job assíncrono de importação com progresso real.

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
- API REST organizada por autenticação, decks, importação, estudo e progresso;
- persistência relacional com JPA;
- migrations com Flyway;
- MySQL como banco principal;
- mídias persistidas como BLOB no MVP;
- endpoint interno de reset apenas no profile E2E.

Frontend:
- SPA Vue com rotas reais;
- páginas visuais controladas por props/eventos;
- route adapters conectam router e contexto;
- `App.vue` ainda atua como orquestrador temporário de estado e workflows;
- sem store global nesta fase;
- sanitização de HTML de cartas antes da renderização.

Infra local:
- Compose principal para desenvolvimento/demonstração;
- Compose E2E separado para testes automatizados;
- portas separadas entre dev e E2E.

## 6. Validações finais

Resultado do QA manual final:
- 18 de 18 fluxos passaram;
- nenhum bug bloqueante encontrado;
- nenhum erro de console/pageerror nas rodadas assistidas;
- frontend respondeu `200` em `http://127.0.0.1:8080/`;
- API pública respondeu `200` em
  `http://127.0.0.1:8081/api/decks/public`.

Validações automatizadas registradas:
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

| Item | Classificação | Justificativa |
| --- | --- | --- |
| Token em `localStorage` | Risco aceito MVP | Adequado para demonstração acadêmica/local; produção exigiria hardening |
| Token em query string para mídia privada | Risco aceito MVP | Solução pragmatica para renderizar `img`/`audio`; revisar em produção |
| Mídias como BLOB no MySQL | Risco aceito MVP | Simples e demonstravel; storage externo fica para escala |
| Importação APKG parcial | Limite documentado | MVP não preserva cloze avançado, templates, histórico ou scheduler original |
| Editor HTML simples | Pós-MVP | Fluxo atual permite texto, HTML básico e mídia |
| Sem job assíncrono de APKG | Pós-MVP | Salvamento pode demorar em arquivos grandes; progresso real fica para evolução |

## 8. Trabalhos futuros

Possíveis evoluções:
- seleção de baralhos para prática intercalada;
- intercalamento mais sofisticado por tags, tópicos ou disciplinas;
- storage externo para mídias;
- hardening de autenticação e sessões;
- recuperacao de senha;
- perfil de usuário;
- favoritos;
- filtros e ordenação avançados;
- busca full-text em cartas;
- editor rico de cartas;
- dashboard de progresso;
- configurador de sessão de estudo;
- melhorias de APKG;
- job assíncrono de importação;
- testes multi-browser;
- CI completo.

## 9. Sugestao de marco

Marco sugerido:

```txt
v0.1.0-mvp
```

Descrição sugerida:

```txt
MVP academico do LearningFrame com biblioteca publica, conta opcional,
gerenciamento de baralhos/cartas, importacao APKG basica, estudo com SRS
simplificado, pratica intercalada, progresso essencial, suite E2E dedicada e QA
manual final aprovado.
```

## 10. Roteiro de demonstração acadêmica

Roteiro sugerido:
1. Subir o ambiente com Docker Compose.
2. Abrir a Biblioteca pública sem login.
3. Estudar um baralho público anonimamente.
4. Fazer preview de um APKG em `Importar`.
5. Criar conta.
6. Salvar APKG ou baralho público.
7. Abrir `Meus baralhos`.
8. Gerenciar um baralho e criar uma carta com mídia.
9. Estudar como usuário autenticado.
10. Abrir `Progresso`.
11. Iniciar `Prática intercalada`.
12. Explicar limites e trabalhos futuros.

Esse roteiro demonstra o valor para visitante, o valor para usuário autenticado
e as decisões técnicas do MVP.

## 11. Documentação final

Documentos principais:
- [Princípios e padrões do MVP](principios-e-padroes-mvp.md);
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integração com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execução local](guia-execucao-local-mvp.md);
- [Relatório de QA manual final](relatorio-qa-manual-final-mvp.md);
- [Roadmap de profissionalização pós-MVP](roadmap-profissionalizacao-pos-mvp.md);
- [Diário de bordo](diario-de-bordo.md).

Contexto histórico e de desenvolvimento assistido:
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memória de decisões](ai_context/memoria-de-decisoes.md).
