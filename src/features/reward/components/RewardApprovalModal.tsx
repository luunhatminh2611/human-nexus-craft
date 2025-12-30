// pages/hr/components/RewardApprovalModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  Award, 
  User, 
  Briefcase, 
  Calendar,
  DollarSign,
  FileText,
  History 
} from 'lucide-react';
import { mockRewards, type Reward, statusLabels } from '../../../mock/reward';
import { Separator } from '@/shared/components/ui/separator';

interface RewardApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardId: string | null;
  onSuccess: () => void;
  isAdmin: boolean;
}

export default function RewardApprovalModal({
  isOpen,
  onClose,
  rewardId,
  onSuccess,
  isAdmin,
}: RewardApprovalModalProps) {
  const [reward, setReward] = useState<Reward | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  // Admin approval fields
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && rewardId) {
      fetchRewardDetails();
    }
  }, [isOpen, rewardId]);

  const fetchRewardDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundReward = mockRewards.find(r => r.id === rewardId);
    if (foundReward) {
      setReward(foundReward);
      if (foundReward.decisionNumber) setDecisionNumber(foundReward.decisionNumber);
      if (foundReward.decisionDate) setDecisionDate(foundReward.decisionDate);
      if (foundReward.approvedAmount) setApprovedAmount(foundReward.approvedAmount.toString());
      if (foundReward.rejectionReason) setRejectionReason(foundReward.rejectionReason);
    }

    setIsLoading(false);
  };

  const validateApprovalForm = () => {
    const newErrors: Record<string, string> = {};

    if (!decisionNumber.trim()) {
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
    }

    if (!decisionDate) {
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    }

    if (!approvedAmount) {
      newErrors.approvedAmount = 'Vui lòng nhập mức khen thưởng';
    } else if (isNaN(Number(approvedAmount))) {
      newErrors.approvedAmount = 'Mức khen thưởng phải là số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRejectionForm = () => {
    const newErrors: Record<string, string> = {};

    if (!rejectionReason.trim()) {
      newErrors.rejectionReason = 'Vui lòng nhập lý do từ chối';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApprove = async () => {
    if (!validateApprovalForm()) {
      return;
    }

    setIsSubmitting(true);
    setAction('approve');

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Approving reward:', {
      rewardId,
      decisionNumber,
      decisionDate,
      approvedAmount: Number(approvedAmount),
      status: 'APPROVED',
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const handleReject = async () => {
    if (!validateRejectionForm()) {
      return;
    }

    setIsSubmitting(true);
    setAction('reject');

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Rejecting reward:', {
      rewardId,
      rejectionReason,
      status: 'REJECTED',
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatAmount = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  const handleAmountChange = (value: string) => {
    const number = value.replace(/\D/g, '');
    setApprovedAmount(number);
    if (errors.approvedAmount) {
      setErrors(prev => ({ ...prev, approvedAmount: '' }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PENDING': { label: statusLabels.PENDING, className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!reward) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin đề xuất khen thưởng</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  const canApprove = isAdmin && reward.status === 'PENDING';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Chi tiết đề xuất khen thưởng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status and ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Mã: {reward.id}</span>
              {getStatusBadge(reward.status)}
            </div>
            <div className="text-sm text-muted-foreground">
              Ngày đề xuất: {new Date(reward.proposedDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Employee Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Họ và tên</Label>
                <p className="font-medium">{reward.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng ban</Label>
                <p className="font-medium">{reward.departmentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Chức vụ</Label>
                <p className="font-medium">{reward.position}</p>
              </div>
            </div>
          </Card>

          {/* Reward Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Chi tiết khen thưởng
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Loại khen thưởng</Label>
                <p className="font-medium">{reward.rewardType}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Thành tích</Label>
                <p className="whitespace-pre-wrap">{reward.achievement}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Lý do khen thưởng</Label>
                <p className="whitespace-pre-wrap">{reward.reason}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Người đề xuất</Label>
                <p className="font-medium">{reward.proposedBy}</p>
              </div>
              {reward.proposedAmount && (
                <div>
                  <Label className="text-muted-foreground">Mức khen thưởng đề xuất</Label>
                  <p className="font-medium text-lg text-blue-600">
                    {formatCurrency(reward.proposedAmount)}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Decision Information (if approved) */}
          {reward.status === 'APPROVED' && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                Thông tin quyết định
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">Số quyết định</Label>
                  <p className="font-medium">{reward.decisionNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày quyết định</Label>
                  <p className="font-medium">
                    {reward.decisionDate && new Date(reward.decisionDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mức khen thưởng được duyệt</Label>
                  <p className="font-medium text-lg text-green-600">
                    {reward.approvedAmount && formatCurrency(reward.approvedAmount)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Rejection Information */}
          {reward.status === 'REJECTED' && reward.rejectionReason && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                <XCircle className="h-4 w-4" />
                Lý do từ chối
              </h3>
              <p className="whitespace-pre-wrap">{reward.rejectionReason}</p>
            </Card>
          )}

          {/* Reward History */}
          {reward.rewardHistory && reward.rewardHistory.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử khen thưởng
              </h3>
              <div className="space-y-3">
                {reward.rewardHistory.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{item.rewardType}</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Approval Form (Admin only, Pending status) */}
          {canApprove && (
            <>
              <Separator />
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-blue-700">
                  <FileText className="h-4 w-4" />
                  Phê duyệt khen thưởng
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="decisionNumber">
                        Số quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionNumber"
                        value={decisionNumber}
                        onChange={(e) => {
                          setDecisionNumber(e.target.value);
                          if (errors.decisionNumber) {
                            setErrors(prev => ({ ...prev, decisionNumber: '' }));
                          }
                        }}
                        placeholder="VD: QD-KT/2024/001"
                      />
                      {errors.decisionNumber && (
                        <p className="text-sm text-red-500">{errors.decisionNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="decisionDate">
                        Ngày quyết định <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="decisionDate"
                        type="date"
                        value={decisionDate}
                        onChange={(e) => {
                          setDecisionDate(e.target.value);
                          if (errors.decisionDate) {
                            setErrors(prev => ({ ...prev, decisionDate: '' }));
                          }
                        }}
                      />
                      {errors.decisionDate && (
                        <p className="text-sm text-red-500">{errors.decisionDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvedAmount">
                      Mức khen thưởng (VNĐ) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="approvedAmount"
                      value={formatAmount(approvedAmount)}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="Nhập số tiền"
                    />
                    {errors.approvedAmount && (
                      <p className="text-sm text-red-500">{errors.approvedAmount}</p>
                    )}
                    {approvedAmount && !errors.approvedAmount && (
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(Number(approvedAmount))}
                      </p>
                    )}
                  </div>

                  <Alert>
                    <AlertDescription>
                      Sau khi phê duyệt, quyết định khen thưởng sẽ được ghi nhận và nhân viên sẽ nhận được thông báo.
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>

              <Card className="p-4 bg-red-50 border-red-200">
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-700">
                  <XCircle className="h-4 w-4" />
                  Từ chối đề xuất
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Lý do từ chối</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value);
                      if (errors.rejectionReason) {
                        setErrors(prev => ({ ...prev, rejectionReason: '' }));
                      }
                    }}
                    placeholder="Nhập lý do từ chối đề xuất khen thưởng"
                    rows={3}
                  />
                  {errors.rejectionReason && (
                    <p className="text-sm text-red-500">{errors.rejectionReason}</p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>

          {canApprove && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
              >
                {isSubmitting && action === 'reject' ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </>
                )}
              </Button>
              <Button onClick={handleApprove} disabled={isSubmitting}>
                {isSubmitting && action === 'approve' ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Đang duyệt...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}