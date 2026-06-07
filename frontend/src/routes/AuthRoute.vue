<script setup lang="ts">
import { computed } from 'vue'
import AuthPage from '../pages/AuthPage.vue'
import { authRouteKey, useRequiredRouteContext } from './routeContext'

const auth = useRequiredRouteContext(authRouteKey, 'Auth')

const displayName = computed({
  get: () => auth.authForm.value.displayName,
  set: (value: string) => {
    auth.authForm.value.displayName = value
  }
})
const email = computed({
  get: () => auth.authForm.value.email,
  set: (value: string) => {
    auth.authForm.value.email = value
  }
})
const password = computed({
  get: () => auth.authForm.value.password,
  set: (value: string) => {
    auth.authForm.value.password = value
  }
})
</script>

<template>
  <AuthPage
    v-model:display-name="displayName"
    v-model:email="email"
    v-model:password="password"
    :mode="auth.authMode.value"
    :field-error="auth.authFieldError"
    @submit="auth.submitAuth"
    @close="auth.goHome"
    @toggle-mode="auth.toggleAuthMode"
    @touch-field="auth.touchAuthField"
  />
</template>
