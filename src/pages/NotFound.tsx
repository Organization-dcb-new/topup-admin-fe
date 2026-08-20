import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { FileQuestion, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  const { t } = useTranslation('common')
  return (
    <DashboardLayout>
      <div className='mx-auto flex min-h-[min(70vh,32rem)] max-w-lg flex-col items-center justify-center px-4'>
        <div className='nb-frame nb-frame-thick nb-sd-lg w-full bg-white p-6 text-center sm:p-8'>
          <span className='nb-frame nb-frame-thin nb-sd mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#ff9ed2]'>
            <FileQuestion className='h-10 w-10' strokeWidth={2.5} aria-hidden />
          </span>

          <p className='inline-block bg-[#ffd84d] px-2 py-0.5 text-sm font-black tracking-[0.3em]'>
            404
          </p>

          <h1 className='mt-3 text-2xl font-black uppercase leading-tight tracking-tight'>
            {t('notFoundPage.title')}
          </h1>

          <p className='mx-auto mt-3 max-w-sm text-xs font-bold leading-relaxed text-[#111]/70'>
            {t('notFoundPage.subtitle')}
          </p>

          <Link
            to='/'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm mt-8 inline-flex h-11 items-center gap-2 bg-[#c9f24d] px-5 text-xs font-black uppercase tracking-[0.14em]'
          >
            <Home className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {t('notFoundPage.backButton')}
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
