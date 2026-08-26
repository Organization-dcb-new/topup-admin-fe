import { Check, ChevronDown, FolderOpen, Hash, Plus, Search, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { BlogTaxonomyItem } from '../types/blog'

/** Cerminan batas validator backend (`max=10` tag, tiap tag `max=50`). */
const MAX_TAGS = 10
const MAX_TAG_LENGTH = 50
const MAX_TAG_SUGGESTIONS = 24

interface CategoryProps {
  category: string
  tags: string[]
  categoryOptions: BlogTaxonomyItem[]
  tagOptions: BlogTaxonomyItem[]
  onCategoryChange: (value: string) => void
  onTagsChange: (tags: string[]) => void
  categoryError?: string
  tagsError?: string
}

export default function Category({
  category,
  tags,
  categoryOptions,
  tagOptions,
  onCategoryChange,
  onTagsChange,
  categoryError,
  tagsError,
}: CategoryProps) {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const categoryErrorId = useId()
  const tagsErrorId = useId()
  const tagsCounterId = useId()

  const trimmedSearch = categorySearch.trim()

  const filteredCategories = useMemo(() => {
    const query = trimmedSearch.toLowerCase()
    if (!query) return categoryOptions
    return categoryOptions.filter((option) => option.value.toLowerCase().includes(query))
  }, [categoryOptions, trimmedSearch])

  const hasExactMatch = categoryOptions.some(
    (option) => option.value.toLowerCase() === trimmedSearch.toLowerCase(),
  )

  const suggestedTags = useMemo(() => {
    const query = tagSearch.trim().toLowerCase()
    return tagOptions
      .filter((option) => !query || option.value.toLowerCase().includes(query))
      .slice(0, MAX_TAG_SUGGESTIONS)
  }, [tagOptions, tagSearch])

  const isTagLimitReached = tags.length >= MAX_TAGS

  const selectCategory = (value: string) => {
    onCategoryChange(value)
    setIsOpen(false)
    setCategorySearch('')
  }

  const addTag = (raw: string) => {
    const clean = raw.trim().toLowerCase().slice(0, MAX_TAG_LENGTH)
    setTagInput('')
    if (!clean || isTagLimitReached || tags.includes(clean)) return
    onTagsChange([...tags, clean])
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(tagInput)
      return
    }
    if (event.key === 'Backspace' && !tagInput && tags.length > 0) {
      event.preventDefault()
      onTagsChange(tags.slice(0, -1))
    }
  }

  return (
    <div className='space-y-4'>
      <div className='rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
        <p className='mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
          <FolderOpen className='h-3.5 w-3.5 text-primary' aria-hidden />
          {t('blogCategory.categoryTitle')}
        </p>

        {/* Popover + Command menggantikan dropdown buatan sendiri: Escape,
            navigasi panah, dan pengembalian fokus ditangani Radix/cmdk. */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type='button'
              role='combobox'
              aria-label={t('blogCategory.categoryTitle')}
              aria-invalid={!!categoryError}
              aria-describedby={categoryError ? categoryErrorId : undefined}
              className={cn(
                'flex w-full items-center justify-between rounded-xl border bg-muted/30 p-3 text-left text-sm font-medium',
                'transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                isOpen
                  ? 'border-primary/50 ring-2 ring-primary/15'
                  : 'border-border/80 hover:border-border',
                categoryError && 'border-destructive/60',
              )}
            >
              <span className={category ? 'truncate text-foreground' : 'truncate text-muted-foreground'}>
                {category || t('blogCategory.selectPlaceholder')}
              </span>
              <ChevronDown
                className={cn(
                  'ml-2 h-4 w-4 shrink-0 text-muted-foreground',
                  'transition-transform duration-200 ease-out motion-reduce:transition-none',
                  isOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </button>
          </PopoverTrigger>

          <PopoverContent align='start' className='w-(--radix-popover-trigger-width) p-0'>
            <Command shouldFilter={false} label={t('blogCategory.categoryTitle')}>
              <CommandInput
                value={categorySearch}
                onValueChange={setCategorySearch}
                placeholder={t('blogCategory.searchCategoryPlaceholder')}
              />
              <CommandList>
                <CommandEmpty>{t('blogCategory.noResults')}</CommandEmpty>
                <CommandGroup>
                  {filteredCategories.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => selectCategory(option.value)}
                    >
                      <span className='truncate'>{option.value}</span>
                      <span className='ml-auto text-xs tabular-nums text-muted-foreground'>
                        {option.count}
                      </span>
                      {category === option.value && (
                        <Check className='ml-1 h-3.5 w-3.5 text-primary' aria-hidden />
                      )}
                    </CommandItem>
                  ))}

                  {!!trimmedSearch && !hasExactMatch && (
                    <CommandItem
                      value={`create-${trimmedSearch}`}
                      onSelect={() => selectCategory(trimmedSearch)}
                    >
                      <Plus className='h-3.5 w-3.5 text-primary' aria-hidden />
                      <span className='truncate'>
                        {t('blogCategory.useCustomCategory', { value: trimmedSearch })}
                      </span>
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {categoryError && (
          <p id={categoryErrorId} role='alert' className='mt-2 text-xs font-medium text-destructive'>
            {categoryError}
          </p>
        )}
      </div>

      <div className='rounded-xl border border-border/80 bg-card p-4 shadow-sm ring-1 ring-gray-900/5'>
        <div className='mb-3 flex items-center justify-between gap-2'>
          <p className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            <Hash className='h-3.5 w-3.5 text-primary' aria-hidden />
            {t('blogCategory.tagsTitle')}
          </p>
          <span
            id={tagsCounterId}
            role='status'
            aria-live='polite'
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums',
              isTagLimitReached ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground',
            )}
          >
            {tags.length}/{MAX_TAGS}
          </span>
        </div>

        <div
          className={cn(
            'flex flex-wrap gap-2 rounded-xl border bg-muted/20 p-2.5',
            'transition-[border-color,box-shadow] duration-200 ease-out motion-reduce:transition-none',
            'focus-within:ring-2 focus-within:ring-primary/15',
            tagsError ? 'border-destructive/60' : 'border-border/80',
          )}
        >
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant='secondary'
              className='gap-1 pr-1 font-mono text-[10px] font-semibold'
            >
              {tag}
              <button
                type='button'
                onClick={() => removeTag(tag)}
                className='rounded p-0.5 transition-colors duration-200 ease-out hover:bg-destructive/20 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none'
                aria-label={t('blogCategory.removeTagAria', { tag })}
              >
                <X className='h-3 w-3' aria-hidden />
              </button>
            </Badge>
          ))}
          <input
            type='text'
            className='min-w-[6rem] flex-1 bg-transparent p-1 text-xs outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60'
            placeholder={
              isTagLimitReached
                ? t('blogCategory.tagsLimitReached', { max: MAX_TAGS })
                : t('blogCategory.tagsInputPlaceholder')
            }
            value={tagInput}
            disabled={isTagLimitReached}
            maxLength={MAX_TAG_LENGTH}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            aria-label={t('blogCategory.tagsInputAria')}
            aria-describedby={tagsError ? `${tagsCounterId} ${tagsErrorId}` : tagsCounterId}
          />
        </div>

        {tagsError && (
          <p id={tagsErrorId} role='alert' className='mt-2 text-xs font-medium text-destructive'>
            {tagsError}
          </p>
        )}

        <div className='mt-4 border-t border-border/60 pt-4'>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
            <p className='text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
              {t('blogCategory.quickAddTagsTitle')}
            </p>
            <div className='relative flex items-center'>
              <Search className='absolute left-2 h-3 w-3 text-muted-foreground' aria-hidden />
              {/* Lebar sengaja dikunci: menganimasikan `width` memaksa reflow
                  seluruh baris flex tiap frame. Fokus disampaikan lewat ring. */}
              <input
                type='text'
                placeholder={t('blogCategory.quickSearchPlaceholder')}
                className='w-32 rounded-md border border-border/60 bg-muted/30 py-1 pl-7 pr-2 text-[10px] outline-none transition-[box-shadow,background-color] duration-200 ease-out focus:bg-background focus:ring-1 focus:ring-primary/25 motion-reduce:transition-none'
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                aria-label={t('blogCategory.quickSearchAria')}
              />
            </div>
          </div>

          <div className='max-h-32 overflow-y-auto pr-1'>
            <div className='flex flex-wrap gap-1.5'>
              {suggestedTags.length > 0 ? (
                suggestedTags.map((option) => {
                  const taken = tags.includes(option.value.toLowerCase())
                  return (
                    <button
                      key={option.value}
                      type='button'
                      onClick={() => addTag(option.value)}
                      disabled={taken || isTagLimitReached}
                      className={cn(
                        'flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-medium',
                        'transition-colors duration-200 ease-out motion-reduce:transition-none',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                        taken || isTagLimitReached
                          ? 'cursor-not-allowed border-transparent bg-muted/50 text-muted-foreground opacity-60'
                          : 'border-border/80 bg-background shadow-sm hover:border-primary/40 hover:bg-primary/5',
                      )}
                    >
                      {!taken && !isTagLimitReached && (
                        <Plus className='h-3 w-3 text-primary' aria-hidden />
                      )}
                      {option.value}
                    </button>
                  )
                })
              ) : (
                <p className='py-2 text-[10px] text-muted-foreground'>
                  {t('blogCategory.noMatchingTags')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
