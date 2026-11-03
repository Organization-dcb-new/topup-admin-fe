/**
 * Sidebar row. The 18px left padding (plus the nav's 12px) puts every icon's left edge at 30px,
 * which is exactly centred in the 80px rail — so icons never move when the sidebar collapses.
 */
export const sidebarRowClass =
  'group/row relative flex h-10 w-full items-center gap-3 rounded-lg pl-[18px] pr-3 text-sm font-medium whitespace-nowrap ' +
  'transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70'

export const sidebarRowIdleClass = 'text-white/80 hover:bg-white/10 hover:text-white'

export const sidebarRowActiveClass =
  'bg-white font-semibold text-brand-purple-deep shadow-lg shadow-black/15'

export const sidebarIconClass = 'size-5 shrink-0 transition-colors duration-200'
