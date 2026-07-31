"use client"

import type { Table } from "@tanstack/react-table"
import { X, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useSite } from "@/context/site-context"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filterableColumns?: {
    id: string
    title: string
    options: {
      label: string
      value: string
    }[]
    customFilter?: (value: any, filterValues: string[]) => boolean
  }[]
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  bulkActions?: {
    label: string
    action: (selectedRows: TData[]) => void
  }[]
  onAddNew?: () => void
  onRefresh?: () => void
}

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  globalFilter,
  onGlobalFilterChange,
  bulkActions = [],
  onAddNew,
  onRefresh,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const { t } = useSite()
  const dt = t.dashboard

  const handleApplyAction = () => {
    if (!selectedAction) return

    const action = bulkActions.find((a) => a.label === selectedAction)
    if (!action) return

    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
    action.action(selectedRows)
    setSelectedAction(null)
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {onGlobalFilterChange && (
          <Input
            placeholder={dt.table.searchPlaceholder}
            value={globalFilter ?? ""}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className="h-9 w-[150px] lg:w-[250px]"
          />
        )}
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm" className="h-9">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id) && (
                <DataTableFacetedFilter
                  key={column.id}
                  column={table.getColumn(column.id)}
                  title={column.title}
                  options={column.options}
                  customFilter={column.customFilter}
                />
              ),
          )}
        {isFiltered && (
          <Button variant="ghost" onClick={() => table.resetColumnFilters()} className="h-9 px-2 lg:px-3">
            {dt.table.clearFilter}
            <X className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {table.getFilteredSelectedRowModel().rows.length > 0 && bulkActions.length > 0 && (
          <div className="flex items-center gap-2">
            <Select value={selectedAction || ""} onValueChange={setSelectedAction}>
              <SelectTrigger className="h-9 w-[150px]">
                <SelectValue placeholder={dt.table.bulkActions} />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => (
                  <SelectItem key={action.label} value={action.label}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleApplyAction} disabled={!selectedAction} className="h-9">
              {dt.table.apply}
            </Button>
          </div>
        )}

        {onAddNew && (
          <Button onClick={onAddNew} size="sm" className="h-9">
            <Plus className="me-2 h-4 w-4" />
            {dt.table.addNew}
          </Button>
        )}
      </div>

    </div>
  )
}

