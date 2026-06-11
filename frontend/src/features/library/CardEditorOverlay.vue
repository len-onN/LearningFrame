<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { Save, X } from '@lucide/vue'
import RichTextEditor from './RichTextEditor.vue'
import type {
  CardEditorFace,
  CardEditorMediaKind,
  CardEditorMediaUploader
} from './cardEditorTypes'

const props = defineProps<{
  deckId: number
  deckTitle: string
  title: string
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
const frontEditorRef = ref<InstanceType<typeof RichTextEditor> | null>(null)
const backEditorRef = ref<InstanceType<typeof RichTextEditor> | null>(null)
const mediaInputRef = ref<HTMLInputElement | null>(null)
const mediaUploadKind = ref<CardEditorMediaKind>('image')
const uploadingMedia = ref(false)

watch(() => props.title, () => {
  activeEditorFace.value = 'front'
  // Focus via DOM query inside editor or leave it since Tiptap might grab focus natively later
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
  const target = face === 'front' ? frontEditorRef.value : backEditorRef.value
  target?.insertHtml(text)
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
            </div>
            <RichTextEditor
              ref="frontEditorRef"
              v-model="frontHtml"
              :deck-id="deckId"
              :uploading-media="uploadingMedia"
              @upload-media="k => triggerMediaUpload(k, 'front')"
              @focusin="activeEditorFace = 'front'"
            />
          </section>

          <section class="editor-face-block">
            <div class="section-title compact-title">
              <h3>Verso</h3>
            </div>
            <RichTextEditor
              ref="backEditorRef"
              v-model="backHtml"
              :deck-id="deckId"
              :uploading-media="uploadingMedia"
              @upload-media="k => triggerMediaUpload(k, 'back')"
              @focusin="activeEditorFace = 'back'"
            />
          </section>

          <label class="form-field">
            <span class="field-label">Tags</span>
            <input v-model="tags" type="text" maxlength="400" placeholder="separadas por virgula" aria-label="Tags da carta" />
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
