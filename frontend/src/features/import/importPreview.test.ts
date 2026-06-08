import { describe, expect, it } from 'vitest'
import {
  htmlSummary,
  previewCardOptionLabel,
  previewCardSearchText,
  previewCardTitle
} from './importPreview'

describe('importPreview', () => {
  it('formata titulo da carta considerando total quando disponivel', () => {
    expect(previewCardTitle(0, 3)).toBe('Carta 1 de 3')
    expect(previewCardTitle(0, 0)).toBe('Carta 1')
  })

  it('gera label da opcao a partir do resumo de frente ou verso', () => {
    expect(previewCardOptionLabel({ frontHtml: '<p>Frente</p>', backHtml: '' }, 1)).toBe('2 - Frente')
    expect(previewCardOptionLabel({ frontHtml: '', backHtml: '<p>Verso</p>' }, 1)).toBe('2 - Verso')
    expect(previewCardOptionLabel({ frontHtml: '', backHtml: '' }, 1)).toBe('Carta 2')
  })

  it('resume HTML removendo tags, compactando espacos e tratando audio', () => {
    expect(htmlSummary('<p>  Um <strong>texto</strong> </p>')).toBe('Um texto')
    expect(htmlSummary('[sound:audio.mp3]')).toBe('audio')
    expect(htmlSummary(`<p>${'a'.repeat(70)}</p>`)).toBe(`${'a'.repeat(61)}...`)
  })

  it('inclui tags, texto e midias relativas no texto de busca normalizado', () => {
    const searchText = previewCardSearchText({
      frontHtml: '<p>Órbita</p><img src="imagem.png">',
      backHtml: '[sound:audio.mp3]',
      tags: ['Anatomia']
    }, 2)

    expect(searchText).toContain('carta 3')
    expect(searchText).toContain('orbita')
    expect(searchText).toContain('anatomia')
    expect(searchText).toContain('imagem.png')
    expect(searchText).toContain('audio.mp3')
  })
})
