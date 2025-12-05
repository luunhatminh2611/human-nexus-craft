import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';

import { ChevronsUpDown, ArrowUp, ArrowDown, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePagination } from '@/shared/hooks/usePagination';
import TableSkeleton from './TableSkeleton';
import EmptyState from './EmptyState';
import TablePagination from './TablePagination';

type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  key: keyof T | string; // supports dot-paths
  header: string;
  sortable?: boolean;
  className?: string;
  
  // Optional custom renderer. If omitted, will render primitive value from key
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  emptyText?: string;
  initialSort?: { key: DataTableColumn<T>['key']; direction: SortDirection };
  onSortChange?: (sort: { key: DataTableColumn<T>['key']; direction: SortDirection }) => void;
  // Pagination (controlled or uncontrolled)
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  // Server-side pagination: if provided, component will not slice data and will use this total for footer
  serverTotalItems?: number;
  // Optional function to get unique key for each row (for better key prop)
  getRowId?: (row: T) => string | number;
  // Loading state
  isLoading?: boolean;
  // Custom empty state
  emptyState?: React.ReactNode;
  // Show skeleton instead of empty state when loading
  showSkeletonOnLoad?: boolean;
}

function getValue<T>(row: T, key: DataTableColumn<T>['key']): unknown {
  try {
    if (typeof key !== 'string') {
      // Handle symbol or number keys
      const keyStr = String(key);
      return (row as Record<string, unknown>)[keyStr];
    }
    if (!key.includes('.')) return (row as Record<string, unknown>)[key];
    return key.split('.').reduce((acc: unknown, part) => {
      if (acc === null || acc === undefined) return undefined;
      return (acc as Record<string, unknown>)[part];
    }, row as unknown);
  } catch {
    return undefined;
  }
}

function compareValues(a: unknown, b: unknown): number {
  // Both null/undefined
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  
  // Date comparison (optimized: check Date instance first)
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  
  // Try parsing as dates only if both are strings
  if (typeof a === 'string' && typeof b === 'string') {
    const aDate = Date.parse(a);
    const bDate = Date.parse(b);
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
      return aDate - bDate;
    }
  }

  // Numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  // Booleans
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b ? 0 : a ? 1 : -1;
  }

  // String fallback (most common case)
  return String(a).localeCompare(String(b), undefined, { 
    numeric: true, 
    sensitivity: 'base' 
  });
}

export default function DataTable<T>({ 
  data, 
  columns, 
  emptyText = 'Không có dữ liệu', 
  initialSort, 
  onSortChange, 
  page, 
  pageSize, 
  onPageChange, 
  onPageSizeChange, 
  pageSizeOptions = [10, 20, 50, 100], 
  serverTotalItems, 
  getRowId,
  isLoading = false,
  emptyState,
  showSkeletonOnLoad = true,
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{ key: DataTableColumn<T>['key']; direction: SortDirection } | undefined>(initialSort);

  const sortState = onSortChange ? initialSort : internalSort;

  const sortedData = useMemo(() => {
    if (!sortState) return data;
    const { key, direction } = sortState;
    const factor = direction === 'asc' ? 1 : -1;
    return [...data].sort((r1, r2) => factor * compareValues(getValue(r1, key), getValue(r2, key)));
  }, [data, sortState]);

  const totalItems = typeof serverTotalItems === 'number' ? serverTotalItems : sortedData.length;

  const pagination = usePagination({
    totalItems,
    initialPage: page,
    initialPageSize: pageSize,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
  });

  const pageData = typeof serverTotalItems === 'number' 
    ? data 
    : sortedData.slice(pagination.startIndex, pagination.endIndex);

  const handleHeaderClick = (col: DataTableColumn<T>) => {
    if (!col.sortable || isLoading) return;
    const next: { key: DataTableColumn<T>['key']; direction: SortDirection } =
      sortState && sortState.key === col.key
        ? { key: col.key, direction: sortState.direction === 'asc' ? 'desc' : 'asc' }
        : { key: col.key, direction: 'asc' };
    if (onSortChange) onSortChange(next);
    else setInternalSort(next);
  };

  const renderSortIcon = (col: DataTableColumn<T>) => {
    if (!col.sortable) return null;
    if (!sortState || sortState.key !== col.key) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />;
    return sortState.direction === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );
  };

  // Show skeleton when loading and showSkeletonOnLoad is true
  if (isLoading && showSkeletonOnLoad) {
    return <TableSkeleton columns={columns.length} rows={pageSize ?? 10} />;
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.key)}
                className={cn(
                  col.className,
                  col.sortable && !isLoading && 'cursor-pointer select-none'
                )}
                onClick={() => handleHeaderClick(col)}
                aria-sort={
                  col.sortable && !isLoading
                    ? sortState?.key === col.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                }
                role={col.sortable ? 'columnheader' : undefined}
                tabIndex={col.sortable && !isLoading ? 0 : undefined}
                onKeyDown={(e) => {
                  if (col.sortable && !isLoading && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleHeaderClick(col);
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  <span>{col.header}</span>
                  {!isLoading && renderSortIcon(col)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : pageData.length === 0 ? (
            emptyState ? (
              emptyState
            ) : (
              <EmptyState
                message={emptyText}
                icon={<Inbox className="h-8 w-8" />}
                colSpan={columns.length}
              />
            )
          ) : (
            pageData.map((row, idx) => {
              // Use getRowId if provided, otherwise try common ID fields
              const rowKey = getRowId 
                ? getRowId(row)
                : (row as Record<string, unknown>)?.id ??
                  (row as Record<string, unknown>)?._id ??
                  (row as Record<string, unknown>)?.uuid ??
                  `row-${idx}`;
              
              return (
                <TableRow key={String(rowKey)}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      {col.render ? col.render(row) : String(getValue(row, col.key) ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {!isLoading && (
        <TablePagination
          totalItems={totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          page={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.pageSize}
          pageSizeOptions={pageSizeOptions}
          isLoading={isLoading}
          setPage={pagination.setPage}
          setPageSize={pagination.setPageSize}
          goToFirstPage={pagination.goToFirstPage}
          goToLastPage={pagination.goToLastPage}
          goToNextPage={pagination.goToNextPage}
          goToPreviousPage={pagination.goToPreviousPage}
          canGoNext={pagination.canGoNext}
          canGoPrevious={pagination.canGoPrevious}
        />
      )}
    </div>
  );
}


