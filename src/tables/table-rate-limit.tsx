import ModalDeleteRateLimit from '@/components/RateLimit/Delete'
import ModalRateLimit from '@/components/RateLimit/RateLimit'
import { nbCode } from '@/lib/nb'
import type { RateLimit } from '@/types/rate_limit'
import type { ColumnDef } from '@tanstack/react-table'

export const rateLimitColumns: ColumnDef<RateLimit>[] = [
  {
    accessorKey: 'key',
    header: 'Setting Key',
    cell: ({ row }) => <code className={nbCode}>{row?.original?.key}</code>,
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className='nb-frame nb-frame-thin inline-block bg-[#6fe3f5] px-1.5 py-0.5 text-xs font-black tabular-nums'>
        {row?.original?.value}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <ModalRateLimit rateLimit={row?.original} />
        <ModalDeleteRateLimit settingKey={row?.original?.key} />
      </div>
    ),
  },
]
