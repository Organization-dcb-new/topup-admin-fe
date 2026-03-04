'use client'

import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { BlogFormValues } from '../types/blog'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ButtonCreateProps {
  handlePublish: (status: 'draft' | 'published') => void
  blogMutation: UseMutationResult<AxiosResponse, Error, BlogFormValues>
  isFormValid: boolean
}

export default function ButtonCreate({
  blogMutation,
  handlePublish,
  isFormValid,
}: ButtonCreateProps) {
  const isPending = blogMutation.isPending
  const isDisabled = isPending || !isFormValid

  const currentStatus = blogMutation.variables?.status

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        size="sm"
        disabled={isDisabled}
        onClick={() => handlePublish('published')}
        className="h-8 px-4  text-white text-[10px] font-bold uppercase tracking-tight shadow-sm shadow-purple-100 transition-all active:scale-95"
      >
        {isPending && currentStatus === 'published' ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : (
          <Send className="mr-2 h-3 w-3" />
        )}
        PUBLISH NOW
      </Button>
    </div>
  )
}
