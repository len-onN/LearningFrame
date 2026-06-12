<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import {
  Brain,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  Moon,
  RotateCcw,
  Sun,
  User,
  X
} from '@lucide/vue'
import type { UserResponse } from '../types/api'
import { useFeedbackStore } from '../stores/useFeedbackStore'
import { storeToRefs } from 'pinia'

interface ShellNavItem {
  id: string
  label: string
  icon: Component
  to: RouteLocationRaw
}

defineProps<{
  sidebarCollapsed: boolean
  navItems: ShellNavItem[]
  activeTab: string
  currentTitle: string
  themePreference: 'light' | 'dark'
  nextThemeLabel: string
  sidebarToggleLabel: string
  user: UserResponse | null
  userDisplayName: string
}>()

const feedbackStore = useFeedbackStore()
const { notice, error, loading } = storeToRefs(feedbackStore)
const loadingMessage = 'Carregando...'

defineEmits<{
  'go-home': []
  'toggle-sidebar': []
  'toggle-theme': []
  'start-interleaved': []
  login: []
  logout: []
}>()
</script>

<template>
  <div class="app-shell" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <button class="brand-button" type="button" title="Pagina inicial" @click="$emit('go-home')">
        <Brain :size="24" aria-hidden="true" />
        <strong>LearningFrame</strong>
      </button>

      <button
        class="ghost icon-button sidebar-toggle"
        type="button"
        :title="sidebarToggleLabel"
        :aria-label="sidebarToggleLabel"
        @click="$emit('toggle-sidebar')"
      >
        <ChevronsRight v-if="sidebarCollapsed" :size="16" aria-hidden="true" />
        <ChevronsLeft v-else :size="16" aria-hidden="true" />
      </button>

      <nav class="nav-list" aria-label="Navegacao principal">
        <RouterLink
          v-for="item in navItems"
          :key="item.id"
          v-slot="{ navigate }"
          custom
          :to="item.to"
        >
          <button
            class="nav-button"
            :class="{ active: activeTab === item.id }"
            type="button"
            @click="navigate"
          >
            <component :is="item.icon" :size="18" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </button>
        </RouterLink>
      </nav>



      <section class="sidebar-footer" aria-label="Conta">
        <div v-if="user" class="sidebar-user">
          <div class="user-summary" :title="userDisplayName">
            <User :size="16" aria-hidden="true" />
            <span>{{ userDisplayName }}</span>
          </div>
          <button class="ghost icon-button" type="button" title="Sair" aria-label="Sair" @click="$emit('logout')">
            <LogOut :size="16" aria-hidden="true" />
          </button>
        </div>

        <button v-else class="primary compact sidebar-login" type="button" @click="$emit('login')">
          <User :size="16" aria-hidden="true" />
          <span>Entrar</span>
        </button>
      </section>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow concept-strip">
            <button
              class="icon-button theme-toggle inline-theme-toggle"
              type="button"
              :title="nextThemeLabel"
              :aria-label="nextThemeLabel"
              @click="$emit('toggle-theme')"
            >
              <Sun v-if="themePreference === 'light'" :size="14" aria-hidden="true" />
              <Moon v-else :size="14" aria-hidden="true" />
            </button>
            <span>Recordação ativa · Repetição espaçada · Prática intercalada</span>
          </p>
          <h1>{{ currentTitle }}</h1>
        </div>
      </header>

      <div v-if="loading" class="status loading-status">
        <RotateCcw :size="16" aria-hidden="true" />
        <span>{{ loadingMessage }}</span>
      </div>
      <div v-if="notice" class="status success dismissible">
        <span>{{ notice }}</span>
        <button class="status-close" type="button" title="Fechar notificacao" aria-label="Fechar notificacao" @click="feedbackStore.dismissNotice()">
          <X :size="15" aria-hidden="true" />
        </button>
      </div>
      <div v-if="error" class="status error dismissible">
        <span>{{ error }}</span>
        <button class="status-close" type="button" title="Fechar notificacao" aria-label="Fechar notificacao" @click="feedbackStore.dismissError()">
          <X :size="15" aria-hidden="true" />
        </button>
      </div>

      <slot></slot>
    </main>
  </div>
</template>
