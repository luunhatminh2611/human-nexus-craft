import React from 'react';
import { cn } from '@/lib/utils';
import { TableCell, TableRow } from './table';

export interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  colSpan?: number;
  className?: string;
}

export default function EmptyState({
  message = 'Không có dữ liệu',
  description,
  icon,
  action,
  colSpan = 1,
  className,
}: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className={cn('text-center py-12', className)}>
        <div className="flex flex-col items-center justify-center gap-2">
          {icon && <div className="text-muted-foreground mb-2">{icon}</div>}
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
          {description && (
            <p className="text-xs text-muted-foreground/80 max-w-sm">{description}</p>
          )}
          {action && <div className="mt-4">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  );
}
