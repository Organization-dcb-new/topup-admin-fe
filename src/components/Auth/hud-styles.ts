/** Brand skin for the shared `Input` on the auth pages. */
export const hudInputClass =
  'h-12 rounded-md border-slate-200 bg-slate-50 text-slate-900 shadow-none placeholder:text-slate-400 ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-hud hover:border-slate-300 ' +
  'focus-visible:border-brand-purple focus-visible:bg-white focus-visible:ring-brand-purple/15 ' +
  'aria-invalid:border-rose-400 aria-invalid:ring-rose-500/15'

export const hudLabelClass =
  'font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600'

/** Icon slot on the left edge of an input; takes the brand colour while the field is focused. */
export const hudInputIconClass =
  'pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 transition-colors duration-300 group-focus-within:text-brand-purple'
