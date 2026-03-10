import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { Calendar, Gift, FileText, Heart, Users, X } from 'lucide-react';
import { EmployeeVisit } from '../api/familyVisitApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visit: EmployeeVisit | null;
}

export default function FamilyVisitDetailModal({ isOpen, onClose, visit }: Props) {
  if (!visit) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Chi tiết thăm người thân
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex justify-end">
            <Badge variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'} className="text-sm">
              {visit.status}
            </Badge>
          </div>

          {/* Thông tin thăm hỏi */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Thông tin thăm hỏi</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-green-700">Loại thăm</Label>
                <p className="font-medium text-green-900">{visit.visitType}</p>
              </div>
              <div>
                <Label className="text-xs text-green-700">Ngày thăm</Label>
                <p className="font-medium text-green-900">{formatDate(visit.visitDate)}</p>
              </div>
              <div>
                <Label className="text-xs text-green-700">Người được thăm</Label>
                <p className="text-green-900">{visit.visitedPerson}</p>
              </div>
              <div>
                <Label className="text-xs text-green-700">Quan hệ</Label>
                <p className="text-green-900">{visit.relationship}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-green-700">Lý do</Label>
                <p className="text-green-900">{visit.reason}</p>
              </div>
            </div>
          </div>

          {/* Quà tặng */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Quà tặng</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs text-purple-700">Số tiền</Label>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(visit.giftAmount)}</p>
              </div>
              <div>
                <Label className="text-xs text-purple-700">Mô tả</Label>
                <p className="text-purple-900">{visit.giftDescription || '—'}</p>
              </div>
            </div>
          </div>

          {/* Người đại diện */}
          {visit.representative && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Người đại diện</h3>
              </div>
              <p className="text-sm text-gray-900">{visit.representative}</p>
            </div>
          )}

          {/* Ghi chú */}
          {visit.note && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <Label className="text-sm font-semibold">Ghi chú</Label>
              </div>
              <p className="text-sm whitespace-pre-wrap">{visit.note}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}