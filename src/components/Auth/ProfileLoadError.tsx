import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Layar untuk keadaan "profil tidak bisa dimuat" — jaringan putus, backend
 * 5xx, request timeout.
 *
 * Sengaja BUKAN redirect ke /login. Gangguan jaringan bukan bukti bahwa sesi
 * sudah berakhir, dan memperlakukannya begitu membuat user terlempar keluar
 * dari halaman yang sedang dikerjakan tanpa sebab. Di sini keadaannya
 * dinyatakan apa adanya, lengkap dengan cara mencobanya lagi.
 */
export const ProfileLoadError = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useTranslation()

  return (
    <main className='flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 text-center'>
      <div className='mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20'>
        <AlertTriangle className='h-10 w-10' aria-hidden />
      </div>
      <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
        {t('profileError.title')}
      </h1>
      <p className='mt-3 max-w-sm text-sm text-muted-foreground'>
        {t('profileError.subtitle')}
      </p>
      <div className='mt-8 flex flex-col items-center gap-3 sm:flex-row'>
        <Button type='button' className='gap-2' onClick={onRetry}>
          <RefreshCw className='h-4 w-4' aria-hidden />
          {t('profileError.retry')}
        </Button>
        <Button type='button' variant='ghost' asChild>
          <Link to='/login'>{t('profileError.backToLogin')}</Link>
        </Button>
      </div>
    </main>
  )
}
