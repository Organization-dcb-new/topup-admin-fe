import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'radix-ui'
import { ChevronDown, X } from 'lucide-react'

import brandMark from '@/assets/brand/pakargaming-mark.webp'
import brandWordmark from '@/assets/brand/pakargaming-wordmark.webp'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SidebarMenu } from '@/constants/sidebar-menu'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import type { SidebarProps } from '@/types/sidebar'
import { RailTooltip, RowLabel } from './sidebar-parts'
import { findActivePath, menusForRole, useSidebarCopy, type Translate } from './sidebar-nav'
import {
  sidebarIconClass,
  sidebarRowActiveClass,
  sidebarRowClass,
  sidebarRowIdleClass,
} from './sidebar-styles'

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { pathname } = useLocation()
  const { role } = useAuthUser()
  const { t } = useTranslation('common')
  const tr = useSidebarCopy()
  const isMdUp = useMediaQuery('(min-width: 768px)')
  const rail = collapsed && isMdUp
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const navRef = useRef<HTMLElement>(null)

  const sections = useMemo(() => menusForRole(role), [role])
  const activePath = findActivePath(sections, pathname)

  // Bring the current page into view, e.g. when landing straight on an item far down the list.
  useEffect(() => {
    navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
  }, [activePath])

  return (
    <Tooltip.Provider delayDuration={120} skipDelayDuration={300}>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity duration-300 ease-hud md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        inert={!isMdUp && !mobileOpen}
        className={cn(
          'z-50 flex flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-700',
          'transition-[width,translate] duration-300 ease-hud',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(16rem,calc(100vw-3rem))] max-md:shadow-2xl',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:sticky md:top-0 md:h-screen md:shrink-0',
          rail ? 'md:w-20' : 'md:w-64'
        )}
      >
        {/* Same height as the navbar so the two read as one frame. */}
        <div className='flex h-16 shrink-0 items-center border-b border-slate-200 px-3'>
          <Link
            to='/'
            onClick={onCloseMobile}
            aria-label='PakarGaming'
            className='relative block h-10 w-40 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/30'
          >
            <img
              src={brandWordmark}
              alt=''
              className={cn(
                'absolute left-3 top-1/2 h-9 w-auto -translate-y-1/2 transition-opacity duration-300 ease-hud',
                rail && 'opacity-0'
              )}
            />
            {/* Centred in the 80px rail: 40px centre minus the link's 12px offset and half the mark. */}
            <img
              src={brandMark}
              alt=''
              className={cn(
                'absolute left-[17px] top-1/2 h-8 w-auto -translate-y-1/2 transition-opacity duration-300 ease-hud',
                !rail && 'opacity-0'
              )}
            />
          </Link>

          <button
            type='button'
            onClick={onCloseMobile}
            aria-label={t('sidebar.closeMenu')}
            className='ml-auto grid size-9 place-items-center bg-slate-100 text-slate-500 outline-none hud-clip-sm transition-colors hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 md:hidden'
          >
            <X className='size-5' aria-hidden />
          </button>
        </div>

        <nav
          ref={navRef}
          aria-label={t('sidebar.navLabel')}
          className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 pb-4 pt-4 scrollbar-sidebar'
        >
          {sections.map((section, index) => (
            <div key={section.title ?? index} className={cn(index > 0 && 'mt-6')}>
              {section.title && (
                <div className='relative mb-2 h-4'>
                  <p
                    className={cn(
                      'absolute inset-x-[18px] top-0 whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-purple/70 transition-opacity duration-300',
                      rail && 'opacity-0'
                    )}
                  >
                    {tr(section.title)}
                  </p>
                  <span
                    className={cn(
                      'absolute left-[18px] top-1/2 h-px w-5 bg-linear-to-r from-brand-purple/50 to-brand-cyan/50 transition-opacity duration-300',
                      !rail && 'opacity-0'
                    )}
                    aria-hidden
                  />
                </div>
              )}
              <ul className='space-y-0.5'>
                {section.menus.map((menu) => (
                  <li key={menu.label}>
                    {menu.children?.length ? (
                      <NavGroup
                        menu={menu}
                        activePath={activePath}
                        rail={rail}
                        open={openGroups[menu.label] ?? menu.children.some((c) => c.path === activePath)}
                        onToggle={(open) => setOpenGroups((prev) => ({ ...prev, [menu.label]: open }))}
                        onNavigate={onCloseMobile}
                        tr={tr}
                      />
                    ) : (
                      <NavLeaf
                        item={menu}
                        active={menu.path === activePath}
                        rail={rail}
                        onNavigate={onCloseMobile}
                        tr={tr}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p
          className={cn(
            'shrink-0 whitespace-nowrap border-t border-slate-100 px-[30px] py-3 font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300 transition-opacity duration-300',
            rail && 'opacity-0'
          )}
        >
          {'// '}
          {t('authLayout.restricted')}
        </p>
      </aside>
    </Tooltip.Provider>
  )
}

interface NavLeafProps {
  item: SidebarMenu
  active: boolean
  rail: boolean
  onNavigate: () => void
  tr: Translate
}

function NavLeaf({ item, active, rail, onNavigate, tr }: NavLeafProps) {
  const label = tr(item.label)
  return (
    <RailTooltip label={label} rail={rail}>
      <Link
        to={item.path ?? '/'}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        aria-label={rail ? label : undefined}
        className={cn(sidebarRowClass, active ? sidebarRowActiveClass : sidebarRowIdleClass)}
      >
        <item.icon
          className={cn(
            sidebarIconClass,
            active ? 'text-brand-purple' : 'text-slate-400 group-hover/row:text-slate-600'
          )}
          aria-hidden
        />
        <RowLabel rail={rail}>{label}</RowLabel>
      </Link>
    </RailTooltip>
  )
}

interface NavGroupProps {
  menu: SidebarMenu
  activePath: string | undefined
  rail: boolean
  open: boolean
  onToggle: (open: boolean) => void
  onNavigate: () => void
  tr: Translate
}

/**
 * Accordion when expanded; in the rail the same button opens a flyout instead. The Popover is
 * always mounted (only allowed to open in the rail) so toggling modes never remounts the row.
 */
function NavGroup({ menu, activePath, rail, open, onToggle, onNavigate, tr }: NavGroupProps) {
  const panelId = useId()
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const label = tr(menu.label)
  const items = menu.children ?? []
  const containsActive = items.some((child) => child.path === activePath)
  const expanded = open && !rail

  return (
    <Popover open={rail && flyoutOpen} onOpenChange={(next) => setFlyoutOpen(rail && next)}>
      <PopoverTrigger asChild>
        <button
          type='button'
          onClick={() => {
            if (!rail) onToggle(!open)
          }}
          // Accordion semantics when expanded; in the rail Radix supplies the popover ones.
          {...(rail
            ? { 'aria-label': label }
            : { 'aria-expanded': open, 'aria-controls': panelId, 'aria-haspopup': undefined })}
          className={cn(
            sidebarRowClass,
            sidebarRowIdleClass,
            containsActive && 'font-semibold text-slate-900'
          )}
        >
          <menu.icon
            className={cn(
              sidebarIconClass,
              containsActive ? 'text-brand-purple' : 'text-slate-400 group-hover/row:text-slate-600'
            )}
            aria-hidden
          />
          <RowLabel rail={rail}>{label}</RowLabel>
          <ChevronDown
            className={cn(
              'ml-auto size-4 shrink-0 transition-[rotate,opacity] duration-300 ease-hud',
              open && 'rotate-180',
              rail && 'opacity-0',
              'text-slate-400'
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <div
        id={panelId}
        inert={!expanded}
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-hud',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className='overflow-hidden'>
          <ul className='ml-7 mt-0.5 space-y-0.5 border-l border-slate-200 py-0.5 pl-2'>
            {items.map((child) => {
              const active = child.path === activePath
              return (
                <li key={child.label}>
                  <Link
                    to={child.path ?? '/'}
                    onClick={onNavigate}
                    aria-current={active && expanded ? 'page' : undefined}
                    className={cn(
                      'relative flex h-9 items-center whitespace-nowrap px-3 text-[13px] outline-none hud-clip-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
                      active ? sidebarRowActiveClass : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                    )}
                  >
                    <span className='truncate'>{tr(child.label)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <PopoverContent
        side='right'
        align='start'
        sideOffset={14}
        className='z-[60] w-56 overflow-hidden rounded-xl border-slate-200 p-0 shadow-xl'
      >
        <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
        <div className='p-1.5'>
        <p className='px-2.5 pb-1.5 pt-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-purple'>
          {label}
        </p>
        {items.map((child) => {
          const active = child.path === activePath
          return (
            <Link
              key={child.label}
              to={child.path ?? '/'}
              onClick={() => {
                setFlyoutOpen(false)
                onNavigate()
              }}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-2.5 px-2.5 py-2 text-sm hud-clip-sm transition-colors duration-200',
                active ? sidebarRowActiveClass : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <child.icon
                className={cn('size-4 shrink-0', active ? 'text-brand-purple' : 'text-slate-400')}
                aria-hidden
              />
              {tr(child.label)}
            </Link>
          )
        })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
