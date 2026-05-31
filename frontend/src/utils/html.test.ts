import { describe, expect, it } from 'vitest'
import { convertAnkiSoundReferences, mediaAssetUrl, shouldRewriteMediaSource } from './html'

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
})
