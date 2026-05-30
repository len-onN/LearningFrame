import { API_BASE_URL } from '../services/api'

export function safeStudyHtml(html: string, deckId?: number | string) {
  const parser = new DOMParser()
  const document = parser.parseFromString(`<main>${html}</main>`, 'text/html')

  document.querySelectorAll('script, style').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim()
      if (name.startsWith('on') || value.toLowerCase().startsWith('javascript:')) {
        element.removeAttribute(attribute.name)
      }
    }
  })

  if (typeof deckId === 'number') {
    document.querySelectorAll<HTMLImageElement | HTMLAudioElement | HTMLSourceElement>('img[src], audio[src], source[src]').forEach((element) => {
      const current = element.getAttribute('src')
      if (current && !current.startsWith('http') && !current.startsWith('data:')) {
        element.setAttribute('src', `${API_BASE_URL}/api/decks/${deckId}/media/${encodeURIComponent(current)}`)
      }
    })
  }

  return document.querySelector('main')?.innerHTML ?? ''
}
