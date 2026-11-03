function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200/60 hud-clip ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-4' aria-busy='true' aria-live='polite'>
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]'>
        <Block className='h-60' />
        <div className='grid grid-cols-2 gap-4'>
          {Array.from({ length: 4 }, (_, i) => (
            <Block key={i} className='h-28' />
          ))}
        </div>
      </div>
      <div className='grid gap-4 xl:grid-cols-3'>
        <Block className='h-96 xl:col-span-2' />
        <Block className='h-96' />
      </div>
      <div className='grid gap-4 lg:grid-cols-3'>
        {Array.from({ length: 3 }, (_, i) => (
          <Block key={i} className='h-56' />
        ))}
      </div>
    </div>
  )
}
