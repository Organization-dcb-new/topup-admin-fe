/** Brand skin for the shared `Input` on the auth pages. */
export const hudInputClass =
  'h-12 rounded-md border-slate-200 bg-slate-50 text-slate-900 shadow-none placeholder:text-slate-400 ' +
  'transition-[border-color,background-color,box-shadow] duration-300 ease-hud hover:border-slate-300 ' +
  'focus-visible:border-brand-purple focus-visible:bg-white focus-visible:ring-brand-purple/15 ' +
  'aria-invalid:border-rose-400 aria-invalid:ring-rose-500/15'

export const hudLabelClass =
  'font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600'

/** One digit slot of the shared `InputOTP`, matching the inputs above. */
export const hudOtpSlotClass =
  'h-12 w-9 rounded-md border border-slate-200 bg-slate-50 font-display text-xl font-semibold text-slate-900 shadow-none transition-[border-color,background-color,box-shadow] duration-200 ease-hud ' +
  'min-[380px]:w-10 sm:h-14 sm:w-12 ' +
  'data-[active=true]:border-brand-purple data-[active=true]:bg-white data-[active=true]:ring-brand-purple/15 ' +
  'aria-invalid:border-rose-400 data-[active=true]:aria-invalid:ring-rose-500/15'

/** Icon slot on the left edge of an input; takes the brand colour while the field is focused. */
export const hudInputIconClass =
  'pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 transition-colors duration-300 group-focus-within:text-brand-purple'

/** The login submit button's look, for links and plain buttons (pair with a cyan notch span). */
export const hudPrimaryButtonClass =
  'relative inline-flex h-11 items-center justify-center gap-2 overflow-hidden bg-linear-to-r from-brand-purple via-brand-purple-deep to-brand-purple bg-[length:200%_100%] bg-left px-5 ' +
  'font-display text-xs font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-position,transform,opacity] duration-500 ease-hud ' +
  'hover:bg-right active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 disabled:opacity-50'

export const hudEyebrowClass =
  'font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-purple'
