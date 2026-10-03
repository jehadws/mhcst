"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { useSite } from "@/context/site-context"

function getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title?: string
    description?: string
    searchFields?: string[]
    filterableColumns?: {
        id: string
        title: string
        options: {
            label: string
            value: string
        }[]
        customFilter?: (value: any, filterValues: string[]) => boolean
    }[]
    bulkActions?: {
        label: string
        action: (selectedRows: TData[]) => void
    }[]
    initialPageSize?: number
    /** Server-driven pagination: pass the paginator's page count and receive
     * 1-based page selections. Without these props the table pages client-side. */
    pageCount?: number
    currentPage?: number
    onPageChange?: (page: number) => void
    onAddNew?: () => void
    onRefresh?: () => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    description,
    searchFields,
    filterableColumns = [],
    bulkActions = [],
    initialPageSize = 10,
    pageCount,
    currentPage,
    onPageChange,
    onAddNew,
    onRefresh,
}: DataTableProps<TData, TValue>) {
    const { t } = useSite()
    const serverPaginated = typeof onPageChange === 'function'
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState('')
    const [pagination, setPagination] = React.useState({
        pageIndex: Math.max(0, (currentPage ?? 1) - 1),
        pageSize: initialPageSize,
    })

    const table = useReactTable({
        data,
        columns,
        manualPagination: serverPaginated || undefined,
        pageCount: serverPaginated ? pageCount : undefined,
        onPaginationChange: serverPaginated
            ? (updater) => {
                  const next = typeof updater === 'function' ? updater(pagination) : updater
                  setPagination(next)
                  if (next.pageIndex !== pagination.pageIndex) onPageChange!(next.pageIndex + 1)
              }
            : undefined,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: serverPaginated ? undefined : getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: (row, _columnId, filterValue: string) => {
            if (!filterValue || !searchFields?.length) return true
            const q = String(filterValue).toLowerCase()
            return searchFields.some((field) => {
                const val = getNestedValue(row.original, field)
                return val != null && String(val).toLowerCase().includes(q)
            })
        },
        initialState: serverPaginated ? undefined : {
            pagination: {
                pageSize: initialPageSize,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
            ...(serverPaginated ? { pagination } : {}),
        },
    })

    return (
        <div className="space-y-4">
            {(title || description) && (
                <div>
                    {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
                    {description && <p className="text-muted-foreground">{description}</p>}
                </div>
            )}
            <DataTableToolbar
                table={table}
                filterableColumns={filterableColumns}
                globalFilter={globalFilter}
                onGlobalFilterChange={setGlobalFilter}
                bulkActions={bulkActions}
                onAddNew={onAddNew}
                onRefresh={onRefresh}
            />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="text-start">
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {t.dashboard.table.noData}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}

