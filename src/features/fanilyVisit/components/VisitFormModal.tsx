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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from '@/shared/hooks/use-toast';
import familyVisitApi from '../api/familyVisitApi';
import { relationships, visitTypes } from '@/mock/familyVisitData';

interface FamilyVisitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit?: any | null;
  employeeId?: number;
  onSuccess: () => void;
}

export default function FamilyVisitFormModal({
  isOpen,
  onClose,
  visit,
  employeeId,
  onSuccess,
}: FamilyVisitFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: (employeeId || '').toString(),
    visitType: '',
    visitDate: '',
    visitPerson: '',
    relationShip: '',
    reason: '',
    giftAmount: '',
    giftDescription: '',
    notes: '',
    visitedBy: '',
    status: 'Chưa thăm',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock employees for selection
  const mockEmployees = [
    { id: 18, code: 'EMP002', fullName: 'Trần Thị Minh', department: 'Phòng Nhân sự' },
    { id: 25, code: 'EMP009', fullName: 'Lê Văn Hùng', department: 'Phòng Kinh doanh' },
    { id: 30, code: 'EMP014', fullName: 'Phạm Thị Lan', department: 'Phòng Nhân sự' },
    { id: 35, code: 'EMP019', fullName: 'Hoàng Văn Nam', department: 'Phòng Kỹ thuật' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (visit) {
        setFormData({
          employeeId: visit.employee.id.toString(),
          visitType: visit.visitType,
          visitDate: visit.visitDate,
          visitPerson: visit.visitPerson,
          relationShip: visit.relationShip,
          reason: visit.reason,
          giftAmount: visit.giftAmount.toString(),
          giftDescription: visit.giftDescription,
          notes: visit.notes || '',
          visitedBy: visit.visitedBy || '',
          status: visit.status,
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          employeeId: (employeeId?.toString() || ''),
          visitType: '',
          visitDate: today,
          visitPerson: '',
          relationShip: '',
          reason: '',
          giftAmount: '',
          giftDescription: '',
          notes: '',
          visitedBy: '',
          status: 'Chưa thăm',
        });
      }
      setErrors({});
    }
  }, [isOpen, visit, employeeId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.visitType) {
      newErrors.visitType = 'Vui lòng chọn loại thăm';
    }
    if (!formData.visitDate) {
      newErrors.visitDate = 'Vui lòng chọn ngày thăm';
    }
    if (!formData.visitPerson) {
      newErrors.visitPerson = 'Vui lòng nhập người được thăm';
    }
    if (!formData.relationShip) {
      newErrors.relationShip = 'Vui lòng chọn quan hệ';
    }
    if (!formData.reason) {
      newErrors.reason = 'Vui lòng nhập lý do';
    }
    if (!formData.giftAmount || Number(formData.giftAmount) <= 0) {
      newErrors.giftAmount = 'Vui lòng nhập số tiền hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const selectedEmployee = mockEmployees.find(
        emp => emp.id === Number(formData.employeeId)
      );

      const payload = {
        employee: {
          id: Number(formData.employeeId),
          code: selectedEmployee?.code || '',
          fullName: selectedEmployee?.fullName || '',
          department: { name: selectedEmployee?.department || '' }
        },
        visitType: formData.visitType,
        visitDate: formData.visitDate,
        visitPerson: formData.visitPerson,
        relationShip: formData.relationShip,
        reason: formData.reason,
        giftAmount: Number(formData.giftAmount),
        giftDescription: formData.giftDescription,
        notes: formData.notes,
        visitedBy: formData.visitedBy,
        status: formData.status,
      };

      if (visit) {
        await familyVisitApi.update(visit.id, payload);
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật thông tin thăm người thân',
        });
      } else {
        await familyVisitApi.create(payload);
        toast({
          title: 'Thành công',
          description: 'Đã thêm mới lượt thăm người thân',
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: visit ? 'Không thể cập nhật' : 'Không thể thêm mới',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {visit ? 'Chỉnh sửa thông tin thăm người thân' : 'Thêm lượt thăm người thân'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>
              Nhân viên <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.employeeId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, employeeId: value }))
              }
              disabled={!!employeeId || !!visit}
            >
              <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.fullName} ({emp.code}) - {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Visit Type */}
            <div className="space-y-2">
              <Label>
                Loại thăm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.visitType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, visitType: value }))
                }
              >
                <SelectTrigger className={errors.visitType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitType && (
                <p className="text-sm text-red-500">{errors.visitType}</p>
              )}
            </div>

            {/* Visit Date */}
            <div className="space-y-2">
              <Label>
                Ngày thăm <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={formData.visitDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visitDate: e.target.value }))
                }
                className={errors.visitDate ? 'border-red-500' : ''}
              />
              {errors.visitDate && (
                <p className="text-sm text-red-500">{errors.visitDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Visit Person */}
            <div className="space-y-2">
              <Label>
                Người được thăm <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.visitPerson}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visitPerson: e.target.value }))
                }
                placeholder="VD: Mẹ, Bố, Con..."
                className={errors.visitPerson ? 'border-red-500' : ''}
              />
              {errors.visitPerson && (
                <p className="text-sm text-red-500">{errors.visitPerson}</p>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <Label>
                Quan hệ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.relationShip}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, relationShip: value }))
                }
              >
                <SelectTrigger className={errors.relationShip ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {rel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relationShip && (
                <p className="text-sm text-red-500">{errors.relationShip}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>
              Lý do <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Mô tả chi tiết lý do thăm hỏi..."
              rows={3}
              className={errors.reason ? 'border-red-500' : ''}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gift Amount */}
            <div className="space-y-2">
              <Label>
                Số tiền quà tặng (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.giftAmount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, giftAmount: e.target.value }))
                }
                placeholder="3000000"
                className={errors.giftAmount ? 'border-red-500' : ''}
              />
              {errors.giftAmount && (
                <p className="text-sm text-red-500">{errors.giftAmount}</p>
              )}
            </div>

            {/* Gift Description */}
            <div className="space-y-2">
              <Label>Mô tả quà tặng</Label>
              <Input
                value={formData.giftDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    giftDescription: e.target.value,
                  }))
                }
                placeholder="VD: Tiền mặt, vòng hoa..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Visited By */}
            <div className="space-y-2">
              <Label>Người đại diện thăm</Label>
              <Input
                value={formData.visitedBy}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visitedBy: e.target.value }))
                }
                placeholder="VD: Giám đốc, Trưởng phòng..."
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
                  <SelectItem value="Đã thăm">Đã thăm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Ghi chú bổ sung (nếu có)..."
              rows={3}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : visit ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}