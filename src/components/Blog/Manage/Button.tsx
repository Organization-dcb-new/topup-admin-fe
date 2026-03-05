'use client'

import type { UseMutationResult } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { BlogFormValues } from '../types/blog'
import { Loader2, Send, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ButtonManageProps {
  handlePublish: (status: 'draft' | 'published') => void
  blogMutation: UseMutationResult<AxiosResponse, Error, BlogFormValues>
  isFormValid: boolean
  isEdit?: boolean
  currentStatusValue: 'draft' | 'published'
  onStatusChange: (status: 'draft' | 'published') => void
}

export default function ButtonManage({
  blogMutation,
  handlePublish,
  isFormValid,
  isEdit = false,
  currentStatusValue,
  onStatusChange,
}: ButtonManageProps) {
  const isPending = blogMutation.isPending
  const isDisabled = isPending || !isFormValid

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
        Publication Status
      </label>

      {/* RADIO BUTTON GROUP */}
      <div className="space-y-2">
        {[
          { id: 'published', label: 'Published', desc: 'Visible to everyone' },
          { id: 'draft', label: 'Draft', desc: 'Only visible to admin' },
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => onStatusChange(item.id as 'draft' | 'published')}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              currentStatusValue === item.id
                ? 'border-purple-500 bg-purple-50/50'
                : 'border-gray-50 bg-gray-50/30 hover:border-gray-200'
            }`}
          >
            {/* Bulatan Radio */}
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                currentStatusValue === item.id
                  ? 'border-purple-500 bg-purple-500'
                  : 'border-gray-300 bg-white'
              }`}
            >
              {currentStatusValue === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={`text-xs font-bold ${currentStatusValue === item.id ? 'text-purple-700' : 'text-gray-600'}`}
              >
                {item.label}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-50" />

      {/* ACTION BUTTON */}
      <Button
        type="button"
        disabled={isDisabled}
        onClick={() => handlePublish(currentStatusValue)}
        className={`w-full h-10 cursor-pointer text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md ${
          isDisabled
            ? 'bg-gray-200 text-gray-400'
            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200'
        }`}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : isEdit ? (
          <Save className="mr-2 h-3 w-3" />
        ) : (
          <Send className="mr-2 h-3 w-3" />
        )}
        {isPending ? 'Processing...' : isEdit ? 'Update Changes' : 'Publish Article'}
      </Button>
    </div>
  )
}
