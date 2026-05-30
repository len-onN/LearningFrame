<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  Eye,
  LogOut,
  Plus,
  RotateCcw,
  Shuffle,
  Upload,
  User
} from '@lucide/vue'
import { api, clearAuthToken, setAuthToken } from './services/api'
import type {
  ApkgImportResponse,
  ApkgPreviewResponse,
  DeckSummary,
  DeckVisibility,
  ReviewRating,
  StatsSummary,
  StudyCard,
  StudyCardResponse,
  UserResponse
} from './types/api'
import {
  apkgPreviewToLocal,
  deckDetailToLocal,
  loadLocalDecks,
  loadLocalStates,
  localDeckToStudyCards,
  mixedLocalStudyCards,
  saveLocalDecks,
  saveLocalStates
} from './utils/localStudy'
import { nextReview } from './utils/srs'
import { safeStudyHtml } from './utils/html'
import { formatDueIn, nextDueLabel } from './utils/dueTime'
import { validateAuthForm, type AuthErrors, type AuthField, type AuthMode } from './utils/authValidation'

type Tab = 'library' | 'study' | 'import' | 'create' | 'progress' | 'auth'

const tab = ref<Tab>('library')
const authMode = ref<AuthMode>('login')
const user = ref<UserResponse | null>(loadStoredUser())
const publicDecks = ref<DeckSummary[]>([])
const myDecks = ref<DeckSummary[]>([])
const localDecks = ref(loadLocalDecks())
const localStates = ref(loadLocalStates())
const stats = ref<StatsSummary | null>(null)
const notice = ref('')
const error = ref('')
const loading = ref(false)

const authForm = ref({
  displayName: '',
  email: '',
  password: ''
})
const authTouched = ref<Record<AuthField, boolean>>({
  displayName: false,
  email: false,
  password: false
})
const authSubmitted = ref(false)

const deckForm = ref({
  title: '',
  description: '',
  visibility: 'PRIVATE' as DeckVisibility
})

const cardForm = ref({
  deckId: 0,
  frontHtml: '',
  backHtml: '',
  tags: ''
})

const selectedFile = ref<File | null>(null)
const importVisibility = ref<DeckVisibility>('PRIVATE')
const importTitle = ref('')
const importPreview = ref<ApkgPreviewResponse | null>(null)
const importResult = ref<ApkgImportResponse | null>(null)

const studyQueue = ref<StudyCard[]>([])
const sessionTitle = ref('Selecione um baralho ou inicie o modo caos.')
const answerVisible = ref(false)

const currentCard = computed(() => studyQueue.value[0])
const frontHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.frontHtml, currentCard.value.deckId) : '')
const backHtml = computed(() => currentCard.value ? safeStudyHtml(currentCard.value.backHtml, currentCard.value.deckId) : '')
const currentDueLabel = computed(() => currentCard.value ? formatDueIn(currentCard.value.dueAt) : '')
const authErrors = computed<AuthErrors>(() => validateAuthForm(authForm.value, authMode.value))
const navTabs = [
  { id: 'library' as const, label: 'Biblioteca', icon: BookOpen },
  { id: 'study' as const, label: 'Estudo', icon: Brain },
  { id: 'import' as const, label: 'Importar', icon: Upload },
  { id: 'create' as const, label: 'Criar', icon: Plus },
  { id: 'progress' as const, label: 'Progresso', icon: BarChart3 }
]
const visibleTabs = computed(() => navTabs.filter((item) => item.id !== 'create' || user.value))
const currentTitle = computed(() => {
  if (tab.value === 'auth') {
    return authMode.value === 'login' ? 'Entrar' : 'Criar conta'
  }
  return navTabs.find((item) => item.id === tab.value)?.label ?? 'Biblioteca'
})

onMounted(refreshAll)

async function refreshAll() {
  await withFeedback(async () => {
    publicDecks.value = await api.publicDecks()
    if (user.value) {
      myDecks.value = await api.myDecks()
      stats.value = await api.stats()
    }
  }, false)
}

async function submitAuth() {
  markAuthSubmitted()
  if (hasAuthErrors()) {
    return
  }

  await withFeedback(async () => {
    const response = authMode.value === 'login'
      ? await api.login(authForm.value.email, authForm.value.password)
      : await api.register(authForm.value.displayName, authForm.value.email, authForm.value.password)

    user.value = response.user
    setAuthToken(response.token)
    localStorage.setItem('learningframe.user', JSON.stringify(response.user))
    notice.value = `Sessao iniciada como ${response.user.displayName}.`
    authForm.value.password = ''
    resetAuthValidation()
    await refreshAll()
    tab.value = 'library'
  })
}

function markAuthSubmitted() {
  authSubmitted.value = true
  authTouched.value.email = true
  authTouched.value.password = true
  if (authMode.value === 'register') {
    authTouched.value.displayName = true
  }
}

function hasAuthErrors() {
  return Object.keys(authErrors.value).length > 0
}

function touchAuthField(field: AuthField) {
  authTouched.value[field] = true
}

function shouldShowAuthError(field: AuthField) {
  return authSubmitted.value || authTouched.value[field]
}

function authFieldError(field: AuthField) {
  return shouldShowAuthError(field) ? authErrors.value[field] ?? '' : ''
}

function resetAuthValidation() {
  authSubmitted.value = false
  authTouched.value = {
    displayName: false,
    email: false,
    password: false
  }
}

function logout() {
  user.value = null
  stats.value = null
  myDecks.value = []
  clearAuthToken()
  localStorage.removeItem('learningframe.user')
  notice.value = 'Modo anonimo ativado.'
  tab.value = 'library'
}

function goHome() {
  tab.value = 'library'
  error.value = ''
  resetAuthValidation()
}

function openAuth(mode: AuthMode = 'login') {
  authMode.value = mode
  tab.value = 'auth'
  error.value = ''
  notice.value = ''
  resetAuthValidation()
}

function toggleAuthMode() {
  authMode.value = authMode.value === 'login' ? 'register' : 'login'
  error.value = ''
  resetAuthValidation()
}

async function startDeck(deck: DeckSummary) {
  tab.value = 'study'
  sessionTitle.value = deck.title
  answerVisible.value = false

  await withFeedback(async () => {
    if (user.value) {
      const due = await api.due('SINGLE_DECK', deck.id)
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
      const localDeck = await ensurePublicDeck(deck.id)
      studyQueue.value = localDeckToStudyCards(localDeck, localStates.value)
    }
    if (studyQueue.value.length === 0) {
      notice.value = 'Nenhum card vencido agora para esta sessao.'
    }
  })
}

async function startLocalDeck(deckId: string) {
  const deck = localDecks.value.find((item) => item.id === deckId)
  if (!deck) {
    return
  }
  tab.value = 'study'
  sessionTitle.value = deck.title
  answerVisible.value = false
  studyQueue.value = localDeckToStudyCards(deck, localStates.value)
  if (studyQueue.value.length === 0) {
    notice.value = 'Nenhum card vencido agora neste baralho local.'
  }
}

async function startChaos() {
  tab.value = 'study'
  sessionTitle.value = 'Modo caos'
  answerVisible.value = false

  await withFeedback(async () => {
    if (user.value) {
      const due = await api.due('MIXED_DUE')
      studyQueue.value = due.cards.map(serverCardToStudyCard)
    } else {
      if (localDecks.value.length === 0) {
        for (const deck of publicDecks.value.slice(0, 4)) {
          await ensurePublicDeck(deck.id)
        }
      }
      studyQueue.value = mixedLocalStudyCards(localDecks.value, localStates.value)
    }
    if (studyQueue.value.length === 0) {
      notice.value = 'Modo caos sem cards vencidos agora.'
    }
  })
}

async function reviewCurrent(rating: ReviewRating) {
  const card = currentCard.value
  if (!card) {
    return
  }

  await withFeedback(async () => {
    if (card.local) {
      localStates.value[card.clientId] = nextReview(localStates.value[card.clientId], rating)
      saveLocalStates(localStates.value)
    } else if (card.cardId) {
      await api.review(card.cardId, rating)
      if (user.value) {
        stats.value = await api.stats()
      }
    }
    studyQueue.value.shift()
    answerVisible.value = false
    if (studyQueue.value.length === 0) {
      notice.value = 'Sessao concluida.'
    }
  }, false)
}

async function handleApkgChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  importPreview.value = null
  importResult.value = null

  if (!selectedFile.value) {
    return
  }

  await withFeedback(async () => {
    const preview = await api.previewApkg(selectedFile.value as File)
    importPreview.value = preview
    importTitle.value = preview.title
    const localDeck = apkgPreviewToLocal(preview)
    localDecks.value = [localDeck, ...localDecks.value.filter((deck) => deck.title !== preview.title)]
    saveLocalDecks(localDecks.value)
    notice.value = 'APKG importado localmente para estudo anonimo.'
  })
}

async function persistImport() {
  if (!selectedFile.value || !user.value) {
    return
  }

  await withFeedback(async () => {
    importResult.value = await api.importApkg(selectedFile.value as File, importTitle.value, importVisibility.value)
    notice.value = 'Baralho APKG salvo no modo logado.'
    await refreshAll()
  })
}

async function createDeck() {
  await withFeedback(async () => {
    const created = await api.createDeck(deckForm.value.title, deckForm.value.description, deckForm.value.visibility)
    deckForm.value = { title: '', description: '', visibility: 'PRIVATE' }
    cardForm.value.deckId = created.id
    notice.value = 'Baralho criado.'
    await refreshAll()
  })
}

async function createCard() {
  if (!cardForm.value.deckId) {
    error.value = 'Escolha um baralho para adicionar o card.'
    return
  }
  await withFeedback(async () => {
    const tags = cardForm.value.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    await api.createCard(cardForm.value.deckId, cardForm.value.frontHtml, cardForm.value.backHtml, tags)
    cardForm.value.frontHtml = ''
    cardForm.value.backHtml = ''
    cardForm.value.tags = ''
    notice.value = 'Card adicionado.'
    await refreshAll()
  })
}

function removeLocalDeck(deckId: string) {
  localDecks.value = localDecks.value.filter((deck) => deck.id !== deckId)
  saveLocalDecks(localDecks.value)
}

function deckDueLabel(deck: DeckSummary) {
  if (!user.value && deck.dueCount == null) {
    return 'disponivel agora'
  }
  return nextDueLabel(deck.dueCount, deck.nextDueAt)
}

function localDeckDueLabel(deckId: string) {
  const deck = localDecks.value.find((item) => item.id === deckId)
  if (!deck) {
    return 'sem previsao'
  }
  const dueCards = localDeckToStudyCards(deck, localStates.value)
  if (dueCards.length > 0) {
    return `${dueCards.length} vencidos agora`
  }

  const nextDueAt = deck.cards
    .map((card) => localStates.value[card.clientId]?.dueAt)
    .filter((dueAt): dueAt is string => Boolean(dueAt))
    .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())[0]

  return `proximo ${formatDueIn(nextDueAt)}`
}

async function ensurePublicDeck(deckId: number) {
  const localId = `public:${deckId}`
  const existing = localDecks.value.find((deck) => deck.id === localId)
  if (existing) {
    return existing
  }

  const detail = await api.deck(deckId)
  const localDeck = deckDetailToLocal(detail)
  localDecks.value = [localDeck, ...localDecks.value]
  saveLocalDecks(localDecks.value)
  return localDeck
}

function serverCardToStudyCard(card: StudyCardResponse): StudyCard {
  return {
    clientId: `server:${card.cardId}`,
    cardId: card.cardId,
    deckId: card.deckId,
    deckTitle: card.deckTitle,
    frontHtml: card.frontHtml,
    backHtml: card.backHtml,
    tags: card.tags,
    dueAt: card.dueAt,
    intervalDays: card.intervalDays,
    repetitions: card.repetitions,
    easeFactor: 2.5,
    newCard: card.newCard,
    local: false
  }
}

async function withFeedback(task: () => Promise<void>, showLoading = true) {
  error.value = ''
  notice.value = ''
  if (showLoading) {
    loading.value = true
  }
  try {
    await task()
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Erro inesperado.'
    error.value = message === 'Failed to fetch'
      ? 'Backend indisponivel. Suba a stack com Docker Compose para carregar biblioteca, login e progresso.'
      : message
  } finally {
    loading.value = false
  }
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem('learningframe.user')
    return raw ? JSON.parse(raw) as UserResponse : null
  } catch {
    return null
  }
}
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <button class="brand-button" type="button" @click="goHome">
        <Brain :size="24" aria-hidden="true" />
        <strong>LearningFrame</strong>
      </button>

      <nav class="nav-list" aria-label="Navegacao principal">
        <button
          v-for="item in visibleTabs"
          :key="item.id"
          class="nav-button"
          :class="{ active: tab === item.id }"
          type="button"
          @click="tab = item.id"
        >
          <component :is="item.icon" :size="18" aria-hidden="true" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button class="primary full" type="button" @click="startChaos">
        <Shuffle :size="18" aria-hidden="true" />
        Modo caos
      </button>
    </aside>

    <main class="workspace">
      <header class="topbar">
        <div>
          <p class="eyebrow">Recordacao ativa · Repeticao espacada · Pratica intercalada</p>
          <h1>{{ currentTitle }}</h1>
        </div>

        <section class="auth-panel" aria-label="Autenticacao">
          <div v-if="user" class="user-chip">
            <User :size="16" aria-hidden="true" />
            <span>{{ user.displayName }}</span>
            <button class="icon-button" type="button" title="Sair" @click="logout">
              <LogOut :size="16" aria-hidden="true" />
            </button>
          </div>

          <button v-else class="primary compact" type="button" @click="openAuth('login')">
            <User :size="16" aria-hidden="true" />
            Entrar
          </button>
        </section>
      </header>

      <div v-if="loading" class="status">Carregando...</div>
      <div v-if="notice" class="status success">{{ notice }}</div>
      <div v-if="error" class="status error">{{ error }}</div>

      <section v-if="tab === 'auth'" class="auth-page">
        <form class="auth-card" novalidate @submit.prevent="submitAuth">
          <button class="auth-close" type="button" title="Continuar sem login" aria-label="Continuar sem login" @click="goHome">
            ×
          </button>

          <div>
            <p class="eyebrow">Conta opcional</p>
            <h2>{{ authMode === 'login' ? 'Acesse seu progresso' : 'Crie sua conta' }}</h2>
            <p class="muted">
              Continue estudando sem login ou entre para salvar baralhos, publicar decks e acompanhar seu progresso.
            </p>
          </div>

          <div v-if="authMode === 'register'" class="form-field">
            <label class="field-label" for="auth-display-name">Nome</label>
            <input
              id="auth-display-name"
              v-model.trim="authForm.displayName"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('displayName')) }"
              type="text"
              autocomplete="name"
              placeholder="Seu nome"
              :aria-invalid="Boolean(authFieldError('displayName'))"
              :aria-describedby="authFieldError('displayName') ? 'auth-display-name-error' : undefined"
              @blur="touchAuthField('displayName')"
            />
            <p v-if="authFieldError('displayName')" id="auth-display-name-error" class="field-error">
              {{ authFieldError('displayName') }}
            </p>
          </div>

          <div class="form-field">
            <label class="field-label" for="auth-email">E-mail</label>
            <input
              id="auth-email"
              v-model.trim="authForm.email"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('email')) }"
              type="email"
              autocomplete="email"
              placeholder="voce@email.com"
              :aria-invalid="Boolean(authFieldError('email'))"
              :aria-describedby="authFieldError('email') ? 'auth-email-error' : undefined"
              @blur="touchAuthField('email')"
            />
            <p v-if="authFieldError('email')" id="auth-email-error" class="field-error">
              {{ authFieldError('email') }}
            </p>
          </div>

          <div class="form-field">
            <label class="field-label" for="auth-password">Senha</label>
            <input
              id="auth-password"
              v-model="authForm.password"
              class="field-control"
              :class="{ invalid: Boolean(authFieldError('password')) }"
              type="password"
              :autocomplete="authMode === 'login' ? 'current-password' : 'new-password'"
              placeholder="Sua senha"
              :aria-invalid="Boolean(authFieldError('password'))"
              :aria-describedby="authFieldError('password') ? 'auth-password-error' : undefined"
              @blur="touchAuthField('password')"
            />
            <p v-if="authFieldError('password')" id="auth-password-error" class="field-error">
              {{ authFieldError('password') }}
            </p>
          </div>

          <button class="primary full" type="submit">
            <User :size="16" aria-hidden="true" />
            {{ authMode === 'login' ? 'Entrar' : 'Criar conta' }}
          </button>

          <div class="auth-actions">
            <button class="ghost compact" type="button" @click="toggleAuthMode">
              {{ authMode === 'login' ? 'Criar conta' : 'Ja tenho conta' }}
            </button>
          </div>
        </form>
      </section>

      <section v-if="tab === 'library'" class="content-grid">
        <div class="panel wide">
          <div class="section-title">
            <h2>Baralhos publicos</h2>
            <button class="ghost compact" type="button" @click="refreshAll">
              <RotateCcw :size="16" aria-hidden="true" />
              Atualizar
            </button>
          </div>

          <div class="deck-list">
            <article v-for="deck in publicDecks" :key="deck.id" class="deck-row">
              <div>
                <h3>{{ deck.title }}</h3>
                <p>{{ deck.description }}</p>
                <span>{{ deck.cardCount }} cards · {{ deck.ownerName }} · {{ deckDueLabel(deck) }}</span>
              </div>
              <button class="primary compact" type="button" @click="startDeck(deck)">
                <Brain :size="16" aria-hidden="true" />
                Estudar
              </button>
            </article>
          </div>
        </div>

        <div class="panel">
          <div class="section-title">
            <h2>Baralhos locais</h2>
          </div>
          <div v-if="localDecks.length" class="deck-list compact-list">
            <article v-for="deck in localDecks" :key="deck.id" class="deck-row">
              <div>
                <h3>{{ deck.title }}</h3>
                <p>{{ deck.description }}</p>
                <span>{{ deck.cards.length }} cards · {{ deck.source }} · {{ localDeckDueLabel(deck.id) }}</span>
              </div>
              <div class="row-actions">
                <button class="ghost icon-only" type="button" title="Estudar" @click="startLocalDeck(deck.id)">
                  <Brain :size="16" aria-hidden="true" />
                </button>
                <button class="ghost icon-only" type="button" title="Remover local" @click="removeLocalDeck(deck.id)">
                  ×
                </button>
              </div>
            </article>
          </div>
          <p v-else class="muted">Importe um `.apkg` ou abra um baralho publico para estudar sem login.</p>
        </div>

        <div v-if="user" class="panel">
          <div class="section-title">
            <h2>Meus baralhos</h2>
          </div>
          <div class="deck-list compact-list">
            <article v-for="deck in myDecks" :key="deck.id" class="deck-row">
              <div>
                <h3>{{ deck.title }}</h3>
                <p>{{ deck.visibility }}</p>
                <span>{{ deck.cardCount }} cards · {{ deckDueLabel(deck) }}</span>
              </div>
              <button class="ghost icon-only" type="button" title="Estudar" @click="startDeck(deck)">
                <Brain :size="16" aria-hidden="true" />
              </button>
            </article>
          </div>
        </div>
      </section>

      <section v-if="tab === 'study'" class="study-layout">
        <div class="study-header">
          <div>
            <p class="eyebrow">{{ sessionTitle }}</p>
            <h2>{{ studyQueue.length }} cards na fila</h2>
          </div>
          <button class="ghost compact" type="button" @click="startChaos">
            <Shuffle :size="16" aria-hidden="true" />
            Misturar
          </button>
        </div>

        <article v-if="currentCard" class="study-card">
          <div class="card-meta">
            <span>{{ currentCard.deckTitle }}</span>
            <span>{{ currentCard.newCard ? 'Novo' : `${currentCard.intervalDays} dias` }} · volta {{ currentDueLabel }}</span>
          </div>
          <div class="prompt" v-html="frontHtml"></div>

          <button v-if="!answerVisible" class="primary reveal" type="button" @click="answerVisible = true">
            <Eye :size="18" aria-hidden="true" />
            Revelar resposta
          </button>

          <template v-else>
            <div class="answer" v-html="backHtml"></div>
            <div class="ratings" aria-label="Avaliar resposta">
              <button class="rating again" type="button" @click="reviewCurrent('AGAIN')">De novo</button>
              <button class="rating hard" type="button" @click="reviewCurrent('HARD')">Dificil</button>
              <button class="rating good" type="button" @click="reviewCurrent('GOOD')">Bom</button>
              <button class="rating easy" type="button" @click="reviewCurrent('EASY')">Facil</button>
            </div>
          </template>
        </article>

        <div v-else class="empty-state">
          <Brain :size="36" aria-hidden="true" />
          <h2>Nenhuma sessao ativa</h2>
          <p>Escolha um baralho na biblioteca, importe um APKG ou use o modo caos.</p>
        </div>
      </section>

      <section v-if="tab === 'import'" class="content-grid">
        <div class="panel wide">
          <div class="section-title">
            <h2>Importar APKG</h2>
          </div>
          <label class="file-drop">
            <Upload :size="22" aria-hidden="true" />
            <span>{{ selectedFile?.name ?? 'Selecionar arquivo .apkg' }}</span>
            <input type="file" accept=".apkg" @change="handleApkgChange" />
          </label>

          <div v-if="importPreview" class="import-summary">
            <strong>{{ importPreview.title }}</strong>
            <span>{{ importPreview.cardsReady }} cards prontos · {{ importPreview.cardsSkipped }} ignorados · {{ importPreview.mediaFound }} midias</span>
            <p v-for="warning in importPreview.warnings" :key="warning">{{ warning }}</p>
          </div>
        </div>

        <form v-if="user && importPreview" class="panel" @submit.prevent="persistImport">
          <div class="section-title">
            <h2>Salvar no servidor</h2>
          </div>
          <input v-model="importTitle" type="text" placeholder="Titulo do baralho" />
          <select v-model="importVisibility">
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Publico</option>
          </select>
          <button class="primary full" type="submit">
            <Check :size="16" aria-hidden="true" />
            Persistir APKG
          </button>
          <p v-if="importResult" class="muted">{{ importResult.cardsImported }} cards salvos em {{ importResult.title }}.</p>
        </form>
      </section>

      <section v-if="tab === 'create'" class="content-grid">
        <form class="panel" @submit.prevent="createDeck">
          <div class="section-title">
            <h2>Novo baralho</h2>
          </div>
          <input v-model="deckForm.title" required type="text" placeholder="Titulo" :disabled="!user" />
          <textarea v-model="deckForm.description" rows="4" placeholder="Descricao" :disabled="!user"></textarea>
          <select v-model="deckForm.visibility" :disabled="!user">
            <option value="PRIVATE">Privado</option>
            <option value="PUBLIC">Publico</option>
          </select>
          <button class="primary full" type="submit" :disabled="!user">
            <Plus :size="16" aria-hidden="true" />
            Criar baralho
          </button>
          <p v-if="!user" class="muted">Criacao persistente exige login.</p>
        </form>

        <form class="panel wide" @submit.prevent="createCard">
          <div class="section-title">
            <h2>Novo card</h2>
          </div>
          <select v-model.number="cardForm.deckId" :disabled="!user">
            <option :value="0">Escolha um baralho</option>
            <option v-for="deck in myDecks" :key="deck.id" :value="deck.id">{{ deck.title }}</option>
          </select>
          <textarea v-model="cardForm.frontHtml" required rows="4" placeholder="Frente" :disabled="!user"></textarea>
          <textarea v-model="cardForm.backHtml" required rows="4" placeholder="Verso" :disabled="!user"></textarea>
          <input v-model="cardForm.tags" type="text" placeholder="tags separadas por virgula" :disabled="!user" />
          <button class="primary full" type="submit" :disabled="!user">
            <Plus :size="16" aria-hidden="true" />
            Adicionar card
          </button>
        </form>
      </section>

      <section v-if="tab === 'progress'" class="progress-section">
        <div v-if="user && stats" class="stats-strip">
          <article class="metric">
            <span>Vencidos agora</span>
            <strong>{{ stats.dueNow }}</strong>
          </article>
          <article class="metric">
            <span>Revisados hoje</span>
            <strong>{{ stats.reviewsToday }}</strong>
          </article>
          <article class="metric">
            <span>Acerto 7 dias</span>
            <strong>{{ stats.accuracyLast7Days }}%</strong>
          </article>
          <article class="metric">
            <span>Dias ativos 30d</span>
            <strong>{{ stats.activeDaysLast30 }}</strong>
          </article>
          <article class="metric">
            <span>Proxima revisao</span>
            <strong>{{ formatDueIn(stats.nextDueAt) }}</strong>
          </article>
        </div>

        <div v-else class="empty-state">
          <BarChart3 :size="36" aria-hidden="true" />
          <h2>Progresso persistente exige login</h2>
          <p>No modo anonimo, a agenda local continua funcionando neste navegador.</p>
        </div>
      </section>
    </main>
  </div>
</template>
