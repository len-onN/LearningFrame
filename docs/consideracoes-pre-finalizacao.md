# Consideracoes Pre-Finalizacao do MVP

Data da avaliacao: 2026-06-02  
Branch observada: `codex/frontend-moment-7-route-lifecycle`  
Contexto: `frontend-refactor` ja recebeu a maior parte da refatoracao incremental. O Momento 7 esta planejado, mas ainda nao implementado nesta branch.

## 1. Leitura Executiva

O LearningFrame esta perto de um MVP funcional e demonstravel.

O produto ja consegue sustentar a narrativa academica central:
- recordacao ativa;
- repeticao espacada;
- pratica intercalada;
- estudo anonimo de baralhos publicos;
- conta opcional para persistir baralhos, revisoes e progresso;
- interoperabilidade basica com APKG;
- gerenciamento de biblioteca com criacao, edicao, importacao, copia e exclusao.

A aplicacao tambem ja passou por um processo relevante de amadurecimento arquitetural:
- router introduzido;
- shell extraido;
- paginas visuais extraidas;
- Biblioteca e Importacao componentizadas;
- overlay de editor separado;
- composables de infraestrutura criados;
- `useDeckLibrary` extraido;
- controles de paginacao, busca e selecao em Biblioteca melhorados;
- notificacoes com ciclo de vida mais previsivel;
- planejamento do Momento 7 para transformar rotas em superficie real.

O ponto mais importante: o MVP nao parece mais estar bloqueado por falta de funcionalidades essenciais. Ele esta bloqueado por acabamento, reducao de risco e refinamento do modo de estudo.

Minha avaliacao:
- **Biblioteca** esta em bom estado de MVP.
- **Gerenciamento de decks/cartas** esta funcional e relativamente maduro.
- **Importacao APKG** esta forte para um MVP academico, desde que os limites sejam comunicados.
- **Arquitetura frontend** melhorou muito, mas ainda tem uma grande concentracao em `App.vue`.
- **Modo de estudo** funciona, mas ainda e o ponto que mais pode elevar a percepcao de qualidade.
- **Entrega final** deve priorizar Momento 7, refinamento de estudo, QA integrado e documentacao de limites.

## 2. Estado Atual do Produto

### 2.1 Conta e autenticacao

Implementado:
- cadastro;
- login;
- persistencia local de token;
- guard de rotas privadas;
- redirect para login quando rota exige autenticacao;
- formulario com validacao de campos;
- conta opcional, preservando o fluxo anonimo.

Pontos fortes:
- a decisao de conta opcional esta alinhada ao MVP;
- o usuario pode experimentar antes de se comprometer;
- rotas privadas ja protegem criacao, progresso e Meus baralhos.

Pontos em aberto:
- nao ha recuperacao de senha;
- nao ha logout global de sessoes;
- nao ha tela de perfil;
- token fica em `localStorage`, aceitavel para MVP, mas nao ideal para producao sensivel;
- media protegida usa token em query string para permitir renderizacao por `<img>`/`audio`, util no MVP, mas com risco de exposicao em logs/cache historico se levado a producao.

Recomendacao:
- manter como esta para o MVP;
- documentar que seguranca de sessao e hardening de autenticacao sao pos-MVP.

### 2.2 Biblioteca publica

Implementado:
- listagem paginada de baralhos publicos;
- busca;
- estudar baralho publico;
- salvar baralho publico como copia privada;
- destaque do baralho salvo;
- ajuste visual de contraste no tema claro;
- cards com altura uniforme.

Pontos fortes:
- boa porta de entrada para usuario anonimo;
- comportamento "Salvar para mim" deixa claro o valor da conta;
- paginacao evita carregar toda a biblioteca;
- busca no backend por titulo/descricao resolve a maior parte do fluxo de descoberta.

Pontos em aberto:
- favoritar foi levantado como ideia futura;
- curadoria/ordenacao da biblioteca ainda e simples;
- nao ha filtros por tags, fonte, formato ou popularidade;
- busca publica nao busca dentro das cartas, apenas nos metadados do deck.

Recomendacao:
- manter favoritar fora do MVP final;
- se houver tempo, melhorar apenas textos/empty states da Biblioteca, nao adicionar novas capacidades.

### 2.3 Meus baralhos

Implementado:
- listagem paginada;
- busca;
- criacao de baralho manual;
- edicao de titulo, descricao e visibilidade;
- exclusao unitária;
- exclusao multipla;
- modo de selecao com card inteiro selecionavel;
- selecao de itens visiveis;
- confirmacao antes de excluir;
- toolbar contextual sticky;
- botao de voltar ao topo em listas longas.

Pontos fortes:
- esta area saiu de uma lista simples para uma superficie de gerenciamento real;
- a exclusao multipla foi implementada com ownership transacional no backend;
- o design de selecao resolve o problema de listas paginadas sem tentar carregar tudo em memoria;
- a decisao de "selecionar visiveis", e nao "selecionar todos os resultados", e segura e compreensivel.

Pontos em aberto:
- nao ha duplicacao de baralho proprio;
- nao ha favoritos;
- nao ha arquivamento;
- nao ha ordenacao por criacao/atualizacao/nome;
- nao ha filtros por visibilidade/formato.

Recomendacao:
- para o MVP, Meus baralhos esta suficientemente funcional;
- melhorias futuras devem ser guiadas por uso real, nao por ansiedade de completar uma biblioteca "profissional".

### 2.4 Gerenciamento de cartas

Implementado:
- cartas paginadas por deck;
- busca em frente, verso e tags;
- selecao multipla de cartas;
- exclusao em lote;
- preview frente/verso;
- criacao e edicao de cartas;
- upload de midia para carta persistida;
- fallback de rotulo `Carta 1`, `Carta 2`, etc. quando nao ha texto extraivel;
- preservacao de paginacao sem carregar todas as cartas de uma vez.

Pontos fortes:
- o fluxo resolve a dor principal: gerenciar baralhos grandes sem explodir memoria e tela;
- a busca de cartas e bastante valiosa;
- a separacao entre lista paginada e preview/editor e uma boa decisao de UX;
- upload de midia persistida aumenta muito a utilidade real.

Pontos em aberto:
- editor ainda e simples, sem rich text toolbar;
- nao ha reordenacao de cartas;
- nao ha duplicacao de carta;
- nao ha edicao em massa de tags;
- nao ha validacao visual sofisticada para HTML problemático;
- nao ha confirmacao de navegacao ao sair com editor aberto por rota, apenas confirmacoes internas.

Recomendacao:
- manter editor simples no MVP;
- depois do estudo, um pequeno refinamento de editor pode ser considerado, mas nao parece prioridade de entrega.

### 2.5 Importacao APKG

Implementado:
- selecao de arquivo `.apkg`;
- preview antes de salvar;
- navegacao entre cartas importadas;
- alternancia frente/verso;
- busca no seletor de preview;
- deteccao de midia;
- leitura local de midia para preview;
- persistencia de APKG para usuario autenticado;
- importacao de midias para backend;
- limpeza de object URLs;
- preservacao do preview durante o fluxo "entrar para salvar".

Pontos fortes:
- e uma das features mais fortes para a narrativa academica;
- comunica bem que o MVP nao tenta replicar todo o Anki;
- lida com midia de modo pragmatico;
- tem politica de memoria ja parcialmente implementada.

Pontos em aberto:
- cloze, templates complexos, historico de agendamento e `.colpkg` estao fora;
- midias ficam em BLOB no banco, aceitavel para MVP, mas nao escalavel;
- preview e importacao ainda dependem de estado concentrado no `App.vue`;
- respostas antigas e aborts ainda podem ser refinados no Momento 7;
- arquivos grandes podem causar custo de memoria perceptivel.

Recomendacao:
- manter escopo APKG atual;
- documentar limites com clareza;
- no Momento 7, reforcar limpeza, abort/ignore de requests antigas e ciclo de vida da importacao.

### 2.6 Modo de estudo

Implementado:
- estudo por baralho;
- pratica intercalada;
- fila de cards vencidos;
- frente/verso;
- revelar resposta;
- ratings `De novo`, `Dificil`, `Bom`, `Facil`;
- agenda simples de repeticao espacada;
- estudo anonimo com estados locais em `localStorage`;
- estudo autenticado com review state persistido;
- audio/imagem renderizados em cartas persistidas;
- estatisticas atualizadas apos revisoes autenticadas.

Pontos fortes:
- cobre a espinha dorsal do MVP;
- backend e frontend usam uma logica de agenda equivalente;
- `MIXED_DUE` intercala por deck no backend;
- usuario anonimo consegue experimentar o valor do produto;
- usuario autenticado consegue persistir revisoes.

Pontos preocupantes:
- UX ainda e basica e pouco "estudo guiado";
- nao ha resumo de sessao;
- nao ha feedback claro do que acabou de acontecer apos um rating;
- nao ha indicacao visual forte de progresso dentro da sessao alem do tamanho da fila;
- nao ha escolha fina de sessao: limite, decks selecionados, novos vs revisao;
- nao ha atalhos de teclado para estudo;
- nao ha estado de "pausar/retomar";
- nao ha tela de conclusao rica;
- modo anonimo carrega detalhes de decks publicos e pode manter cache em memoria sem limite ate o Momento 7;
- ao sair de estudo, a politica de limpeza ainda merece ficar explicita.

Recomendacao:
- depois do Momento 7, o refinamento do modo de estudo e o melhor investimento antes da entrega final.

## 3. Estado Arquitetural

### 3.1 Backend

Pontos fortes:
- organizacao por dominios claros: auth, deck, importing, study, stats;
- contratos REST diretos e suficientes para MVP;
- JPA com queries especificas para paginacao, busca e due cards;
- ownership validado em operacoes sensiveis;
- exclusao em cascata bem aproveitada no modelo relacional;
- testes unitarios de servico e contratos importantes;
- Flyway ja estrutura schema e seeds.

Pontos preocupantes:
- `DeckController` concentra deck, cards e bulk delete; aceitavel no MVP, mas pode crescer;
- armazenamento de midia como BLOB facilita o MVP, mas nao deve ser o desenho final para escala;
- busca textual com `LIKE lower(...)` em HTML e tags e suficiente agora, mas nao e uma solucao de busca robusta;
- logs de revisao existem, mas analitica ainda e minima;
- nao ha suite de integracao HTTP completa;
- hardening de seguranca ainda e basico.

Avaliacao:
- backend esta mais solido que o frontend do ponto de vista arquitetural;
- nao parece necessario reestruturar endpoints antes da entrega;
- melhorias de backend antes do MVP devem ser pequenas e motivadas por bugs ou UX do estudo.

### 3.2 Frontend

Pontos fortes:
- stack simples e adequada ao MVP: Vue 3, Vite, TypeScript;
- componentes visuais importantes ja foram extraidos;
- `AppShell` separa layout;
- paginas controladas por props/eventos reduzem acoplamento visual;
- `useFeedback`, `useTheme`, `useAuthSession` e `useDeckLibrary` ja diminuiram o peso do `App.vue`;
- CSS global esta organizado o suficiente para MVP;
- rotas principais ja existem;
- build e testes frontend ja rodam com frequencia.

Pontos preocupantes:
- `App.vue` ainda tem cerca de 1400 linhas e concentra workflows;
- o router ainda usa `RouteSurface` ate o Momento 7 ser implementado;
- `syncRouteState()` e watchers centrais tornam ciclo de vida dificil de auditar;
- importacao, estudo e gerenciamento ainda nao tem composables de dominio;
- provide/inject planejado no Momento 7 pode esconder dependencias se crescer demais;
- nao ha testes de componentes ou e2e cobrindo navegacao completa;
- `npm audit` ja apontou vulnerabilidade critica em momento anterior e nao foi resolvido para evitar mudancas fora de escopo.

Avaliacao:
- a arquitetura frontend esta em transicao controlada;
- o risco principal nao e falta de padrao, mas uma refatoracao parcial ficar pela metade;
- Momento 7 e importante para "fechar" a historia arquitetural antes do refinamento final de estudo.

### 3.3 Ciclo de vida e memoria

O projeto ja tomou boas decisoes:
- listas de decks sao paginadas;
- cartas sao paginadas;
- APKG limpa object URLs;
- selecoes sao podadas quando listas recarregam;
- feedback route-scoped evita notificacoes presas.

Ainda preocupa:
- cache anonimo de decks publicos para estudo precisa de limite;
- `studyQueue` deve ser limpa ao sair de rotas de estudo;
- timers de busca vivem em `App.vue`, que persiste;
- preview APKG precisa ignorar/abortar respostas antigas com mais rigor;
- listas com "Carregar mais" crescem explicitamente em memoria, o que e aceitavel, mas precisa ser conscientemente limitado no desenho de UX.

Recomendacao:
- executar Momento 7 antes de iniciar refinamentos grandes de estudo;
- tratar limpeza de memoria como criterio de aceite, nao como detalhe invisivel.

## 4. O Que Ja Foi Refinado

Produto/UX:
- tema claro/escuro;
- sidebar retratil;
- biblioteca paginada;
- busca em biblioteca;
- busca paginada de cartas no gerenciamento;
- preview APKG com midia;
- upload e renderizacao de midia persistida;
- destaque do baralho salvo;
- notificacoes dismissiveis e com ciclo de vida por rota;
- cards de biblioteca com altura uniforme;
- contraste da Biblioteca em tema claro;
- botao "Salvar para mim" em baralhos publicos;
- selecao multipla de decks e cartas;
- fallback de rotulo para cartas sem texto;
- botao de voltar ao topo em listas longas.

Arquitetura:
- backend com metadata leve para rotas diretas;
- Vue Router introduzido;
- `AppShell` extraido;
- paginas principais extraidas;
- Biblioteca e Importacao componentizadas;
- `CardEditorOverlay` extraido;
- composables de infraestrutura;
- `useDeckLibrary`;
- planejamento de rotas reais e ciclo de vida no Momento 7.

Qualidade:
- testes de SRS, HTML seguro, APKG media, auth validation, feedback, `useDeckLibrary`;
- testes backend para auth DTOs, media, deck service/controller, importacao APKG e SRS;
- validacoes frequentes com build frontend e testes backend em container.

## 5. O Que Esta Em Aberto

### Critico para fechar a arquitetura do MVP

1. Implementar Momento 7.
   - Substituir `RouteSurface`;
   - usar route components reais;
   - mover sincronizacao para limites de rota;
   - reforcar limpeza de estudo/importacao/cache.

2. Validar navegacao direta e back/forward.
   - Biblioteca publica;
   - Meus baralhos;
   - gerenciamento por URL;
   - estudo por deck;
   - pratica intercalada;
   - importacao;
   - login com redirect.

3. Resolver ou documentar vulnerabilidade do `npm audit`.
   - Se nao for corrigir, registrar conscientemente que e aceitavel apenas para o MVP academico/local;
   - se for corrigir, fazer em branch pequena e testar bem.

### Critico para experiencia de entrega

1. Refinar modo de estudo.
2. Fazer QA manual completo em container.
3. Atualizar README para refletir o estado atual real.
4. Garantir que demo seed e fluxos principais estejam previsiveis.
5. Registrar limites de APKG e seguranca de forma honesta.

### Bom, mas provavelmente pos-MVP

- favoritos;
- filtros avancados;
- ordenacao de biblioteca;
- duplicacao de deck/carta;
- tags em massa;
- rich text editor completo;
- tela de perfil;
- recuperacao de senha;
- historico detalhado de revisoes;
- graficos avancados de progresso;
- storage externo para midia;
- busca full-text;
- testes e2e com Playwright/Cypress.

## 6. Refinamento Recomendado Para o Modo de Estudo

O estudo deve ser o ultimo grande refinamento antes da entrega, porque ele e a experiencia que justifica o produto.

### 6.1 Objetivo de UX

O usuario deve sentir que esta em uma sessao guiada, nao apenas clicando em cards.

Hoje:
- escolhe deck;
- revela resposta;
- clica rating;
- fila diminui.

Desejado para MVP refinado:
- entender onde esta na sessao;
- receber feedback imediato apos avaliar;
- perceber progresso;
- terminar com uma conclusao clara;
- conseguir estudar com menos atrito visual e motor.

### 6.2 Melhorias de alto retorno

1. **Resumo de sessao ao finalizar**
   - cards revisados;
   - quantos `De novo`, `Dificil`, `Bom`, `Facil`;
   - tempo aproximado ou ao menos contagem da sessao;
   - proxima revisao, se autenticado.

2. **Feedback apos rating**
   - apos clicar em `Bom`, mostrar discretamente "volta amanha" ou "intervalo: 1 dia";
   - evitar notificacao global para cada card, porque isso polui;
   - preferir feedback local no card ou na area de meta.

3. **Progresso visual da sessao**
   - `x de y` ou barra discreta;
   - manter `cards na fila`, mas complementar com contexto;
   - evitar layout exagerado.

4. **Atalhos de teclado**
   - revelar resposta por tecla;
   - ratings por teclas numericas;
   - cuidado para nao depender apenas de texto visivel explicativo;
   - tooltips ou acessibilidade podem nomear comandos.

5. **Empty state mais inteligente**
   - se nao ha cards vencidos, oferecer voltar para Biblioteca ou iniciar pratica intercalada;
   - se deck nao tem cartas, orientar criar/importar cartas;
   - se usuario anonimo esta em deck publico, deixar claro que persistencia fica local.

6. **Melhor controle da pratica intercalada**
   - no MVP, talvez manter simples;
   - opcionalmente permitir misturar apenas decks salvos ou publicos carregados;
   - evitar tela complexa de configuracao antes da entrega.

7. **Tratamento de midia no estudo**
   - garantir imagens com tamanho maximo e sem quebrar layout;
   - audio ja renderiza, mas merece teste manual;
   - cards com apenas midia devem ter boa apresentacao.

### 6.3 Melhorias tecnicas associadas

1. Extrair `useStudySession`.
   - O plano do Momento 6 previu isso, mas a implementacao foi fatiada.
   - Depois do Momento 7, a rota de estudo sera fronteira natural para esse composable.

2. Limpar fila ao sair da rota.
   - Deve entrar no Momento 7 ou no primeiro commit de estudo refinado.

3. Limitar cache anonimo de decks publicos.
   - Importante para memoria.

4. Registrar estado da sessao atual.
   - Pode ser apenas em memoria;
   - nao precisa persistir sessao incompleta para MVP.

5. Garantir equivalencia entre SRS backend e local.
   - Hoje ja ha equivalencia conceitual;
   - manter testes para evitar divergencia.

### 6.4 O que nao fazer no estudo antes do MVP

- nao criar um dashboard complexo de sessao;
- nao implementar scheduler sofisticado novo;
- nao tentar importar historico de agendamento do Anki;
- nao fazer configurador avançado de sessao;
- nao adicionar gamificacao pesada;
- nao transformar estudo em tela visualmente extravagante;
- nao carregar todos os decks/cartas para montar pratica intercalada.

## 7. Sequencia Recomendada Ate a Entrega

### Etapa 1 - Fechar Momento 7

Objetivo:
- router real;
- ciclo de vida por rota;
- limpeza de estados temporarios;
- cache anonimo limitado.

Resultado esperado:
- `App.vue` menos responsavel por renderizacao;
- rotas diretas mais confiaveis;
- memoria mais previsivel.

Prioridade: alta.

### Etapa 2 - Refinar modo de estudo

Objetivo:
- melhorar sessao, feedback, progresso e conclusao;
- manter escopo pequeno;
- extrair `useStudySession` se o custo estiver controlado.

Resultado esperado:
- maior sensacao de produto pronto;
- melhor demonstracao da proposta academica.

Prioridade: alta.

### Etapa 3 - QA integrado containerizado

Objetivo:
- testar fluxos de ponta a ponta manualmente;
- registrar bugs finais;
- corrigir apenas o que bloqueia entrega.

Checklist minimo:
- abrir app anonimo;
- estudar baralho publico;
- criar conta;
- salvar baralho publico;
- criar deck manual;
- criar/editar/excluir cartas;
- upload de imagem/audio;
- importar APKG;
- estudar deck salvo;
- pratica intercalada;
- progresso;
- exclusao multipla;
- tema claro/escuro;
- responsivo basico.

Prioridade: alta.

### Etapa 4 - Documentacao final

Objetivo:
- atualizar README;
- registrar limites de MVP;
- registrar como rodar com Docker Compose dev/prod;
- documentar APKG e seguranca de midia de forma honesta.

Prioridade: media-alta.

### Etapa 5 - Hardening pequeno

Possiveis ajustes:
- revisar `npm audit`;
- revisar CORS/env;
- garantir mensagens de erro consistentes;
- limpar textos quebrados por encoding se ainda aparecerem no navegador;
- validar seeds.

Prioridade: media.

## 8. Pontos Fortes Para Defender a Entrega

1. **Escopo academico claro**
   - O projeto nao tenta ser Anki completo.
   - Ele demonstra principios de aprendizagem com foco.

2. **Conta opcional**
   - Reduz atrito.
   - Permite demonstracao anonima e valor persistente para usuario logado.

3. **APKG com limites conscientes**
   - Boa interoperabilidade para MVP.
   - Limites tecnicos foram registrados.

4. **Biblioteca bem encaminhada**
   - Publicos, meus baralhos, copiar, criar, editar, excluir, selecionar.

5. **Arquitetura incremental**
   - Nao houve rewrite.
   - A refatoracao preservou funcionalidades enquanto reduziu acoplamento.

6. **Paginacao e memoria tratadas com cuidado**
   - Decisoes de "Carregar mais" e selecao visivel sao adequadas para MVP.

7. **Backend suficientemente coeso**
   - Camadas e contratos estao compreensiveis.

8. **Testes relevantes**
   - Nao e cobertura total, mas cobre regras importantes.

## 9. Pontos Preocupantes Para Nao Ignorar

1. **`App.vue` ainda e grande**
   - Momento 7 precisa reduzir o risco de renderizacao/orquestracao central.

2. **Estudo ainda parece basico**
   - Funciona, mas pode nao transmitir "produto pronto" se nao receber acabamento.

3. **Ciclo de vida de memoria ainda merece prova**
   - Importacao e estudo sao os principais pontos.

4. **Seguranca e producao**
   - Token em localStorage;
   - token em query string para midia;
   - sanitizer HTML proprio;
   - BLOB no banco.
   - Tudo aceitavel para MVP academico, mas deve ser documentado como limite.

5. **Sem e2e**
   - A aplicacao depende de muitos fluxos integrados.
   - QA manual rigoroso e obrigatorio.

6. **Dependencias**
   - O alerta do `npm audit` precisa pelo menos de uma decisao registrada.

7. **Encoding/textos**
   - Alguns outputs de terminal mostram caracteres acentuados quebrados.
   - Pode ser apenas console/encoding, mas vale validar no navegador.

## 10. Decisao Recomendada de Escopo

Para a entrega do MVP, eu priorizaria:

1. Implementar Momento 7.
2. Refinar modo de estudo.
3. QA integrado.
4. Documentacao final.
5. Correcoes pequenas encontradas no QA.

Eu nao priorizaria antes da entrega:
- favoritos;
- filtros avancados;
- rich text editor completo;
- perfil/recuperacao de senha;
- graficos avancados;
- store global;
- migrar midia para storage externo;
- busca full-text.

## 11. Proposta de "Definition of Done" do MVP

O MVP pode ser considerado pronto para entrega academica quando:
- usuario anonimo consegue estudar baralhos publicos;
- usuario anonimo consegue importar APKG para preview e entender que salvar exige login;
- usuario autenticado consegue salvar/importar/criar baralhos;
- usuario autenticado consegue gerenciar cartas e midias;
- usuario autenticado consegue estudar e registrar revisoes;
- progresso essencial aparece corretamente;
- pratica intercalada funciona;
- URLs principais funcionam diretamente;
- sair de telas pesadas limpa memoria esperada;
- documentacao explica limites do APKG e do MVP;
- build e testes passam;
- container sobe de forma reproduzivel;
- QA manual nao encontra bug bloqueante.

## 12. Recomendacao Final

O estado atual e bom. Mais do que bom: esta num ponto em que o risco maior deixou de ser "nao temos feature" e passou a ser "vamos adicionar feature demais e perder foco".

Minha recomendacao e fechar a arquitetura com o Momento 7, e entao tratar o modo de estudo como a ultima grande experiencia a lapidar.

Se o estudo ganhar:
- progresso de sessao;
- feedback local apos rating;
- resumo ao finalizar;
- limpeza de estado ao sair;
- atalhos/ergonomia basica;

o LearningFrame deve ficar em estado convincente de MVP funcional, demonstravel e tecnicamente defensavel.

## 13. Adendo Pos-Merge do Momento 8 em `develop`

Data da avaliacao: 2026-06-07
Branch observada: `develop`
Commit observado: `4a52077` (`Merge pull request #23 from len-onN/frontend-refactor`)

Este adendo atualiza a leitura anterior deste documento. As secoes acima foram
mantidas como registro historico da avaliacao pre-Momento 8, mas algumas
preocupacoes ja foram superadas pelo merge de `frontend-refactor` em `develop`.

### 13.1 O que mudou desde a avaliacao original

O Momento 7 foi integrado e o frontend passou a usar rotas reais com
`<RouterView />`, route adapters e ciclo de vida mais explicito por tela.

O Momento 8 foi integrado e adicionou:
- Playwright;
- `docker-compose.e2e.yml`;
- banco MySQL E2E dedicado;
- profile backend `e2e`;
- endpoint interno `POST /api/e2e/reset`, protegido por token;
- seed deterministico;
- primeira suite E2E cobrindo smoke publico, autenticacao, rotas privadas,
  criacao/gerenciamento basico de baralho, cartas, estudo, importacao APKG e
  progresso.

Com isso, o ponto "Sem e2e" deixou de ser uma pendencia critica atual.

### 13.2 Validacoes pos-merge executadas

Na base `develop` atualizada:
- `npm test`: 33 testes frontend passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium;
- testes backend via container Maven: 27 testes passando.

O E2E confirmou uso de ambiente dedicado:
- projeto Compose `learningframe-e2e`;
- servico `db-e2e`;
- banco `learningframe_e2e`;
- porta MySQL host `3317`;
- volume `mysql-e2e-data`;
- teardown com `down -v`.

Nao houve uso do banco dev nos testes E2E.

### 13.3 Estado atual da decisao de MVP

O projeto ja pode entrar em fase de estabilizacao/finalizacao academica.

Nao foi identificado bloqueio funcional critico apos o merge. A prioridade agora
deixa de ser adicionar capacidade nova ampla e passa a ser:
- hardening pequeno;
- documentacao final;
- QA integrado;
- polimento limitado do modo de estudo, se o custo se mantiver baixo.

### 13.4 Pendencias atuais antes da entrega

Prioridade alta:
1. Revisar a vulnerabilidade critica indicada por `npm audit` em `vitest <4.1.0`.
   - A correcao sugerida instala `vitest@4.1.8` via `npm audit fix --force`;
   - como isso e potencialmente breaking, deve ocorrer em branch curta, com
     validacao completa, ou ser documentado como risco aceito para MVP local.
2. Fazer QA manual integrado em container.
3. Garantir que a documentacao final reflita o estado atual do produto.

Prioridade media:
1. Expandir a suite E2E apenas em pontos de maior risco:
   - refresh direto em rotas principais;
   - back/forward;
   - edicao de metadata de baralho;
   - selecao/exclusao em lote;
   - acessibilidade basica dos fluxos criticos.
2. Polir o modo de estudo:
   - progresso de sessao;
   - feedback local apos rating;
   - resumo de conclusao;
   - atalhos simples, se nao gerarem complexidade.

Fora da proxima fase:
- favoritos;
- filtros avancados;
- rich text editor completo;
- perfil e recuperacao de senha;
- storage externo para midia;
- busca full-text;
- dashboard analitico avancado.

### 13.5 Proxima branch recomendada

Branch criada para iniciar a fase:

```txt
codex/mvp-finalization-planning
```

Objetivo inicial da branch:
- consolidar documentacao pos-merge;
- registrar o estado real de validacao;
- preparar o prompt contextual para o proximo chat;
- iniciar a proxima conversa pela analise e pelo plano de implementacao, antes
  de qualquer mudanca funcional.

### 13.6 Estrategia de planejamento por branch

Apos a consolidacao pos-merge, a estrategia recomendada para a estabilizacao
final e planejar e implementar por branches curtas, nao concentrar todo o
planejamento em uma etapa grande e separada.

Racional:
- a fase atual ja tem escopo conhecido e riscos localizados;
- cada tema tem natureza diferente: dependencia, E2E, UX de estudo, QA e
  documentacao final;
- planejar dentro da branch do proprio tema mantem a analise perto dos arquivos,
  comandos e validacoes afetados;
- reduz a chance de gerar um plano longo demais e descolado do estado real do
  repositorio.

Sequencia recomendada:

1. Criar branch curta a partir da base consolidada.
2. Confirmar branch, status do Git e mudancas pendentes.
3. Ler a documentacao obrigatoria do tema.
4. Fazer uma analise curta do estado real dos arquivos envolvidos.
5. Propor plano local de implementacao e validacao.
6. Implementar apenas depois desse plano.
7. Validar, registrar resultado e fechar com commit pequeno.

Para a proxima frente, a branch definida e:

```txt
codex/audit-vitest-decision
```

Essa branch deve comecar pela decisao sobre o alerta critico de `npm audit` em
`vitest <4.1.0`, sem executar `npm audit fix --force` automaticamente. O prompt
de abertura esta registrado em:

```txt
docs/prompt-proximo-chat-audit-vitest-mvp.md
```

### 13.7 Decisao do audit Vitest

Data: 2026-06-07
Branch observada: `codex/audit-vitest-decision`

A pendencia critica de `npm audit` relacionada a `vitest <4.1.0` foi tratada em
branch curta.

Resultado:
- `vitest` foi atualizado de `3.2.4` para `4.1.8`;
- a alteracao ficou restrita ao frontend, em `frontend/package.json` e
  `frontend/package-lock.json`;
- a tentativa de manter uma correcao apenas na linha 3.x nao foi suficiente,
  pois o `npm ci` do build E2E ainda reportava uma vulnerabilidade critica;
- com `vitest@4.1.8`, o `npm ci` do build E2E reportou
  `found 0 vulnerabilities`.

Validacoes executadas:
- `npm test`: 33 testes frontend passando;
- `npm run build`: build frontend passando;
- `npm run e2e`: 9 testes Playwright passando no Compose dedicado
  `learningframe-e2e`, com teardown `down -v`.

Atualizacao de prioridades:
- a revisao do audit Vitest deixa de ser pendencia aberta;
- a proxima frente recomendada passa a ser a expansao E2E de fluxos de maior
  risco, em branch curta `codex/e2e-risk-flows`;
- QA manual integrado e documentacao final continuam como prioridades da fase
  de estabilizacao;
- polimento do modo de estudo permanece desejavel, mas deve continuar limitado
  para nao reabrir escopo grande antes da entrega.
