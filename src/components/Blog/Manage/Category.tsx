import { Badge } from '@/components/ui/badge'
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
      <div
        ref={dropdownRef}
        className='rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5 transition-colors hover:border-primary/25'
      >
        <p className='mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          <Gamepad2 className='h-3.5 w-3.5 text-primary' aria-hidden />
          {t('blogCategory.gameCategoryTitle')}
        </p>

        <div className='relative'>
          <button
            type='button'
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup='listbox'
            className={cn(
              'flex w-full items-center justify-between rounded-xl border bg-muted/30 p-3 text-left text-sm font-medium transition-all',
              isOpen
                ? 'border-primary/50 ring-2 ring-primary/15'
                : 'border-border/80 hover:border-border',
            )}
          >
            <span className={formData.category ? 'text-foreground' : 'text-muted-foreground'}>
              {formData.category || t('blogCategory.selectPlaceholder')}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
              aria-hidden
            />
          </button>

          {isOpen && (
            <div
              className='absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border/80 bg-popover text-popover-foreground shadow-lg ring-1 ring-gray-900/5 animate-in fade-in zoom-in-95 duration-200'
              role='listbox'
            >
              <div className='flex items-center gap-2 border-b border-border/60 bg-muted/30 p-2'>
                <Search className='ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground' aria-hidden />
                <input
                  type='text'
                  placeholder={t('blogCategory.searchPlaceholder')}
                  autoFocus
                  className='min-w-0 flex-1 bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground'
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
                      className='flex w-full items-center justify-between px-3 py-2.5 text-left text-xs font-medium transition-colors hover:bg-muted/80'
                    >
                      {game.name}
                      {formData.category === game.name && (
                        <Check className='h-3.5 w-3.5 text-primary' aria-hidden />
                      )}
                    </button>
                  ))
                ) : (
                  <div className='p-4 text-center text-xs text-muted-foreground'>
                    {t('blogCategory.noResults')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
        <p className='mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          <Hash className='h-3.5 w-3.5 text-primary' aria-hidden />
          {t('blogCategory.tagsTitle')}
        </p>

        <div className='flex flex-wrap gap-2 rounded-xl border border-border/80 bg-muted/20 p-2.5 focus-within:ring-2 focus-within:ring-primary/15'>
          {formData.tags?.map((tag) => (
            <Badge
              key={tag}
              variant='secondary'
              className='gap-1 pr-1 font-mono text-[10px] font-semibold'
            >
              {tag}
              <button
                type='button'
                onClick={() => handleRemoveTag(tag)}
                className='rounded p-0.5 hover:bg-destructive/20 hover:text-destructive'
                aria-label={t('blogCategory.removeTagAria', { tag })}
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
          <input
            type='text'
            className='min-w-[6rem] flex-1 bg-transparent p-1 text-xs outline-none placeholder:text-muted-foreground'
            placeholder={t('blogCategory.tagsInputPlaceholder')}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label={t('blogCategory.tagsInputAria')}
          />
        </div>

        <div className='mt-4 border-t border-border/60 pt-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('blogCategory.quickAddTitle')}
            </p>
            <div className='relative flex items-center'>
              <Search className='absolute left-2 h-3 w-3 text-muted-foreground' aria-hidden />
              <input
                type='text'
                placeholder={t('blogCategory.quickSearchPlaceholder')}
                className='w-28 rounded-md border border-border/60 bg-muted/30 py-1 pl-7 pr-2 text-[10px] outline-none transition-all focus:w-36 focus:ring-1 focus:ring-primary/25'
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
                        'flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium transition-colors',
                        taken
                          ? 'cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground opacity-60'
                          : 'border-border/80 bg-background shadow-sm hover:border-primary/40 hover:bg-primary/5',
                      )}
                    >
                      {!taken && <Plus className='h-3 w-3 text-primary' aria-hidden />}
                      {game.name}
                    </button>
                  )
                })
              ) : (
                <p className='py-2 text-[10px] text-muted-foreground'>
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
