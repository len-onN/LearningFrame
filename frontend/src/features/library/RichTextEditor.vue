<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Image as ImageIcon, Volume2, Heading1, Heading2, Heading3,
  Mic, Square
} from '@lucide/vue'
import { watch, onBeforeUnmount } from 'vue'
import { AnkiSoundExtension } from './extensions/AnkiSoundExtension'
import { useAudioRecorder } from '../../composables/useAudioRecorder'

const props = defineProps<{
  modelValue: string
  uploadingMedia?: boolean
  deckId?: number
  ariaLabel?: string
}>()

const ANKI_SOUND_PATTERN = /\[sound:([^\]]+)]/gi
const AUDIO_TAG_PATTERN = /<audio\b[^>]*\bdata-anki-sound\s*=\s*(["'])(.*?)\1[^>]*>[\s\S]*?<\/audio>/gi

function parseIncoming(html: string) {
  if (!props.deckId) return html
  return html.replace(ANKI_SOUND_PATTERN, (_, fileName) => {
    const safeFileName = fileName.trim().replaceAll('"', '&quot;')
    return `<audio data-anki-sound="${safeFileName}" data-deck-id="${props.deckId}"></audio>`
  })
}

function parseOutgoing(html: string) {
  return html.replace(AUDIO_TAG_PATTERN, (_, _quote, fileName) => {
    return `[sound:${fileName}]`
  })
}

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'upload-media': [kind: 'image' | 'audio', file?: File]
}>()

const { isRecording, recordingTime, startRecording, stopRecording } = useAudioRecorder(60)

async function handleStartRecording() {
  const file = await startRecording()
  if (file) {
    emit('upload-media', 'audio', file)
  }
}

function handleStopRecording() {
  stopRecording()
}

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true
    }),
    AnkiSoundExtension
  ],
  content: parseIncoming(props.modelValue),
  editorProps: {
    attributes: {
      ...(props.ariaLabel ? { 'aria-label': props.ariaLabel } : {})
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', parseOutgoing(editor.getHTML()))
  }
})

// Update editor content when v-model changes from outside
watch(() => props.modelValue, (value) => {
  if (!editor.value) return
  const currentOutgoing = parseOutgoing(editor.value.getHTML())
  if (currentOutgoing !== value) {
    editor.value.commands.setContent(parseIncoming(value))
  }
})

// Expose insert method so parent can insert media
function insertHtml(html: string) {
  if (editor.value) {
    editor.value.commands.insertContent(parseIncoming(html))
    editor.value.commands.focus()
  }
}
defineExpose({ insertHtml })

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<template>
  <div class="rich-text-editor">
    <div v-if="editor" class="toolbar">
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" title="Negrito">
        <Bold :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" title="Itálico">
        <Italic :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" title="Sublinhado">
        <UnderlineIcon :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" title="Título 1">
        <Heading1 :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" title="Título 2">
        <Heading2 :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }" title="Título 3">
        <Heading3 :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor?.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor?.isActive('bulletList') }" title="Lista com marcadores">
        <List :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="editor?.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor?.isActive('orderedList') }" title="Lista numerada">
        <ListOrdered :size="16" />
      </button>
      <div class="divider"></div>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="$emit('upload-media', 'image')" title="Inserir Imagem">
        <ImageIcon :size="16" />
      </button>
      <button type="button" :disabled="uploadingMedia || isRecording" @click="$emit('upload-media', 'audio')" title="Fazer Upload de Áudio">
        <Volume2 :size="16" />
      </button>
      <button v-if="!isRecording" type="button" :disabled="uploadingMedia" @click="handleStartRecording" title="Gravar Áudio (Microfone)">
        <Mic :size="16" />
      </button>
      <button v-else type="button" class="recording-active" @click="handleStopRecording" title="Parar e Inserir Gravação">
        <Square :size="14" fill="currentColor" />
        <span class="recording-time">00:{{ recordingTime.toString().padStart(2, '0') }}</span>
      </button>
    </div>
    
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.rich-text-editor {
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: var(--radius-md, 8px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--surface-color, #ffffff);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background-color: var(--background-color, #f8fafc);
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  flex-wrap: wrap;
}

.toolbar button {
  background: none;
  border: none;
  padding: 0.35rem;
  border-radius: var(--radius-sm, 4px);
  color: var(--text-muted, #64748b);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toolbar button:hover:not(:disabled) {
  background-color: var(--surface-color-hover, rgba(0,0,0,0.05));
  color: var(--text-color, #0f172a);
}

.toolbar button.is-active {
  background-color: var(--primary-light, rgba(0, 102, 255, 0.1));
  color: var(--primary-color, #0066ff);
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-active {
  background-color: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
  animation: pulse-record 2s infinite;
  display: flex;
  gap: 0.25rem;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  font-size: 0.85rem;
}

@keyframes pulse-record {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--border-color, #e2e8f0);
  margin: 0 0.25rem;
}

.editor-content {
  padding: 0.75rem;
  min-height: 200px;
  cursor: text;
  flex: 1;
  overflow-y: auto;
}

:deep(.tiptap) {
  outline: none;
  min-height: 100%;
}

:deep(.tiptap p.is-editor-empty:first-child::before) {
  color: var(--text-muted, #64748b);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

:deep(.tiptap img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 4px);
}

:deep(.tiptap audio) {
  max-width: 100%;
}
</style>
