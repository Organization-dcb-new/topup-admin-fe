import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { BlogFormValues } from '../types/blog'
import { Loader2, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ButtonCreateProps {
  handlePublish: (status: 'draft' | 'published') => void
  blogMutation: UseMutationResult<AxiosResponse, Error, BlogFormValues>
  isFormValid: boolean
  isEdit?: boolean
}

export default function ButtonCreate({
  blogMutation,
  handlePublish,
  isFormValid,
  isEdit = false,
}: ButtonCreateProps) {
  const isPending = blogMutation.isPending

  const isDisabled = isPending || (!isEdit && !isFormValid)

  const currentStatus = blogMutation.variables?.status

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        size="sm"
        disabled={isDisabled}
        onClick={() => handlePublish('published')}
        className={`h-8 px-4 text-white text-[10px] font-bold uppercase tracking-tight shadow-sm transition-all active:scale-95 
          ${
            isDisabled
              ? 'bg-gray-300 cursor-not-allowed opacity-70'
              : 'bg-purple-600 hover:bg-purple-700 shadow-purple-100'
          }`}
      >
        {isPending && currentStatus === 'published' ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : isEdit ? (
          <Save className="mr-2 h-3 w-3" />
        ) : (
          <Send className="mr-2 h-3 w-3" />
        )}

        {isEdit ? 'Update Article' : 'Publish Now'}
      </Button>
    </div>
  )
}
