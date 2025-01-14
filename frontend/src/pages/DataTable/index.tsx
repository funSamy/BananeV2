import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
  Row,
  PaginationState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { columns } from "./columns";
import { ChevronDown } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { format } from "date-fns";
import { DataForm } from "@/components/forms/data-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DataEntry } from "@/types/data";
import { toast } from "sonner";
import { useProductionTable } from "@/hooks/production/use-production-table";
import { useUpdateProduction } from "@/hooks/production/use-production-data";

declare module "@tanstack/table-core" {
  interface FilterFns {
    dateRange: FilterFn<unknown>;
  }
}

export default function DataTablePage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [editingRow, setEditingRow] = useState<Row<DataEntry> | null>(null);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Convert TanStack Table pagination to API format
  const pagination = {
    page: pageIndex + 1,
    pageSize,
  };

  // Fetch data using the hook
  const { data: tableData, isLoading } = useProductionTable(
    pagination,
    sorting,
    date
  );

  // Update mutation
  const updateMutation = useUpdateProduction();

  const handleEditRow = useCallback((row: Row<DataEntry>) => {
    setEditingRow(row);
  }, []);

  const handleEditSubmit = useCallback(
    async (data: unknown) => {
      try {
        const { id, ...rest } = data as DataEntry;

        await updateMutation.mutateAsync({
          id,
          data: {
            ...rest,
            date: rest.date.toISOString(),
          },
        });
        toast.success("Data updated successfully!");
        setEditingRow(null);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update data");
      }
    },
    [updateMutation]
  );

  const table = useReactTable<DataEntry>({
    data: tableData?.data ?? [],
    pageCount: tableData?.pagination?.pageCount,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    meta: {
      handleEditRow,
    },
    filterFns: {
      dateRange: (row, columnId, value: DateRange) => {
        const date = row.getValue(columnId) as Date;
        const { from, to } = value;

        if (!date) return false;
        if (from && !to) {
          return date >= from;
        } else if (!from && to) {
          return date <= to;
        } else if (from && to) {
          return date >= from && date <= to;
        }
        return true;
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
  });

  // Update column filters when date range changes
  useEffect(() => {
    if (date?.from || date?.to) {
      table.getColumn("date")?.setFilterValue(date);
    } else {
      table.getColumn("date")?.setFilterValue(undefined);
    }
  }, [date, table]);

  // Get unique months from visible rows
  const visibleMonths = table
    .getRowModel()
    .rows.map((row) => format(row.getValue("date"), "MMMM yyyy"))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  const monthsDisplay =
    visibleMonths.length > 0
      ? visibleMonths.length === 1
        ? visibleMonths[0]
        : `${visibleMonths[0]} - ${visibleMonths[visibleMonths.length - 1]}`
      : "No data";

  return (
    <>
      <div className="w-full p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-primary font-bold tracking-tight">
              Data Table
            </h2>
            <div className="text-sm text-accentForeground font-medium bg-accent px-3 py-1 rounded-md">
              {monthsDisplay}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DatePickerWithRange date={date} setDate={setDate} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="rounded-md border mt-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-primary"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-primary"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="py-4">
          <DataTablePagination table={table} />
        </div>
      </div>

      <Dialog
        open={!!editingRow}
        onOpenChange={(open) => !open && setEditingRow(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-primary">
          <DataForm
            onSubmit={handleEditSubmit}
            isSubmitting={updateMutation.isPending}
            defaultValues={editingRow?.original}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
