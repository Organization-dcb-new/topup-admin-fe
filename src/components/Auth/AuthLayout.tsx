import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LanguageSwitch } from '@/components/ui/language-switch'

interface AuthLayoutProps {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
}

export const AuthLayout = ({
  icon,
  title,
  subtitle,
  children,
}: AuthLayoutProps) => {
  const { t } = useTranslation()

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
          <LanguageSwitch size='md' />
        </footer>
      </div>
    </main>
  )
}
