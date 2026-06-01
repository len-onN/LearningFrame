# Diario de bordo do LearningFrame

Data de consolidacao: 2026-05-31

Este documento registra a trajetoria do projeto LearningFrame desde sua concepcao ate o estado atual. Ele foi construido a partir do historico disponivel nesta conversa, do snapshot existente em `docs/2026-05-30_18-53-40_learningframe-snapshot.md` e do estado atual do repositorio.

## 1. Concepcao

O LearningFrame nasceu como uma proposta de trabalho academico: criar uma aplicacao web para resolver um problema profissional real, mas com escopo suficiente para caber em um paper. A ideia original era pessoal e ambiciosa em horizonte futuro: uma plataforma para auxiliar estudantes, com metodologia cientifica, modulos de estudo, pesquisa, referencias e criacao de materiais.

Logo no inicio foi feita uma delimitacao importante: o projeto deveria ser um MVP, nao uma plataforma completa. O foco academico exigia que o produto fosse demonstravel, coerente e tecnicamente defensavel, sem crescer a ponto de exigir dezenas ou centenas de paginas apenas para explicar seu funcionamento.

O problema escolhido foi apoiar o estudo por meio de tecnicas com respaldo cientifico:

- recordacao ativa;
- repeticao espacada;
- pratica intercalada.

Inicialmente a pratica intercalada apareceu como "modo caos", uma forma mais informal de misturar temas e baralhos. Depois, por alinhamento academico e reducao de personalidade desnecessaria no MVP, o termo foi alterado para "Pratica intercalada".

## 2. Primeiras decisoes de produto

As primeiras decisoes definiram a alma do MVP:

- A aplicacao deveria permitir estudar baralhos publicos sem login.
- O login deveria existir, mas sem bloquear a experiencia inicial.
- Usuarios autenticados poderiam criar baralhos permanentes, importar conteudo, publicar e acompanhar progresso.
- Estatisticas entrariam apenas como progresso essencial, nao como dashboard analitico completo.
- O design deveria ser minimalista, limpo e centrado no conteudo.

A autenticacao foi tratada como opcional para o uso basico e obrigatoria para persistencia. Essa decisao foi importante porque separou dois modos mentais:

- visitante: explorar, estudar baralhos publicos e avaliar importacoes;
- usuario logado: persistir conhecimento, agenda, midias e progresso.

## 3. Stack escolhida

As tecnologias foram escolhidas com foco em atualidade, gratuidade, documentabilidade e execucao local simples:

- Backend: Java 21 com Eclipse Temurin.
- Framework: Spring Boot 4.0.x.
- Banco de dados: MySQL 8.4 LTS.
- Frontend: Vue 3, Vite e TypeScript.
- Infra: Docker Compose.

A meta operacional foi clara desde cedo: uma pessoa deveria conseguir subir tudo com um comando:

```powershell
docker compose up --build
```

Servicos esperados:

- `db`: MySQL;
- `backend`: API Spring Boot;
- `frontend`: aplicacao Vue servida por Nginx.

Portas adotadas:

- frontend: `http://localhost:8080`;
- backend: `http://localhost:8081`;
- MySQL local: `localhost:3307`.

## 4. Modelo inicial do MVP

O modelo principal foi definido com as entidades:

- `User`;
- `Deck`;
- `Card`;
- `Tag`;
- `ReviewState`;
- `ReviewLog`;
- `MediaAsset`.

Tipos centrais:

- `StudyMode`: `SINGLE_DECK`, `MIXED_DUE`;
- `ReviewRating`: `AGAIN`, `HARD`, `GOOD`, `EASY`;
- `ImportFormat`: `APKG`, `CSV`, `TSV`.

A repeticao espacada foi definida como SM-2 simplificado. Ao importar decks do Anki, o LearningFrame reinicia a agenda propria e ignora o historico de agendamento original. Essa decisao manteve o escopo controlado e evitou tentar reproduzir o Anki.

## 5. APKG e limites de interoperabilidade

O `.apkg` foi escolhido como formato padrao de interoperabilidade com o Anki. Desde cedo ficou registrado que `.apkg` nao significa licenca livre do conteudo importado. Tambem ficou decidido que o projeto nao copiaria codigo do Anki nem assumiria dependencias incompatíveis com o escopo academico.

Limites iniciais da importacao:

- aceitar deck package `.apkg`, nao `.colpkg`;
- extrair notas/cards basicos;
- mapear frente e verso a partir dos dois primeiros campos;
- extrair tags;
- preservar midias simples quando o baralho fosse salvo no backend;
- nao preservar templates complexos;
- nao preservar cloze avancado;
- nao preservar historico de revisao;
- nao preservar configuracoes originais do Anki.

## 6. Primeiro bootstrap da aplicacao

O MVP inicial foi implementado com:

- API de autenticacao;
- CRUD basico de deck/card;
- estudo de baralho unico;
- pratica intercalada;
- importacao APKG basica;
- estatisticas minimas;
- frontend com biblioteca, estudo, importacao, criacao e progresso;
- Docker Compose com banco, backend e frontend.

O primeiro snapshot formal do projeto foi registrado em `docs/2026-05-30_18-53-40_learningframe-snapshot.md`.

Naquele momento, a politica de commits tambem foi definida: usar Conventional Commits. Mais tarde, foi reforcado que as mensagens de commit e descricoes de testes devem ser em portugues.

## 7. Primeiros ajustes de experiencia

Com a aplicacao rodando no navegador, surgiram ajustes de interface:

- remover o texto "estudo cientifico";
- fazer o logo "LearningFrame" voltar para a pagina inicial;
- ocultar a opcao "Criar" antes do login;
- melhorar login/cadastro com tela dedicada;
- escurecer levemente bordas;
- melhorar o posicionamento de botoes da tela de autenticacao;
- transformar "Continuar sem login" em um `X` no card de login com tooltip.

Essas decisoes caminharam na direcao de uma experiencia mais limpa, menos verbosa e mais coerente com o minimalismo funcional.

## 8. Validacao de formularios

Foi decidido melhorar a validacao dos formularios no estilo dos `mat-errors` do Angular: feedback visual abaixo de cada campo.

No frontend:

- validacao em tempo real ou quase em tempo real;
- mensagens abaixo dos campos;
- estados visuais de erro.

Na senha, a regra evoluiu para:

- minimo de 8 caracteres;
- pelo menos uma letra maiuscula;
- pelo menos um numero;
- pelo menos um simbolo.

Depois, a mesma regra foi replicada no backend, pois a validacao do servidor foi considerada mais importante para seguranca e integridade.

## 9. Estrategia de branches

Durante o desenvolvimento, foi definida uma estrategia simples:

- `main`: referencia mais estavel;
- `develop`: integracao principal de desenvolvimento;
- `feature/*`: branches de trabalho por tema.

Tambem foram enfrentados erros de fluxo Git:

- merge feito acidentalmente para `main`;
- necessidade de reverter ou reorganizar fluxo;
- retorno para `develop`;
- criacao de branches focadas para cada ajuste.

O projeto passou a trabalhar com PRs e merges para `develop`, mantendo as branches de feature para entregas especificas.

## 10. Tema claro e escuro

Foi identificada a necessidade de repensar a estrategia de cores para suportar modo claro e escuro de forma mais abstrata.

A solucao adotada:

- variaveis CSS de tema;
- alternancia manual entre claro e escuro;
- remocao da opcao "sistema", considerada pouco util para o usuario e mais custosa para manutencao;
- icone de tema no topo, proximo ao texto conceitual.

O texto do topo foi corrigido para:

`RECORDACAO ATIVA - REPETICAO ESPACADA - PRATICA INTERCALADA`

Com a ressalva de que a interface deve respeitar acentos e cedilhas nos textos exibidos ao usuario.

## 11. Sidebar retratil

Foi decidido tornar o menu lateral expansivel/retratil, com foco em liberar espaco no modo de estudo.

Decisoes:

- sidebar recolhida mostra apenas icones;
- sidebar expandida mostra icones e textos;
- tema, usuario e sair ficam no rodape da sidebar como bloco discreto;
- controle de expandir/retrair fica na divisoria entre menu e conteudo;
- "Modo caos" foi renomeado para "Pratica intercalada";
- tooltip para "Pratica intercalada" deixou de ser necessaria apos a renomeacao.

## 12. Biblioteca e paginacao

Foi identificado que listas de baralhos nao podem crescer infinitamente. A biblioteca passou por ajustes importantes:

- paginacao de baralhos publicos;
- paginacao de "Meus baralhos";
- aumento de seeds para testar paginacao;
- cards em grid;
- quatro cards por linha no desktop;
- seccoes com fundo levemente destacado;
- ordem ajustada entre "Meus baralhos" e outros agrupamentos;
- link "Carregar mais baralhos..." centralizado;
- troca de "cards" por "cartas";
- remocao de metadados ruidosos como "LearningFrame" nos cards publicos e "PUBLIC" nos locais.

Depois, a biblioteca foi redesenhada para usar abas internas:

- `Baralhos publicos`;
- `Meus baralhos`;
- inicialmente tambem `Baralhos locais`.

Mais tarde, com a revisao conceitual das importacoes APKG, `Baralhos locais` foi removido da Biblioteca.

## 13. Busca na biblioteca

A busca foi inicialmente pensada como busca por baralhos. Houve a duvida sobre buscar tambem por cartas.

Decisao atual:

- busca da biblioteca permanece focada em baralhos;
- busca por cartas ficou como pendencia futura, pois exige backend envolvendo `cards.front_html` e `cards.back_html`, com cuidado de performance e paginacao.

Na tela de importacao APKG, porem, a busca do seletor de cartas considera:

- numero da carta;
- texto da frente;
- texto do verso;
- tags;
- nomes de midia referenciados.

## 14. Importacoes locais e mudanca conceitual

Um dos maiores aprendizados do projeto veio da importacao APKG.

Inicialmente, APKG importado virava um rascunho local persistido em `localStorage`. Esse rascunho podia ser visualizado, editado e salvo depois. Com APKGs simples, isso parecia razoavel.

O problema surgiu com APKGs reais contendo muita midia, como o arquivo:

`C:\Users\lenon\Downloads\Anatomy_Practical_Lower_limb_muscles.apkg`

Esse arquivo tinha aproximadamente 101 MB e grande parte do conteudo era midia. Ficou claro que:

- nao era adequado guardar midia pesada no navegador;
- nao era honesto apresentar um baralho local incompleto como se fosse estudavel;
- apos refresh, o rascunho poderia sobreviver sem o arquivo original;
- isso confundia Biblioteca, Importar e Estudo.

A decisao final foi remover rascunhos locais APKG persistidos.

Novo modelo mental:

- Biblioteca lista baralhos prontos para uso.
- Importar analisa pacotes APKG.
- Estudo usa baralhos persistidos ou publicos.
- APKG anonimo e transitório enquanto o arquivo estiver selecionado.

## 15. Preview APKG com midia

Depois de remover o rascunho local, surgiu outro problema: uma previa que nao renderiza imagens ou audio nao ajuda o usuario a decidir se quer salvar o baralho.

Foi decidido que a tela Importar deveria permitir experimentar o pacote antes de salvar, sem persistir midia pesada.

Solucao adotada:

- o backend continua gerando o preview sem persistir;
- o frontend le o APKG selecionado em memoria;
- um indice ZIP minimo local interpreta o arquivo `media` do APKG;
- imagens e audios sao carregados sob demanda por `objectURL`;
- apenas a carta/lado atual carrega midia;
- URLs temporarias sao revogadas para evitar vazamento de memoria;
- nada e salvo em `localStorage`;
- nenhuma sessao temporaria backend e criada.

A UI da importacao passou a ter:

- visualizador de uma carta por vez;
- anterior/proxima;
- clique para virar frente/verso;
- botao explicito para ver frente/verso;
- seletor pesquisavel de cartas com rolagem;
- busca por numero, frente, verso, tags e midias;
- mensagem de salvamento: "Preparando seu baralho com midia...";
- icone circular animado durante processamento.

Tambem foi corrigida uma piscada ao alternar frente/verso: a midia passou a ser preparada antes de trocar o conteudo visivel.

## 16. Midia persistida no backend

Para baralhos salvos por usuario logado, a midia do APKG deve ser persistida e servida sob demanda.

Implementacoes relevantes:

- tabela `media_assets`;
- endpoint `/api/decks/{deckId}/media/{fileName}`;
- autorizacao para midia privada;
- token em query string para permitir carregamento por `<img>` e `<audio>`;
- suporte a nomes de arquivo com espacos e caracteres especiais;
- transformacao de sintaxe `[sound:arquivo.mp3]` em audio HTML;
- sanitizacao reforcada para remover scripts, handlers `on*`, `javascript:` e `srcdoc`;
- CSS para imagens e audios no modo estudo.

Foi criado indice em `media_assets` para busca por `(deck_id, file_name)`.

## 17. Demora ao salvar APKG

Foi percebida demora ao salvar APKGs grandes em "Meus baralhos".

Analise feita:

- o arquivo de teste tem cerca de 101 MB;
- o preview envia o APKG uma vez para o backend;
- a previa visual tambem le o APKG no cliente;
- ao salvar, o APKG e enviado novamente;
- o backend extrai SQLite, le midias e persiste BLOBs no MySQL;
- isso e um custo real da decisao de nao criar sessao temporaria backend.

Foi decidido nao prometer porcentagem real no curto prazo, pois progresso completo exigiria job assíncrono, polling, SSE ou WebSocket.

Melhoria adotada:

- feedback textual mais humano: "Preparando seu baralho com midia...";
- icone animado;
- apos salvar, recarregar apenas "Meus baralhos" e estatisticas, nao toda a aplicacao;
- destacar visualmente o baralho salvo.

## 18. Destaque do baralho salvo

Para ajudar o usuario a encontrar o baralho recem-importado, foi implementado destaque no card salvo em "Meus baralhos".

Ajustes feitos:

- ir para `Biblioteca > Meus baralhos`;
- esperar o DOM renderizar;
- rolar o card para o centro;
- aplicar destaque animado;
- aumentar a duracao para 10 segundos;
- usar cores mais vivas para validacao visual.

## 19. Estado atual das funcionalidades

Implementado:

- Docker Compose para subir banco, backend e frontend.
- Backend Java 21/Spring Boot.
- Frontend Vue 3/Vite/TypeScript.
- Autenticacao JWT.
- Validacao de senha forte no frontend e backend.
- Biblioteca com baralhos publicos e meus baralhos.
- Paginacao.
- Busca por baralhos.
- Estudo de baralho unico.
- Pratica intercalada.
- SRS simplificado.
- Estatisticas essenciais.
- Modo claro/escuro.
- Sidebar retratil.
- Importacao APKG persistida com midia.
- Preview APKG carta-a-carta com midia transitória.
- Notificacoes simples fechaveis.
- Destaque do baralho salvo.

## 20. Pendencias ja decididas

Prioridade atual:

1. Edicao e exclusao de "Meus baralhos" na Biblioteca.

Detalhamento esperado:

- editar titulo;
- editar descricao;
- editar visibilidade;
- excluir com confirmacao;
- mostrar acoes apenas em baralhos do usuario;
- evitar poluir os cards publicos;
- provavelmente usar menu de acoes no card.

Outras pendencias decididas:

- gerenciamento melhor de cartas dentro de baralhos proprios;
- compartilhamento/salvar para si baralhos publicos;
- favoritar baralhos publicos como relacao leve, sem duplicar conteudo, para uma etapa futura;
- publicar/despublicar baralhos;
- busca por conteudo de cartas no backend;
- sistema de notificacoes mais estruturado;
- lembretes de horario de estudo;
- modo de estudo com leitura das cartas ativas;
- instrumentacao de tempos da importacao APKG no backend;
- estatisticas avancadas apenas como roadmap.

## 21. Decisoes de escopo ainda preservadas

Continuam fora do MVP imediato:

- dashboard estatistico complexo;
- cloze avancado;
- templates completos do Anki;
- preservar agenda original do Anki;
- `.colpkg`;
- IndexedDB para midia;
- sessao temporaria backend para APKG anonimo;
- CDN ou object storage;
- marketplace de baralhos;
- colaboracao multiusuario.

## 22. Observacoes de processo

O projeto evoluiu em ciclos curtos:

- discutir problema;
- escolher uma opcao;
- implementar em branch;
- validar no navegador;
- ajustar UX;
- commitar com Conventional Commits;
- abrir/mergear PR;
- voltar para `develop`;
- criar nova branch.

Tambem ficou estabelecido que commits, descricoes de testes e comunicacao tecnica do projeto devem estar em portugues.

## 23. Situacao atual do repositorio

No momento deste diario, a branch de trabalho preparada para o proximo tema e:

`feature/library-deck-management`

Ela foi criada a partir de `develop` atualizada apos o merge da branch de importacao APKG.

O proximo trabalho planejado e implementar edicao e exclusao de baralhos em "Meus baralhos".

## 24. Gerenciamento de Baralhos e UX de Edicao (Em Andamento)

Aprofundando a usabilidade da biblioteca, chegamos a algumas decisoes centrais de arquitetura de UX:
- **Gerenciamento Contextual:** Ao inves de navegar para outras abas para criar/editar um baralho, as acoes vao ocorrer dentro da aba de Biblioteca atraves de trocas de conteudo (content swap).
- **Modo Overlay para Edicao de Cartas:** Devido aos planos futuros ambiciosos de incorporar editores de diagramas e canvas ricos, decidimos que o modo de criacao/edicao de cartas ocorrera num *Overlay dedicado* sobre a area de conteudo, em formato "split view" (codigo de um lado, preview ao vivo do outro). Isso fornece o espaco necessario que um modal simples nao comportaria.
- **Midia Independente:** Ajustamos o fluxo para que o upload de imagens/audios seja independente. Inserimos as referencias direto no HTML (Markdown) da carta, compatibilizando com as decisoes anteriores.

**Progresso no Backend (Commit Local):**
Para suportar o plano acima, um primeiro commit ja foi gerado localmente contendo as infraestruturas necessarias na API:
- Endpoint novo `POST /api/decks/{deckId}/media` adicionado no `MediaController`, responsavel por receber a midia, sanitizar o arquivo, identificar seu Content-Type adequadamente e vincular ao baralho do usuario.
- A classe de dominio `MediaAsset` ganhou um novo metodo `updateContent()` para facilitar a sobrescrita caso um upload com mesmo nome aconteca.
- Novo contrato `MediaUploadResponse` definido em `DeckDtos.java`.

**Progresso no Frontend (Commit Local):**
A primeira implementacao da UX planejada foi adicionada no Vue:
- A Biblioteca agora possui uma troca de conteudo para `Meus baralhos`, permitindo entrar em uma view de gerenciamento contextual sem criar rota ou aba principal nova.
- Os cards de "Meus baralhos" ganharam a acao `Gerenciar`, mantendo os cards publicos limpos e focados em estudo.
- A view de gerenciamento permite editar titulo, descricao e visibilidade do baralho, excluir o baralho com confirmacao, listar cartas e remover cartas individuais.
- A criacao e edicao de cartas foram movidas para um overlay dedicado com editor bruto de frente/verso, campo de tags e preview ao vivo com `safeStudyHtml()`.
- O upload independente de imagem/audio foi conectado ao novo endpoint `POST /api/decks/{deckId}/media`; ao concluir, o editor injeta `<img src="arquivo">` ou `[sound:arquivo]` no campo ativo.
- A aba `Criar` voltou a cumprir apenas a funcao de criacao macro de baralho. Apos criar um baralho, o usuario e levado diretamente para a view de gerenciamento para adicionar cartas.
- A camada `api.ts` passou a expor `updateDeck`, `deleteDeck`, `updateCard`, `deleteCard` e `uploadMedia`.

**Ajuste de Execucao em Container:**
Foi identificado que o frontend servido por Nginx em container nao reflete alteracoes locais apenas com refresh, pois consome o `dist` gerado no build da imagem. Para preservar o fluxo containerizado e ainda acelerar validacao local, foi criado `docker-compose.dev.yml`:
- O servico `frontend` monta `./frontend/dist` em `/usr/share/nginx/html`.
- O servico `frontend-builder` roda `npm run build -- --watch` dentro de um container Node.
- Assim, alteracoes no frontend recompilam o `dist` local e o navegador pode ser recarregado em `http://localhost:8080`.

Tambem foi corrigido o endpoint de API do modo dev para `http://127.0.0.1:8081`, pois `localhost:8081` podia resolver via IPv6 e ficar pendurado no ambiente local. O CORS do Compose passou a aceitar `http://localhost:8080` e `http://127.0.0.1:8080`.

**Validacoes executadas:**
- `npm test`: 16 testes do frontend passando.
- `npm run build`: build do frontend passando.
- `mvn test` via container Maven: 16 testes do backend passando.
- `GET http://127.0.0.1:8081/api/decks/public`: 200.
- `POST /api/auth/login` com credenciais invalidas: 401 rapido, confirmando que o backend responde.

**Proximo passo real:**
Amanha, a prioridade e fazer teste manual no navegador pelo fluxo containerizado em `http://localhost:8080`, validando login, biblioteca, gerenciamento de baralhos, criacao/edicao/exclusao de cartas, upload de midia e preview. Depois disso, corrigir eventuais problemas de UX ou integracao antes de abrir PR.

## 25. Biblioteca de Cartas Paginada e Copia de Baralhos Publicos

O gerenciamento de cartas foi ajustado para nao renderizar todas as cartas de um baralho de uma vez. A decisao foi usar um modelo hibrido:
- lista paginada com busca por frente, verso e tags;
- link de "Carregar mais" para ampliar o lote atual;
- selecao independente da carta em preview;
- selecao multipla para exclusao em lote;
- preview/edicao da carta ativa em painel separado.

No backend, isso gerou os contratos:
- `GET /api/decks/{deckId}/cards?page&size&q`;
- `POST /api/decks/{deckId}/cards/bulk-delete`.

Tambem foi adicionada a acao "Salvar para mim" nos cards de baralhos publicos. A implementacao copia o baralho publico para uma nova copia privada em "Meus baralhos", incluindo cartas, tags e midias. A escolha por copia privada evita edicao acidental do original e preserva um caminho simples para o usuario adaptar o material.

Ideia preservada para depois: "Favoritar" deve ser tratado como uma relacao leve com o baralho publico original, sem duplicar cartas nem midias. Isso serviria para descoberta, retorno rapido e organizacao pessoal, enquanto "Salvar para mim" continua significando copia editavel.

## 26. Fechamento do PR de Biblioteca

O PR de gerenciamento de biblioteca foi mergeado em `develop` e a branch local foi atualizada por fast-forward.

Implementacoes consolidadas:
- gerenciamento contextual de baralhos em `Biblioteca > Meus baralhos`;
- edicao de metadados, exclusao de baralhos, criacao/edicao/exclusao de cartas;
- upload independente de imagem/audio para cartas persistidas;
- lista paginada e buscavel de cartas no modo de gerenciamento;
- selecao multipla e exclusao em lote de cartas;
- preview da carta ativa em painel separado;
- acao "Salvar para mim" em baralhos publicos, criando copia privada editavel;
- ajuste visual para uniformizar a altura dos cards em "Baralhos publicos" e "Meus baralhos";
- fluxo containerizado de desenvolvimento com `docker-compose.dev.yml` e build frontend em watch.

Decisoes preservadas:
- "Salvar para mim" significa copiar o baralho publico para uma copia privada do usuario.
- "Favoritar" fica para uma etapa futura como vinculo leve com o baralho original, sem duplicar cartas ou midias.
- A gerencia de cartas deve evitar renderizar todos os registros de uma vez; busca e paginacao sao parte do contrato da tela.
- O editor de cartas permanece em overlay, por ser mais adequado para evoluir para ferramentas ricas de midia/diagramas.

## 27. Alerta Arquitetural: Frontend Monolitico

Com a conclusao do gerenciamento de biblioteca, ficou evidente que o `App.vue` concentrou responsabilidades demais: roteamento interno por abas, autenticacao, biblioteca, estudo, importacao APKG, gerenciamento de baralhos, editor de cartas, preview, notificacoes e integracao com API. Isso aumenta custo de leitura, risco de regressao e dificuldade para testar fluxos isolados.

Como estamos na reta final do MVP, a recomendacao nao e reescrever a aplicacao nem introduzir arquitetura pesada agora. A melhor estrategia e uma decomposicao incremental, guiada por dor real:

1. **Extrair componentes por superficie de UI.**
   Separar telas e blocos grandes em componentes Vue: `LibraryView`, `DeckList`, `DeckManagementView`, `CardEditorOverlay`, `StudyView`, `ImportView`, `CreateDeckView`, `AuthView` e `ProgressView`. Mantem o comportamento atual, mas reduz o arquivo central.

2. **Extrair composables por dominio de estado.**
   Mover logica reativa para composables como `useAuth`, `useDeckLibrary`, `useDeckManagement`, `useStudySession`, `useApkgImport`, `useNotifications` e `useTheme`. Isso preserva Vue puro, sem obrigar dependencia nova.

3. **Manter `api.ts` como fronteira de infraestrutura.**
   A camada de API ja e um bom ponto de separacao. O proximo ganho e garantir que componentes e composables consumam funcoes de dominio, evitando espalhar detalhes de endpoint pelo UI.

4. **Adiar store global formal ate haver necessidade clara.**
   Pinia pode ser util, mas neste momento pode aumentar trabalho sem resolver a dor principal. Primeiro separar componentes/composables; depois avaliar se autenticacao, notificacoes e biblioteca precisam de store compartilhada.

5. **Evitar microfrontends, rewrite ou router complexo neste MVP.**
   Essas opcoes resolvem problemas de escala maior, mas custariam foco, testes e tempo. Para o MVP, modularizar internamente e suficiente.

Plano sugerido:
- criar uma branch propria para refatoracao estrutural;
- mover primeiro componentes de baixo risco, sem alterar comportamento;
- validar build/testes a cada fatia;
- so depois mexer nos composables de estado;
- manter commits pequenos e convencionais, separando refactors de features.

## 28. Planejamento Fino de Roteamento, Componentizacao e Memoria

Apos a primeira proposta de refatoracao, foi decidido aprofundar o planejamento antes de iniciar implementacao. A preocupacao central deixou de ser apenas "quebrar o `App.vue`" e passou a incluir:
- quais fluxos realmente merecem rota propria;
- quais estados sao apenas internos de tela;
- quais dados pesados precisam ciclo de vida e descarte explicito;
- quais contratos de backend precisam existir para suportar refresh direto em rotas profundas;
- como manter rastreabilidade por branches pequenas.

Foi criado o documento `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`, que passa a ser a referencia da frente arquitetural.

Principais decisoes do planejamento:
- usar rotas reais para Biblioteca, Meus baralhos, Gerenciamento de baralho, Estudo, Importacao, Criacao, Progresso, Login e Cadastro;
- manter editor de carta, carta selecionada, paginacao carregada e preview APKG como estados internos, nao rotas, neste MVP;
- adicionar um endpoint leve de metadata/resumo de baralho antes de habilitar rota direta de gerenciamento;
- preservar `GET /api/decks/{deckId}` no curto prazo para estudo publico anonimo, mesmo sendo um detalhe completo;
- nao introduzir `/api/v1`, microfrontends, rewrite ou Pinia neste momento;
- componentizar por superficies de tela antes de extrair composables;
- tratar memoria pesada explicitamente, especialmente APKG, object URLs, fila de estudo, cache anonimo de baralhos publicos e requests de busca.

Com esse refinamento, os momentos iniciais foram reescritos:

1. Primeiro vem o contrato de backend para rotas diretas (`GET /api/decks/{deckId}/metadata` ou equivalente).
2. Depois entra o `vue-router` como fonte de verdade para a navegacao principal.
3. Em seguida, `App.vue` vira shell e as paginas principais sao extraidas.
4. A Biblioteca e quebrada em modulo proprio.
5. Importacao e Estudo sao extraidos em modulos.
6. Composables de dominio sao criados.
7. Por fim, a politica fina de ciclo de vida e memoria e aplicada.

Essa ordem foi escolhida para evitar big bang e manter cada branch revisavel com objetivo arquitetural claro.

## 29. Branch Intermediaria Para a Refatoracao Frontend

Como a frente de roteamento, componentizacao e ciclo de vida sera longa e composta por varias etapas, foi decidido usar uma branch intermediaria de integracao chamada `frontend-refactor`.

Fluxo decidido:
- `frontend-refactor` sera criada a partir de `develop` atualizada;
- cada momento da refatoracao nascera de `frontend-refactor`;
- os PRs de implementacao serao mergeados em `frontend-refactor`, nao diretamente em `develop`;
- apos cada merge em `frontend-refactor`, a aplicacao deve ser validada no container;
- quando todas as etapas estiverem integradas e estaveis, sera aberto um PR final de `frontend-refactor` para `develop`.

Motivos:
- evitar que `develop` receba estados intermediarios de uma refatoracao estrutural;
- permitir PRs pequenos e revisaveis sem exigir que cada fatia isolada represente a arquitetura final;
- preservar historico atomico das decisoes;
- reduzir o risco de uma refatoracao grande bloquear outras correcoes;
- criar uma area explicita de estabilizacao antes da promocao para a branch principal de desenvolvimento.

Cuidados:
- manter `frontend-refactor` sincronizada com `develop` caso hotfixes ou ajustes paralelos sejam mergeados;
- evitar features de produto dentro dessa branch que nao estejam relacionadas a roteamento, componentizacao ou memoria;
- validar build, testes e fluxo manual apos cada etapa;
- usar commits Conventional Commits e descricoes de PR claras para cada momento.

Com essa decisao, a ordem operacional passa a ser:

1. concluir e versionar o planejamento arquitetural;
2. criar `frontend-refactor` a partir de `develop`;
3. abrir branches curtas a partir de `frontend-refactor`;
4. integrar cada momento em `frontend-refactor`;
5. validar a aplicacao integrada;
6. promover `frontend-refactor` para `develop` apenas quando a frente estiver completa.

## 30. Momento 1: Contrato Leve de Metadata de Baralho

Apos o merge do planejamento, `develop` foi atualizada localmente por fast-forward. Em seguida, foi criada e publicada a branch intermediaria `frontend-refactor`, que passa a ser a base de integracao da frente de roteamento, componentizacao e memoria.

A branch `codex/backend-deck-route-contracts` foi criada a partir de `frontend-refactor` para o Momento 1.

Implementacao realizada:
- novo endpoint `GET /api/decks/{deckId}/metadata`;
- retorno reaproveitando `DeckSummary`, sem lista de cartas;
- resolucao por `findAccessible`, permitindo metadata anonima apenas para baralhos publicos e preservando isolamento de baralhos privados;
- regra de seguranca explicita para permitir `GET /api/decks/*/metadata`;
- wrapper `deckMetadata(deckId)` em `frontend/src/services/api.ts`;
- testes de servico cobrindo metadata leve, metadata publica anonima e bloqueio de baralho inacessivel;
- teste de controller cobrindo delegacao do contrato ao servico.

Decisoes:
- nao criar DTO novo enquanto `DeckSummary` cobre o contrato sem carregar cartas;
- nao alterar `GET /api/decks/{deckId}`, pois ele ainda atende estudo publico anonimo no curto prazo;
- nao mover endpoints de cartas para controller separado neste momento, mantendo o escopo do Momento 1 pequeno;
- manter a rota direta de gerenciamento dependente de metadata leve e listagem paginada de cartas.

Validacoes:
- testes focados de backend via container Maven: `DeckServiceTest` e `DeckControllerTest`;
- build do frontend via container Node, validando `vue-tsc` e `vite build`.

## 31. Planejamento Fino do Momento 2

Apos o merge do Momento 1, a branch `frontend-refactor` foi atualizada localmente por fast-forward e recebeu o contrato leve de metadata de baralho. Em seguida, foi criada a branch `codex/frontend-router-foundation` a partir dela.

Foi feita uma investigacao fina do estado atual do frontend antes da implementacao do roteamento:
- `App.vue` segue como arquivo monolitico, concentrando navegacao, layout, telas, estado e fluxos;
- `main.ts` ainda monta apenas `App`, sem router;
- `package.json` ainda nao possui `vue-router`;
- `nginx.conf` ja possui fallback SPA adequado para history mode;
- a navegacao principal ainda depende de `tab`, `librarySection`, `libraryView` e `authMode`;
- o Momento 1 ja disponibilizou `api.deckMetadata(deckId)`, necessario para a rota direta de gerenciamento.

Foi criado o documento `docs/plano-momento-2-roteamento-frontend.md`, detalhando:
- estado atual confirmado;
- mapa de rotas do Momento 2;
- substituicoes planejadas para `tab`, `librarySection`, `libraryView`, `authMode` e `currentTitle`;
- novos elementos tecnicos (`vue-router`, `router/index.ts`, route meta, guard de auth);
- funcoes atuais afetadas por navegacao roteada;
- lateralidades em backend, container, build, testes, UX e memoria;
- estrategia de implementacao em passos pequenos;
- criterios de aceite e riscos.

Decisao mantida:
- o Momento 2 deve introduzir o router como fonte de verdade da navegacao principal, mas nao deve ainda extrair todas as paginas nem criar store global. A componentizacao pesada fica para os momentos seguintes.

## 32. Implementacao do Momento 2: Router Principal

O Momento 2 foi implementado na branch `codex/frontend-router-foundation`, mantendo `frontend-refactor` como destino do PR.

Implementacoes:
- instalacao de `vue-router`;
- criacao de `frontend/src/router/index.ts`;
- registro do router em `frontend/src/main.ts`;
- rotas reais para biblioteca publica, meus baralhos, gerenciamento de baralho, estudo, estudo por baralho, pratica intercalada, importacao, criacao, progresso, login e cadastro;
- guard simples de autenticacao baseado no token local;
- redirect de rotas privadas para `/entrar?redirect=<rota-original>`;
- catch-all redirecionando rotas desconhecidas para `/biblioteca/publicos`;
- sidebar convertida para links roteados com `RouterLink custom`;
- `tab`, `librarySection`, `libraryView` e `authMode` passaram a ser derivados da rota;
- workflows principais passaram a navegar por `router.push`/`router.replace`;
- rota direta de gerenciamento passou a carregar metadata via `api.deckMetadata(deckId)` e cartas via `api.deckCards`;
- estudo por deck passou a ser carregado por rota, mantendo estudo anonimo com detalhe completo apenas quando necessario;
- rota de pratica intercalada passou a carregar a fila tambem em refresh direto.

Decisoes preservadas:
- nao extrair paginas ainda;
- nao criar store global;
- nao transformar busca, paginacao, selecao multipla, editor de carta ou preview APKG em rotas;
- nao mexer no Nginx, pois o fallback SPA ja estava configurado;
- nao aplicar `npm audit fix --force`, apesar do alerta critico do npm, para evitar mudancas de dependencia fora do escopo.

Validacoes:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando.

## 33. Ajuste de Rotulo Para Cartas Sem Texto

Durante a validacao manual do gerenciamento de cartas, foi identificado que cartas compostas apenas por midia ou HTML sem texto extraivel apareciam como "Carta sem texto". Isso era correto tecnicamente, mas ruim para uso repetido, pois varias cartas ficavam com o mesmo rotulo.

Decisao:
- no gerenciamento de cartas, o fallback passa a usar a ordem visivel/carregada: `Carta 1`, `Carta 2`, etc.;
- o comportamento fica alinhado ao preview de importacao APKG, que ja usava numeracao quando nao havia texto na carta;
- a busca, a selecao multipla, a edicao e a exclusao nao mudam de contrato.

Validacoes:
- testes frontend em container Node com Vitest: 16 testes passando;
- build frontend em container Node com `vue-tsc` e `vite build`.
