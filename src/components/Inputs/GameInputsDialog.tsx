import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Loader2 } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSaveGameInputs } from '@/hooks/useGameInput'
import { cn } from '@/lib/utils'
import type { GameInput, GameWithInputs } from '@/types/game-input'
import { InputPreview, InputTypeChip } from './GameInputParts'

interface GameInputsDialogProps {
  game: GameWithInputs | null
  onOpenChange: (open: boolean) => void
}

export function GameInputsDialog({ game, onOpenChange }: GameInputsDialogProps) {
  const save = useSaveGameInputs(() => onOpenChange(false))

  return (
    <Dialog open={!!game} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {game && (
          <GameInputsForm
            key={game.id}
            game={game}
            pending={save.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(changes) => save.mutate(changes)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type Draft = Record<string, { label: string; placeholder: string }>

interface GameInputsFormProps {
  game: GameWithInputs
  pending: boolean
  onCancel: () => void
  onSave: (changes: { id: string; label: string; placeholder: string }[]) => void
}

function GameInputsForm({ game, pending, onCancel, onSave }: GameInputsFormProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const inputs = [...game.inputs].sort((a, b) => a.sort_order - b.sort_order)
  // Both values start from what is saved: the endpoint writes the placeholder even when only the label changes.
  const [draft, setDraft] = useState<Draft>(() =>
    Object.fromEntries(inputs.map((i) => [i.id, { label: i.label ?? '', placeholder: i.placeholder ?? '' }]))
  )

  const changed = inputs.filter((i) => draft[i.id].label.trim() !== (i.label ?? '') || draft[i.id].placeholder.trim() !== (i.placeholder ?? ''))
  const emptyLabel = inputs.some((i) => !draft[i.id].label.trim())

  const set = (id: string, key: 'label' | 'placeholder', value: string) =>
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))

  const submit = () => {
    if (emptyLabel || changed.length === 0) return
    onSave(changed.map((i) => ({ id: i.id, label: draft[i.id].label.trim(), placeholder: draft[i.id].placeholder.trim() })))
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className='flex min-h-0 flex-1 flex-col'
    >
      <div className='flex shrink-0 items-start gap-4 p-6 pb-4 sm:p-7 sm:pb-5'>
        {game.image ? (
          <img src={game.image} alt='' className='size-12 shrink-0 rounded-md object-cover ring-1 ring-slate-200' />
        ) : (
          <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
            <Keyboard className='size-5' aria-hidden />
          </span>
        )}
        <div className='min-w-0 space-y-1'>
          <p className={hudEyebrowClass}>{t('inputPage.dialog.eyebrow')}</p>
          <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>{game.game_name}</DialogTitle>
          <DialogDescription className='text-sm leading-relaxed text-slate-500'>{t('inputPage.dialog.description')}</DialogDescription>
        </div>
      </div>

      <div className='min-h-0 flex-1 space-y-3 overflow-y-auto border-y border-slate-100 bg-slate-50/60 p-4 sm:p-6'>
        {inputs.length === 0 ? (
          <p className='py-8 text-center text-sm text-slate-500'>{t('inputPage.noFields')}</p>
        ) : (
          inputs.map((input, index) => (
            <FieldEditor
              key={input.id}
              idPrefix={`${ids}-${index}`}
              input={input}
              value={draft[input.id]}
              dirty={changed.includes(input)}
              onChange={(key, value) => set(input.id, key, value)}
            />
          ))
        )}
      </div>

      <div className='flex shrink-0 flex-col-reverse gap-3 p-6 pt-4 sm:flex-row sm:items-center sm:justify-between sm:p-7 sm:pt-5'>
        <button
          type='button'
          onClick={onCancel}
          disabled={pending}
          className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {t('inputPage.dialog.cancel')}
        </button>
        <div className='flex flex-col items-stretch gap-2 sm:flex-row sm:items-center'>
          <span className='text-center text-xs text-slate-500'>
            {emptyLabel ? (
              <span className='text-rose-600'>{t('inputPage.dialog.labelRequired')}</span>
            ) : (
              t('inputPage.dialog.changed', { count: changed.length })
            )}
          </span>
          <button
            type='submit'
            disabled={pending || emptyLabel || changed.length === 0}
            className={cn(hudPrimaryButtonClass, 'justify-center disabled:pointer-events-none sm:min-w-52')}
          >
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {pending && <Loader2 className='size-4 animate-spin' aria-hidden />}
            {pending ? t('inputPage.dialog.saving') : t('inputPage.dialog.save')}
          </button>
        </div>
      </div>
    </form>
  )
}

interface FieldEditorProps {
  idPrefix: string
  input: GameInput
  value: { label: string; placeholder: string }
  dirty: boolean
  onChange: (key: 'label' | 'placeholder', value: string) => void
}

function FieldEditor({ idPrefix, input, value, dirty, onChange }: FieldEditorProps) {
  const { t } = useTranslation('common')
  return (
    <section
      className={cn(
        'rounded-lg border bg-white p-4 transition-colors',
        dirty ? 'border-brand-purple/40 ring-1 ring-brand-purple/10' : 'border-slate-200'
      )}
    >
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <span className='font-mono text-xs font-semibold text-slate-700'>{input.key}</span>
        <InputTypeChip input={input} />
        <span className='font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>
          {input.required ? t('inputPage.required') : t('inputPage.optional')}
        </span>
        {dirty && (
          <span className='ml-auto font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-purple'>
            {t('inputPage.dialog.edited')}
          </span>
        )}
      </div>
      <div className='grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]'>
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label htmlFor={`${idPrefix}-label`} className='text-xs font-medium text-slate-500'>{t('inputPage.dialog.labelLabel')}</label>
            <Input
              id={`${idPrefix}-label`}
              value={value.label}
              onChange={(e) => onChange('label', e.target.value)}
              aria-invalid={!value.label.trim()}
              className={cn(hudInputClass, 'h-10 bg-white text-sm')}
            />
          </div>
          <div className='space-y-1.5'>
            <label htmlFor={`${idPrefix}-placeholder`} className='text-xs font-medium text-slate-500'>{t('inputPage.dialog.placeholderLabel')}</label>
            <Input
              id={`${idPrefix}-placeholder`}
              value={value.placeholder}
              onChange={(e) => onChange('placeholder', e.target.value)}
              className={cn(hudInputClass, 'h-10 bg-white text-sm')}
            />
          </div>
        </div>
        <div className='rounded-md border border-dashed border-slate-200 p-3'>
          <p className='mb-2 font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{t('inputPage.dialog.preview')}</p>
          <InputPreview input={input} label={value.label} placeholder={value.placeholder} />
        </div>
      </div>
    </section>
  )
}
