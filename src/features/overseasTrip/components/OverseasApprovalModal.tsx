// components/OverseasApprovalModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, User, Building, Briefcase, MapPin, DollarSign, Clock, FileText, Check, X } from 'lucide-react';
import { mockOverseasTrips, type OverseasTrip, fundingSourceLabels, statusLabels } from '../../../mock/overseasTrip';

interface OverseasApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
  onSuccess: () => void;
}

export default function OverseasApprovalModal({
  isOpen,
  onClose,
  tripId,
  onSuccess,
}: OverseasApprovalModalProps) {
  const [trip, setTrip] = useState<OverseasTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  
  const [decisionNumber, setDecisionNumber] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTrip();
    }
  }, [isOpen, tripId]);

  const fetchTrip = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundTrip = mockOverseasTrips.find(t => t.id === tripId);
    setTrip(foundTrip || null);
    
    if (foundTrip) {
      setDecisionNumber(foundTrip.decisionNumber || '');
      setDecisionDate(foundTrip.decisionDate || '');
    }
    
    setIsLoading(false);
  };

  const handleApprove = () => {
    setAction('approve');
    setErrors({});
  };

  const handleReject = () => {
    setAction('reject');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (action === 'approve') {
      if (!decisionNumber) {
        newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
      }
      if (!decisionDate) {
        newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
      }
    } else if (action === 'reject') {
      if (!rejectionReason.trim()) {
        newErrors.rejectionReason = 'Vui lòng nhập lý do từ chối';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Submit approval:', {
      tripId,
      action,
      decisionNumber,
      decisionDate,
      rejectionReason,
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const handleCancel = () => {
    setAction(null);
    setErrors({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: statusLabels.PENDING, className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-blue-100 text-blue-800' },
      'IN_PROGRESS': { label: statusLabels.IN_PROGRESS, className: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { label: statusLabels.COMPLETED, className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!trip) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không tìm thấy thông tin chuyến đi</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const isPending = trip.status === 'PENDING';
  const canApprove = isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết chuyến đi</span>
            {getStatusBadge(trip.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin nhân viên</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Họ tên</p>
                  <p className="font-medium">{trip.employeeName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phòng ban</p>
                  <p className="font-medium">{trip.departmentName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Chức vụ</p>
                  <p className="font-medium">{trip.positionName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Mã nhân viên</p>
                  <p className="font-medium">{trip.employeeCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin chuyến đi</h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Quốc gia</p>
                  <p className="font-medium">{trip.country}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Mục đích</p>
                  <p className="font-medium">{trip.purpose}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày đi dự kiến</p>
                    <p className="font-medium">{new Date(trip.plannedDepartureDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày về dự kiến</p>
                    <p className="font-medium">{new Date(trip.plannedReturnDate).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Chi phí ước tính</p>
                    <p className="font-medium">{formatCurrency(trip.estimatedCost)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nguồn tài trợ</p>
                    <p className="font-medium">{fundingSourceLabels[trip.fundingSource]}</p>
                  </div>
                </div>
              </div>
              {trip.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Ghi chú</p>
                    <p className="font-medium">{trip.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Decision Info */}
          {(trip.decisionNumber || trip.rejectionReason) && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Thông tin quyết định</h3>
              {trip.decisionNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Số quyết định</p>
                    <p className="font-medium">{trip.decisionNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày quyết định</p>
                    <p className="font-medium">
                      {trip.decisionDate && new Date(trip.decisionDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
              {trip.rejectionReason && (
                <div>
                  <p className="text-sm text-muted-foreground">Lý do từ chối</p>
                  <p className="font-medium text-red-600">{trip.rejectionReason}</p>
                </div>
              )}
              {trip.approvedByName && (
                <div>
                  <p className="text-sm text-muted-foreground">Người phê duyệt</p>
                  <p className="font-medium">{trip.approvedByName}</p>
                </div>
              )}
            </div>
          )}

          {/* Approval Form */}
          {action === 'approve' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">Phê duyệt chuyến đi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số quyết định *</Label>
                  <Input
                    value={decisionNumber}
                    onChange={(e) => setDecisionNumber(e.target.value)}
                    placeholder="QĐ-001/2024"
                    className={errors.decisionNumber ? 'border-red-500' : ''}
                  />
                  {errors.decisionNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.decisionNumber}</p>
                  )}
                </div>
                <div>
                  <Label>Ngày quyết định *</Label>
                  <Input
                    type="date"
                    value={decisionDate}
                    onChange={(e) => setDecisionDate(e.target.value)}
                    className={errors.decisionDate ? 'border-red-500' : ''}
                  />
                  {errors.decisionDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.decisionDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rejection Form */}
          {action === 'reject' && (
            <div className="space-y-4 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold">Từ chối chuyến đi</h3>
              <div>
                <Label>Lý do từ chối *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối..."
                  rows={3}
                  className={errors.rejectionReason ? 'border-red-500' : ''}
                />
                {errors.rejectionReason && (
                  <p className="text-sm text-red-500 mt-1">{errors.rejectionReason}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {!action ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              {canApprove && (
                <>
                  <Button variant="outline" onClick={handleReject} className="text-red-600 hover:text-red-700">
                    <X className="h-4 w-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button onClick={handleApprove}>
                    <Check className="h-4 w-4 mr-2" />
                    Phê duyệt
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isSubmitting ? 'Đang xử lý...' : action === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}