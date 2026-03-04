import { Loader2, UploadCloud } from 'lucide-react'
import type { BlogFormValues } from '../types/blog'
import type { UseMutationResult } from '@tanstack/react-query'

interface ThubmnailProps {
  formData: BlogFormValues
  uploadMutation: UseMutationResult<any, Error, File, unknown>
}

export default function Thumbnail({ formData, uploadMutation }: ThubmnailProps) {
  const isUploading = uploadMutation.isPending

  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
        Thumbnail Image
      </label>

      <div
        className={`relative aspect-video rounded-xl bg-gray-50 border-2 border-dashed transition-all overflow-hidden flex items-center justify-center
        ${isUploading ? 'border-purple-300 bg-purple-50/30' : 'border-gray-200 hover:border-purple-400'}
      `}
      >
        {formData.thumbnail ? (
          <img
            src={formData.thumbnail}
            alt="Preview"
            className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-40' : 'opacity-100'}`}
          />
        ) : (
          <div className="text-center">
            <UploadCloud
              className={`mx-auto mb-2 transition-colors ${isUploading ? 'text-purple-400' : 'text-gray-300'}`}
              size={24}
            />
            <p className="text-[10px] font-bold text-gray-400 tracking-tighter">
              {isUploading ? 'UPLOADING...' : 'CLICK OR DRAG TO UPLOAD'}
            </p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mb-2" />
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              {/* Animasi Progress Bar buatan */}
              <div className="h-full bg-purple-600 animate-progress-loading" />
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          disabled={isUploading}
          className={`absolute inset-0 opacity-0 ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadMutation.mutate(file)
          }}
        />
      </div>

      <p className="mt-2 text-[9px] text-gray-400 text-center italic">
        Recommended size: 1280x720px (16:9)
      </p>
    </div>
  )
}
