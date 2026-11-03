import { cn } from '@/lib/utils'

interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
  label: string
  size?: 'sm' | 'md'
}

/** Compact single-choice switcher in the HUD style. */
export function Segmented<T extends string>({ value, options, onChange, label, size = 'sm' }: SegmentedProps<T>) {
  return (
    <div role='radiogroup' aria-label={label} className='inline-flex max-w-full overflow-x-auto bg-slate-100 p-0.5 hud-clip-sm'>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type='button'
            role='radio'
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'shrink-0 whitespace-nowrap font-display font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ease-hud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40',
              size === 'md' ? 'h-9 px-3.5 text-[11px]' : 'h-7 px-2.5 text-[10px]',
              selected
                ? 'bg-white text-brand-purple shadow-sm hud-clip-sm'
                : 'text-slate-500 hover:text-slate-900'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
