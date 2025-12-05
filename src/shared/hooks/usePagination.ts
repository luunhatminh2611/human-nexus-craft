import { useState, useMemo, useCallback } from 'react';

export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePagination({
  totalItems,
  initialPage,
  initialPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: UsePaginationProps): UsePaginationReturn {
  const [internalPage, setInternalPage] = useState(initialPage ?? 1);
  const [internalPageSize, setInternalPageSize] = useState(
    initialPageSize ?? (pageSizeOptions[0] ?? 10)
  );

  // Use controlled or uncontrolled state
  const page = initialPage !== undefined ? initialPage : internalPage;
  const pageSize = initialPageSize !== undefined ? initialPageSize : internalPageSize;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize))),
    [totalItems, pageSize]
  );

  const safePage = useMemo(
    () => Math.min(Math.max(1, page), totalPages),
    [page, totalPages]
  );

  const startIndex = useMemo(
    () => (safePage - 1) * pageSize,
    [safePage, pageSize]
  );

  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize, totalItems),
    [startIndex, pageSize, totalItems]
  );

  const setPage = useCallback(
    (newPage: number) => {
      const clampedPage = Math.max(1, Math.min(totalPages, newPage));
      if (onPageChange) {
        onPageChange(clampedPage);
      } else {
        setInternalPage(clampedPage);
      }
    },
    [totalPages, onPageChange]
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      const validSize = pageSizeOptions.includes(newSize) ? newSize : pageSizeOptions[0] ?? 10;
      if (onPageSizeChange) {
        onPageSizeChange(validSize);
      } else {
        setInternalPageSize(validSize);
      }
      // Reset to page 1 when changing page size
      setPage(1);
    },
    [pageSizeOptions, onPageSizeChange, setPage]
  );

  const goToFirstPage = useCallback(() => setPage(1), [setPage]);
  const goToLastPage = useCallback(() => setPage(totalPages), [setPage, totalPages]);
  const goToNextPage = useCallback(() => setPage(safePage + 1), [setPage, safePage]);
  const goToPreviousPage = useCallback(() => setPage(safePage - 1), [setPage, safePage]);

  const canGoNext = safePage < totalPages;
  const canGoPrevious = safePage > 1;

  return {
    page: safePage,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    setPageSize,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    canGoNext,
    canGoPrevious,
  };
}
