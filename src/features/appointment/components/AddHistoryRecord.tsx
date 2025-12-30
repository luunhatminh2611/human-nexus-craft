// pages/hr/components/AddHistoryRecordModal.tsx

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { X, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface AddHistoryRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddHistoryRecordModal({
  isOpen,
  onClose,
  onSuccess,
}: AddHistoryRecordModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    type: 'APPOINTMENT' as 'APPOINTMENT' | 'TERMINATION',
    employeeId: '',
    employeeName: '',
    position: '',
    department: '',
    decisionNumber: '',
    decisionDate: '',
    effectiveDate: '',
    endDate: '',
    reason: '',
    note: '',
    salary: '',
    allowance: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Vui lòng nhập mã nhân viên';
    }

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Vui lòng nhập chức vụ';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Vui lòng nhập phòng ban';
    }

    if (!formData.decisionNumber.trim()) {
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
    }

    if (!formData.decisionDate) {
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Vui lòng chọn ngày có hiệu lực';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do';
    }

    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Lương phải là số';
    }

    if (formData.allowance && isNaN(Number(formData.allowance))) {
      newErrors.allowance = 'Phụ cấp phải là số';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Adding history record:', {
      ...formData,
      salary: formData.salary ? Number(formData.salary) : undefined,
      allowance: formData.allowance ? Number(formData.allowance) : undefined,
      endDate: formData.endDate || null,
      createdBy: user?.name || 'Admin',
      createdAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    resetForm();
    onSuccess();
  };

  const resetForm = () => {
    setFormData({
      type: 'APPOINTMENT',
      employeeId: '',
      employeeName: '',
      position: '',
      department: '',
      decisionNumber: '',
      decisionDate: '',
      effectiveDate: '',
      endDate: '',
      reason: '',
      note: '',
      salary: '',
      allowance: '',
    });
    setErrors({});
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  const handleAmountChange = (field: string, value: string) => {
    const number = value.replace(/\D/g, '');
    handleChange(field, number);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm bản ghi lịch sử</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lưu ý:</strong> Chức năng này dùng để lưu trữ lịch sử bổ nhiệm/miễn nhiệm cũ của nhân viên vào hệ thống.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="type">
              Loại bản ghi <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => handleChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="APPOINTMENT">Bổ nhiệm</SelectItem>
                <SelectItem value="TERMINATION">Miễn nhiệm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Mã nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="VD: EMP001"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeName">
                Tên nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => handleChange('employeeName', e.target.value)}
                placeholder="Nhập tên nhân viên"
              />
              {errors.employeeName && (
                <p className="text-sm text-red-500">{errors.employeeName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">
                Chức vụ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                placeholder="Nhập chức vụ"
              />
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">
                Phòng ban <span className="text-red-500">*</span>
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="Nhập phòng ban"
              />
              {errors.department && (
                <p className="text-sm text-red-500">{errors.department}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decisionNumber">
                Số quyết định <span className="text-red-500">*</span>
              </Label>
              <Input
                id="decisionNumber"
                value={formData.decisionNumber}
                onChange={(e) => handleChange('decisionNumber', e.target.value)}
                placeholder="VD: QD-BN/2020/001"
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
                value={formData.decisionDate}
                onChange={(e) => handleChange('decisionDate', e.target.value)}
              />
              {errors.decisionDate && (
                <p className="text-sm text-red-500">{errors.decisionDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="effectiveDate">
                Ngày có hiệu lực <span className="text-red-500">*</span>
              </Label>
              <Input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleChange('effectiveDate', e.target.value)}
              />
              {errors.effectiveDate && (
                <p className="text-sm text-red-500">{errors.effectiveDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Để trống nếu vẫn đang giữ chức
              </p>
            </div>
          </div>

          {formData.type === 'APPOINTMENT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Lương (VNĐ)</Label>
                <Input
                  id="salary"
                  value={formatCurrency(formData.salary)}
                  onChange={(e) => handleAmountChange('salary', e.target.value)}
                  placeholder="Nhập lương"
                />
                {errors.salary && (
                  <p className="text-sm text-red-500">{errors.salary}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowance">Phụ cấp (VNĐ)</Label>
                <Input
                  id="allowance"
                  value={formatCurrency(formData.allowance)}
                  onChange={(e) => handleAmountChange('allowance', e.target.value)}
                  placeholder="Nhập phụ cấp"
                />
                {errors.allowance && (
                  <p className="text-sm text-red-500">{errors.allowance}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">
              Lý do <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              placeholder="Nhập lý do bổ nhiệm/miễn nhiệm"
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Ghi chú thêm (nếu có)"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu bản ghi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}