// components/OverseasViewModal.tsx

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
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, User, Building, Briefcase, MapPin, DollarSign, Clock, FileText, AlertCircle, Save } from 'lucide-react';
import { mockOverseasTrips, type OverseasTrip, fundingSourceLabels, statusLabels } from '../../../mock/overseasTrip';

interface OverseasViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
}

export default function OverseasViewModal({
  isOpen,
  onClose,
  tripId,
}: OverseasViewModalProps) {
  const [trip, setTrip] = useState<OverseasTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [actualDepartureDate, setActualDepartureDate] = useState('');
  const [actualReturnDate, setActualReturnDate] = useState('');
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
      setActualDepartureDate(foundTrip.actualDepartureDate || '');
      setActualReturnDate(foundTrip.actualReturnDate || '');
    }
    
    setIsLoading(false);
    setIsEditing(false);
  };

  const canUpdateActualDates = trip && (trip.status === 'APPROVED' || trip.status === 'IN_PROGRESS');

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (trip) {
      setActualDepartureDate(trip.actualDepartureDate || '');
      setActualReturnDate(trip.actualReturnDate || '');
    }
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (actualDepartureDate && actualReturnDate) {
      if (new Date(actualReturnDate) <= new Date(actualDepartureDate)) {
        newErrors.actualReturnDate = 'Ngày về phải sau ngày đi';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Update actual dates:', {
      tripId,
      actualDepartureDate,
      actualReturnDate,
    });

    setIsSubmitting(false);
    setIsEditing(false);
    
    // Refresh trip data
    await fetchTrip();
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

  const calculateDuration = () => {
    if (!actualDepartureDate || !actualReturnDate) return null;
    const start = new Date(actualDepartureDate);
    const end = new Date(actualReturnDate);
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
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
          {/* Status Info */}
          {trip.status === 'PENDING' && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Đang chờ phê duyệt</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Chuyến đi của bạn đang được xem xét. Bạn sẽ nhận được thông báo khi có kết quả.
                </p>
              </div>
            </div>
          )}

          {trip.status === 'REJECTED' && trip.rejectionReason && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Chuyến đi bị từ chối</p>
                <p className="text-sm text-red-700 mt-1">
                  <strong>Lý do:</strong> {trip.rejectionReason}
                </p>
              </div>
            </div>
          )}

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

          {/* Planned Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold">Thời gian dự kiến</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày đi</p>
                  <p className="font-medium">{new Date(trip.plannedDepartureDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày về</p>
                  <p className="font-medium">{new Date(trip.plannedReturnDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actual Dates */}
          {canUpdateActualDates && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Thời gian thực tế</h3>
                {!isEditing && (
                  <Button size="sm" variant="outline" onClick={handleEdit}>
                    Cập nhật
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày xuất cảnh thực tế</Label>
                    <Input
                      type="date"
                      value={actualDepartureDate}
                      onChange={(e) => setActualDepartureDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Ngày về thực tế</Label>
                    <Input
                      type="date"
                      value={actualReturnDate}
                      onChange={(e) => setActualReturnDate(e.target.value)}
                      className={errors.actualReturnDate ? 'border-red-500' : ''}
                    />
                    {errors.actualReturnDate && (
                      <p className="text-sm text-red-500 mt-1">{errors.actualReturnDate}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày xuất cảnh</p>
                    <p className="font-medium">
                      {trip.actualDepartureDate 
                        ? new Date(trip.actualDepartureDate).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ngày về</p>
                    <p className="font-medium">
                      {trip.actualReturnDate 
                        ? new Date(trip.actualReturnDate).toLocaleDateString('vi-VN')
                        : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
              )}

              {actualDepartureDate && actualReturnDate && (
                <div className="mt-2 p-3 bg-white rounded border">
                  <p className="text-sm text-muted-foreground">Thời gian xuất cảnh</p>
                  <p className="font-medium text-lg">{calculateDuration()} ngày</p>
                </div>
              )}
            </div>
          )}

          {trip.status === 'COMPLETED' && trip.durationDays && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold mb-3">Tổng kết chuyến đi</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Thời gian thực tế</p>
                  <p className="font-medium">{trip.durationDays} ngày</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày xuất cảnh</p>
                  <p className="font-medium">
                    {trip.actualDepartureDate && new Date(trip.actualDepartureDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày về</p>
                  <p className="font-medium">
                    {trip.actualReturnDate && new Date(trip.actualReturnDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Decision Info */}
          {trip.decisionNumber && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Thông tin quyết định</h3>
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
            </div>
          )}
        </div>

        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}