import { useState, type ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'

import { hudInputClass } from '@/components/Auth/hud-styles'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'> & { invalid?: boolean }

/** Password field with a show/hide toggle. Takes react-hook-form's `register(...)` spread, ref included. */
export function PasswordInput({ invalid, className, ...props }: PasswordInputProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const label = visible ? t('adminPage.form.hidePassword') : t('adminPage.form.showPassword')

  return (
    <div className='relative'>
      <Input
        type={visible ? 'text' : 'password'}
        aria-invalid={invalid}
        className={cn(hudInputClass, 'bg-white pr-11', className)}
        {...props}
      />
      <button
        type='button'
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        className='absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition-colors hover:text-brand-purple focus-visible:text-brand-purple focus-visible:outline-none'
      >
        {visible ? <EyeOff className='size-4' aria-hidden /> : <Eye className='size-4' aria-hidden />}
      </button>
    </div>
  )
}
