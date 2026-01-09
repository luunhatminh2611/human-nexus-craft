// components/SalaryAdjustmentTab.tsx

import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Eye, TrendingUp, TrendingDown, Minus, DollarSign, Search, Plus } from 'lucide-react';
import {
  mockSalaryAdjustments,
  type SalaryAdjustment,
  statusLabels,
  adjustmentTypeLabels
} from '../../../mock/salaryAdjustment';
import SalaryAdjustmentDetailModal from '../../salaryAdjustment/components/SalaryAdjustmentDetailModal';
import { Input } from '@/shared/components/ui/input';
import SalaryAdjustmentFormModal from '@/features/salaryAdjustment/components/SalaryAdjustmentFormModal';

interface SalaryAdjustmentTabProps {
  employeeId: number;
  userData?: any;
}

export default function SalaryAdjustmentTab({ employeeId, userData }: SalaryAdjustmentTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<SalaryAdjustment | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter adjustments for this employee
  const employeeAdjustments = useMemo(() => {
    let filtered = mockSalaryAdjustments.filter(
      adj => adj.employeeId === `EMP-${String(employeeId).padStart(3, '0')}`
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(adj => adj.status === statusFilter);
    }

    // Sort by created date desc
    return filtered.sort((a, b) =>
      new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );
  }, [employeeId, statusFilter]);

  // Calculate current salary (from latest ACTIVE adjustment)
  const currentSalaryInfo = useMemo(() => {
    const activeAdjustments = mockSalaryAdjustments.filter(
      adj => adj.employeeId === `EMP-${String(employeeId).padStart(3, '0')}` &&
        adj.status === 'ACTIVE'
    ).sort((a, b) =>
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
    );

    if (activeAdjustments.length === 0) return null;

    return {
      totalSalary: activeAdjustments[0].newSalary.totalSalary,
      effectiveDate: activeAdjustments[0].effectiveDate,
      decisionNumber: activeAdjustments[0].decisionNumber,
    };
  }, [employeeId]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: employeeAdjustments.length,
      draft: employeeAdjustments.filter(a => a.status === 'DRAFT').length,
      active: employeeAdjustments.filter(a => a.status === 'ACTIVE').length,
      expired: employeeAdjustments.filter(a => a.status === 'EXPIRED').length,
    };
  }, [employeeAdjustments]);

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetail = (id: string) => {
    setSelectedAdjustmentId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedAdjustmentId(null);
  };


  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAdjustment(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-gray-100 text-gray-600' },
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

  const getIncreaseIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (amount < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const handleOpenFormModal = (adjustment?: SalaryAdjustment) => {
    setSelectedAdjustment(adjustment || null);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên hoặc số quyết định"
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="DRAFT">Bản nháp</SelectItem>
              <SelectItem value="ACTIVE">Đang hiệu lực</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo quyết định điều chỉnh
          </Button>
        </div>
      </Card>

      {/* History Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Lịch sử điều chỉnh lương</h3>
        </div>
        {employeeAdjustments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {statusFilter === 'ALL'
                ? 'Chưa có lịch sử điều chỉnh lương'
                : `Không có điều chỉnh lương ở trạng thái "${statusLabels[statusFilter]}"`
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Loại điều chỉnh</TableHead>
                  <TableHead>Lương cũ</TableHead>
                  <TableHead>Lương mới</TableHead>
                  <TableHead>Thay đổi</TableHead>
                  <TableHead>Ngày hiệu lực</TableHead>
                  <TableHead>Số QĐ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(adjustment.createdDate).toLocaleDateString('vi-VN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {adjustmentTypeLabels[adjustment.adjustmentType]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatCurrency(adjustment.currentSalary.totalSalary)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-blue-600">
                        {formatCurrency(adjustment.newSalary.totalSalary)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getIncreaseIcon(adjustment.increaseAmount)}
                        <div className="text-sm">
                          <div className={`font-medium ${adjustment.increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {adjustment.increaseAmount >= 0 ? '+' : ''}
                            {formatCurrency(adjustment.increaseAmount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ({adjustment.increasePercentage >= 0 ? '+' : ''}
                            {adjustment.increasePercentage}%)
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {new Date(adjustment.effectiveDate).toLocaleDateString('vi-VN')}
                        </div>
                        {adjustment.expiryDate && (
                          <div className="text-xs text-muted-foreground">
                            → {new Date(adjustment.expiryDate).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {adjustment.decisionNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{adjustment.decisionNumber}</div>
                          <div className="text-xs text-muted-foreground">
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
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(adjustment.id)}
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <SalaryAdjustmentFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        adjustment={selectedAdjustment}
        onSuccess={handleFormSuccess}
      />

      {/* Detail Modal */}
      <SalaryAdjustmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        adjustmentId={selectedAdjustmentId}
        onSuccess={() => { }}
      />
    </div>
  );
}