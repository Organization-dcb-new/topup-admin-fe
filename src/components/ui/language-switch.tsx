import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const LOCALES = ['id', 'en'] as const

interface LanguageSwitchProps {
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Pemilih bahasa gaya segmented dengan indikator geser.
 * Dipakai bersama oleh halaman auth dan navbar dashboard.
 */
export function LanguageSwitch({
  size = 'sm',
  className,
}: LanguageSwitchProps) {
  const { t, i18n } = useTranslation('common')
  const activeLocale = i18n.language?.startsWith('id') ? 'id' : 'en'

  return (
    <div
      role='group'
      aria-label={t('sidebar.languageToggleAria')}
      className={cn(
        'relative flex items-center rounded-full border border-border bg-muted/60 p-0.5',
        size === 'sm' ? 'h-8 w-20' : 'h-9 w-24',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-background shadow-xs transition-transform duration-300 ease-out motion-reduce:transition-none',
          activeLocale === 'id' ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden
      />
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type='button'
          onClick={() => i18n.changeLanguage(locale)}
          aria-pressed={activeLocale === locale}
          className={cn(
            'relative z-10 flex-1 cursor-pointer rounded-full text-center font-bold uppercase select-none transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            size === 'sm' ? 'text-[11px]' : 'text-xs',
            activeLocale === locale
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  )
}
