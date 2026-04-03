import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import { cn } from '@/lib/utils'
import type { BlogFormValues } from '../types/blog'

interface FieldProps {
  formData: BlogFormValues
  handleEditorImageUpload: (file: File) => Promise<string>
  updateField: <K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) => void
}

const mdParser = new MarkdownIt()

export default function Field({ updateField, formData, handleEditorImageUpload }: FieldProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        className={cn(
          'w-full border-0 bg-transparent text-3xl font-bold tracking-tight outline-none',
          'placeholder:text-muted-foreground/40 sm:text-4xl',
          'focus-visible:ring-0',
        )}
        placeholder="Judul artikel…"
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        aria-label="Judul artikel"
      />

      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm ring-1 ring-gray-900/5',
          '[&_.rc-md-editor]:min-h-[320px] sm:[&_.rc-md-editor]:min-h-[420px]',
        )}
      >
        <MdEditor
          style={{ height: '550px' }}
          renderHTML={(text) => mdParser.render(text)}
          value={formData.content_markdown}
          onChange={({ text }) => updateField('content_markdown', text)}
          onImageUpload={handleEditorImageUpload}
          placeholder="Tulis konten di sini (Markdown didukung)…"
        />
      </div>
    </div>
  )
}
