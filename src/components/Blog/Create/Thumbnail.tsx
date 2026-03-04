import { ImageIcon } from 'lucide-react'
import type { BlogFormValues } from '../types/blog'
import type { UseMutationResult } from '@tanstack/react-query'

interface ThubmnailProps {
  formData: BlogFormValues
  uploadMutation: UseMutationResult<any, Error, File, unknown>
}

export default function Thubmnail({ formData, uploadMutation }: ThubmnailProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
        Thumbnail
      </label>
      <div className="relative aspect-video rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
        {formData.thumbnail ? (
          <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto text-gray-300 mb-1" size={20} />
            <p className="text-[9px] font-bold text-gray-400">UPLOAD</p>
          </div>
        )}
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.[0] && uploadMutation.mutate(e.target.files[0])}
        />
      </div>
    </div>
  )
}
