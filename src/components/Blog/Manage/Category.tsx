import { cn } from '@/lib/utils'
import type { GameNames } from '@/hooks/useGame'
import type { BlogFormValues } from '../types/blog'
import { Check, ChevronDown, Gamepad2, Hash, Plus, Search, X } from 'lucide-react'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface CategoryProps {
  formData: BlogFormValues
  listCategory: GameNames[] | undefined
  updateField: <K extends keyof BlogFormValues>(field: K, value: BlogFormValues[K]) => void
}

export default function Category({ formData, listCategory, updateField }: CategoryProps) {
  const { t } = useTranslation('common')
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

  const games = listCategory ?? []

  const filteredCategories = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const suggestedTags = games.filter((game) =>
    game.name.toLowerCase().includes(tagSearch.toLowerCase()),
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
      currentTags.filter((x) => x !== tagToRemove),
    )
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddTag(tagInput)
    }
  }

  return (
    <div className='space-y-4'>
      <div ref={dropdownRef} className='nb-frame nb-frame-thick nb-sd bg-white p-4'>
        <p className='mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]'>
          <Gamepad2 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
          {t('blogCategory.gameCategoryTitle')}
        </p>

        <div className='relative'>
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup='listbox'
            data-active={isOpen || undefined}
            className={cn(
              'nb-item flex w-full items-center justify-between p-3 text-left text-sm font-bold',
              isOpen ? 'bg-[#ffd84d]' : 'bg-[#f5f1e8] hover:bg-white',
            )}
          >
            <span className={formData.category ? '' : 'text-[#111]/45'}>
              {formData.category || t('blogCategory.selectPlaceholder')}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 transition-transform', isOpen && 'rotate-180')}
              strokeWidth={3}
              aria-hidden
            />
          </button>

          {isOpen && (
            <div
              className='nb-frame nb-frame-thick nb-sd absolute z-50 mt-2 w-full overflow-hidden bg-white'
              role='listbox'
            >
              <div className='flex items-center gap-2 border-b-4 border-[#111] bg-[#f5f1e8] p-2'>
                <Search className='ml-1 h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                <input
                  type='text'
                  placeholder={t('blogCategory.searchPlaceholder')}
                  autoFocus
                  className='min-w-0 flex-1 bg-transparent py-2 text-xs font-bold outline-none placeholder:font-medium placeholder:text-[#111]/40'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('blogCategory.searchAria')}
                />
              </div>

              <div className='max-h-48 overflow-y-auto'>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((game) => (
                    <button
                      key={game.id}
                      type='button'
                      role='option'
                      aria-selected={formData.category === game.name}
                      onClick={() => handleSelect(game.name)}
                      className={cn(
                        'flex w-full items-center justify-between border-b-2 border-[#111]/10 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide transition-colors last:border-b-0',
                        formData.category === game.name
                          ? 'bg-[#c9f24d]'
                          : 'hover:bg-[#f5f1e8]',
                      )}
                    >
                      {game.name}
                      {formData.category === game.name && (
                        <Check className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
                      )}
                    </button>
                  ))
                ) : (
                  <div className='p-4 text-center text-xs font-bold text-[#111]/55'>
                    {t('blogCategory.noResults')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='nb-frame nb-frame-thick nb-sd bg-white p-4'>
        <p className='mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]'>
          <Hash className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
          {t('blogCategory.tagsTitle')}
        </p>

        <div className='nb-field nb-frame nb-frame-thin nb-sd-sm flex flex-wrap gap-2 bg-[#f5f1e8] p-2.5'>
          {formData.tags?.map((tag) => (
            <span
              key={tag}
              className='nb-frame nb-frame-thin inline-flex items-center gap-1 bg-[#ff9ed2] pl-1.5 pr-1 text-[10px] font-black uppercase tracking-wide'
            >
              {tag}
              <button
                type='button'
                onClick={() => handleRemoveTag(tag)}
                className='cursor-pointer p-0.5 hover:bg-[#ff4d3d]'
                aria-label={t('blogCategory.removeTagAria', { tag })}
              >
                <X className='h-3 w-3' strokeWidth={3} aria-hidden />
              </button>
            </span>
          ))}
          <input
            type='text'
            className='min-w-[6rem] flex-1 bg-transparent p-1 text-xs font-bold outline-none placeholder:font-medium placeholder:text-[#111]/40'
            placeholder={t('blogCategory.tagsInputPlaceholder')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('blogCategory.tagsInputAria')}
          />
        </div>

        <div className='mt-4 border-t-4 border-[#111] pt-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-[10px] font-black uppercase tracking-[0.14em]'>
              {t('blogCategory.quickAddTitle')}
            </p>
            <div className='relative flex items-center'>
              <Search
                className='absolute left-2 h-3 w-3 text-[#111]/50'
                strokeWidth={3}
                aria-hidden
              />
              <input
                type='text'
                placeholder={t('blogCategory.quickSearchPlaceholder')}
                className='nb-field nb-frame nb-frame-thin w-28 bg-white py-1 pl-7 pr-2 text-[10px] font-bold outline-none transition-all focus:w-36 placeholder:font-medium placeholder:text-[#111]/40'
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                aria-label={t('blogCategory.quickSearchAria')}
              />
            </div>
          </div>

          <div className='max-h-32 overflow-y-auto pr-1'>
            <div className='flex flex-wrap gap-1.5'>
              {suggestedTags.length > 0 ? (
                suggestedTags.map((game) => {
                  const taken = formData.tags?.includes(game.name.toLowerCase())
                  return (
                    <button
                      key={game.id}
                      type='button'
                      onClick={() => handleAddTag(game.name)}
                      disabled={taken}
                      className={cn(
                        'nb-frame nb-frame-thin flex items-center gap-1 px-2 py-1 text-[10px] font-black uppercase tracking-wide',
                        taken
                          ? 'cursor-not-allowed bg-[#f5f1e8] text-[#111]/40'
                          : 'nb-sd-sm nb-press-sm cursor-pointer bg-white',
                      )}
                    >
                      {!taken && <Plus className='h-3 w-3 shrink-0' strokeWidth={3} aria-hidden />}
                      {game.name}
                    </button>
                  )
                })
              ) : (
                <p className='py-2 text-[10px] font-bold text-[#111]/55'>
                  {t('blogCategory.noMatchingCategories')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
