'use client'
import 'react-markdown-editor-lite/lib/index.css'

import { useBlogForm } from '../hooks/create'
import { useGetGameNames } from '@/hooks/useGame'
import ButtonCreate from './ButtonCreate'
import Thubmnail from './Thumbnail'
import Category from './Category'
import Field from './Field'

type ViewMode = 'list' | 'create'

interface CreateProps {
  setView: (view: ViewMode) => void
}

export default function CreateBlog({ setView }: CreateProps) {
  const { formData, updateField, uploadMutation, blogMutation, handlePublish, isFormValid } =
    useBlogForm({ setView })
  const { data: listCategory } = useGetGameNames()

  const handleEditorImageUpload = async (file: File) => {
    return await uploadMutation.mutateAsync(file)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      <Field
        formData={formData}
        handleEditorImageUpload={handleEditorImageUpload}
        updateField={updateField}
      />
      <div className="space-y-6">
        <ButtonCreate
          blogMutation={blogMutation}
          handlePublish={handlePublish}
          isFormValid={isFormValid}
        />
        <Thubmnail formData={formData} uploadMutation={uploadMutation} />
        <Category formData={formData} listCategory={listCategory} updateField={updateField} />
      </div>
    </div>
  )
}
