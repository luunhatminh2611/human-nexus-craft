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

interface RelativeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  relative?: any | null;
  employeeId?: number;
  onSuccess: () => void;
}

const relationships = [
  'Cha',
  'Mẹ',
  'Vợ',
  'Chồng',
  'Con',
  'Anh',
  'Chị',
  'Em',
  'Khác',
];

// mock nhân viên
const mockEmployees = [
  { id: 1, code: 'EMP001', fullName: 'Nguyễn Văn A', department: 'Nhân sự' },
  { id: 2, code: 'EMP002', fullName: 'Trần Thị B', department: 'Kế toán' },
  { id: 3, code: 'EMP003', fullName: 'Lê Văn C', department: 'Kỹ thuật' },
];

export default function RelativeFormModal({
  isOpen,
  onClose,
  relative,
  employeeId,
  onSuccess,
}: RelativeFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    relationship: '',
    dateOfBirth: '',
    occupation: '',
    isDependent: 'false',
    phone: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (relative) {
      setFormData({
        employeeId: relative.employee.id.toString(),
        fullName: relative.fullName,
        relationship: relative.relationship,
        dateOfBirth: relative.dateOfBirth,
        occupation: relative.occupation,
        isDependent: relative.isDependent ? 'true' : 'false',
        phone: relative.phone,
        notes: relative.notes || '',
      });
    } else {
      setFormData({
        employeeId: employeeId?.toString() || '',
        fullName: '',
        relationship: '',
        dateOfBirth: '',
        occupation: '',
        isDependent: 'false',
        phone: '',
        notes: '',
      });
    }
    setErrors({});
  }, [isOpen, relative, employeeId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) newErrors.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.relationship) newErrors.relationship = 'Vui lòng chọn quan hệ';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 🔥 chỗ này sau bạn thay API
      await new Promise(res => setTimeout(res, 800));

      toast({
        title: 'Thành công',
        description: relative
          ? 'Đã cập nhật thông tin thân nhân'
          : 'Đã thêm mới thân nhân',
      });

      onSuccess();
      onClose();
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu thông tin',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {relative ? 'Chỉnh sửa thân nhân' : 'Thêm thân nhân nhân viên'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nhân viên */}
          <div className="space-y-2">
            <Label>Nhân viên <span className="text-red-500">*</span></Label>
            <Select
              value={formData.employeeId}
              onValueChange={(v) => setFormData(p => ({ ...p, employeeId: v }))}
              disabled={!!employeeId || !!relative}
            >
              <SelectTrigger className={errors.employeeId && 'border-red-500'}>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.fullName} ({emp.code}) – {emp.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ tên thân nhân *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                className={errors.fullName && 'border-red-500'}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <Label>Quan hệ *</Label>
              <Select
                value={formData.relationship}
                onValueChange={(v) => setFormData(p => ({ ...p, relationship: v }))}
              >
                <SelectTrigger className={errors.relationship && 'border-red-500'}>
                  <SelectValue placeholder="Chọn quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.relationship && <p className="text-sm text-red-500">{errors.relationship}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Nghề nghiệp</Label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData(p => ({ ...p, occupation: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Người phụ thuộc</Label>
              <Select
                value={formData.isDependent}
                onValueChange={(v) => setFormData(p => ({ ...p, isDependent: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Có</SelectItem>
                  <SelectItem value="false">Không</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : relative ? 'Xác nhận' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
