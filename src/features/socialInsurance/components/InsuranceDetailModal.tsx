// components/InsuranceDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, FileText, Calendar, DollarSign, User, History as HistoryIcon } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { 
  mockInsuranceRecords,
  mockInsuranceChanges,
  type InsuranceRecord,
  statusLabels,
  changeTypeLabels,
  calculateInsuranceAmount
} from '../../../mock/socialInsurance';

interface InsuranceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
}

export default function InsuranceDetailModal({
  isOpen,
  onClose,
  recordId,
}: InsuranceDetailModalProps) {
  const [record, setRecord] = useState<InsuranceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && recordId) {
      fetchRecordDetail();
    }
  }, [isOpen, recordId]);

  const fetchRecordDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockInsuranceRecords.find(r => r.id === recordId);
    if (found) {
      setRecord(found);
    }

    setIsLoading(false);
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

  if (!isOpen) return null;

  if (isLoading || !record) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  const amounts = calculateInsuranceAmount(record.currentSalaryBase);
  const employeeTotal = amounts.socialInsurance.employee + 
                       amounts.healthInsurance.employee + 
                       amounts.unemploymentInsurance.employee;
  const employerTotal = amounts.socialInsurance.employer + 
                       amounts.healthInsurance.employer + 
                       amounts.unemploymentInsurance.employer;

  const changes = mockInsuranceChanges.filter(c => c.recordId === record.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết hồ sơ BHXH</h2>
            {getStatusBadge(record.status)}
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
            {/* Employee Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Thông tin nhân viên</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Họ và tên</Label>
                  <p className="font-medium">{record.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phòng ban</Label>
                  <p>{record.departmentName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Vị trí</Label>
                  <p>{record.position}</p>
                </div>
              </div>
            </div>

            {/* Insurance Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Thông tin sổ BHXH</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-blue-700">Số sổ BHXH</Label>
                  <p className="font-medium text-blue-900">{record.insuranceBookNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Mã số BHXH</Label>
                  <p className="font-medium text-blue-900">{record.insuranceCode}</p>
                </div>
              </div>
            </div>

            {/* Participation Period */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Thời gian tham gia</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm text-green-700">Ngày bắt đầu</Label>
                  <p className="font-medium text-green-900">
                    {new Date(record.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                {record.endDate && (
                  <div>
                    <Label className="text-sm text-green-700">Ngày kết thúc</Label>
                    <p className="font-medium text-green-900">
                      {new Date(record.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-green-700">Tổng tháng đã đóng</Label>
                  <p className="text-lg font-bold text-green-900">{record.totalMonthsPaid} tháng</p>
                </div>
              </div>
            </div>

            {/* Salary & Contributions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Mức đóng hiện tại</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-purple-700">Mức lương đóng BHXH</Label>
                  <p className="text-xl font-bold text-purple-900">
                    {formatCurrency(record.currentSalaryBase)}
                  </p>
                </div>

                <div className="border-t border-purple-300 pt-3">
                  <div className="grid grid-cols-4 gap-2 text-sm font-medium text-purple-900 mb-2">
                    <div>Loại bảo hiểm</div>
                    <div className="text-right">Tỷ lệ NV</div>
                    <div className="text-right">Tỷ lệ CT</div>
                    <div className="text-right">Số tiền</div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-purple-700">BHXH</div>
                      <div className="text-right">{record.rates.socialInsurance.employee}%</div>
                      <div className="text-right">{record.rates.socialInsurance.employer}%</div>
                      <div className="text-right font-medium">
                        {formatCurrency(amounts.socialInsurance.employee + amounts.socialInsurance.employer)}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-purple-700">BHYT</div>
                      <div className="text-right">{record.rates.healthInsurance.employee}%</div>
                      <div className="text-right">{record.rates.healthInsurance.employer}%</div>
                      <div className="text-right font-medium">
                        {formatCurrency(amounts.healthInsurance.employee + amounts.healthInsurance.employer)}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-purple-700">BHTN</div>
                      <div className="text-right">{record.rates.unemploymentInsurance.employee}%</div>
                      <div className="text-right">{record.rates.unemploymentInsurance.employer}%</div>
                      <div className="text-right font-medium">
                        {formatCurrency(amounts.unemploymentInsurance.employee + amounts.unemploymentInsurance.employer)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-purple-300 mt-3 pt-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-purple-700">Nhân viên phải đóng</div>
                        <div className="text-lg font-bold text-orange-600">
                          {formatCurrency(employeeTotal)}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-700">Công ty phải đóng</div>
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(employerTotal)}
                        </div>
                      </div>
                      <div>
                        <div className="text-purple-700">Tổng cộng</div>
                        <div className="text-lg font-bold text-purple-900">
                          {formatCurrency(employeeTotal + employerTotal)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change History */}
            {changes.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HistoryIcon className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold">Lịch sử thay đổi</h3>
                </div>
                <div className="space-y-3">
                  {changes.map((change) => (
                    <div key={change.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {changeTypeLabels[change.changeType]}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {new Date(change.changeDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{change.reason}</p>
                      {change.oldSalaryBase && change.newSalaryBase && (
                        <p className="text-sm text-gray-600">
                          Lương: {formatCurrency(change.oldSalaryBase)} → {formatCurrency(change.newSalaryBase)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Hiệu lực: {new Date(change.effectiveDate).toLocaleDateString('vi-VN')} | 
                        Xử lý bởi: {change.processedByName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {record.notes && (
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Ghi chú</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{record.notes}</p>
              </div>
            )}

            {/* Created Info */}
            <div className="border-t pt-4 text-sm text-gray-500">
              <p>
                Được tạo bởi <span className="font-medium">{record.createdByName}</span> vào{' '}
                {new Date(record.createdDate).toLocaleDateString('vi-VN')}
              </p>
              {record.updatedBy && (
                <p className="mt-1">
                  Cập nhật lần cuối bởi <span className="font-medium">{record.updatedByName}</span> vào{' '}
                  {record.updatedDate && new Date(record.updatedDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t bg-gray-50">
          <Button onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}