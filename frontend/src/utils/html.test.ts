import { describe, expect, it } from 'vitest'
import { convertAnkiSoundReferences, extractRelativeMediaSources, mediaAssetUrl, safePreviewHtml, shouldRewriteMediaSource } from './html'

describe('html seguro de estudo', () => {
  it('converte referencias de som do Anki para audio HTML', () => {
    expect(convertAnkiSoundReferences('Ouça [sound:audio de teste.mp3] agora')).toContain(
      '<audio controls src="audio de teste.mp3"></audio>'
    )
  })

  it('escapa nomes de arquivos de audio antes de gerar HTML', () => {
    expect(convertAnkiSoundReferences('[sound:audio\"<ruim>.mp3]')).toBe(
      '<audio controls src="audio&quot;&lt;ruim&gt;.mp3"></audio>'
    )
  })

  it('reescreve apenas midias relativas do baralho persistido', () => {
    expect(shouldRewriteMediaSource('Screen Shot 2016.png')).toBe(true)
    expect(shouldRewriteMediaSource('https://exemplo.com/imagem.png')).toBe(false)
    expect(shouldRewriteMediaSource('http://exemplo.com/imagem.png')).toBe(false)
    expect(shouldRewriteMediaSource('data:image/png;base64,abc')).toBe(false)
    expect(shouldRewriteMediaSource('blob:http://local/abc')).toBe(false)
  })

  it('gera URL de midia com nomes codificados', () => {
    expect(mediaAssetUrl(42, 'Screen Shot 2016-04-19.png')).toBe(
      'http://127.0.0.1:8081/api/decks/42/media/Screen%20Shot%202016-04-19.png'
    )
  })

  it('substitui imagens relativas por marcador na previa APKG', () => {
    const html = safePreviewHtml('<p>Observe:</p><img src="Screen Shot 2016.png" onerror="alert(1)">')

    expect(html).toContain('Imagem do APKG: Screen Shot 2016.png')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('onerror')
  })

  it('substitui audio relativo por marcador na previa APKG', () => {
    const html = safePreviewHtml('Ouça [sound:audio de teste.mp3]')

    expect(html).toContain('Audio do APKG: audio de teste.mp3')
    expect(html).not.toContain('<audio')
  })

  it('renderiza midia da previa quando existe URL temporaria', () => {
    const html = safePreviewHtml('<img src="musculo.png">', {
      resolveMediaUrl: () => 'blob:http://local/musculo'
    })

    expect(html).toContain('src="blob:http://local/musculo"')
    expect(html).not.toContain('Imagem do APKG')
  })

  it('extrai fontes relativas de imagens e sons do APKG', () => {
    expect(extractRelativeMediaSources('<img src="a.png"> [sound:b.mp3] <img src="https://exemplo.com/c.png">')).toEqual([
      'a.png',
      'b.mp3'
    ])
  })
})
