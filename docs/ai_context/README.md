# AI Context do LearningFrame

Esta pasta guarda o contexto de construcao assistida do LearningFrame.

Ela nao substitui a documentacao principal do MVP. A documentacao atual para
uso, execucao e fechamento fica na raiz de `docs/`.

## 1. Como usar esta pasta

Use `docs/ai_context/` quando precisar entender:
- por que uma decisao foi tomada;
- quais alternativas foram descartadas;
- como a arquitetura evoluiu;
- qual foi a sequencia de branches e planejamentos;
- quais prompts carregavam contexto entre chats;
- quais documentos eram planos de etapa, e nao necessariamente estado atual.

Para entender o estado atual do MVP, comece por:
- [Principios e padroes do MVP](../principios-e-padroes-mvp.md);
- [Estado final do MVP](../estado-final-mvp.md);
- [Guia de uso do MVP](../guia-de-uso-mvp.md);
- [Guia de integracao com Anki/APKG](../guia-anki-apkg-mvp.md);
- [Guia de execucao local](../guia-execucao-local-mvp.md);
- [Relatorio de QA manual final](../relatorio-qa-manual-final-mvp.md).

## 2. Estrutura

```txt
docs/ai_context/
  README.md
  linha-do-tempo.md
  memoria-de-decisoes.md
  prompts/
  planos/
  arquitetura-e-decisoes/
  snapshots/
```

### `prompts/`

Prompts usados para transferir contexto entre chats. Eles registram estado,
condicoes de entrada, regras de branch e proximos passos previstos.

### `planos/`

Planos de branches e momentos de desenvolvimento. Muitos foram executados e
ficaram como registro historico. Ao consultar um plano antigo, confirme o estado
atual nos guias finais e no documento de principios.

### `arquitetura-e-decisoes/`

Documentos de arquitetura, UX e pre-finalizacao. Eles explicam raciocinios e
mudancas de direcao que levaram ao estado atual.

### `snapshots/`

Registros pontuais do projeto em determinado momento.

## 3. Regra de leitura para futuros chats

Leitura recomendada:
1. Primeiro leia [Principios e padroes do MVP](../principios-e-padroes-mvp.md).
2. Depois leia o guia relacionado ao trabalho:
   - uso;
   - APKG;
   - execucao;
   - estado final.
3. Use a [linha do tempo](linha-do-tempo.md) para localizar o plano historico
   relevante.
4. Use a [memoria de decisoes](memoria-de-decisoes.md) para entender por que a
   decisao atual existe.
5. Consulte prompts antigos apenas quando precisar recuperar contexto de
   passagem entre branches.

## 4. Cuidado importante

Documentos nesta pasta podem conter:
- planos que foram alterados depois;
- preocupacoes que ja foram resolvidas;
- caminhos descartados;
- pendencias que deixaram de existir;
- referencias a caminhos antigos antes da reorganizacao documental.

A fonte atual de verdade para novas implementacoes e
[Principios e padroes do MVP](../principios-e-padroes-mvp.md).

Quando houver conflito entre um plano antigo e os principios atuais, siga os
principios atuais e consulte a memoria de decisoes para entender a razao.
