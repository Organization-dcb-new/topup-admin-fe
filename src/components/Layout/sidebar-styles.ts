/**
 * Sidebar row, notched like the login card. The 18px left padding (plus the nav's 12px) puts every
 * icon's left edge at 30px, which is exactly centred in the 80px rail — so icons never move when the
 * sidebar collapses. Focus uses an inset ring because the clip-path would cut an outer one off.
 */
export const sidebarRowClass =
  'group/row relative flex h-10 w-full items-center gap-3 pl-[18px] pr-3 text-sm font-medium whitespace-nowrap hud-clip-sm ' +
  'outline-none transition-[background-color,color] duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'

export const sidebarRowIdleClass = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'

/** The login card's purple-to-cyan language: a tinted fill and a gradient bar on the left edge. */
export const sidebarRowActiveClass =
  'bg-linear-to-r from-brand-purple/15 to-brand-cyan/10 font-semibold text-brand-purple-deep ' +
  'before:absolute before:inset-y-2.5 before:left-0 before:w-[3px] before:bg-linear-to-b before:from-brand-purple before:to-brand-cyan'

export const sidebarIconClass = 'size-5 shrink-0 transition-colors duration-200'
