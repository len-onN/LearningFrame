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
- testes frontend em container Node com Vitest: 16 testes passando;
- frontend containerizado respondendo `200` em `/biblioteca/publicos` e `/importar`;
- backend respondendo `200` em `GET /api/decks/public` via `127.0.0.1:8081`.

## 38. Planejamento Fino do Momento 4B

Apos o merge do Momento 4A, `frontend-refactor` foi atualizada localmente por fast-forward. Foi criada a branch unica `codex/frontend-card-editor-overlay`, que deve conter tanto o planejamento quanto a futura implementacao do proximo passo.

Estado atual:
- `App.vue` esta com cerca de 1602 linhas;
- Biblioteca e Importacao ja foram extraidas;
- o `CardEditorOverlay` segue como ultimo grande bloco visual dentro do `App.vue`;
- o editor ainda concentra refs de textarea/input, foco inicial, upload de midia, insercao no cursor, dirty state e preview sanitizado.

Foi criado o documento `docs/plano-momento-4b-editor-cartas.md`, detalhando:
- objetivo da extracao do editor;
- fronteira entre responsabilidades locais de UI/DOM e responsabilidades de orquestracao/API;
- proposta de `CardEditorOverlay.vue` e `cardEditorTypes.ts`;
- contrato por props, `v-model`, eventos e callback controlado de upload;
- preservacao do dirty confirmation no pai;
- preservacao de preview sanitizado no pai;
- lateralidades com Biblioteca, API, memoria, UX, acessibilidade, CSS, seguranca, testes e container;
- criterios de aceite e riscos principais.

Decisao proposta:
- mover para o componente apenas DOM, foco, cursor, input de arquivo e layout visual;
- manter no `App.vue` salvar/criar/atualizar, dirty state, notificacoes e chamadas API;
- usar callback `uploadMedia(file, kind): Promise<string>` para permitir que o componente insira o marcador no cursor sem importar `api.ts`;
- nao alterar backend, rotas, CSS global, UX visual, WYSIWYG ou politica de midias orfas nesta fatia.

## 39. Implementacao do Momento 4B: Editor de Cartas

Apos o commit local do planejamento, a extracao do editor foi implementada na mesma branch `codex/frontend-card-editor-overlay`.

Implementacoes:
- criado `frontend/src/features/library/cardEditorTypes.ts` com os tipos do editor;
- criado `frontend/src/features/library/CardEditorOverlay.vue`;
- o componente passou a concentrar layout do overlay, foco inicial, refs de textarea, input de arquivo, face ativa, tipo de midia, upload em andamento e insercao do marcador no cursor;
- `App.vue` manteve a orquestracao de criar/editar/salvar carta, dirty state, preview sanitizado, notificacoes e chamadas API;
- o upload de midia passou a usar callback controlado `uploadCardEditorMedia(file, kind)`, sem importar `api.ts` no componente;
- removidos do `App.vue` os refs e helpers locais de DOM/cursor do editor;
- `App.vue` caiu para cerca de 1488 linhas.

Decisoes preservadas:
- nao alterar backend, rotas ou estilos globais;
- nao criar store global nem composable de dominio ainda;
- nao alterar UX visual do editor;
- nao resolver midias orfas nesta fatia;
- manter dirty confirmation no pai.

Validacoes:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando.

## 45. Implementacao Parcial do Momento 7: Rotas Reais e Ciclo de Vida

Na branch `codex/frontend-moment-7-route-lifecycle`, foi iniciada a implementacao do Momento 7 a partir do plano de rotas reais e ciclo de vida por tela.

Implementacoes:
- criado `frontend/src/routes/routeContext.ts` com contextos tipados por superficie de rota;
- criados route adapters reais em `frontend/src/routes/`: `AuthRoute`, `LibraryRoute`, `StudyRoute`, `ImportRoute`, `CreateDeckRoute` e `ProgressRoute`;
- o router deixou de usar o `RouteSurface` vazio e passou a apontar cada rota para seu componente real;
- `App.vue` passou a renderizar `<RouterView />` dentro do `AppShell`, mantendo os workflows e estados de dominio no integrador por enquanto;
- as paginas visuais existentes continuaram controladas por props/eventos, sem mover chamadas API para `pages/`;
- a sincronizacao inicial de Biblioteca, Estudo e Progresso passou a ser acionada pelos route adapters;
- ao sair da Biblioteca, o gerenciamento contextual e a selecao de baralhos sao limpos;
- ao sair das rotas de Estudo, a fila e a resposta visivel sao descartadas;
- o cache anonimo de baralhos publicos usados no estudo passou a ter limite LRU simples de 6 baralhos;
- o preview APKG ganhou controle de sequencia para evitar que uma resposta antiga sobrescreva o arquivo selecionado mais recentemente.

Decisoes preservadas:
- nao criar Pinia/store global;
- nao mover os workflows de API para os componentes visuais;
- manter `CardEditorOverlay` no `App.vue` nesta fatia;
- nao alterar backend, endpoints nem CSS.

Validacoes:
- testes frontend com Vitest: 33 testes passando;
- build frontend com `vue-tsc` e `vite build` passando.

## 46. Planejamento do Momento 8: Testes E2E com Banco Dedicado

Apos a implementacao parcial do Momento 7, foi decidido planejar uma etapa propria de testes end-to-end. A motivacao e que rotas reais, guards de autenticacao, limpeza de estado, importacao APKG, estudo e gerenciamento de baralhos dependem de interacoes entre navegador, frontend, backend e banco que nao sao totalmente cobertas por testes unitarios.

Decisao:
- criar o Momento 8 apos o Momento 7;
- usar Playwright como ferramenta e2e;
- criar um MySQL dedicado para testes, separado do banco dev;
- subir e descer o ambiente e2e automaticamente durante a execucao da suite;
- usar Compose proprio, portas proprias e volume descartavel;
- adicionar reset/seed deterministico para que cada teste comece previsivel;
- cobrir primeiro smoke, autenticacao/redirect, criacao e gerenciamento de baralho, cartas, estudo, importacao APKG pequena e progresso.

Documento criado:
- `docs/plano-momento-8-testes-e2e.md`.

Tambem foram atualizados:
- `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`, encaixando o Momento 8 antes da validacao final da branch `frontend-refactor`;
- `docs/plano-momento-7-rotas-ciclo-de-vida.md`, registrando a ponte entre validacao manual do Momento 7 e a futura suite e2e.

## 47. Implementacao do Momento 8: Testes E2E com Banco Dedicado

Na branch `codex/e2e-dedicated-db`, foi implementada a primeira suite end-to-end com Playwright e ambiente Compose isolado.

Implementacoes:
- criado `docker-compose.e2e.yml` com `db-e2e`, `backend-e2e` e `frontend-e2e`;
- o banco e2e usa MySQL dedicado, credenciais proprias, porta `3317`, volume proprio e remocao com `down -v`;
- o backend e2e sobe em `18081` com `SPRING_PROFILES_ACTIVE=e2e`;
- o frontend e2e sobe em `18080` e recebe `VITE_API_BASE_URL` no build da imagem;
- criado `package.json` raiz com `npm test`, `npm run build`, `npm run e2e`, `npm run e2e:up`, `npm run e2e:test` e `npm run e2e:down`;
- criado script `scripts/e2e/run-e2e.mjs` para subir, aguardar readiness, executar Playwright e derrubar o ambiente em `finally`;
- adicionado profile `e2e` no backend com endpoint interno `POST /api/e2e/reset`;
- o reset e2e e protegido por `X-E2E-Token` e `E2E_RESET_TOKEN`;
- o seed e2e cria usuarios, baralhos publicos e privados, cartas, tags e estados de revisao previsiveis;
- adicionada fixture APKG pequena real para exercitar preview, preservacao durante login, persistencia e limpeza de estado ao sair da rota;
- adicionados nomes acessiveis em campos sem label estavel para favorecer testes por `getByLabel`;
- o Vitest passou a ignorar `frontend/e2e/**`.

Suite inicial:
- smoke da Biblioteca publica;
- redirect de rota privada para login e retorno;
- login/logout com limpeza de dados privados;
- criacao de baralho com navegacao para gerenciamento;
- criacao, edicao e exclusao basica de carta;
- estudo anonimo de baralho publico;
- estudo autenticado com atualizacao de progresso;
- importacao APKG pequena com preservacao ao login e limpeza ao sair da importacao.

Validacoes:
- `npm test`: 33 testes passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium, com Compose e2e subindo e derrubando o volume do MySQL ao final.

## 44. Exclusao Multipla de Baralhos e Refinamento de Selecao

Na branch `codex/frontend-domain-composables-plan`, a fatia em andamento do Momento 6 recebeu uma feature transversal para resolver a exclusao de varios baralhos em `Meus baralhos`, preservando o modelo de listas paginadas e evitando carregar conteudo desnecessario em memoria.

Implementacoes:
- criado o contrato backend `POST /api/decks/bulk-delete`, com payload `{ deckIds }`, limite de ate 100 ids e resposta `204`;
- adicionada validacao transacional de ownership no backend: se algum baralho selecionado nao existir ou nao pertencer ao usuario autenticado, a operacao falha antes de excluir qualquer item;
- adicionada consulta `findOwnedByIds` no repositorio de decks para buscar apenas baralhos do usuario logado;
- criado wrapper `api.deleteDecks()` no frontend;
- expandido `useDeckLibrary` para controlar selecao de `Meus baralhos` com `selectedMyDeckIds`, contagem, selecao dos itens visiveis, limpeza e modo de selecao;
- integrada toolbar contextual na Biblioteca com `Selecionar`, `Selecionar visiveis`, `Limpar` e `Excluir`, mantendo confirmacao antes da remocao;
- adicionado botao flutuante de voltar ao topo da Biblioteca como apoio ao fluxo de listas paginadas com `Carregar mais`;
- refinado `DeckListPanel` para que, no modo selecao, o card inteiro seja selecionavel por clique e teclado, enquanto botoes internos de acao ficam desativados para evitar execucoes acidentais.

Decisoes:
- a selecao multipla fica restrita a `Meus baralhos`; baralhos publicos continuam com acoes de estudar e salvar;
- a acao em lote atua apenas sobre itens carregados/visiveis, sem semantica de "selecionar todos os resultados da busca";
- a toolbar contextual fica sticky durante o modo selecao para evitar que a acao de exclusao se perca quando a lista crescer;
- o backend mantem a exclusao em lote como endpoint proprio, sem alterar o contrato unitario `DELETE /api/decks/{deckId}`.

Validacoes:
- testes frontend com Vitest: 33 testes passando;
- build frontend com `vue-tsc` e `vite build`;
- testes backend em container Maven/Java 21: 27 testes passando;
- containers reconstruidos e reiniciados via Docker Compose;
- backend respondendo `200` em `GET /api/decks/public`;
- frontend respondendo `200` em `http://127.0.0.1:8080/`.

## 40. Bugfix: Ciclo de Vida de Notificacoes

Durante a validacao do gerenciamento de baralhos, foi identificado que a notificacao de exclusao permanecia visivel mesmo apos trocar de pagina. A investigacao mostrou que `notice/error` eram globais no `App.vue`, sem uma politica explicita de ciclo de vida por rota, e que a exclusao chamava navegacao sem aguardar a conclusao antes de exibir a mensagem.

Implementacoes:
- criado controle leve de lifetime para feedbacks: `route`, `next-route` e `sticky`;
- adicionados helpers `showNotice`, `showError`, `clearFeedback` e limpeza de feedback ao trocar de rota;
- cargas disparadas pelo roteamento passaram a preservar feedback existente, evitando apagar mensagens recem-criadas no destino;
- fluxos de login, logout, copia de baralho publico, importacao APKG, criacao/atualizacao/exclusao de baralhos e edicao/exclusao de cartas passaram a usar os helpers;
- `closeManagedDeck` passou a aguardar a navegacao quando ela e solicitada, removendo a corrida observada na exclusao de baralho.

Decisoes:
- manter a solucao no `App.vue` enquanto notificacoes ainda nao foram extraidas para composable/store;
- nao introduzir biblioteca de toast nesta etapa;
- tratar mensagens comuns como route-scoped por padrao, limpando-as na proxima navegacao.

## 41. Implementacao do Momento 5: Composables de Infraestrutura

Apos atualizar `frontend-refactor`, foi criada a branch `codex/frontend-next-refactor-plan` para planejar e implementar a proxima fatia da refatoracao.

Implementacoes:
- criado `docs/plano-momento-5-composables-infraestrutura.md`;
- criado `frontend/src/composables/useFeedback.ts` para centralizar `notice`, `error`, `loading`, lifetime e `withFeedback`;
- criado `frontend/src/composables/useTheme.ts` para concentrar preferencia de tema, persistencia e aplicacao no documento;
- criado `frontend/src/composables/useAuthSession.ts` para leitura, persistencia e limpeza da sessao local;
- `App.vue` passou a consumir esses composables, preservando os workflows de dominio ainda no componente raiz;
- adicionados testes unitarios para o ciclo de vida das notificacoes em `useFeedback.test.ts`.

Decisoes:
- nao transformar o router em `RouterView` real nesta etapa;
- nao mover Biblioteca, Importacao, Estudo ou Gerenciamento para composables de dominio ainda;
- manter a assinatura nova de `withFeedback` com opcoes explicitas, preservando compatibilidade booleana temporaria no composable.

## 42. Planejamento Fino do Momento 6: Composables de Dominio

Apos o merge do Momento 5, a branch `frontend-refactor` foi atualizada localmente por fast-forward e foi criada a branch `codex/frontend-domain-composables-plan` para planejar a proxima etapa da refatoracao.

Foi criado o documento `docs/plano-momento-6-composables-dominio.md`, detalhando:
- estado atual do `App.vue` apos infraestrutura global extraida;
- proposta de composables de dominio por feature: Biblioteca, Gerenciamento, Importacao APKG, Estudo e Auth Flow;
- decisao de nao trocar `RouteSurface` por `RouterView` real ainda;
- fronteiras de dependencia entre dominio, router, auth, feedback, stats, memoria e API;
- lateralidades de UX, performance, memoria, testes e validacao manual;
- matriz explicita de "faca" e "nao faca";
- regras de controle de carga computacional para evitar carregamentos completos, watchers amplos, caches globais ou processamento desnecessario;
- refinamento da sequencia para iniciar por 6A1 `useDeckLibrary`, validar, e so depois seguir para 6A2 `useDeckManagement`.

Decisoes:
- tratar o Momento 6 como uma etapa de alto risco arquitetural, com implementacao fatiada;
- manter `App.vue` como integrador temporario das orquestracoes transversais;
- extrair primeiro estado, computeds e helpers puros antes de mover workflows com API;
- manter `stats` e auth flow no `App.vue` ate as fronteiras de Biblioteca/Importacao/Estudo estarem mais estaveis;
- adiar route components reais para o Momento 7.

## 43. Implementacao do Momento 6A1: useDeckLibrary

Com base no planejamento do Momento 6, a primeira fatia implementada foi a extracao do dominio de listas da Biblioteca para `frontend/src/features/library/useDeckLibrary.ts`.

Implementacoes:
- criado `useDeckLibrary` para concentrar busca da Biblioteca, listas de baralhos publicos e meus baralhos, paginas, queries aplicadas, labels de contagem, `hasMore`, listas filtradas e destaque temporario de deck;
- adicionados helpers exportados `mergeDeckPages`, `deckPageCountLabel` e `normalizeSearch`;
- `App.vue` passou a consumir o composable, preservando nele as orquestracoes transversais como `savePublicDeck`, `refreshAll`, router, feedback, auth e stats;
- o debounce da busca continuou no integrador para manter ownership claro sobre rota, usuario e feedback;
- adicionados testes unitarios em `frontend/src/features/library/useDeckLibrary.test.ts`.

Decisoes preservadas:
- nao mover `useDeckManagement` nesta fatia;
- nao alterar router, URLs, backend ou componentes visuais;
- nao transformar listas paginadas em carregamento completo;
- manter `App.vue` como integrador temporario para a proxima fatia 6A2.

Validacoes:
- testes frontend em container Node com Vitest: 30 testes passando;
- build frontend em container Node com `vue-tsc` e `vite build`.

## 33. Ajuste de Rotulo Para Cartas Sem Texto

Durante a validacao manual do gerenciamento de cartas, foi identificado que cartas compostas apenas por midia ou HTML sem texto extraivel apareciam como "Carta sem texto". Isso era correto tecnicamente, mas ruim para uso repetido, pois varias cartas ficavam com o mesmo rotulo.

Decisao:
- no gerenciamento de cartas, o fallback passa a usar a ordem visivel/carregada: `Carta 1`, `Carta 2`, etc.;
- o comportamento fica alinhado ao preview de importacao APKG, que ja usava numeracao quando nao havia texto na carta;
- a busca, a selecao multipla, a edicao e a exclusao nao mudam de contrato.

Validacoes:
- testes frontend em container Node com Vitest: 16 testes passando;
- build frontend em container Node com `vue-tsc` e `vite build`.

## 34. Planejamento Fino do Momento 3

Apos o merge do Momento 2, a branch `frontend-refactor` foi atualizada localmente por fast-forward. Foi criada a branch `codex/frontend-page-shell-plan` apenas para investigacao e desenho do proximo passo.

Estado atual:
- o roteamento principal esta implementado e integrado;
- `App.vue` segue com cerca de 2077 linhas;
- `App.vue` ainda concentra shell, sidebar, topbar, status, paginas, overlays, estado, watchers e workflows;
- `frontend/src/router/index.ts` ja fornece a fonte de verdade da navegacao;
- ainda nao existem `layouts/`, `pages/`, `components/` ou `features/`.

Conclusao:
- nao estamos no final da refatoracao;
- os bloqueios de contrato e roteamento foram resolvidos;
- a proxima etapa deve separar estrutura visual sem mover regra de negocio de dominio.

Foi criado o documento `docs/plano-momento-3-shell-paginas.md`, definindo:
- objetivo do Momento 3;
- o que extrair agora e o que adiar;
- estrutura recomendada com `layouts/AppShell.vue` e paginas principais;
- estrategia para reduzir props sem introduzir store global;
- lateralidades com router, API, tipos, CSS, acessibilidade, memoria, testes e container;
- criterios de aceite e ordem recomendada de commits.

Decisao arquitetural:
- `App.vue` deve continuar como orquestrador temporario;
- componentes novos devem ser controlados por props/eventos;
- chamadas API, caches, limpeza profunda de memoria e composables de dominio ficam para momentos posteriores;
- `CardEditorOverlay` preferencialmente fica para o Momento 4, por estar acoplado ao modulo Biblioteca.

## 35. Implementacao do Momento 3: Shell e Paginas Simples

Apos o merge do planejamento do Momento 3, a branch `frontend-refactor` foi atualizada e foi criada a branch `codex/frontend-page-shell` para a primeira fatia de implementacao.

Implementacoes:
- extracao do casco visual para `frontend/src/layouts/AppShell.vue`;
- sidebar, navegacao principal, botao de pratica intercalada, controle de tema, area de conta e mensagens globais passaram a ser controlados por props/eventos;
- extracao das paginas simples para `frontend/src/pages/AuthPage.vue`, `StudyPage.vue`, `CreateDeckPage.vue` e `ProgressPage.vue`;
- `App.vue` permanece como orquestrador temporario de estado, rotas, chamadas API, watchers e fluxos principais;
- Biblioteca, Importacao e editor de cartas permanecem no `App.vue` nesta fatia por concentrarem mais estado lateral e merecerem extracao propria no proximo momento.

Decisoes:
- nao criar store global ainda;
- nao mover chamadas API para os novos componentes;
- nao alterar contratos do backend nem rotas existentes;
- manter componentes novos controlados por props, modelos e eventos para preservar previsibilidade durante a refatoracao;
- deixar Biblioteca/Importacao para uma etapa separada, reduzindo o risco sobre busca, paginacao, selecao multipla, preview APKG e editor de cartas.

Validacoes:
- `npm ci` em container Node;
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando;
- containers de dev ativos via Docker Compose;
- frontend respondendo `200` em `/` e `/biblioteca/publicos`;
- backend respondendo `200` em `GET /api/decks/public` via `127.0.0.1:8081`.

Observacao:
- o `npm audit` continua apontando uma vulnerabilidade critica herdada; nao foi aplicado `npm audit fix --force` para evitar mudancas de dependencia fora do escopo desta refatoracao.

## 36. Planejamento Fino do Momento 4

Apos o merge do Momento 3, a branch `frontend-refactor` foi atualizada localmente por fast-forward e recebeu a extracao do `AppShell` e das paginas simples. Foi criada a branch `codex/frontend-library-import-plan` para investigacao e desenho da proxima etapa.

Estado atual:
- `App.vue` caiu para cerca de 1864 linhas, mas ainda concentra Biblioteca, Importacao, gerenciamento de cartas e `CardEditorOverlay`;
- o router ja cobre as rotas necessarias e nao exige alteracoes para esta etapa;
- o backend ja possui os contratos necessarios para listas paginadas, metadata leve, cartas paginadas e importacao APKG;
- a Importacao ainda retem estado pesado enquanto o app esta aberto, exigindo politica explicita de limpeza ao sair da rota.

Foi criado o documento `docs/plano-momento-4-biblioteca-importacao.md`, detalhando:
- diagnostico das superficies restantes;
- proposta de extracao para `LibraryPage`, listas, gerenciamento de deck/cartas e `ImportPage`;
- estrategia de view models e componentes controlados por props/eventos;
- decisao recomendada de deixar `CardEditorOverlay` para uma fatia propria;
- politica de ciclo de vida para limpar APKG, indice de midia e object URLs ao sair de `/importar`, preservando somente o fluxo "Entrar para salvar";
- colateralidades com router, API, memoria, UX, acessibilidade, CSS, testes e container;
- criterios de aceite e divisao recomendada em PR 4A e PR 4B.

Decisao proposta:
- implementar primeiro as superficies de Biblioteca e Importacao, mantendo `App.vue` como orquestrador temporario;
- nao reestruturar backend, rotas ou store global;
- tratar a limpeza de estado pesado da Importacao como ajuste obrigatorio do Momento 4A;
- extrair `CardEditorOverlay` em PR separado caso o contrato de upload/insercao no cursor continue nao trivial.

## 37. Implementacao do Momento 4A: Biblioteca e Importacao

A implementacao foi iniciada na branch `codex/frontend-library-import-surfaces`, criada a partir do planejamento do Momento 4.

Implementacoes:
- criados tipos leves de view model para a Biblioteca em `frontend/src/features/library/libraryTypes.ts`;
- criada `frontend/src/pages/LibraryPage.vue` como superficie controlada da Biblioteca;
- criada `frontend/src/features/library/DeckListPanel.vue` para reutilizar a exibicao de baralhos publicos e meus baralhos;
- criada `frontend/src/features/library/DeckManagementView.vue` para metadata, busca paginada de cartas, selecao multipla e preview;
- criada `frontend/src/pages/ImportPage.vue` como superficie controlada da importacao APKG;
- criado `frontend/src/features/import/ImportPreviewPicker.vue` e `importTypes.ts` para o seletor de cartas do preview;
- `App.vue` segue como orquestrador de rotas, API, estado e workflows, caindo para cerca de 1602 linhas;
- adicionada limpeza explicita do estado pesado de Importacao ao sair de `/importar`, revogando object URLs e descartando arquivo/preview/indice, exceto no fluxo "Entrar para salvar".

Decisoes preservadas:
- nao alterar rotas nem backend;
- nao criar store global;
- nao mover chamadas API para componentes visuais;
- nao extrair `CardEditorOverlay` nesta fatia, mantendo o contrato de upload/foco/insercao no cursor para PR proprio;
- manter CSS global e classes existentes para reduzir risco visual.

Validacoes:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando.

## 48. Avaliacao Pos-Merge do Momento 8 e Entrada em Estabilizacao

Data: 2026-06-07
Branch base: `develop`
Commit observado: `4a52077`

Apos o merge da branch `frontend-refactor` em `develop`, foi feita uma avaliacao
pos-merge para decidir a proxima etapa do MVP.

Confirmacoes de historico:
- `develop` contem o merge de `frontend-refactor`;
- `frontend-refactor` contem o merge de `codex/e2e-dedicated-db`;
- o Momento 8 esta presente em `develop`.

Validacoes executadas na base atual:
- `npm test`: 33 testes frontend passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium;
- testes backend via container Maven/Java 21: 27 testes passando.

Tambem foi verificado que a suite E2E usa ambiente isolado:
- Compose dedicado `learningframe-e2e`;
- banco `learningframe_e2e`;
- servico `db-e2e`;
- porta host MySQL `3317`;
- volume `mysql-e2e-data`;
- teardown com `down -v`;
- reset deterministico via endpoint interno `POST /api/e2e/reset`, habilitado
  somente no profile backend `e2e` e protegido por token.

Decisao:
- o projeto ja pode entrar em fase de estabilizacao/finalizacao academica;
- nao foi encontrado bloqueio funcional critico apos o merge;
- a proxima fase deve evitar features grandes e focar hardening, documentacao,
  QA integrado e, se couber, pequeno polimento do modo de estudo.

Pendencias atuais registradas:
- `npm audit` ainda aponta vulnerabilidade critica em `vitest <4.1.0`;
- a correcao sugerida exige `npm audit fix --force` e atualizacao potencialmente
  breaking para `vitest@4.1.8`;
- a decisao deve ser tomada em branch curta, com validacao completa, ou
  documentada conscientemente como risco aceito para o MVP local;
- a suite E2E inicial e suficiente como rede de seguranca basica, mas pode ser
  expandida em cenarios de maior risco, como refresh direto, back/forward,
  edicao de metadata, exclusoes em lote e acessibilidade basica.

Branch criada para a proxima fase:
- `codex/mvp-finalization-planning`

Objetivo inicial da branch:
- consolidar documentacao pos-merge;
- atualizar README;
- registrar o prompt contextual do proximo chat;
- iniciar a proxima conversa pela analise e pelo plano de implementacao antes
  de alterar comportamento funcional.

## 49. Estrategia Para as Proximas Branches de Estabilizacao

Data: 2026-06-07
Branch de registro: `codex/mvp-finalization-planning`

Apos a leitura dos documentos obrigatorios e do estado real do repositorio, foi
registrada a seguinte estrategia para a fase final do MVP:

- manter esta branch como consolidacao documental e contextual da estabilizacao;
- evitar uma fase grande de planejamento abstrato separada das implementacoes;
- criar branches curtas por tema, sempre a partir da base ja consolidada;
- em cada branch, iniciar por uma analise pequena e um plano local antes de
  editar codigo ou dependencias;
- preservar commits pequenos, em portugues e com Conventional Commits;
- nao iniciar implementacao funcional sem confirmar branch, estado do Git,
  mudancas pendentes e validacoes necessarias.

Ordem recomendada para as proximas frentes:

1. `codex/audit-vitest-decision`
   - confirmar o alerta atual de `npm audit`;
   - analisar impacto de atualizar `vitest` para a linha corrigida;
   - decidir entre aplicar upgrade com validacao completa ou documentar o risco
     aceito para o MVP academico/local.
2. `codex/e2e-risk-flows`
   - expandir E2E apenas em cenarios de maior risco:
     refresh direto, back/forward, edicao de metadata, exclusoes em lote e
     acessibilidade basica.
3. `codex/study-session-polish`
   - aplicar polimentos pequenos no modo de estudo se ainda couber:
     progresso de sessao, feedback local apos rating e resumo de conclusao.
4. QA manual integrado e documentacao final
   - executar checklist em container;
   - registrar resultados;
   - corrigir apenas bloqueios reais;
   - atualizar documentacao academica e tecnica final.

Decisao:
- a proxima branch criada sera `codex/audit-vitest-decision`;
- o planejamento dessa branch nao sera iniciado neste chat;
- foi preparado um prompt especifico para abrir o proximo chat com contexto,
  documentos obrigatorios e criterios de decisao.

Documento criado:
- `docs/prompt-proximo-chat-audit-vitest-mvp.md`.

## 50. Decisao do Audit Vitest

Data: 2026-06-07
Branch de trabalho: `codex/audit-vitest-decision`

A branch curta para decidir a pendencia do `npm audit` foi executada com foco em
nao aplicar `npm audit fix --force` automaticamente.

Confirmacoes iniciais:
- branch atual confirmada como `codex/audit-vitest-decision`;
- estado do Git inicialmente limpo;
- `vitest` estava declarado como `^3.2.0`;
- lockfile e instalacao local estavam em `vitest@3.2.4`;
- nao havia `frontend/vitest.config.ts`; a configuracao de teste vinha de
  `frontend/vite.config.ts`;
- a suite de testes unitarios usava apenas APIs basicas de Vitest:
  `describe`, `it`, `expect` e `vi.fn`.

Analise:
- a tentativa inicial de rodar `npm audit` foi bloqueada pelo sandbox, pois a
  chamada ao registry externo exige envio da arvore de dependencias;
- foi analisado o advisory `GHSA-5xrq-8626-4rwp`, relacionado a leitura e
  execucao arbitraria quando o servidor UI/API do Vitest esta exposto;
- uma primeira tentativa controlada de manter a linha 3.x atualizou Vitest para
  `3.2.6`, mas o `npm ci` executado durante o build E2E ainda reportou uma
  vulnerabilidade critica;
- por isso, a decisao final foi atualizar para a faixa corrigida reconhecida
  pelo advisory e pelo audit: `vitest@4.1.8`.

Implementacao:
- `frontend/package.json` passou a declarar `vitest` como `^4.1.8`;
- `frontend/package-lock.json` foi regenerado para `vitest@4.1.8` e pacotes
  relacionados `@vitest/*`;
- um efeito colateral de `npm --prefix` que tentou adicionar
  `learningframe: file:..` ao frontend foi removido antes do fechamento;
- a alteracao final ficou restrita a `frontend/package.json` e
  `frontend/package-lock.json`.

Validacoes finais:
- `npm test`: 33 testes frontend passando com Vitest `4.1.8`;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium, usando Compose
  dedicado `learningframe-e2e` e teardown com `down -v`;
- durante o build E2E, `npm ci` reportou `found 0 vulnerabilities`;
- `git diff --check`: sem problemas.

Decisao:
- a pendencia critica de `npm audit` em `vitest <4.1.0` foi tratada;
- a correcao foi validada na bateria frontend e E2E;
- nao foram executados testes backend Maven, pois a mudanca foi restrita a uma
  dependencia dev-only do frontend e a suite E2E integrada passou;
- a proxima frente recomendada permanece `codex/e2e-risk-flows`, para expandir
  os cenarios E2E de maior risco antes do QA manual final.

Documento criado para o proximo chat:
- `docs/prompt-proximo-chat-e2e-risk-flows-mvp.md`.

## 51. E2E de Fluxos de Risco do MVP

Data: 2026-06-07
Branch de trabalho: `codex/e2e-risk-flows`

A branch curta para expandir a suite E2E foi criada a partir de `develop`
atualizada, apos o merge de `codex/audit-vitest-decision`.

Confirmacoes iniciais:
- `develop` estava em `28ed6e3`, contendo o merge da correcao do Vitest;
- a nova branch `codex/e2e-risk-flows` foi criada sem mudancas locais pendentes;
- a suite E2E existente tinha 9 testes Playwright em Chromium;
- o ambiente E2E continuava isolado em Compose dedicado `learningframe-e2e`,
  banco `learningframe_e2e`, servico `db-e2e`, porta MySQL host `3317` e
  teardown com `down -v`.

Planejamento:
- foi criado `docs/plano-e2e-risk-flows-mvp.md`;
- o escopo foi limitado a fluxos de maior risco para estabilizacao do MVP;
- ficou fora de escopo adicionar features, criar nova infraestrutura E2E,
  adicionar dependencias de acessibilidade ou expandir a suite de forma
  exaustiva.

Implementacao:
- criado `frontend/e2e/specs/routing-risk.spec.ts`;
- criado `frontend/e2e/specs/deck-risk-flows.spec.ts`;
- adicionados testes de refresh direto para rotas principais:
  `/biblioteca/publicos`, `/importar`, `/biblioteca/meus`,
  `/biblioteca/meus/:deckId/gerenciar` e `/estudo/baralho/:deckId`;
- adicionada cobertura de back/forward entre Biblioteca publica, Meus baralhos,
  gerenciamento e Criar;
- adicionada cobertura de edicao persistida de metadata de baralho:
  titulo, descricao e visibilidade;
- adicionada cobertura de selecao e exclusao em lote de cartas;
- adicionada cobertura de selecao e exclusao em lote de baralhos.

Decisoes preservadas:
- os testes reutilizam `seed`, `loginViaUi` e ids retornados pelo reset E2E;
- nao foi necessario criar helper novo, endpoint, fixture ou `data-testid`;
- as acoes destrutivas aguardam resposta da API em paralelo com o clique;
- os seletores priorizam roles, labels e textos visiveis, recorrendo a
  `data-deck-id` apenas onde o padrao ja existia nos specs anteriores.

Validacoes:
- `npm test`: 33 testes frontend passando com Vitest 4.1.8;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 14 testes Playwright passando em Chromium;
- `git diff --check`: sem problemas;
- o E2E subiu o Compose dedicado `learningframe-e2e` e derrubou o ambiente com
  `down -v`, removendo o volume `learningframe-e2e_mysql-e2e-data`.

Observacao:
- `npm test` e `npm run build` precisaram ser repetidos fora do sandbox porque
  a primeira execucao foi bloqueada por permissao ao carregar
  `frontend/vite.config.ts`.

Decisao:
- a suite E2E de estabilizacao passou a cobrir os fluxos de risco inicialmente
  previstos;
- a proxima frente recomendada continua sendo pequena e focada:
  `codex/study-session-polish`, para aplicar polimentos limitados no modo de
  estudo se ainda couber antes do QA manual final.

Documento criado para o proximo chat:
- `docs/prompt-proximo-chat-study-session-polish-mvp.md`.

## 52. Planejamento do Polimento Limitado do Modo de Estudo

Data: 2026-06-07
Branch de trabalho: `codex/study-session-polish`

A branch curta para polir o modo de estudo foi criada a partir de `develop`
atualizada ate `bec6648`, apos o merge da expansao E2E de fluxos de risco.

Confirmacoes iniciais:
- a branch `codex/e2e-risk-flows` ja estava integrada em `develop`;
- `develop` foi atualizado por fast-forward antes da nova branch;
- a nova branch `codex/study-session-polish` foi criada sem mudancas locais
  pendentes.

Planejamento:
- foi criado `docs/plano-study-session-polish-mvp.md`;
- o escopo foi limitado a progresso de sessao, feedback local apos rating,
  resumo simples ao finalizar e empty states mais especificos;
- atalhos de teclado ficaram como opcao secundaria, apenas se o custo se manter
  baixo;
- ficaram fora de escopo dashboard, novo scheduler/SRS, configurador avancado de
  sessao, backend novo, store global e refatoracao ampla do estudo.

Decisoes preservadas:
- `StudyPage.vue` deve continuar como superficie visual controlada por
  props/eventos;
- `App.vue` permanece como orquestrador temporario nesta branch, recebendo
  apenas estado pequeno de sessao;
- o estudo autenticado deve usar o `ReviewResult` retornado pelo backend para
  feedback local;
- o estudo anonimo deve continuar usando `nextReview()` local e
  `learningframe.localStates`;
- conclusao normal de sessao deve virar estado da pagina, nao notificacao global
  repetitiva.

Validacao planejada:
- `npm test`;
- `npm run build`;
- `npm run e2e`, caso o comportamento observavel do estudo seja alterado ou
  novos testes E2E sejam adicionados;
- `git diff --check`.

Implementacao:
- o modo de estudo ganhou progresso de sessao baseado no total inicial da fila;
- foi adicionado feedback local apos cada rating, usando `ReviewResult` no
  estudo autenticado e `nextReview()` no estudo anonimo;
- foi adicionado resumo simples ao finalizar a sessao, com total revisado e
  distribuicao por rating;
- empty states do estudo foram separados entre sessao inativa, sem vencidas e
  baralho sem cartas quando a metadata permite detectar;
- a conclusao normal deixou de depender de notificacao global repetitiva;
- `StudyPage.vue` permaneceu como superficie visual controlada por props/eventos;
- nao houve alteracao de backend, scheduler/SRS, store global ou refatoracao
  ampla.

Testes atualizados:
- `frontend/e2e/specs/study-session.spec.ts` passou a validar progresso,
  feedback local, resumo e progresso persistido;
- `frontend/e2e/specs/public-library.spec.ts` passou a validar progresso e
  feedback local no estudo anonimo.

Validacoes executadas:
- `npm test`: 33 testes frontend passando;
- `npm run build`: build frontend passando;
- `npm run e2e`: 14 testes Playwright passando em Chromium;
- `git diff --check`: sem problemas.

Observacao:
- as validacoes frontend e E2E precisaram ser repetidas fora do sandbox por
  bloqueios de permissao ja conhecidos em `vite.config.ts` e Docker;
- o E2E usou Compose dedicado `learningframe-e2e` e teardown com `down -v`.

Ajustes apos validacao manual:
- alguns cards com imagens muito grandes passaram a ter um controle local para
  adaptar a midia a viewport, preservando proporcao e mantendo ratings
  acessiveis;
- o modo de estudo ganhou controle local de fonte com tres niveis fixos:
  menor, padrao e maior;
- os dois ajustes foram implementados em commits separados, sem alterar backend,
  editor, conteudo salvo ou persistencia de preferencia.

Commits incrementais:
- `feat(estudo): ajusta midia grande ao card`;
- `feat(estudo): adiciona controle de fonte`.

Decisao sobre text-to-speech:
- fica fora do roadmap atual;
- nao sera tratado como proxima microbranch nem como compromisso de roadmap;
- permanece apenas no horizonte de possibilidades futuras, pois exige decisoes
  sobre Web Speech API, idioma, fallback, extracao de texto e convivencia com
  cards que ja possuem audio.

## 53. Preparacao da Proxima Branch: QA Manual Final

Data: 2026-06-08
Branch de registro: `codex/study-session-polish`

Apos o polimento do modo de estudo, a proxima frente recomendada deixou de ser
nova feature e passou a ser QA manual integrado em container, com documentacao
final e correcoes pequenas apenas se surgirem bugs bloqueantes.

Proxima branch prevista:
- `codex/qa-manual-final`.

Condicao de entrada:
- partir de `develop` atualizado;
- confirmar que `codex/study-session-polish` ja foi integrada na base antes de
  iniciar a nova implementacao.

Objetivo:
- preparar checklist de QA manual final;
- executar os fluxos principais em ambiente Docker local;
- registrar evidencias, problemas, riscos aceitos e itens pos-MVP;
- atualizar README e documentos finais apenas com o estado real do produto;
- corrigir somente bugs bloqueantes ou desalinhamentos pequenos encontrados no
  QA.

Documento criado para o proximo chat:
- `docs/prompt-proximo-chat-qa-manual-final-mvp.md`.

## 54. Planejamento do QA Manual Final

Data: 2026-06-08
Branch de trabalho: `codex/qa-manual-final`

A branch de QA manual final foi iniciada apos confirmar a base:
- `HEAD`, `develop` e `origin/develop` apontam para `147af27`, merge de
  `codex/study-session-polish`;
- `codex/study-session-polish` esta integrada em `develop`;
- a worktree estava limpa no inicio da branch;
- foi executado `git fetch --prune origin` antes da confirmacao final dos refs.

Observacao operacional:
- os comandos Git precisaram usar `safe.directory` por diferenca de ownership no
  sandbox;
- o `fetch` exigiu permissao elevada para escrever em `.git/FETCH_HEAD`.

Planejamento criado:
- `docs/plano-qa-manual-final-mvp.md`.

Escopo decidido:
- preparar e executar QA manual integrado em container;
- registrar evidencias, comandos, problemas e decisoes;
- atualizar documentacao final apenas se estiver defasada em relacao ao produto
  real;
- corrigir somente bugs bloqueantes ou pequenos desalinhamentos encontrados no
  QA;
- nao adicionar feature nova.

Fluxos minimos cobertos pelo checklist:
- biblioteca publica anonima;
- estudo anonimo e autenticado;
- polimentos do modo de estudo;
- cadastro, login, rotas privadas e logout;
- salvar baralho publico;
- criacao de baralho, cartas e midias;
- preview e persistencia de APKG;
- pratica intercalada;
- progresso;
- exclusoes multiplas;
- tema claro/escuro;
- refresh direto, back/forward e responsivo mobile;
- mensagens de erro esperadas.

Validacoes planejadas:
- `docker compose up -d --build`;
- checagem HTTP do frontend em `http://127.0.0.1:8080/`;
- checagem HTTP da API publica em
  `http://127.0.0.1:8081/api/decks/public`;
- `npm test`;
- `npm run build`;
- `npm run e2e`, preservando Compose dedicado `learningframe-e2e`;
- `git diff --check`;
- testes backend Maven se houver alteracao backend ou se a bateria completa
  final exigir.

## 55. Execucao do QA Manual Final

Data: 2026-06-08
Branch de trabalho: `codex/qa-manual-final`
Commit base testado: `0bb77cf`

O QA manual final do MVP foi executado em ambiente Docker principal, com apoio de
Playwright headless para percorrer o checklist de forma rastreavel.

Ambiente validado:
- `docker compose up -d --build`;
- frontend em `http://localhost:8080`;
- backend em `http://localhost:8081`;
- banco dev `learningframe` em `localhost:3307`;
- frontend respondeu `200` em `http://127.0.0.1:8080/`;
- API publica respondeu `200` em `http://127.0.0.1:8081/api/decks/public`.

Validacoes automatizadas executadas:
- `npm test`: 33 testes frontend passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 14 testes Playwright passando em Chromium, com Compose
  dedicado `learningframe-e2e` e teardown com `down -v`;
- testes backend via container Maven: 27 testes passando;
- `git diff --check`: sem problemas.

Resultado do checklist:
- 18 de 18 fluxos manuais planejados passaram;
- nenhum bug bloqueante foi encontrado;
- nenhum erro de console ou `pageerror` foi observado nas rodadas assistidas;
- importacao APKG, salvamento autenticado, estudo anonimo/autenticado,
  gerenciamento de baralhos/cartas, midias, pratica intercalada, progresso,
  rotas diretas, back/forward, tema e responsivo mobile foram cobertos.

Observacoes:
- a primeira rodada assistida teve falhas de seletor do proprio roteiro de QA,
  nao do produto; os itens foram repetidos com seletores ajustados e passaram;
- a rodada criou dados descartaveis no banco dev local, como usuarios
  `qa-final-*` e baralhos `QA Final Manual` / `QA APKG Final`;
- os avisos do Maven sobre carregamento dinamico de agente do Mockito foram
  registrados como observacao nao bloqueante para ajuste futuro, pois a suite
  atual finalizou com sucesso.

Documento criado:
- `docs/relatorio-qa-manual-final-mvp.md`.

Decisao:
- o MVP nao apresentou bloqueio funcional nos fluxos principais testados;
- a branch pode seguir para fechamento documental final, mantendo correcoes
  funcionais apenas se surgir regressao objetiva em revisao posterior.

## 56. Preparacao da Proxima Branch: Finalizacao e Documentacao

Data: 2026-06-08
Branch de registro: `codex/qa-manual-final`

Apos o QA manual final, a proxima etapa recomendada passou a ser uma branch
curta de fechamento documental do MVP.

Proxima branch prevista:
- `codex/mvp-final-documentation`.

Condicao de entrada:
- partir de `develop` atualizado;
- confirmar que `codex/qa-manual-final` ja foi integrada na base antes de
  iniciar a nova implementacao documental.

Objetivo:
- consolidar a documentacao final do MVP com base no produto real validado;
- revisar README, diario, consideracoes finais e documentos principais para
  evitar promessas fora do escopo entregue;
- registrar estado final, validacoes, riscos aceitos, limites do MVP e itens
  pos-MVP;
- sugerir o marco/tag final do MVP, como `v0.1.0-mvp`;
- nao adicionar feature nova.

Documento criado para o proximo chat:
- `docs/prompt-proximo-chat-finalizacao-documentacao-mvp.md`.

## 57. Planejamento da Documentacao Final do MVP

Data: 2026-06-08
Branch de trabalho: `codex/mvp-final-documentation`

Apos o merge de `codex/qa-manual-final` em `develop`, a base local foi
atualizada ate `257d2f4`, merge do PR de QA manual final. A nova branch de
documentacao final foi criada a partir desse `develop` atualizado, com worktree
limpa.

Objetivo da branch:
- fechar a documentacao final do MVP com base no produto real validado;
- manter o README como porta de entrada curta;
- criar guias focados para uso, APKG/Anki, execucao local e estado final do
  MVP;
- consolidar funcionalidades incluidas, limites, riscos aceitos, validacoes e
  pos-MVP;
- nao adicionar feature nova.

Documentos planejados/criados nesta abertura:
- [Plano de documentacao final](ai_context/planos/plano-finalizacao-documentacao-mvp.md);
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integracao com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execucao local](guia-execucao-local-mvp.md);
- [Estado final do MVP](estado-final-mvp.md);
- [Principios e padroes do MVP](principios-e-padroes-mvp.md);
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memoria de decisoes](ai_context/memoria-de-decisoes.md).

Decisao:
- a documentacao final deve atender tres publicos: avaliador academico, usuario
  estudante e pessoa tecnica;
- os documentos devem ensinar o uso real do MVP, explicar a integracao basica
  com Anki/APKG e registrar como executar o projeto com Docker ou localmente;
- os documentos historicos de suporte devem ser preservados em
  [docs/ai_context](ai_context/), separando documentacao canonica de memoria de processo;
- as limitacoes conhecidas devem ser tratadas como escopo/riscos aceitos, nao
  escondidas.

## 58. Organizacao do Contexto Historico e de IA

Data: 2026-06-08
Branch de trabalho: `codex/mvp-final-documentation`

Durante a finalizacao documental, os documentos que serviram como suporte de
planejamento e continuidade entre chats foram reorganizados para separar a
documentacao canonica do MVP da memoria de construcao.

Estrutura definida:
- `docs/` preserva guias finais, estado final, relatorio de QA, diario e
  principios atuais do MVP;
- [docs/ai_context](ai_context/) preserva prompts, planos, snapshots, documentos
  arquiteturais historicos e memoria de decisoes.

Documentos estruturantes criados:
- [Principios e padroes do MVP](principios-e-padroes-mvp.md), como referencia
  normativa para futuras branches;
- [README do contexto de IA](ai_context/README.md), explicando como usar o
  contexto historico;
- [Linha do tempo](ai_context/linha-do-tempo.md), conectando fases, branches e
  planos;
- [Memoria de decisoes](ai_context/memoria-de-decisoes.md), registrando
  mudancas relevantes de direcao.

Decisao:
- nao excluir os documentos de suporte, pois eles explicam o raciocinio das
  decisoes;
- evitar que esses documentos parecam documentacao final de uso;
- usar a linha do tempo como mapa da memoria historica;
- usar [Principios e padroes do MVP](principios-e-padroes-mvp.md) como fonte
  atual de padroes para desenvolvimentos futuros.
