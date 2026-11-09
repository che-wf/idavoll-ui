"use client";

import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ExpandedState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
  ChevronsDownUp,
  ChevronsUpDown,
  Columns3,
  ListFilter,
  Search,
  X,
} from "lucide-react";
import { type ElementType, type MouseEvent, type ReactNode, useId, useState } from "react";
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
  /**
   * Child rows, e.g. a video's per-platform posts. Rows with children get an expand button
   * and the toolbar gets "Expand all". Search and filters also match children, keeping the
   * parent and opening it. Pages count top-level rows only.
   */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** Screen-reader name for a row's expand button. Defaults to "Show 3 more rows". */
  subRowsLabel?: (row: TData, count: number) => string;
  /**
   * Makes rows open a page. The first cell becomes a real link (for keyboard and screen
   * readers), and clicking anywhere else on the row follows it.
   */
  getRowHref?: (row: TData) => string | undefined;
  /** Link component for getRowHref, e.g. your router's Link. It gets href, className and children. Defaults to <a>. */
  linkComponent?: ElementType;
  /** Makes rows clickable without a link. The first cell becomes a button for keyboard users. */
  onRowClick?: (row: TData) => void;
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
  getSubRows,
  subRowsLabel = (_row, count) => (count === 1 ? "Show 1 more row" : `Show ${count} more rows`),
  getRowHref,
  linkComponent: Link = "a",
  onRowClick,
  className,
}: DataTableProps<TData>) {
  const searchId = useId();
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: pageSize || Number.MAX_SAFE_INTEGER });
  const [expanded, setExpanded] = useState<ExpandedState>({});
  // While searching or filtering, open every row so matches inside children are visible.
  const searching = globalFilter !== "" || columnFilters.length > 0;

  // Filtered columns match on "one of the chosen values" unless the column says otherwise.
  const filterIds = new Set(filters.map((f) => f.column));
  const tableColumns = columns.map((c) => {
    const id = c.id ?? ("accessorKey" in c ? String(c.accessorKey) : undefined);
    return id && filterIds.has(id) && !c.filterFn ? { ...c, filterFn: oneOf as FilterFn<TData> } : c;
  });

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
      expanded: getSubRows && searching ? true : expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows,
    getExpandedRowModel: getExpandedRowModel(),
    filterFromLeafRows: true,
    paginateExpandedRows: false,
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
  // Sub-rows don't count: pages and totals are top-level rows.
  const last = Math.min(matched, first + rows.filter((r) => r.depth === 0).length - 1);
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
  const expandable = !!getSubRows && table.getCoreRowModel().rows.some((r) => r.subRows.length > 0);
  const allExpanded = table.getIsAllRowsExpanded();

  // Clicking a row follows its link, unless the click was on a control inside the row.
  const onRowClickCapture = (event: MouseEvent<HTMLTableRowElement>, original: TData, href?: string) => {
    if ((event.target as HTMLElement).closest("a, button, input, select, textarea, label, [role=checkbox]")) return;
    if (window.getSelection()?.toString()) return;
    if (href) event.currentTarget.querySelector<HTMLElement>("[data-row-link]")?.click();
    else onRowClick?.(original);
  };

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
          {expandable && (
            <Button variant="outline" size="sm" onClick={() => table.toggleAllRowsExpanded(!allExpanded)}>
              {allExpanded ? <ChevronsDownUp aria-hidden /> : <ChevronsUpDown aria-hidden />}
              {allExpanded ? "Collapse all" : "Expand all"}
            </Button>
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
              rows.map((row) => {
                const href = getRowHref?.(row.original);
                const clickable = !!href || !!onRowClick;
                const linkClass =
                  "rounded-sm text-left font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring";
                return (
                  <TableRow
                    key={row.id}
                    onClick={clickable ? (event) => onRowClickCapture(event, row.original, href) : undefined}
                    className={cn(clickable && "cursor-pointer", row.depth > 0 && "bg-muted/25")}
                  >
                    {row.getVisibleCells().map((cell, i) => {
                      const content = flexRender(cell.column.columnDef.cell, cell.getContext());
                      if (i > 0 || (!clickable && !expandable)) {
                        return (
                          <TableCell key={cell.id} className={cn("px-3", cell.column.columnDef.meta?.className)}>
                            {content}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={cell.id} className={cn("px-3", cell.column.columnDef.meta?.className)}>
                          <div className="flex items-center gap-1" style={{ paddingLeft: `${row.depth * 1.75}rem` }}>
                            {expandable &&
                              (row.getCanExpand() ? (
                                <button
                                  type="button"
                                  onClick={row.getToggleExpandedHandler()}
                                  aria-expanded={row.getIsExpanded()}
                                  aria-label={subRowsLabel(row.original, row.subRows.length)}
                                  className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                                >
                                  <ChevronRight
                                    aria-hidden
                                    className={cn(
                                      "size-4 transition-transform motion-reduce:transition-none",
                                      row.getIsExpanded() && "rotate-90",
                                    )}
                                  />
                                </button>
                              ) : (
                                row.depth === 0 && <span aria-hidden className="size-6 shrink-0" />
                              ))}
                            {href ? (
                              <Link href={href} data-row-link className={linkClass}>
                                {content}
                              </Link>
                            ) : onRowClick ? (
                              <button
                                type="button"
                                data-row-link
                                onClick={() => onRowClick(row.original)}
                                className={linkClass}
                              >
                                {content}
                              </button>
                            ) : (
                              content
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
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
