// components/DisciplineFormModal.tsx

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import { 
  type Discipline, 
  type ViolationSeverity,
  violationTypes 
} from '../../../mock/dismissed';

interface DisciplineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  discipline?: Discipline | null;
  onSuccess: () => void;
}

export default function DisciplineFormModal({
  isOpen,
  onClose,
  discipline,
  onSuccess,
}: DisciplineFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    violationType: '',
    violationDescription: '',
    violationDate: '',
    violationLocation: '',
    severity: 'MEDIUM' as ViolationSeverity,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock employees for selection
  const mockEmployees = [
    { id: 'EMP-001', name: 'Nguyễn Văn An', department: 'Phòng IT' },
    { id: 'EMP-002', name: 'Lê Thị Cẩm', department: 'Phòng Kinh doanh' },
    { id: 'EMP-003', name: 'Hoàng Minh F', department: 'Phòng Kế toán' },
    { id: 'EMP-004', name: 'Đỗ Văn H', department: 'Phòng Hành chính' },
    { id: 'EMP-005', name: 'Bùi Thị K', department: 'Phòng Marketing' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (discipline) {
        setFormData({
          employeeId: discipline.employeeId,
          employeeName: discipline.employeeName,
          violationType: discipline.violationType,
          violationDescription: discipline.violationDescription,
          violationDate: discipline.violationDate,
          violationLocation: discipline.violationLocation,
          severity: discipline.severity,
          notes: discipline.notes || '',
        });
      } else {
        setFormData({
          employeeId: '',
          employeeName: '',
          violationType: '',
          violationDescription: '',
          violationDate: new Date().toISOString().split('T')[0],
          violationLocation: '',
          severity: 'MEDIUM',
          notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, discipline]);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: employee.name,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.violationType) {
      newErrors.violationType = 'Vui lòng chọn loại vi phạm';
    }
    if (!formData.violationDescription.trim()) {
      newErrors.violationDescription = 'Vui lòng mô tả hành vi vi phạm';
    }
    if (!formData.violationDate) {
      newErrors.violationDate = 'Vui lòng chọn ngày vi phạm';
    }
    if (!formData.violationLocation.trim()) {
      newErrors.violationLocation = 'Vui lòng nhập địa điểm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Form data:', formData);
    console.log(discipline ? 'Cập nhật vi phạm' : 'Tạo mới vi phạm');

    setIsSubmitting(false);
    onSuccess();
  };

  const handleSaveAndNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call - save and send notification
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Save and notify:', formData);

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {discipline ? 'Chỉnh sửa thông tin vi phạm' : 'Ghi nhận vi phạm mới'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Nhân viên vi phạm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={handleEmployeeChange}
                disabled={!!discipline}
              >
                <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            {/* Violation Type */}
            <div className="space-y-2">
              <Label htmlFor="violationType">
                Loại vi phạm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.violationType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, violationType: value }))}
              >
                <SelectTrigger className={errors.violationType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn loại vi phạm" />
                </SelectTrigger>
                <SelectContent>
                  {violationTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.violationType && (
                <p className="text-sm text-red-500">{errors.violationType}</p>
              )}
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">
                Mức độ vi phạm <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.severity}
                onValueChange={(value: ViolationSeverity) => 
                  setFormData(prev => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGHT">Nhẹ</SelectItem>
                  <SelectItem value="MEDIUM">Trung bình</SelectItem>
                  <SelectItem value="SERIOUS">Nghiêm trọng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="violationDescription">
                Mô tả hành vi vi phạm <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="violationDescription"
                value={formData.violationDescription}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  violationDescription: e.target.value 
                }))}
                placeholder="Mô tả chi tiết hành vi vi phạm..."
                rows={4}
                className={errors.violationDescription ? 'border-red-500' : ''}
              />
              {errors.violationDescription && (
                <p className="text-sm text-red-500">{errors.violationDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Violation Date */}
              <div className="space-y-2">
                <Label htmlFor="violationDate">
                  Ngày vi phạm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="violationDate"
                  type="date"
                  value={formData.violationDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    violationDate: e.target.value 
                  }))}
                  className={errors.violationDate ? 'border-red-500' : ''}
                />
                {errors.violationDate && (
                  <p className="text-sm text-red-500">{errors.violationDate}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="violationLocation">
                  Địa điểm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="violationLocation"
                  value={formData.violationLocation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    violationLocation: e.target.value 
                  }))}
                  placeholder="Văn phòng chính, Chi nhánh..."
                  className={errors.violationLocation ? 'border-red-500' : ''}
                />
                {errors.violationLocation && (
                  <p className="text-sm text-red-500">{errors.violationLocation}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Ghi chú bổ sung (nếu có)..."
                rows={3}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-muted-foreground">
            {discipline 
              ? 'Cập nhật thông tin vi phạm và lưu lại'
              : 'Lưu nháp để chỉnh sửa hoặc gửi thông báo cho nhân viên'}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
            {(!discipline || discipline.status === 'DRAFT') && (
              <Button
                type="button"
                onClick={handleSaveAndNotify}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang gửi...' : 'Gửi thông báo cho NV'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}