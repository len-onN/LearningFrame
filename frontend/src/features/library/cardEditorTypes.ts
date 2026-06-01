export type CardEditorMode = 'create' | 'edit'
export type CardEditorFace = 'front' | 'back'
export type CardEditorMediaKind = 'image' | 'audio'

export interface CardEditorFormState {
  frontHtml: string
  backHtml: string
  tags: string
}

export type CardEditorMediaUploader = (
  file: File,
  kind: CardEditorMediaKind
) => Promise<string>
