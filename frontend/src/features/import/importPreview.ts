import type { ApkgCard } from '../../types/api'
import { extractRelativeMediaSources } from '../../utils/html'

export function previewCardTitle(index: number, total: number) {
  return total ? `Carta ${index + 1} de ${total}` : `Carta ${index + 1}`
}

export function previewCardOptionLabel(card: Pick<ApkgCard, 'frontHtml' | 'backHtml'>, index: number) {
  const text = htmlSummary(card.frontHtml) || htmlSummary(card.backHtml)
  if (!text) {
    return `Carta ${index + 1}`
  }
  return `${index + 1} - ${text}`
}

export function previewCardSearchText(card: ApkgCard, index: number) {
  const mediaSources = [
    ...extractRelativeMediaSources(card.frontHtml),
    ...extractRelativeMediaSources(card.backHtml)
  ]
  return normalizePreviewSearch([
    index + 1,
    `carta ${index + 1}`,
    card.frontHtml,
    card.backHtml,
    card.tags.join(' '),
    mediaSources.join(' ')
  ].join(' '))
}

export function htmlSummary(html: string) {
  const text = html
    .replace(/\[sound:[^\]]+]/gi, 'audio')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 64 ? `${text.slice(0, 61)}...` : text
}

function normalizePreviewSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
