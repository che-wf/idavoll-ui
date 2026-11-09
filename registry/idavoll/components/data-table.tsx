"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Columns3,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Column name for the column menu, when the header isn't plain text. */
    label?: string;
    /** Classes for this column's cells, e.g. "text-right" for numbers. */
    className?: string;
  }
}

export interface DataTableFilterOption {
  /** The cell value to match. */
  value: string;
  /** Text in the menu and the filter chip. Defaults to `value`. */
  label?: string;
  /** Small icon before the label. */
  icon?: ReactNode;
}

export interface DataTableFilter {
  /** Id of the column to filter (its `id` or `accessorKey`). */
  column: string;
  /** Name on the filter button, e.g. "Platform". */
  title: string;
  /** Choices to offer. Leave unset to list every value found in the column. */
  options?: DataTableFilterOption[];
}

export interface DataTableProps<TData> {
  /** Column definitions, as in TanStack Table. Use DataTableColumnHeader as a header to make a column sortable. */
  // biome-ignore lint/suspicious/noExplicitAny: columns hold values of different types, as in TanStack's own examples.
  columns: ColumnDef<TData, any>[];
  /** The rows. */
  data: TData[];
  /** What the table shows, e.g. "Posts". Screen readers use it as the table's name. */
  label: string;
  /** Show a search box that matches any text column. Defaults to true. */
  searchable?: boolean;
  /** Placeholder and label for the search box. Defaults to "Search…". */
  searchPlaceholder?: string;
  /** Pick-from-a-list filters, one button per column. Choices show how many rows each would match. */
  filters?: DataTableFilter[];
  /** Show a "Columns" menu to hide and show columns. Defaults to false. */
  columnToggle?: boolean;
  /** Rows per page. 0 shows every row. Defaults to 10. */
  pageSize?: number;
  /** Starting sort, e.g. [{ id: "views", desc: true }]. */
  initialSorting?: SortingState;
  /** Describes the visible row count for the status line. Defaults to "12 results". */
  countLabel?: (count: number) => string;
  /** Shown when nothing matches. Defaults to "No results match your search and filters." */
  emptyMessage?: ReactNode;
  /** Extra controls at the end of the toolbar, e.g. an "Export" button. */
  toolbar?: ReactNode;
  /** A stable id for each row. Defaults to the row's index. */
  getRowId?: (row: TData, index: number) => string;
  className?: string;
}

/** Matches when the cell's value is one of the chosen values. */
const oneOf: FilterFn<unknown> = (row, columnId, chosen: string[]) =>
  !chosen?.length || chosen.includes(String(row.getValue(columnId)));
oneOf.autoRemove = (value: string[] | undefined) => !value?.length;

const defaultCount = (n: number) => (n === 1 ? "1 result" : `${n.toLocaleString()} results`);

/**
 * A sortable column header. Use it as a column's `header`:
 * `header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />`.
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  /** The column, from the header's props. */
  column: Column<TData, TValue>;
  /** Header text. */
  title: string;
  className?: string;
}) {
  if (!column.getCanSort()) return <span className={className}>{title}</span>;
  const sorted = column.getIsSorted();
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;
  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "-mx-2 inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring",
        sorted && "text-foreground",
        className,
      )}
    >
      {title}
      <Icon aria-hidden className={cn("size-3.5", !sorted && "opacity-50")} />
    </button>
  );
}

function FilterMenu<TData>({ column, filter }: { column: Column<TData, unknown>; filter: DataTableFilter }) {
  const chosen = (column.getFilterValue() as string[] | undefined) ?? [];
  const counts = column.getFacetedUniqueValues();
  const options: DataTableFilterOption[] =
    filter.options ??
    [...counts.keys()]
      .map(String)
      .sort()
      .map((value) => ({ value }));
  const set = (next: string[]) => column.setFilterValue(next.length ? next : undefined);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("border-dashed", chosen.length && "border-solid")}>
          <ListFilter aria-hidden />
          {filter.title}
          {chosen.length > 0 && (
            <span className="rounded-sm bg-primary px-1.5 font-semibold text-primary-foreground text-xs tabular-nums">
              <span className="sr-only">, </span>
              {chosen.length}
              <span className="sr-only"> selected</span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>{filter.title}</DropdownMenuLabel>
        {options.map((o) => {
          const count = counts.get(o.value) ?? 0;
          return (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={chosen.includes(o.value)}
              // Keep the menu open so several choices can be ticked in a row.
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(on) => set(on ? [...chosen, o.value] : chosen.filter((v) => v !== o.value))}
            >
              {o.icon}
              <span className="flex-1">{o.label ?? o.value}</span>
              <span className="text-foreground/70 text-xs tabular-nums">{count}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {chosen.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => set([])} className="justify-center">
              Clear {filter.title.toLowerCase()} filter
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A table with search, pick-from-a-list filters, sortable columns and pages.
 * Applied filters show as chips that can be removed one at a time, and the row count is
 * announced to screen readers as it changes. Built on TanStack Table.
 */
export function DataTable<TData>({
  columns,
  data,
  label,
  searchable = true,
  searchPlaceholder = "Search…",
  filters = [],
  columnToggle = false,
  pageSize = 10,
  initialSorting = [],
  countLabel = defaultCount,
  emptyMessage = "No results match your search and filters.",
  toolbar,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const searchId = useId();
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize || Number.MAX_SAFE_INTEGER });

  // Filtered columns match on "one of the chosen values" unless the column says otherwise.
  const filterIds = new Set(filters.map((f) => f.column));
  const tableColumns = columns.map((c) => {
    const id = c.id ?? ("accessorKey" in c ? String(c.accessorKey) : undefined);
    return id && filterIds.has(id) && !c.filterFn ? { ...c, filterFn: oneOf as FilterFn<TData> } : c;
  });

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, columnFilters, globalFilter, columnVisibility, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const matched = table.getFilteredRowModel().rows.length;
  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const { pageIndex } = table.getState().pagination;
  const first = matched === 0 ? 0 : pageIndex * pagination.pageSize + 1;
  const last = Math.min(matched, first + rows.length - 1);
  const filtering = columnFilters.length > 0 || globalFilter !== "";
  const visibleColumns = table.getVisibleLeafColumns().length;

  const chips = filters.flatMap((f) => {
    const column = table.getColumn(f.column);
    const chosen = (column?.getFilterValue() as string[] | undefined) ?? [];
    return chosen.map((value) => ({
      key: `${f.column}:${value}`,
      text: `${f.title}: ${f.options?.find((o) => o.value === value)?.label ?? value}`,
      remove: () => {
        const next = chosen.filter((v) => v !== value);
        column?.setFilterValue(next.length ? next : undefined);
      },
    }));
  });
  const clearAll = () => {
    table.resetColumnFilters();
    setGlobalFilter("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {searchable && (
          <div className="relative w-full sm:w-64">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 opacity-60"
            />
            <label htmlFor={searchId} className="sr-only">
              {searchPlaceholder}
            </label>
            <Input
              id={searchId}
              type="search"
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8"
            />
          </div>
        )}
        {filters.map((f) => {
          const column = table.getColumn(f.column);
          return column ? <FilterMenu key={f.column} column={column} filter={f} /> : null;
        })}
        <div className="ml-auto flex items-center gap-2">
          {columnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 aria-hidden />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show columns</DropdownMenuLabel>
                {table
                  .getAllLeafColumns()
                  .filter((c) => c.getCanHide())
                  .map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={c.getIsVisible()}
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(on) => c.toggleVisibility(on)}
                    >
                      {c.columnDef.meta?.label ?? (typeof c.columnDef.header === "string" ? c.columnDef.header : c.id)}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {toolbar}
        </div>
      </div>

      {chips.length > 0 && (
        <ul aria-label="Applied filters" className="flex flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={chip.remove}
                aria-label={`Remove filter ${chip.text}`}
                className="inline-flex items-center gap-1 rounded-full border bg-muted/50 py-0.5 pr-1.5 pl-2.5 text-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                {chip.text}
                <X aria-hidden className="size-3.5" />
              </button>
            </li>
          ))}
          <li>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAll}>
              Clear all
            </Button>
          </li>
        </ul>
      )}

      {/* Keyboard users can focus the frame to scroll wide tables sideways. */}
      <section
        aria-label={label}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable regions must be focusable.
        tabIndex={0}
        className="overflow-x-auto rounded-xl border focus-visible:outline-2 focus-visible:outline-ring"
      >
        <table className="w-full caption-bottom text-sm">
          <caption className="sr-only">{label}</caption>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        header.column.getCanSort()
                          ? sorted === "asc"
                            ? "ascending"
                            : sorted === "desc"
                              ? "descending"
                              : "none"
                          : undefined
                      }
                      className={cn(
                        "whitespace-nowrap px-3 text-foreground/70",
                        header.column.columnDef.meta?.className,
                      )}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("px-3", cell.column.columnDef.meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={visibleColumns} className="h-32 text-center">
                  <p className="text-foreground/70">{emptyMessage}</p>
                  {filtering && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={clearAll}>
                      Clear search and filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p role="status" className="text-foreground/70">
          {matched === 0
            ? countLabel(0)
            : pageCount > 1
              ? `${first}–${last} of ${countLabel(matched)}`
              : countLabel(matched)}
        </p>
        {pageCount > 1 && (
          <nav aria-label={`${label} pages`} className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft aria-hidden />
              Previous
            </Button>
            <span className="text-foreground/70 tabular-nums">
              Page {pageIndex + 1} of {pageCount}
            </span>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
              <ChevronRight aria-hidden />
            </Button>
          </nav>
        )}
      </div>
    </div>
  );
}
