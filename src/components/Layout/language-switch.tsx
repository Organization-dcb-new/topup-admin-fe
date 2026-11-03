import { useTranslation } from 'react-i18next'

import { LANGUAGES, useLanguageSwitch } from '@/hooks/useLanguageSwitch'
import { cn } from '@/lib/utils'

/** EN/ID segmented switch with a sliding pill; the page crossfades while the language changes. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t } = useTranslation('common')
  const { active, changeLanguage } = useLanguageSwitch()

  return (
    <div
      role='group'
      aria-label={t('sidebar.languageToggleAria')}
      className={cn(
        'vt-lang-switch relative grid grid-cols-2 rounded-md border border-slate-200 bg-white p-0.5 font-display text-xs font-semibold shadow-sm',
        className
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded bg-brand-purple transition-transform duration-300 ease-hud',
          active === 'id' && 'translate-x-full'
        )}
        aria-hidden
      />
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type='button'
          aria-pressed={active === lng}
          onClick={() => changeLanguage(lng)}
          className={cn(
            'relative z-10 w-10 rounded py-1 uppercase tracking-wider transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            active === lng ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}
