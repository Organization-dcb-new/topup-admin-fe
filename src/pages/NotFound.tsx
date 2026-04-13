import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  const { t } = useTranslation('common')
  return (
    <DashboardLayout>
      <div className="mx-auto flex min-h-[min(70vh,32rem)] max-w-lg flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-1 ring-border/80">
          <FileQuestion className="h-10 w-10" aria-hidden />
        </div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{t('notFoundPage.title')}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {t('notFoundPage.subtitle')}
        </p>
        <Button asChild className="mt-8 gap-2">
          <Link to="/">
            <Home className="h-4 w-4" aria-hidden />
            {t('notFoundPage.backButton')}
          </Link>
        </Button>
      </div>
    </DashboardLayout>
  )
}
