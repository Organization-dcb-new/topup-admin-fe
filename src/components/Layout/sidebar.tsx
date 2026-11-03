import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'radix-ui'
import { ChevronDown, X } from 'lucide-react'

import brandMark from '@/assets/brand/pakargaming-mark.webp'
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
          'z-50 flex flex-col overflow-hidden bg-linear-to-b from-brand-purple to-brand-purple-deep text-white',
          'transition-[width,translate] duration-300 ease-hud',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[min(16rem,calc(100vw-3rem))] max-md:shadow-2xl',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
          'md:sticky md:top-0 md:h-screen md:shrink-0',
          rail ? 'md:w-20' : 'md:w-64'
        )}
      >
        {/* Same height as the navbar so the two read as one frame. */}
        <div className='flex h-16 shrink-0 items-center px-3'>
          <Link
            to='/'
            onClick={onCloseMobile}
            className='flex min-w-0 items-center gap-3 rounded-lg py-1 pl-3 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'
          >
            <span className='grid size-8 shrink-0 place-items-center rounded-lg bg-white shadow-sm'>
              <img src={brandMark} alt='' className='h-5 w-auto' />
            </span>
            <RowLabel rail={rail}>
              <span className='font-display text-base font-bold tracking-wide'>PakarGaming</span>
            </RowLabel>
          </Link>

          <button
            type='button'
            onClick={onCloseMobile}
            aria-label={t('sidebar.closeMenu')}
            className='ml-auto grid size-9 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:hidden'
          >
            <X className='size-5' aria-hidden />
          </button>
        </div>

        <nav
          ref={navRef}
          aria-label={t('sidebar.navLabel')}
          className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 pb-4 pt-2 scrollbar-sidebar'
        >
          {sections.map((section, index) => (
            <div key={section.title ?? index} className={cn(index > 0 && 'mt-6')}>
              {section.title && (
                <div className='relative mb-2 h-4'>
                  <p
                    className={cn(
                      'absolute inset-x-[18px] top-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wider text-white/50 transition-opacity duration-300',
                      rail && 'opacity-0'
                    )}
                  >
                    {tr(section.title)}
                  </p>
                  <span
                    className={cn(
                      'absolute left-[18px] top-1/2 h-px w-5 bg-white/25 transition-opacity duration-300',
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
            active ? 'text-brand-purple' : 'text-white/70 group-hover/row:text-white'
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
  // The group row stands in for the current page whenever its children are hidden.
  const rowIsCurrent = containsActive && !expanded

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
            rowIsCurrent
              ? sidebarRowActiveClass
              : containsActive
                ? 'text-white hover:bg-white/10'
                : sidebarRowIdleClass
          )}
        >
          <menu.icon
            className={cn(
              sidebarIconClass,
              rowIsCurrent
                ? 'text-brand-purple'
                : containsActive
                  ? 'text-white'
                  : 'text-white/70 group-hover/row:text-white'
            )}
            aria-hidden
          />
          <RowLabel rail={rail}>{label}</RowLabel>
          <ChevronDown
            className={cn(
              'ml-auto size-4 shrink-0 transition-[rotate,opacity] duration-300 ease-hud',
              open && 'rotate-180',
              rail && 'opacity-0',
              rowIsCurrent ? 'text-brand-purple/60' : 'text-white/50'
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
          <ul className='ml-7 mt-0.5 space-y-0.5 border-l border-white/15 py-0.5 pl-2'>
            {items.map((child) => {
              const active = child.path === activePath
              return (
                <li key={child.label}>
                  <Link
                    to={child.path ?? '/'}
                    onClick={onNavigate}
                    aria-current={active && expanded ? 'page' : undefined}
                    className={cn(
                      'flex h-9 items-center whitespace-nowrap rounded-md px-3 text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                      active
                        ? 'bg-white/15 font-semibold text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
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
        className='z-[60] w-56 rounded-xl border-slate-200 p-1.5 shadow-xl'
      >
        <p className='px-2.5 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400'>
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
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-200',
                active
                  ? 'bg-brand-purple/10 font-semibold text-brand-purple-deep'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
      </PopoverContent>
    </Popover>
  )
}
