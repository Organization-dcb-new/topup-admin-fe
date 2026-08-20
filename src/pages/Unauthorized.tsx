import { useTranslation } from 'react-i18next'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export default function UnauthorizedPage() {
  const { t } = useTranslation('common')

  return (
    <div className='nb nb-surface relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12'>
      {/* Bentuk dekoratif */}
      <div className='pointer-events-none absolute inset-0 hidden md:block' aria-hidden>
        <div className='nb-frame nb-sd absolute left-[12%] top-[20%] h-20 w-20 rotate-12 bg-[#ff9d3d]' />
        <div className='nb-frame nb-round nb-sd absolute bottom-[22%] right-[14%] h-16 w-16 bg-[#ff9ed2]' />
      </div>

      <div className='relative z-10 w-full max-w-md'>
        <span className='nb-frame nb-sd-sm absolute -top-2 left-5 z-20 -rotate-2 bg-[#ff4d3d] px-3 py-1 text-xs font-black uppercase tracking-[0.25em] text-white'>
          403
        </span>

        <div className='nb-frame nb-frame-thick nb-sd-lg mt-3 bg-white'>
          {/* Strip warna */}
          <div className='flex h-3 w-full border-b-4 border-[#111]' aria-hidden>
            <div className='flex-1 bg-[#ff4d3d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ff9d3d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ffd84d]' />
          </div>

          <div className='flex flex-col items-center px-5 py-9 text-center sm:px-8'>
            <div className='nb-frame nb-sd flex h-20 w-20 -rotate-3 items-center justify-center bg-[#ff4d3d]'>
              <ShieldOff className='h-10 w-10 text-white' strokeWidth={2.5} aria-hidden />
            </div>

            <h1 className='mt-7 text-2xl font-black uppercase leading-[1.05] tracking-tight sm:text-3xl'>
              {t('unauthorizedPage.title')}
            </h1>
            <p className='mt-3 inline-block bg-[#ffd84d] px-1.5 py-0.5 text-sm font-bold'>
              {t('unauthorizedPage.subtitle')}
            </p>

            <button
              type='button'
              onClick={() => (window.location.href = '/')}
              className='nb-frame nb-sd nb-press mt-8 flex h-14 w-full items-center justify-center gap-2 bg-[#c9f24d] text-base font-black uppercase tracking-[0.12em]'
            >
              <ArrowLeft className='h-5 w-5 shrink-0' strokeWidth={3} aria-hidden />
              {t('unauthorizedPage.backButton')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
