// components/OverseasDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, MapPin, DollarSign, Clock, FileText, Download } from 'lucide-react';
import { employeeTravelApi } from '../api/overSeas';

interface OverseasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number | null;
}

const FUNDING_LABELS: Record<string, { label: string; className: string }> = {
  COMPANY:  { label: 'Công ty',  className: 'bg-blue-100 text-blue-800' },
  PERSONAL: { label: 'Cá nhân',  className: 'bg-gray-100 text-gray-800' },
  PARTNER:  { label: 'Đối tác',  className: 'bg-purple-100 text-purple-800' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OverseasDetailModal({ isOpen, onClose, tripId }: OverseasDetailModalProps) {
  const [trip, setTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !tripId) return;
    setIsLoading(true);
    employeeTravelApi.getById(tripId)
      .then(d => setTrip(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen, tripId]);

  const handleDownload = async () => {
    if (!tripId) return;
    try {
      const url = await employeeTravelApi.download(tripId);
      window.open(trip?.downloadUrl || url, '_blank');
    } catch {
      console.error('Không thể tải file');
    }
  };

  const duration = (() => {
    if (trip?.departureDate && trip?.returnDate) {
      const d = Math.floor((new Date(trip.returnDate).getTime() - new Date(trip.departureDate).getTime()) / 86400000);
      return d > 0 ? d : 0;
    }
    return 0;
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết lịch sử xuất cảnh</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : !trip ? (
          <div className="text-center py-10 text-muted-foreground">Không tìm thấy thông tin</div>
        ) : (
          <div className="space-y-5">
            {/* Quốc gia & nguồn */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Quốc gia</p>
                  <p className="font-medium">{trip.country}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Nguồn tài trợ</p>
                  {FUNDING_LABELS[trip.fundingSource] ? (
                    <Badge className={FUNDING_LABELS[trip.fundingSource].className}>
                      {FUNDING_LABELS[trip.fundingSource].label}
                    </Badge>
                  ) : (
                    <p className="font-medium">{trip.fundingSource}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Mục đích */}
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="text-xs text-muted-foreground">Mục đích chuyến đi</p>
                <p className="font-medium">{trip.travelPurpose}</p>
              </div>
            </div>

            {/* Thời gian */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày xuất cảnh</p>
                  <p className="font-medium">{new Date(trip.departureDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Ngày về</p>
                  <p className="font-medium">{new Date(trip.returnDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-xs text-muted-foreground">Số ngày</p>
                  <p className="font-medium">{duration} ngày</p>
                </div>
              </div>
            </div>

            {/* Chi phí */}
            <div className="p-4 bg-blue-50 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">Thông tin chi phí</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Chi phí dự toán</p>
                  <p className="font-semibold text-base">{formatCurrency(trip.estimatedCost)}</p>
                </div>
                {trip.actualCost != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">Chi phí thực tế</p>
                    <p className="font-semibold text-base">{formatCurrency(trip.actualCost)}</p>
                  </div>
                )}
              </div>
              {trip.actualCost != null && trip.actualCost !== trip.estimatedCost && (
                <div className="pt-2 border-t border-blue-200">
                  <p className="text-xs text-muted-foreground">Chênh lệch</p>
                  <p className={`font-medium ${trip.actualCost > trip.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(Math.abs(trip.actualCost - trip.estimatedCost))}
                    {trip.actualCost > trip.estimatedCost ? ' (vượt)' : ' (tiết kiệm)'}
                  </p>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            {trip.note && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm">{trip.note}</p>
              </div>
            )}

            {/* File đính kèm */}
            {trip.fileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{trip.fileName}</p>
                    <p className="text-xs text-muted-foreground">{trip.fileType}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Tải xuống
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}