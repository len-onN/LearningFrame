<script setup lang="ts">
import { User } from '@lucide/vue'
import type { AuthField, AuthMode } from '../utils/authValidation'

defineProps<{
  mode: AuthMode
  fieldError: (field: AuthField) => string
}>()

defineEmits<{
  submit: []
  close: []
  'toggle-mode': []
  'touch-field': [field: AuthField]
}>()

const displayName = defineModel<string>('displayName', { required: true })
const email = defineModel<string>('email', { required: true })
const password = defineModel<string>('password', { required: true })
</script>

<template>
  <section class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="$emit('submit')">
      <button class="auth-close" type="button" title="Continuar sem login" aria-label="Continuar sem login" @click="$emit('close')">
        ×
      </button>

      <div>
        <p class="eyebrow">Conta opcional</p>
        <h2>{{ mode === 'login' ? 'Acesse seu progresso' : 'Crie sua conta' }}</h2>
        <p class="muted">
          Continue estudando sem login ou entre para salvar baralhos, publicar decks e acompanhar seu progresso.
        </p>
      </div>

      <div v-if="mode === 'register'" class="form-field">
        <label class="field-label" for="auth-display-name">Nome</label>
        <input
          id="auth-display-name"
          v-model.trim="displayName"
          class="field-control"
          :class="{ invalid: Boolean(fieldError('displayName')) }"
          type="text"
          autocomplete="name"
          placeholder="Seu nome"
          :aria-invalid="Boolean(fieldError('displayName'))"
          :aria-describedby="fieldError('displayName') ? 'auth-display-name-error' : undefined"
          @blur="$emit('touch-field', 'displayName')"
        />
        <p v-if="fieldError('displayName')" id="auth-display-name-error" class="field-error">
          {{ fieldError('displayName') }}
        </p>
      </div>

      <div class="form-field">
        <label class="field-label" for="auth-email">E-mail</label>
        <input
          id="auth-email"
          v-model.trim="email"
          class="field-control"
          :class="{ invalid: Boolean(fieldError('email')) }"
          type="email"
          autocomplete="email"
          placeholder="voce@email.com"
          :aria-invalid="Boolean(fieldError('email'))"
          :aria-describedby="fieldError('email') ? 'auth-email-error' : undefined"
          @blur="$emit('touch-field', 'email')"
        />
        <p v-if="fieldError('email')" id="auth-email-error" class="field-error">
          {{ fieldError('email') }}
        </p>
      </div>

      <div class="form-field">
        <label class="field-label" for="auth-password">Senha</label>
        <input
          id="auth-password"
          v-model="password"
          class="field-control"
          :class="{ invalid: Boolean(fieldError('password')) }"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          placeholder="Sua senha"
          :aria-invalid="Boolean(fieldError('password'))"
          :aria-describedby="fieldError('password') ? 'auth-password-error' : undefined"
          @blur="$emit('touch-field', 'password')"
        />
        <p v-if="fieldError('password')" id="auth-password-error" class="field-error">
          {{ fieldError('password') }}
        </p>
      </div>

      <button class="primary full" type="submit">
        <User :size="16" aria-hidden="true" />
        {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
      </button>

      <div class="auth-actions">
        <button class="ghost compact" type="button" @click="$emit('toggle-mode')">
          {{ mode === 'login' ? 'Criar conta' : 'Ja tenho conta' }}
        </button>
      </div>
    </form>
  </section>
</template>
