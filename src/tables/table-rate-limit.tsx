import ModalDeleteRateLimit from '@/components/RateLimit/Delete'
import ModalRateLimit from '@/components/RateLimit/RateLimit'
import type { RateLimit } from '@/types/rate_limit'
import type { ColumnDef } from '@tanstack/react-table'

export const rateLimitColumns: ColumnDef<RateLimit>[] = [
  {
    accessorKey: 'key',
    header: 'Setting Key',
    cell: ({ row }) => (
      <code className='font-bold text-purple-600'>{row?.original?.key}</code>
    ),
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => (
      <span className='font-mono'>{row?.original?.value}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Action',
    cell: ({ row }) => (
      <div className='flex items-center gap-1'>
        <ModalRateLimit rateLimit={row?.original} />
        <ModalDeleteRateLimit settingKey={row?.original?.key} />
      </div>
    ),
  },
]
