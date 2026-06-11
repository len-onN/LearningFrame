# Memória de Decisões do LearningFrame

Este documento registra mudanças importantes de direção. Ele complementa a
linha do tempo: a linha do tempo diz quando algo aconteceu; esta memória explica
por que algumas decisões mudaram.

Para o estado atual normativo, consulte
[Princípios e padrões do MVP](../principios-e-padroes-mvp.md).

## 1. Conta opcional para experimentar

Decisão inicial considerada:
- exigir conta poderia simplificar persistência e progresso.

Problemas:
- aumentaria atrito antes do usuário entender o valor do produto;
- enfraqueceria a demonstração rápida em contexto acadêmico;
- tornaria APKG preview e estudo público menos acessíveis.

Decisão final:
- visitantes podem estudar baralhos públicos e fazer preview APKG;
- conta é obrigatória apenas para persistir baralhos, mídias, revisões e
  progresso.

Estado atual:
- documentado no [guia de uso do MVP](../guia-de-uso-mvp.md);
- preservado como princípio em
  [Princípios e padrões do MVP](../principios-e-padroes-mvp.md).

## 2. De "modo caos" para prática intercalada

Decisão inicial:
- usar um nome mais informal para o estudo misto.

Problemas:
- o termo não ajudava a narrativa acadêmica;
- parecia uma feature de personalidade, não uma técnica de estudo;
- poderia confundir avaliadores e usuários.

Decisão final:
- usar `Prática intercalada`, alinhado ao vocabulário pedagógico do MVP.

Estado atual:
- prática intercalada e fluxo central, mas simples;
- configuração avançada de sessão fica pós-MVP.

## 3. APKG: de rascunho local para preview temporário

Decisão inicial:
- APKG importado anonimamente poderia virar rascunho local persistido no
  navegador.

Problemas encontrados:
- APKGs reais podem conter muita mídia;
- `localStorage` não é adequado para mídia pesada;
- após refresh, um rascunho podia sobreviver sem o arquivo original;
- Biblioteca misturava baralhos prontos com conteúdo temporário incompleto;
- a experiência ficava enganosa para estudo real.

Decisão final:
- APKG anônimo é temporário;
- preview com mídia local sob demanda;
- object URLs revogadas ao sair da importação;
- preservacao somente no fluxo explícito `entrar para salvar`;
- persistência exige usuário autenticado.

Estado atual:
- documentado no [guia de integração com Anki/APKG](../guia-anki-apkg-mvp.md);
- limites consolidados em [Estado final do MVP](../estado-final-mvp.md).

## 4. Interoperabilidade com Anki, não clone do Anki

Decisão inicial possível:
- tentar preservar mais detalhes do Anki ao importar.

Problemas:
- cloze avançado, templates complexos e histórico de revisão aumentariam muito
  o escopo;
- preservar scheduler original conflitaria com a proposta de uma agenda própria;
- o MVP ficaria difícil de explicar e validar.

Decisão final:
- usar `.apkg` como interoperabilidade básica;
- mapear frente, verso, tags e mídias simples;
- iniciar agenda própria de revisão no LearningFrame;
- deixar `.colpkg`, cloze avançado, templates complexos e histórico fora do MVP.

Estado atual:
- suportado como limite consciente, não bug.

## 5. Biblioteca: de baralhos locais para baralhos prontos

Decisão inicial:
- Biblioteca poderia listar também baralhos locais importados anonimamente.

Problemas:
- rascunhos APKG locais podiam ficar incompletos;
- mídias pesadas no navegador tornavam a experiência fragil;
- misturava preview com conteúdo pronto para estudo;
- dificultava explicar o ciclo de vida da importação.

Decisão final:
- Biblioteca lista baralhos públicos e baralhos persistidos do usuário;
- Importar é a superfície de preview e decisão;
- Estudo usa baralhos públicos ou persistidos.

Estado atual:
- `Baralhos locais` ficou fora do modelo mental do MVP.

## 6. Gerenciamento contextual de baralhos e cartas

Decisão inicial:
- ações de criação/edição ficavam mais fragmentadas entre telas.

Problemas:
- usuário perdia contexto ao criar ou editar cartas;
- a Biblioteca não resolvia plenamente a gestão dos próprios baralhos;
- modais simples seriam apertados para um editor com preview e mídia.

Decisão final:
- `Meus baralhos` ganhou gerenciamento contextual;
- cartas são gerenciadas dentro do baralho;
- editor de cartas abre em overlay dedicado com preview;
- upload de mídia injeta marcadores no HTML da carta.

Estado atual:
- documentado historicamente em
  [Arquitetura UX de baralhos](arquitetura-e-decisoes/arquitetura-ux-baralhos.md);
- comportamento de usuário documentado no
  [guia de uso do MVP](../guia-de-uso-mvp.md).

## 7. Frontend: refatoração incremental em vez de rewrite

Decisão inicial possível:
- reescrever toda a aplicação ou mover rapidamente para store global.

Problemas:
- risco alto na reta final do MVP;
- muitas features já estavam funcionais;
- store global poderia virar novo ponto de acoplamento antes da necessidade.

Decisão final:
- introduzir Vue Router;
- extrair shell e páginas;
- manter páginas como superfícies visuais controladas por props/eventos;
- usar route adapters para conectar router e contexto;
- adiar store global;
- manter `App.vue` como orquestrador temporário.

Estado atual:
- padrão normativo em
  [Princípios e padrões do MVP](../principios-e-padroes-mvp.md);
- historia detalhada em
  [Roteamento e ciclo de vida](arquitetura-e-decisoes/arquitetura-frontend-roteamento-ciclo-de-vida.md).

## 8. E2E dedicado em vez de banco dev

Decisão inicial possível:
- rodar Playwright contra o ambiente dev existente.

Problemas:
- risco de apagar dados manuais;
- testes ficariam dependentes do estado local;
- reset confiável seria mais difícil;
- resultados seriam menos reproduziveis.

Decisão final:
- criar `docker-compose.e2e.yml`;
- usar Compose project `learningframe-e2e`;
- usar banco `learningframe_e2e`;
- expor MySQL E2E em `3317`;
- resetar por endpoint interno apenas no profile `e2e`;
- derrubar com `down -v`.

Estado atual:
- regra critica preservada nos guias e no README.

## 9. Mídias como BLOB no MySQL para o MVP

Decisão inicial possível:
- usar storage externo desde cedo.

Problemas:
- aumentaria infraestrutura;
- tornaria execução local mais pesada;
- desviaria foco do MVP acadêmico.

Decisão final:
- persistir mídias como BLOB no MySQL;
- documentar isso como aceitável para MVP;
- mover storage externo para pós-MVP.

Estado atual:
- risco aceito em [Estado final do MVP](../estado-final-mvp.md).

## 10. Audit Vitest: correção controlada

Problema:
- `npm audit` apontou vulnerabilidade critica em `vitest <4.1.0`.

Alternativa considerada:
- usar `npm audit fix --force` diretamente.

Problemas:
- atualização potencialmente breaking;
- risco de alteração ampla em lockfile sem entendimento.

Decisão final:
- analisar impacto em branch curta;
- atualizar para `vitest@4.1.8`;
- validar com `npm test`, `npm run build` e E2E.

Estado atual:
- pendencia critica tratada.

## 11. Estudo: de fluxo básico para sessão guiada

Estado inicial:
- revelar resposta;
- avaliar rating;
- fila diminui.

Problemas:
- experiência parecia funcional, mas pouco guiada;
- usuário não via bem progresso de sessão;
- conclusão normal dependia de feedback menos contextual;
- mídias grandes podiam prejudicar foco no estudo.

Decisão final:
- adicionar progresso de sessão;
- adicionar feedback local após rating;
- adicionar resumo final;
- melhorar empty states;
- adicionar controle local de fonte;
- adicionar ajuste de mídia grande ao card.

Estado atual:
- documentado no [guia de uso do MVP](../guia-de-uso-mvp.md);
- planejado historicamente no
  [plano de polimento do estudo](planos/plano-study-session-polish-mvp.md).

## 12. Contexto institucional e prática intercalada pós-MVP

Problema percebido:
- a documentação final descrevia bem o MVP acadêmico, mas deixava implícito o
  contexto de produto;
- a prática intercalada existia como fluxo simples, mas sem seleção explícita
  de baralhos no frontend;
- o backend já aceitava `deckIds` no modo `MIXED_DUE`, mas essa capacidade não
  estava exposta na interface.

Decisão de contexto:
- apresentar o LearningFrame como uma aplicação gratuita de suporte ao
  aprendizado ofertada por uma instituição de ensino;
- manter a integração real com sistemas institucionais fora do MVP;
- tratar integração institucional como roadmap de profissionalização.

Decisão sobre prática intercalada:
- classificar seleção de baralhos para prática intercalada como candidata forte
  a ajuste de MVP/MVP+;
- manter a lógica atual por baralho como aceitável para o MVP acadêmico;
- classificar intercalamento por tags, tópicos ou variabilidade pedagógica como
  pós-MVP, pois exige heurística, testes e decisão própria.

Estado atual:
- consolidado no
  [Roadmap de profissionalização pós-MVP](../roadmap-profissionalizacao-pos-mvp.md).

## 13. Refatoração pós-MVP do App.vue por fatias

Problema:
- `frontend/src/App.vue` voltou a acumular responsabilidades demais após o MVP;
- o arquivo misturava shell, navegação, auth, biblioteca, gerenciamento,
  importação APKG, estudo, progresso e limpezas de estados temporários;
- reduzir linhas sem preservar ciclos de vida poderia esconder efeitos
  transversais importantes.

Alternativas consideradas:
- mover tudo rapidamente para composables;
- introduzir Pinia/store global para organizar estado;
- manter `App.vue` grande até uma refatoração ampla futura.

Problemas:
- mover tudo de uma vez aumentaria risco de regressão em APKG, estudo e auth;
- store global criaria ownership artificial para estados temporários e pesados;
- adiar toda a refatoração manteria alto custo cognitivo para evoluções
  pós-MVP.

Decisão:
- refatorar por fatias pequenas e verificáveis;
- começar por helpers puros e gerenciamento de deck/cartas;
- manter `App.vue` como composition root enquanto os domínios ganham fronteiras
  claras;
- passar dependências transversais por callbacks nomeados, como `refreshStats`,
  `navigateToMyDecks`, `showNotice`, `showError` e `withFeedback`;
- não introduzir store global nesta frente.

Estado atual:
- helpers puros extraídos para estudo, importação e biblioteca;
- `useDeckManagement` criado;
- `useDeckManagement.test.ts` incluido na leva de testes da refatoracao;
- `useStatsSummary`, `useAppNavigation` e `useRouteLifecycle` criados em
  `frontend/src/app`;
- `useStudySession` promovido para dono do fluxo de estudo, preservando SRS,
  estudo anonimo, estudo autenticado e pratica intercalada;
- `useApkgImport` criado para concentrar preview, persistencia, object URLs,
  cancelamento logico e cleanup APKG;
- `useDebouncedWatch` e `useLibrarySearchLifecycle` criados para remover
  debounces manuais do root;
- `useDeckManagement` assumiu o debounce de busca de cartas gerenciadas;
- `useDeckLibrary` passou a cancelar timeout e `requestAnimationFrame` do
  highlight via `onScopeDispose`;
- route adapters deixaram de expor/chamar lifecycle de dominio;
- `App.vue` caiu para aproximadamente 728 linhas, sem timers manuais e sem
  implementacao de carga/revisao de estudo, ainda com auth e algumas
  orquestracoes de biblioteca;
- próximos passos planejados em
  [plano final do App.vue como composition root](planos/plano-app-vue-composition-root-final.md)
  e no
  [prompt App.vue 4](prompts/prompt-app.vue-4.md);
- refatorações adicionais corrigiram warnings de ciclo de vida do Vue (`onScopeDispose`) instanciando os composables de domínio (`useDeckLibrary`, `useStudySession`, etc) no escopo de configuração das rotas pai (`LibraryRoute`, `StudyRoute`, etc) ao invés de instanciar solto no App.vue. Isso evitou falhas de reatividade.
- refinamos a UX da prática intercalada para apenas pré-selecionar o baralho atual (se houver), não iniciando com seleções aleatórias.
- bordas padronizadas nos painéis da biblioteca.

## 14. Limites Diários de Estudo no AppUser vs SRP

Problema:
- Precisamos armazenar configurações do usuário, como limites diários de cartas novas e revisões.
- O princípio de Single Responsibility (SRP) sugere separar configurações de domínio de usuário (que lidam primariamente com autenticação).

Alternativas consideradas:
- Criar entidade `UserSettings` (relação 1:1 com `AppUser`).
- Adicionar os campos diretamente em `AppUser`.

Problemas de separar:
- Para o escopo do MVP, a criação de uma tabela 1:1 apenas para dois campos introduz joins e complexidade desnecessária de persistência.
- Acarretaria maior sobrecarga cognitiva na gestão dos objetos, indo contra o minimalismo funcional esperado para a entrega imediata.

Decisão final:
- Adicionar `daily_new_cards_limit` e `daily_review_cards_limit` diretamente em `AppUser`.
- Aceitar a pequena quebra de SRP no MVP em prol de simplicidade estrutural e desempenho.
- O mapeamento lógico pode ser desacoplado futuramente caso configurações mais densas sejam adicionadas.

Estado atual:
- Decisão registrada no planejamento da funcionalidade `feature/daily-study-limits`.

## 15. Editor WYSIWYG e Media Nativos

Problema:
- Cartões exigiam formatação HTML bruta e marcação estrita para áudio (`[sound:xxx]`).
- Falta de praticidade para gravar áudios on-the-fly para estudo de pronúncia ou idiomas.

Alternativas consideradas:
- Quill, CKEditor ou Tiptap para WYSIWYG.
- Servidor para receber áudio cru e converter vs. `MediaRecorder` nativo no browser.

Decisão:
- **Tiptap**: Selecionado por ser headless e não conflitar com o Design System.
- **AnkiSoundExtension**: Desenvolvemos uma extensão customizada do Tiptap que faz parse bidirecional de `[sound:xxx]` para o player HTML `<audio>`, mascarando a complexidade para o usuário enquanto mantém compatibilidade estrita com Anki no banco de dados.
- **MediaRecorder API**: Implementamos gravação no frontend e despacho de blobs (`.webm` ou `.mp4`). Para evitar abusos, impôs-se um teto de 60 segundos por gravação e desabilitou-se a barra de formatação durante a captura.

Estado atual:
- Editor funcional implementado.
- Gravação de áudio web nativa habilitada no ambiente Tiptap.
