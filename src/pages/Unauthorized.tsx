import { useTranslation } from 'react-i18next'

export default function UnauthorizedPage() {
  const { t } = useTranslation('common')
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-4xl font-bold text-red-600'>{t('unauthorizedPage.title')}</h1>
      <p className='mt-4 text-gray-600'>{t('unauthorizedPage.subtitle')}</p>
      <button
        onClick={() => (window.location.href = '/')}
        className='mt-6 px-4 py-2 bg-primary text-white rounded-md cursor-pointer'
      >
        {t('unauthorizedPage.backButton')}
      </button>
    </div>
  )
}
