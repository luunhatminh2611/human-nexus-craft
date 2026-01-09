// components/SalaryAdjustmentDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, FileText, TrendingUp, User, Calendar, Eye as EyeIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  mockSalaryAdjustments,
  type SalaryAdjustment,
  statusLabels,
  adjustmentTypeLabels
} from '../../../mock/salaryAdjustment';

interface SalaryAdjustmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustmentId: string | null;
  onSuccess: () => void;
}

export default function SalaryAdjustmentDetailModal({
  isOpen,
  onClose,
  adjustmentId,
  onSuccess,
}: SalaryAdjustmentDetailModalProps) {
  const [adjustment, setAdjustment] = useState<SalaryAdjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && adjustmentId) {
      fetchAdjustmentDetail();
    }
  }, [isOpen, adjustmentId]);

  const fetchAdjustmentDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockSalaryAdjustments.find(a => a.id === adjustmentId);
    if (found) {
      setAdjustment(found);
    }

    setIsLoading(false);
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

  if (!isOpen) return null;

  if (isLoading || !adjustment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết quyết định điều chỉnh lương</h2>
            {getStatusBadge(adjustment.status)}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Status Info */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Mã: {adjustment.id}</span>
              <div className="text-sm text-muted-foreground">
                Ngày tạo: {new Date(adjustment.createdDate).toLocaleDateString('vi-VN')}
              </div>
            </div>

            {/* Employee Info */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Thông tin nhân viên</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Họ và tên</Label>
                  <p className="font-medium">{adjustment.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phòng ban</Label>
                  <p>{adjustment.departmentName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Chức vụ hiện tại</Label>
                  <p>{adjustment.currentPosition}</p>
                </div>
                {adjustment.newPosition && (
                  <div>
                    <Label className="text-sm text-gray-600">Chức vụ mới</Label>
                    <p className="font-medium text-blue-600">{adjustment.newPosition}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Adjustment Info */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Thông tin điều chỉnh</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-blue-700">Loại điều chỉnh</Label>
                  <p className="font-medium text-blue-900">
                    {adjustmentTypeLabels[adjustment.adjustmentType]}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Ngày có hiệu lực</Label>
                  <p className="text-blue-900">
                    {new Date(adjustment.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {adjustment.expiryDate && (
                  <div>
                    <Label className="text-sm text-blue-700">Ngày hết hiệu lực</Label>
                    <p className="text-blue-900">
                      {new Date(adjustment.expiryDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Salary Comparison */}
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">So sánh lương</h3>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-4">
                {/* Current Salary */}
                <div>
                  <h4 className="font-medium mb-2 text-gray-700">Lương hiện tại</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lương cơ bản:</span>
                      <span className="font-medium">{formatCurrency(adjustment.currentSalary.baseSalary)}</span>
                    </div>
                    {adjustment.currentSalary.allowances?.position && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC chức vụ:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.position)}</span>
                      </div>
                    )}
                    {adjustment.currentSalary.allowances?.responsibility && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC trách nhiệm:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.responsibility)}</span>
                      </div>
                    )}
                    {adjustment.currentSalary.allowances?.transportation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC xăng xe:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.transportation)}</span>
                      </div>
                    )}
                    {adjustment.currentSalary.allowances?.lunch && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC ăn trưa:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.lunch)}</span>
                      </div>
                    )}
                    {adjustment.currentSalary.allowances?.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC điện thoại:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.phone)}</span>
                      </div>
                    )}
                    {adjustment.currentSalary.allowances?.other && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC khác:</span>
                        <span>{formatCurrency(adjustment.currentSalary.allowances.other)}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span className="text-gray-700">Tổng cộng:</span>
                      <span>{formatCurrency(adjustment.currentSalary.totalSalary)}</span>
                    </div>
                  </div>
                </div>

                {/* New Salary */}
                <div>
                  <h4 className="font-medium mb-2 text-blue-700">Lương mới</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lương cơ bản:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(adjustment.newSalary.baseSalary)}
                      </span>
                    </div>
                    {adjustment.newSalary.allowances?.position && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC chức vụ:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.position)}
                        </span>
                      </div>
                    )}
                    {adjustment.newSalary.allowances?.responsibility && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC trách nhiệm:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.responsibility)}
                        </span>
                      </div>
                    )}
                    {adjustment.newSalary.allowances?.transportation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC xăng xe:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.transportation)}
                        </span>
                      </div>
                    )}
                    {adjustment.newSalary.allowances?.lunch && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC ăn trưa:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.lunch)}
                        </span>
                      </div>
                    )}
                    {adjustment.newSalary.allowances?.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC điện thoại:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.phone)}
                        </span>
                      </div>
                    )}
                    {adjustment.newSalary.allowances?.other && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PC khác:</span>
                        <span className="text-blue-600">
                          {formatCurrency(adjustment.newSalary.allowances.other)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span className="text-gray-700">Tổng cộng:</span>
                      <span className="text-blue-700">
                        {formatCurrency(adjustment.newSalary.totalSalary)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Increase Summary */}
              <div className="bg-white border border-green-300 rounded p-3">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-green-700">Số tiền tăng/giảm</div>
                    <div className={`text-xl font-bold ${
                      adjustment.increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustment.increaseAmount >= 0 ? '+' : ''}{formatCurrency(adjustment.increaseAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Tỷ lệ</div>
                    <div className={`text-xl font-bold ${
                      adjustment.increasePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {adjustment.increasePercentage >= 0 ? '+' : ''}{adjustment.increasePercentage}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Lương mới</div>
                    <div className="text-xl font-bold text-green-900">
                      {formatCurrency(adjustment.newSalary.totalSalary)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reason */}
            <Card className="p-4">
              <Label className="text-sm text-gray-600">Lý do điều chỉnh</Label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{adjustment.reason}</p>
            </Card>

            {/* Performance Note */}
            {adjustment.performanceNote && (
              <Card className="p-4">
                <Label className="text-sm text-gray-600">Ghi chú về hiệu suất</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{adjustment.performanceNote}</p>
              </Card>
            )}

            {/* Notes */}
            {adjustment.notes && (
              <Card className="p-4">
                <Label className="text-sm text-gray-600">Ghi chú khác</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{adjustment.notes}</p>
              </Card>
            )}

            {/* Decision Info */}
            {adjustment.decisionNumber && (
              <Card className="p-4 bg-purple-50 border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Thông tin quyết định
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm text-purple-700">Số quyết định</Label>
                    <p className="font-medium text-purple-900">{adjustment.decisionNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-purple-700">Ngày quyết định</Label>
                    <p className="text-purple-900">
                      {adjustment.decisionDate && new Date(adjustment.decisionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Attachments */}
            {adjustment.attachments.length > 0 && (
              <Card className="p-4">
                <Label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Tài liệu đính kèm
                </Label>
                <div className="space-y-2">
                  {adjustment.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 border rounded hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" title="Xem file">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Tải xuống">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Creator Info */}
            <div className="border-t pt-4 text-sm text-gray-500">
              <p>
                Được tạo bởi <span className="font-medium">{adjustment.createdByName}</span> vào{' '}
                {new Date(adjustment.createdDate).toLocaleDateString('vi-VN')}
              </p>
              {adjustment.updatedBy && (
                <p className="mt-1">
                  Cập nhật lần cuối bởi <span className="font-medium">{adjustment.updatedByName}</span> vào{' '}
                  {adjustment.updatedDate && new Date(adjustment.updatedDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>

            {/* Status Alert */}
            {adjustment.status === 'EXPIRED' && (
              <Alert>
                <AlertDescription>
                  Quyết định này đã hết hiệu lực vào {adjustment.expiryDate && new Date(adjustment.expiryDate).toLocaleDateString('vi-VN')}
                </AlertDescription>
              </Alert>
            )}

            {adjustment.status === 'DRAFT' && (
              <Alert>
                <AlertDescription>
                  Đây là bản nháp. Vui lòng hoàn thiện thông tin và cập nhật để kích hoạt quyết định.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}