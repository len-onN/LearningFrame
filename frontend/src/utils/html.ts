import { API_BASE_URL, getAuthToken } from '../services/api'

const ANKI_SOUND_PATTERN = /\[sound:([^\]]+)]/gi

interface PreviewHtmlOptions {
  resolveMediaUrl?: (fileName: string) => string | null
}

export function safeStudyHtml(html: string, deckId?: number | string) {
  if (typeof DOMParser === 'undefined') {
    return safeStudyHtmlFallback(html, deckId)
  }

  const document = sanitizedDocument(html)
  normalizeStudyTypography(document)

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

export function safePreviewHtml(html: string, options: PreviewHtmlOptions = {}) {
  if (typeof DOMParser === 'undefined') {
    return safePreviewHtmlFallback(html, options)
  }

  const document = sanitizedDocument(html)

  document.querySelectorAll<HTMLImageElement>('img[src]').forEach((element) => {
    const current = element.getAttribute('src')
    if (current && shouldRewriteMediaSource(current)) {
      const objectUrl = options.resolveMediaUrl?.(current)
      if (objectUrl) {
        element.setAttribute('src', objectUrl)
      } else {
        element.replaceWith(mediaPlaceholder(document, 'Imagem do APKG', current))
      }
    }
  })

  document.querySelectorAll<HTMLAudioElement>('audio').forEach((element) => {
    const current = element.getAttribute('src') ?? element.querySelector('source[src]')?.getAttribute('src')
    if (current && shouldRewriteMediaSource(current)) {
      const objectUrl = options.resolveMediaUrl?.(current)
      if (objectUrl) {
        element.setAttribute('src', objectUrl)
      } else {
        element.replaceWith(mediaPlaceholder(document, 'Audio do APKG', current))
      }
    }
  })

  document.querySelectorAll<HTMLSourceElement>('source[src]').forEach((element) => {
    const current = element.getAttribute('src')
    if (current && shouldRewriteMediaSource(current)) {
      const objectUrl = options.resolveMediaUrl?.(current)
      if (objectUrl) {
        element.setAttribute('src', objectUrl)
      } else {
        element.replaceWith(mediaPlaceholder(document, 'Midia do APKG', current))
      }
    }
  })

  return document.querySelector('main')?.innerHTML ?? ''
}

export function extractRelativeMediaSources(html: string) {
  const converted = convertAnkiSoundReferences(html)
  const sources = new Set<string>()
  if (typeof DOMParser === 'undefined') {
    for (const match of converted.matchAll(/\b(?:src)\s*=\s*(["'])(.*?)\1/gi)) {
      if (shouldRewriteMediaSource(match[2])) {
        sources.add(match[2].trim())
      }
    }
    return [...sources]
  }

  const document = sanitizedDocument(converted)
  document.querySelectorAll<HTMLImageElement | HTMLAudioElement | HTMLSourceElement>('img[src], audio[src], source[src]').forEach((element) => {
    const current = element.getAttribute('src')
    if (current && shouldRewriteMediaSource(current)) {
      sources.add(current.trim())
    }
  })
  return [...sources]
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

function escapeHtmlText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function safePreviewHtmlFallback(html: string, options: PreviewHtmlOptions) {
  return convertAnkiSoundReferences(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi, (match, _quote: string, source: string) => (
      fallbackMedia(match, 'Imagem do APKG', source, options)
    ))
    .replace(/<audio\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>[\s\S]*?<\/audio>/gi, (match, _quote: string, source: string) => (
      fallbackMedia(match, 'Audio do APKG', source, options)
    ))
    .replace(/<source\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi, (match, _quote: string, source: string) => (
      fallbackMedia(match, 'Midia do APKG', source, options)
    ))
}

function safeStudyHtmlFallback(html: string, deckId?: number | string) {
  let output = convertAnkiSoundReferences(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+style\s*=\s*(["'])(.*?)\1/gi, (_match, quote: string, style: string) => {
      const cleanedStyle = stripStudyFontSizingFromInlineStyle(style)
      return cleanedStyle ? ` style=${quote}${escapeHtmlAttribute(cleanedStyle)}${quote}` : ''
    })
    .replace(/(<font\b[^>]*?)\s+size\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '$1')

  if (typeof deckId === 'number') {
    output = output.replace(/\bsrc\s*=\s*(["'])(.*?)\1/gi, (match, quote: string, source: string) => {
      return shouldRewriteMediaSource(source)
        ? `src=${quote}${escapeHtmlAttribute(mediaAssetUrl(deckId, source))}${quote}`
        : match
    })
  }

  return output
}

function fallbackMedia(original: string, label: string, source: string, options: PreviewHtmlOptions) {
  if (!shouldRewriteMediaSource(source)) {
    return original
  }
  const objectUrl = options.resolveMediaUrl?.(source)
  if (objectUrl) {
    return original.replace(source, escapeHtmlAttribute(objectUrl))
  }
  return fallbackPlaceholder(label, source)
}

function fallbackPlaceholder(label: string, fileName: string) {
  return `<span class="media-placeholder">${escapeHtmlText(`${label}: ${fileName.trim()}`)}</span>`
}

function sanitizedDocument(html: string) {
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

  return document
}

function normalizeStudyTypography(document: Document) {
  document.querySelectorAll<HTMLElement>('[style]').forEach((element) => {
    const propertyNames = Array.from(
      { length: element.style.length },
      (_, index) => element.style.item(index)
    )

    for (const property of propertyNames) {
      const normalizedProperty = property.toLowerCase()
      if (normalizedProperty === 'font' || normalizedProperty === 'font-size') {
        element.style.removeProperty(property)
      }
    }

    if (!element.getAttribute('style')?.trim()) {
      element.removeAttribute('style')
    }
  })

  document.querySelectorAll('font[size]').forEach((element) => {
    element.removeAttribute('size')
  })
}

function stripStudyFontSizingFromInlineStyle(style: string) {
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex === -1) {
        return false
      }
      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      return property !== 'font' && property !== 'font-size'
    })
    .join('; ')
}

function mediaPlaceholder(document: Document, label: string, fileName: string) {
  const element = document.createElement('span')
  element.className = 'media-placeholder'
  element.textContent = `${label}: ${fileName.trim()}`
  return element
}
