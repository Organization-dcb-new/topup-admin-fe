import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, MapPinOff } from 'lucide-react'

import brandWordmark from '@/assets/brand/pakargaming-wordmark.webp'
import { HudCard } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { firstAccessiblePath, visibleMenus } from '@/components/Layout/sidebar-nav'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function NotFoundPage() {
  const { t } = useTranslation('common')
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuthUser()
  const { can } = usePermissions()

  // Wait for the session check, or a signed-in admin briefly sees the guest version.
  if (isLoading) return null

  // Guests get no app chrome, so the page brings its own backdrop and points to sign-in.
  const home = isAuthenticated ? (firstAccessiblePath(visibleMenus(can)) ?? '/') : '/login'
  // The data router numbers history entries; 0 means this tab opened straight onto the 404.
  const canGoBack = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0

  return (
    <div
      className={cn(
        'grid place-items-center px-4',
        isAuthenticated ? 'min-h-[calc(100dvh-12rem)] py-6' : 'min-h-dvh bg-slate-50 py-10'
      )}
    >
      <div className='w-full max-w-lg'>
        {!isAuthenticated && (
          <img src={brandWordmark} alt='PakarGaming' className='mx-auto mb-8 h-7 w-auto animate-in fade-in duration-500' />
        )}

        <div className='relative mb-2 select-none text-center' aria-hidden>
          {/* Halftone glow behind the numeral, faded out at the edges. */}
          <div className='absolute inset-x-8 inset-y-2 text-brand-purple/20 hud-halftone [mask-image:radial-gradient(closest-side,black,transparent)]' />
          <p className='relative font-display text-[7.5rem] font-bold leading-none tracking-tight sm:text-[10rem]'>
            <span className='bg-linear-to-br from-brand-purple via-brand-purple-deep to-brand-cyan bg-clip-text text-transparent animate-in fade-in zoom-in-95 duration-700 ease-hud motion-safe:animate-hud-float inline-block'>
              404
            </span>
          </p>
        </div>

        <HudCard className='animate-in fade-in slide-in-from-bottom-4 duration-700 ease-hud fill-mode-both [animation-delay:120ms]'>
          <div className='space-y-5'>
            <div className='flex items-start gap-4'>
              <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
                <MapPinOff className='size-5' aria-hidden />
              </span>
              <div className='min-w-0 space-y-1'>
                <p className={hudEyebrowClass}>{t('notFoundPage.eyebrow')}</p>
                <h1 className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
                  {t('notFoundPage.title')}
                </h1>
                <p className='text-sm leading-relaxed text-slate-500'>{t('notFoundPage.subtitle')}</p>
              </div>
            </div>

            <div className='flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-xs'>
              <span className='shrink-0 font-display font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('notFoundPage.requested')}
              </span>
              <code className='min-w-0 truncate font-mono text-slate-700' title={pathname}>
                {pathname}
              </code>
            </div>

            <div className='flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between'>
              {canGoBack ? (
                <button
                  type='button'
                  onClick={() => navigate(-1)}
                  className='group inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
                >
                  <ArrowLeft className='size-4 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
                  {t('notFoundPage.goBack')}
                </button>
              ) : (
                <span className='hidden sm:block' />
              )}
              <Link to={home} replace className={cn(hudPrimaryButtonClass, 'group')}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                {!isAuthenticated
                  ? t('notFoundPage.loginButton')
                  : home === '/'
                    ? t('notFoundPage.backButton')
                    : t('notFoundPage.homeButton')}
                <ArrowRight className='size-4 transition-transform duration-300 ease-hud group-hover:translate-x-0.5' aria-hidden />
              </Link>
            </div>
          </div>
        </HudCard>
      </div>
    </div>
  )
}
