/**
 * Sidebar row. The 18px left padding (plus the nav's 12px) puts every icon's left edge at 30px,
 * which is exactly centred in the 80px rail — so icons never move when the sidebar collapses.
 */
export const sidebarRowClass =
  'group/row relative flex h-10 w-full items-center gap-3 rounded-lg pl-[18px] pr-3 text-sm font-medium whitespace-nowrap ' +
  'outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-brand-purple/30'

export const sidebarRowIdleClass = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

/** Soft purple fill plus a short bar on the left edge. */
export const sidebarRowActiveClass =
  'bg-brand-purple/10 font-semibold text-brand-purple-deep ' +
  'before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-brand-purple'

export const sidebarIconClass = 'size-5 shrink-0 transition-colors duration-200'
