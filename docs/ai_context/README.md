# AI Context do LearningFrame

Esta pasta guarda o contexto de construção assistida do LearningFrame.

Ela não substitui a documentação principal do MVP. A documentação atual para
uso, execução e fechamento fica na raiz de `docs/`.

## 1. Como usar esta pasta

Use `docs/ai_context/` quando precisar entender:
- por que uma decisão foi tomada;
- quais alternativas foram descartadas;
- como a arquitetura evoluiu;
- qual foi a sequencia de branches e planejamentos;
- quais prompts carregavam contexto entre chats;
- quais documentos eram planos de etapa, e não necessariamente estado atual.

Para entender o estado atual do MVP, comece por:
- [Princípios e padrões do MVP](../principios-e-padroes-mvp.md);
- [Estado final do MVP](../estado-final-mvp.md);
- [Guia de uso do MVP](../guia-de-uso-mvp.md);
- [Guia de integração com Anki/APKG](../guia-anki-apkg-mvp.md);
- [Guia de execução local](../guia-execucao-local-mvp.md);
- [Relatório de QA manual final](../relatorio-qa-manual-final-mvp.md).

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
condicoes de entrada, regras de branch e próximos passos previstos.

### `planos/`

Planos de branches e momentos de desenvolvimento. Muitos foram executados e
ficaram como registro histórico. Ao consultar um plano antigo, confirme o estado
atual nos guias finais e no documento de princípios.

### `arquitetura-e-decisoes/`

Documentos de arquitetura, UX e pré-finalização. Eles explicam raciocinios e
mudanças de direção que levaram ao estado atual.

### `snapshots/`

Registros pontuais do projeto em determinado momento.

## 3. Regra de leitura para futuros chats

Leitura recomendada:
1. Primeiro leia [Princípios e padrões do MVP](../principios-e-padroes-mvp.md).
2. Depois leia o guia relacionado ao trabalho:
   - uso;
   - APKG;
   - execução;
   - estado final.
3. Use a [linha do tempo](linha-do-tempo.md) para localizar o plano histórico
   relevante.
4. Use a [memória de decisões](memoria-de-decisoes.md) para entender por que a
   decisão atual existe.
5. Consulte prompts antigos apenas quando precisar recuperar contexto de
   passagem entre branches.

## 4. Cuidado importante

Documentos nesta pasta podem conter:
- planos que foram alterados depois;
- preocupacoes que já foram resolvidas;
- caminhos descartados;
- pendencias que deixaram de existir;
- referências a caminhos antigos antes da reorganização documental.

A fonte atual de verdade para novas implementações é
[Princípios e padrões do MVP](../principios-e-padroes-mvp.md).

Quando houver conflito entre um plano antigo e os princípios atuais, siga os
princípios atuais e consulte a memória de decisões para entender a razão.
