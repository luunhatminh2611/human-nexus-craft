// components/SalaryAdjustmentDetailModal.tsx

import { useState, useEffect } from 'react';
import { X, Download, FileText, TrendingUp, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
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
  isAdmin: boolean;
}

export default function SalaryAdjustmentDetailModal({
  isOpen,
  onClose,
  adjustmentId,
  onSuccess,
  isAdmin,
}: SalaryAdjustmentDetailModalProps) {
  const [adjustment, setAdjustment] = useState<SalaryAdjustment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'approval'>('info');
  
  // For approval
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setDecisionNumber(found.decisionNumber || '');
      setDecisionDate(found.decisionDate || new Date().toISOString().split('T')[0]);
      setApprovalNote(found.approvalNote || '');
      setRejectedReason(found.rejectedReason || '');
    }

    setIsLoading(false);
  };

  const handleApprove = async () => {
    if (!decisionNumber.trim()) {
      alert('Vui lòng nhập số quyết định');
      return;
    }
    if (!decisionDate) {
      alert('Vui lòng chọn ngày quyết định');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Approve adjustment:', {
      adjustmentId,
      decisionNumber,
      decisionDate,
      approvalNote,
    });

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  const handleReject = async () => {
    if (!rejectedReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Reject adjustment:', {
      adjustmentId,
      rejectedReason,
    });

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800', icon: FileText },
      'PENDING_APPROVAL': { label: statusLabels.PENDING_APPROVAL, className: 'bg-yellow-100 text-yellow-800', icon: FileText },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800', icon: XCircle },
      'EFFECTIVE': { label: statusLabels.EFFECTIVE, className: 'bg-green-100 text-green-800', icon: CheckCircle },
    };

    const config = statusConfig[status] || { label: status, className: '', icon: FileText };
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
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

  const canApprove = isAdmin && adjustment.status === 'PENDING_APPROVAL';

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

        {/* Tabs */}
        <div className="flex border-b px-6">
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin quyết định
          </button>
          {(canApprove || adjustment.status === 'APPROVED' || adjustment.status === 'EFFECTIVE' || adjustment.status === 'REJECTED') && (
            <button
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'approval'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('approval')}
            >
              Phê duyệt
              {adjustment.decisionNumber && (
                <Badge className="ml-2 bg-green-100 text-green-800">Đã có QĐ</Badge>
              )}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'info' ? (
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
                    <p className="font-medium">{adjustment.employeeName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Phòng ban</Label>
                    <p>{adjustment.departmentName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Vị trí hiện tại</Label>
                    <p>{adjustment.currentPosition}</p>
                  </div>
                  {adjustment.newPosition && (
                    <div>
                      <Label className="text-sm text-gray-600">Vị trí mới</Label>
                      <p className="font-medium text-blue-600">{adjustment.newPosition}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Adjustment Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                  <div>
                    <Label className="text-sm text-blue-700">Ngày đề xuất</Label>
                    <p className="text-blue-900">
                      {new Date(adjustment.proposedDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary Comparison */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
              </div>

              {/* Reason */}
              <div className="border border-gray-200 rounded-lg p-4">
                <Label className="text-sm text-gray-600">Lý do điều chỉnh</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{adjustment.reason}</p>
              </div>

              {/* Performance Note */}
              {adjustment.performanceNote && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <Label className="text-sm text-gray-600">Ghi chú về hiệu suất</Label>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{adjustment.performanceNote}</p>
                </div>
              )}

              {/* Attachments */}
              {adjustment.attachments.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <Label className="text-sm text-gray-600 mb-2 block">Tài liệu đính kèm</Label>
                  <div className="space-y-2">
                    {adjustment.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{file}</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Decision Info (if has) */}
              {adjustment.decisionNumber && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-3">Thông tin quyết định</h3>
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
                </div>
              )}

              {/* Proposed By */}
              <div className="border-t pt-4 text-sm text-gray-500">
                <p>
                  Được đề xuất bởi <span className="font-medium">{adjustment.proposedByName}</span> vào{' '}
                  {new Date(adjustment.proposedDate).toLocaleDateString('vi-VN')}
                </p>
                {adjustment.approvedBy && (
                  <p className="mt-1">
                    Được phê duyệt bởi <span className="font-medium">{adjustment.approvedByName}</span> vào{' '}
                    {adjustment.approvedDate && new Date(adjustment.approvedDate).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
          ) : (
            // Approval Tab
            <div className="space-y-6">
              {adjustment.status === 'PENDING_APPROVAL' && isAdmin ? (
                // Approval Form
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Quyết định phê duyệt</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Vui lòng xem xét và phê duyệt/từ chối quyết định điều chỉnh lương này
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="decisionNumber">
                        Số quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionNumber"
                        value={decisionNumber}
                        onChange={(e) => setDecisionNumber(e.target.value)}
                        placeholder="VD: QĐ-TL-2025-001"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="decisionDate">
                        Ngày quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionDate"
                        type="date"
                        value={decisionDate}
                        onChange={(e) => setDecisionDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvalNote">Ghi chú phê duyệt</Label>
                    <Textarea
                      id="approvalNote"
                      value={approvalNote}
                      onChange={(e) => setApprovalNote(e.target.value)}
                      placeholder="Ghi chú về quyết định phê duyệt..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rejectedReason">Lý do từ chối (nếu từ chối)</Label>
                    <Textarea
                      id="rejectedReason"
                      value={rejectedReason}
                      onChange={(e) => setRejectedReason(e.target.value)}
                      placeholder="Nhập lý do từ chối nếu không phê duyệt..."
                      rows={3}
                    />
                  </div>
                </div>
              ) : adjustment.status === 'APPROVED' || adjustment.status === 'EFFECTIVE' ? (
                // Approved Info
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Đã phê duyệt
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-sm text-green-700">Số quyết định</Label>
                        <p className="font-medium text-green-900">{adjustment.decisionNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-green-700">Ngày quyết định</Label>
                        <p className="text-green-900">
                          {adjustment.decisionDate && new Date(adjustment.decisionDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-green-700">Người phê duyệt</Label>
                        <p className="text-green-900">{adjustment.approvedByName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-green-700">Ngày phê duyệt</Label>
                        <p className="text-green-900">
                          {adjustment.approvedDate && new Date(adjustment.approvedDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    {adjustment.approvalNote && (
                      <div>
                        <Label className="text-sm text-green-700">Ghi chú phê duyệt</Label>
                        <p className="text-sm text-green-900 mt-1">{adjustment.approvalNote}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : adjustment.status === 'REJECTED' ? (
                // Rejected Info
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Đã từ chối
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-sm text-red-700">Người từ chối</Label>
                        <p className="text-red-900">{adjustment.approvedByName}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-red-700">Ngày từ chối</Label>
                        <p className="text-red-900">
                          {adjustment.approvedDate && new Date(adjustment.approvedDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    {adjustment.rejectedReason && (
                      <div>
                        <Label className="text-sm text-red-700">Lý do từ chối</Label>
                        <p className="text-sm text-red-900 mt-1 whitespace-pre-wrap">
                          {adjustment.rejectedReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Đóng
          </Button>

          {canApprove && activeTab === 'approval' && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isSubmitting}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Đang xử lý...' : 'Phê duyệt'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}