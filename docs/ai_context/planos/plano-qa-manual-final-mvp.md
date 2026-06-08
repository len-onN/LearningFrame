# Plano da Branch: QA Manual Final do MVP

Data de abertura: 2026-06-08
Branch de trabalho: `codex/qa-manual-final`
Status: planejamento inicial

## 1. Confirmacoes iniciais

Base confirmada:
- branch atual: `codex/qa-manual-final`;
- worktree: sem mudancas locais pendentes no inicio;
- `HEAD`, `develop` e `origin/develop`: `147af27f980c04bb9aba7adb17e774f95101c72c`;
- commit atual: merge de `codex/study-session-polish` em `develop`;
- `codex/study-session-polish`: ancestral de `develop`;
- `git fetch --prune origin`: executado antes da confirmacao final dos refs.

Observacao operacional:
- os comandos Git no sandbox exigiram `git -c safe.directory=C:/Users/lenon/OneDrive/Documentos/LearningFrame`;
- o `fetch` precisou de permissao elevada por bloqueio de escrita em `.git/FETCH_HEAD`.

Documentos obrigatorios considerados:
- `README.md`;
- `docs/diario-de-bordo.md`;
- `docs/consideracoes-pre-finalizacao.md`;
- `docs/arquitetura-ux-baralhos.md`;
- `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`;
- `docs/plano-momento-8-testes-e2e.md`;
- `docs/plano-e2e-risk-flows-mvp.md`;
- `docs/plano-study-session-polish-mvp.md`;
- `docs/prompt-proximo-chat-qa-manual-final-mvp.md`.

Arquivos tecnicos inspecionados para este plano:
- `package.json`;
- `docker-compose.yml`;
- `docker-compose.e2e.yml`;
- `frontend/package.json`;
- `frontend/src/App.vue`;
- `frontend/src/routes/routeContext.ts`;
- `frontend/src/pages/StudyPage.vue`;
- `frontend/src/pages/LibraryPage.vue`;
- `frontend/src/pages/ImportPage.vue`;
- `frontend/src/services/api.ts`;
- `frontend/e2e/specs/*.spec.ts`;
- `backend/pom.xml`;
- `backend/src/main/resources/db/migration/*.sql`.

## 2. Estado atual do MVP

Resumo em 8 pontos:
- o LearningFrame ja cobre a narrativa academica central: recordacao ativa, repeticao espacada e pratica intercalada;
- visitantes conseguem abrir a biblioteca publica, estudar baralhos publicos e fazer preview de APKG sem conta;
- usuarios autenticados conseguem persistir baralhos, cartas, midias, revisoes e progresso essencial;
- Biblioteca, Meus baralhos, gerenciamento de cartas, exclusoes em lote e upload de midia estao implementados;
- importacao APKG basica funciona com preview, preservacao intencional no fluxo de login para salvar e limpeza ao sair;
- modo de estudo foi polido com progresso de sessao, feedback local, resumo final, controle de fonte e ajuste de midia;
- rotas reais, refresh direto e back/forward ja tem cobertura E2E nos fluxos de maior risco;
- os limites do MVP permanecem conscientemente aceitos: APKG nao replica Anki completo, midias ficam como BLOB, token fica em `localStorage` e seguranca de producao fica fora do escopo academico atual.

## 3. Objetivo da branch

Preparar, executar e registrar QA manual integrado em container para fechar o MVP com evidencias objetivas.

Objetivos:
- criar checklist versionado de QA manual final;
- executar os fluxos principais em `docker compose` local;
- registrar comandos, ambiente, evidencias, bugs, decisoes e riscos aceitos;
- atualizar README e documentos finais somente se estiverem defasados em relacao ao produto real;
- corrigir apenas bugs bloqueantes ou desalinhamentos pequenos encontrados no QA.

Nao objetivos:
- adicionar feature nova;
- alterar scheduler/SRS;
- criar store global;
- mudar persistencia de midia;
- expandir APKG para cloze avancado, templates complexos, historico do Anki ou `.colpkg`;
- adicionar filtros, favoritos, marketplace, dashboard avancado, perfil, recuperacao de senha, rich text editor completo, storage externo ou busca full-text;
- reabrir text-to-speech no roadmap atual.

## 4. Ordem de commits planejada

1. `docs(qa): planeja qa manual final`
   - criar este plano/checklist;
   - registrar abertura no diario.

2. `docs(qa): registra execucao manual final`
   - preencher resultados do checklist;
   - registrar evidencias, comandos e problemas encontrados.

3. `docs(mvp): atualiza documentacao final`
   - ajustar README e docs principais apenas com divergencias reais encontradas no QA.

4. `fix(...): corrige bug bloqueante do qa`
   - opcional;
   - usar apenas se o QA encontrar bug bloqueante ou desalinhamento pequeno e objetivo;
   - commit funcional separado do registro documental.

5. `docs(qa): registra fechamento do qa final`
   - consolidar riscos aceitos;
   - listar pos-MVP;
   - registrar validacoes finais.

## 5. Ambiente alvo do QA manual

Ambiente principal:
- comando: `docker compose up -d --build`;
- frontend: `http://localhost:8080`;
- backend: `http://localhost:8081`;
- MySQL dev local: `localhost:3307`;
- banco: `learningframe`.

Checagens iniciais planejadas:
- frontend responde `200` em `http://127.0.0.1:8080/`;
- backend responde `200` em `http://127.0.0.1:8081/api/decks/public`;
- biblioteca publica renderiza no navegador sem login;
- console do navegador nao mostra erro bloqueante nos fluxos principais.

Ambiente E2E automatizado:
- comando: `npm run e2e`;
- Compose dedicado: `learningframe-e2e`;
- frontend: `http://localhost:18080`;
- backend: `http://localhost:18081`;
- MySQL: `localhost:3317`;
- banco: `learningframe_e2e`;
- servico de banco: `db-e2e`;
- teardown obrigatorio: `down -v`.

Regra critica:
- a suite Playwright nunca deve usar o banco dev.

## 6. Dados e evidencias

Dados manuais recomendados:
- usuario QA: criar uma conta nova com email unico, por exemplo `qa-final-20260608@learningframe.test`;
- senha sugerida: `Senha#1234`;
- baralho manual: `QA Final Manual`;
- cartas manuais:
  - `QA Frente Texto`;
  - `QA Frente com imagem`;
  - `QA Frente com audio`;
- baralho APKG: `QA APKG Final`.

Fixture controlada para APKG:
- `frontend/e2e/fixtures/e2e-import.apkg`.

Evidencias a registrar:
- data e horario aproximado;
- sistema operacional/navegador usado;
- commit testado;
- comandos executados;
- resultado de cada fluxo: `Pendente`, `Passou`, `Falhou`, `Nao aplicavel`;
- prints ou descricao curta quando houver falha visual;
- bug reproduzivel com passos, esperado, observado e severidade;
- decisao: corrigir agora, aceitar risco, ou mover para pos-MVP.

## 7. Checklist de QA manual

Status inicial de todos os itens: `Pendente`.

| ID | Fluxo | Resultado esperado | Status | Observacoes |
| --- | --- | --- | --- | --- |
| QA-01 | Abrir app anonimo em `/biblioteca/publicos` | Biblioteca publica carrega sem login, com baralhos publicos e sem erro global | Pendente |  |
| QA-02 | Estudar baralho publico anonimamente | Rota de estudo abre, card aparece, revelar resposta e rating funcionam localmente | Pendente |  |
| QA-03 | Validar estudo polido | Progresso, feedback local, resumo, controle de fonte e ajuste de midia funcionam sem quebrar layout | Pendente |  |
| QA-04 | Criar conta e fazer login | Cadastro/login funcionam, sessao fica autenticada e rotas privadas liberam acesso | Pendente |  |
| QA-05 | Salvar baralho publico para Meus baralhos | Copia privada e criada, usuario vai para Meus baralhos e o baralho aparece destacado | Pendente |  |
| QA-06 | Criar baralho manual | Baralho novo e criado e abre gerenciamento contextual | Pendente |  |
| QA-07 | Criar, editar e excluir cartas | Carta persiste, edicao aparece ao reabrir e exclusao atualiza lista/contadores | Pendente |  |
| QA-08 | Fazer upload de imagem e audio em carta persistida | Marcadores sao inseridos, midias renderizam no preview/estudo e nao quebram layout | Pendente |  |
| QA-09 | Importar APKG com preview antes de salvar | Fixture APKG mostra preview, navegacao entre cartas e alternancia frente/verso | Pendente |  |
| QA-10 | Salvar APKG autenticado e validar midias persistidas | Baralho importado aparece em Meus baralhos e midias funcionam apos salvar | Pendente |  |
| QA-11 | Estudar deck salvo autenticado | Review persiste, fila avanca e progresso autenticado atualiza | Pendente |  |
| QA-12 | Usar pratica intercalada | Sessao intercalada abre, mistura cards elegiveis e aceita ratings | Pendente |  |
| QA-13 | Validar pagina de progresso | Estatisticas essenciais aparecem para usuario autenticado e refletem revisoes recentes | Pendente |  |
| QA-14 | Testar exclusao multipla de cartas e baralhos | Selecoes, contadores, confirmacoes e limpeza de estado funcionam | Pendente |  |
| QA-15 | Alternar tema claro/escuro | Tema muda sem perda de legibilidade nos fluxos principais | Pendente |  |
| QA-16 | Validar refresh direto e back/forward | Rotas principais reabrem corretamente e historico do navegador nao gera tela incoerente | Pendente |  |
| QA-17 | Fazer checagem responsiva mobile | Biblioteca, estudo, importacao e gerenciamento cabem em viewport mobile basica | Pendente |  |
| QA-18 | Confirmar mensagens de erro esperadas | Login invalido, arquivo invalido e acoes privadas anonimas exibem mensagens compreensiveis | Pendente |  |

## 8. Roteiro detalhado por fluxo

### QA-01. App anonimo e biblioteca publica

Passos:
1. abrir `http://localhost:8080/biblioteca/publicos`;
2. confirmar que a pagina carrega sem login;
3. verificar lista de baralhos publicos;
4. usar busca simples e limpar busca;
5. clicar em atualizar.

Resultado esperado:
- lista publica renderiza;
- nenhuma rota privada e carregada indevidamente;
- busca/limpeza nao deixa estado vazio incorreto.

### QA-02. Estudo publico anonimo

Passos:
1. em um baralho publico, clicar em estudar;
2. revelar resposta;
3. avaliar com `Bom`;
4. repetir ate observar avanco da fila ou conclusao;
5. voltar para Biblioteca.

Resultado esperado:
- nao exige login;
- progresso e feedback local aparecem;
- review anonimo fica local;
- ao sair, a sessao em memoria nao fica visivel em outro fluxo.

### QA-03. Polimento do estudo

Passos:
1. iniciar estudo com carta textual;
2. alternar fonte menor, padrao e maior;
3. iniciar estudo com carta que contenha imagem grande, se disponivel;
4. alternar ajuste de midia;
5. concluir uma sessao curta;
6. conferir resumo final.

Resultado esperado:
- controles nao causam overflow;
- barra de progresso e `aria` continuam coerentes;
- resumo mostra contagem por rating;
- mobile nao sobrepoe botoes, card e ratings.

### QA-04. Conta, login e rotas privadas

Passos:
1. criar conta QA nova;
2. sair;
3. tentar abrir `/biblioteca/meus` anonimo;
4. confirmar redirect para login;
5. fazer login;
6. confirmar retorno para a rota privada.

Resultado esperado:
- formulario valida campos;
- redirect preserva destino;
- logout limpa dados privados visiveis.

### QA-05. Salvar baralho publico

Passos:
1. autenticado, abrir Biblioteca publica;
2. salvar um baralho publico;
3. aguardar navegacao para Meus baralhos;
4. reabrir o baralho salvo no gerenciamento.

Resultado esperado:
- copia privada aparece;
- baralho publico original nao e alterado;
- cartas/copias ficam disponiveis para estudo e edicao.

### QA-06. Criar baralho manual

Passos:
1. abrir `/criar`;
2. preencher titulo, descricao e visibilidade;
3. salvar;
4. confirmar gerenciamento do novo baralho.

Resultado esperado:
- URL de gerenciamento abre;
- metadata aparece preenchida;
- estado vazio de cartas e compreensivel.

### QA-07. Criar, editar e excluir cartas

Passos:
1. no gerenciamento, criar uma carta textual;
2. editar frente, verso e tags;
3. reabrir a carta;
4. excluir a carta individualmente.

Resultado esperado:
- overlay abre/fecha corretamente;
- dirty state protege descarte;
- lista e contadores atualizam sem apontar para carta removida.

### QA-08. Upload de imagem e audio

Passos:
1. criar ou editar carta em baralho persistido;
2. enviar uma imagem pequena;
3. enviar um audio pequeno;
4. inserir marcadores no conteudo;
5. salvar e estudar o baralho.

Resultado esperado:
- upload retorna marcador;
- preview seguro renderiza imagem/audio;
- estudo renderiza midia persistida;
- imagem grande nao quebra o card quando ajuste de midia e usado.

### QA-09. APKG preview anonimo

Passos:
1. abrir `/importar` sem login;
2. selecionar `frontend/e2e/fixtures/e2e-import.apkg`;
3. confirmar preview;
4. alternar frente/verso;
5. navegar entre cartas;
6. sair para Biblioteca e voltar para Importar.

Resultado esperado:
- preview aparece antes de salvar;
- ao sair da rota, preview anterior e limpo;
- arquivo precisa ser selecionado novamente.

### QA-10. APKG salvar autenticado

Passos:
1. ainda anonimo, selecionar APKG e clicar em entrar para salvar;
2. autenticar;
3. confirmar preservacao intencional do preview;
4. salvar como `QA APKG Final`;
5. abrir Meus baralhos.

Resultado esperado:
- preview e preservado somente no fluxo de login para salvar;
- baralho importado fica persistido;
- apos salvar, estado temporario e limpo.

### QA-11. Estudo autenticado

Passos:
1. abrir um deck salvo;
2. estudar e avaliar pelo menos uma carta;
3. abrir Progresso;
4. voltar ao estudo ou Biblioteca.

Resultado esperado:
- review e enviado ao backend;
- progresso reflete revisao;
- stats recarregam sem erro;
- sair de estudo limpa fila local.

### QA-12. Pratica intercalada

Passos:
1. autenticado, clicar em Pratica intercalada;
2. revelar e avaliar cartas;
3. observar titulos de decks no card;
4. concluir ou voltar para Biblioteca.

Resultado esperado:
- sessao abre com cards elegiveis;
- fila avanca;
- resumo final funciona como no estudo por baralho.

### QA-13. Pagina de progresso

Passos:
1. abrir `/progresso` autenticado;
2. conferir totais essenciais;
3. fazer uma revisao;
4. voltar para Progresso.

Resultado esperado:
- pagina exige login ou orienta corretamente;
- metricas basicas nao ficam negativas ou incoerentes;
- revisoes recentes aparecem refletidas.

### QA-14. Exclusoes multiplas

Passos:
1. criar dados descartaveis se necessario;
2. selecionar cartas visiveis no gerenciamento e excluir;
3. selecionar baralhos visiveis em Meus baralhos e excluir;
4. cancelar uma confirmacao e depois confirmar outra.

Resultado esperado:
- selecao visivel e clara;
- cancelamento preserva dados;
- confirmacao remove apenas itens selecionados;
- modo de selecao limpa apos operacao.

### QA-15. Tema claro/escuro

Passos:
1. alternar tema na Biblioteca;
2. repetir no estudo, importacao, gerenciamento e progresso;
3. observar contraste, foco e botoes desabilitados.

Resultado esperado:
- textos continuam legiveis;
- estados selecionado/destacado continuam claros;
- nenhuma superficie fica com cor quebrada.

### QA-16. Refresh direto e back/forward

Passos:
1. abrir diretamente `/biblioteca/publicos`;
2. abrir diretamente `/importar`;
3. autenticado, abrir diretamente `/biblioteca/meus`;
4. abrir diretamente gerenciamento de deck;
5. abrir diretamente estudo de deck;
6. navegar entre telas e usar voltar/avancar do navegador.

Resultado esperado:
- SPA fallback funciona;
- route guards funcionam;
- telas recarregam dados sob demanda;
- historico nao ressuscita selecoes ou editor sujo indevidamente.

### QA-17. Responsivo mobile

Viewport sugerida:
- `390x844` ou equivalente.

Fluxos minimos:
- Biblioteca publica;
- Meus baralhos;
- gerenciamento de cartas;
- estudo com ratings e controles;
- importacao APKG;
- progresso.

Resultado esperado:
- sem sobreposicao incoerente;
- botoes cabem ou quebram linha;
- textos longos nao estouram seus containers;
- card de estudo continua utilizavel.

### QA-18. Mensagens de erro

Casos:
- login com senha errada;
- cadastro com email invalido ou senha curta;
- tentar salvar/importar sem login;
- selecionar arquivo nao APKG, se o navegador permitir;
- tentar acao privada apos logout.

Resultado esperado:
- mensagens sao compreensiveis;
- erro nao deixa loading preso;
- usuario consegue corrigir e continuar.

## 9. Validacoes automatizadas

Bateria obrigatoria para fechamento documental:
- `npm test`;
- `npm run build`;
- `npm run e2e`;
- `git diff --check`;
- `docker compose up -d --build`;
- checagem HTTP do frontend em `http://127.0.0.1:8080/`;
- checagem HTTP da API publica em `http://127.0.0.1:8081/api/decks/public`.

Teste backend Maven:
- executar se houver alteracao backend;
- considerar executar na bateria completa final mesmo sem backend alterado se o tempo operacional permitir;
- comando documentado no README:

```powershell
docker run --rm -v C:\Users\lenon\OneDrive\Documentos\LearningFrame\backend:/workspace -w /workspace maven:3.9-eclipse-temurin-21 mvn test
```

## 10. Modelo de registro de execucao

Preencher durante ou apos o QA:

| Campo | Valor |
| --- | --- |
| Data/hora |  |
| Commit testado |  |
| Branch | `codex/qa-manual-final` |
| Ambiente | Docker Compose local |
| Navegador |  |
| Frontend | `http://localhost:8080` |
| Backend | `http://localhost:8081` |
| Banco | `learningframe` em `localhost:3307` |

Comandos:

| Comando | Resultado | Observacoes |
| --- | --- | --- |
| `docker compose up -d --build` | Pendente |  |
| `npm test` | Pendente |  |
| `npm run build` | Pendente |  |
| `npm run e2e` | Pendente |  |
| `git diff --check` | Pendente |  |

Bugs encontrados:

| ID | Severidade | Fluxo | Observado | Esperado | Decisao |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

Riscos aceitos e pos-MVP:

| Item | Classificacao | Justificativa |
| --- | --- | --- |
| Token em `localStorage` | Risco aceito MVP | Produto academico/local; hardening fica para producao |
| Token em query string para midia privada | Risco aceito MVP | Decisao pragmatica para renderizacao de `img`/`audio`; revisar em producao |
| Midias como BLOB no MySQL | Risco aceito MVP | Simples e demonstravel; storage externo fica pos-MVP |
| APKG parcial | Limite documentado | Sem cloze avancado, templates complexos, historico, scheduler original ou `.colpkg` |
| Editor simples sem rich text completo | Pos-MVP | Fluxo atual ja permite HTML/midia basicos |
| Dashboard avancado e filtros/favoritos | Pos-MVP | Fora do escopo da entrega academica |

## 11. Criterios de bloqueio

Bloqueia fechamento do MVP:
- app nao sobe em Docker local;
- backend ou frontend nao respondem nas portas documentadas;
- usuario anonimo nao consegue estudar baralho publico;
- usuario autenticado nao consegue criar/salvar/importar baralho;
- estudo autenticado nao registra revisao;
- importacao APKG pequena nao faz preview ou nao salva autenticado;
- erro de seguranca ou privacidade expoe dados de outro usuario em fluxo comum;
- layout mobile impede concluir fluxo central de estudo ou biblioteca;
- `npm run e2e` usa banco dev ou nao derruba ambiente dedicado.

Nao bloqueia, mas deve ser registrado:
- texto/copy melhoravel sem impedir fluxo;
- falta de feature explicitamente fora do MVP;
- limitacao documentada de APKG;
- visual responsivo imperfeito sem impedir uso;
- suite automatizada sem cobertura exaustiva de todos os casos.

## 12. Definition of Done da branch

A branch sera considerada pronta quando:
- este checklist estiver executado ou houver justificativa para item nao aplicavel;
- evidencias e resultados estiverem registrados no diario ou documento de QA;
- README e docs principais refletirem o estado real do produto;
- bugs bloqueantes encontrados tiverem sido corrigidos ou explicitamente alinhados;
- validacoes automatizadas obrigatorias tiverem resultado registrado;
- riscos aceitos e pos-MVP estiverem claros;
- worktree estiver limpa apos commits finais.
