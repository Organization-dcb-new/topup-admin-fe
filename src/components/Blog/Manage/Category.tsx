import { useState, useRef, useEffect } from 'react'
import { Gamepad2, AlignLeft, Search, ChevronDown, Check, X, Hash, Plus } from 'lucide-react'
import type { BlogFormValues } from '../types/blog'

interface CategoryProps {
  formData: BlogFormValues
  listCategory: any
  updateField: (field: keyof BlogFormValues, value: any) => void
}

export default function Category({ formData, listCategory, updateField }: CategoryProps) {
  const EXCERPT_MAX_LENGTH = 150
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tagSearch, setTagSearch] = useState('') 
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

  // Filter untuk sugesti tags
  const suggestedTags = listCategory?.filter((game: any) =>
    game.name.toLowerCase().includes(tagSearch.toLowerCase())
  )

  const handleSelect = (name: string) => {
    updateField('category', name)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase()
    const currentTags = formData.tags || []
    if (cleanTag && !currentTags.includes(cleanTag)) {
      updateField('tags', [...currentTags, cleanTag])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = formData.tags || []
    updateField(
      'tags',
      currentTags.filter((t) => t !== tagToRemove)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  return (
    <div className="space-y-4">
      {/* SECTION: CATEGORY */}
      <div
        className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200"
        ref={dropdownRef}
      >
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Gamepad2 size={12} className="text-purple-500" />
          Game Category
        </label>

        <div className="relative">
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

      {/* SECTION: EXCERPT */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200">
        <div className="flex justify-between items-center mb-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <AlignLeft size={12} className="text-purple-500" />
            Excerpt / Summary
          </label>
          <span
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-colors ${formData.excerpt.length >= EXCERPT_MAX_LENGTH ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}
          >
            {formData.excerpt.length} / {EXCERPT_MAX_LENGTH}
          </span>
        </div>
        <textarea
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none min-h-25 focus:ring-2 focus:ring-purple-100 transition-all resize-none text-gray-600"
          placeholder="Short summary..."
          value={formData.excerpt}
          maxLength={EXCERPT_MAX_LENGTH}
          onChange={(e) => updateField('excerpt', e.target.value)}
        />
      </div>

      {/* SECTION: TAGS WITH SEARCHABLE SUGGESTIONS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-purple-200">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Hash size={12} className="text-purple-500" />
          Tags / Keywords
        </label>

        {/* Input & Selected Tags */}
        <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-purple-100 transition-all">
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg shadow-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-200"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-1 min-w-30 bg-transparent text-xs p-1 outline-none text-gray-600"
            placeholder="Type tag & enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* --- SMART SUGGESTIONS AREA --- */}
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
              Quick add tags
            </p>
            <div className="relative flex items-center">
              <Search size={10} className="absolute left-2 text-gray-400" />
              <input
                type="text"
                placeholder="Find category..."
                className="bg-gray-50 border-none text-[10px] pl-6 pr-2 py-1 rounded-md outline-none w-32 focus:w-40 transition-all focus:ring-1 focus:ring-purple-200"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Scrollable Box for All Categories */}
          <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 pr-1">
            <div className="flex flex-wrap gap-1.5">
              {suggestedTags?.length > 0 ? (
                suggestedTags.map((game: any) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => handleAddTag(game.name)}
                    disabled={formData.tags?.includes(game.name.toLowerCase())}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 font-medium ${
                      formData.tags?.includes(game.name.toLowerCase())
                        ? 'bg-gray-50 text-gray-300 border-gray-50 cursor-not-allowed opacity-50'
                        : 'bg-white text-gray-600 border-gray-100 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 shadow-sm'
                    }`}
                  >
                    <Plus
                      size={10}
                      className={
                        formData.tags?.includes(game.name.toLowerCase())
                          ? 'hidden'
                          : 'text-purple-400'
                      }
                    />
                    {game.name}
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 italic py-2">No categories found...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
