import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import { cn } from '@/lib/utils'
import type { BlogFormValues } from '../types/blog'
import { useTranslation } from 'react-i18next'

interface FieldProps {
  formData: BlogFormValues
  handleEditorImageUpload: (file: File) => Promise<string>
  updateField: <K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) => void
}

const mdParser = new MarkdownIt()

export default function Field({ updateField, formData, handleEditorImageUpload }: FieldProps) {
  const { t } = useTranslation('common')

  return (
    <div className='space-y-4'>
      <input
        type='text'
        className={cn(
          'nb-field nb-frame nb-frame-thick nb-sd w-full bg-white px-4 py-3',
          'text-2xl font-black uppercase tracking-tight outline-none sm:text-3xl',
          'placeholder:font-bold placeholder:normal-case placeholder:text-[#111]/30',
        )}
        placeholder={t('blogField.titlePlaceholder')}
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
        aria-label={t('blogField.titleAria')}
      />

      <div
        className={cn(
          'nb-editor nb-frame nb-frame-thick nb-sd overflow-hidden bg-white',
          '[&_.rc-md-editor]:min-h-[320px] sm:[&_.rc-md-editor]:min-h-[420px]',
        )}
      >
        <MdEditor
          style={{ height: '550px' }}
          renderHTML={(text) => mdParser.render(text)}
          value={formData.content_markdown}
          onChange={({ text }) => updateField('content_markdown', text)}
          onImageUpload={handleEditorImageUpload}
          placeholder={t('blogField.editorPlaceholder')}
        />
      </div>
    </div>
  )
}
