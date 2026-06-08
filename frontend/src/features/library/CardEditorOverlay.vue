<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Image as ImageIcon, Save, Volume2, X } from '@lucide/vue'
import type {
  CardEditorFace,
  CardEditorMediaKind,
  CardEditorMediaUploader
} from './cardEditorTypes'

const props = defineProps<{
  deckTitle: string
  title: string
  frontPreviewHtml: string
  backPreviewHtml: string
  uploadMedia: CardEditorMediaUploader
}>()

const emit = defineEmits<{
  save: []
  close: []
  'upload-success': [kind: CardEditorMediaKind]
  'upload-error': [message: string]
}>()

const frontHtml = defineModel<string>('frontHtml', { required: true })
const backHtml = defineModel<string>('backHtml', { required: true })
const tags = defineModel<string>('tags', { required: true })

const activeEditorFace = ref<CardEditorFace>('front')
const frontEditorRef = ref<HTMLTextAreaElement | null>(null)
const backEditorRef = ref<HTMLTextAreaElement | null>(null)
const mediaInputRef = ref<HTMLInputElement | null>(null)
const mediaUploadKind = ref<CardEditorMediaKind>('image')
const uploadingMedia = ref(false)

watch(() => props.title, () => {
  activeEditorFace.value = 'front'
  void nextTick(() => frontEditorRef.value?.focus())
}, { immediate: true })

function triggerMediaUpload(kind: CardEditorMediaKind, face: CardEditorFace) {
  if (uploadingMedia.value) {
    return
  }
  mediaUploadKind.value = kind
  activeEditorFace.value = face
  mediaInputRef.value?.click()
}

async function handleMediaChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  input.value = ''

  if (!file) {
    return
  }

  uploadingMedia.value = true
  try {
    const marker = await props.uploadMedia(file, mediaUploadKind.value)
    insertIntoEditor(activeEditorFace.value, marker)
    emit('upload-success', mediaUploadKind.value)
  } catch (error) {
    emit('upload-error', error instanceof Error ? error.message : 'Falha ao inserir midia.')
  } finally {
    uploadingMedia.value = false
  }
}

function insertIntoEditor(face: CardEditorFace, text: string) {
  const textarea = face === 'front' ? frontEditorRef.value : backEditorRef.value
  const current = face === 'front' ? frontHtml.value : backHtml.value
  const start = textarea?.selectionStart ?? current.length
  const end = textarea?.selectionEnd ?? current.length
  const nextValue = `${current.slice(0, start)}${text}${current.slice(end)}`

  if (face === 'front') {
    frontHtml.value = nextValue
  } else {
    backHtml.value = nextValue
  }

  void nextTick(() => {
    const target = face === 'front' ? frontEditorRef.value : backEditorRef.value
    target?.focus()
    const cursor = start + text.length
    target?.setSelectionRange(cursor, cursor)
  })
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
          <button class="primary compact" type="button" @click="$emit('save')">
            <Save :size="16" aria-hidden="true" />
            Salvar carta
          </button>
          <button class="ghost icon-button" type="button" title="Fechar editor" aria-label="Fechar editor" @click="$emit('close')">
            <X :size="16" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div class="card-editor-body">
        <form class="card-editor-form" @submit.prevent="$emit('save')">
          <section class="editor-face-block">
            <div class="section-title compact-title">
              <h3>Frente</h3>
              <div class="row-actions">
                <button class="ghost icon-button" type="button" title="Inserir imagem na frente" aria-label="Inserir imagem na frente" :disabled="uploadingMedia" @click="triggerMediaUpload('image', 'front')">
                  <ImageIcon :size="16" aria-hidden="true" />
                </button>
                <button class="ghost icon-button" type="button" title="Inserir audio na frente" aria-label="Inserir audio na frente" :disabled="uploadingMedia" @click="triggerMediaUpload('audio', 'front')">
                  <Volume2 :size="16" aria-hidden="true" />
                </button>
              </div>
            </div>
            <textarea
              ref="frontEditorRef"
              v-model="frontHtml"
              rows="10"
              maxlength="12000"
              required
              aria-label="Frente da carta"
              @focus="activeEditorFace = 'front'"
            ></textarea>
          </section>

          <section class="editor-face-block">
            <div class="section-title compact-title">
              <h3>Verso</h3>
              <div class="row-actions">
                <button class="ghost icon-button" type="button" title="Inserir imagem no verso" aria-label="Inserir imagem no verso" :disabled="uploadingMedia" @click="triggerMediaUpload('image', 'back')">
                  <ImageIcon :size="16" aria-hidden="true" />
                </button>
                <button class="ghost icon-button" type="button" title="Inserir audio no verso" aria-label="Inserir audio no verso" :disabled="uploadingMedia" @click="triggerMediaUpload('audio', 'back')">
                  <Volume2 :size="16" aria-hidden="true" />
                </button>
              </div>
            </div>
            <textarea
              ref="backEditorRef"
              v-model="backHtml"
              rows="10"
              maxlength="12000"
              required
              aria-label="Verso da carta"
              @focus="activeEditorFace = 'back'"
            ></textarea>
          </section>

          <label class="form-field">
            <span class="field-label">Tags</span>
            <input v-model="tags" type="text" maxlength="400" placeholder="separadas por virgula" aria-label="Tags da carta" />
          </label>
        </form>

        <section class="card-editor-preview">
          <article class="preview-pane">
            <div class="card-meta">
              <span>Frente</span>
            </div>
            <div class="preview-study-face" v-html="frontPreviewHtml"></div>
          </article>
          <article class="preview-pane">
            <div class="card-meta">
              <span>Verso</span>
            </div>
            <div class="preview-study-face" v-html="backPreviewHtml"></div>
          </article>
        </section>
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
