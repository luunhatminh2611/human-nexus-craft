// pages/hr/insurance/SocialInsurancePage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, FileText } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import {
  mockInsuranceRecords,
  type InsuranceRecord,
  calculateInsuranceStatistics,
  statusLabels,
  calculateInsuranceAmount
} from '../../../mock/socialInsurance';
import InsuranceFormModal from '../components/InsuranceFormModal';
import InsuranceDetailModal from '../components/InsuranceDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function SocialInsurancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [records, setRecords] = useState<InsuranceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InsuranceRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [page, pageSize, searchTerm, statusFilter, departmentFilter, refreshKey]);

  const fetchRecords = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockInsuranceRecords];

    // Nếu không phải admin, chỉ hiển thị hồ sơ của chính user
    if (!isAdmin && user?.employeeId) {
      filtered = filtered.filter(r => r.employeeId === user.employeeId);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(r => r.departmentName === departmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.insuranceBookNumber.includes(searchTerm) ||
        r.insuranceCode.includes(searchTerm)
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setRecords(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (record?: InsuranceRecord) => {
    setSelectedRecord(record || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedRecord(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedRecordId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRecordId(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'SUSPENDED': { label: statusLabels.SUSPENDED, className: 'bg-yellow-100 text-yellow-800' },
      'TERMINATED': { label: statusLabels.TERMINATED, className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const stats = calculateInsuranceStatistics(mockInsuranceRecords);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // Get departments - nếu không phải admin chỉ lấy phòng ban của chính user
  let departments = Array.from(new Set(mockInsuranceRecords.map(r => r.departmentName)));
  if (!isAdmin && user?.employeeId) {
    const userRecords = mockInsuranceRecords.filter(r => r.employeeId === user.employeeId);
    departments = Array.from(new Set(userRecords.map(r => r.departmentName)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {isAdmin ? (
          <div>
            <h1 className="text-3xl font-bold">Quản lý Bảo hiểm xã hội</h1>
            <p className="text-muted-foreground">
              Quản lý hồ sơ BHXH, BHYT, BHTN của nhân viên
            </p>
          </div>) : (
          <div>
            <h1 className="text-3xl font-bold">Bảo hiểm xã hội của tôi</h1>
            <p className="text-muted-foreground">
              Xem các hồ sơ BHXH, BHYT, BHTN của bạn
            </p>
          </div>
        )}
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm hồ sơ BHXH
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số sổ BHXH, mã số BHXH"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isAdmin && (
            <>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  <SelectItem value="ACTIVE">Đang tham gia</SelectItem>
                  <SelectItem value="SUSPENDED">Tạm dừng</SelectItem>
                  <SelectItem value="TERMINATED">Đã dừng</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </Card>

      {/* Table - Insurance Records */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Số sổ / Mã số</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Lương đóng</TableHead>
                <TableHead>Tháng đã đóng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy hồ sơ BHXH nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  const amounts = calculateInsuranceAmount(record.currentSalaryBase);
                  const employeeTotal = amounts.socialInsurance.employee +
                    amounts.healthInsurance.employee +
                    amounts.unemploymentInsurance.employee;

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-sm text-muted-foreground">{record.departmentName}</p>
                          <p className="text-xs text-muted-foreground">{record.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{record.insuranceBookNumber}</div>
                          <div className="text-muted-foreground">{record.insuranceCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(record.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(record.currentSalaryBase)}</div>
                          <div className="text-muted-foreground">
                            NV: {formatCurrency(employeeTotal)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{record.totalMonthsPaid} tháng</span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {isAdmin && record.status !== 'TERMINATED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(record)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(record.id)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && records.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 text-sm">
                  Trang {page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <InsuranceFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        record={selectedRecord}
        onSuccess={handleFormSuccess}
      />

      <InsuranceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        recordId={selectedRecordId}
      />
    </div>
  );
}