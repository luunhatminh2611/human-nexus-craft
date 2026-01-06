// pages/hr/salary/SalaryAdjustmentPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, TrendingUp, FileText } from 'lucide-react';
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
  mockSalaryAdjustments,
  type SalaryAdjustment,
  calculateSalaryStatistics,
  statusLabels,
  adjustmentTypeLabels
} from '../../../mock/salaryAdjustment';
import SalaryAdjustmentFormModal from '../components/SalaryAdjustmentFormModal';
import SalaryAdjustmentDetailModal from '../components/SalaryAdjustmentDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function SalaryAdjustmentPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [adjustments, setAdjustments] = useState<SalaryAdjustment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<SalaryAdjustment | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdjustments();
  }, [page, pageSize, searchTerm, statusFilter, typeFilter, departmentFilter, refreshKey]);

  const fetchAdjustments = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockSalaryAdjustments];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.adjustmentType === typeFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(a => a.departmentName === departmentFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.decisionNumber && a.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by proposedDate desc
    filtered.sort((a, b) => new Date(b.proposedDate).getTime() - new Date(a.proposedDate).getTime());

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setAdjustments(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (adjustment?: SalaryAdjustment) => {
    setSelectedAdjustment(adjustment || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAdjustment(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedAdjustmentId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAdjustmentId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PENDING_APPROVAL': { label: statusLabels.PENDING_APPROVAL, className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-blue-100 text-blue-800' },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800' },
      'EFFECTIVE': { label: statusLabels.EFFECTIVE, className: 'bg-green-100 text-green-800' },
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

  const stats = calculateSalaryStatistics(mockSalaryAdjustments);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = Array.from(new Set(mockSalaryAdjustments.map(a => a.departmentName)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Điều chỉnh lương</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Phê duyệt và tạo quyết định điều chỉnh lương'
              : isManager
              ? 'Đề xuất điều chỉnh lương cho nhân viên trong phòng'
              : 'Xem thông tin điều chỉnh lương'}
          </p>
        </div>
        {(isAdmin || isManager) && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            {isAdmin ? 'Tạo quyết định' : 'Đề xuất điều chỉnh'}
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, lý do hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

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

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại điều chỉnh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="ANNUAL_INCREASE">Tăng định kỳ</SelectItem>
              <SelectItem value="PROMOTION">Thăng chức</SelectItem>
              <SelectItem value="PERFORMANCE_BONUS">Theo hiệu suất</SelectItem>
              <SelectItem value="PROBATION_END">Kết thúc thử việc</SelectItem>
              <SelectItem value="OTHER">Khác</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
              <SelectItem value="EFFECTIVE">Đã có hiệu lực</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại điều chỉnh</TableHead>
                <TableHead>Lương hiện tại</TableHead>
                <TableHead>Lương mới</TableHead>
                <TableHead>Tăng/Giảm</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : adjustments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-8 w-8" />
                      <p>Không tìm thấy quyết định điều chỉnh lương nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                adjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{adjustment.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{adjustment.departmentName}</p>
                        <p className="text-xs text-muted-foreground">{adjustment.position}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{adjustmentTypeLabels[adjustment.adjustmentType]}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {formatCurrency(adjustment.currentSalary.totalSalary)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(adjustment.newSalary.totalSalary)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className={`font-medium ${
                          adjustment.increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {adjustment.increaseAmount >= 0 ? '+' : ''}{formatCurrency(adjustment.increaseAmount)}
                        </div>
                        <div className="text-muted-foreground">
                          ({adjustment.increasePercentage >= 0 ? '+' : ''}{adjustment.increasePercentage}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(adjustment.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      {adjustment.decisionNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{adjustment.decisionNumber}</div>
                          <div className="text-muted-foreground">
                            {adjustment.decisionDate && new Date(adjustment.decisionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(adjustment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {(adjustment.status === 'DRAFT' && (isManager || isAdmin)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(adjustment)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(adjustment.id)}
                          title={isAdmin && adjustment.status === 'PENDING_APPROVAL' ? "Xem và phê duyệt" : "Xem chi tiết"}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && adjustments.length > 0 && (
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

      <SalaryAdjustmentFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        adjustment={selectedAdjustment}
        onSuccess={handleFormSuccess}
        isAdmin={isAdmin}
      />

      <SalaryAdjustmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        adjustmentId={selectedAdjustmentId}
        onSuccess={handleDetailSuccess}
        isAdmin={isAdmin}
      />
    </div>
  );
}