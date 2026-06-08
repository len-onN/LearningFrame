import { describe, expect, it } from 'vitest'
import { createApkgMediaIndex } from './apkgMedia'

describe('indice de midia APKG', () => {
  it('le midia mapeada no pacote sem persistir o arquivo', async () => {
    const file = new File([
      storedZip({
        media: JSON.stringify({ 0: 'imagem de teste.png' }),
        0: 'conteudo-da-imagem'
      })
    ], 'baralho.apkg')

    const index = await createApkgMediaIndex(file)
    const blob = await index.readBlob('imagem de teste.png')

    expect(index.hasMediaMap).toBe(true)
    expect(index.fileNames).toEqual(['imagem de teste.png'])
    expect(blob?.type).toBe('image/png')
    expect(await blob?.text()).toBe('conteudo-da-imagem')
  })
})

function storedZip(entries: Record<string, string>) {
  const encoder = new TextEncoder()
  const localParts: Uint8Array[] = []
  const centralParts: Uint8Array[] = []
  let offset = 0

  for (const [name, content] of Object.entries(entries)) {
    const nameBytes = encoder.encode(name)
    const contentBytes = encoder.encode(content)
    localParts.push(localHeader(nameBytes, contentBytes))
    localParts.push(contentBytes)
    centralParts.push(centralHeader(nameBytes, contentBytes, offset))
    offset += 30 + nameBytes.byteLength + contentBytes.byteLength
  }

  const centralDirectory = concat(centralParts)
  return concat([
    ...localParts,
    centralDirectory,
    endOfCentralDirectory(Object.keys(entries).length, centralDirectory.byteLength, offset)
  ])
}

function localHeader(name: Uint8Array, content: Uint8Array) {
  const bytes = new Uint8Array(30 + name.byteLength)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x04034b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(8, 0, true)
  view.setUint32(18, content.byteLength, true)
  view.setUint32(22, content.byteLength, true)
  view.setUint16(26, name.byteLength, true)
  bytes.set(name, 30)
  return bytes
}

function centralHeader(name: Uint8Array, content: Uint8Array, localHeaderOffset: number) {
  const bytes = new Uint8Array(46 + name.byteLength)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x02014b50, true)
  view.setUint16(4, 20, true)
  view.setUint16(6, 20, true)
  view.setUint16(10, 0, true)
  view.setUint32(20, content.byteLength, true)
  view.setUint32(24, content.byteLength, true)
  view.setUint16(28, name.byteLength, true)
  view.setUint32(42, localHeaderOffset, true)
  bytes.set(name, 46)
  return bytes
}

function endOfCentralDirectory(entryCount: number, centralDirectorySize: number, centralDirectoryOffset: number) {
  const bytes = new Uint8Array(22)
  const view = new DataView(bytes.buffer)
  view.setUint32(0, 0x06054b50, true)
  view.setUint16(8, entryCount, true)
  view.setUint16(10, entryCount, true)
  view.setUint32(12, centralDirectorySize, true)
  view.setUint32(16, centralDirectoryOffset, true)
  return bytes
}

function concat(parts: Uint8Array[]) {
  const bytes = new Uint8Array(parts.reduce((size, part) => size + part.byteLength, 0))
  let offset = 0
  for (const part of parts) {
    bytes.set(part, offset)
    offset += part.byteLength
  }
  return bytes
}
