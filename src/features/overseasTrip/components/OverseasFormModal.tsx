// components/OverseasFormModal.tsx

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
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar } from 'lucide-react';
import { type OverseasTrip } from '../../../mock/overseasTrip';

interface OverseasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: OverseasTrip | null;
  onSuccess: () => void;
  isAdmin?: boolean;
}

export default function OverseasFormModal({
  isOpen,
  onClose,
  trip,
  onSuccess,
  isAdmin = false,
}: OverseasFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAsApproved, setCreateAsApproved] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    departmentName: '',
    positionName: '',
    country: '',
    purpose: '',
    fundingSource: '',
    plannedDepartureDate: '',
    plannedReturnDate: '',
    estimatedCost: '',
    decisionNumber: '',
    decisionDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (trip) {
      setFormData({
        employeeId: trip.employeeId,
        employeeName: trip.employeeName,
        departmentName: trip.departmentName,
        positionName: trip.positionName,
        country: trip.country,
        purpose: trip.purpose,
        fundingSource: trip.fundingSource,
        plannedDepartureDate: trip.plannedDepartureDate,
        plannedReturnDate: trip.plannedReturnDate,
        estimatedCost: trip.estimatedCost.toString(),
        decisionNumber: trip.decisionNumber || '',
        decisionDate: trip.decisionDate || '',
        notes: trip.notes || '',
      });
    } else {
      // Reset form
      setFormData({
        employeeId: isAdmin ? '' : 'CURRENT_USER',
        employeeName: isAdmin ? '' : 'Lê Thị Hương',
        departmentName: isAdmin ? '' : 'Phòng Nhân sự',
        positionName: isAdmin ? '' : 'Nhân viên',
        country: '',
        purpose: '',
        fundingSource: '',
        plannedDepartureDate: '',
        plannedReturnDate: '',
        estimatedCost: '',
        decisionNumber: '',
        decisionDate: '',
        notes: '',
      });
      setCreateAsApproved(false);
    }
    setErrors({});
  }, [trip, isOpen, isAdmin]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (isAdmin && !formData.employeeName) {
      newErrors.employeeName = 'Vui lòng chọn nhân viên';
    }
    if (!formData.country) {
      newErrors.country = 'Vui lòng nhập quốc gia';
    }
    if (!formData.purpose) {
      newErrors.purpose = 'Vui lòng nhập mục đích';
    }
    if (!formData.plannedDepartureDate) {
      newErrors.plannedDepartureDate = 'Vui lòng chọn ngày đi';
    }
    if (!formData.plannedReturnDate) {
      newErrors.plannedReturnDate = 'Vui lòng chọn ngày về';
    }
    if (formData.plannedDepartureDate && formData.plannedReturnDate) {
      if (new Date(formData.plannedReturnDate) <= new Date(formData.plannedDepartureDate)) {
        newErrors.plannedReturnDate = 'Ngày về phải sau ngày đi';
      }
    }
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Vui lòng nhập chi phí hợp lệ';
    }

    // Validation cho Admin khi tạo đơn đã duyệt
    if (isAdmin && createAsApproved && !trip) {
      if (!formData.decisionNumber) {
        newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
      }
      if (!formData.decisionDate) {
        newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Submit form:', {
      ...formData,
      isUpdate: !!trip,
      createAsApproved: isAdmin && createAsApproved,
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const isEditMode = !!trip;
  const canEditDecisionInfo = isAdmin && trip?.status === 'PENDING';
  const showDecisionFields = isAdmin && ((createAsApproved && !isEditMode) || canEditDecisionInfo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Chỉnh sửa chuyến đi' : 'Đăng ký chuyến đi'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Info - Chỉ hiện khi Admin tạo mới */}
          {isAdmin && !isEditMode && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Thông tin nhân viên</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nhân viên *</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => {
                      handleChange('employeeId', value);
                      // TODO: Load employee info
                      handleChange('employeeName', 'Nguyễn Văn An');
                      handleChange('departmentName', 'Phòng Kỹ thuật');
                      handleChange('positionName', 'Trưởng phòng');
                    }}
                  >
                    <SelectTrigger className={errors.employeeName ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMP001">Nguyễn Văn An - NV001</SelectItem>
                      <SelectItem value="EMP002">Lê Thị Hương - NV002</SelectItem>
                      <SelectItem value="EMP003">Phạm Minh Tuấn - NV003</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.employeeName && (
                    <p className="text-sm text-red-500 mt-1">{errors.employeeName}</p>
                  )}
                </div>
                <div>
                  <Label>Phòng ban</Label>
                  <Input value={formData.departmentName} disabled />
                </div>
              </div>
            </div>
          )}

          {/* Admin option: Create as approved */}
          {isAdmin && !isEditMode && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                id="createAsApproved"
                checked={createAsApproved}
                onChange={(e) => setCreateAsApproved(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="createAsApproved" className="text-sm font-medium cursor-pointer">
                Tạo đơn đã phê duyệt (nhập số quyết định ngay)
              </label>
            </div>
          )}

          {/* Decision Info - Chỉ hiện khi cần */}
          {showDecisionFields && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium">Thông tin quyết định</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Số quyết định *</Label>
                  <Input
                    value={formData.decisionNumber}
                    onChange={(e) => handleChange('decisionNumber', e.target.value)}
                    placeholder="QĐ-001/2024"
                    className={errors.decisionNumber ? 'border-red-500' : ''}
                  />
                  {errors.decisionNumber && (
                    <p className="text-sm text-red-500 mt-1">{errors.decisionNumber}</p>
                  )}
                </div>
                <div>
                  <Label>Ngày quyết định *</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.decisionDate}
                      onChange={(e) => handleChange('decisionDate', e.target.value)}
                      className={errors.decisionDate ? 'border-red-500' : ''}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.decisionDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.decisionDate}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trip Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Thông tin chuyến đi</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quốc gia *</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Singapore, Nhật Bản, ..."
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                )}
              </div>
              <div>
                <Label>Nguồn tài trợ</Label>
                <Input
                  value={formData.fundingSource}
                  onChange={(e) => handleChange('fundingSource', e.target.value)} 
                />
              </div>
            </div>

            <div>
              <Label>Mục đích chuyến đi *</Label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder="Mô tả mục đích chuyến đi..."
                rows={3}
                className={errors.purpose ? 'border-red-500' : ''}
              />
              {errors.purpose && (
                <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày xuất cảnh dự kiến *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.plannedDepartureDate}
                    onChange={(e) => handleChange('plannedDepartureDate', e.target.value)}
                    className={errors.plannedDepartureDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.plannedDepartureDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.plannedDepartureDate}</p>
                )}
              </div>
              <div>
                <Label>Ngày về dự kiến *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.plannedReturnDate}
                    onChange={(e) => handleChange('plannedReturnDate', e.target.value)}
                    className={errors.plannedReturnDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.plannedReturnDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.plannedReturnDate}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Chi phí ước tính (VNĐ) *</Label>
              <Input
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => handleChange('estimatedCost', e.target.value)}
                placeholder="50000000"
                className={errors.estimatedCost ? 'border-red-500' : ''}
              />
              {errors.estimatedCost && (
                <p className="text-sm text-red-500 mt-1">{errors.estimatedCost}</p>
              )}
            </div>

            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Thông tin bổ sung..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}