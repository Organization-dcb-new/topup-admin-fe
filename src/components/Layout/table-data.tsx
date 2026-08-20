import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { cn } from '@/lib/utils'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubRow?: (row: TData) => React.ReactNode
  /** Tampilan sel kosong bila `data` tidak ada baris (default: "No data") */
  emptyMessage?: React.ReactNode
  /** Header mengikuti scroll vertikal (berguna saat tabel panjang) */
  stickyHeader?: boolean
  /** Kelas tambahan untuk pembungkus tabel (mis. `nb nb-table` di halaman neo-brutalism) */
  className?: string
  /**
   * Id baris yang stabil. Tanpa ini TanStack Table memakai indeks sebagai
   * `row.id`, sehingga key React ikut bergeser saat daftar berubah dan state
   * lokal di dalam sel (mis. dialog hapus yang sedang terbuka) berpindah baris.
   */
  getRowId?: (row: TData, index: number) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubRow,
  emptyMessage = 'No data',
  stickyHeader = false,
  className,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: renderSubRow ? getExpandedRowModel() : undefined,
    enableExpanding: !!renderSubRow,
    getRowCanExpand: () => !!renderSubRow,
  })

  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-full overflow-x-auto overflow-y-clip rounded-md border border-border/80',
        className,
      )}
    >
      <Table
        className='min-w-max [&_td]:border-x-0 [&_th]:border-x-0'
        scrollContainer={false}
      >
        <TableHeader
          className={cn(
            'bg-card',
            stickyHeader &&
              'sticky top-0 z-10 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-sm [&_th]:bg-card/95',
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                {/* ROW UTAMA */}
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>

                {/* ROW EXPANDED */}
                {renderSubRow && row.getIsExpanded() && (
                  <TableRow className='bg-muted/40'>
                    <TableCell colSpan={columns.length}>{renderSubRow(row.original)}</TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className='h-28 px-4 text-center text-sm text-muted-foreground'>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
