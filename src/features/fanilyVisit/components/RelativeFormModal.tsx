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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from '@/shared/hooks/use-toast';
import { familyApi, FamilyMember } from '../../employees/api/family';
import { employeeApi } from '@/features/employees/api/employeeApi';

interface RelativeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  relative?: FamilyMember | null;
  employeeId?: number;
  onSuccess: () => void;
}

const relationships = [
  'Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con',
  'Anh', 'Chị', 'Em', 'Khác',
];

interface EmployeeOption {
  id: number;
  fullName: string;
  employeeCode: string;
  departmentName?: string;
}

export default function RelativeFormModal({
  isOpen,
  onClose,
  relative,
  employeeId,
  onSuccess,
}: RelativeFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    relationship: '',
    birthday: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  // Load danh sách nhân viên
  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll()
      .then(d => setEmployees(d || []))
      .catch(console.error);
  }, [isOpen]);

  // Khởi tạo form data
  useEffect(() => {
    if (!isOpen) return;

    if (relative) {
      setFormData({
        employeeId: relative.employeeId.toString(),
        name: relative.name,
        relationship: relative.relationship,
        birthday: relative.birthday || '',
        phone: relative.phone || '',
        address: relative.address || '',
      });
    } else {
      setFormData({
        employeeId: employeeId?.toString() || '',
        name: '',
        relationship: '',
        birthday: '',
        phone: '',
        address: '',
      });
    }
    setErrors({});
  }, [isOpen, relative, employeeId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.employeeId) newErrors.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    if (!formData.relationship) newErrors.relationship = 'Vui lòng chọn quan hệ';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        relationship: formData.relationship,
        birthday: formData.birthday || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        employeeId: Number(formData.employeeId),
      };

      if (relative) {
        await familyApi.update({ ...payload, id: relative.id });
      } else {
        await familyApi.create(payload);
      }

      toast({
        title: 'Thành công',
        description: relative ? 'Đã cập nhật thông tin thân nhân' : 'Đã thêm mới thân nhân',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description: err?.response?.data?.message || 'Không thể lưu thông tin',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmployeeLocked = !!employeeId || !!relative;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {relative ? 'Chỉnh sửa quan hệ gia đình' : 'Thêm quan hệ gia đình'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nhân viên */}
          <div className="space-y-2">
            <Label>Nhân viên <span className="text-red-500">*</span></Label>
            <Select
              value={formData.employeeId}
              onValueChange={v => setFormData(p => ({ ...p, employeeId: v }))}
              disabled={isEmployeeLocked}
            >
              <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.fullName} ({emp.employeeCode}){emp.departmentName && ` – ${emp.departmentName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Họ tên */}
            <div className="space-y-2">
              <Label>Họ tên thân nhân <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Nguyễn Thị A..."
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Quan hệ */}
            <div className="space-y-2">
              <Label>Quan hệ <span className="text-red-500">*</span></Label>
              <Select
                value={formData.relationship}
                onValueChange={v => setFormData(p => ({ ...p, relationship: v }))}
              >
                <SelectTrigger className={errors.relationship ? 'border-red-500' : ''}>
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
            {/* Ngày sinh */}
            <div className="space-y-2">
              <Label>Ngày sinh</Label>
              <Input
                type="date"
                value={formData.birthday}
                onChange={e => setFormData(p => ({ ...p, birthday: e.target.value }))}
              />
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="0912345678"
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className="space-y-2">
            <Label>Địa chỉ</Label>
            <Input
              value={formData.address}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
              placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}