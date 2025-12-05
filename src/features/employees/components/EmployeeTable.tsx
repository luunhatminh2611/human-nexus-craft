import { Badge } from '@/shared/components/ui/badge';
import DataTable, { DataTableColumn } from '@/shared/components/tables/DataTable';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';

export default function EmployeeTable({
  employees,
  onView,
  onEdit,
  onDelete
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      key: 'code',
      header: 'Mã NV',
      sortable: true,
      render: (employee) => (
        <span className="font-medium text-primary">{employee.employeeCode}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Nhân viên',
      sortable: true,
      render: (employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {employee.fullName?.charAt(0).toUpperCase() || 'N'}
            </span>
          </div>
          <div>
            <p className="font-medium">{employee.fullName}</p>
            <p className="text-sm text-muted-foreground">
              {employee.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'position',
      header: 'Chức vụ',
      sortable: true,
      render: (employee) => (
        <div>
          <p className="font-medium">{employee.positionName || '-'}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Phòng ban',
      sortable: true,
      render: (employee) => (
        <div>
          <p className="font-medium">{employee.departmentName || '-'}</p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Ngày vào làm',
      sortable: true,
      render: (employee) => (
        <span className="text-sm">
          {employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (employee) => (
        <div className="flex gap-1">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(employee.id!)}
              title="Xem chi tiết"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(employee.id!)}
              title="Xóa"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={employees}
      columns={columns}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}