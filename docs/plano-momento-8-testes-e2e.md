# Plano do Momento 8: Testes E2E com Banco Dedicado

Branch sugerida:
- `codex/e2e-dedicated-db`

Base e destino:
- base: `frontend-refactor`, apos concluir e validar o Momento 7;
- destino do PR: `frontend-refactor`.

Regra de processo:
- o Momento 8 deve entrar depois das rotas reais e do ciclo de vida por tela;
- a primeira entrega deve criar infraestrutura e uma suite curta, mas representativa;
- a suite deve subir e descer o ambiente e2e de forma automatizada;
- nenhum teste e2e deve usar o banco de desenvolvimento.

## 1. Objetivo

Adicionar uma camada de testes end-to-end para cobrir os fluxos que atravessam frontend, backend, banco de dados, autenticacao, roteamento e ciclo de vida de tela.

Objetivos principais:
- testar a aplicacao como usuario real no navegador;
- validar rotas diretas, guards de autenticacao, redirects e back/forward;
- validar fluxos completos de Biblioteca, criacao, gerenciamento, estudo, importacao e progresso;
- observar efeitos colaterais persistidos no banco;
- isolar completamente os dados de teste;
- permitir execucao local reproduzivel com um comando;
- permitir futura execucao em CI.

Nao objetivos da primeira fatia:
- substituir testes unitarios do frontend;
- substituir testes de controller/service do backend;
- cobrir todas as combinacoes visuais;
- testar APKGs grandes de 100 MB na suite padrao;
- depender de banco dev, usuario dev ou dados manuais.

## 2. Resposta Curta: E Possivel Subir e Descer So Para os Testes?

Sim.

A estrategia recomendada e criar um ambiente Compose exclusivo para e2e e um script orquestrador que faca:

1. subir `db-e2e`, `backend-e2e` e `frontend-e2e`;
2. esperar health checks;
3. resetar/semear o banco;
4. rodar Playwright;
5. coletar artefatos de falha;
6. derrubar tudo com `docker compose down -v`, removendo tambem o volume do MySQL e qualquer dado persistido.

Comando alvo:

```powershell
npm run e2e
```

Por baixo, esse comando pode chamar um script Node cross-platform:

```powershell
node scripts/e2e/run-e2e.mjs
```

O script deve usar `try/finally` para garantir que o ambiente seja derrubado mesmo quando um teste falhar.

Tambem e util prever:

```powershell
npm run e2e:up
npm run e2e:test
npm run e2e:down
```

Esses comandos ajudam durante depuracao. A suite padrao, porem, deve preferir `npm run e2e`, que sobe, testa e desce sozinha.

## 3. Ambiente E2E Proposto

Criar:

```text
docker-compose.e2e.yml
scripts/e2e/run-e2e.mjs
frontend/playwright.config.ts
frontend/e2e/
```

### 3.1 Servicos do Compose

Servicos recomendados:

```text
db-e2e
backend-e2e
frontend-e2e
```

`db-e2e`:
- imagem `mysql:8.4`;
- banco `learningframe_e2e`;
- usuario/senha exclusivos para teste;
- volume nomeado ou tmpfs;
- healthcheck obrigatorio;
- porta host opcional, por exemplo `3317:3306`, apenas para debug.

`backend-e2e`:
- build do backend real;
- `SPRING_PROFILES_ACTIVE=e2e`;
- `DB_HOST=db-e2e`;
- `DB_NAME=learningframe_e2e`;
- `JWT_SECRET` deterministico e com tamanho valido;
- `CORS_ALLOWED_ORIGINS=http://localhost:18080,http://127.0.0.1:18080`;
- porta host `18081:8081`;
- depende do healthcheck do `db-e2e`.

`frontend-e2e`:
- build do frontend real;
- porta host `18080:80`;
- build arg/env `VITE_API_BASE_URL=http://127.0.0.1:18081`;
- depende do backend.

Observacao importante:
- o frontend ja usa `import.meta.env.VITE_API_BASE_URL`;
- o `frontend/Dockerfile` deve receber `ARG VITE_API_BASE_URL` e expor esse valor durante `npm run build`;
- sem isso, o build Nginx continuara apontando para o fallback `http://127.0.0.1:8081`.

### 3.2 Isolamento de Dados

A suite nunca deve compartilhar dados com o ambiente dev.

Regras:
- banco separado;
- volume separado;
- credenciais separadas;
- portas separadas;
- `down -v` ao final da execucao padrao;
- nenhum teste depende de dado criado manualmente.

### 3.3 Reset Deterministico

Ha duas camadas de limpeza:

1. limpeza de suite:
   - `docker compose -f docker-compose.e2e.yml down -v`;
   - remove o volume do MySQL;
   - garante que a proxima suite comece limpa.

2. limpeza por teste:
   - endpoint interno de reset habilitado so no profile `e2e`;
   - exemplo: `POST /api/e2e/reset`;
   - exige header secreto, por exemplo `X-E2E-Token`;
   - limpa tabelas mutaveis e recria seed previsivel.

Recomendacao:
- implementar o endpoint interno no backend com `@Profile("e2e")`;
- proteger com token via env `E2E_RESET_TOKEN`;
- deixar impossivel ativar em dev/prod por acidente.

Motivo:
- Playwright consegue resetar o ambiente antes de cada teste sem conhecer detalhes de SQL;
- a estrutura do banco continua encapsulada pelo backend;
- os testes ficam mais legiveis.

### 3.4 Seed E2E

Seed minimo recomendado:

Usuario principal:
- nome: `Usuario E2E`;
- email: `e2e@learningframe.test`;
- senha: `Senha#1234`.

Usuario secundario:
- nome: `Outro Usuario E2E`;
- email: `outro-e2e@learningframe.test`;
- senha: `Senha#1234`.

Baralhos publicos:
- `E2E Publico Basico`, com pelo menos 3 cartas;
- `E2E Publico Midia`, opcional para fase posterior.

Baralhos privados do usuario principal:
- `E2E Privado Anatomia`, com 3 cartas;
- `E2E Privado Programacao`, com 2 cartas.

Cartas:
- usar textos unicos e pesquisaveis, como `E2E nervo femoral`, `E2E Vue Router`, `E2E repeticao espacada`;
- incluir tags previsiveis, como `e2e`, `anatomia`, `frontend`.

Estados de revisao:
- pelo menos uma carta vencida agora;
- pelo menos uma carta futura;
- pelo menos uma carta nova.

## 4. Ferramenta E2E

Ferramenta recomendada:
- Playwright.

Motivos:
- bom suporte a Chromium, Firefox e WebKit;
- auto-waiting reduz flakiness;
- screenshots, videos e traces em falha;
- boa integracao com testes de rota e rede;
- pode fazer chamadas API auxiliares pelo `request` fixture.

Navegadores da primeira fatia:
- Chromium como padrao.

Navegadores depois:
- Firefox e WebKit podem entrar quando a suite estiver estavel.

## 5. Scripts Propostos

No nivel raiz do repositorio, criar ou adaptar scripts para:

```json
{
  "scripts": {
    "e2e": "node scripts/e2e/run-e2e.mjs",
    "e2e:up": "docker compose -f docker-compose.e2e.yml up -d --build --wait",
    "e2e:test": "cd frontend && npx playwright test",
    "e2e:down": "docker compose -f docker-compose.e2e.yml down -v"
  }
}
```

Se o repositorio continuar sem `package.json` raiz, ha duas opcoes:
- criar um `package.json` raiz apenas para scripts de orquestracao;
- manter os scripts no `frontend/package.json`, usando caminhos `../`.

Recomendacao:
- criar `package.json` raiz pequeno para comandos transversais;
- manter testes unitarios do frontend no `frontend/package.json`.

## 6. Estrutura dos Testes

Estrutura inicial:

```text
frontend/e2e/
  support/
    api.ts
    auth.ts
    selectors.ts
  specs/
    public-library.spec.ts
    auth-routing.spec.ts
    deck-management.spec.ts
    study-session.spec.ts
    import-apkg.spec.ts
    progress.spec.ts
```

Convencoes:
- preferir seletores acessiveis: `getByRole`, `getByLabel`, `getByText`;
- adicionar `data-testid` apenas quando texto/role nao forem estaveis;
- cada teste deve chamar reset e2e antes de iniciar;
- cada arquivo deve focar um fluxo;
- evitar dependencias entre testes;
- preferir criar dados via API e validar experiencia via UI;
- quando o objetivo for validar persistencia, confirmar por UI ou por API de leitura.

## 7. Matriz de Casos de Uso

### 7.1 Smoke: Aplicacao Sobe e Biblioteca Publica Carrega

Objetivo:
- garantir que frontend, backend, CORS, banco e migrations estao conectados.

Pre-condicoes:
- ambiente e2e limpo;
- seed publico criado.

Passos:
1. abrir `http://127.0.0.1:18080/biblioteca/publicos`;
2. aguardar o titulo `Biblioteca`;
3. aguardar a aba `Baralhos publicos`;
4. localizar `E2E Publico Basico`.

Resultado esperado:
- pagina renderiza sem erro global;
- a lista publica aparece;
- nao ha redirect para login;
- botao `Estudar` esta disponivel no card publico.

Efeitos colaterais a observar:
- nenhuma sessao criada;
- `localStorage` nao deve conter token;
- nenhuma chamada privada deve retornar 401 visivel para o usuario.

### 7.2 Guard de Rota Privada e Redirect Para Login

Objetivo:
- validar que rotas privadas continuam protegidas depois das rotas reais.

Pre-condicoes:
- usuario nao autenticado;
- localStorage limpo.

Passos:
1. abrir `/biblioteca/meus`;
2. verificar que a URL mudou para `/entrar?redirect=/biblioteca/meus`;
3. preencher login com `e2e@learningframe.test` e `Senha#1234`;
4. enviar;
5. aguardar retorno para `/biblioteca/meus`.

Resultado esperado:
- redirect preserva destino original;
- login autentica;
- usuario volta para Meus baralhos;
- card `E2E Privado Anatomia` aparece.

Efeitos colaterais a observar:
- token salvo no `localStorage`;
- dados privados carregados somente apos login;
- feedback de sessao iniciada nao fica preso apos trocar de rota.

### 7.3 Login, Logout e Limpeza de Dados Privados

Objetivo:
- garantir que logout limpa sessao, listas privadas e contexto de gerenciamento.

Pre-condicoes:
- usuario autenticado.

Passos:
1. abrir `/biblioteca/meus`;
2. abrir gerenciamento de `E2E Privado Anatomia`;
3. acionar logout;
4. verificar URL `/biblioteca/publicos`;
5. tentar abrir `/biblioteca/meus` novamente.

Resultado esperado:
- gerenciamento fecha;
- usuario vira visitante;
- rota privada redireciona para login;
- dados privados nao ficam visiveis na tela.

Efeitos colaterais a observar:
- token removido do `localStorage`;
- `myDecks` nao reaparece apos logout;
- cache anonimo de estudo fica separado do estado autenticado.

### 7.4 Criacao de Baralho e Navegacao Para Gerenciamento

Objetivo:
- cobrir o fluxo macro de criacao depois do roteamento real.

Pre-condicoes:
- usuario autenticado;
- banco resetado.

Passos:
1. abrir `/criar`;
2. preencher titulo `E2E Baralho Criado Pela UI`;
3. preencher descricao;
4. manter visibilidade privada;
5. enviar;
6. aguardar navegacao para `/biblioteca/meus/:deckId/gerenciar`.

Resultado esperado:
- baralho e criado;
- URL de gerenciamento contem id numerico;
- titulo do topo passa a refletir o baralho;
- formulario de metadata aparece preenchido;
- lista de cartas aparece vazia ou com estado vazio coerente.

Efeitos colaterais a observar:
- baralho aparece em `/biblioteca/meus` apos voltar;
- stats podem ser recarregadas sem erro;
- nao ha carregamento integral de cartas desnecessario.

### 7.5 Edicao de Metadata do Baralho

Objetivo:
- validar update de titulo, descricao e visibilidade.

Pre-condicoes:
- usuario autenticado;
- baralho privado existente.

Passos:
1. abrir `/biblioteca/meus/:deckId/gerenciar`;
2. alterar titulo para `E2E Anatomia Editado`;
3. alterar descricao;
4. trocar visibilidade para publico;
5. salvar;
6. voltar para `/biblioteca/meus`;
7. reabrir o gerenciamento.

Resultado esperado:
- mensagem de sucesso aparece;
- dados permanecem apos recarregar/reabrir;
- visibilidade foi persistida;
- card na lista reflete titulo novo.

Efeitos colaterais a observar:
- lista paginada de cartas nao e resetada indevidamente alem do necessario;
- selecao de cartas, se existir, nao fica incoerente apos salvar metadata;
- titulo do topbar atualiza.

### 7.6 Criacao de Carta

Objetivo:
- validar overlay de carta, preview seguro e persistencia.

Pre-condicoes:
- usuario autenticado;
- baralho gerenciavel aberto.

Passos:
1. clicar em criar carta;
2. preencher frente `E2E Frente nova carta`;
3. preencher verso `E2E Verso nova carta`;
4. preencher tags `e2e, nova`;
5. conferir preview da frente e do verso;
6. salvar;
7. localizar a carta na lista.

Resultado esperado:
- overlay abre;
- preview renderiza o HTML sanitizado;
- carta e salva;
- overlay fecha;
- carta aparece selecionada ou visivel;
- contagem de cartas do baralho atualiza.

Efeitos colaterais a observar:
- formulario do overlay limpa apos salvar;
- selecao multipla de cartas nao fica marcada por acidente;
- lista continua paginada.

### 7.7 Edicao de Carta

Objetivo:
- validar update de frente, verso e tags.

Pre-condicoes:
- usuario autenticado;
- carta existente.

Passos:
1. abrir gerenciamento;
2. selecionar carta `E2E nervo femoral`;
3. clicar editar;
4. alterar frente/verso;
5. alterar tags;
6. salvar;
7. reabrir a carta.

Resultado esperado:
- overlay abre em modo edicao;
- campos iniciam com valores existentes;
- alteracoes persistem;
- preview do gerenciamento exibe o novo conteudo.

Efeitos colaterais a observar:
- dirty state nao impede fechamento apos salvar;
- carta editada continua selecionada;
- busca de cartas reflete texto novo.

### 7.8 Confirmacao de Descarte no Overlay de Carta

Objetivo:
- proteger usuario contra perda acidental.

Pre-condicoes:
- overlay de carta aberto.

Passos:
1. editar campo de frente;
2. clicar fechar;
3. cancelar confirmacao;
4. confirmar que overlay permanece aberto;
5. clicar fechar novamente;
6. aceitar confirmacao.

Resultado esperado:
- confirmacao aparece apenas quando ha dirty state;
- cancelar preserva valores;
- aceitar fecha e descarta.

Efeitos colaterais a observar:
- rota atual nao muda;
- nenhum card novo e criado;
- nenhuma notificacao de sucesso aparece.

### 7.9 Busca e Paginacao de Cartas no Gerenciamento

Objetivo:
- garantir que gerenciamento nao carrega tudo e que busca atua sobre endpoint paginado.

Pre-condicoes:
- baralho com mais de uma pagina de cartas ou seed especifico para paginacao.

Passos:
1. abrir gerenciamento;
2. observar contagem inicial;
3. clicar `Carregar mais cartas`;
4. buscar termo `Vue Router`;
5. limpar busca.

Resultado esperado:
- novas cartas sao mescladas sem duplicar;
- busca mostra apenas cartas relevantes;
- limpar busca volta ao conjunto inicial;
- carta selecionada e ajustada quando sai dos resultados.

Efeitos colaterais a observar:
- selecao multipla de cartas e podada para itens carregados;
- resposta antiga de busca nao sobrescreve busca mais recente;
- loading discreto nao trava a tela.

### 7.10 Exclusao Individual e Multipla de Cartas

Objetivo:
- validar exclusoes e consistencia de contadores.

Pre-condicoes:
- baralho com pelo menos 3 cartas.

Passos:
1. excluir uma carta individual;
2. confirmar dialog;
3. selecionar duas cartas;
4. excluir selecionadas;
5. voltar para lista de baralhos.

Resultado esperado:
- carta individual some;
- cartas selecionadas somem;
- contagem do baralho reduz;
- mensagem correta aparece.

Efeitos colaterais a observar:
- selecao e limpa apos exclusao em lote;
- carta ativa nao aponta para id inexistente;
- stats nao falham ao recarregar.

### 7.11 Selecao e Exclusao Multipla de Baralhos

Objetivo:
- validar toolbar contextual de Meus baralhos.

Pre-condicoes:
- usuario com pelo menos 3 baralhos privados.

Passos:
1. abrir `/biblioteca/meus`;
2. ativar modo selecao;
3. selecionar visiveis;
4. desmarcar um item;
5. excluir selecionados;
6. confirmar.

Resultado esperado:
- toolbar mostra contagem correta;
- cards selecionados ficam visualmente marcados;
- itens excluidos somem;
- modo selecao encerra.

Efeitos colaterais a observar:
- baralhos publicos nao entram na selecao;
- botoes internos dos cards nao disparam durante modo selecao;
- rota permanece em `/biblioteca/meus`.

### 7.12 Salvar Baralho Publico Para Mim

Objetivo:
- validar copia privada de baralho publico.

Pre-condicoes:
- usuario autenticado;
- baralho publico existente.

Passos:
1. abrir `/biblioteca/publicos`;
2. clicar `Salvar para mim` em `E2E Publico Basico`;
3. aguardar navegacao para `/biblioteca/meus`;
4. localizar copia privada destacada.

Resultado esperado:
- copia privada e criada;
- usuario vai para Meus baralhos;
- destaque temporario aparece;
- copia possui cartas.

Efeitos colaterais a observar:
- baralho publico original nao e alterado;
- copia pertence ao usuario;
- mensagem de sucesso nao some antes da navegacao concluir.

### 7.13 Estudo Publico Anonimo

Objetivo:
- validar estudo sem login e cache anonimo.

Pre-condicoes:
- usuario deslogado;
- baralho publico com cartas.

Passos:
1. abrir `/biblioteca/publicos`;
2. iniciar estudo de `E2E Publico Basico`;
3. verificar URL `/estudo/baralho/:deckId`;
4. revelar resposta;
5. avaliar como `Bom`;
6. voltar para Biblioteca.

Resultado esperado:
- estudo abre sem login;
- carta aparece;
- avaliacao local atualiza fila;
- sair de estudo limpa a fila invisivel.

Efeitos colaterais a observar:
- revisao anonima fica em `localStorage`, nao no banco;
- `studyQueue` nao permanece visivel ao voltar em `/estudo`;
- cache anonimo respeita limite de 6 baralhos em cenarios ampliados.

### 7.14 Estudo Autenticado e Estatisticas

Objetivo:
- validar revisao persistida e atualizacao de progresso.

Pre-condicoes:
- usuario autenticado;
- carta vencida agora.

Passos:
1. abrir `/estudo/intercalado`;
2. revelar resposta;
3. avaliar como `Bom`;
4. abrir `/progresso`;
5. observar `Revisados hoje`.

Resultado esperado:
- review e enviado ao backend;
- fila avanca;
- progresso reflete revisao;
- proxima revisao muda conforme SRS.

Efeitos colaterais a observar:
- `review_states` e `review_logs` sao atualizados;
- stats sao recarregadas apos review;
- sair da rota de estudo limpa fila em memoria.

### 7.15 Importacao APKG: Preview Anonimo e Login Para Salvar

Objetivo:
- validar preservacao intencional do preview ao autenticar.

Pre-condicoes:
- usuario deslogado;
- arquivo APKG pequeno de fixture.

Passos:
1. abrir `/importar`;
2. selecionar APKG fixture pequeno;
3. aguardar preview;
4. clicar salvar;
5. confirmar redirect para login;
6. autenticar;
7. voltar para `/importar`;
8. salvar APKG.

Resultado esperado:
- preview aparece antes do login;
- estado do APKG e preservado durante `/importar -> /entrar -> /importar`;
- importacao persiste apos login;
- usuario navega para `/biblioteca/meus`;
- baralho importado fica destacado.

Efeitos colaterais a observar:
- object URLs nao sao revogados durante o fluxo preservado;
- depois de salvar, preview e arquivo sao limpos;
- midias pequenas sao persistidas quando fixture tiver midia.

### 7.16 Importacao APKG: Sair da Tela Limpa Estado

Objetivo:
- validar politica de memoria do Momento 7.

Pre-condicoes:
- usuario anonimo ou autenticado;
- APKG fixture selecionado.

Passos:
1. abrir `/importar`;
2. selecionar APKG;
3. aguardar preview;
4. navegar para `/biblioteca/publicos`;
5. voltar para `/importar`.

Resultado esperado:
- preview anterior nao aparece;
- input volta ao estado inicial;
- arquivo precisa ser selecionado novamente.

Efeitos colaterais a observar:
- object URLs revogados;
- `selectedFile`, `importPreview`, `previewMediaIndex` limpos;
- nenhuma notificacao antiga fica presa.

### 7.17 Importacao APKG: Resposta Antiga Nao Sobrescreve Arquivo Novo

Objetivo:
- cobrir controle de sequencia contra race condition.

Pre-condicoes:
- dois APKG fixtures pequenos com titulos diferentes;
- opcionalmente interceptar/delay na primeira resposta.

Passos:
1. selecionar APKG A;
2. antes da resposta terminar, selecionar APKG B;
3. aguardar carregamento final.

Resultado esperado:
- preview final mostra APKG B;
- titulo do APKG A nao sobrescreve o estado;
- midias do APKG A nao ficam renderizadas.

Efeitos colaterais a observar:
- object URLs criados para resposta antiga sao revogados;
- `importTitle` corresponde ao arquivo mais recente.

### 7.18 Back/Forward do Navegador

Objetivo:
- validar que rotas reais representam lugares da aplicacao.

Pre-condicoes:
- usuario autenticado.

Passos:
1. abrir `/biblioteca/publicos`;
2. ir para `/biblioteca/meus`;
3. abrir gerenciamento de baralho;
4. ir para `/criar`;
5. usar `page.goBack()` duas vezes;
6. usar `page.goForward()`.

Resultado esperado:
- telas principais acompanham historico;
- gerenciamento recarrega por rota direta quando necessario;
- guard nao quebra historico.

Efeitos colaterais a observar:
- selecoes antigas nao voltam indevidamente;
- formulario sujo deve confirmar antes de sair quando aplicavel;
- nao ha tela branca entre rotas.

### 7.19 Refresh Direto em Rotas Principais

Objetivo:
- validar fallback SPA e carregamento direto.

Pre-condicoes:
- frontend servido por Nginx e2e;
- usuario autenticado quando rota exigir.

Passos:
1. abrir diretamente `/biblioteca/publicos`;
2. abrir diretamente `/entrar`;
3. autenticar e abrir diretamente `/biblioteca/meus`;
4. abrir diretamente `/biblioteca/meus/:deckId/gerenciar`;
5. abrir diretamente `/estudo/baralho/:deckId`.

Resultado esperado:
- Nginx entrega SPA;
- router resolve rota;
- dados sao carregados sob demanda;
- gerenciamento nao carrega todas as cartas.

Efeitos colaterais a observar:
- nenhuma rota cai no redirect generico por engano;
- metadata leve e usada no gerenciamento;
- fila de estudo e criada apenas na rota de estudo.

### 7.20 Acessibilidade Basica dos Fluxos Criticos

Objetivo:
- garantir que os fluxos e2e usem roles/labels reais e que a UI continue operavel por seletores acessiveis.

Pre-condicoes:
- ambiente e2e ativo.

Passos:
1. localizar botoes por role/name;
2. localizar inputs por label/placeholder estavel;
3. navegar nos principais comandos por teclado quando barato.

Resultado esperado:
- elementos principais tem nomes acessiveis;
- botoes criticos sao encontraveis por role;
- dialogs nativos nao impedem teste de confirmacao.

Efeitos colaterais a observar:
- quando um elemento so puder ser localizado por CSS fragil, registrar debito para adicionar label ou `data-testid`.

## 8. Ordem de Implementacao Recomendada

### Commit 1 - Planejamento

Mensagem sugerida:
- `docs(e2e): planeja testes com banco dedicado`

Conteudo:
- criar este documento;
- atualizar arquitetura de roteamento para incluir Momento 8;
- atualizar diario.

### Commit 2 - Infraestrutura E2E

Mensagem sugerida:
- `test(e2e): adiciona ambiente dedicado com compose`

Conteudo:
- `docker-compose.e2e.yml`;
- profile backend `e2e`;
- ajuste do `frontend/Dockerfile` para `VITE_API_BASE_URL`;
- scripts de up/down/test;
- Playwright instalado e configurado.

### Commit 3 - Reset e Seed Deterministicos

Mensagem sugerida:
- `test(e2e): adiciona reset deterministico de dados`

Conteudo:
- endpoint interno `POST /api/e2e/reset`;
- seed e2e minimo;
- helper Playwright para reset antes de cada teste;
- protecao por profile e token.

### Commit 4 - Smoke e Autenticacao

Mensagem sugerida:
- `test(e2e): cobre smoke e rotas autenticadas`

Conteudo:
- smoke de biblioteca publica;
- guard de rota privada;
- login, redirect e logout.

### Commit 5 - Biblioteca e Gerenciamento

Mensagem sugerida:
- `test(e2e): cobre gerenciamento de baralhos e cartas`

Conteudo:
- criar baralho;
- editar metadata;
- criar/editar/excluir carta;
- selecao e exclusao em lote.

### Commit 6 - Estudo, Importacao e Progresso

Mensagem sugerida:
- `test(e2e): cobre estudo importacao e progresso`

Conteudo:
- estudo anonimo;
- estudo autenticado;
- progresso apos review;
- importacao APKG pequena;
- preservacao de APKG durante login;
- limpeza ao sair da importacao.

## 9. Estrategia de Execucao Local e CI

Execucao local padrao:

```powershell
npm run e2e
```

Execucao local para debug:

```powershell
npm run e2e:up
cd frontend
npx playwright test --headed --debug
cd ..
npm run e2e:down
```

Execucao em CI:
- instalar Docker;
- instalar Node;
- instalar browsers do Playwright;
- rodar `npm ci` no frontend;
- rodar `npm run e2e`;
- publicar traces, screenshots e videos em falha.

Politica de artefatos:
- trace apenas em retry ou falha;
- screenshot em falha;
- video em falha;
- relatorio HTML opcional.

## 10. Criterios de Aceite do Momento 8

Infraestrutura:
- ambiente e2e sobe com um comando;
- ambiente e2e desce com `down -v`;
- banco e2e nao compartilha volume, porta nem credencial com dev;
- frontend e2e aponta para backend e2e;
- backend e2e usa profile e banco dedicados;
- reset e seed sao deterministicos.

Suite inicial:
- smoke de biblioteca publica passa;
- guard de rota privada e redirect passam;
- login/logout passam;
- criar baralho e navegar para gerenciamento passa;
- criar/editar/excluir carta passa;
- estudo anonimo basico passa;
- estudo autenticado atualiza progresso;
- importacao APKG pequena cobre preview, login para salvar e limpeza ao sair.

Qualidade:
- testes nao dependem de ordem;
- testes nao usam sleeps arbitrarios;
- seletores sao acessiveis ou explicitamente estabilizados;
- falhas geram artefatos suficientes para depuracao;
- `npm test` e `npm run build` continuam passando.

## 11. Riscos e Mitigacoes

Risco: suite lenta demais.
- Mitigacao: manter primeira suite pequena, Chromium apenas, reset por endpoint e fixtures pequenas.

Risco: flakiness por loading assincrono.
- Mitigacao: usar Playwright auto-waiting, esperar por roles/textos finais e evitar `waitForTimeout`.

Risco: reset e2e exposto fora de teste.
- Mitigacao: `@Profile("e2e")`, token obrigatorio e nenhuma configuracao e2e em compose dev/prod.

Risco: APKG deixar suite pesada.
- Mitigacao: fixture APKG minima, com poucas cartas e midia pequena; APKG grande fica para validacao manual/performance.

Risco: e2e testar detalhes visuais frageis.
- Mitigacao: focar comportamento, URLs, textos de usuario, efeitos persistidos e estados observaveis.

Risco: Compose e2e conflitar com Compose dev.
- Mitigacao: nomes de servico, portas e volumes separados; preferir projeto Compose com nome proprio, como `learningframe-e2e`.

## 12. Recomendacao Final

Adicionar E2E logo apos o Momento 7 e uma decisao bem alinhada com o estado do projeto.

O Momento 7 tornou as URLs e o ciclo de vida mais importantes; os testes unitarios validam partes, mas nao garantem que navegador, router, backend, banco e feedbacks se comportem juntos. O Momento 8 deve ser a rede de seguranca da estabilizacao final antes de promover `frontend-refactor` para `develop`.
