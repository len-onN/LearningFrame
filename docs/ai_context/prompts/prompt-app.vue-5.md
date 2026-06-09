# Prompt App.vue 5: extrair auth flow depois dos contratos estabilizados

Voce esta no repositorio `LearningFrame`, na branch
`codex/refactor-app-vue-responsibilities`.

Antes de escrever codigo, leia:

- `docs/ai_context/planos/plano-app-vue-composition-root-final.md`
- `frontend/src/App.vue`
- `frontend/src/composables/useAuthSession.ts`
- `frontend/src/utils/authValidation.ts`
- `frontend/src/features/import/useApkgImport.ts`
- `frontend/src/routes/routeContext.ts`
- `frontend/src/router/index.ts`

Objetivo:

Extrair formulario e workflow visual de autenticacao sem quebrar redirect,
limpeza de senha, APKG "entrar para salvar" ou refresh pos-login.

Escopo recomendado:

Criar:

- `frontend/src/features/auth/useAuthFlow.ts`;
- `frontend/src/features/auth/useAuthFlow.test.ts`.

Mover:

- `authForm`;
- `authTouched`;
- `authSubmitted`;
- `authErrors`;
- `submitAuth`;
- `markAuthSubmitted`;
- `hasAuthErrors`;
- `touchAuthField`;
- `shouldShowAuthError`;
- `authFieldError`;
- `resetAuthValidation`;
- `openAuth`;
- `toggleAuthMode`.

Contrato critico:

```ts
useAuthFlow({
  authMode,
  route,
  login,
  register,
  persistSession,
  refreshAfterAuth,
  consumeReturnToImportAfterAuth,
  closeManagedDeck,
  navigateToImport,
  navigateToRedirect,
  navigateToMyDecks,
  clearFeedback,
  dismissError,
  showNotice,
  withFeedback
})
```

Cuidados obrigatorios:

- preservar ordem do pos-login:
  1. persistir sessao;
  2. limpar senha;
  3. resetar validacao;
  4. `refreshAfterAuth`;
  5. APKG preservado;
  6. redirect;
  7. Meus baralhos;
  8. notice.
- preservar `?redirect=...`;
- preservar troca login/cadastro;
- nao transformar `useAuthSession` em dono do fluxo visual;
- nao passar `router` inteiro para `features/auth`;
- nao mexer em logout se ele ainda estiver coordenando varios dominios.

Testes esperados:

- validar touched/submitted;
- login com redirect;
- login retomando APKG;
- login sem redirect indo para Meus baralhos;
- limpeza de senha;
- toggle login/cadastro preservando redirect.

Validacao minima:

```txt
cd frontend
npm test
npm run build
git diff --check
```

Resultado esperado:

- `App.vue` nao deve conter formulario nem submit de auth;
- contexto de auth visual deve continuar igual;
- fluxo APKG pos-auth deve seguir intacto.
