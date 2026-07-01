function Block({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-3' aria-busy='true' aria-live='polite'>
      <div className='grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Block key={i} className='h-24' />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
        <Block className='h-64 lg:col-span-2' />
        <Block className='h-64' />
      </div>
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Block key={i} className='h-56' />
        ))}
      </div>
    </div>
  )
}
