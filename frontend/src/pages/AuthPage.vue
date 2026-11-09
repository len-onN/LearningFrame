<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, Eye, EyeOff, Check, X } from '@lucide/vue'
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
const confirmPassword = defineModel<string>('confirmPassword', { default: '' })

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordRules = computed(() => [
  { label: 'At least 8 characters', isValid: password.value.length >= 8 },
  { label: 'One uppercase letter', isValid: /[A-Z]/.test(password.value) },
  { label: 'One number', isValid: /\d/.test(password.value) },
  { label: 'One symbol', isValid: /[^A-Za-z0-9\s]/.test(password.value) }
])

const passwordsMatch = computed(() => {
  return password.value !== '' && password.value === confirmPassword.value
})
</script>

<template>
  <section class="auth-page">
    <form class="auth-card" novalidate @submit.prevent="$emit('submit')">
      <button class="auth-close" type="button" title="Continue without logging in" aria-label="Continue without logging in" @click="$emit('close')">
        ×
      </button>

      <div>
        <p class="eyebrow">Optional account</p>
        <h2>{{ mode === 'login' ? 'Access your progress' : 'Create your account' }}</h2>
        <p class="muted">
          Continue studying without logging in or log in to save decks, publish decks, and track your progress.
        </p>
      </div>

      <div v-if="mode === 'register'" class="form-field">
        <label class="field-label" for="auth-display-name">Name</label>
        <input
          id="auth-display-name"
          v-model.trim="displayName"
          class="field-control"
          :class="{ invalid: Boolean(fieldError('displayName')) }"
          type="text"
          autocomplete="name"
          placeholder="Your name"
          :aria-invalid="Boolean(fieldError('displayName'))"
          :aria-describedby="fieldError('displayName') ? 'auth-display-name-error' : undefined"
          @blur="$emit('touch-field', 'displayName')"
        />
        <p v-if="fieldError('displayName')" id="auth-display-name-error" class="field-error">
          {{ fieldError('displayName') }}
        </p>
      </div>

      <div class="form-field">
        <label class="field-label" for="auth-email">Email</label>
        <input
          id="auth-email"
          v-model.trim="email"
          class="field-control"
          :class="{ invalid: Boolean(fieldError('email')) }"
          type="email"
          autocomplete="email"
          placeholder="you@email.com"
          :aria-invalid="Boolean(fieldError('email'))"
          :aria-describedby="fieldError('email') ? 'auth-email-error' : undefined"
          @blur="$emit('touch-field', 'email')"
        />
        <p v-if="fieldError('email')" id="auth-email-error" class="field-error">
          {{ fieldError('email') }}
        </p>
      </div>

      <div class="form-field">
        <label class="field-label" for="auth-password">Password</label>
        <div class="password-input-wrapper">
          <input
            id="auth-password"
            v-model="password"
            class="field-control"
            :class="{ invalid: Boolean(fieldError('password')) }"
            :type="showPassword ? 'text' : 'password'"
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            placeholder="Your password"
            :aria-invalid="Boolean(fieldError('password'))"
            :aria-describedby="fieldError('password') ? 'auth-password-error' : undefined"
            @blur="$emit('touch-field', 'password')"
          />
          <button type="button" class="icon-button toggle-password" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
            <component :is="showPassword ? EyeOff : Eye" class="icon" />
          </button>
        </div>
        
        <ul v-if="mode === 'register'" class="password-rules">
          <li v-for="rule in passwordRules" :key="rule.label" :class="{ 'rule-valid': rule.isValid, 'rule-invalid': !rule.isValid }">
            <component :is="rule.isValid ? Check : X" class="rule-icon" />
            {{ rule.label }}
          </li>
        </ul>
        <p v-else-if="fieldError('password')" id="auth-password-error" class="field-error">
          {{ fieldError('password') }}
        </p>
      </div>

      <div v-if="mode === 'register'" class="form-field">
        <label class="field-label" for="auth-confirm-password">Confirm Password</label>
        <div class="password-input-wrapper">
          <input
            id="auth-confirm-password"
            v-model="confirmPassword"
            class="field-control"
            :class="{ invalid: Boolean(fieldError('confirmPassword')) }"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            placeholder="Confirm your password"
            :aria-invalid="Boolean(fieldError('confirmPassword'))"
            :aria-describedby="fieldError('confirmPassword') ? 'auth-confirm-password-error' : undefined"
            @blur="$emit('touch-field', 'confirmPassword')"
          />
          <button type="button" class="icon-button toggle-password" @click="showConfirmPassword = !showConfirmPassword" aria-label="Toggle password visibility">
            <component :is="showConfirmPassword ? EyeOff : Eye" class="icon" />
          </button>
        </div>
        <div v-if="confirmPassword" class="password-match-status" :class="passwordsMatch ? 'status-match' : 'status-mismatch'">
          <component :is="passwordsMatch ? Check : X" class="rule-icon" />
          {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
        </div>
        <p v-else-if="fieldError('confirmPassword')" id="auth-confirm-password-error" class="field-error">
          {{ fieldError('confirmPassword') }}
        </p>
      </div>

      <button class="primary full" type="submit">
        <User :size="16" aria-hidden="true" />
        {{ mode === 'login' ? 'Log in' : 'Create account' }}
      </button>

      <div class="auth-actions">
        <button class="ghost compact" type="button" @click="$emit('toggle-mode')">
          {{ mode === 'login' ? 'Create account' : 'Already have an account' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .field-control {
  width: 100%;
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  color: var(--color-text-dimmed);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: var(--color-text);
}

.toggle-password .icon {
  width: 20px;
  height: 20px;
}

.password-rules {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}

.password-rules li,
.password-match-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rule-icon {
  width: 16px;
  height: 16px;
}

.rule-valid,
.status-match {
  color: var(--color-success);
}

.rule-invalid,
.status-mismatch {
  color: var(--color-danger);
}

.password-match-status {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}
</style>
