import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getAuthToken } from '../services/api'
import AuthRoute from '../routes/AuthRoute.vue'
import CreateDeckRoute from '../routes/CreateDeckRoute.vue'
import ImportRoute from '../routes/ImportRoute.vue'
import LibraryRoute from '../routes/LibraryRoute.vue'
import ProgressRoute from '../routes/ProgressRoute.vue'
import StudyRoute from '../routes/StudyRoute.vue'

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

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'library-public' }
  },
  {
    path: '/biblioteca/publicos',
    name: 'library-public',
    component: LibraryRoute,
    meta: { title: 'Biblioteca', tab: 'library', librarySection: 'public', libraryView: 'decks' }
  },
  {
    path: '/biblioteca/meus',
    name: 'library-mine',
    component: LibraryRoute,
    meta: { title: 'Biblioteca', tab: 'library', librarySection: 'mine', libraryView: 'decks', requiresAuth: true }
  },
  {
    path: '/biblioteca/meus/:deckId/gerenciar',
    name: 'library-deck-manage',
    component: LibraryRoute,
    meta: { title: 'Gerenciar baralho', tab: 'library', librarySection: 'mine', libraryView: 'manage-deck', requiresAuth: true }
  },
  {
    path: '/estudo',
    name: 'study',
    component: StudyRoute,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/estudo/baralho/:deckId',
    name: 'study-deck',
    component: StudyRoute,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/estudo/intercalado',
    name: 'study-interleaved',
    component: StudyRoute,
    meta: { title: 'Estudo', tab: 'study' }
  },
  {
    path: '/importar',
    name: 'import',
    component: ImportRoute,
    meta: { title: 'Importar', tab: 'import' }
  },
  {
    path: '/criar',
    name: 'create',
    component: CreateDeckRoute,
    meta: { title: 'Criar', tab: 'create', requiresAuth: true }
  },
  {
    path: '/progresso',
    name: 'progress',
    component: ProgressRoute,
    meta: { title: 'Progresso', tab: 'progress', requiresAuth: true }
  },
  {
    path: '/entrar',
    name: 'login',
    component: AuthRoute,
    meta: { title: 'Entrar', tab: 'auth', authMode: 'login' }
  },
  {
    path: '/cadastro',
    name: 'register',
    component: AuthRoute,
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
