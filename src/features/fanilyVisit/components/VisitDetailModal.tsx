import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import {
  User,
  Calendar,
  Users,
  Gift,
  FileText,
  Heart,
  X,
} from 'lucide-react';

interface FamilyVisitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: any | null;
}

export default function FamilyVisitDetailModal({
  isOpen,
  onClose,
  visit,
}: FamilyVisitDetailModalProps) {
  if (!visit) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Chi tiết thăm người thân
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-end">
            <Badge
              variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {visit.status}
            </Badge>
          </div>

          {/* Employee Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Thông tin nhân viên</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-blue-700">Mã nhân viên</Label>
                <p className="font-medium text-blue-900">{visit.employee.code}</p>
              </div>
              <div>
                <Label className="text-sm text-blue-700">Họ và tên</Label>
                <p className="font-medium text-blue-900">{visit.employee.fullName}</p>
              </div>
              <div>
                <Label className="text-sm text-blue-700">Phòng ban</Label>
                <p className="text-blue-900">
                  {visit.employee.department?.name || 'Chưa có'}
                </p>
              </div>
              <div>
                <Label className="text-sm text-blue-700">Chức vụ</Label>
                <p className="text-blue-900">
                  {visit.employee.position?.name || 'Chưa có'}
                </p>
              </div>
            </div>
          </div>

          {/* Visit Info */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Thông tin thăm hỏi</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-green-700">Loại thăm</Label>
                <p className="font-medium text-green-900">{visit.visitType}</p>
              </div>
              <div>
                <Label className="text-sm text-green-700">Ngày thăm</Label>
                <p className="font-medium text-green-900">
                  {formatDate(visit.visitDate)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-green-700">Người được thăm</Label>
                <p className="text-green-900">{visit.visitPerson}</p>
              </div>
              <div>
                <Label className="text-sm text-green-700">Quan hệ</Label>
                <p className="text-green-900">{visit.relationShip}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-sm text-green-700">Lý do</Label>
                <p className="text-green-900">{visit.reason}</p>
              </div>
            </div>
          </div>

          {/* Gift Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Quà tặng</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-purple-700">Số tiền</Label>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(visit.giftAmount)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-purple-700">Mô tả</Label>
                <p className="text-purple-900">{visit.giftDescription}</p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {visit.visitedBy && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Người đại diện</h3>
              </div>
              <p className="text-gray-900">{visit.visitedBy}</p>
            </div>
          )}

          {/* Notes */}
          {visit.notes && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <Label className="text-sm font-semibold">Ghi chú</Label>
              </div>
              <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 text-sm text-gray-500 space-y-1">
            <p>Được tạo vào {formatDate(visit.createdAt)}</p>
            <p>Cập nhật lần cuối vào {formatDate(visit.updatedAt)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}