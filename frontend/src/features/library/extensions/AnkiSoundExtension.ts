import { Node, mergeAttributes } from '@tiptap/core'
import { mediaAssetUrl } from '../../../utils/html'

export interface AnkiSoundOptions {
  HTMLAttributes: Record<string, any>
}

export const AnkiSoundExtension = Node.create<AnkiSoundOptions>({
  name: 'ankiSound',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      'data-anki-sound': {
        default: null,
      },
      'data-deck-id': {
        default: null,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'audio[data-anki-sound]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const fileName = HTMLAttributes['data-anki-sound']
    const deckId = HTMLAttributes['data-deck-id']
    
    let src = ''
    if (fileName && deckId) {
      src = mediaAssetUrl(Number(deckId), fileName)
    }

    return [
      'audio', 
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { controls: true, src })
    ]
  },
})
