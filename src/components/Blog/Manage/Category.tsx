import { useState, useRef, useEffect } from 'react'
import { Gamepad2, AlignLeft, Search, ChevronDown, Check, X } from 'lucide-react'
import type { BlogFormValues } from '../types/blog'

interface CategoryProps {
  formData: BlogFormValues
  listCategory: any
  updateField: (field: keyof BlogFormValues, value: string) => void
}

export default function Category({ formData, listCategory, updateField }: CategoryProps) {
  const EXCERPT_MAX_LENGTH = 150
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCategories = listCategory?.filter((game: any) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (name: string) => {
    updateField('category', name)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="space-y-4">
      <div
        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200"
        ref={dropdownRef}
      >
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Gamepad2 size={12} className="text-purple-500" />
          Game Category
        </label>

        <div className="relative">
          {/* Custom Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold flex items-center justify-between transition-all focus:ring-2 focus:ring-purple-100 active:scale-[0.98] ${
              isOpen ? 'ring-2 ring-purple-100 border-purple-300' : ''
            }`}
          >
            <span className={formData.category ? 'text-gray-700' : 'text-gray-400'}>
              {formData.category || 'Select Game Category'}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Panel */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <Search size={14} className="text-gray-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search game..."
                  autoFocus
                  className="w-full p-2 bg-transparent text-xs outline-none focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X size={10} className="text-gray-400" />
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                {filteredCategories?.length > 0 ? (
                  filteredCategories.map((game: any) => (
                    <button
                      key={game.name}
                      type="button"
                      onClick={() => handleSelect(game.name)}
                      className="w-full p-2.5 text-left text-xs font-semibold hover:bg-purple-50 hover:text-purple-600 flex items-center justify-between transition-colors group"
                    >
                      {game.name}
                      {formData.category === game.name && (
                        <Check size={12} className="text-purple-500" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-[10px] text-gray-400 italic">
                    No results found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: EXCERPT WITH COUNTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <AlignLeft size={12} className="text-purple-500" />
            Excerpt / Summary
          </label>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${
              formData.excerpt.length >= EXCERPT_MAX_LENGTH
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {formData.excerpt.length} / {EXCERPT_MAX_LENGTH}
          </span>
        </div>

        <textarea
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none min-h-25 focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all resize-none leading-relaxed text-gray-600"
          placeholder="Write a short summary of your article..."
          value={formData.excerpt}
          maxLength={EXCERPT_MAX_LENGTH}
          onChange={(e) => updateField('excerpt', e.target.value)}
        />

        <p className="mt-2 text-[9px] text-gray-400 italic leading-tight">
          Keep it short and catchy. This will appear on search results and home cards.
        </p>
      </div>
    </div>
  )
}
