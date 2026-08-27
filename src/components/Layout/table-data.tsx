import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type RowData,
} from '@tanstack/react-table'
import { Fragment } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { cn } from '@/lib/utils'

declare module '@tanstack/react-table' {
  // Kelas per-kolom, dipakai untuk menyembunyikan kolom sekunder di layar
  // sempit. Header dan sel harus memakai kelas yang sama agar tidak bergeser.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string
    cellClassName?: string
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubRow?: (row: TData) => React.ReactNode
  /** Tampilan sel kosong bila `data` tidak ada baris (default: "No data") */
  emptyMessage?: React.ReactNode
  /** Header mengikuti scroll vertikal (berguna saat tabel panjang) */
  stickyHeader?: boolean
  /**
   * Identitas baris yang stabil. Tanpa ini `row.id` adalah indeks, sehingga
   * komponen per-baris (dialog, observer mutasi) dipakai ulang untuk entitas
   * yang berbeda saat halaman berganti.
   */
  getRowId?: (row: TData, index: number) => string
  /** Nama tabel untuk pembaca layar; dirender tersembunyi secara visual. */
  caption?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubRow,
  emptyMessage = 'No data',
  stickyHeader = false,
  getRowId,
  caption,
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
    <div className='w-full min-w-0 max-w-full overflow-x-auto overflow-y-clip rounded-md border border-border/80'>
      <Table
        className='min-w-max [&_td]:border-x-0 [&_th]:border-x-0'
        scrollContainer={false}
      >
        {caption && <TableCaption className='sr-only'>{caption}</TableCaption>}
        <TableHeader
          className={cn(
            'bg-card',
            stickyHeader &&
              'sticky top-0 z-10 border-b border-border/80 bg-card/95 shadow-sm backdrop-blur-sm group-data-[shell-shift=on]/shell:backdrop-blur-none [&_th]:bg-card/95',
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.headerClassName}
                >
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
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
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
