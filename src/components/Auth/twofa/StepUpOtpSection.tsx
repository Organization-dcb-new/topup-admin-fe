import { useTranslation } from 'react-i18next'
import { ShieldCheck } from 'lucide-react'

import { OtpField } from '@/components/ui/otp-field'
import { cn } from '@/lib/utils'

interface StepUpOtpSectionProps {
  code: string
  onCodeChange: (code: string) => void
  error: string | null
  disabled?: boolean
  className?: string
}

/**
 * Kolom OTP untuk verifikasi per aksi. Sengaja disisipkan ke dalam dialog atau
 * form yang sudah ada, bukan dibungkus modal sendiri: aksi-aksi ini sudah
 * punya permukaan konfirmasi masing-masing, dan modal di atas modal membuat
 * fokus keyboard berpindah dua kali untuk satu keputusan.
 */
export function StepUpOtpSection({
  code,
  onCodeChange,
  error,
  disabled,
  className,
}: StepUpOtpSectionProps) {
  const { t } = useTranslation('common')

  return (
    <div className={cn('space-y-3 rounded-xl border border-border bg-muted/40 p-4', className)}>
      <div className='flex items-start gap-2.5'>
        <span
          className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'
          aria-hidden
        >
          <ShieldCheck className='h-4 w-4' />
        </span>
        <div className='min-w-0 space-y-0.5'>
          <p className='text-sm font-medium text-foreground'>{t('stepUp.title')}</p>
          <p className='text-xs text-muted-foreground'>{t('stepUp.hint')}</p>
        </div>
      </div>

      <OtpField
        value={code}
        onChange={onCodeChange}
        disabled={disabled}
        label={t('stepUp.otpLabel')}
        error={error}
      />
    </div>
  )
}
