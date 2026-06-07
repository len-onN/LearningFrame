# Plano da Branch: E2E de Fluxos de Risco do MVP

Branch de trabalho:
- `codex/e2e-risk-flows`

Base confirmada:
- `develop` atualizado ate `28ed6e3`, merge de `codex/audit-vitest-decision`;
- branch criada a partir de `develop` sem mudancas locais pendentes.

## 1. Objetivo

Expandir a suite Playwright apenas nos fluxos de maior risco para estabilizacao
do MVP, sem transformar a etapa em uma suite exaustiva e sem adicionar features.

O foco desta branch e provar que rotas reais, historico do navegador,
gerenciamento persistido e selecoes em lote continuam funcionando no ambiente
integrado com frontend, backend e banco E2E dedicado.

## 2. Contexto Obrigatorio Considerado

Documentos lidos para este planejamento:
- `README.md`;
- `docs/diario-de-bordo.md`;
- `docs/consideracoes-pre-finalizacao.md`;
- `docs/plano-momento-8-testes-e2e.md`;
- `docs/prompt-proximo-chat-estabilizacao-mvp.md`;
- `docs/prompt-proximo-chat-audit-vitest-mvp.md`;
- `docs/prompt-proximo-chat-e2e-risk-flows-mvp.md`;
- `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`.

Arquivos tecnicos inspecionados:
- `package.json`;
- `frontend/package.json`;
- `frontend/playwright.config.ts`;
- `scripts/e2e/run-e2e.mjs`;
- `docker-compose.e2e.yml`;
- `frontend/e2e/support/api.ts`;
- `frontend/e2e/support/auth.ts`;
- `frontend/e2e/support/fixtures.ts`;
- `frontend/e2e/specs/*.spec.ts`;
- componentes relevantes de Biblioteca e Gerenciamento.

Regras preservadas:
- nunca usar banco dev nos testes E2E;
- manter o Compose dedicado `learningframe-e2e`;
- manter banco `learningframe_e2e`, servico `db-e2e`, porta MySQL `3317`;
- manter teardown com `docker compose down -v`;
- manter reset deterministico por `POST /api/e2e/reset`;
- evitar sleeps arbitrarios;
- preferir `getByRole`, `getByLabel` e textos finais;
- usar `data-testid` apenas se role/name/label nao forem estaveis.

## 3. Estado Atual da Suite E2E

Configuracao:
- Playwright roda em `frontend/e2e/specs`;
- `fullyParallel: false`;
- `workers: 1`;
- Chromium apenas;
- `baseURL` padrao em `http://127.0.0.1:18080`;
- trace, screenshot e video sao retidos em falha.

Orquestracao:
- `npm run e2e` chama `scripts/e2e/run-e2e.mjs`;
- o script derruba ambiente anterior com `down -v`;
- sobe `db-e2e`, `backend-e2e` e `frontend-e2e` com `--build --wait`;
- aguarda backend e frontend por HTTP;
- roda `npm --prefix frontend run e2e:test`;
- derruba novamente com `down -v --remove-orphans` em `finally`.

Helpers existentes:
- `resetE2eData(request)` chama o endpoint interno de reset com
  `X-E2E-Token`;
- fixture `seed` reseta antes de cada teste;
- `loginViaUi`, `loginFromStart` e `logoutViaUi` cobrem autenticacao pela UI;
- o seed retorna usuarios, baralhos e cartas com ids reais para localizar
  rotas diretas.

Cobertura atual:
- smoke da Biblioteca publica sem login;
- estudo anonimo basico de baralho publico;
- guard de rota privada e redirect apos login;
- login/logout e limpeza de dados privados;
- criacao de baralho e navegacao para gerenciamento;
- criacao, edicao e exclusao individual de carta;
- estudo autenticado com progresso;
- importacao APKG pequena com preservacao ao login;
- limpeza do preview APKG ao sair da rota.

Lacunas de maior risco:
- refresh direto em rotas principais autenticadas e publicas;
- back/forward do navegador entre telas reais;
- edicao de metadata de baralho com persistencia apos reabrir;
- selecao/exclusao em lote de baralhos;
- selecao/exclusao em lote de cartas;
- confirmacao pratica de que seletores acessiveis cobrem os fluxos criticos.

## 4. Selecao Curta de Cenarios Para Implementar

Esta branch deve adicionar poucos testes de alto valor. A selecao recomendada e:

1. Refresh direto em rotas principais.
   - Abrir diretamente `/biblioteca/publicos`;
   - autenticar e abrir diretamente `/biblioteca/meus`;
   - abrir diretamente `/biblioteca/meus/:deckId/gerenciar`;
   - abrir diretamente `/estudo/baralho/:deckId`;
   - abrir diretamente `/importar`;
   - validar renderizacao final, URL correta e ausencia de redirect indevido.

2. Back/forward do navegador.
   - Autenticar;
   - navegar por Biblioteca publica, Meus baralhos, Gerenciamento e Criar;
   - usar `page.goBack()` e `page.goForward()`;
   - validar que as telas voltam sem tela branca, sem dados privados perdidos
     indevidamente e sem estado incoerente.

3. Edicao de metadata de baralho.
   - Abrir gerenciamento de `privateAnatomy`;
   - alterar titulo, descricao e visibilidade;
   - salvar aguardando resposta da API;
   - voltar para Meus baralhos;
   - reabrir gerenciamento por rota direta;
   - confirmar persistencia dos tres campos.

4. Selecao e exclusao em lote de cartas.
   - Abrir gerenciamento de `privateAnatomy`;
   - selecionar a pagina visivel de cartas;
   - excluir selecionadas confirmando dialog;
   - validar que as cartas somem, a selecao limpa e o estado ativo nao aponta
     para carta removida.

5. Selecao e exclusao em lote de baralhos.
   - Abrir Meus baralhos;
   - ativar modo selecao;
   - selecionar visiveis;
   - excluir selecionados confirmando dialog;
   - validar contador, limpeza do modo de selecao e ausencia dos baralhos
     removidos.

Acessibilidade basica sera aplicada como criterio dentro desses cenarios:
- localizar formularios por label;
- localizar botoes por role/name;
- localizar abas por role/name quando aplicavel;
- registrar debito ou fazer ajuste minimo de nome acessivel se algum controle
  critico exigir seletor fragil.

## 5. O Que Fica Fora Desta Branch

Fora de escopo:
- novos endpoints ou alteracoes de backend;
- nova infraestrutura E2E;
- fixtures APKG grandes;
- testes multi-browser;
- `axe` ou nova dependencia de acessibilidade;
- cobertura exaustiva de todas as combinacoes de busca/paginacao;
- polimento do modo de estudo;
- alteracoes visuais sem necessidade para estabilizar seletores acessiveis.

Se algum teste revelar bug real, corrigir apenas o necessario para o fluxo do
MVP e registrar a justificativa no fechamento da branch.

## 6. Plano de Arquivos

Alteracoes provaveis:
- adicionar `frontend/e2e/specs/routing-risk.spec.ts` para refresh direto e
  back/forward;
- adicionar `frontend/e2e/specs/deck-risk-flows.spec.ts` ou estender
  `frontend/e2e/specs/deck-management.spec.ts` para metadata e exclusoes em
  lote;
- se necessario, ampliar `frontend/e2e/support/api.ts` com helpers pequenos
  para login via API ou criacao de dados auxiliares, mantendo o reset por teste;
- se necessario, ajustar nomes acessiveis em componentes existentes, preferindo
  `aria-label` ou labels reais a `data-testid`.

Decisao inicial recomendada:
- criar specs novos para os fluxos de risco, preservando os specs atuais como
  smoke/base;
- reutilizar `seed`, `loginViaUi` e ids retornados pelo reset;
- evitar helpers novos ate haver repeticao clara.

## 7. Desenho Tecnico dos Testes

### 7.1 Refresh direto

Arquivo sugerido:
- `frontend/e2e/specs/routing-risk.spec.ts`

Fluxo:
1. usar fixture `seed`;
2. validar `/biblioteca/publicos` anonimo;
3. validar `/importar` anonimo;
4. autenticar via UI ou helper existente;
5. validar `/biblioteca/meus`;
6. validar `/biblioteca/meus/:deckId/gerenciar`;
7. validar `/estudo/baralho/:deckId`.

Cuidados:
- para rota privada, autenticar antes e preservar token no mesmo `page`;
- validar headings/campos finais, nao apenas URL;
- nao depender de timing manual.

### 7.2 Back/forward

Arquivo sugerido:
- `frontend/e2e/specs/routing-risk.spec.ts`

Fluxo:
1. autenticar;
2. ir para `/biblioteca/publicos`;
3. ir para `/biblioteca/meus`;
4. abrir gerenciamento do baralho privado;
5. ir para `/criar`;
6. chamar `page.goBack()` ate gerenciamento e Meus baralhos;
7. chamar `page.goForward()` ate gerenciamento ou Criar;
8. confirmar heading/campos de cada tela.

Cuidados:
- nao deixar formulario sujo antes de navegar;
- confirmar que gerenciamento recarrega metadata pela rota;
- validar que nao aparece estado vazio indevido nem redirect para login.

### 7.3 Metadata persistida

Arquivo sugerido:
- `frontend/e2e/specs/deck-risk-flows.spec.ts`

Fluxo:
1. autenticar;
2. abrir `/biblioteca/meus/:privateAnatomyId/gerenciar`;
3. alterar `Titulo`, `Descricao` e `Visibilidade`;
4. aguardar `PUT /api/decks/:id`;
5. validar feedback ou estado salvo;
6. voltar para `/biblioteca/meus`;
7. reabrir gerenciamento por URL direta;
8. validar valores persistidos.

Cuidados:
- usar valores unicos com prefixo `E2E`;
- validar descricao no campo, nao apenas no card;
- se tornar publico, ainda deve aparecer em Meus baralhos por ownership.

### 7.4 Bulk delete de cartas

Arquivo sugerido:
- `frontend/e2e/specs/deck-risk-flows.spec.ts`

Fluxo:
1. autenticar;
2. abrir gerenciamento de `privateAnatomy`;
3. clicar `Selecionar pagina`;
4. confirmar contador de selecionados, quando visivel;
5. aceitar dialog e clicar no botao de excluir selecionadas;
6. aguardar `POST /api/decks/:deckId/cards/bulk-delete`;
7. validar lista vazia ou ausencia das cartas seed;
8. validar que o botao de exclusao voltou a ficar desabilitado.

Cuidados:
- lidar com texto dinamico do botao `Excluir {{ count }}`;
- nao depender de ordem visual alem da pagina atual;
- verificar que carta ativa foi limpa.

### 7.5 Bulk delete de baralhos

Arquivo sugerido:
- `frontend/e2e/specs/deck-risk-flows.spec.ts`

Fluxo:
1. autenticar;
2. abrir `/biblioteca/meus`;
3. clicar `Selecionar`;
4. clicar `Selecionar visiveis`;
5. validar `2 selecionados` no seed atual;
6. aceitar dialog e clicar `Excluir`;
7. aguardar `POST /api/decks/bulk-delete`;
8. validar que `privateAnatomy` e `privateProgramming` sumiram;
9. validar que o modo selecao encerrou ou ficou limpo.

Cuidados:
- como cada teste reseta o banco, deletar os dois baralhos seed e aceitavel;
- nao tocar no baralho privado de outro usuario;
- validar por textos de usuario e ausencia dos titulos removidos.

## 8. Criterios de Aceite

A branch sera considerada concluida quando:
- os novos testes cobrirem os cinco cenarios selecionados;
- cada teste usar reset E2E via fixture;
- nenhum teste depender de banco dev ou dado manual;
- nao houver `waitForTimeout` ou sleeps arbitrarios;
- seletores forem acessiveis na maioria dos controles criticos;
- qualquer `data-testid` novo tiver justificativa clara;
- `npm test` passar;
- `npm run build` passar;
- `npm run e2e` passar com Compose dedicado e teardown `down -v`;
- `git diff --check` nao apontar problemas.

## 9. Ordem de Implementacao Recomendada

1. Criar `routing-risk.spec.ts`.
   - Cobrir refresh direto;
   - cobrir back/forward;
   - validar que a suite continua legivel.

2. Criar `deck-risk-flows.spec.ts`.
   - Cobrir metadata persistida;
   - cobrir bulk delete de cartas;
   - cobrir bulk delete de baralhos.

3. Rodar validacao focal.
   - `npm --prefix frontend run e2e:test` apenas se o ambiente E2E ja estiver
     ativo por `npm run e2e:up`;
   - caso contrario, preferir a validacao final completa com `npm run e2e`.

4. Rodar bateria final.
   - `npm test`;
   - `npm run build`;
   - `npm run e2e`;
   - `git diff --check`.

5. Fechar a branch.
   - registrar resultados;
   - commit em portugues com Conventional Commits, por exemplo:
     `test(e2e): cobre fluxos de risco do mvp`.

## 10. Riscos e Mitigacoes

Risco: suite E2E ficar lenta.
- Mitigacao: manter Chromium unico, `workers: 1`, poucos testes e reset por
  endpoint.

Risco: flakiness em navegacao.
- Mitigacao: esperar URL, heading, campo preenchido ou resposta de API; nao usar
  espera por tempo fixo.

Risco: seletores frageis.
- Mitigacao: preferir roles/labels; ajustar nomes acessiveis minimos se
  necessario.

Risco: bulk delete apagar dados necessarios para outro teste.
- Mitigacao: cada teste usa fixture `seed`, que reseta antes de executar.

Risco: refresh direto privado depender de token em memoria e nao em storage.
- Mitigacao: autenticar via UI antes, confirmar `localStorage` e usar a mesma
  pagina/contexto para navegar diretamente.

Risco: tornar metadata publica alterar a biblioteca publica e afetar assercoes.
- Mitigacao: o reset por teste isola o efeito; validar persistencia no proprio
  teste e nao depender desse dado em outro spec.

## 11. Decisao Final de Escopo

Implementar nesta branch somente:
- refresh direto;
- back/forward;
- metadata persistida;
- bulk delete de cartas;
- bulk delete de baralhos;
- acessibilidade basica como criterio de seletores.

Nao implementar outras melhorias ate que esses fluxos estejam verdes na bateria
final.

## 12. Implementacao Executada

Arquivos adicionados:
- `frontend/e2e/specs/routing-risk.spec.ts`;
- `frontend/e2e/specs/deck-risk-flows.spec.ts`.

Cenarios adicionados:
- refresh direto em `/biblioteca/publicos`, `/importar`, `/biblioteca/meus`,
  `/biblioteca/meus/:deckId/gerenciar` e `/estudo/baralho/:deckId`;
- navegacao back/forward entre Biblioteca publica, Meus baralhos, gerenciamento
  e Criar;
- edicao de titulo, descricao e visibilidade de baralho, com reabertura do
  gerenciamento para confirmar persistencia;
- selecao da pagina de cartas e exclusao em lote no gerenciamento;
- selecao de baralhos visiveis e exclusao em lote em Meus baralhos.

Decisoes da implementacao:
- specs novos foram criados para separar os fluxos de risco dos smokes
  existentes;
- os testes reutilizam `seed`, `loginViaUi` e ids retornados pelo reset E2E;
- nao foi necessario adicionar helper novo, endpoint, fixture ou `data-testid`;
- as acoes destrutivas aguardam a resposta da API em paralelo com o clique;
- os seletores priorizam role, label, texto visivel e os `data-deck-id` ja
  existentes nos specs anteriores.

## 13. Validacoes Executadas

Validacoes finais:
- `npm test`: passou, 33 testes frontend com Vitest 4.1.8;
- `npm run build`: passou com `vue-tsc` e `vite build`;
- `npm run e2e`: passou, 14 testes Playwright em Chromium;
- `git diff --check`: sem problemas.

Observacao:
- `npm test` e `npm run build` precisaram ser repetidos fora do sandbox porque
  a primeira execucao foi bloqueada por permissao ao carregar
  `frontend/vite.config.ts`;
- `npm run e2e` usou Compose dedicado `learningframe-e2e` e finalizou com
  `down -v`, removendo o volume `learningframe-e2e_mysql-e2e-data`.
