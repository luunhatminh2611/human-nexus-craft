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
import { Eye, TrendingUp, TrendingDown, Minus, Calendar, DollarSign, FileText } from 'lucide-react';
import { 
  mockSalaryAdjustments,
  type SalaryAdjustment,
  statusLabels,
  adjustmentTypeLabels
} from '../../../mock/salaryAdjustment';
import SalaryAdjustmentDetailModal from '../../salaryAdjustment/components/SalaryAdjustmentDetailModal';

interface SalaryAdjustmentTabProps {
  employeeId: number;
  userData?: any;
}

export default function SalaryAdjustmentTab({ employeeId, userData }: SalaryAdjustmentTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAdjustmentId, setSelectedAdjustmentId] = useState<string | null>(null);

  // Filter adjustments for this employee
  const employeeAdjustments = useMemo(() => {
    let filtered = mockSalaryAdjustments.filter(
      adj => adj.employeeId === `EMP-${String(employeeId).padStart(3, '0')}`
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(adj => adj.status === statusFilter);
    }

    // Sort by date desc
    return filtered.sort((a, b) => 
      new Date(b.proposedDate).getTime() - new Date(a.proposedDate).getTime()
    );
  }, [employeeId, statusFilter]);

  // Calculate current salary (from latest EFFECTIVE adjustment)
  const currentSalary = useMemo(() => {
    const effectiveAdjustments = employeeAdjustments.filter(
      adj => adj.status === 'EFFECTIVE'
    );
    if (effectiveAdjustments.length === 0) return null;
    
    return effectiveAdjustments[0].newSalary.totalSalary;
  }, [employeeAdjustments]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: employeeAdjustments.length,
      pending: employeeAdjustments.filter(a => a.status === 'PENDING_APPROVAL').length,
      approved: employeeAdjustments.filter(a => a.status === 'APPROVED').length,
      effective: employeeAdjustments.filter(a => a.status === 'EFFECTIVE').length,
      rejected: employeeAdjustments.filter(a => a.status === 'REJECTED').length,
    };
  }, [employeeAdjustments]);

  const handleOpenDetail = (id: string) => {
    setSelectedAdjustmentId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedAdjustmentId(null);
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

  const getIncreaseIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (amount < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Current Salary */}

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Lọc theo trạng thái:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Chờ phê duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
              <SelectItem value="EFFECTIVE">Đã có hiệu lực</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
            </SelectContent>
          </Select>
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
            <p className="text-gray-500">Chưa có lịch sử điều chỉnh lương</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày đề xuất</TableHead>
                  <TableHead>Loại điều chỉnh</TableHead>
                  <TableHead>Lương cũ</TableHead>
                  <TableHead>Lương mới</TableHead>
                  <TableHead>Thay đổi</TableHead>
                  <TableHead>Ngày hiệu lực</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeAdjustments.map((adjustment) => (
                  <TableRow key={adjustment.id}>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(adjustment.proposedDate).toLocaleDateString('vi-VN')}
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
                          <div className={`font-medium ${
                            adjustment.increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'
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
                      <span className="text-sm">
                        {new Date(adjustment.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
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

      {/* Detail Modal */}
      <SalaryAdjustmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        adjustmentId={selectedAdjustmentId}
        onSuccess={() => {}}
        isAdmin={false}
      />
    </div>
  );
}