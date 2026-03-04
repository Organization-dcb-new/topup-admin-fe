import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'

import type { BlogFormValues } from '../types/blog'

interface FieldProps {
  formData: BlogFormValues
  handleEditorImageUpload: (file: File) => Promise<any>

  updateField: (field: keyof BlogFormValues, value: string) => void
}

const mdParser = new MarkdownIt()

export default function Field({ updateField, formData, handleEditorImageUpload }: FieldProps) {
  return (
    <div className="lg:col-span-3 space-y-4">
      <input
        className="w-full text-4xl font-black outline-none border-none bg-transparent placeholder:text-gray-200"
        placeholder="Judul Artikel..."
        value={formData.title}
        onChange={(e) => updateField('title', e.target.value)}
      />

      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <MdEditor
          style={{ height: '550px' }}
          renderHTML={(text) => mdParser.render(text)}
          value={formData.content_markdown}
          onChange={({ text }) => updateField('content_markdown', text)}
          onImageUpload={handleEditorImageUpload}
          placeholder="Tulis konten menarik di sini..."
        />
      </div>
    </div>
  )
}
