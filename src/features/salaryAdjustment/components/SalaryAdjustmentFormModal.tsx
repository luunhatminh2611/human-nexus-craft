// components/SalaryAdjustmentFormModal.tsx

import { useState, useEffect } from 'react';
import { X, Upload, Calculator, FileText, Trash2 } from 'lucide-react';
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
  type SalaryAdjustment,
  type AdjustmentType,
  adjustmentTypeLabels,
  calculateIncrease
} from '../../../mock/salaryAdjustment';

interface SalaryAdjustmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  adjustment?: SalaryAdjustment | null;
  onSuccess: () => void;
}

export default function SalaryAdjustmentFormModal({
  isOpen,
  onClose,
  adjustment,
  onSuccess,
}: SalaryAdjustmentFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    adjustmentType: 'ANNUAL_INCREASE' as AdjustmentType,
    effectiveDate: '',
    expiryDate: '',
    reason: '',
    performanceNote: '',
    newPosition: '',

    decisionNumber: '',
    decisionDate: '',

    // Current salary
    currentBaseSalary: '',
    currentPositionAllowance: '',
    currentResponsibilityAllowance: '',
    currentTransportationAllowance: '',
    currentLunchAllowance: '',
    currentPhoneAllowance: '',
    currentOtherAllowance: '',

    // New salary
    newBaseSalary: '',
    newPositionAllowance: '',
    newResponsibilityAllowance: '',
    newTransportationAllowance: '',
    newLunchAllowance: '',
    newPhoneAllowance: '',
    newOtherAllowance: '',

    notes: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock employees
  const mockEmployees = [
    { id: 'EMP-001', name: 'Nguyễn Văn An', department: 'Phòng IT', position: 'Senior Developer' },
    { id: 'EMP-002', name: 'Lê Thị Cẩm', department: 'Phòng Kinh doanh', position: 'Sales Executive' },
    { id: 'EMP-003', name: 'Hoàng Minh F', department: 'Phòng Kế toán', position: 'Accountant' },
    { id: 'EMP-004', name: 'Đỗ Văn H', department: 'Phòng Hành chính', position: 'Admin Staff' },
    { id: 'EMP-005', name: 'Bùi Thị K', department: 'Phòng Marketing', position: 'Marketing Specialist' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (adjustment) {
        setFormData({
          employeeId: adjustment.employeeId,
          employeeName: adjustment.employeeName,
          adjustmentType: adjustment.adjustmentType,
          effectiveDate: adjustment.effectiveDate,
          expiryDate: adjustment.expiryDate || '',
          reason: adjustment.reason,
          performanceNote: adjustment.performanceNote || '',
          newPosition: adjustment.newPosition || '',

          decisionNumber: adjustment.decisionNumber || '',
          decisionDate: adjustment.decisionDate || '',

          currentBaseSalary: adjustment.currentSalary.baseSalary.toString(),
          currentPositionAllowance: (adjustment.currentSalary.allowances?.position || 0).toString(),
          currentResponsibilityAllowance: (adjustment.currentSalary.allowances?.responsibility || 0).toString(),
          currentTransportationAllowance: (adjustment.currentSalary.allowances?.transportation || 0).toString(),
          currentLunchAllowance: (adjustment.currentSalary.allowances?.lunch || 0).toString(),
          currentPhoneAllowance: (adjustment.currentSalary.allowances?.phone || 0).toString(),
          currentOtherAllowance: (adjustment.currentSalary.allowances?.other || 0).toString(),

          newBaseSalary: adjustment.newSalary.baseSalary.toString(),
          newPositionAllowance: (adjustment.newSalary.allowances?.position || 0).toString(),
          newResponsibilityAllowance: (adjustment.newSalary.allowances?.responsibility || 0).toString(),
          newTransportationAllowance: (adjustment.newSalary.allowances?.transportation || 0).toString(),
          newLunchAllowance: (adjustment.newSalary.allowances?.lunch || 0).toString(),
          newPhoneAllowance: (adjustment.newSalary.allowances?.phone || 0).toString(),
          newOtherAllowance: (adjustment.newSalary.allowances?.other || 0).toString(),

          notes: adjustment.notes || '',
        });
      } else {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        setFormData({
          employeeId: '',
          employeeName: '',
          adjustmentType: 'ANNUAL_INCREASE',
          effectiveDate: nextMonth.toISOString().split('T')[0],
          expiryDate: '',
          reason: '',
          performanceNote: '',
          newPosition: '',

          decisionNumber: '',
          decisionDate: new Date().toISOString().split('T')[0],

          currentBaseSalary: '',
          currentPositionAllowance: '0',
          currentResponsibilityAllowance: '0',
          currentTransportationAllowance: '0',
          currentLunchAllowance: '0',
          currentPhoneAllowance: '0',
          currentOtherAllowance: '0',

          newBaseSalary: '',
          newPositionAllowance: '0',
          newResponsibilityAllowance: '0',
          newTransportationAllowance: '0',
          newLunchAllowance: '0',
          newPhoneAllowance: '0',
          newOtherAllowance: '0',

          notes: '',
        });
      }
      setFiles([]);
      setErrors({});
    }
  }, [isOpen, adjustment]);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      // Simulate loading current salary
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: employee.name,
        currentBaseSalary: '20000000',
        currentPositionAllowance: '3000000',
        currentTransportationAllowance: '2000000',
        currentLunchAllowance: '1000000',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const calculateCurrentTotal = () => {
    return Number(formData.currentBaseSalary || 0) +
      Number(formData.currentPositionAllowance || 0) +
      Number(formData.currentResponsibilityAllowance || 0) +
      Number(formData.currentTransportationAllowance || 0) +
      Number(formData.currentLunchAllowance || 0) +
      Number(formData.currentPhoneAllowance || 0) +
      Number(formData.currentOtherAllowance || 0);
  };

  const calculateNewTotal = () => {
    return Number(formData.newBaseSalary || 0) +
      Number(formData.newPositionAllowance || 0) +
      Number(formData.newResponsibilityAllowance || 0) +
      Number(formData.newTransportationAllowance || 0) +
      Number(formData.newLunchAllowance || 0) +
      Number(formData.newPhoneAllowance || 0) +
      Number(formData.newOtherAllowance || 0);
  };

  const currentTotal = calculateCurrentTotal();
  const newTotal = calculateNewTotal();
  const { increaseAmount, increasePercentage } = calculateIncrease(currentTotal, newTotal);

  const validateForm = (isDraft: boolean) => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Vui lòng chọn ngày có hiệu lực';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do điều chỉnh';
    }
    if (!formData.currentBaseSalary || Number(formData.currentBaseSalary) <= 0) {
      newErrors.currentBaseSalary = 'Vui lòng nhập lương cơ bản hiện tại';
    }
    if (!formData.newBaseSalary || Number(formData.newBaseSalary) <= 0) {
      newErrors.newBaseSalary = 'Vui lòng nhập lương cơ bản mới';
    }
    if (formData.adjustmentType === 'PROMOTION' && !formData.newPosition.trim()) {
      newErrors.newPosition = 'Vui lòng nhập chức vụ mới khi thăng chức';
    }

    // Validate decision info if not draft
    if (!isDraft) {
      if (!formData.decisionNumber.trim()) {
        newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
      }
      if (!formData.decisionDate) {
        newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm(isDraft)) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Salary adjustment data:', {
      ...formData,
      currentTotal,
      newTotal,
      increaseAmount,
      increasePercentage,
      files: files.map(f => f.name),
      status: isDraft ? 'DRAFT' : 'ACTIVE',
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {adjustment ? 'Chỉnh sửa quyết định điều chỉnh lương' : 'Tạo quyết định điều chỉnh lương'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Thông tin cơ bản</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">
                    Nhân viên <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={handleEmployeeChange}
                    disabled={!!adjustment}
                  >
                    <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position} - {emp.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeId && (
                    <p className="text-sm text-red-500">{errors.employeeId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustmentType">
                    Loại điều chỉnh <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.adjustmentType}
                    onValueChange={(value: AdjustmentType) =>
                      setFormData(prev => ({ ...prev, adjustmentType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(adjustmentTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effectiveDate">
                    Ngày có hiệu lực <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      effectiveDate: e.target.value
                    }))}
                    className={errors.effectiveDate ? 'border-red-500' : ''}
                  />
                  {errors.effectiveDate && (
                    <p className="text-sm text-red-500">{errors.effectiveDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Ngày hết hiệu lực (nếu có)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      expiryDate: e.target.value
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Để trống nếu điều chỉnh có hiệu lực vĩnh viễn
                  </p>
                </div>

                {formData.adjustmentType === 'PROMOTION' && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="newPosition">
                      Chức vụ mới <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="newPosition"
                      value={formData.newPosition}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        newPosition: e.target.value
                      }))}
                      placeholder="VD: Senior Manager"
                      className={errors.newPosition ? 'border-red-500' : ''}
                    />
                    {errors.newPosition && (
                      <p className="text-sm text-red-500">{errors.newPosition}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Decision Info */}
            <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg text-blue-900">Thông tin quyết định</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionNumber">
                    Số quyết định <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="decisionNumber"
                    value={formData.decisionNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      decisionNumber: e.target.value
                    }))}
                    placeholder="VD: QĐ-TL-2025-001"
                    className={errors.decisionNumber ? 'border-red-500' : ''}
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
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      decisionDate: e.target.value
                    }))}
                    className={errors.decisionDate ? 'border-red-500' : ''}
                  />
                  {errors.decisionDate && (
                    <p className="text-sm text-red-500">{errors.decisionDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Salary Comparison */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Điều chỉnh lương</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Current Salary */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Lương hiện tại</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Lương cơ bản *</Label>
                      <Input
                        type="number"
                        value={formData.currentBaseSalary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentBaseSalary: e.target.value
                        }))}
                        className={errors.currentBaseSalary ? 'border-red-500 mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC chức vụ</Label>
                      <Input
                        type="number"
                        value={formData.currentPositionAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentPositionAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC xăng xe</Label>
                      <Input
                        type="number"
                        value={formData.currentTransportationAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentTransportationAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC ăn trưa</Label>
                      <Input
                        type="number"
                        value={formData.currentLunchAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          currentLunchAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-sm text-gray-600">Tổng lương hiện tại</div>
                      <div className="text-xl font-bold">{formatCurrency(currentTotal)}đ</div>
                    </div>
                  </div>
                </div>

                {/* New Salary */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-3">Lương mới</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Lương cơ bản *</Label>
                      <Input
                        type="number"
                        value={formData.newBaseSalary}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          newBaseSalary: e.target.value
                        }))}
                        className={errors.newBaseSalary ? 'border-red-500 mt-1' : 'mt-1'}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC chức vụ</Label>
                      <Input
                        type="number"
                        value={formData.newPositionAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          newPositionAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC xăng xe</Label>
                      <Input
                        type="number"
                        value={formData.newTransportationAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          newTransportationAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">PC ăn trưa</Label>
                      <Input
                        type="number"
                        value={formData.newLunchAllowance}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          newLunchAllowance: e.target.value
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-sm text-blue-700">Tổng lương mới</div>
                      <div className="text-xl font-bold text-blue-900">{formatCurrency(newTotal)}đ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Increase Summary */}
              {currentTotal > 0 && newTotal > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-green-700">Số tiền tăng/giảm</div>
                      <div className={`text-2xl font-bold ${increaseAmount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {increaseAmount >= 0 ? '+' : ''}{formatCurrency(increaseAmount)}đ
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-green-700">Tỷ lệ</div>
                      <div className={`text-2xl font-bold ${increasePercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {increasePercentage >= 0 ? '+' : ''}{increasePercentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-green-700">Tổng lương mới</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(newTotal)}đ
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reason & Notes */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do điều chỉnh <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    reason: e.target.value
                  }))}
                  placeholder="Mô tả chi tiết lý do và căn cứ điều chỉnh lương..."
                  rows={3}
                  className={errors.reason ? 'border-red-500' : ''}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="performanceNote">Ghi chú về hiệu suất</Label>
                <Textarea
                  id="performanceNote"
                  value={formData.performanceNote}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    performanceNote: e.target.value
                  }))}
                  placeholder="Đánh giá hiệu suất, đóng góp, thành tích..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú khác</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Ghi chú bổ sung..."
                  rows={2}
                />
              </div>
            </div>

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
                    Tải lên đánh giá hiệu suất, báo cáo KPI, quyết định...
                  </span>
                </label>
                <input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-muted-foreground">
            Lưu nháp để chỉnh sửa sau hoặc tạo quyết định chính thức
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
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Đang xử lý...'
                : 'Xác nhận'
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}