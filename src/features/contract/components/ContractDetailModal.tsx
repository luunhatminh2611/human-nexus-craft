// components/ContractDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, FileText, Calendar, DollarSign, User } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { 
  mockContracts,
  type Contract,
  statusLabels,
  contractTypeLabels,
  terminationTypeLabels,
  suspensionReasonLabels,
  getDaysUntilExpiry
} from '../../../mock/contract';

interface ContractDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string | null;
}

export default function ContractDetailModal({
  isOpen,
  onClose,
  contractId,
}: ContractDetailModalProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && contractId) {
      fetchContractDetail();
    }
  }, [isOpen, contractId]);

  const fetchContractDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const found = mockContracts.find(c => c.id === contractId);
    if (found) {
      setContract(found);
    }

    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'EXPIRING_SOON': { label: statusLabels.EXPIRING_SOON, className: 'bg-orange-100 text-orange-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-red-100 text-red-800' },
      'SUSPENDED': { label: statusLabels.SUSPENDED, className: 'bg-yellow-100 text-yellow-800' },
      'TERMINATED': { label: statusLabels.TERMINATED, className: 'bg-gray-100 text-gray-800' },
      'RENEWED': { label: statusLabels.RENEWED, className: 'bg-blue-100 text-blue-800' },
      'REPLACED': { label: statusLabels.REPLACED, className: 'bg-purple-100 text-purple-800' },
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

  if (isLoading || !contract) {
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

  const daysLeft = getDaysUntilExpiry(contract.endDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Chi tiết hợp đồng</h2>
            {getStatusBadge(contract.status)}
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
            {/* Contract Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Thông tin hợp đồng</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-blue-700">Số hợp đồng</Label>
                  <p className="font-medium text-blue-900">{contract.contractNumber}</p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Loại hợp đồng</Label>
                  <p className="text-blue-900">{contractTypeLabels[contract.contractType]}</p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Ngày ký</Label>
                  <p className="text-blue-900">{new Date(contract.signDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <Label className="text-sm text-blue-700">Số lần gia hạn</Label>
                  <p className="text-blue-900">{contract.renewalCount} lần</p>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Thông tin nhân viên</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Họ và tên</Label>
                  <p className="font-medium">{contract.employeeName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Phòng ban</Label>
                  <p>{contract.departmentName}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm text-gray-600">Vị trí</Label>
                  <p>{contract.position}</p>
                </div>
              </div>
            </div>

            {/* Duration */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Thời hạn hợp đồng</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-green-700">Ngày bắt đầu</Label>
                  <p className="font-medium text-green-900">
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-green-700">Ngày kết thúc</Label>
                  <p className="font-medium text-green-900">
                    {contract.endDate 
                      ? new Date(contract.endDate).toLocaleDateString('vi-VN')
                      : 'Không xác định'}
                  </p>
                </div>
              </div>
              {daysLeft !== null && daysLeft >= 0 && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className={`text-sm font-medium ${
                    daysLeft <= 30 ? 'text-orange-600' : 'text-green-700'
                  }`}>
                    Còn {daysLeft} ngày đến hết hạn
                  </p>
                </div>
              )}
            </div>

            {/* Salary */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Lương & Phúc lợi</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm text-purple-700">Lương cơ bản</Label>
                  <p className="text-lg font-bold text-purple-900">
                    {formatCurrency(contract.baseSalary)}
                  </p>
                </div>
                {contract.allowances && (
                  <div>
                    <Label className="text-sm text-purple-700">Phụ cấp</Label>
                    <p className="text-purple-900">{contract.allowances}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Suspension Info */}
            {contract.currentSuspension && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-3">Thông tin tạm hoãn hiện tại</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-yellow-700">Lý do</Label>
                    <p className="text-yellow-900">
                      {suspensionReasonLabels[contract.currentSuspension.reason]}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {contract.currentSuspension.reasonDetail}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-yellow-700">Thời gian</Label>
                    <p className="text-yellow-900">
                      {new Date(contract.currentSuspension.startDate).toLocaleDateString('vi-VN')} -{' '}
                      {contract.currentSuspension.endDate 
                        ? new Date(contract.currentSuspension.endDate).toLocaleDateString('vi-VN')
                        : 'Chưa xác định'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Termination Info */}
            {contract.terminationInfo && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3">Thông tin chấm dứt hợp đồng</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-red-700">Loại chấm dứt</Label>
                      <p className="font-medium text-red-900">
                        {terminationTypeLabels[contract.terminationInfo.terminationType]}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-red-700">Ngày chấm dứt</Label>
                      <p className="text-red-900">
                        {new Date(contract.terminationInfo.terminationDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-red-700">Lý do</Label>
                    <p className="text-sm text-red-900">{contract.terminationInfo.reason}</p>
                  </div>
                  {contract.terminationInfo.severancePay && (
                    <div>
                      <Label className="text-sm text-red-700">Trợ cấp thôi việc</Label>
                      <p className="font-medium text-red-900">
                        {formatCurrency(contract.terminationInfo.severancePay)}
                      </p>
                    </div>
                  )}
                  {contract.terminationInfo.notes && (
                    <div>
                      <Label className="text-sm text-red-700">Ghi chú</Label>
                      <p className="text-sm text-red-900">{contract.terminationInfo.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suspension History */}
            {contract.suspensionHistory.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Lịch sử tạm hoãn</h3>
                <div className="space-y-3">
                  {contract.suspensionHistory.map((sus) => (
                    <div key={sus.id} className="bg-gray-50 p-3 rounded border">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Lý do:</span>{' '}
                          <span className="font-medium">
                            {suspensionReasonLabels[sus.reason]}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thời gian:</span>{' '}
                          <span>
                            {new Date(sus.startDate).toLocaleDateString('vi-VN')} -{' '}
                            {sus.actualEndDate 
                              ? new Date(sus.actualEndDate).toLocaleDateString('vi-VN')
                              : sus.endDate
                              ? new Date(sus.endDate).toLocaleDateString('vi-VN')
                              : 'Đang diễn ra'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {contract.notes && (
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Ghi chú</Label>
                <p className="text-sm mt-1 whitespace-pre-wrap">{contract.notes}</p>
              </div>
            )}

            {/* Created Info */}
            <div className="border-t pt-4 text-sm text-gray-500">
              <p>
                Được tạo bởi <span className="font-medium">{contract.createdByName}</span> vào{' '}
                {new Date(contract.createdDate).toLocaleDateString('vi-VN')}
              </p>
              {contract.updatedBy && (
                <p className="mt-1">
                  Cập nhật lần cuối bởi <span className="font-medium">{contract.updatedByName}</span> vào{' '}
                  {contract.updatedDate && new Date(contract.updatedDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={() => window.open(contract.fileUrl, '_blank')}
          >
            <Download className="h-4 w-4 mr-2" />
            Tải xuống hợp đồng
          </Button>
          <Button onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}