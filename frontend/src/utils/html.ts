import { API_BASE_URL, getAuthToken } from '../services/api'

const ANKI_SOUND_PATTERN = /\[sound:([^\]]+)]/gi

export function safeStudyHtml(html: string, deckId?: number | string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(`<main>${convertAnkiSoundReferences(html)}</main>`, 'text/html')

  document.querySelectorAll('script, style').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      if (name.startsWith('on') || name === 'srcdoc' || value.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute(attribute.name)
      }
    }
  })

  if (typeof deckId === 'number') {
    document.querySelectorAll<HTMLImageElement | HTMLAudioElement | HTMLSourceElement>('img[src], audio[src], source[src]').forEach((element) => {
      const current = element.getAttribute('src')
      if (current && shouldRewriteMediaSource(current)) {
        element.setAttribute('src', mediaAssetUrl(deckId, current))
      }
    })
  }

  return document.querySelector('main')?.innerHTML ?? ''
}

export function convertAnkiSoundReferences(html: string) {
  return html.replace(ANKI_SOUND_PATTERN, (_, fileName: string) => {
    const safeFileName = escapeHtmlAttribute(fileName.trim())
    return safeFileName ? `<audio controls src="${safeFileName}"></audio>` : ''
  })
}

export function mediaAssetUrl(deckId: number, fileName: string) {
  const token = getAuthToken()
  const path = `${API_BASE_URL}/api/decks/${deckId}/media/${encodeURIComponent(fileName.trim())}`
  return token ? `${path}?token=${encodeURIComponent(token)}` : path
}

export function shouldRewriteMediaSource(source: string) {
  const normalized = source.trim().toLowerCase()
  return Boolean(normalized)
    && !normalized.startsWith('http://')
    && !normalized.startsWith('https://')
    && !normalized.startsWith('data:')
    && !normalized.startsWith('blob:')
}

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}
