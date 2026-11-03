import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, Boxes, Crosshair, ShieldCheck } from 'lucide-react'

import brandMark from '@/assets/brand/pakargaming-mark.webp'
import brandWordmark from '@/assets/brand/pakargaming-wordmark.webp'
import { useHealthCheck } from '@/hooks/useHealth'
import { useHeroArt, type HeroArt } from '@/hooks/useHeroArt'
import { cn } from '@/lib/utils'

const YEAR = new Date().getFullYear()

/**
 * Shared shell for /login and /verify-otp. It is a layout route, so the hero and panel
 * frame stay mounted between the two pages and only the panel content swaps.
 */
export function AuthLayout() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <div
      data-auth-shell
      className='relative min-h-dvh bg-[#f6f4f9] text-slate-700 antialiased'
    >
      <div className='grid min-h-dvh lg:grid-cols-2'>
        <HeroPanel />

        <div className='flex min-h-dvh flex-col px-4 py-5 sm:px-8 sm:py-6'>
          <header className='flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700 ease-hud'>
            <img
              src={brandWordmark}
              alt='PakarGaming'
              className='h-8 w-auto lg:hidden'
            />
            <LanguageSwitch />
          </header>

          <main className='flex flex-1 items-center justify-center py-8'>
            <PanelFrame>
              <AnimatedHeight>
                <div
                  key={location.pathname}
                  className='animate-in fade-in slide-in-from-bottom-3 blur-in-[6px] duration-500 ease-hud'
                >
                  <Outlet />
                </div>
              </AnimatedHeight>
            </PanelFrame>
          </main>

          <footer className='flex flex-col items-center gap-3 text-xs text-slate-500 animate-in fade-in duration-700 delay-300 fill-mode-both sm:flex-row sm:justify-between'>
            <span>
              © {YEAR} PakarGaming · {t('authLayout.restricted')}
            </span>
            <ServerStatus />
          </footer>
        </div>
      </div>
    </div>
  )
}

/** White notched card with a hairline border, a brand-colour top bar and HUD corner brackets. */
function PanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className='relative w-full max-w-[26rem] animate-in fade-in zoom-in-[0.97] slide-in-from-bottom-4 duration-700 ease-hud'>
      <span className='absolute -left-2 -top-2 size-6 border-l-[3px] border-t-[3px] border-brand-purple' aria-hidden />
      <span className='absolute -bottom-2 -right-2 size-6 border-b-[3px] border-r-[3px] border-brand-cyan' aria-hidden />

      {/* drop-shadow instead of box-shadow: clip-path would cut a box-shadow off. */}
      <div className='drop-shadow-[0_24px_40px_rgba(74,20,140,0.13)]'>
        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='bg-white hud-clip'>
            <div className='relative h-1 overflow-hidden bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden>
              <span className='absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-transparent via-white/80 to-transparent animate-hud-trace' />
            </div>
            <div className='px-5 py-7 sm:px-8 sm:py-9'>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Eases height changes (loader → form → OTP, errors appearing) instead of letting the panel jump.
 * The 4px bleed keeps input focus rings from being clipped by `overflow-hidden`.
 */
function AnimatedHeight({ children }: { children: ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>()

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className='-m-1 overflow-hidden transition-[height] duration-500 ease-hud'
      style={{ height }}
    >
      <div ref={innerRef} className='p-1'>
        {children}
      </div>
    </div>
  )
}

const LANGUAGES = ['en', 'id'] as const

function LanguageSwitch() {
  const { t, i18n } = useTranslation()
  const switchRef = useRef<HTMLDivElement>(null)
  const active = i18n.resolvedLanguage === 'id' ? 'id' : 'en'

  // Crossfade the whole page so every translated string and reflow changes together,
  // instead of all text swapping in a single frame.
  const changeLanguage = (lng: (typeof LANGUAGES)[number]) => {
    if (lng === active) return
    const apply = () => flushSync(() => void i18n.changeLanguage(lng))
    const shell = switchRef.current?.closest<HTMLElement>('[data-auth-shell]')
    if (!('startViewTransition' in document) || !shell) return apply()

    // Enables the per-block `vt-*` transition names (style.css) for this switch only,
    // so the dashboard handoff keeps its plain crossfade.
    shell.dataset.switchingLanguage = ''
    document.startViewTransition(apply).finished.finally(() => {
      delete shell.dataset.switchingLanguage
    })
  }

  return (
    <div
      ref={switchRef}
      role='group'
      aria-label={t('sidebar.languageToggleAria')}
      className='vt-lang-switch relative ml-auto grid grid-cols-2 rounded-md border border-slate-200 bg-white p-0.5 font-display text-xs font-semibold shadow-sm'
    >
      {/* Sliding pill behind the active option. */}
      <span
        className={cn(
          'absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded bg-brand-purple transition-transform duration-300 ease-hud',
          active === 'id' && 'translate-x-full'
        )}
        aria-hidden
      />
      {LANGUAGES.map((lng) => (
        <button
          key={lng}
          type='button'
          aria-pressed={active === lng}
          onClick={() => changeLanguage(lng)}
          className={cn(
            'relative z-10 w-10 rounded py-1 uppercase tracking-wider transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40',
            active === lng ? 'text-white' : 'text-slate-500 hover:text-slate-900'
          )}
        >
          {lng}
        </button>
      ))}
    </div>
  )
}

function ServerStatus() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useHealthCheck()

  const downServices = Object.values(data?.services ?? {}).filter((s) => s !== 'up')
  const status = isLoading
    ? 'checking'
    : isError || !data
      ? 'unreachable'
      : data.status === 'healthy' && downServices.length === 0
        ? 'operational'
        : 'degraded'

  const dot = {
    checking: 'bg-slate-400',
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-500',
    unreachable: 'bg-rose-500',
  }[status]

  return (
    <span className='flex items-center gap-2 font-display uppercase tracking-[0.15em]'>
      <span className='relative flex size-2' aria-hidden>
        {status !== 'unreachable' && (
          <span className={cn('absolute inset-0 animate-ping rounded-full opacity-60', dot)} />
        )}
        <span className={cn('relative size-2 rounded-full transition-colors duration-500', dot)} />
      </span>
      <span key={status} className='animate-in fade-in duration-500'>
        {t(`authLayout.status.${status}`)}
      </span>
    </span>
  )
}

/** Card poses from the top of the deck down; cards past the last pose wait hidden behind it. */
const CARD_POSES = [
  'z-30 translate-x-0 translate-y-0 -rotate-6 scale-100 opacity-100',
  'z-20 translate-x-16 -translate-y-3 rotate-3 scale-[0.9] opacity-100',
  'z-10 translate-x-32 -translate-y-6 rotate-12 scale-[0.8] opacity-100',
]
const CARD_HIDDEN = 'z-0 translate-x-32 -translate-y-6 rotate-12 scale-[0.8] opacity-0'
const SHUFFLE_MS = 3200

type DeckCard = { kind: 'brand' } | ({ kind: 'art' } & HeroArt)

/** A hand of collectible-style cards; every few seconds the top card is sent to the back. */
function GameDeck({ art }: { art: HeroArt[] }) {
  const cards: DeckCard[] = [
    { kind: 'brand' },
    ...art.map((item) => ({ kind: 'art' as const, ...item })),
  ]
  const [top, setTop] = useState(0)

  useEffect(() => {
    if (cards.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setTop((i) => i + 1), SHUFFLE_MS)
    return () => clearInterval(id)
  }, [cards.length])

  return (
    <div className='relative h-[19rem] w-[21rem]' aria-hidden>
      {/* Cyan sash behind the deck, like a stripe across an esports jersey. */}
      <div className='absolute -left-[60%] top-1/2 h-12 w-[260%] -translate-y-1/2 -rotate-12 bg-brand-cyan' />
      <div className='absolute -left-[60%] top-[calc(50%+2.6rem)] h-6 w-[260%] -rotate-12 text-white/25 hud-stripes' />

      {/* Ghost cards keep the deck shape while only the brand card is available. */}
      {cards.length < 3 &&
        CARD_POSES.slice(cards.length).map((pose) => (
          <div
            key={pose}
            className={cn('absolute left-0 top-4 h-64 w-48 rounded-xl border-4 border-white/35 bg-white/10', pose)}
          />
        ))}

      {cards.map((card, i) => {
        const depth = (((i - top) % cards.length) + cards.length) % cards.length
        return (
          <figure
            key={card.kind === 'art' ? card.src : 'brand'}
            className={cn(
              // Entrance uses `transform` while poses use translate/rotate/scale, so both apply at once.
              'absolute left-0 top-4 h-64 w-48 overflow-hidden rounded-xl border-4 border-white bg-white shadow-[0_18px_40px_-12px_rgba(40,8,60,0.55)] transition-[translate,rotate,scale,opacity] duration-700 ease-hud animate-in fade-in zoom-in-90',
              CARD_POSES[depth] ?? CARD_HIDDEN
            )}
          >
            {card.kind === 'brand' ? (
              <div className='grid size-full place-items-center bg-linear-to-br from-white to-slate-100'>
                <img src={brandMark} alt='' className='h-32 w-auto' draggable={false} />
              </div>
            ) : (
              <>
                {/* Slow push-in while the card is on top. */}
                <img
                  src={card.src}
                  alt=''
                  draggable={false}
                  className={cn(
                    'size-full object-cover transition-transform duration-[3200ms] ease-out',
                    depth === 0 ? 'scale-100' : 'scale-110'
                  )}
                />
                <figcaption className='absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-3 pb-2.5 pt-10 font-display text-xs font-bold uppercase tracking-wider text-white'>
                  {card.name}
                </figcaption>
              </>
            )}
          </figure>
        )
      })}
    </div>
  )
}

const HERO_FEATURES = [
  { icon: Activity, key: 'authLayout.featureTransactions' },
  { icon: Boxes, key: 'authLayout.featureCatalog' },
  { icon: ShieldCheck, key: 'authLayout.featureSecurity' },
]

function HeroPanel() {
  const { t } = useTranslation()
  const art = useHeroArt()

  return (
    <aside className='relative hidden overflow-hidden bg-brand-purple text-white hud-slant lg:flex lg:flex-col lg:py-12 lg:pl-12 lg:pr-28 xl:pl-16'>
      <div className='pointer-events-none absolute inset-0' aria-hidden>
        <div className='absolute -bottom-1/3 -left-1/4 h-2/3 w-[160%] -rotate-12 bg-brand-purple-deep' />
        <div className='absolute -right-8 -top-8 size-80 text-white/20 hud-halftone [mask-image:radial-gradient(circle_at_top_right,black,transparent_70%)]' />
        <img
          src={brandMark}
          alt=''
          className='absolute -bottom-20 -right-6 h-[28rem] w-auto opacity-[0.08] [filter:brightness(0)_invert(1)]'
        />
      </div>

      <div className='relative animate-in fade-in slide-in-from-top-2 duration-700 ease-hud'>
        <span className='inline-flex bg-white px-4 py-2.5 shadow-lg shadow-black/10 hud-clip-sm'>
          <img src={brandWordmark} alt='PakarGaming' className='h-8 w-auto' />
        </span>
      </div>

      {/* Anchored to the top, not centred, so the deck stays put when the copy below reflows. */}
      <div className='relative mt-12 space-y-9 xl:mt-16'>
        <div className='animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 ease-hud fill-mode-both'>
          <GameDeck art={art} />
        </div>

        <div className='vt-hero-copy space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 ease-hud fill-mode-both'>
          <p className='inline-flex items-center gap-2 bg-brand-cyan px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-[0.25em] text-slate-950 hud-clip-sm'>
            <Crosshair className='size-3.5' aria-hidden />
            {t('authLayout.heroEyebrow')}
          </p>
          <h2 className='max-w-lg font-display text-4xl font-bold leading-[1.1] tracking-tight xl:text-5xl'>
            {t('authLayout.heroTitle')}{' '}
            {/* Marker-style highlight: keeps the text white for contrast on purple. */}
            <span className='relative inline-block'>
              <span className='absolute inset-x-[-0.15em] bottom-[0.08em] h-[0.4em] -skew-x-12 bg-brand-cyan' aria-hidden />
              <span className='relative'>{t('authLayout.heroHighlight')}</span>
            </span>
          </h2>
          <p className='max-w-md text-base leading-relaxed text-white/85'>
            {t('authLayout.heroBody')}
          </p>
        </div>

        <ul className='vt-hero-chips flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-hud fill-mode-both'>
          {HERO_FEATURES.map(({ icon: Icon, key }) => (
            <li
              key={key}
              className='flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hud-clip-sm'
            >
              <Icon className='size-3.5' aria-hidden />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <p className='relative mt-auto pt-10 font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 animate-in fade-in duration-1000 delay-500 fill-mode-both'>
        {'// '}
        {t('authLayout.restricted')}
      </p>
    </aside>
  )
}
