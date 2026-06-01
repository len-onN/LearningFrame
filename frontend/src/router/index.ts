import { h } from 'vue'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getAuthToken } from '../services/api'

export type AppRouteName =
  | 'library-public'
  | 'library-mine'
  | 'library-deck-manage'
  | 'study'
  | 'study-deck'
  | 'study-interleaved'
  | 'import'
  | 'create'
  | 'progress'
  | 'login'
  | 'register'

const RouteSurface = {
  name: 'RouteSurface',
  render: () => h('div')
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'library-public' }
  },
  {
    path: '/biblioteca/publicos',
    name: 'library-public',
    component: RouteSurface,
    meta: { title: 'Biblioteca', tab: 'library', librarySection: 'public', libraryView: 'decks' }
  },
  {
    path: '/biblioteca/meus',
    name: 'library-mine',
    component: RouteSurface,
    meta: { title: 'Biblioteca', tab: 'library', librarySection: 'mine', libraryView: 'decks', requiresAuth: true }
  },
  {
    path: '/biblioteca/meus/:deckId/gerenciar',
    name: 'library-deck-manage',
    component: RouteSurface,
    meta: { title: 'Gerenciar baralho', tab: 'library', librarySection: 'mine', libraryView: 'manage-deck', requiresAuth: true }
  },
  {
    path: '/estudo',
    name: 'study',
    component: RouteSurface,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/estudo/baralho/:deckId',
    name: 'study-deck',
    component: RouteSurface,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/estudo/intercalado',
    name: 'study-interleaved',
    component: RouteSurface,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/importar',
    name: 'import',
    component: RouteSurface,
    meta: { title: 'Importar', tab: 'import' }
  },
  {
    path: '/criar',
    name: 'create',
    component: RouteSurface,
    meta: { title: 'Criar', tab: 'create', requiresAuth: true }
  },
  {
    path: '/progresso',
    name: 'progress',
    component: RouteSurface,
    meta: { title: 'Progresso', tab: 'progress', requiresAuth: true }
  },
  {
    path: '/entrar',
    name: 'login',
    component: RouteSurface,
    meta: { title: 'Entrar', tab: 'auth', authMode: 'login' }
  },
  {
    path: '/cadastro',
    name: 'register',
    component: RouteSurface,
    meta: { title: 'Criar conta', tab: 'auth', authMode: 'register' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'library-public' }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  if (!to.meta.requiresAuth || getAuthToken()) {
    return true
  }

  return {
    name: 'login',
    query: { redirect: to.fullPath }
  }
})

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    tab?: 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'
    librarySection?: 'public' | 'mine'
    libraryView?: 'decks' | 'manage-deck'
    authMode?: 'login' | 'register'
    requiresAuth?: boolean
  }
}
