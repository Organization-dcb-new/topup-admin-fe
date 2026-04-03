import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  renderSubRow?: (row: TData) => React.ReactNode
  emptyMessage?: React.ReactNode
  /** Header kolom tetap di atas saat kontainer induk di-scroll vertikal (satu scrollport dengan tbody). */
  stickyHeader?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderSubRow,
  emptyMessage = 'No data',
  stickyHeader = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: renderSubRow ? getExpandedRowModel() : undefined,
    enableExpanding: !!renderSubRow,
    getRowCanExpand: () => !!renderSubRow,
  })

  return (
    <div className={cn('rounded-md border', !stickyHeader && 'overflow-x-auto')}>
      <Table className="min-w-max" scrollContainer={!stickyHeader}>
        <TableHeader
          className={cn(
            'bg-white',
            stickyHeader &&
              '[&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:border-b [&_th]:bg-background',
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
                  <TableRow className="bg-muted/40">
                    <TableCell colSpan={columns.length}>{renderSubRow(row.original)}</TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-28 px-4 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
