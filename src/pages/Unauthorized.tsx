import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ShieldOff, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function UnauthorizedPage() {
  const { t } = useTranslation('common')
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 text-center'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20'>
        <ShieldOff className='h-10 w-10' aria-hidden />
      </div>
      <p className='text-sm font-medium uppercase tracking-widest text-muted-foreground'>
        403
      </p>
      <h1 className='mt-2 text-2xl font-semibold tracking-tight text-foreground'>
        {t('unauthorizedPage.title')}
      </h1>
      <p className='mt-3 max-w-sm text-sm text-muted-foreground'>
        {t('unauthorizedPage.subtitle')}
      </p>
      <Button asChild className='mt-8 gap-2'>
        <Link to='/'>
          <Home className='h-4 w-4' aria-hidden />
          {t('unauthorizedPage.backButton')}
        </Link>
      </Button>
    </main>
  )
}
