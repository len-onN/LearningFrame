# Prompt para o Proximo Chat: Ajuste do Modo de Estudo e Pratica Intercalada

Use este prompt para iniciar ou retomar a implementacao desta branch do
LearningFrame.

```txt
Estamos no projeto LearningFrame.

Contexto operacional:
- Workspace local: C:\Users\lenon\OneDrive\Documentos\LearningFrame
- Branch de trabalho prevista/atual: codex/study-mode-interleaved-polish
- Base observada no planejamento: develop em b59e02b
- Antes de editar, confirme branch atual, estado do Git e se ha mudancas nao
  commitadas.
- Se houver mudancas nao commitadas, nao sobrescreva; leia e trabalhe com elas.
- Commits devem seguir Conventional Commits e ser escritos em portugues.

Objetivo da branch:
- Corrigir a escala de fonte dos cards de estudo.
- Trocar o seletor fixo de tamanho por controle incremental A- e A+, com
  limites.
- Permitir aumentar a fonte pelo menos uma ou duas etapas alem do maior tamanho
  atual.
- Expor selecao de baralhos para a pratica intercalada.
- Manter o estudo simples, guiado e sem alterar o SRS.

Documentos obrigatorios para ler:
- docs/principios-e-padroes-mvp.md
- docs/diario-de-bordo.md
- docs/ai_context/README.md
- docs/ai_context/memoria-de-decisoes.md
- docs/ai_context/linha-do-tempo.md
- docs/ai_context/planos/plano-ajuste-modo-estudo-pratica-intercalada.md

Arquivos tecnicos obrigatorios para inspecionar:
- frontend/src/pages/StudyPage.vue
- frontend/src/assets/styles.css
- frontend/src/utils/html.ts
- frontend/src/utils/html.test.ts
- frontend/src/features/study/useStudySession.ts
- frontend/src/features/study/useStudySession.test.ts
- frontend/src/routes/routeContext.ts
- frontend/src/App.vue
- frontend/src/services/api.ts
- frontend/src/types/api.ts
- backend/src/main/java/com/learningframe/api/study/StudyController.java
- backend/src/main/java/com/learningframe/api/study/StudyService.java
- backend/src/main/java/com/learningframe/api/repository/CardRepository.java

Diagnostico resumido:
- O controle atual de fonte usa tres estados fixos: compact, default e large.
- O estado padrao usa clamp com vw, enquanto compact e large usam rem fixo.
- Isso pode fazer o card abrir com escala diferente da logica dos controles.
- safeStudyHtml remove scripts e handlers, mas nao remove font-size embutido em
  style/HTML da carta.
- A pratica intercalada autenticada chama MIXED_DUE sem deckIds.
- A pratica intercalada anonima usa os primeiros quatro baralhos publicos.
- O backend ja aceita deckIds em /api/study/due para MIXED_DUE.
- O frontend ainda nao expoe essa capacidade.

Escopo de implementacao:
1. Tipografia do estudo:
   - trocar studyFontSize por studyFontLevel numerico;
   - usar A- e A+ como controles incrementais;
   - desabilitar botoes nos limites;
   - remover fonte baseada em viewport no card de estudo;
   - criar escala em rem com maximo maior que o tamanho atual;
   - normalizar font-size embutido no HTML exibido no estudo, sem alterar o
     conteudo salvo.

2. Pratica intercalada:
   - atualizar api.due para aceitar deckIds e limit;
   - criar estado de selecao de baralhos;
   - preparar a rota /estudo/intercalado como etapa de escolha;
   - permitir selecionar baralhos com checkboxes;
   - iniciar MIXED_DUE com deckIds selecionados no fluxo autenticado;
   - no fluxo anonimo, carregar apenas publicos selecionados;
   - intercalar cartas anonimas por baralho, nao apenas concatenar;
   - manter progresso, feedback local e resumo final existentes.

Fora de escopo:
- trocar algoritmo SRS;
- criar dashboard;
- persistir preferencia de fonte;
- criar selecao por tags/topicos;
- criar store global;
- refatorar amplamente App.vue;
- mudar backend se o contrato atual for suficiente.

Validacao esperada:
- cd frontend && npm test
- cd frontend && npm run build
- cd frontend && npm run e2e se o fluxo E2E for alterado/adicionado
- git diff --check
- testes backend Maven apenas se houver alteracao backend.

Resposta esperada antes de editar:
- confirmar branch e estado do Git;
- resumir o estado atual dos arquivos inspecionados;
- apresentar plano curto de arquivos a alterar;
- explicar como os testes vao cobrir fonte e pratica intercalada.
```
