# Memoria de Decisoes do LearningFrame

Este documento registra mudancas importantes de direcao. Ele complementa a
linha do tempo: a linha do tempo diz quando algo aconteceu; esta memoria explica
por que algumas decisoes mudaram.

Para o estado atual normativo, consulte
[Principios e padroes do MVP](../principios-e-padroes-mvp.md).

## 1. Conta opcional para experimentar

Decisao inicial considerada:
- exigir conta poderia simplificar persistencia e progresso.

Problemas:
- aumentaria atrito antes do usuario entender o valor do produto;
- enfraqueceria a demonstracao rapida em contexto academico;
- tornaria APKG preview e estudo publico menos acessiveis.

Decisao final:
- visitantes podem estudar baralhos publicos e fazer preview APKG;
- conta e obrigatoria apenas para persistir baralhos, midias, revisoes e
  progresso.

Estado atual:
- documentado no [guia de uso do MVP](../guia-de-uso-mvp.md);
- preservado como principio em
  [Principios e padroes do MVP](../principios-e-padroes-mvp.md).

## 2. De "modo caos" para pratica intercalada

Decisao inicial:
- usar um nome mais informal para o estudo misto.

Problemas:
- o termo nao ajudava a narrativa academica;
- parecia uma feature de personalidade, nao uma tecnica de estudo;
- poderia confundir avaliadores e usuarios.

Decisao final:
- usar `Pratica intercalada`, alinhado ao vocabulario pedagogico do MVP.

Estado atual:
- pratica intercalada e fluxo central, mas simples;
- configuracao avancada de sessao fica pos-MVP.

## 3. APKG: de rascunho local para preview temporario

Decisao inicial:
- APKG importado anonimamente poderia virar rascunho local persistido no
  navegador.

Problemas encontrados:
- APKGs reais podem conter muita midia;
- `localStorage` nao e adequado para midia pesada;
- apos refresh, um rascunho podia sobreviver sem o arquivo original;
- Biblioteca misturava baralhos prontos com conteudo temporario incompleto;
- a experiencia ficava enganosa para estudo real.

Decisao final:
- APKG anonimo e temporario;
- preview com midia local sob demanda;
- object URLs revogadas ao sair da importacao;
- preservacao somente no fluxo explicito `entrar para salvar`;
- persistencia exige usuario autenticado.

Estado atual:
- documentado no [guia de integracao com Anki/APKG](../guia-anki-apkg-mvp.md);
- limites consolidados em [Estado final do MVP](../estado-final-mvp.md).

## 4. Interoperabilidade com Anki, nao clone do Anki

Decisao inicial possivel:
- tentar preservar mais detalhes do Anki ao importar.

Problemas:
- cloze avancado, templates complexos e historico de revisao aumentariam muito
  o escopo;
- preservar scheduler original conflitaria com a proposta de uma agenda propria;
- o MVP ficaria dificil de explicar e validar.

Decisao final:
- usar `.apkg` como interoperabilidade basica;
- mapear frente, verso, tags e midias simples;
- iniciar agenda propria de revisao no LearningFrame;
- deixar `.colpkg`, cloze avancado, templates complexos e historico fora do MVP.

Estado atual:
- suportado como limite consciente, nao bug.

## 5. Biblioteca: de baralhos locais para baralhos prontos

Decisao inicial:
- Biblioteca poderia listar tambem baralhos locais importados anonimamente.

Problemas:
- rascunhos APKG locais podiam ficar incompletos;
- midias pesadas no navegador tornavam a experiencia fragil;
- misturava preview com conteudo pronto para estudo;
- dificultava explicar o ciclo de vida da importacao.

Decisao final:
- Biblioteca lista baralhos publicos e baralhos persistidos do usuario;
- Importar e a superficie de preview e decisao;
- Estudo usa baralhos publicos ou persistidos.

Estado atual:
- `Baralhos locais` ficou fora do modelo mental do MVP.

## 6. Gerenciamento contextual de baralhos e cartas

Decisao inicial:
- acoes de criacao/edicao ficavam mais fragmentadas entre telas.

Problemas:
- usuario perdia contexto ao criar ou editar cartas;
- a Biblioteca nao resolvia plenamente a gestao dos proprios baralhos;
- modais simples seriam apertados para um editor com preview e midia.

Decisao final:
- `Meus baralhos` ganhou gerenciamento contextual;
- cartas sao gerenciadas dentro do baralho;
- editor de cartas abre em overlay dedicado com preview;
- upload de midia injeta marcadores no HTML da carta.

Estado atual:
- documentado historicamente em
  [Arquitetura UX de baralhos](arquitetura-e-decisoes/arquitetura-ux-baralhos.md);
- comportamento de usuario documentado no
  [guia de uso do MVP](../guia-de-uso-mvp.md).

## 7. Frontend: refatoracao incremental em vez de rewrite

Decisao inicial possivel:
- reescrever toda a aplicacao ou mover rapidamente para store global.

Problemas:
- risco alto na reta final do MVP;
- muitas features ja estavam funcionais;
- store global poderia virar novo ponto de acoplamento antes da necessidade.

Decisao final:
- introduzir Vue Router;
- extrair shell e paginas;
- manter paginas como superficies visuais controladas por props/eventos;
- usar route adapters para conectar router e contexto;
- adiar store global;
- manter `App.vue` como orquestrador temporario.

Estado atual:
- padrao normativo em
  [Principios e padroes do MVP](../principios-e-padroes-mvp.md);
- historia detalhada em
  [Roteamento e ciclo de vida](arquitetura-e-decisoes/arquitetura-frontend-roteamento-ciclo-de-vida.md).

## 8. E2E dedicado em vez de banco dev

Decisao inicial possivel:
- rodar Playwright contra o ambiente dev existente.

Problemas:
- risco de apagar dados manuais;
- testes ficariam dependentes do estado local;
- reset confiavel seria mais dificil;
- resultados seriam menos reproduziveis.

Decisao final:
- criar `docker-compose.e2e.yml`;
- usar Compose project `learningframe-e2e`;
- usar banco `learningframe_e2e`;
- expor MySQL E2E em `3317`;
- resetar por endpoint interno apenas no profile `e2e`;
- derrubar com `down -v`.

Estado atual:
- regra critica preservada nos guias e no README.

## 9. Midias como BLOB no MySQL para o MVP

Decisao inicial possivel:
- usar storage externo desde cedo.

Problemas:
- aumentaria infraestrutura;
- tornaria execucao local mais pesada;
- desviaria foco do MVP academico.

Decisao final:
- persistir midias como BLOB no MySQL;
- documentar isso como aceitavel para MVP;
- mover storage externo para pos-MVP.

Estado atual:
- risco aceito em [Estado final do MVP](../estado-final-mvp.md).

## 10. Audit Vitest: correcao controlada

Problema:
- `npm audit` apontou vulnerabilidade critica em `vitest <4.1.0`.

Alternativa considerada:
- usar `npm audit fix --force` diretamente.

Problemas:
- atualizacao potencialmente breaking;
- risco de alteracao ampla em lockfile sem entendimento.

Decisao final:
- analisar impacto em branch curta;
- atualizar para `vitest@4.1.8`;
- validar com `npm test`, `npm run build` e E2E.

Estado atual:
- pendencia critica tratada.

## 11. Estudo: de fluxo basico para sessao guiada

Estado inicial:
- revelar resposta;
- avaliar rating;
- fila diminui.

Problemas:
- experiencia parecia funcional, mas pouco guiada;
- usuario nao via bem progresso de sessao;
- conclusao normal dependia de feedback menos contextual;
- midias grandes podiam prejudicar foco no estudo.

Decisao final:
- adicionar progresso de sessao;
- adicionar feedback local apos rating;
- adicionar resumo final;
- melhorar empty states;
- adicionar controle local de fonte;
- adicionar ajuste de midia grande ao card.

Estado atual:
- documentado no [guia de uso do MVP](../guia-de-uso-mvp.md);
- planejado historicamente no
  [plano de polimento do estudo](planos/plano-study-session-polish-mvp.md).
