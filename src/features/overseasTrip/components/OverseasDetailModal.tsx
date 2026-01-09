// components/OverseasDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { 
  Calendar, 
  User, 
  Building, 
  MapPin, 
  DollarSign, 
  Clock, 
  FileText, 
  X,
  Download
} from 'lucide-react';
import { 
  mockOverseasTrips, 
  mockOverseasTripHistory,
  type OverseasTrip, 
  type OverseasTripHistory,
  fundingSourceLabels 
} from '../../../mock/overseasTrip';

interface OverseasDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string | null;
}

export default function OverseasDetailModal({
  isOpen,
  onClose,
  tripId,
}: OverseasDetailModalProps) {
  const [trip, setTrip] = useState<OverseasTrip | null>(null);
  const [history, setHistory] = useState<OverseasTripHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTripDetail();
    }
  }, [isOpen, tripId]);

  const fetchTripDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundTrip = mockOverseasTrips.find(t => t.id === tripId);
    setTrip(foundTrip || null);
    
    const tripHistory = mockOverseasTripHistory.filter(h => h.tripId === tripId);
    setHistory(tripHistory);
    
    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getFundingBadge = (fundingSource: string) => {
    const fundingConfig = {
      'COMPANY': { label: fundingSourceLabels.COMPANY, className: 'bg-blue-100 text-blue-800' },
      'PERSONAL': { label: fundingSourceLabels.PERSONAL, className: 'bg-gray-100 text-gray-800' },
      'PARTNER': { label: fundingSourceLabels.PARTNER, className: 'bg-purple-100 text-purple-800' },
    };

    const config = fundingConfig[fundingSource];
    if (!config) return null;

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getActionLabel = (action: string) => {
    const actionLabels = {
      'CREATED': 'Tạo mới',
      'UPDATED': 'Cập nhật',
      'DELETED': 'Xóa',
    };
    return actionLabels[action] || action;
  };

  const handleDownload = (filename: string) => {
    console.log('Download file:', filename);
    alert(`Đang tải xuống: ${filename}`);
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
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
            <p className="text-muted-foreground">Không tìm thấy thông tin lịch sử xuất cảnh</p>
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
            <span>Chi tiết lịch sử xuất cảnh</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Thông tin nhân viên</h3>
            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Nhân viên</p>
                  <p className="font-medium">{trip.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{trip.employeeCode}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Phòng ban - Chức vụ</p>
                  <p className="font-medium">{trip.departmentName} - {trip.positionName}</p>
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
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Nguồn tài trợ</p>
                    {getFundingBadge(trip.fundingSource)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">{trip.durationDays} ngày</p>
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

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="font-semibold">Thời gian xuất cảnh</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày xuất cảnh</p>
                  <p className="font-medium">{new Date(trip.departureDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày về</p>
                  <p className="font-medium">{new Date(trip.returnDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold">Thông tin chi phí</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Chi phí dự toán</p>
                <p className="font-medium text-lg">{formatCurrency(trip.estimatedCost)}</p>
              </div>
              {trip.actualCost && (
                <div>
                  <p className="text-sm text-muted-foreground">Chi phí thực tế</p>
                  <p className="font-medium text-lg">{formatCurrency(trip.actualCost)}</p>
                </div>
              )}
            </div>
            {trip.actualCost && trip.actualCost !== trip.estimatedCost && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-sm text-muted-foreground">Chênh lệch</p>
                <p className={`font-medium ${trip.actualCost > trip.estimatedCost ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.abs(trip.actualCost - trip.estimatedCost))}
                  {trip.actualCost > trip.estimatedCost ? ' (vượt)' : ' (tiết kiệm)'}
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          {trip.attachments && trip.attachments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Tài liệu đính kèm</h3>
              <div className="space-y-2">
                {trip.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border rounded">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{file}</p>
                        <p className="text-xs text-muted-foreground">Tài liệu đính kèm</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Tải xuống
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creation Info */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-semibold mb-3">Thông tin lưu trữ</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người tạo:</span>
                <span className="font-medium">{trip.createdByName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày tạo:</span>
                <span className="font-medium">
                  {new Date(trip.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {trip.updatedAt && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Người cập nhật:</span>
                    <span className="font-medium">{trip.updatedByName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày cập nhật:</span>
                    <span className="font-medium">
                      {new Date(trip.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Lịch sử thay đổi
              </h4>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{getActionLabel(item.action)}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.performedDate).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Bởi: {item.performedByName}
                      </p>
                      {item.notes && (
                        <p className="text-sm mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}