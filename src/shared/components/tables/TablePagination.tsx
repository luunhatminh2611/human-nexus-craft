import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import Button from '@/shared/components/ui/button/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';

export interface TablePaginationProps {
  totalItems: number;
  startIndex: number;
  endIndex: number;
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export default function TablePagination({
  totalItems,
  startIndex,
  endIndex,
  page,
  totalPages,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  isLoading = false,
  setPage,
  setPageSize,
  goToFirstPage,
  goToLastPage,
  goToNextPage,
  goToPreviousPage,
  canGoNext,
  canGoPrevious,
}: TablePaginationProps) {

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
      <div className="text-sm text-muted-foreground">
        Hiển thị {totalItems === 0 ? 0 : startIndex + 1} - {endIndex} / {totalItems}
      </div>
      <div className="flex items-center gap-2 justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hiển thị</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
            disabled={isLoading}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => (
                <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={!canGoPrevious || isLoading}
            aria-label="Trang đầu"
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!canGoPrevious || isLoading}
            aria-label="Trang trước"
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Đi tới</span>
            <Input
              type="number"
              className="w-20"
              value={String(page)}
              min={1}
              max={totalPages}
              disabled={isLoading}
              onChange={(e) => {
                const value = e.target.value;
                if (!value || value === '') return;
                const numValue = Number(value);
                if (Number.isNaN(numValue) || numValue < 1) return;
                setPage(numValue);
              }}
              onBlur={(e) => {
                // Reset to current page if invalid input
                const value = e.target.value;
                if (!value || Number(value) < 1 || Number(value) > totalPages) {
                  e.target.value = String(page);
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!canGoNext || isLoading}
            aria-label="Trang sau"
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={!canGoNext || isLoading}
            aria-label="Trang cuối"
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
