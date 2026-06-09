# Prompt App.vue 6: revisao final do composition root

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `frontend/src/App.vue`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/app/`
- `frontend/src/features/`
- `docs/diario-de-bordo.md`

Objetivo:

Fazer a revisao final de `App.vue` como composition root apos as fatias de
timers, criacao, estudo, biblioteca e auth.

Escopo recomendado:

1. Remover imports mortos.
2. Verificar se `App.vue` contem apenas:
   - instanciacao de composables globais;
   - instanciacao de composables de dominio;
   - callbacks transversais realmente necessarios;
   - `useRouteLifecycle`;
   - providers de rota;
   - shell/template.
3. Revisar `routeContext.ts`:
   - remover campos mortos;
   - manter contratos das paginas visuais claros;
   - nao quebrar adapters de rota.
4. Avaliar se providers devem continuar inline.
   - So extrair providers se isso melhorar legibilidade sem esconder contratos.
5. Atualizar documentacao:
   - diario de bordo;
   - plano consolidado se houver decisao nova;
   - prompt de continuidade, se ainda houver fronteira restante.

Cuidados obrigatorios:

- nao reabrir arquitetura inteira;
- nao introduzir store global;
- nao alterar rotas, UX, textos ou contratos de API;
- nao esconder logout se ele ainda coordenar varios dominios;
- nao mover providers para um arquivo opaco se isso dificultar revisar contrato.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` deve estar pequeno e legivel como composition root;
- cada dominio deve ter ownership claro;
- timers e recursos temporarios devem ter cleanup local;
- documentacao deve refletir o estado final da frente.
