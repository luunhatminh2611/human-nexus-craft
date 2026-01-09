// components/DisciplineFormModal.tsx

import { useState, useEffect } from 'react';
import { X, Upload, FileText, Trash2 } from 'lucide-react';
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
  type DisciplineAction,
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
    decisionNumber: '',
    decisionDate: '',
    disciplineAction: '' as DisciplineAction | '',
    decisionReason: '',
    effectiveDate: '',
    expiryDate: '',
    notes: '',
  });
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
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
          decisionNumber: discipline.decisionNumber || '',
          decisionDate: discipline.decisionDate || '',
          disciplineAction: discipline.disciplineAction || '',
          decisionReason: discipline.decisionReason || '',
          effectiveDate: discipline.effectiveDate || '',
          expiryDate: discipline.expiryDate || '',
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
          decisionNumber: '',
          decisionDate: new Date().toISOString().split('T')[0],
          disciplineAction: '',
          decisionReason: '',
          effectiveDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          notes: '',
        });
      }
      setAttachmentFiles([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachmentFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (isDraft: boolean) => {
    const newErrors: Record<string, string> = {};

    // Validate basic info
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

    // Validate decision info (only if not draft)
    if (!isDraft) {
      if (!formData.decisionNumber.trim()) {
        newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
      }
      if (!formData.decisionDate) {
        newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
      }
      if (!formData.disciplineAction) {
        newErrors.disciplineAction = 'Vui lòng chọn hình thức kỷ luật';
      }
      if (!formData.decisionReason.trim()) {
        newErrors.decisionReason = 'Vui lòng nhập lý do quyết định';
      }
      if (!formData.effectiveDate) {
        newErrors.effectiveDate = 'Vui lòng chọn ngày có hiệu lực';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm(isDraft)) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Form data:', formData);
    console.log('Files:', attachmentFiles.map(f => f.name));
    console.log('Is draft:', isDraft);
    console.log(discipline ? 'Cập nhật quyết định' : 'Tạo mới quyết định');

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {discipline ? 'Chỉnh sửa quyết định kỷ luật' : 'Tạo quyết định kỷ luật mới'}
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
          <form className="space-y-6">
            {/* Section 1: Thông tin vi phạm */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Thông tin vi phạm</h3>

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

              <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Section 2: Quyết định kỷ luật */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Quyết định kỷ luật</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Decision Number */}
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
                    placeholder="VD: QĐ-KL-2024-001"
                    className={errors.decisionNumber ? 'border-red-500' : ''}
                  />
                  {errors.decisionNumber && (
                    <p className="text-sm text-red-500">{errors.decisionNumber}</p>
                  )}
                </div>

                {/* Decision Date */}
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

              {/* Discipline Action */}
              <div className="space-y-2">
                <Label htmlFor="disciplineAction">
                  Hình thức kỷ luật <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.disciplineAction}
                  onValueChange={(value: DisciplineAction) => 
                    setFormData(prev => ({ ...prev, disciplineAction: value }))
                  }
                >
                  <SelectTrigger className={errors.disciplineAction ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn hình thức kỷ luật" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WARNING">Khiển trách</SelectItem>
                    <SelectItem value="REPRIMAND">Cảnh cáo</SelectItem>
                    <SelectItem value="SALARY_CUT">Cắt giảm lương</SelectItem>
                    <SelectItem value="DEMOTION">Giáng chức</SelectItem>
                    <SelectItem value="TERMINATION">Sa thải</SelectItem>
                  </SelectContent>
                </Select>
                {errors.disciplineAction && (
                  <p className="text-sm text-red-500">{errors.disciplineAction}</p>
                )}
              </div>

              {/* Decision Reason */}
              <div className="space-y-2">
                <Label htmlFor="decisionReason">
                  Lý do quyết định <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="decisionReason"
                  value={formData.decisionReason}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    decisionReason: e.target.value 
                  }))}
                  placeholder="Nhập lý do và căn cứ pháp lý của quyết định..."
                  rows={4}
                  className={errors.decisionReason ? 'border-red-500' : ''}
                />
                {errors.decisionReason && (
                  <p className="text-sm text-red-500">{errors.decisionReason}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Effective Date */}
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

                {/* Expiry Date */}
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
                    Để trống nếu quyết định có hiệu lực vĩnh viễn
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: File đính kèm */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">File đính kèm</h3>

              <div>
                <Label htmlFor="attachmentFiles">Tài liệu đính kèm</Label>
                <div className="mt-2">
                  <label
                    htmlFor="attachmentFiles"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Tải lên biên bản vi phạm, quyết định, tài liệu liên quan (PDF, DOCX, hình ảnh)
                    </span>
                  </label>
                  <input
                    id="attachmentFiles"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                  />
                </div>
                {attachmentFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachmentFiles.map((file, index) => (
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
              ? 'Cập nhật thông tin quyết định kỷ luật'
              : 'Lưu nháp để chỉnh sửa sau hoặc ra quyết định chính thức'}
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
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}