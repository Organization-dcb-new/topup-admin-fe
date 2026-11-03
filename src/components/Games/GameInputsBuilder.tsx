import type { ReactNode } from 'react'
import { Controller, useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'

import { FieldMessage } from '@/components/Auth/AuthPanel'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { GameCreateFormInput } from '@/schemas/game'
import { toInputKey } from './game-utils'

const TYPES = ['text', 'number', 'tel'] as const

const smallInputClass =
  'h-10 rounded-md border-slate-200 bg-white text-sm shadow-none focus-visible:border-brand-purple focus-visible:ring-brand-purple/15 aria-invalid:border-rose-400'

interface GameInputsBuilderProps {
  control: Control<GameCreateFormInput>
  register: UseFormRegister<GameCreateFormInput>
  errors?: FieldErrors<GameCreateFormInput>['inputs']
}

/** Checkout fields of a new game: what players type before paying (User ID, Zone ID, …). */
export function GameInputsBuilder({ control, register, errors }: GameInputsBuilderProps) {
  const { t } = useTranslation('common')
  const { fields, append, remove, move } = useFieldArray({ control, name: 'inputs' })

  return (
    <div className='space-y-3'>
      {fields.length === 0 && (
        <p className='rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500'>{t('gameForm.inputsEmpty')}</p>
      )}
      <ol className='space-y-3'>
        {fields.map((field, index) => {
          const rowErrors = errors?.[index]
          const keyField = register(`inputs.${index}.key`)
          return (
            <li key={field.id} className='rounded-lg border border-slate-200 bg-white p-3'>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                  {t('gameForm.inputNumber', { number: index + 1 })}
                </span>
                <div className='flex items-center gap-0.5'>
                  <IconButton label={t('gameForm.moveUp')} disabled={index === 0} onClick={() => move(index, index - 1)}>
                    <ArrowUp className='size-3.5' aria-hidden />
                  </IconButton>
                  <IconButton label={t('gameForm.moveDown')} disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                    <ArrowDown className='size-3.5' aria-hidden />
                  </IconButton>
                  <IconButton label={t('gameForm.removeInput')} danger onClick={() => remove(index)}>
                    <Trash2 className='size-3.5' aria-hidden />
                  </IconButton>
                </div>
              </div>
              <div className='grid gap-2 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <Input
                    placeholder={t('gameForm.inputLabelPlaceholder')}
                    aria-label={t('gameForm.inputLabel')}
                    aria-invalid={!!rowErrors?.label}
                    className={smallInputClass}
                    {...register(`inputs.${index}.label`)}
                  />
                  {rowErrors?.label?.message && <FieldMessage tone='error'>{t(rowErrors.label.message)}</FieldMessage>}
                </div>
                <div className='space-y-1'>
                  <Input
                    placeholder='user_id'
                    aria-label={t('gameForm.inputKey')}
                    aria-invalid={!!rowErrors?.key}
                    spellCheck={false}
                    autoCapitalize='none'
                    className={cn(smallInputClass, 'font-mono')}
                    {...keyField}
                    onChange={(e) => {
                      e.target.value = toInputKey(e.target.value)
                      void keyField.onChange(e)
                    }}
                  />
                  {rowErrors?.key?.message && <FieldMessage tone='error'>{t(rowErrors.key.message)}</FieldMessage>}
                </div>
                <Controller
                  control={control}
                  name={`inputs.${index}.input_type`}
                  render={({ field: typeField }) => (
                    <Select value={typeField.value} onValueChange={typeField.onChange}>
                      <SelectTrigger aria-label={t('gameForm.inputType')} className='h-10 w-full rounded-md border-slate-200 bg-white shadow-none'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {t(`gameForm.inputTypes.${type}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <Input
                  placeholder={t('gameForm.inputPlaceholderPlaceholder')}
                  aria-label={t('gameForm.inputPlaceholder')}
                  className={smallInputClass}
                  {...register(`inputs.${index}.placeholder`)}
                />
              </div>
            </li>
          )
        })}
      </ol>
      <button
        type='button'
        onClick={() => append({ key: '', label: '', input_type: 'text', placeholder: '' })}
        className='inline-flex h-9 items-center gap-1.5 px-3 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple ring-1 ring-inset ring-brand-purple/30 hud-clip-sm transition-colors hover:bg-brand-purple/10'
      >
        <Plus className='size-3.5' aria-hidden />
        {t('gameForm.addInput')}
      </button>
      <p className='text-[11px] leading-snug text-slate-500'>{t('gameForm.inputsHint')}</p>
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  children: ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'grid size-7 place-items-center rounded text-slate-400 transition-colors disabled:pointer-events-none disabled:opacity-30',
        danger ? 'hover:bg-rose-50 hover:text-rose-600' : 'hover:bg-slate-100 hover:text-slate-700'
      )}
    >
      {children}
    </button>
  )
}
