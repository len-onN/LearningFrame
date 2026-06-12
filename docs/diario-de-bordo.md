# Diário de bordo do LearningFrame

Data de consolidacao: 2026-05-31

Este documento registra a trajetória do projeto LearningFrame desde sua concepção até o estado atual. Ele foi construído a partir do histórico disponível nesta conversa, do snapshot existente em `docs/2026-05-30_18-53-40_learningframe-snapshot.md` e do estado atual do repositório.

## 1. Concepção

O LearningFrame nasceu como uma proposta de trabalho acadêmico: criar uma aplicação web para resolver um problema profissional real, mas com escopo suficiente para caber em um paper. A ideia original era pessoal e ambiciosa em horizonte futuro: uma plataforma para auxiliar estudantes, com metodologia científica, módulos de estudo, pesquisa, referências e criação de materiais.

Logo no início foi feita uma delimitacao importante: o projeto deveria ser um MVP, não uma plataforma completa. O foco acadêmico exigia que o produto fosse demonstravel, coerente e tecnicamente defensável, sem crescer a ponto de exigir dezenas ou centenas de páginas apenas para explicar seu funcionamento.

O problema escolhido foi apoiar o estudo por meio de técnicas com respaldo científico:

- recordação ativa;
- repetição espaçada;
- prática intercalada.

Inicialmente a prática intercalada apareceu como "modo caos", uma forma mais informal de misturar temas e baralhos. Depois, por alinhamento acadêmico e redução de personalidade desnecessária no MVP, o termo foi alterado para "Prática intercalada".

## 2. Primeiras decisões de produto

As primeiras decisões definiram a alma do MVP:

- A aplicação deveria permitir estudar baralhos públicos sem login.
- O login deveria existir, mas sem bloquear a experiência inicial.
- Usuários autenticados poderiam criar baralhos permanentes, importar conteúdo, publicar e acompanhar progresso.
- Estatísticas entrariam apenas como progresso essencial, não como dashboard analitico completo.
- O design deveria ser minimalista, limpo e centrado no conteúdo.

A autenticação foi tratada como opcional para o uso básico e obrigatória para persistência. Essa decisão foi importante porque separou dois modos mentais:

- visitante: explorar, estudar baralhos públicos e avaliar importações;
- usuário logado: persistir conhecimento, agenda, mídias e progresso.

## 3. Stack escolhida

As tecnologias foram escolhidas com foco em atualidade, gratuidade, documentabilidade e execução local simples:

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
- `frontend`: aplicação Vue servida por Nginx.

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

A repetição espaçada foi definida como SM-2 simplificado. Ao importar decks do Anki, o LearningFrame reinicia a agenda própria e ignora o histórico de agendamento original. Essa decisão manteve o escopo controlado e evitou tentar reproduzir o Anki.

## 5. APKG e limites de interoperabilidade

O `.apkg` foi escolhido como formato padrão de interoperabilidade com o Anki. Desde cedo ficou registrado que `.apkg` não significa licenca livre do conteúdo importado. Também ficou decidido que o projeto não copiaria código do Anki nem assumiria dependências incompatíveis com o escopo acadêmico.

Limites iniciais da importação:

- aceitar deck package `.apkg`, não `.colpkg`;
- extrair notas/cards básicos;
- mapear frente e verso a partir dos dois primeiros campos;
- extrair tags;
- preservar mídias simples quando o baralho fosse salvo no backend;
- não preservar templates complexos;
- não preservar cloze avançado;
- não preservar histórico de revisão;
- não preservar configurações originais do Anki.

## 6. Primeiro bootstrap da aplicação

O MVP inicial foi implementado com:

- API de autenticação;
- CRUD básico de deck/card;
- estudo de baralho único;
- prática intercalada;
- importação APKG básica;
- estatísticas mínimas;
- frontend com biblioteca, estudo, importação, criação e progresso;
- Docker Compose com banco, backend e frontend.

O primeiro snapshot formal do projeto foi registrado em `docs/2026-05-30_18-53-40_learningframe-snapshot.md`.

Naquele momento, a política de commits também foi definida: usar Conventional Commits. Mais tarde, foi reforcado que as mensagens de commit e descrições de testes devem ser em portugues.

## 7. Primeiros ajustes de experiência

Com a aplicação rodando no navegador, surgiram ajustes de interface:

- remover o texto "estudo científico";
- fazer o logo "LearningFrame" voltar para a página inicial;
- ocultar a opção "Criar" antes do login;
- melhorar login/cadastro com tela dedicada;
- escurecer levemente bordas;
- melhorar o posicionamento de botoes da tela de autenticação;
- transformar "Continuar sem login" em um `X` no card de login com tooltip.

Essas decisões caminharam na direção de uma experiência mais limpa, menos verbosa e mais coerente com o minimalismo funcional.

## 8. Validação de formularios

Foi decidido melhorar a validação dos formularios no estilo dos `mat-errors` do Angular: feedback visual abaixo de cada campo.

No frontend:

- validação em tempo real ou quase em tempo real;
- mensagens abaixo dos campos;
- estados visuais de erro.

Na senha, a regra evoluiu para:

- mínimo de 8 caracteres;
- pelo menos uma letra maiuscula;
- pelo menos um número;
- pelo menos um simbolo.

Depois, a mesma regra foi replicada no backend, pois a validação do servidor foi considerada mais importante para segurança e integridade.

## 9. Estratégia de branches

Durante o desenvolvimento, foi definida uma estratégia simples:

- `main`: referência mais estável;
- `develop`: integração principal de desenvolvimento;
- `feature/*`: branches de trabalho por tema.

Também foram enfrentados erros de fluxo Git:

- merge feito acidentalmente para `main`;
- necessidade de reverter ou reorganizar fluxo;
- retorno para `develop`;
- criação de branches focadas para cada ajuste.

O projeto passou a trabalhar com PRs e merges para `develop`, mantendo as branches de feature para entregas específicas.

## 10. Tema claro e escuro

Foi identificada a necessidade de repensar a estratégia de cores para suportar modo claro e escuro de forma mais abstrata.

A solução adotada:

- variáveis CSS de tema;
- alternancia manual entre claro e escuro;
- remoção da opção "sistema", considerada pouco útil para o usuário e mais custosa para manutenção;
- icone de tema no topo, próximo ao texto conceitual.

O texto do topo foi corrigido para:

`RECORDAÇÃO ATIVA - REPETIÇÃO ESPAÇADA - PRÁTICA INTERCALADA`

Com a ressalva de que a interface deve respeitar acentos e cedilhas nos textos exibidos ao usuário.

## 11. Sidebar retratil

Foi decidido tornar o menu lateral expansivel/retratil, com foco em liberar espaco no modo de estudo.

Decisões:

- sidebar recolhida mostra apenas icones;
- sidebar expandida mostra icones e textos;
- tema, usuário e sair ficam no rodape da sidebar como bloco discreto;
- controle de expandir/retrair fica na divisória entre menu e conteúdo;
- "Modo caos" foi renomeado para "Prática intercalada";
- tooltip para "Prática intercalada" deixou de ser necessária após a renomeação.

## 12. Biblioteca e páginação

Foi identificado que listas de baralhos não podem crescer infinitamente. A biblioteca passou por ajustes importantes:

- páginação de baralhos públicos;
- páginação de "Meus baralhos";
- aumento de seeds para testar páginação;
- cards em grid;
- quatro cards por linha no desktop;
- seções com fundo levemente destacado;
- ordem ajustada entre "Meus baralhos" e outros agrupamentos;
- link "Carregar mais baralhos..." centralizado;
- troca de "cards" por "cartas";
- remoção de metadados ruidosos como "LearningFrame" nos cards públicos e "PUBLIC" nos locais.

Depois, a biblioteca foi redesenhada para usar abas internas:

- `Baralhos públicos`;
- `Meus baralhos`;
- inicialmente também `Baralhos locais`.

Mais tarde, com a revisão conceitual das importações APKG, `Baralhos locais` foi removido da Biblioteca.

## 13. Busca na biblioteca

A busca foi inicialmente pensada como busca por baralhos. Houve a dúvida sobre buscar também por cartas.

Decisão atual:

- busca da biblioteca permanece focada em baralhos;
- busca por cartas ficou como pendencia futura, pois exige backend envolvendo `cards.front_html` e `cards.back_html`, com cuidado de performance e páginação.

Na tela de importação APKG, porem, a busca do seletor de cartas considera:

- número da carta;
- texto da frente;
- texto do verso;
- tags;
- nomes de mídia referenciados.

## 14. Importações locais e mudança conceitual

Um dos maiores aprendizados do projeto veio da importação APKG.

Inicialmente, APKG importado virava um rascunho local persistido em `localStorage`. Esse rascunho podia ser visualizado, editado e salvo depois. Com APKGs simples, isso parecia razoavel.

O problema surgiu com APKGs reais contendo muita mídia, como o arquivo:

`C:\Users\lenon\Downloads\Anatomy_Practical_Lower_limb_muscles.apkg`

Esse arquivo tinha aproximadamente 101 MB e grande parte do conteúdo era mídia. Ficou claro que:

- não era adequado guardar mídia pesada no navegador;
- não era honesto apresentar um baralho local incompleto como se fosse estudavel;
- após refresh, o rascunho poderia sobreviver sem o arquivo original;
- isso confundia Biblioteca, Importar e Estudo.

A decisão final foi remover rascunhos locais APKG persistidos.

Novo modelo mental:

- Biblioteca lista baralhos prontos para uso.
- Importar analisa pacotes APKG.
- Estudo usa baralhos persistidos ou públicos.
- APKG anônimo e transitório enquanto o arquivo estiver selecionado.

## 15. Preview APKG com mídia

Depois de remover o rascunho local, surgiu outro problema: uma prévia que não renderiza imagens ou audio não ajuda o usuário a decidir se quer salvar o baralho.

Foi decidido que a tela Importar deveria permitir experimentar o pacote antes de salvar, sem persistir mídia pesada.

Solução adotada:

- o backend continua gerando o preview sem persistir;
- o frontend le o APKG selecionado em memória;
- um índice ZIP mínimo local interpreta o arquivo `media` do APKG;
- imagens e audios são carregados sob demanda por `objectURL`;
- apenas a carta/lado atual carrega mídia;
- URLs temporárias são revogadas para evitar vazamento de memória;
- nada e salvo em `localStorage`;
- nenhuma sessão temporária backend e criada.

A UI da importação passou a ter:

- visualizador de uma carta por vez;
- anterior/próxima;
- clique para virar frente/verso;
- botão explícito para ver frente/verso;
- seletor pesquisavel de cartas com rolagem;
- busca por número, frente, verso, tags e mídias;
- mensagem de salvamento: "Preparando seu baralho com mídia...";
- icone circular animado durante processamento.

Também foi corrigida uma piscada ao alternar frente/verso: a mídia passou a ser preparada antes de trocar o conteúdo visível.

## 16. Mídia persistida no backend

Para baralhos salvos por usuário logado, a mídia do APKG deve ser persistida e servida sob demanda.

Implementações relevantes:

- tabela `media_assets`;
- endpoint `/api/decks/{deckId}/media/{fileName}`;
- autorização para mídia privada;
- token em query string para permitir carregamento por `<img>` e `<audio>`;
- suporte a nomes de arquivo com espacos e caracteres especiais;
- transformacao de sintaxe `[sound:arquivo.mp3]` em audio HTML;
- sanitização reforcada para remover scripts, handlers `on*`, `javascript:` e `srcdoc`;
- CSS para imagens e audios no modo estudo.

Foi criado índice em `media_assets` para busca por `(deck_id, file_name)`.

## 17. Demora ao salvar APKG

Foi percebida demora ao salvar APKGs grandes em "Meus baralhos".

Análise feita:

- o arquivo de teste tem cerca de 101 MB;
- o preview envia o APKG uma vez para o backend;
- a prévia visual também le o APKG no cliente;
- ao salvar, o APKG e enviado novamente;
- o backend extrai SQLite, le mídias e persiste BLOBs no MySQL;
- isso é um custo real da decisão de não criar sessão temporária backend.

Foi decidido não prometer porcentagem real no curto prazo, pois progresso completo exigiria job assíncrono, polling, SSE ou WebSocket.

Melhoria adotada:

- feedback textual mais humano: "Preparando seu baralho com mídia...";
- icone animado;
- após salvar, recarregar apenas "Meus baralhos" e estatísticas, não toda a aplicação;
- destacar visualmente o baralho salvo.

## 18. Destaque do baralho salvo

Para ajudar o usuário a encontrar o baralho recém-importado, foi implementado destaque no card salvo em "Meus baralhos".

Ajustes feitos:

- ir para `Biblioteca > Meus baralhos`;
- esperar o DOM renderizar;
- rolar o card para o centro;
- aplicar destaque animado;
- aumentar a duracao para 10 segundos;
- usar cores mais vivas para validação visual.

## 19. Estado atual das funcionalidades

Implementado:

- Docker Compose para subir banco, backend e frontend.
- Backend Java 21/Spring Boot.
- Frontend Vue 3/Vite/TypeScript.
- Autenticação JWT.
- Validação de senha forte no frontend e backend.
- Biblioteca com baralhos públicos e meus baralhos.
- Páginação.
- Busca por baralhos.
- Estudo de baralho único.
- Prática intercalada.
- SRS simplificado.
- Estatísticas essenciais.
- Modo claro/escuro.
- Sidebar retratil.
- Importação APKG persistida com mídia.
- Preview APKG carta-a-carta com mídia transitória.
- Notificações simples fechaveis.
- Destaque do baralho salvo.

## 20. Pendencias já decididas

Prioridade atual:

1. Edição e exclusão de "Meus baralhos" na Biblioteca.

Detalhamento esperado:

- editar título;
- editar descrição;
- editar visibilidade;
- excluir com confirmação;
- mostrar ações apenas em baralhos do usuário;
- evitar poluir os cards públicos;
- provavelmente usar menu de ações no card.

Outras pendencias decididas:

- gerenciamento melhor de cartas dentro de baralhos próprios;
- compartilhamento/salvar para si baralhos públicos;
- favoritar baralhos públicos como relação leve, sem duplicar conteúdo, para uma etapa futura;
- publicar/despublicar baralhos;
- busca por conteúdo de cartas no backend;
- sistema de notificações mais estruturado;
- lembretes de horario de estudo;
- modo de estudo com leitura das cartas ativas;
- instrumentacao de tempos da importação APKG no backend;
- estatísticas avançadas apenas como roadmap.

## 21. Decisões de escopo ainda preservadas

Continuam fora do MVP imediato:

- dashboard estatístico complexo;
- cloze avançado;
- templates completos do Anki;
- preservar agenda original do Anki;
- `.colpkg`;
- IndexedDB para mídia;
- sessão temporária backend para APKG anônimo;
- CDN ou object storage;
- marketplace de baralhos;
- colaboração multiusuário.

## 22. Observações de processo

O projeto evoluiu em ciclos curtos:

- discutir problema;
- escolher uma opção;
- implementar em branch;
- validar no navegador;
- ajustar UX;
- commitar com Conventional Commits;
- abrir/mergear PR;
- voltar para `develop`;
- criar nova branch.

Também ficou estabelecido que commits, descrições de testes e comunicacao técnica do projeto devem estar em portugues.

## 23. Situacao atual do repositório

No momento deste diário, a branch de trabalho preparada para o próximo tema e:

`feature/library-deck-management`

Ela foi criada a partir de `develop` atualizada após o merge da branch de importação APKG.

O próximo trabalho planejado e implementar edição e exclusão de baralhos em "Meus baralhos".

## 24. Gerenciamento de Baralhos e UX de Edição (Em Andamento)

Aprofundando a usabilidade da biblioteca, chegamos a algumas decisões centrais de arquitetura de UX:
- **Gerenciamento Contextual:** Ao inves de navegar para outras abas para criar/editar um baralho, as ações vao ocorrer dentro da aba de Biblioteca atraves de trocas de conteúdo (content swap).
- **Modo Overlay para Edição de Cartas:** Devido aos planos futuros ambiciosos de incorporar editores de diagramas e canvas ricos, decidimos que o modo de criação/edição de cartas ocorrera num *Overlay dedicado* sobre a área de conteúdo, em formato "split view" (código de um lado, preview ao vivo do outro). Isso fornece o espaco necessário que um modal simples não comportaria.
- **Mídia Independente:** Ajustamos o fluxo para que o upload de imagens/audios seja independente. Inserimos as referências direto no HTML (Markdown) da carta, compatibilizando com as decisões anteriores.

**Progresso no Backend (Commit Local):**
Para suportar o plano acima, um primeiro commit já foi gerado localmente contendo as infraestruturas necessarias na API:
- Endpoint novo `POST /api/decks/{deckId}/media` adicionado no `MediaController`, responsável por receber a mídia, sanitizar o arquivo, identificar seu Content-Type adequadamente e vincular ao baralho do usuário.
- A classe de domínio `MediaAsset` ganhou um novo método `updateContent()` para facilitar a sobrescrita caso um upload com mesmo nome aconteça.
- Novo contrato `MediaUploadResponse` definido em `DeckDtos.java`.

**Progresso no Frontend (Commit Local):**
A primeira implementação da UX planejada foi adicionada no Vue:
- A Biblioteca agora possui uma troca de conteúdo para `Meus baralhos`, permitindo entrar em uma view de gerenciamento contextual sem criar rota ou aba principal nova.
- Os cards de "Meus baralhos" ganharam a ação `Gerenciar`, mantendo os cards públicos limpos e focados em estudo.
- A view de gerenciamento permite editar título, descrição e visibilidade do baralho, excluir o baralho com confirmação, listar cartas e remover cartas individuais.
- A criação e edição de cartas foram movidas para um overlay dedicado com editor bruto de frente/verso, campo de tags e preview ao vivo com `safeStudyHtml()`.
- O upload independente de imagem/audio foi conectado ao novo endpoint `POST /api/decks/{deckId}/media`; ao concluir, o editor injeta `<img src="arquivo">` ou `[sound:arquivo]` no campo ativo.
- A aba `Criar` voltou a cumprir apenas a função de criação macro de baralho. Após criar um baralho, o usuário e levado diretamente para a view de gerenciamento para adicionar cartas.
- A camada `api.ts` passou a expor `updateDeck`, `deleteDeck`, `updateCard`, `deleteCard` e `uploadMedia`.

**Ajuste de Execução em Container:**
Foi identificado que o frontend servido por Nginx em container não reflete alterações locais apenas com refresh, pois consome o `dist` gerado no build da imagem. Para preservar o fluxo containerizado e ainda acelerar validação local, foi criado `docker-compose.dev.yml`:
- O servico `frontend` monta `./frontend/dist` em `/usr/share/nginx/html`.
- O servico `frontend-builder` roda `npm run build -- --watch` dentro de um container Node.
- Assim, alterações no frontend recompilam o `dist` local e o navegador pode ser recarregado em `http://localhost:8080`.

Também foi corrigido o endpoint de API do modo dev para `http://127.0.0.1:8081`, pois `localhost:8081` podia resolver via IPv6 e ficar pendurado no ambiente local. O CORS do Compose passou a aceitar `http://localhost:8080` e `http://127.0.0.1:8080`.

**Validações executadas:**
- `npm test`: 16 testes do frontend passando.
- `npm run build`: build do frontend passando.
- `mvn test` via container Maven: 16 testes do backend passando.
- `GET http://127.0.0.1:8081/api/decks/public`: 200.
- `POST /api/auth/login` com credenciais invalidas: 401 rápido, confirmando que o backend responde.

**Próximo passo real:**
Amanha, a prioridade e fazer teste manual no navegador pelo fluxo containerizado em `http://localhost:8080`, validando login, biblioteca, gerenciamento de baralhos, criação/edição/exclusão de cartas, upload de mídia e preview. Depois disso, corrigir eventuais problemas de UX ou integração antes de abrir PR.

## 25. Biblioteca de Cartas Paginada e Cópia de Baralhos Públicos

O gerenciamento de cartas foi ajustado para não renderizar todas as cartas de um baralho de uma vez. A decisão foi usar um modelo hibrido:
- lista paginada com busca por frente, verso e tags;
- link de "Carregar mais" para ampliar o lote atual;
- seleção independente da carta em preview;
- seleção multipla para exclusão em lote;
- preview/edição da carta ativa em painel separado.

No backend, isso gerou os contratos:
- `GET /api/decks/{deckId}/cards?page&size&q`;
- `POST /api/decks/{deckId}/cards/bulk-delete`.

Também foi adicionada a ação "Salvar para mim" nos cards de baralhos públicos. A implementação cópia o baralho público para uma nova cópia privada em "Meus baralhos", incluindo cartas, tags e mídias. A escolha por cópia privada evita edição acidental do original e preserva um caminho simples para o usuário adaptar o material.

Ideia preservada para depois: "Favoritar" deve ser tratado como uma relação leve com o baralho público original, sem duplicar cartas nem mídias. Isso serviria para descoberta, retorno rápido e organização pessoal, enquanto "Salvar para mim" continua significando cópia editável.

## 26. Fechamento do PR de Biblioteca

O PR de gerenciamento de biblioteca foi mergeado em `develop` e a branch local foi atualizada por fast-forward.

Implementações consolidadas:
- gerenciamento contextual de baralhos em `Biblioteca > Meus baralhos`;
- edição de metadados, exclusão de baralhos, criação/edição/exclusão de cartas;
- upload independente de imagem/audio para cartas persistidas;
- lista paginada e buscavel de cartas no modo de gerenciamento;
- seleção multipla e exclusão em lote de cartas;
- preview da carta ativa em painel separado;
- ação "Salvar para mim" em baralhos públicos, criando cópia privada editável;
- ajuste visual para uniformizar a altura dos cards em "Baralhos públicos" e "Meus baralhos";
- fluxo containerizado de desenvolvimento com `docker-compose.dev.yml` e build frontend em watch.

Decisões preservadas:
- "Salvar para mim" significa copiar o baralho público para uma cópia privada do usuário.
- "Favoritar" fica para uma etapa futura como vínculo leve com o baralho original, sem duplicar cartas ou mídias.
- A gerencia de cartas deve evitar renderizar todos os registros de uma vez; busca e páginação são parte do contrato da tela.
- O editor de cartas permanece em overlay, por ser mais adequado para evoluir para ferramentas ricas de mídia/diagramas.

## 27. Alerta Arquitetural: Frontend Monolítico

Com a conclusão do gerenciamento de biblioteca, ficou evidente que o `App.vue` concentrou responsabilidades demais: roteamento interno por abas, autenticação, biblioteca, estudo, importação APKG, gerenciamento de baralhos, editor de cartas, preview, notificações e integração com API. Isso aumenta custo de leitura, risco de regressao e dificuldade para testar fluxos isolados.

Como estamos na reta final do MVP, a recomendação não é reescrever a aplicação nem introduzir arquitetura pesada agora. A melhor estratégia é uma decomposição incremental, guiada por dor real:

1. **Extrair componentes por superfície de UI.**
   Separar telas e blocos grandes em componentes Vue: `LibraryView`, `DeckList`, `DeckManagementView`, `CardEditorOverlay`, `StudyView`, `ImportView`, `CreateDeckView`, `AuthView` e `ProgressView`. Mantem o comportamento atual, mas reduz o arquivo central.

2. **Extrair composables por domínio de estado.**
   Mover lógica reativa para composables como `useAuth`, `useDeckLibrary`, `useDeckManagement`, `useStudySession`, `useApkgImport`, `useNotifications` e `useTheme`. Isso preserva Vue puro, sem obrigar dependência nova.

3. **Manter `api.ts` como fronteira de infraestrutura.**
   A camada de API já é um bom ponto de separação. O próximo ganho é garantir que componentes e composables consumam funções de domínio, evitando espalhar detalhes de endpoint pelo UI.

4. **Adiar store global formal até haver necessidade clara.**
   Pinia pode ser útil, mas neste momento pode aumentar trabalho sem resolver a dor principal. Primeiro separar componentes/composables; depois avaliar se autenticação, notificações e biblioteca precisam de store compartilhada.

5. **Evitar microfrontends, rewrite ou router complexo neste MVP.**
   Essas opções resolvem problemas de escala maior, mas custariam foco, testes e tempo. Para o MVP, modularizar internamente e suficiente.

Plano sugerido:
- criar uma branch própria para refatoração estrutural;
- mover primeiro componentes de baixo risco, sem alterar comportamento;
- validar build/testes a cada fatia;
- só depois mexer nos composables de estado;
- manter commits pequenos e convencionais, separando refactors de features.

## 28. Planejamento Fino de Roteamento, Componentização e Memória

Após a primeira proposta de refatoração, foi decidido aprofundar o planejamento antes de iniciar implementação. A preocupacao central deixou de ser apenas "quebrar o `App.vue`" e passou a incluir:
- quais fluxos realmente merecem rota própria;
- quais estados são apenas internos de tela;
- quais dados pesados precisam ciclo de vida e descarte explícito;
- quais contratos de backend precisam existir para suportar refresh direto em rotas profundas;
- como manter rastreabilidade por branches pequenas.

Foi criado o documento `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`, que passa a ser a referência da frente arquitetural.

Principais decisões do planejamento:
- usar rotas reais para Biblioteca, Meus baralhos, Gerenciamento de baralho, Estudo, Importação, Criação, Progresso, Login e Cadastro;
- manter editor de carta, carta selecionada, páginação carregada e preview APKG como estados internos, não rotas, neste MVP;
- adicionar um endpoint leve de metadata/resumo de baralho antes de habilitar rota direta de gerenciamento;
- preservar `GET /api/decks/{deckId}` no curto prazo para estudo público anônimo, mesmo sendo um detalhe completo;
- não introduzir `/api/v1`, microfrontends, rewrite ou Pinia neste momento;
- componentizar por superfícies de tela antes de extrair composables;
- tratar memória pesada explicitamente, especialmente APKG, object URLs, fila de estudo, cache anônimo de baralhos públicos e requests de busca.

Com esse refinamento, os momentos iniciais foram reescritos:

1. Primeiro vem o contrato de backend para rotas diretas (`GET /api/decks/{deckId}/metadata` ou equivalente).
2. Depois entra o `vue-router` como fonte de verdade para a navegação principal.
3. Em seguida, `App.vue` vira shell e as páginas principais são extraidas.
4. A Biblioteca e quebrada em módulo próprio.
5. Importação e Estudo são extraidos em módulos.
6. Composables de domínio são criados.
7. Por fim, a política fina de ciclo de vida e memória e aplicada.

Essa ordem foi escolhida para evitar big bang e manter cada branch revisavel com objetivo arquitetural claro.

## 29. Branch Intermediaria Para a Refatoração Frontend

Como a frente de roteamento, componentização e ciclo de vida será longa e composta por várias etapas, foi decidido usar uma branch intermediaria de integração chamada `frontend-refactor`.

Fluxo decidido:
- `frontend-refactor` será criada a partir de `develop` atualizada;
- cada momento da refatoração nascera de `frontend-refactor`;
- os PRs de implementação serao mergeados em `frontend-refactor`, não diretamente em `develop`;
- após cada merge em `frontend-refactor`, a aplicação deve ser validada no container;
- quando todas as etapas estiverem integradas e estáveis, será aberto um PR final de `frontend-refactor` para `develop`.

Motivos:
- evitar que `develop` receba estados intermediarios de uma refatoração estrutural;
- permitir PRs pequenos e revisaveis sem exigir que cada fatia isolada represente a arquitetura final;
- preservar histórico atomico das decisões;
- reduzir o risco de uma refatoração grande bloquear outras correções;
- criar uma área explícita de estabilização antes da promocao para a branch principal de desenvolvimento.

Cuidados:
- manter `frontend-refactor` sincronizada com `develop` caso hotfixes ou ajustes paralelos sejam mergeados;
- evitar features de produto dentro dessa branch que não estejam relacionadas a roteamento, componentização ou memória;
- validar build, testes e fluxo manual após cada etapa;
- usar commits Conventional Commits e descrições de PR claras para cada momento.

Com essa decisão, a ordem operacional passa a ser:

1. concluir e versionar o planejamento arquitetural;
2. criar `frontend-refactor` a partir de `develop`;
3. abrir branches curtas a partir de `frontend-refactor`;
4. integrar cada momento em `frontend-refactor`;
5. validar a aplicação integrada;
6. promover `frontend-refactor` para `develop` apenas quando a frente estiver completa.

## 30. Momento 1: Contrato Leve de Metadata de Baralho

Após o merge do planejamento, `develop` foi atualizada localmente por fast-forward. Em seguida, foi criada e publicada a branch intermediaria `frontend-refactor`, que passa a ser a base de integração da frente de roteamento, componentização e memória.

A branch `codex/backend-deck-route-contracts` foi criada a partir de `frontend-refactor` para o Momento 1.

Implementação realizada:
- novo endpoint `GET /api/decks/{deckId}/metadata`;
- retorno reaproveitando `DeckSummary`, sem lista de cartas;
- resolucao por `findAccessible`, permitindo metadata anônima apenas para baralhos públicos e preservando isolamento de baralhos privados;
- regra de segurança explícita para permitir `GET /api/decks/*/metadata`;
- wrapper `deckMetadata(deckId)` em `frontend/src/services/api.ts`;
- testes de servico cobrindo metadata leve, metadata pública anônima e bloqueio de baralho inacessivel;
- teste de controller cobrindo delegacao do contrato ao servico.

Decisões:
- não criar DTO novo enquanto `DeckSummary` cobre o contrato sem carregar cartas;
- não alterar `GET /api/decks/{deckId}`, pois ele ainda atende estudo público anônimo no curto prazo;
- não mover endpoints de cartas para controller separado neste momento, mantendo o escopo do Momento 1 pequeno;
- manter a rota direta de gerenciamento dependente de metadata leve e listagem paginada de cartas.

Validações:
- testes focados de backend via container Maven: `DeckServiceTest` e `DeckControllerTest`;
- build do frontend via container Node, validando `vue-tsc` e `vite build`.

## 31. Planejamento Fino do Momento 2

Após o merge do Momento 1, a branch `frontend-refactor` foi atualizada localmente por fast-forward e recebeu o contrato leve de metadata de baralho. Em seguida, foi criada a branch `codex/frontend-router-foundation` a partir dela.

Foi feita uma investigação fina do estado atual do frontend antes da implementação do roteamento:
- `App.vue` segue como arquivo monolítico, concentrando navegação, layout, telas, estado e fluxos;
- `main.ts` ainda monta apenas `App`, sem router;
- `package.json` ainda não possui `vue-router`;
- `nginx.conf` já possui fallback SPA adequado para history mode;
- a navegação principal ainda depende de `tab`, `librarySection`, `libraryView` e `authMode`;
- o Momento 1 já disponibilizou `api.deckMetadata(deckId)`, necessário para a rota direta de gerenciamento.

Foi criado o documento `docs/plano-momento-2-roteamento-frontend.md`, detalhando:
- estado atual confirmado;
- mapa de rotas do Momento 2;
- substituicoes planejadas para `tab`, `librarySection`, `libraryView`, `authMode` e `currentTitle`;
- novos elementos técnicos (`vue-router`, `router/index.ts`, route meta, guard de auth);
- funções atuais afetadas por navegação roteada;
- lateralidades em backend, container, build, testes, UX e memória;
- estratégia de implementação em passos pequenos;
- critérios de aceite e riscos.

Decisão mantida:
- o Momento 2 deve introduzir o router como fonte de verdade da navegação principal, mas não deve ainda extrair todas as páginas nem criar store global. A componentização pesada fica para os momentos seguintes.

## 32. Implementação do Momento 2: Router Principal

O Momento 2 foi implementado na branch `codex/frontend-router-foundation`, mantendo `frontend-refactor` como destino do PR.

Implementações:
- instalacao de `vue-router`;
- criação de `frontend/src/router/index.ts`;
- registro do router em `frontend/src/main.ts`;
- rotas reais para biblioteca pública, meus baralhos, gerenciamento de baralho, estudo, estudo por baralho, prática intercalada, importação, criação, progresso, login e cadastro;
- guard simples de autenticação baseado no token local;
- redirect de rotas privadas para `/entrar?redirect=<rota-original>`;
- catch-all redirecionando rotas desconhecidas para `/biblioteca/publicos`;
- sidebar convertida para links roteados com `RouterLink custom`;
- `tab`, `librarySection`, `libraryView` e `authMode` passaram a ser derivados da rota;
- workflows principais passaram a navegar por `router.push`/`router.replace`;
- rota direta de gerenciamento passou a carregar metadata via `api.deckMetadata(deckId)` e cartas via `api.deckCards`;
- estudo por deck passou a ser carregado por rota, mantendo estudo anônimo com detalhe completo apenas quando necessário;
- rota de prática intercalada passou a carregar a fila também em refresh direto.

Decisões preservadas:
- não extrair páginas ainda;
- não criar store global;
- não transformar busca, páginação, seleção multipla, editor de carta ou preview APKG em rotas;
- não mexer no Nginx, pois o fallback SPA já estava configurado;
- não aplicar `npm audit fix --force`, apesar do alerta critico do npm, para evitar mudanças de dependência fora do escopo.

Validações:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando;
- frontend containerizado respondendo `200` em `/biblioteca/publicos` e `/importar`;
- backend respondendo `200` em `GET /api/decks/public` via `127.0.0.1:8081`.

## 38. Planejamento Fino do Momento 4B

Após o merge do Momento 4A, `frontend-refactor` foi atualizada localmente por fast-forward. Foi criada a branch única `codex/frontend-card-editor-overlay`, que deve conter tanto o planejamento quanto a futura implementação do próximo passo.

Estado atual:
- `App.vue` esta com cerca de 1602 linhas;
- Biblioteca e Importação já foram extraidas;
- o `CardEditorOverlay` segue como último grande bloco visual dentro do `App.vue`;
- o editor ainda concentra refs de textarea/input, foco inicial, upload de mídia, insercao no cursor, dirty state e preview sanitizado.

Foi criado o documento `docs/plano-momento-4b-editor-cartas.md`, detalhando:
- objetivo da extração do editor;
- fronteira entre responsabilidades locais de UI/DOM e responsabilidades de orquestracao/API;
- proposta de `CardEditorOverlay.vue` e `cardEditorTypes.ts`;
- contrato por props, `v-model`, eventos e callback controlado de upload;
- preservacao do dirty confirmation no pai;
- preservacao de preview sanitizado no pai;
- lateralidades com Biblioteca, API, memória, UX, acessibilidade, CSS, segurança, testes e container;
- critérios de aceite e riscos principais.

Decisão proposta:
- mover para o componente apenas DOM, foco, cursor, input de arquivo e layout visual;
- manter no `App.vue` salvar/criar/atualizar, dirty state, notificações e chamadas API;
- usar callback `uploadMedia(file, kind): Promise<string>` para permitir que o componente insira o marcador no cursor sem importar `api.ts`;
- não alterar backend, rotas, CSS global, UX visual, WYSIWYG ou política de mídias orfas nesta fatia.

## 39. Implementação do Momento 4B: Editor de Cartas

Após o commit local do planejamento, a extração do editor foi implementada na mesma branch `codex/frontend-card-editor-overlay`.

Implementações:
- criado `frontend/src/features/library/cardEditorTypes.ts` com os tipos do editor;
- criado `frontend/src/features/library/CardEditorOverlay.vue`;
- o componente passou a concentrar layout do overlay, foco inicial, refs de textarea, input de arquivo, face ativa, tipo de mídia, upload em andamento e insercao do marcador no cursor;
- `App.vue` manteve a orquestracao de criar/editar/salvar carta, dirty state, preview sanitizado, notificações e chamadas API;
- o upload de mídia passou a usar callback controlado `uploadCardEditorMedia(file, kind)`, sem importar `api.ts` no componente;
- removidos do `App.vue` os refs e helpers locais de DOM/cursor do editor;
- `App.vue` caiu para cerca de 1488 linhas.

Decisões preservadas:
- não alterar backend, rotas ou estilos globais;
- não criar store global nem composable de domínio ainda;
- não alterar UX visual do editor;
- não resolver mídias orfas nesta fatia;
- manter dirty confirmation no pai.

Validações:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando.

## 45. Implementação Parcial do Momento 7: Rotas Reais e Ciclo de Vida

Na branch `codex/frontend-moment-7-route-lifecycle`, foi iniciada a implementação do Momento 7 a partir do plano de rotas reais e ciclo de vida por tela.

Implementações:
- criado `frontend/src/routes/routeContext.ts` com contextos tipados por superfície de rota;
- criados route adapters reais em `frontend/src/routes/`: `AuthRoute`, `LibraryRoute`, `StudyRoute`, `ImportRoute`, `CreateDeckRoute` e `ProgressRoute`;
- o router deixou de usar o `RouteSurface` vazio e passou a apontar cada rota para seu componente real;
- `App.vue` passou a renderizar `<RouterView />` dentro do `AppShell`, mantendo os workflows e estados de domínio no integrador por enquanto;
- as páginas visuais existentes continuaram controladas por props/eventos, sem mover chamadas API para `pages/`;
- a sincronização inicial de Biblioteca, Estudo e Progresso passou a ser acionada pelos route adapters;
- ao sair da Biblioteca, o gerenciamento contextual e a seleção de baralhos são limpos;
- ao sair das rotas de Estudo, a fila e a resposta visível são descartadas;
- o cache anônimo de baralhos públicos usados no estudo passou a ter limite LRU simples de 6 baralhos;
- o preview APKG ganhou controle de sequencia para evitar que uma resposta antiga sobrescreva o arquivo selecionado mais recentemente.

Decisões preservadas:
- não criar Pinia/store global;
- não mover os workflows de API para os componentes visuais;
- manter `CardEditorOverlay` no `App.vue` nesta fatia;
- não alterar backend, endpoints nem CSS.

Validações:
- testes frontend com Vitest: 33 testes passando;
- build frontend com `vue-tsc` e `vite build` passando.

## 46. Planejamento do Momento 8: Testes E2E com Banco Dedicado

Após a implementação parcial do Momento 7, foi decidido planejar uma etapa própria de testes end-to-end. A motivacao e que rotas reais, guards de autenticação, limpeza de estado, importação APKG, estudo e gerenciamento de baralhos dependem de interacoes entre navegador, frontend, backend e banco que não são totalmente cobertas por testes unitarios.

Decisão:
- criar o Momento 8 após o Momento 7;
- usar Playwright como ferramenta e2e;
- criar um MySQL dedicado para testes, separado do banco dev;
- subir e descer o ambiente e2e automaticamente durante a execução da suite;
- usar Compose próprio, portas próprias e volume descartavel;
- adicionar reset/seed deterministico para que cada teste comece previsivel;
- cobrir primeiro smoke, autenticação/redirect, criação e gerenciamento de baralho, cartas, estudo, importação APKG pequena e progresso.

Documento criado:
- `docs/plano-momento-8-testes-e2e.md`.

Também foram atualizados:
- `docs/arquitetura-frontend-roteamento-ciclo-de-vida.md`, encaixando o Momento 8 antes da validação final da branch `frontend-refactor`;
- `docs/plano-momento-7-rotas-ciclo-de-vida.md`, registrando a ponte entre validação manual do Momento 7 e a futura suite e2e.

## 47. Implementação do Momento 8: Testes E2E com Banco Dedicado

Na branch `codex/e2e-dedicated-db`, foi implementada a primeira suite end-to-end com Playwright e ambiente Compose isolado.

Implementações:
- criado `docker-compose.e2e.yml` com `db-e2e`, `backend-e2e` e `frontend-e2e`;
- o banco e2e usa MySQL dedicado, credenciais próprias, porta `3317`, volume próprio e remoção com `down -v`;
- o backend e2e sobe em `18081` com `SPRING_PROFILES_ACTIVE=e2e`;
- o frontend e2e sobe em `18080` e recebe `VITE_API_BASE_URL` no build da imagem;
- criado `package.json` raiz com `npm test`, `npm run build`, `npm run e2e`, `npm run e2e:up`, `npm run e2e:test` e `npm run e2e:down`;
- criado script `scripts/e2e/run-e2e.mjs` para subir, aguardar readiness, executar Playwright e derrubar o ambiente em `finally`;
- adicionado profile `e2e` no backend com endpoint interno `POST /api/e2e/reset`;
- o reset e2e e protegido por `X-E2E-Token` e `E2E_RESET_TOKEN`;
- o seed e2e cria usuários, baralhos públicos e privados, cartas, tags e estados de revisão previsiveis;
- adicionada fixture APKG pequena real para exercitar preview, preservacao durante login, persistência e limpeza de estado ao sair da rota;
- adicionados nomes acessíveis em campos sem label estável para favorecer testes por `getByLabel`;
- o Vitest passou a ignorar `frontend/e2e/**`.

Suite inicial:
- smoke da Biblioteca pública;
- redirect de rota privada para login e retorno;
- login/logout com limpeza de dados privados;
- criação de baralho com navegação para gerenciamento;
- criação, edição e exclusão básica de carta;
- estudo anônimo de baralho público;
- estudo autenticado com atualização de progresso;
- importação APKG pequena com preservacao ao login e limpeza ao sair da importação.

Validações:
- `npm test`: 33 testes passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium, com Compose e2e subindo e derrubando o volume do MySQL ao final.

## 44. Exclusão Multipla de Baralhos e Refinamento de Seleção

Na branch `codex/frontend-domain-composables-plan`, a fatia em andamento do Momento 6 recebeu uma feature transversal para resolver a exclusão de vários baralhos em `Meus baralhos`, preservando o modelo de listas paginadas e evitando carregar conteúdo desnecessário em memória.

Implementações:
- criado o contrato backend `POST /api/decks/bulk-delete`, com payload `{ deckIds }`, limite de até 100 ids e resposta `204`;
- adicionada validação transacional de ownership no backend: se algum baralho selecionado não existir ou não pertencer ao usuário autenticado, a operação falha antes de excluir qualquer item;
- adicionada consulta `findOwnedByIds` no repositório de decks para buscar apenas baralhos do usuário logado;
- criado wrapper `api.deleteDecks()` no frontend;
- expandido `useDeckLibrary` para controlar seleção de `Meus baralhos` com `selectedMyDeckIds`, contagem, seleção dos itens visíveis, limpeza e modo de seleção;
- integrada toolbar contextual na Biblioteca com `Selecionar`, `Selecionar visiveis`, `Limpar` e `Excluir`, mantendo confirmação antes da remoção;
- adicionado botão flutuante de voltar ao topo da Biblioteca como apoio ao fluxo de listas paginadas com `Carregar mais`;
- refinado `DeckListPanel` para que, no modo seleção, o card inteiro seja selecionavel por clique e teclado, enquanto botoes internos de ação ficam desativados para evitar execucoes acidentais.

Decisões:
- a seleção multipla fica restrita a `Meus baralhos`; baralhos públicos continuam com ações de estudar e salvar;
- a ação em lote atua apenas sobre itens carregados/visíveis, sem semântica de "selecionar todos os resultados da busca";
- a toolbar contextual fica sticky durante o modo seleção para evitar que a ação de exclusão se perca quando a lista crescer;
- o backend mantem a exclusão em lote como endpoint próprio, sem alterar o contrato unitario `DELETE /api/decks/{deckId}`.

Validações:
- testes frontend com Vitest: 33 testes passando;
- build frontend com `vue-tsc` e `vite build`;
- testes backend em container Maven/Java 21: 27 testes passando;
- containers reconstruidos e reiniciados via Docker Compose;
- backend respondendo `200` em `GET /api/decks/public`;
- frontend respondendo `200` em `http://127.0.0.1:8080/`.

## 40. Bugfix: Ciclo de Vida de Notificações

Durante a validação do gerenciamento de baralhos, foi identificado que a notificação de exclusão permanecia visível mesmo após trocar de página. A investigação mostrou que `notice/error` eram globais no `App.vue`, sem uma política explícita de ciclo de vida por rota, e que a exclusão chamava navegação sem aguardar a conclusão antes de exibir a mensagem.

Implementações:
- criado controle leve de lifetime para feedbacks: `route`, `next-route` e `sticky`;
- adicionados helpers `showNotice`, `showError`, `clearFeedback` e limpeza de feedback ao trocar de rota;
- cargas disparadas pelo roteamento passaram a preservar feedback existente, evitando apagar mensagens recém-criadas no destino;
- fluxos de login, logout, cópia de baralho público, importação APKG, criação/atualização/exclusão de baralhos e edição/exclusão de cartas passaram a usar os helpers;
- `closeManagedDeck` passou a aguardar a navegação quando ela e solicitada, removendo a corrida observada na exclusão de baralho.

Decisões:
- manter a solução no `App.vue` enquanto notificações ainda não foram extraidas para composable/store;
- não introduzir biblioteca de toast nesta etapa;
- tratar mensagens comuns como route-scoped por padrão, limpando-as na próxima navegação.

## 41. Implementação do Momento 5: Composables de Infraestrutura

Após atualizar `frontend-refactor`, foi criada a branch `codex/frontend-next-refactor-plan` para planejar e implementar a próxima fatia da refatoração.

Implementações:
- criado `docs/plano-momento-5-composables-infraestrutura.md`;
- criado `frontend/src/composables/useFeedback.ts` para centralizar `notice`, `error`, `loading`, lifetime e `withFeedback`;
- criado `frontend/src/composables/useTheme.ts` para concentrar preferencia de tema, persistência e aplicação no documento;
- criado `frontend/src/composables/useAuthSession.ts` para leitura, persistência e limpeza da sessão local;
- `App.vue` passou a consumir esses composables, preservando os workflows de domínio ainda no componente raiz;
- adicionados testes unitarios para o ciclo de vida das notificações em `useFeedback.test.ts`.

Decisões:
- não transformar o router em `RouterView` real nesta etapa;
- não mover Biblioteca, Importação, Estudo ou Gerenciamento para composables de domínio ainda;
- manter a assinatura nova de `withFeedback` com opções explícitas, preservando compatibilidade booleana temporária no composable.

## 42. Planejamento Fino do Momento 6: Composables de Domínio

Após o merge do Momento 5, a branch `frontend-refactor` foi atualizada localmente por fast-forward e foi criada a branch `codex/frontend-domain-composables-plan` para planejar a próxima etapa da refatoração.

Foi criado o documento `docs/plano-momento-6-composables-dominio.md`, detalhando:
- estado atual do `App.vue` após infraestrutura global extraida;
- proposta de composables de domínio por feature: Biblioteca, Gerenciamento, Importação APKG, Estudo e Auth Flow;
- decisão de não trocar `RouteSurface` por `RouterView` real ainda;
- fronteiras de dependência entre domínio, router, auth, feedback, stats, memória e API;
- lateralidades de UX, performance, memória, testes e validação manual;
- matriz explícita de "faca" e "não faca";
- regras de controle de carga computacional para evitar carregamentos completos, watchers amplos, caches globais ou processamento desnecessário;
- refinamento da sequencia para iniciar por 6A1 `useDeckLibrary`, validar, e só depois seguir para 6A2 `useDeckManagement`.

Decisões:
- tratar o Momento 6 como uma etapa de alto risco arquitetural, com implementação fatiada;
- manter `App.vue` como integrador temporário das orquestracoes transversais;
- extrair primeiro estado, computeds e helpers puros antes de mover workflows com API;
- manter `stats` e auth flow no `App.vue` até as fronteiras de Biblioteca/Importação/Estudo estarem mais estáveis;
- adiar route components reais para o Momento 7.

## 43. Implementação do Momento 6A1: useDeckLibrary

Com base no planejamento do Momento 6, a primeira fatia implementada foi a extração do domínio de listas da Biblioteca para `frontend/src/features/library/useDeckLibrary.ts`.

Implementações:
- criado `useDeckLibrary` para concentrar busca da Biblioteca, listas de baralhos públicos e meus baralhos, páginas, queries aplicadas, labels de contagem, `hasMore`, listas filtradas e destaque temporário de deck;
- adicionados helpers exportados `mergeDeckPages`, `deckPageCountLabel` e `normalizeSearch`;
- `App.vue` passou a consumir o composable, preservando nele as orquestracoes transversais como `savePublicDeck`, `refreshAll`, router, feedback, auth e stats;
- o debounce da busca continuou no integrador para manter ownership claro sobre rota, usuário e feedback;
- adicionados testes unitarios em `frontend/src/features/library/useDeckLibrary.test.ts`.

Decisões preservadas:
- não mover `useDeckManagement` nesta fatia;
- não alterar router, URLs, backend ou componentes visuais;
- não transformar listas paginadas em carregamento completo;
- manter `App.vue` como integrador temporário para a próxima fatia 6A2.

Validações:
- testes frontend em container Node com Vitest: 30 testes passando;
- build frontend em container Node com `vue-tsc` e `vite build`.

## 33. Ajuste de Rotulo Para Cartas Sem Texto

Durante a validação manual do gerenciamento de cartas, foi identificado que cartas compostas apenas por mídia ou HTML sem texto extraivel apareciam como "Carta sem texto". Isso era correto tecnicamente, mas ruim para uso repetido, pois várias cartas ficavam com o mesmo rotulo.

Decisão:
- no gerenciamento de cartas, o fallback passa a usar a ordem visível/carregada: `Carta 1`, `Carta 2`, etc.;
- o comportamento fica alinhado ao preview de importação APKG, que já usava numeracao quando não havia texto na carta;
- a busca, a seleção multipla, a edição e a exclusão não mudam de contrato.

Validações:
- testes frontend em container Node com Vitest: 16 testes passando;
- build frontend em container Node com `vue-tsc` e `vite build`.

## 34. Planejamento Fino do Momento 3

Após o merge do Momento 2, a branch `frontend-refactor` foi atualizada localmente por fast-forward. Foi criada a branch `codex/frontend-page-shell-plan` apenas para investigação e desenho do próximo passo.

Estado atual:
- o roteamento principal esta implementado e integrado;
- `App.vue` segue com cerca de 2077 linhas;
- `App.vue` ainda concentra shell, sidebar, topbar, status, páginas, overlays, estado, watchers e workflows;
- `frontend/src/router/index.ts` já fornece a fonte de verdade da navegação;
- ainda não existem `layouts/`, `pages/`, `components/` ou `features/`.

Conclusão:
- não estamos no final da refatoração;
- os bloqueios de contrato e roteamento foram resolvidos;
- a próxima etapa deve separar estrutura visual sem mover regra de negócio de domínio.

Foi criado o documento `docs/plano-momento-3-shell-paginas.md`, definindo:
- objetivo do Momento 3;
- o que extrair agora e o que adiar;
- estrutura recomendada com `layouts/AppShell.vue` e páginas principais;
- estratégia para reduzir props sem introduzir store global;
- lateralidades com router, API, tipos, CSS, acessibilidade, memória, testes e container;
- critérios de aceite e ordem recomendada de commits.

Decisão arquitetural:
- `App.vue` deve continuar como orquestrador temporário;
- componentes novos devem ser controlados por props/eventos;
- chamadas API, caches, limpeza profunda de memória e composables de domínio ficam para momentos posteriores;
- `CardEditorOverlay` preferencialmente fica para o Momento 4, por estar acoplado ao módulo Biblioteca.

## 35. Implementação do Momento 3: Shell e Páginas Simples

Após o merge do planejamento do Momento 3, a branch `frontend-refactor` foi atualizada e foi criada a branch `codex/frontend-page-shell` para a primeira fatia de implementação.

Implementações:
- extração do casco visual para `frontend/src/layouts/AppShell.vue`;
- sidebar, navegação principal, botão de prática intercalada, controle de tema, área de conta e mensagens globais passaram a ser controlados por props/eventos;
- extração das páginas simples para `frontend/src/pages/AuthPage.vue`, `StudyPage.vue`, `CreateDeckPage.vue` e `ProgressPage.vue`;
- `App.vue` permanece como orquestrador temporário de estado, rotas, chamadas API, watchers e fluxos principais;
- Biblioteca, Importação e editor de cartas permanecem no `App.vue` nesta fatia por concentrarem mais estado lateral e merecerem extração própria no próximo momento.

Decisões:
- não criar store global ainda;
- não mover chamadas API para os novos componentes;
- não alterar contratos do backend nem rotas existentes;
- manter componentes novos controlados por props, modelos e eventos para preservar previsibilidade durante a refatoração;
- deixar Biblioteca/Importação para uma etapa separada, reduzindo o risco sobre busca, páginação, seleção multipla, preview APKG e editor de cartas.

Validações:
- `npm ci` em container Node;
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando;
- containers de dev ativos via Docker Compose;
- frontend respondendo `200` em `/` e `/biblioteca/publicos`;
- backend respondendo `200` em `GET /api/decks/public` via `127.0.0.1:8081`.

Observação:
- o `npm audit` continua apontando uma vulnerabilidade critica herdada; não foi aplicado `npm audit fix --force` para evitar mudanças de dependência fora do escopo desta refatoração.

## 36. Planejamento Fino do Momento 4

Após o merge do Momento 3, a branch `frontend-refactor` foi atualizada localmente por fast-forward e recebeu a extração do `AppShell` e das páginas simples. Foi criada a branch `codex/frontend-library-import-plan` para investigação e desenho da próxima etapa.

Estado atual:
- `App.vue` caiu para cerca de 1864 linhas, mas ainda concentra Biblioteca, Importação, gerenciamento de cartas e `CardEditorOverlay`;
- o router já cobre as rotas necessarias e não exige alterações para esta etapa;
- o backend já possui os contratos necessarios para listas paginadas, metadata leve, cartas paginadas e importação APKG;
- a Importação ainda retem estado pesado enquanto o app esta aberto, exigindo política explícita de limpeza ao sair da rota.

Foi criado o documento `docs/plano-momento-4-biblioteca-importacao.md`, detalhando:
- diagnóstico das superfícies restantes;
- proposta de extração para `LibraryPage`, listas, gerenciamento de deck/cartas e `ImportPage`;
- estratégia de view models e componentes controlados por props/eventos;
- decisão recomendada de deixar `CardEditorOverlay` para uma fatia própria;
- política de ciclo de vida para limpar APKG, índice de mídia e object URLs ao sair de `/importar`, preservando somente o fluxo "Entrar para salvar";
- colateralidades com router, API, memória, UX, acessibilidade, CSS, testes e container;
- critérios de aceite e divisao recomendada em PR 4A e PR 4B.

Decisão proposta:
- implementar primeiro as superfícies de Biblioteca e Importação, mantendo `App.vue` como orquestrador temporário;
- não reestruturar backend, rotas ou store global;
- tratar a limpeza de estado pesado da Importação como ajuste obrigatório do Momento 4A;
- extrair `CardEditorOverlay` em PR separado caso o contrato de upload/insercao no cursor continue não trivial.

## 37. Implementação do Momento 4A: Biblioteca e Importação

A implementação foi iniciada na branch `codex/frontend-library-import-surfaces`, criada a partir do planejamento do Momento 4.

Implementações:
- criados tipos leves de view model para a Biblioteca em `frontend/src/features/library/libraryTypes.ts`;
- criada `frontend/src/pages/LibraryPage.vue` como superfície controlada da Biblioteca;
- criada `frontend/src/features/library/DeckListPanel.vue` para reutilizar a exibicao de baralhos públicos e meus baralhos;
- criada `frontend/src/features/library/DeckManagementView.vue` para metadata, busca paginada de cartas, seleção multipla e preview;
- criada `frontend/src/pages/ImportPage.vue` como superfície controlada da importação APKG;
- criado `frontend/src/features/import/ImportPreviewPicker.vue` e `importTypes.ts` para o seletor de cartas do preview;
- `App.vue` segue como orquestrador de rotas, API, estado e workflows, caindo para cerca de 1602 linhas;
- adicionada limpeza explícita do estado pesado de Importação ao sair de `/importar`, revogando object URLs e descartando arquivo/preview/índice, exceto no fluxo "Entrar para salvar".

Decisões preservadas:
- não alterar rotas nem backend;
- não criar store global;
- não mover chamadas API para componentes visuais;
- não extrair `CardEditorOverlay` nesta fatia, mantendo o contrato de upload/foco/insercao no cursor para PR próprio;
- manter CSS global e classes existentes para reduzir risco visual.

Validações:
- build frontend em container Node com `vue-tsc` e `vite build`;
- testes frontend em container Node com Vitest: 16 testes passando.

## 48. Avaliação Pos-Merge do Momento 8 e Entrada em Estabilização

Data: 2026-06-07
Branch base: `develop`
Commit observado: `4a52077`

Após o merge da branch `frontend-refactor` em `develop`, foi feita uma avaliação
pos-merge para decidir a próxima etapa do MVP.

Confirmacoes de histórico:
- `develop` contem o merge de `frontend-refactor`;
- `frontend-refactor` contem o merge de `codex/e2e-dedicated-db`;
- o Momento 8 esta presente em `develop`.

Validações executadas na base atual:
- `npm test`: 33 testes frontend passando;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium;
- testes backend via container Maven/Java 21: 27 testes passando.

Também foi verificado que a suite E2E usa ambiente isolado:
- Compose dedicado `learningframe-e2e`;
- banco `learningframe_e2e`;
- servico `db-e2e`;
- porta host MySQL `3317`;
- volume `mysql-e2e-data`;
- teardown com `down -v`;
- reset deterministico via endpoint interno `POST /api/e2e/reset`, habilitado
  somente no profile backend `e2e` e protegido por token.

Decisão:
- o projeto já pode entrar em fase de estabilização/finalização acadêmica;
- não foi encontrado bloqueio funcional critico após o merge;
- a próxima fase deve evitar features grandes e focar hardening, documentação,
  QA integrado e, se couber, pequeno polimento do modo de estudo.

Pendencias atuais registradas:
- `npm audit` ainda aponta vulnerabilidade critica em `vitest <4.1.0`;
- a correção sugerida exige `npm audit fix --force` e atualização potencialmente
  breaking para `vitest@4.1.8`;
- a decisão deve ser tomada em branch curta, com validação completa, ou
  documentada conscientemente como risco aceito para o MVP local;
- a suite E2E inicial e suficiente como rede de segurança básica, mas pode ser
  expandida em cenários de maior risco, como refresh direto, back/forward,
  edição de metadata, exclusões em lote e acessibilidade básica.

Branch criada para a próxima fase:
- `codex/mvp-finalization-planning`

Objetivo inicial da branch:
- consolidar documentação pos-merge;
- atualizar README;
- registrar o prompt contextual do próximo chat;
- iniciar a próxima conversa pela análise e pelo plano de implementação antes
  de alterar comportamento funcional.

## 49. Estratégia Para as Próximas Branches de Estabilização

Data: 2026-06-07
Branch de registro: `codex/mvp-finalization-planning`

Após a leitura dos documentos obrigatorios e do estado real do repositório, foi
registrada a seguinte estratégia para a fase final do MVP:

- manter esta branch como consolidacao documental e contextual da estabilização;
- evitar uma fase grande de planejamento abstrato separada das implementações;
- criar branches curtas por tema, sempre a partir da base já consolidada;
- em cada branch, iniciar por uma análise pequena e um plano local antes de
  editar código ou dependências;
- preservar commits pequenos, em portugues e com Conventional Commits;
- não iniciar implementação funcional sem confirmar branch, estado do Git,
  mudanças pendentes e validações necessarias.

Ordem recomendada para as próximas frentes:

1. `codex/audit-vitest-decision`
   - confirmar o alerta atual de `npm audit`;
   - analisar impacto de atualizar `vitest` para a linha corrigida;
   - decidir entre aplicar upgrade com validação completa ou documentar o risco
     aceito para o MVP acadêmico/local.
2. `codex/e2e-risk-flows`
   - expandir E2E apenas em cenários de maior risco:
     refresh direto, back/forward, edição de metadata, exclusões em lote e
     acessibilidade básica.
3. `codex/study-session-polish`
   - aplicar polimentos pequenos no modo de estudo se ainda couber:
     progresso de sessão, feedback local após rating e resumo de conclusão.
4. QA manual integrado e documentação final
   - executar checklist em container;
   - registrar resultados;
   - corrigir apenas bloqueios reais;
   - atualizar documentação acadêmica e técnica final.

Decisão:
- a próxima branch criada será `codex/audit-vitest-decision`;
- o planejamento dessa branch não será iniciado neste chat;
- foi preparado um prompt específico para abrir o próximo chat com contexto,
  documentos obrigatorios e critérios de decisão.

Documento criado:
- `docs/prompt-proximo-chat-audit-vitest-mvp.md`.

## 50. Decisão do Audit Vitest

Data: 2026-06-07
Branch de trabalho: `codex/audit-vitest-decision`

A branch curta para decidir a pendencia do `npm audit` foi executada com foco em
não aplicar `npm audit fix --force` automaticamente.

Confirmacoes iniciais:
- branch atual confirmada como `codex/audit-vitest-decision`;
- estado do Git inicialmente limpo;
- `vitest` estava declarado como `^3.2.0`;
- lockfile e instalacao local estavam em `vitest@3.2.4`;
- não havia `frontend/vitest.config.ts`; a configuração de teste vinha de
  `frontend/vite.config.ts`;
- a suite de testes unitarios usava apenas APIs básicas de Vitest:
  `describe`, `it`, `expect` e `vi.fn`.

Análise:
- a tentativa inicial de rodar `npm audit` foi bloqueada pelo sandbox, pois a
  chamada ao registry externo exige envio da arvore de dependências;
- foi analisado o advisory `GHSA-5xrq-8626-4rwp`, relacionado a leitura e
  execução arbitraria quando o servidor UI/API do Vitest esta exposto;
- uma primeira tentativa controlada de manter a linha 3.x atualizou Vitest para
  `3.2.6`, mas o `npm ci` executado durante o build E2E ainda reportou uma
  vulnerabilidade critica;
- por isso, a decisão final foi atualizar para a faixa corrigida reconhecida
  pelo advisory e pelo audit: `vitest@4.1.8`.

Implementação:
- `frontend/package.json` passou a declarar `vitest` como `^4.1.8`;
- `frontend/package-lock.json` foi regenerado para `vitest@4.1.8` e pacotes
  relacionados `@vitest/*`;
- um efeito colateral de `npm --prefix` que tentou adicionar
  `learningframe: file:..` ao frontend foi removido antes do fechamento;
- a alteração final ficou restrita a `frontend/package.json` e
  `frontend/package-lock.json`.

Validações finais:
- `npm test`: 33 testes frontend passando com Vitest `4.1.8`;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 9 testes Playwright passando em Chromium, usando Compose
  dedicado `learningframe-e2e` e teardown com `down -v`;
- durante o build E2E, `npm ci` reportou `found 0 vulnerabilities`;
- `git diff --check`: sem problemas.

Decisão:
- a pendencia critica de `npm audit` em `vitest <4.1.0` foi tratada;
- a correção foi validada na bateria frontend e E2E;
- não foram executados testes backend Maven, pois a mudança foi restrita a uma
  dependência dev-only do frontend e a suite E2E integrada passou;
- a próxima frente recomendada permanece `codex/e2e-risk-flows`, para expandir
  os cenários E2E de maior risco antes do QA manual final.

Documento criado para o próximo chat:
- `docs/prompt-proximo-chat-e2e-risk-flows-mvp.md`.

## 51. E2E de Fluxos de Risco do MVP

Data: 2026-06-07
Branch de trabalho: `codex/e2e-risk-flows`

A branch curta para expandir a suite E2E foi criada a partir de `develop`
atualizada, após o merge de `codex/audit-vitest-decision`.

Confirmacoes iniciais:
- `develop` estava em `28ed6e3`, contendo o merge da correção do Vitest;
- a nova branch `codex/e2e-risk-flows` foi criada sem mudanças locais pendentes;
- a suite E2E existente tinha 9 testes Playwright em Chromium;
- o ambiente E2E continuava isolado em Compose dedicado `learningframe-e2e`,
  banco `learningframe_e2e`, servico `db-e2e`, porta MySQL host `3317` e
  teardown com `down -v`.

Planejamento:
- foi criado `docs/plano-e2e-risk-flows-mvp.md`;
- o escopo foi limitado a fluxos de maior risco para estabilização do MVP;
- ficou fora de escopo adicionar features, criar nova infraestrutura E2E,
  adicionar dependências de acessibilidade ou expandir a suite de forma
  exaustiva.

Implementação:
- criado `frontend/e2e/specs/routing-risk.spec.ts`;
- criado `frontend/e2e/specs/deck-risk-flows.spec.ts`;
- adicionados testes de refresh direto para rotas principais:
  `/biblioteca/publicos`, `/importar`, `/biblioteca/meus`,
  `/biblioteca/meus/:deckId/gerenciar` e `/estudo/baralho/:deckId`;
- adicionada cobertura de back/forward entre Biblioteca pública, Meus baralhos,
  gerenciamento e Criar;
- adicionada cobertura de edição persistida de metadata de baralho:
  título, descrição e visibilidade;
- adicionada cobertura de seleção e exclusão em lote de cartas;
- adicionada cobertura de seleção e exclusão em lote de baralhos.

Decisões preservadas:
- os testes reutilizam `seed`, `loginViaUi` e ids retornados pelo reset E2E;
- não foi necessário criar helper novo, endpoint, fixture ou `data-testid`;
- as ações destrutivas aguardam resposta da API em paralelo com o clique;
- os seletores priorizam roles, labels e textos visíveis, recorrendo a
  `data-deck-id` apenas onde o padrão já existia nos specs anteriores.

Validações:
- `npm test`: 33 testes frontend passando com Vitest 4.1.8;
- `npm run build`: `vue-tsc` e `vite build` passando;
- `npm run e2e`: 14 testes Playwright passando em Chromium;
- `git diff --check`: sem problemas;
- o E2E subiu o Compose dedicado `learningframe-e2e` e derrubou o ambiente com
  `down -v`, removendo o volume `learningframe-e2e_mysql-e2e-data`.

Observação:
- `npm test` e `npm run build` precisaram ser repetidos fora do sandbox porque
  a primeira execução foi bloqueada por permissao ao carregar
  `frontend/vite.config.ts`.

Decisão:
- a suite E2E de estabilização passou a cobrir os fluxos de risco inicialmente
  previstos;
- a próxima frente recomendada continua sendo pequena e focada:
  `codex/study-session-polish`, para aplicar polimentos limitados no modo de
  estudo se ainda couber antes do QA manual final.

Documento criado para o próximo chat:
- `docs/prompt-proximo-chat-study-session-polish-mvp.md`.

## 52. Planejamento do Polimento Limitado do Modo de Estudo

Data: 2026-06-07
Branch de trabalho: `codex/study-session-polish`

A branch curta para polir o modo de estudo foi criada a partir de `develop`
atualizada até `bec6648`, após o merge da expansao E2E de fluxos de risco.

Confirmacoes iniciais:
- a branch `codex/e2e-risk-flows` já estava integrada em `develop`;
- `develop` foi atualizado por fast-forward antes da nova branch;
- a nova branch `codex/study-session-polish` foi criada sem mudanças locais
  pendentes.

Planejamento:
- foi criado `docs/plano-study-session-polish-mvp.md`;
- o escopo foi limitado a progresso de sessão, feedback local após rating,
  resumo simples ao finalizar e empty states mais específicos;
- atalhos de teclado ficaram como opção secundaria, apenas se o custo se manter
  baixo;
- ficaram fora de escopo dashboard, novo scheduler/SRS, configurador avançado de
  sessão, backend novo, store global e refatoração ampla do estudo.

Decisões preservadas:
- `StudyPage.vue` deve continuar como superfície visual controlada por
  props/eventos;
- `App.vue` permanece como orquestrador temporário nesta branch, recebendo
  apenas estado pequeno de sessão;
- o estudo autenticado deve usar o `ReviewResult` retornado pelo backend para
  feedback local;
- o estudo anônimo deve continuar usando `nextReview()` local e
  `learningframe.localStates`;
- conclusão normal de sessão deve virar estado da página, não notificação global
  repetitiva.

Validação planejada:
- `npm test`;
- `npm run build`;
- `npm run e2e`, caso o comportamento observavel do estudo seja alterado ou
  novos testes E2E sejam adicionados;
- `git diff --check`.

Implementação:
- o modo de estudo ganhou progresso de sessão baseado no total inicial da fila;
- foi adicionado feedback local após cada rating, usando `ReviewResult` no
  estudo autenticado e `nextReview()` no estudo anônimo;
- foi adicionado resumo simples ao finalizar a sessão, com total revisado e
  distribuição por rating;
- empty states do estudo foram separados entre sessão inativa, sem vencidas e
  baralho sem cartas quando a metadata permite detectar;
- a conclusão normal deixou de depender de notificação global repetitiva;
- `StudyPage.vue` permaneceu como superfície visual controlada por props/eventos;
- não houve alteração de backend, scheduler/SRS, store global ou refatoração
  ampla.

Testes atualizados:
- `frontend/e2e/specs/study-session.spec.ts` passou a validar progresso,
  feedback local, resumo e progresso persistido;
- `frontend/e2e/specs/public-library.spec.ts` passou a validar progresso e
  feedback local no estudo anônimo.

Validações executadas:
- `npm test`: 33 testes frontend passando;
- `npm run build`: build frontend passando;
- `npm run e2e`: 14 testes Playwright passando em Chromium;
- `git diff --check`: sem problemas.

Observação:
- as validações frontend e E2E precisaram ser repetidas fora do sandbox por
  bloqueios de permissao já conhecidos em `vite.config.ts` e Docker;
- o E2E usou Compose dedicado `learningframe-e2e` e teardown com `down -v`.

Ajustes após validação manual:
- alguns cards com imagens muito grandes passaram a ter um controle local para
  adaptar a mídia a viewport, preservando proporcao e mantendo ratings
  acessíveis;
- o modo de estudo ganhou controle local de fonte com três níveis fixos:
  menor, padrão e maior;
- os dois ajustes foram implementados em commits separados, sem alterar backend,
  editor, conteúdo salvo ou persistência de preferencia.

Commits incrementais:
- `feat(estudo): ajusta midia grande ao card`;
- `feat(estudo): adiciona controle de fonte`.

Decisão sobre text-to-speech:
- fica fora do roadmap atual;
- não será tratado como próxima microbranch nem como compromisso de roadmap;
- permanece apenas no horizonte de possibilidades futuras, pois exige decisões
  sobre Web Speech API, idioma, fallback, extração de texto e convivencia com
  cards que já possuem audio.

## 53. Preparação da Próxima Branch: QA Manual Final

Data: 2026-06-08
Branch de registro: `codex/study-session-polish`

Após o polimento do modo de estudo, a próxima frente recomendada deixou de ser
nova feature e passou a ser QA manual integrado em container, com documentação
final e correções pequenas apenas se surgirem bugs bloqueantes.

Próxima branch prevista:
- `codex/qa-manual-final`.

Condicao de entrada:
- partir de `develop` atualizado;
- confirmar que `codex/study-session-polish` já foi integrada na base antes de
  iniciar a nova implementação.

Objetivo:
- preparar checklist de QA manual final;
- executar os fluxos principais em ambiente Docker local;
- registrar evidências, problemas, riscos aceitos e itens pós-MVP;
- atualizar README e documentos finais apenas com o estado real do produto;
- corrigir somente bugs bloqueantes ou desalinhamentos pequenos encontrados no
  QA.

Documento criado para o próximo chat:
- `docs/prompt-proximo-chat-qa-manual-final-mvp.md`.

## 54. Planejamento do QA Manual Final

Data: 2026-06-08
Branch de trabalho: `codex/qa-manual-final`

A branch de QA manual final foi iniciada após confirmar a base:
- `HEAD`, `develop` e `origin/develop` apontam para `147af27`, merge de
  `codex/study-session-polish`;
- `codex/study-session-polish` esta integrada em `develop`;
- a worktree estava limpa no início da branch;
- foi executado `git fetch --prune origin` antes da confirmação final dos refs.

Observação operacional:
- os comandos Git precisaram usar `safe.directory` por diferenca de ownership no
  sandbox;
- o `fetch` exigiu permissao elevada para escrever em `.git/FETCH_HEAD`.

Planejamento criado:
- `docs/plano-qa-manual-final-mvp.md`.

Escopo decidido:
- preparar e executar QA manual integrado em container;
- registrar evidências, comandos, problemas e decisões;
- atualizar documentação final apenas se estiver defasada em relação ao produto
  real;
- corrigir somente bugs bloqueantes ou pequenos desalinhamentos encontrados no
  QA;
- não adicionar feature nova.

Fluxos minimos cobertos pelo checklist:
- biblioteca pública anônima;
- estudo anônimo e autenticado;
- polimentos do modo de estudo;
- cadastro, login, rotas privadas e logout;
- salvar baralho público;
- criação de baralho, cartas e mídias;
- preview e persistência de APKG;
- prática intercalada;
- progresso;
- exclusões múltiplas;
- tema claro/escuro;
- refresh direto, back/forward e responsivo mobile;
- mensagens de erro esperadas.

Validações planejadas:
- `docker compose up -d --build`;
- checagem HTTP do frontend em `http://127.0.0.1:8080/`;
- checagem HTTP da API pública em
  `http://127.0.0.1:8081/api/decks/public`;
- `npm test`;
- `npm run build`;
- `npm run e2e`, preservando Compose dedicado `learningframe-e2e`;
- `git diff --check`;
- testes backend Maven se houver alteração backend ou se a bateria completa
  final exigir.

## 55. Execução do QA Manual Final

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
- API pública respondeu `200` em `http://127.0.0.1:8081/api/decks/public`.

Validações automatizadas executadas:
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
- importação APKG, salvamento autenticado, estudo anônimo/autenticado,
  gerenciamento de baralhos/cartas, mídias, prática intercalada, progresso,
  rotas diretas, back/forward, tema e responsivo mobile foram cobertos.

Observações:
- a primeira rodada assistida teve falhas de seletor do próprio roteiro de QA,
  não do produto; os itens foram repetidos com seletores ajustados e passaram;
- a rodada criou dados descartaveis no banco dev local, como usuários
  `qa-final-*` e baralhos `QA Final Manual` / `QA APKG Final`;
- os avisos do Maven sobre carregamento dinamico de agente do Mockito foram
  registrados como observação não bloqueante para ajuste futuro, pois a suite
  atual finalizou com sucesso.

Documento criado:
- `docs/relatorio-qa-manual-final-mvp.md`.

Decisão:
- o MVP não apresentou bloqueio funcional nos fluxos principais testados;
- a branch pode seguir para fechamento documental final, mantendo correções
  funcionais apenas se surgir regressao objetiva em revisão posterior.

## 56. Preparação da Próxima Branch: Finalização e Documentação

Data: 2026-06-08
Branch de registro: `codex/qa-manual-final`

Após o QA manual final, a próxima etapa recomendada passou a ser uma branch
curta de fechamento documental do MVP.

Próxima branch prevista:
- `codex/mvp-final-documentation`.

Condicao de entrada:
- partir de `develop` atualizado;
- confirmar que `codex/qa-manual-final` já foi integrada na base antes de
  iniciar a nova implementação documental.

Objetivo:
- consolidar a documentação final do MVP com base no produto real validado;
- revisar README, diário, considerações finais e documentos principais para
  evitar promessas fora do escopo entregue;
- registrar estado final, validações, riscos aceitos, limites do MVP e itens
  pós-MVP;
- sugerir o marco/tag final do MVP, como `v0.1.0-mvp`;
- não adicionar feature nova.

Documento criado para o próximo chat:
- `docs/prompt-proximo-chat-finalizacao-documentacao-mvp.md`.

## 57. Planejamento da Documentação Final do MVP

Data: 2026-06-08
Branch de trabalho: `codex/mvp-final-documentation`

Após o merge de `codex/qa-manual-final` em `develop`, a base local foi
atualizada até `257d2f4`, merge do PR de QA manual final. A nova branch de
documentação final foi criada a partir desse `develop` atualizado, com worktree
limpa.

Objetivo da branch:
- fechar a documentação final do MVP com base no produto real validado;
- manter o README como porta de entrada curta;
- criar guias focados para uso, APKG/Anki, execução local e estado final do
  MVP;
- consolidar funcionalidades incluídas, limites, riscos aceitos, validações e
  pós-MVP;
- não adicionar feature nova.

Documentos planejados/criados nesta abertura:
- [Plano de documentação final](ai_context/planos/plano-finalizacao-documentacao-mvp.md);
- [Guia de uso do MVP](guia-de-uso-mvp.md);
- [Guia de integração com Anki/APKG](guia-anki-apkg-mvp.md);
- [Guia de execução local](guia-execucao-local-mvp.md);
- [Estado final do MVP](estado-final-mvp.md);
- [Princípios e padrões do MVP](principios-e-padroes-mvp.md);
- [README do contexto de IA](ai_context/README.md);
- [Linha do tempo](ai_context/linha-do-tempo.md);
- [Memória de decisões](ai_context/memoria-de-decisoes.md).

Decisão:
- a documentação final deve atender três públicos: avaliador acadêmico, usuário
  estudante e pessoa técnica;
- os documentos devem ensinar o uso real do MVP, explicar a integração básica
  com Anki/APKG e registrar como executar o projeto com Docker ou localmente;
- os documentos históricos de suporte devem ser preservados em
  [docs/ai_context](ai_context/), separando documentação canônica de memória de processo;
- as limitações conhecidas devem ser tratadas como escopo/riscos aceitos, não
  escondidas.

## 58. Organização do Contexto Histórico e de IA

Data: 2026-06-08
Branch de trabalho: `codex/mvp-final-documentation`

Durante a finalização documental, os documentos que serviram como suporte de
planejamento e continuidade entre chats foram reorganizados para separar a
documentação canônica do MVP da memória de construção.

Estrutura definida:
- `docs/` preserva guias finais, estado final, relatório de QA, diário e
  princípios atuais do MVP;
- [docs/ai_context](ai_context/) preserva prompts, planos, snapshots, documentos
  arquiteturais históricos e memória de decisões.

Documentos estruturantes criados:
- [Princípios e padrões do MVP](principios-e-padroes-mvp.md), como referência
  normativa para futuras branches;
- [README do contexto de IA](ai_context/README.md), explicando como usar o
  contexto histórico;
- [Linha do tempo](ai_context/linha-do-tempo.md), conectando fases, branches e
  planos;
- [Memória de decisões](ai_context/memoria-de-decisoes.md), registrando
  mudanças relevantes de direção.

Decisão:
- não excluir os documentos de suporte, pois eles explicam o raciocinio das
  decisões;
- evitar que esses documentos parecam documentação final de uso;
- usar a linha do tempo como mapa da memória histórica;
- usar [Princípios e padrões do MVP](principios-e-padroes-mvp.md) como fonte
  atual de padrões para desenvolvimentos futuros.

## 59. Refatoração Pós-MVP do App.vue

Data: 2026-06-08
Branch de trabalho: `codex/refactor-app-vue-responsibilities`

Após o fechamento funcional do MVP, foi iniciada uma frente específica para
reduzir a concentração de responsabilidades em `frontend/src/App.vue`, sem
alterar comportamento, rotas, UX, contratos de API, regras de SRS ou fluxo de
importação APKG.

Motivação:
- `App.vue` continuava atuando como composition root, provider dos contextos de
  rota e implementação de diversos domínios;
- a mistura de biblioteca, gerenciamento, importação, estudo, auth, progresso e
  limpeza de estados temporários aumentava custo cognitivo;
- a redução precisava preservar ciclos de vida, callbacks transversais
  explícitos e paginação, não apenas diminuir linhas.

Primeira fatia aplicada:
- helpers puros extraídos para estudo, importação e biblioteca;
- testes unitários adicionados para esses helpers;
- `useDeckManagement` criado para concentrar gerenciamento de deck/cartas;
- `App.vue` passou de aproximadamente 1548 para 1168 linhas;
- `App.vue` permaneceu como integrador explícito de auth, router, feedback,
  stats e providers de rota.

Validações executadas:
- `cd frontend && npm test`;
- `cd frontend && npm run build`;
- `git diff --check`.

Documentos criados:
- [Plano de refatoração pós-MVP do App.vue](ai_context/planos/plano-refatoracao-app-vue-pos-mvp.md);
- [Prompt inicial da refatoração pós-MVP](ai_context/prompts/prompt-proximo-chat-refatoracao-app-vue-pos-mvp.md);
- [Plano de continuação pós-primeira fatia](ai_context/planos/plano-refatoracao-app-vue-continuacao-pos-primeira-fatia.md);
- [Prompt de continuação pós-primeira fatia](ai_context/prompts/prompt-proximo-chat-refatoracao-app-vue-continuacao-pos-primeira-fatia.md).

Decisão:
- seguir com refatoração incremental, priorizando `useStatsSummary`,
  `useAppNavigation`, `useRouteLifecycle` e depois extrações cuidadosas de
  estudo e importação APKG;
- não introduzir store global nesta frente;
- manter efeitos transversais por callbacks nomeados;
- manter estado pesado perto de sua limpeza;
- aceitar que `App.vue` ainda fique grande temporariamente, desde que cada
  rodada reduza implementação de domínio sem esconder comportamento crítico.

## 60. Segunda Fatia da Refatoracao Pos-MVP do App.vue

Data: 2026-06-08
Branch de trabalho: `codex/refactor-app-vue-responsibilities`

A segunda fatia continuou a reducao incremental do `frontend/src/App.vue`, ainda
sem alterar rotas, UX, textos, contratos de API, regras de SRS ou fluxo APKG.

Mudancas aplicadas:
- `frontend/src/app/useStatsSummary.ts` criado para isolar `stats`,
  `refreshStats`, `clearStats` e `syncProgressRoute`;
- `frontend/src/app/useAppNavigation.ts` criado para abas, titulo, sidebar,
  modos derivados da rota e navegacao simples;
- `frontend/src/app/useRouteLifecycle.ts` criado para centralizar watchers de
  rota por callbacks nomeados;
- route adapters de Biblioteca, Estudo e Progresso deixaram de chamar lifecycle
  diretamente;
- `frontend/src/features/study/useStudySession.ts` iniciado com estado,
  computeds e atualizacao local de sessao de estudo;
- `frontend/src/features/study/studySessionTypes.ts` criado e reexportado por
  `routeContext.ts`;
- `frontend/src/features/library/useDeckManagement.test.ts` foi incorporado como
  teste esperado da refatoracao de gerenciamento.

Resultado:
- `App.vue` caiu para aproximadamente 1085 linhas;
- o arquivo segue como composition root, mas com menos derivacoes e menos estado
  interno de estudo;
- ainda restam blocos grandes e reduziveis: importacao APKG, auth flow,
  criacao de deck, workflows de estudo e algumas orquestracoes de biblioteca.

Validacoes executadas:
- `cd frontend && npm test` passou com 15 arquivos e 69 testes;
- `cd frontend && npm run build` passou;
- `git diff --check` passou.

Proximo passo:
- usar o
  [prompt App.vue explosion 3](ai_context/prompts/prompt-app.vue-explosion-3.md)
  para seguir com a extracao de APKG e, em seguida, estudo/auth em fatias
  seguras.

## 61. Terceira Fatia da Refatoracao Pos-MVP do App.vue

Data: 2026-06-08
Branch de trabalho: `codex/refactor-app-vue-responsibilities`

A terceira fatia extraiu o fluxo de importacao APKG de `frontend/src/App.vue`
sem alterar rotas, UX, textos, contratos de API ou o fluxo "entrar para
salvar".

Mudancas aplicadas:
- `frontend/src/features/import/useApkgImport.ts` criado para concentrar arquivo
  selecionado, preview, navegacao de cartas, face atual, indice de midia,
  object URLs, persistencia, cancelamento logico e limpeza de rota;
- `App.vue` passou a injetar APKG por callbacks nomeados para auth, biblioteca,
  stats, highlight, navegacao e feedback;
- a retomada pos-auth ficou explicita por `consumeReturnToImportAfterAuth`, com
  navegacao ainda coordenada no root;
- `frontend/src/features/import/useApkgImport.test.ts` adicionado para cobrir
  preview com midia, preservacao durante auth, persistencia autenticada e
  limpeza/revogacao de object URLs.

Resultado:
- `App.vue` caiu para aproximadamente 867 linhas;
- o arquivo segue como composition root, mas nao concentra mais estado pesado de
  APKG;
- as proximas fronteiras maiores sao completar `useStudySession` e, se isso
  ficar arriscado, extrair `useCreateDeckFlow` ou `useAuthFlow`.

Validacoes executadas:
- `cd frontend && npm test` passou com 16 arquivos e 73 testes;
- `cd frontend && npm run build` passou;
- `git diff --check` passou.

Proximo passo:
- usar o
  [prompt App.vue explosion 4](ai_context/prompts/prompt-app.vue-explosion-4.md)
  para continuar por estudo, criacao ou auth em fatias seguras.

## 62. Quarta Fatia da Refatoracao Pos-MVP do App.vue

Data: 2026-06-09
Branch de trabalho: `codex/refactor-app-vue-responsibilities`

A quarta fatia tratou especificamente timers, debounce e cleanup local de
recursos temporarios. O objetivo foi remover timers manuais de
`frontend/src/App.vue` sem alterar comportamento de busca, paginacao,
highlight, rotas, textos ou contratos de API.

Mudancas aplicadas:
- `frontend/src/composables/useDebouncedWatch.ts` criado como helper simples de
  debounce com cleanup pelo proprio `watch`;
- `frontend/src/app/useLibrarySearchLifecycle.ts` criado para concentrar o
  debounce de `librarySearch`;
- debounce de `managedCardsSearch` movido para `useDeckManagement`;
- `useDeckLibrary` passou a armazenar e cancelar tanto timeout quanto
  `requestAnimationFrame` do highlight, com `onScopeDispose`;
- `App.vue` ficou sem `setTimeout`, `clearTimeout` ou
  `requestAnimationFrame` manuais.

Testes adicionados/ajustados:
- fake timers para `useDebouncedWatch`;
- fake timers para busca da biblioteca;
- fake timers para busca de cartas gerenciadas;
- fake timers para duracao e cleanup do highlight.

Resultado:
- `App.vue` ficou com aproximadamente 851 linhas;
- timers restantes ficaram encapsulados com ownership local;
- `showLoading: false` nos debounces foi preservado;
- a duracao visual do highlight permaneceu em 10 segundos.

Validacoes executadas:
- `cd frontend && npm test` passou com 18 arquivos e 81 testes;
- `cd frontend && npm run build` passou;
- `git diff --check` passou.

Observacao operacional:
- `npm test` e `npm run build` precisaram ser executados fora do sandbox local
  porque o carregamento do `vite.config.ts` falhou no sandbox com erro de acesso
  negado.

## 63. Revisao Final do App.vue como Composition Root

Data: 2026-06-09
Branch de trabalho: `codex/refactor-app-vue-responsibilities`

A frente de refatoracao do `frontend/src/App.vue` foi fechada com uma revisao
final dos imports, destructurings e contratos de rota, sem alterar rotas, UX,
textos, contratos de API, regras de SRS, fluxo APKG, paginacao, debounce, auth
ou logout.

Mudancas aplicadas:
- `App.vue` ficou com aproximadamente 583 linhas e passou a ser lido como
  composition root: instancia composables globais e de dominio, conecta
  callbacks transversais, usa `useRouteLifecycle`, publica providers de rota e
  renderiza o shell;
- a sobra `selectedManagedCardIds` foi removida do root, pois o contrato visual
  usa `managedCardsView` para selecao de cartas gerenciadas;
- `studyQueue` deixou de ser publicado em `studyRouteKey`, porque a tela de
  estudo consome apenas `currentCard`, HTML sanitizado, progresso, feedback e
  resumo;
- `routeContext.ts` removeu o tipo auxiliar `ModelRef` e o import de
  `WritableComputedRef`, ambos sem consumidor;
- os providers permaneceram inline em `App.vue`, pois a lista explicita de
  portas ainda e a forma mais clara de revisar o contrato entre root e rotas
  visuais.

Decisao:
- a refatoracao nao introduziu store global nem dependencia nova;
- logout continua no root porque coordena biblioteca, estudo, sessao, stats e
  roteamento;
- nao foi criado prompt de continuidade para esta frente, pois nao restou
  fronteira imediata dentro do escopo planejado.

Validacoes executadas:
- `cd frontend && npm run build`;
- `git diff --check`.

## 64. Lapidação da Sessão de Estudo e Melhoria de DX

Data: 2026-06-10
Branch de trabalho: `codex/study-mode-interleaved-polish`

Esta frente focou em aprimorar o fluxo e a experiência da sessão de estudos, além de resolver débitos técnicos no ambiente de desenvolvimento local (DX).

Decisões de UX na Prática Intercalada:
- A aba lateral "Prática intercalada" foi removida da navegação global (`AppShell.vue`) para evitar que a funcionalidade parecesse uma página isolada e sem contexto.
- Em seu lugar, foi adotada a mecânica de "Seleção de Múltiplos Baralhos" diretamente na Biblioteca, onde o usuário clica em "Selecionar", marca os baralhos desejados e clica no botão contextual para iniciar a prática.

Decisões no Fluxo de Cartas e SRS:
- **Botão Pular (Skip)**: A ideia de um botão "Voltar carta" foi matematicamente rejeitada, pois voltar e refazer uma avaliação corrompe a integridade do Algoritmo de Repetição Espaçada (SM-2) já registrado no banco de dados. Como alternativa segura, adicionamos o botão "Pular carta", que empurra o card atual para o final da fila local sem disparar chamadas na API.
- **Previsões de Intervalo**: A notificação global verde que informava os dias decorridos após cada clique foi removida por atrapalhar a leitura. Para não perder a transparência do algoritmo, passamos a prever os intervalos de tempo (`predictedIntervals`) e injetá-los diretamente dentro de cada botão ("< 10m", "1 d", "4 d", etc.) antes mesmo de o usuário clicar.

Melhoria no Ambiente de Desenvolvimento (DX):
- Identificamos que o `docker-compose.dev.yml` operava com um `builder` estático (`npm run build -- --watch`) acoplado ao Nginx, o que anulava o Hot Module Replacement (HMR) e gerava travamentos ao sincronizar diretórios do Windows.
- O container frontend de desenvolvimento foi reescrito para utilizar o **Vite Dev Server** nativo (`npm run dev`) na porta 80.
- Criamos um `frontend/Dockerfile.dev` puramente Node (isolando-o da build do Nginx) e habilitamos o `usePolling` no Vite para sincronização perfeita de arquivos via volumes do Docker Desktop.

## 65. Integração da Seleção de Biblioteca com Estudo e Ajustes Visuais

Data: 2026-06-10
Branch de trabalho: `fix/deck_selection`

Foi finalizado o fluxo de "Prática intercalada" com o foco em reduzir atritos para o usuário. 

Decisões de Navegação e UX:
- Foi adicionado o botão "Estudar selecionados" na barra de ações da biblioteca quando em modo de seleção múltipla.
- Em vez de direcionar o usuário para a página de seleção da prática intercalada, a rota `/study/interleaved` agora detecta automaticamente os IDs passados por parâmetro na URL (`?decks=x,y`).
- O orquestrador da rota (`syncStudyRoute` em `App.vue`) foi modificado para que, caso a rota possua baralhos pré-selecionados, a sessão de estudos seja iniciada imediatamente, removendo a necessidade de um clique adicional de confirmação pelo usuário.

Melhorias Visuais e Acessibilidade:
- A cor de fundo da área da biblioteca (`--color-library-section-bg`) foi ligeiramente clareada no modo claro para proporcionar um respiro visual.
- A cor de hover nos cartões dos baralhos foi ajustada para `--color-focus` (um tom levemente mais escuro) de forma a garantir maior contraste em relação à nova cor de fundo, resolvendo o problema de contraste na navegação.

## 66. Gestão de Perfil e Formatação de Cartas (Planejamento)

Data: 2026-06-10
Branch de trabalho: `feature/profile-management`

Avançando além do escopo inicial, foram mapeados dois novos passos importantes na evolução do projeto:
1. **Gestão de Perfil**: Permitir que o usuário atualize seu Nome de Exibição (`DisplayName`), altere sua senha exigindo a antiga, e possa excluir sua conta (hard delete em cascata).
2. **Formatação de Cartas**: Oferecer ferramentas para formatação rica das cartas ao criá-las.

A primeira branch, `feature/profile-management`, iniciou a Gestão de Perfil. Para garantir a segurança e integridade dos dados, o hard delete removerá em cascata Progresso, Baralhos Privados, Cartas e Mídias do usuário. As alterações no `principios-e-padroes-mvp.md` também moveram a "gestão de perfil" para o escopo "Incluído".

## 67. Conclusão da Gestão de Perfil

Data: 2026-06-10
Branch de trabalho: `feature/profile-management`

O recurso de Gestão de Perfil foi concluído com sucesso. 
Implementações:
- Backend: Criado o `ProfileController` com endpoints protegidos para atualizar nome, atualizar senha (com verificação da senha antiga) e excluir a conta. Adicionado também o script de migração Flyway `V6__add_cascade_delete_to_decks.sql` para garantir a deleção em cascata (ON DELETE CASCADE) de todos os dados do usuário.
- Frontend: Implementado a rota `Meu Perfil` com formulários para atualização de dados e o componente modal `AccountDeleteModal.vue` para confirmar a exclusão com a redigitação do e-mail.
- UX/UI: Refinada a aparência do botão "Excluir minha conta" (Outlined Danger), melhorando o contraste da ação de exclusão.
- Adição da aba "Meu Perfil" e testes ajustados tanto no frontend quanto no backend.

O próximo passo agora será iniciar a **Formatação de Cartas (Rich Text)**. Um plano de implementação foi gerado e aguarda aprovação para ser integrado.

## 68. Editor de Cartas WYSIWYG (Tiptap)

Data: 2026-06-10
Branch de trabalho: `feature/card-editor-wysiwyg`

A edição de cartas no formato de texto puro (`<textarea>`) com injeção manual de marcadores foi substituída por um editor WYSIWYG real.

Decisões de UX e Arquitetura:
- A biblioteca escolhida foi o **Tiptap** (nativo para Vue 3, headless, sem CSS forçado e compatível com as regras de design minimalista do MVP).
- O `CardEditorOverlay.vue` foi refatorado para usar o novo componente encapsulado `RichTextEditor.vue`, que inclui uma barra de ferramentas (toolbar) com Negrito, Itálico, Sublinhado, Listas e Mídia (Imagens/Áudio).
- Como o editor já exibe o que o usuário vai obter no final, a seção de *Preview* redundante, que ficava no overlay, foi removida.
- O clique na caixa de texto foi ajustado (CSS `.tiptap` com `min-height: 100%`) para garantir que o foco seja ativado ao clicar em qualquer área vazia.
- A restrição inicial de que áudios inseridos (`[sound:xxx]`) apareciam apenas como texto estático levantou a necessidade de um player tocável dentro do editor WYSIWYG, o que será abordado em seguida.

## 69. Extensão Nativa de Áudio e Gravação via Microfone

Data: 2026-06-11
Branch de trabalho: `feature/card-editor-wysiwyg`

A experiência WYSIWYG foi consolidada com suporte completo à mídia e gravação nativa.

Implementações:
- **AnkiSoundExtension**: Criada uma extensão customizada no Tiptap que age como uma "capa da invisibilidade". Ela varre o conteúdo procurando a sintaxe do Anki (`[sound:xxx]`) e injeta um `<audio controls data-anki-sound="xxx">` diretamente na área de edição. Ao salvar, a extensão limpa o HTML e devolve a string `[sound:xxx]` original para o banco de dados.
- **Gravação de Áudio Nativca**: Implementado o composable `useAudioRecorder` utilizando a **Web Audio API** (`MediaRecorder`). Adicionado um botão de Microfone na barra de ferramentas do editor. Ao clicar, o sistema grava o áudio do usuário (com limite de 60s), empacota o arquivo gerado (como `.webm` ou `.mp4`) e dispara a mesma rotina de upload de arquivos do servidor. O arquivo sobe, o backend retorna a tag `[sound:...]`, e a extensão renderiza o player de áudio na mesma hora.
- **UI Tweak**: O painel de gerenciamento de baralhos ganhou um contorno verde sólido (2px da cor `--color-success-border`) para melhor definição e contraste.

## 70. Desacoplamento de Estado Global (Migração para Pinia)

Data: 2026-06-11
Branch de trabalho: `refactor/app-vue-architecture`

A arquitetura inicial utilizava composables com refs soltos no arquivo para gerenciar estado global (como `useFeedback`). Com a evolução das rotas e testes, observou-se instabilidades de ciclo de vida (Vue emitindo warnings de `onScopeDispose` vazando) e sujeira em ambientes de Teste (Vitest).

Decisões de Refatoração:
- Adotamos o **Pinia** estritamente para estados transversais complexos como Feedback (e futuramente Autenticação/Notificações).
- A refatoração transformou o antigo `useFeedback` (stateful) na store oficial `useFeedbackStore`.
- Para poupar quebras de código, a interface da store (`showError`, `withFeedback`) continuou idêntica à antiga, mitigando a dor da migração.
- Desenvolvemos scripts em Python (`fix_errors.py`, `fix_syntax.py`) para realizar a substituição em lote dos imports em dezenas de componentes.
- Estabelecemos uma nova regra estrita nos testes do Vitest: todos os `beforeEach` que dependam do Pinia devem iniciar com `setActivePinia(createPinia())` para criar um ambiente isolado (Sandboxed) por teste.
- O aviso de Memory Leak originado do `onScopeDispose` em `LibraryRoute.vue` foi corrigido retirando composables da fase de mapeamento lambda (`renderList`).

 # #   7 1 .   T r a n s i � � o   p a r a   P i n i a   ( F a s e s   2   e   3 ) 
 
 D a t a :   2 0 2 6 - 0 6 - 1 2 
 B r a n c h   d e   t r a b a l h o :    e a t u r e / p i n i a - a u t h - e - l i b r a r y ` n 
 A   r e f a t o r a � � o   c o m   P i n i a   a v a n � o u   p a r a   c o b r i r   a   A u t e n t i c a � � o   e   a   B i b l i o t e c a   d e   B a r a l h o s ,   a l i v i a n d o   o   A p p . v u e   q u e   a g o r a   d e l e g o u   c o m p l e t a m e n t e   a   l � g i c a   d e   d a d o s   p a r a   a s   S t o r e s . 
 
 I m p l e m e n t a � � e s : 
 -   * * A u t h S t o r e * * :   C r i a d o   o   u s e A u t h S t o r e   q u e   g e r e n c i a   o   u s u � r i o   a t i v o   e   o   t o k e n   J W T .   A   c o m u n i c a � � o   d e   a u t e n t i c a � � o   f o i   i s o l a d a . 
 -   * * L i b r a r y S t o r e   &   D e c k M a n a g e m e n t S t o r e * * :   C r i a d o s   p a r a   l i d a r   c o m   a   b u s c a   d e   b a r a l h o s   p � b l i c o s ,   b a r a l h o s   p r i v a d o s   e   a s   a � � e s   d e   e d i � � o / e x c l u s � o   c o n t e x t u a l . 
 -   * * T e s t e s   A j u s t a d o s * * :   A d i c i o n a d o s   m o c k s   d e   u s e L i b r a r y S t o r e   e   u s e A u t h S t o r e   n o s   t e s t e s   q u e   s u b i a m   o   V i t e s t   s e m   c o n t e x t o   V u e   l i m p o . 
 -   T o d o s   o s   t e s t e s   V i t e s t   ( 1 0 7 / 1 0 7 )   e   E 2 E   P l a y w r i g h t   ( 1 4 / 1 4 )   p a s s a r a m   a p � s   a   r e f a t o r a � � o .  
 