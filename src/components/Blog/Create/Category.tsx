import type { BlogFormValues } from '../types/blog'

interface CategoryProps {
  formData: BlogFormValues
  listCategory: any
  updateField: (field: keyof BlogFormValues, value: string) => void
}

export default function Category({ formData, listCategory, updateField }: CategoryProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
          Game Category
        </label>
        <select
          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold outline-none"
          value={formData.category}
          onChange={(e) => updateField('category', e.target.value)}
        >
          <option value="">Pilih Game</option>
          {listCategory?.map((game: any) => (
            <option key={game.name} value={game.name}>
              {game.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
          Excerpt
        </label>
        <textarea
          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none min-h-20"
          placeholder="Ringkasan..."
          value={formData.excerpt}
          onChange={(e) => updateField('excerpt', e.target.value)}
        />
      </div>
    </div>
  )
}
