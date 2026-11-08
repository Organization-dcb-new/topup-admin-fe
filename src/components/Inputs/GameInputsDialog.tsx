import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, ListChecks, Loader2 } from 'lucide-react'

import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useSaveGameInputs, type GameInputLabelChange } from '@/hooks/useGameInput'
import { cn } from '@/lib/utils'
import type { GameInputValidation } from '@/types/game'
import type { GameInput, GameWithInputs } from '@/types/game-input'
import { InputPreview, InputTypeChip } from './GameInputParts'
import { useRetained } from '@/hooks/useRetained'

interface GameInputsDialogProps {
  game: GameWithInputs | null
  onOpenChange: (open: boolean) => void
}

export function GameInputsDialog({ game, onOpenChange }: GameInputsDialogProps) {
  // Keep showing the last target while the dialog animates closed.
  const shown = useRetained(game)
  const save = useSaveGameInputs(() => onOpenChange(false))

  return (
    <Dialog open={!!game} onOpenChange={(next) => !save.isPending && onOpenChange(next)}>
      <DialogContent
        showCloseButton={false}
        className='flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl'
      >
        <div className='h-1 shrink-0 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        {shown && (
          <GameInputsForm
            key={shown.id}
            game={shown}
            pending={save.isPending}
            onCancel={() => onOpenChange(false)}
            onSave={(changes) => save.mutate(changes)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

type FieldDraft = { label: string; placeholder: string; min: string; max: string; pattern: string }
type Draft = Record<string, FieldDraft>

/** The backend's limits on a rule. */
const MAX_LENGTH = 255
const MAX_PATTERN = 200

function draftOf(input: GameInput): FieldDraft {
  const v = input.validation ?? {}
  return {
    label: input.label ?? '',
    placeholder: input.placeholder ?? '',
    min: v.min_length ? String(v.min_length) : '',
    max: v.max_length ? String(v.max_length) : '',
    pattern: v.pattern ?? '',
  }
}

/** The rules a draft describes; empty fields check nothing. */
function rulesOf(d: Pick<FieldDraft, 'min' | 'max' | 'pattern'>): GameInputValidation {
  const rules: GameInputValidation = {}
  const min = Number(d.min.trim() || 0)
  const max = Number(d.max.trim() || 0)
  if (min > 0) rules.min_length = min
  if (max > 0) rules.max_length = max
  if (d.pattern.trim()) rules.pattern = d.pattern.trim()
  return rules
}

const sameRules = (a: GameInputValidation, b: GameInputValidation) =>
  (a.min_length ?? 0) === (b.min_length ?? 0) && (a.max_length ?? 0) === (b.max_length ?? 0) && (a.pattern ?? '') === (b.pattern ?? '')

/** Why the draft's rules can't be saved, as a translation key, or null. */
function ruleError(d: FieldDraft): string | null {
  for (const raw of [d.min, d.max]) {
    const text = raw.trim()
    if (!text) continue
    const n = Number(text)
    if (!Number.isInteger(n) || n < 0) return 'inputPage.rules.errors.number'
    if (n > MAX_LENGTH) return 'inputPage.rules.errors.tooLong'
  }
  const { min_length = 0, max_length = 0 } = rulesOf(d)
  if (max_length > 0 && min_length > max_length) return 'inputPage.rules.errors.crossed'
  const pattern = d.pattern.trim()
  if (pattern.length > MAX_PATTERN) return 'inputPage.rules.errors.patternTooLong'
  if (pattern) {
    try {
      new RegExp(`^(?:${pattern})$`)
    } catch {
      return 'inputPage.rules.errors.pattern'
    }
  }
  return null
}

interface GameInputsFormProps {
  game: GameWithInputs
  pending: boolean
  onCancel: () => void
  onSave: (changes: GameInputLabelChange[]) => void
}

function GameInputsForm({ game, pending, onCancel, onSave }: GameInputsFormProps) {
  const { t } = useTranslation('common')
  const ids = useId()
  const inputs = [...game.inputs].sort((a, b) => a.sort_order - b.sort_order)
  // Both values start from what is saved: the endpoint writes the placeholder even when only the label changes.
  const [draft, setDraft] = useState<Draft>(() => Object.fromEntries(inputs.map((i) => [i.id, draftOf(i)])))

  const rulesChanged = (i: GameInput) => !sameRules(rulesOf(draft[i.id]), i.validation ?? {})
  const changed = inputs.filter(
    (i) => draft[i.id].label.trim() !== (i.label ?? '') || draft[i.id].placeholder.trim() !== (i.placeholder ?? '') || rulesChanged(i)
  )
  const emptyLabel = inputs.some((i) => !draft[i.id].label.trim())
  const badRules = inputs.some((i) => ruleError(draft[i.id]) !== null)

  const set = (id: string, key: keyof FieldDraft, value: string) => setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))

  const submit = () => {
    if (emptyLabel || badRules || changed.length === 0) return
    onSave(
      changed.map((i) => ({
        id: i.id,
        label: draft[i.id].label.trim(),
        placeholder: draft[i.id].placeholder.trim(),
        ...(rulesChanged(i) && { validation: rulesOf(draft[i.id]) }),
      }))
    )
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
            ) : badRules ? (
              <span className='text-rose-600'>{t('inputPage.rules.fixFirst')}</span>
            ) : (
              t('inputPage.dialog.changed', { count: changed.length })
            )}
          </span>
          <button
            type='submit'
            disabled={pending || emptyLabel || badRules || changed.length === 0}
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
  value: FieldDraft
  dirty: boolean
  onChange: (key: keyof FieldDraft, value: string) => void
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
      {input.input_type !== 'dropdown' && <RulesEditor idPrefix={idPrefix} value={value} onChange={onChange} />}
    </section>
  )
}

/** Min and max length and a pattern the buyer's answer must fit; checked at checkout. */
function RulesEditor({ idPrefix, value, onChange }: Pick<FieldEditorProps, 'idPrefix' | 'value' | 'onChange'>) {
  const { t } = useTranslation('common')
  const error = ruleError(value)
  const lengthField = (key: 'min' | 'max', label: string) => (
    <div className='space-y-1.5'>
      <label htmlFor={`${idPrefix}-${key}`} className='text-xs font-medium text-slate-500'>{label}</label>
      <Input
        id={`${idPrefix}-${key}`}
        type='number'
        inputMode='numeric'
        min={0}
        max={MAX_LENGTH}
        placeholder='—'
        value={value[key]}
        onChange={(e) => onChange(key, e.target.value)}
        aria-invalid={!!error}
        className={cn(hudInputClass, 'h-10 bg-white text-sm tabular-nums')}
      />
    </div>
  )
  return (
    <div className='mt-4 space-y-3 border-t border-slate-100 pt-4'>
      <p className='flex items-center gap-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
        <ListChecks className='size-3.5' aria-hidden />
        {t('inputPage.rules.title')}
      </p>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-[6.5rem_6.5rem_minmax(0,1fr)]'>
        {lengthField('min', t('inputPage.rules.min'))}
        {lengthField('max', t('inputPage.rules.max'))}
        <div className='col-span-2 space-y-1.5 sm:col-span-1'>
          <label htmlFor={`${idPrefix}-pattern`} className='text-xs font-medium text-slate-500'>{t('inputPage.rules.pattern')}</label>
          <Input
            id={`${idPrefix}-pattern`}
            placeholder={t('inputPage.rules.patternPlaceholder')}
            value={value.pattern}
            onChange={(e) => onChange('pattern', e.target.value)}
            aria-invalid={!!error}
            autoComplete='off'
            spellCheck={false}
            className={cn(hudInputClass, 'h-10 bg-white font-mono text-sm')}
          />
        </div>
      </div>
      <p className={cn('text-[11px] leading-snug', error ? 'text-rose-600' : 'text-slate-500')}>{error ? t(error) : t('inputPage.rules.hint')}</p>
    </div>
  )
}

