import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button/Button2';
import { Textarea } from '@/shared/components/ui/textarea';
import { mockDegrees, type Degree } from '../../../mock/degree';

import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface DegreeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  degree?: Degree | null;
  onSuccess: () => void;
}

interface DegreeFormData {
  type: 'EDUCATION' | 'CERTIFICATION' | 'LICENSE' | '';
  name: string;
  institution: string;
  major: string;
  level: string;
  issueDate: string;
  expiryDate: string;
  certificateNumber: string;
  notes: string;
  documentUrl: string;
}

export default function DegreeFormModal({ isOpen, onClose, degree, onSuccess }: DegreeFormModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN');
  const isEdit = !!degree;

  const [formData, setFormData] = useState<DegreeFormData>({
    type: '',
    name: '',
    institution: '',
    major: '',
    level: '',
    issueDate: '',
    expiryDate: '',
    certificateNumber: '',
    notes: '',
    documentUrl: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DegreeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && degree) {
      setFormData({
        type: degree.type,
        name: degree.name,
        institution: degree.institution,
        major: degree.major || '',
        level: degree.level || '',
        issueDate: degree.issueDate,
        expiryDate: degree.expiryDate || '',
        certificateNumber: degree.certificateNumber || '',
        notes: degree.notes || '',
        documentUrl: degree.documentUrl || '',
      });
    } else if (isOpen) {
      setFormData({
        type: '',
        name: '',
        institution: '',
        major: '',
        level: '',
        issueDate: '',
        expiryDate: '',
        certificateNumber: '',
        notes: '',
        documentUrl: '',
      });
    }
    setErrors({});
  }, [isOpen, degree]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DegreeFormData, string>> = {};

    if (!formData.type) {
      newErrors.type = 'Vui lòng chọn loại bằng cấp';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên bằng cấp';
    }

    if (!formData.institution.trim()) {
      newErrors.institution = 'Vui lòng nhập tổ chức cấp';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Vui lòng chọn ngày cấp';
    }

    if (formData.type === 'EDUCATION' && !formData.level) {
      newErrors.level = 'Vui lòng chọn trình độ';
    }

    if (formData.expiryDate && formData.issueDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= issueDate) {
        newErrors.expiryDate = 'Ngày hết hạn phải sau ngày cấp';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isEdit && degree) {
        // Update existing degree
        const index = mockDegrees.findIndex(d => d.id === degree.id);
        if (index > -1) {
          mockDegrees[index] = {
            ...mockDegrees[index],
            type: formData.type as Degree['type'],
            name: formData.name.trim(),
            institution: formData.institution.trim(),
            major: formData.major.trim() || undefined,
            level: formData.level || undefined,
            issueDate: formData.issueDate,
            expiryDate: formData.expiryDate || undefined,
            certificateNumber: formData.certificateNumber.trim() || undefined,
            notes: formData.notes.trim() || undefined,
            documentUrl: formData.documentUrl.trim() || undefined,
            // Status remains the same if ADMIN, otherwise reset to PENDING if was REJECTED
            status: isAdmin 
              ? mockDegrees[index].status 
              : (mockDegrees[index].status === 'REJECTED' ? 'PENDING' : mockDegrees[index].status),
          };
        }
      } else {
        // Create new degree
        const newDegree: Degree = {
          id: `DEG${String(mockDegrees.length + 1).padStart(3, '0')}`,
          employeeId: user?.employeeId || 'EMP001',
          employeeName: user?.name || 'Unknown',
          employeeCode: user?.employeeCode || 'NV001',
          department: user?.department || 'Unknown',
          position: user?.position || 'Unknown',
          type: formData.type as Degree['type'],
          name: formData.name.trim(),
          institution: formData.institution.trim(),
          major: formData.major.trim() || undefined,
          level: formData.level || undefined,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate || undefined,
          certificateNumber: formData.certificateNumber.trim() || undefined,
          status: isAdmin ? 'APPROVED' : 'PENDING',
          documentUrl: formData.documentUrl.trim() || undefined,
          submittedDate: new Date().toISOString(),
          notes: formData.notes.trim() || undefined,
          reviewedBy: isAdmin ? `${user?.name} (ADMIN)` : undefined,
          reviewedDate: isAdmin ? new Date().toISOString() : undefined,
        };

        mockDegrees.push(newDegree);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving degree:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof DegreeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa bằng cấp' : 'Thêm bằng cấp mới'}
          </DialogTitle>
        </DialogHeader>

        {!isAdmin && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-blue-800">
              <p className="font-medium">Lưu ý:</p>
              <p>Bằng cấp của bạn sẽ được gửi đến HR để phê duyệt. Bạn chỉ có thể chỉnh sửa hoặc xóa khi ở trạng thái "Chờ duyệt" hoặc "Từ chối".</p>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-green-800">
              <p className="font-medium">Quyền Admin:</p>
              <p>Bằng cấp bạn tạo sẽ được phê duyệt tự động và có thể chỉnh sửa bất cứ lúc nào.</p>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-4">
          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Loại bằng cấp <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn loại bằng cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDUCATION">Học vấn</SelectItem>
                <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
                <SelectItem value="LICENSE">Giấy phép hành nghề</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên bằng cấp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="VD: Cử nhân Khoa học Máy tính"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">
              Tổ chức cấp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="VD: Đại học Bách Khoa Hà Nội"
              className={errors.institution ? 'border-red-500' : ''}
            />
            {errors.institution && (
              <p className="text-sm text-red-500">{errors.institution}</p>
            )}
          </div>

          {/* Education specific fields */}
          {formData.type === 'EDUCATION' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">
                  Trình độ <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleChange('level', value)}
                >
                  <SelectTrigger id="level" className={errors.level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Trung cấp">Trung cấp</SelectItem>
                    <SelectItem value="Cao đẳng">Cao đẳng</SelectItem>
                    <SelectItem value="Cử nhân">Cử nhân</SelectItem>
                    <SelectItem value="Kỹ sư">Kỹ sư</SelectItem>
                    <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                    <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-sm text-red-500">{errors.level}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="major">Chuyên ngành</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  placeholder="VD: Khoa học Máy tính"
                />
              </div>
            </div>
          )}

          {/* Certificate Number */}
          <div className="space-y-2">
            <Label htmlFor="certificateNumber">Số bằng cấp/chứng chỉ</Label>
            <Input
              id="certificateNumber"
              value={formData.certificateNumber}
              onChange={(e) => handleChange('certificateNumber', e.target.value)}
              placeholder="VD: BKHN-2019-12345"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">
                Ngày cấp <span className="text-red-500">*</span>
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                className={errors.issueDate ? 'border-red-500' : ''}
              />
              {errors.issueDate && (
                <p className="text-sm text-red-500">{errors.issueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                Ngày hết hạn
                {(formData.type === 'CERTIFICATION' || formData.type === 'LICENSE') && (
                  <span className="text-xs text-muted-foreground ml-1">
                    (để trống nếu vô thời hạn)
                  </span>
                )}
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          {/* Document URL */}
          <div className="space-y-2">
            <Label htmlFor="documentUrl">Link tài liệu</Label>
            <Input
              id="documentUrl"
              value={formData.documentUrl}
              onChange={(e) => handleChange('documentUrl', e.target.value)}
              placeholder="VD: https://drive.google.com/file/..."
            />
            <p className="text-xs text-muted-foreground">
              Liên kết đến file scan hoặc ảnh bằng cấp/chứng chỉ
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Thông tin bổ sung về bằng cấp..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang lưu...
                </>
              ) : (
                isEdit ? 'Cập nhật' : 'Thêm mới'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}