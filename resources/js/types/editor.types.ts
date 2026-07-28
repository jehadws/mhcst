import { EditorOptions } from '@tiptap/react'
import { Locale } from '@/data/i18n'

export type LocalizedString = string | Record<Locale, string>

export interface TipTapBaseProps {
  content?: string
  className?: string
}

export interface TipTapEditorProps extends TipTapBaseProps {
  onChange?: (html: string) => void
  onBlur?: (html: string) => void
  placeholder?: LocalizedString
  editable?: boolean
  showToolbar?: boolean
  minHeight?: string
  maxHeight?: string
  extensions?: EditorOptions['extensions']
  editorProps?: EditorOptions['editorProps']
}

export interface TipTapViewerProps extends TipTapBaseProps {
  emptyMessage?: LocalizedString
}