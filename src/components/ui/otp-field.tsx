import { useId } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

const OTP_LENGTH = 6

interface OtpFieldProps {
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  /** Nama yang dibacakan pembaca layar untuk input tersembunyi input-otp */
  label: string
  /** Pesan galat; ditampilkan inline dan menandai slot sebagai invalid */
  error?: string | null
  hint?: string
  autoFocus?: boolean
  className?: string
}

/**
 * Satu-satunya tampilan input OTP di aplikasi. Sebelumnya dua tempat
 * memakai ukuran, bobot, dan warna berbeda untuk interaksi yang sama —
 * salah satunya melebar sampai meluap di layar 360px.
 */
export function OtpField({
  value,
  onChange,
  onComplete,
  disabled,
  label,
  error,
  hint,
  autoFocus,
  className,
}: OtpFieldProps) {
  const errorId = useId()
  const hintId = useId()
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={cn('flex w-full flex-col items-center gap-2', className)}>
      {/* Pembungkus scroll sebagai jaring pengaman di layar sangat sempit */}
      <div className='max-w-full overflow-x-auto py-1'>
        <InputOTP
          maxLength={OTP_LENGTH}
          value={value}
          onChange={onChange}
          onComplete={onComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          inputMode='numeric'
          pattern='[0-9]*'
        >
          <InputOTPGroup className='gap-2'>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                aria-invalid={!!error}
                // Gaya bawaan slot dirancang untuk grup yang menyatu
                // (border-y/border-r + sudut hanya di ujung). Karena di sini
                // slotnya terpisah, tiap kotak diberi border & sudut penuh.
                //
                // Keadaan aktif bawaan menumpuk border abu-abu + cincin 3px
                // abu-abu + shadow, sehingga kotaknya tampak menggembung.
                // Diganti satu garis primary yang tegas.
                className={cn(
                  'h-12 w-10 rounded-lg border border-input bg-muted/60 text-lg font-semibold text-foreground shadow-none',
                  'data-[active=true]:border-primary data-[active=true]:bg-background data-[active=true]:ring-2 data-[active=true]:ring-primary/20',
                  error &&
                    'border-destructive/50 data-[active=true]:border-destructive data-[active=true]:ring-destructive/20',
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {hint && !error && (
        <p id={hintId} className='text-center text-xs text-muted-foreground'>
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          role='alert'
          className='text-center text-sm font-medium text-destructive'
        >
          {error}
        </p>
      )}
    </div>
  )
}
