import { Badge } from '@/shared/components/ui/badge';
import DataTable from '@/shared/components/tables/DataTable';
import { Shield, Edit, Trash2, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onManageRole,
  onToggleStatus,
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    {
      key: 'username',
      header: 'Tên đăng nhập',
      sortable: true,
      render: (user) => (
        <span className="font-medium text-primary">{user.username}</span>
      ),
    },
    {
      key: 'fullName',
      header: 'Người dùng',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{
              backgroundColor: `hsl(${(user.username?.charCodeAt(0) || 0) * 137.508 % 360}, 70%, 50%)`
            }}
          >
            <span className="text-sm">
              {user.fullName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium">{user.fullName || '-'}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Điện thoại',
      sortable: true,
      render: (user) => (
        <span className="text-sm">{user.phone || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      sortable: true,
      render: (user) => {
        const isActive = user.status === 'Inactive';

        return (
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={`flex items-center gap-1 w-fit ${isActive
              ? 'bg-red-100 text-red-800 hover:bg-red-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
          >
            {isActive ? (
              <>
                <XCircle className="h-3 w-3" />
                Không hoạt động
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" />
                Hoạt động
              </>
            )}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'flex justify-center',
      render: (user) => (
        <div className="flex gap-1">
          {onManageRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManageRole(user)}
              title="Phân quyền"
              className="hover:bg-blue-50 text-blue-600"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user.id)}
              title="Chỉnh sửa"
              className="hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onToggleStatus && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(user)}
              title={user.status === 'Active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
              className={
                user.status === 'Active'
                  ? 'hover:bg-red-50 text-red-600'
                  : 'hover:bg-green-50 text-green-600'
              }
            >
              {user.status === 'Active' ? (
                <Ban className="h-4 w-4" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      pageSizeOptions={[10, 20, 50, 100]}
    />
  );
}