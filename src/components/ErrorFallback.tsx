import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const ErrorFallback = () => {
  const { t } = useTranslation()
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 text-center'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20'>
        <AlertTriangle className='h-10 w-10' aria-hidden />
      </div>
      <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
        {t('errorBoundary.title')}
      </h1>
      <p className='mt-3 max-w-sm text-sm text-muted-foreground'>
        {t('errorBoundary.subtitle')}
      </p>
      <Button
        type='button'
        className='mt-8 gap-2'
        onClick={() => window.location.reload()}
      >
        <RefreshCw className='h-4 w-4' aria-hidden />
        {t('errorBoundary.reload')}
      </Button>
    </main>
  )
}
