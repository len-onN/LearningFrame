interface ZipEntry {
  name: string
  compressionMethod: number
  compressedSize: number
  localHeaderOffset: number
}

export interface ApkgMediaIndex {
  hasMediaMap: boolean
  fileNames: string[]
  readBlob(fileName: string): Promise<Blob | null>
}

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50
const LOCAL_FILE_SIGNATURE = 0x04034b50
const COMPRESSION_STORED = 0
const COMPRESSION_DEFLATE = 8

export async function createApkgMediaIndex(file: File): Promise<ApkgMediaIndex> {
  const archive = await file.arrayBuffer()
  const view = new DataView(archive)
  const entries = readZipEntries(archive, view)
  const mediaEntry = entries.get('media')
  if (!mediaEntry) {
    return emptyMediaIndex(false)
  }

  const mediaText = new TextDecoder().decode(await readEntryBytes(archive, view, mediaEntry))
  const mediaMap = JSON.parse(mediaText) as Record<string, string>
  const mediaByFileName = new Map<string, ZipEntry>()

  for (const [entryName, fileName] of Object.entries(mediaMap)) {
    const entry = entries.get(entryName)
    if (entry) {
      mediaByFileName.set(normalizeMediaName(fileName), entry)
    }
  }

  return {
    hasMediaMap: true,
    fileNames: [...mediaByFileName.keys()],
    async readBlob(fileName: string) {
      const entry = mediaByFileName.get(normalizeMediaName(fileName))
      if (!entry) {
        return null
      }
      const bytes = await readEntryBytes(archive, view, entry)
      return new Blob([bytes], { type: mediaContentType(fileName) })
    }
  }
}

export function normalizeMediaName(fileName: string) {
  const trimmed = fileName.trim()
  try {
    return decodeURIComponent(trimmed)
  } catch {
    return trimmed
  }
}

export function mediaContentType(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.png')) {
    return 'image/png'
  }
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return 'image/jpeg'
  }
  if (lower.endsWith('.gif')) {
    return 'image/gif'
  }
  if (lower.endsWith('.webp')) {
    return 'image/webp'
  }
  if (lower.endsWith('.mp3')) {
    return 'audio/mpeg'
  }
  if (lower.endsWith('.ogg')) {
    return 'audio/ogg'
  }
  return 'application/octet-stream'
}

function emptyMediaIndex(hasMediaMap: boolean): ApkgMediaIndex {
  return {
    hasMediaMap,
    fileNames: [],
    async readBlob() {
      return null
    }
  }
}

function readZipEntries(archive: ArrayBuffer, view: DataView) {
  const eocdOffset = findEndOfCentralDirectory(view)
  if (eocdOffset < 0) {
    throw new Error('Arquivo APKG sem diretorio ZIP central.')
  }

  const totalEntries = view.getUint16(eocdOffset + 10, true)
  let offset = view.getUint32(eocdOffset + 16, true)
  const entries = new Map<string, ZipEntry>()
  const decoder = new TextDecoder()

  for (let index = 0; index < totalEntries; index++) {
    if (view.getUint32(offset, true) !== CENTRAL_DIRECTORY_SIGNATURE) {
      throw new Error('Diretorio ZIP central invalido.')
    }

    const compressionMethod = view.getUint16(offset + 10, true)
    const compressedSize = view.getUint32(offset + 20, true)
    const fileNameLength = view.getUint16(offset + 28, true)
    const extraLength = view.getUint16(offset + 30, true)
    const commentLength = view.getUint16(offset + 32, true)
    const localHeaderOffset = view.getUint32(offset + 42, true)
    const nameStart = offset + 46
    const name = decoder.decode(new Uint8Array(archive, nameStart, fileNameLength))

    if (!name.endsWith('/')) {
      entries.set(name, { name, compressionMethod, compressedSize, localHeaderOffset })
    }

    offset = nameStart + fileNameLength + extraLength + commentLength
  }

  return entries
}

function findEndOfCentralDirectory(view: DataView) {
  const minimumOffset = Math.max(0, view.byteLength - 0xffff - 22)
  for (let offset = view.byteLength - 22; offset >= minimumOffset; offset--) {
    if (view.getUint32(offset, true) === EOCD_SIGNATURE) {
      return offset
    }
  }
  return -1
}

async function readEntryBytes(archive: ArrayBuffer, view: DataView, entry: ZipEntry) {
  const offset = entry.localHeaderOffset
  if (view.getUint32(offset, true) !== LOCAL_FILE_SIGNATURE) {
    throw new Error(`Entrada ZIP invalida: ${entry.name}`)
  }

  const fileNameLength = view.getUint16(offset + 26, true)
  const extraLength = view.getUint16(offset + 28, true)
  const dataOffset = offset + 30 + fileNameLength + extraLength
  const compressed = archive.slice(dataOffset, dataOffset + entry.compressedSize)

  if (entry.compressionMethod === COMPRESSION_STORED) {
    return compressed
  }
  if (entry.compressionMethod === COMPRESSION_DEFLATE) {
    return inflateRaw(compressed)
  }
  throw new Error(`Compressao ZIP nao suportada: ${entry.compressionMethod}`)
}

async function inflateRaw(compressed: ArrayBuffer) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Este navegador nao suporta descompressao ZIP local.')
  }
  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).arrayBuffer()
}
