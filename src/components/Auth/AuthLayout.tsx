import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
}

const LOCALES = ['id', 'en'] as const

export const AuthLayout = ({
  icon,
  title,
  subtitle,
  children,
}: AuthLayoutProps) => {
  const { t, i18n } = useTranslation()
  const activeLocale = i18n.language === 'id' ? 'id' : 'en'

  return (
    <main className='relative flex min-h-dvh items-center justify-center overflow-hidden bg-muted/40 px-4 py-10'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent)]'
      />

      <div className='relative w-full max-w-md'>
        <header className='mb-6 flex flex-col items-center gap-1 text-center'>
          <span className='text-2xl font-extrabold tracking-tight text-foreground'>
            Pakar
            <span className='bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent'>
              Gaming
            </span>
          </span>
          <span className='text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
            {t('authLayout.tagline')}
          </span>
        </header>

        <Card className='rounded-2xl border-border/80 shadow-sm'>
          <CardHeader className='justify-items-center gap-3 text-center'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
              {icon}
            </div>
            <div className='space-y-1'>
              <CardTitle className='text-xl tracking-tight'>{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className='px-6 sm:px-8'>{children}</CardContent>
        </Card>

        <footer className='mt-6 flex justify-center'>
          <div className='flex items-center gap-1 rounded-full border border-border/80 bg-card p-1 shadow-xs'>
            {LOCALES.map((locale) => (
              <button
                key={locale}
                type='button'
                onClick={() => i18n.changeLanguage(locale)}
                aria-pressed={activeLocale === locale}
                className={cn(
                  'cursor-pointer rounded-full px-3 py-1 text-xs font-semibold uppercase transition-all duration-200',
                  activeLocale === locale
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {locale}
              </button>
            ))}
          </div>
        </footer>
      </div>
    </main>
  )
}
