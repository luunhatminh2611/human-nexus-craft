// components/InsuranceFormModal.tsx

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
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
  type InsuranceRecord,
  type InsuranceStatus,
  calculateInsuranceAmount
} from '../../../mock/socialInsurance';

interface InsuranceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: InsuranceRecord | null;
  onSuccess: () => void;
}

export default function InsuranceFormModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: InsuranceFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    insuranceBookNumber: '',
    insuranceCode: '',
    status: 'ACTIVE' as InsuranceStatus,
    startDate: '',
    endDate: '',
    currentSalaryBase: '',
    notes: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock employees
  const mockEmployees = [
    { id: 'EMP-001', name: 'Nguyễn Văn An', department: 'Phòng IT' },
    { id: 'EMP-002', name: 'Lê Thị Cẩm', department: 'Phòng Kinh doanh' },
    { id: 'EMP-003', name: 'Hoàng Minh F', department: 'Phòng Kế toán' },
    { id: 'EMP-004', name: 'Đỗ Văn H', department: 'Phòng Hành chính' },
    { id: 'EMP-005', name: 'Bùi Thị K', department: 'Phòng Marketing' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setFormData({
          employeeId: record.employeeId,
          employeeName: record.employeeName,
          insuranceBookNumber: record.insuranceBookNumber,
          insuranceCode: record.insuranceCode,
          status: record.status,
          startDate: record.startDate,
          endDate: record.endDate || '',
          currentSalaryBase: record.currentSalaryBase.toString(),
          notes: record.notes || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          employeeId: '',
          employeeName: '',
          insuranceBookNumber: '',
          insuranceCode: '',
          status: 'ACTIVE',
          startDate: today,
          endDate: '',
          currentSalaryBase: '',
          notes: '',
        });
      }
      setFiles([]);
      setErrors({});
    }
  }, [isOpen, record]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.insuranceBookNumber.trim()) {
      newErrors.insuranceBookNumber = 'Vui lòng nhập số sổ BHXH';
    }
    if (!formData.insuranceCode.trim()) {
      newErrors.insuranceCode = 'Vui lòng nhập mã số BHXH';
    }
    if (formData.insuranceCode.trim() && formData.insuranceCode.length !== 13) {
      newErrors.insuranceCode = 'Mã số BHXH phải có 13 số';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu tham gia';
    }
    if (!formData.currentSalaryBase || Number(formData.currentSalaryBase) <= 0) {
      newErrors.currentSalaryBase = 'Vui lòng nhập mức lương đóng BHXH hợp lệ';
    }
    if (formData.status === 'TERMINATED' && !formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc khi trạng thái là Đã dừng';
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

    console.log('Insurance record data:', {
      ...formData,
      files: files.map(f => f.name),
    });
    console.log(record ? 'Cập nhật hồ sơ BHXH' : 'Tạo hồ sơ BHXH mới');

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen) return null;

  const amounts = formData.currentSalaryBase 
    ? calculateInsuranceAmount(Number(formData.currentSalaryBase))
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {record ? 'Chỉnh sửa hồ sơ BHXH' : 'Thêm hồ sơ BHXH'}
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
                Nhân viên <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={handleEmployeeChange}
                disabled={!!record}
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

            <div className="grid grid-cols-2 gap-4">
              {/* Insurance Book Number */}
              <div className="space-y-2">
                <Label htmlFor="insuranceBookNumber">
                  Số sổ BHXH <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="insuranceBookNumber"
                  value={formData.insuranceBookNumber}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    insuranceBookNumber: e.target.value 
                  }))}
                  placeholder="0123456789"
                  maxLength={10}
                  className={errors.insuranceBookNumber ? 'border-red-500' : ''}
                />
                {errors.insuranceBookNumber && (
                  <p className="text-sm text-red-500">{errors.insuranceBookNumber}</p>
                )}
              </div>

              {/* Insurance Code */}
              <div className="space-y-2">
                <Label htmlFor="insuranceCode">
                  Mã số BHXH <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="insuranceCode"
                  value={formData.insuranceCode}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    insuranceCode: e.target.value.replace(/\D/g, '') 
                  }))}
                  placeholder="0123456789012"
                  maxLength={13}
                  className={errors.insuranceCode ? 'border-red-500' : ''}
                />
                {errors.insuranceCode && (
                  <p className="text-sm text-red-500">{errors.insuranceCode}</p>
                )}
                <p className="text-xs text-gray-500">Mã số BHXH gồm 13 chữ số</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">
                  Trạng thái <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: InsuranceStatus) => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Đang tham gia</SelectItem>
                    <SelectItem value="SUSPENDED">Tạm dừng</SelectItem>
                    <SelectItem value="TERMINATED">Đã dừng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* End Date (if terminated) */}
            {formData.status === 'TERMINATED' && (
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value 
                  }))}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            )}

            {/* Salary Base */}
            <div className="space-y-2">
              <Label htmlFor="currentSalaryBase">
                Mức lương đóng BHXH (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="currentSalaryBase"
                type="number"
                value={formData.currentSalaryBase}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  currentSalaryBase: e.target.value 
                }))}
                placeholder="15000000"
                className={errors.currentSalaryBase ? 'border-red-500' : ''}
              />
              {errors.currentSalaryBase && (
                <p className="text-sm text-red-500">{errors.currentSalaryBase}</p>
              )}
            </div>

            {/* Insurance Amount Preview */}
            {amounts && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Số tiền phải đóng (dự kiến)</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2 font-medium text-blue-900 border-b pb-2">
                    <div>Loại</div>
                    <div className="text-right">Nhân viên</div>
                    <div className="text-right">Công ty</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-blue-700">BHXH (8% / 17.5%)</div>
                    <div className="text-right text-orange-600 font-medium">
                      {amounts.socialInsurance.employee.toLocaleString()}đ
                    </div>
                    <div className="text-right text-blue-600 font-medium">
                      {amounts.socialInsurance.employer.toLocaleString()}đ
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-blue-700">BHYT (1.5% / 3%)</div>
                    <div className="text-right text-orange-600 font-medium">
                      {amounts.healthInsurance.employee.toLocaleString()}đ
                    </div>
                    <div className="text-right text-blue-600 font-medium">
                      {amounts.healthInsurance.employer.toLocaleString()}đ
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-blue-700">BHTN (1% / 1%)</div>
                    <div className="text-right text-orange-600 font-medium">
                      {amounts.unemploymentInsurance.employee.toLocaleString()}đ
                    </div>
                    <div className="text-right text-blue-600 font-medium">
                      {amounts.unemploymentInsurance.employer.toLocaleString()}đ
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-bold border-t pt-2">
                    <div className="text-blue-900">Tổng cộng</div>
                    <div className="text-right text-orange-700">
                      {(amounts.socialInsurance.employee + 
                        amounts.healthInsurance.employee + 
                        amounts.unemploymentInsurance.employee).toLocaleString()}đ
                    </div>
                    <div className="text-right text-blue-700">
                      {(amounts.socialInsurance.employer + 
                        amounts.healthInsurance.employer + 
                        amounts.unemploymentInsurance.employer).toLocaleString()}đ
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="files">Tài liệu đính kèm</Label>
              <div>
                <label
                  htmlFor="files"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {files.length > 0 
                      ? `${files.length} file đã chọn` 
                      : 'Tải lên sổ BHXH, giấy tờ liên quan'}
                  </span>
                </label>
                <input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {file.name}
                    </div>
                  ))}
                </div>
              )}
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
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
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
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang lưu...' : record ? 'Xác nhận' : 'Xác nhận'}
          </Button>
        </div>
      </div>
    </div>
  );
}