<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Save, X } from '@lucide/vue'
import RichTextEditor from './RichTextEditor.vue'
import type { CardEditorFace, CardEditorMediaKind } from './cardEditorTypes'
import { useDeckManagementStore } from '../../stores/useDeckManagementStore'
import { storeToRefs } from 'pinia'

const store = useDeckManagementStore()

const {
  managedDeck,
  cardEditorForm,
  cardEditorTitle: title,
} = storeToRefs(store)

const deckId = computed(() => managedDeck.value?.id ?? 0)
const deckTitle = computed(() => managedDeck.value?.title ?? '')

const activeEditorFace = ref<CardEditorFace>('front')
const frontEditorRef = ref<InstanceType<typeof RichTextEditor> | null>(null)
const backEditorRef = ref<InstanceType<typeof RichTextEditor> | null>(null)
const mediaInputRef = ref<HTMLInputElement | null>(null)
const mediaUploadKind = ref<CardEditorMediaKind>('image')
const uploadingMedia = ref(false)

watch(title, () => {
  activeEditorFace.value = 'front'
}, { immediate: true })

function triggerMediaUpload(kind: CardEditorMediaKind, face: CardEditorFace, file?: File) {
  if (uploadingMedia.value) {
    return
  }
  mediaUploadKind.value = kind
  activeEditorFace.value = face
  
  if (file) {
    processMediaFile(file)
  } else {
    mediaInputRef.value?.click()
  }
}

async function processMediaFile(file: File) {
  uploadingMedia.value = true
  try {
    const marker = await store.uploadCardEditorMedia(file, mediaUploadKind.value)
    insertIntoEditor(activeEditorFace.value, marker)
  } catch (error) {
    store.handleCardEditorUploadError(error instanceof Error ? error.message : 'Falha ao inserir midia.')
  } finally {
    uploadingMedia.value = false
  }
}

async function handleMediaChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''

  if (!file) {
    return
  }

  await processMediaFile(file)
}

function insertIntoEditor(face: CardEditorFace, text: string) {
  const target = face === 'front' ? frontEditorRef.value : backEditorRef.value
  target?.insertHtml(text)
}

function handleSave() {
  void store.saveCardEditor()
}

function handleClose() {
  store.closeCardEditor()
}
</script>

<template>
  <section class="card-editor-overlay" aria-label="Editor de carta">
    <div class="card-editor-shell">
      <header class="card-editor-header">
        <div>
          <p class="eyebrow">{{ deckTitle }}</p>
          <h2>{{ title }}</h2>
        </div>
        <div class="row-actions">
          <button class="primary compact" type="button" @click="handleSave">
            <Save :size="16" aria-hidden="true" />
            Salvar carta
          </button>
          <button class="ghost icon-button" type="button" title="Fechar editor" aria-label="Fechar editor" @click="handleClose">
            <X :size="16" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div class="card-editor-body">
        <form class="card-editor-form" @submit.prevent="handleSave">
          <section class="editor-face-block">
            <div class="section-title compact-title">
              <h3>Frente</h3>
            </div>
            <RichTextEditor
              ref="frontEditorRef"
              v-model="cardEditorForm.frontHtml"
              :deck-id="deckId"
              :uploading-media="uploadingMedia"
              aria-label="Frente da carta"
              @upload-media="(k, f) => triggerMediaUpload(k, 'front', f)"
              @focusin="activeEditorFace = 'front'"
            />
          </section>

          <section class="editor-face-block">
            <div class="section-title compact-title">
              <h3>Verso</h3>
            </div>
            <RichTextEditor
              ref="backEditorRef"
              v-model="cardEditorForm.backHtml"
              :deck-id="deckId"
              :uploading-media="uploadingMedia"
              aria-label="Verso da carta"
              @upload-media="(k, f) => triggerMediaUpload(k, 'back', f)"
              @focusin="activeEditorFace = 'back'"
            />
          </section>

          <label class="form-field">
            <span class="field-label">Tags</span>
            <input v-model="cardEditorForm.tags" type="text" maxlength="400" placeholder="separadas por virgula" aria-label="Tags da carta" />
          </label>
        </form>

      </div>

      <input
        ref="mediaInputRef"
        class="visually-hidden"
        type="file"
        :accept="mediaUploadKind === 'image' ? 'image/*' : 'audio/*'"
        @change="handleMediaChange"
      />
    </div>
  </section>
</template>
