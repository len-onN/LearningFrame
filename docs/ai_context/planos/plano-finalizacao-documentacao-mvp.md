# Plano da Branch: Finalizacao e Documentacao do MVP

Data de abertura: 2026-06-08
Branch de trabalho: `codex/mvp-final-documentation`

## 1. Confirmacoes iniciais

Base confirmada:
- `codex/qa-manual-final` foi integrada em `develop`;
- `develop` local foi atualizado por fast-forward ate `257d2f4`, merge do PR
  de QA manual final;
- a branch `codex/mvp-final-documentation` foi criada a partir desse `develop`;
- a worktree estava limpa no inicio da branch.

Documentos obrigatorios considerados:
- [README](../../../README.md);
- [Diario de bordo](../../diario-de-bordo.md);
- [Consideracoes pre-finalizacao](../arquitetura-e-decisoes/consideracoes-pre-finalizacao.md);
- [Arquitetura UX de baralhos](../arquitetura-e-decisoes/arquitetura-ux-baralhos.md);
- [Roteamento e ciclo de vida](../arquitetura-e-decisoes/arquitetura-frontend-roteamento-ciclo-de-vida.md);
- [Plano Momento 8 E2E](plano-momento-8-testes-e2e.md);
- [Plano E2E de risco](plano-e2e-risk-flows-mvp.md);
- [Plano de polimento do estudo](plano-study-session-polish-mvp.md);
- [Plano de QA manual final](plano-qa-manual-final-mvp.md);
- [Relatorio de QA manual final](../../relatorio-qa-manual-final-mvp.md);
- [Prompt de documentacao final](../prompts/prompt-proximo-chat-finalizacao-documentacao-mvp.md).

Arquivos tecnicos conferidos para evitar divergencias:
- `package.json`;
- `frontend/package.json`;
- `docker-compose.yml`;
- `docker-compose.dev.yml`;
- `docker-compose.e2e.yml`;
- `backend/pom.xml`;
- `backend/src/main/resources/application.yml`;
- `frontend/src/services/api.ts`;
- `scripts/e2e/run-e2e.mjs`.

## 2. Objetivo da branch

Fechar a documentacao final do MVP com base no produto real validado, sem
adicionar novas features.

Objetivos principais:
- contextualizar o LearningFrame como MVP academico;
- explicar a proposta pedagogica de recordacao ativa, repeticao espacada e
  pratica intercalada;
- ensinar o uso da aplicacao para estudo;
- documentar a integracao basica com Anki por `.apkg`;
- explicar como executar o projeto por Docker Compose e por execucao local
  direta;
- consolidar escopo final, limites, riscos aceitos, validacoes e pos-MVP;
- deixar o README como entrada curta e os detalhes em documentos focados.

Nao objetivos:
- alterar comportamento funcional;
- reabrir scheduler/SRS;
- adicionar novas telas ou fluxos;
- ampliar suporte APKG;
- transformar os documentos historicos em manuais completos;
- esconder limites tecnicos conhecidos do MVP.

## 3. Publicos da documentacao

### Avaliador academico

Precisa entender:
- problema tratado;
- objetivos do MVP;
- escopo entregue;
- arquitetura tecnica;
- validacoes executadas;
- riscos aceitos;
- trabalhos futuros.

### Usuario estudante

Precisa conseguir:
- estudar sem conta;
- criar conta quando quiser persistir;
- salvar ou criar baralhos;
- criar cartas e midias;
- usar estudo por baralho;
- usar pratica intercalada;
- interpretar progresso e feedback de estudo.

### Pessoa tecnica

Precisa conseguir:
- subir a aplicacao com Docker Compose;
- rodar backend e frontend em modo local;
- entender portas e variaveis;
- executar testes;
- rodar E2E sem tocar no banco dev;
- localizar docs de arquitetura e QA.

## 4. Documentos planejados

### [README](../../../README.md)

Papel:
- porta de entrada do repositorio;
- resumo do produto, stack, execucao, validacoes e links.

Ajustes:
- manter curto;
- apontar para guias novos;
- refletir o resultado final do QA manual e E2E;
- destacar que detalhes de uso, APKG e execucao local ficam em docs proprios.

### [Guia de uso do MVP](../../guia-de-uso-mvp.md)

Papel:
- manual do usuario do MVP.

Conteudo:
- estudar como visitante;
- criar conta;
- salvar baralho publico;
- criar baralho proprio;
- criar, editar e excluir cartas;
- inserir imagem e audio;
- estudar por baralho;
- usar pratica intercalada;
- entender progresso, feedback, resumo, controles de fonte e ajuste de midia.

### [Guia de integracao com Anki/APKG](../../guia-anki-apkg-mvp.md)

Papel:
- explicar a interoperabilidade com Anki.

Conteudo:
- o que o `.apkg` representa;
- como fazer preview anonimo;
- como salvar depois do login;
- como midias sao tratadas;
- o que nao e preservado;
- cuidados com arquivos grandes e direitos de conteudo.

### [Guia de execucao local](../../guia-execucao-local-mvp.md)

Papel:
- guia operacional tecnico.

Conteudo:
- requisitos;
- Docker Compose principal;
- execucao direta de backend e frontend;
- Compose dev com build watch do frontend;
- comandos de testes;
- E2E dedicado;
- troubleshooting curto.

### [Estado final do MVP](../../estado-final-mvp.md)

Papel:
- consolidacao final da entrega.

Conteudo:
- estado final do produto;
- funcionalidades incluidas;
- funcionalidades fora do MVP;
- arquitetura resumida;
- validacoes executadas;
- riscos aceitos;
- pos-MVP;
- sugestao de marco/tag `v0.1.0-mvp`;
- roteiro de demonstracao academica.

### [Principios e padroes do MVP](../../principios-e-padroes-mvp.md)

Papel:
- registrar o contrato atual do MVP para futuras branches.

Conteudo:
- principios de produto;
- padroes frontend/backend;
- regras APKG;
- regras E2E;
- documentacao canonica e contexto historico.

### [AI Context](../README.md)

Papel:
- preservar prompts, planos, snapshots e memoria de decisoes.

Conteudo:
- README da pasta;
- linha do tempo;
- memoria narrativa de decisoes;
- subpastas de prompts, planos, arquitetura/decisoes e snapshots.

### [Diario de bordo](../../diario-de-bordo.md)

Papel:
- manter o historico do projeto.

Ajustes:
- registrar abertura desta branch;
- registrar documentos criados;
- registrar validacoes documentais ao fechamento.

## 5. Ordem de implementacao

1. Criar este plano e registrar abertura no diario.
2. Criar guias focados:
   - uso;
   - Anki/APKG;
   - execucao local;
   - estado final do MVP.
3. Criar principios e padroes atuais do MVP.
4. Reorganizar contexto historico em `docs/ai_context/`.
5. Atualizar README como indice e resumo final.
6. Revisar consistencia entre os documentos.
7. Rodar validacoes documentais:
   - `git diff --check`;
   - revisao manual do diff.

## 6. Criterios de aceite

A branch sera considerada pronta quando:
- os documentos novos explicarem o uso real do MVP;
- a integracao APKG estiver documentada com limites claros;
- a execucao por Docker e local direta estiver documentada com comandos atuais;
- README apontar para os documentos certos;
- o estado final do MVP estiver consolidado;
- riscos aceitos e pos-MVP estiverem claros;
- nenhuma feature nova tiver sido adicionada;
- `git diff --check` passar.

## 7. Validacoes planejadas

Como a branch e documental:
- `git diff --check`;
- revisao manual dos documentos alterados.

Se algum arquivo tecnico for alterado por necessidade inesperada:
- `npm test`;
- `npm run build`;
- `npm run e2e`, se tocar fluxo coberto por E2E;
- testes backend Maven, se houver alteracao backend.
