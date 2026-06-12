<script setup lang="ts">
import { computed } from 'vue'
import AuthPage from '../pages/AuthPage.vue'
import { useAuthFlow } from '../features/auth/useAuthFlow'

const {
  authForm,
  authMode,
  authFieldError,
  submitAuth,
  goHome,
  toggleAuthMode,
  touchAuthField
} = useAuthFlow()

const displayName = computed({
  get: () => authForm.value.displayName,
  set: (value: string) => {
    authForm.value.displayName = value
  }
})
const email = computed({
  get: () => authForm.value.email,
  set: (value: string) => {
    authForm.value.email = value
  }
})
const password = computed({
  get: () => authForm.value.password,
  set: (value: string) => {
    authForm.value.password = value
  }
})
</script>

<template>
  <AuthPage
    v-model:display-name="displayName"
    v-model:email="email"
    v-model:password="password"
    :mode="authMode"
    :field-error="authFieldError"
    @submit="submitAuth"
    @close="goHome"
    @toggle-mode="toggleAuthMode"
    @touch-field="touchAuthField"
  />
</template>
