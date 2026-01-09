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
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { AlertCircle, Upload, X, FileText, Search } from 'lucide-react';

interface DegreeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  degree?: Degree | null;
  onSuccess: () => void;
}

interface DegreeFormData {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
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

// Mock data nhân viên
const mockEmployees = [
  { id: 'EMP001', name: 'Nguyễn Văn An', code: 'NV001', department: 'Phòng IT', position: 'Trưởng phòng IT' },
  { id: 'EMP002', name: 'Trần Thị Bình', code: 'NV002', department: 'Phòng Nhân sự', position: 'Nhân viên HR' },
  { id: 'EMP003', name: 'Lê Văn Cường', code: 'NV003', department: 'Phòng Kinh doanh', position: 'Giám đốc Kinh doanh' },
  { id: 'EMP004', name: 'Phạm Thị Dung', code: 'NV004', department: 'Phòng Marketing', position: 'Trưởng phòng Marketing' },
  { id: 'EMP005', name: 'Hoàng Văn Em', code: 'NV005', department: 'Phòng Kế toán', position: 'Kế toán viên' },
  { id: 'EMP006', name: 'Vũ Thị Giang', code: 'NV006', department: 'Phòng IT', position: 'Lập trình viên' },
  { id: 'EMP007', name: 'Đỗ Văn Hải', code: 'NV007', department: 'Phòng IT', position: 'DevOps Engineer' },
  { id: 'EMP008', name: 'Ngô Thị Hồng', code: 'NV008', department: 'Phòng Pháp chế', position: 'Chuyên viên Pháp lý' },
  { id: 'EMP009', name: 'Bùi Văn Inh', code: 'NV009', department: 'Phòng Nhân sự', position: 'Trưởng phòng Nhân sự' },
  { id: 'EMP010', name: 'Trương Thị Kim', code: 'NV010', department: 'Phòng Marketing', position: 'Nhân viên Marketing' },
];

export default function DegreeFormModal({ isOpen, onClose, degree, onSuccess }: DegreeFormModalProps) {
  const { user } = useAuthStore();
  const isEdit = !!degree;

  const [formData, setFormData] = useState<DegreeFormData>({
    employeeId: '',
    employeeName: '',
    employeeCode: '',
    department: '',
    position: '',
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  useEffect(() => {
    if (isOpen && degree) {
      setFormData({
        employeeId: degree.employeeId,
        employeeName: degree.employeeName,
        employeeCode: degree.employeeCode,
        department: degree.department,
        position: degree.position,
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
      setEmployeeSearch(degree.employeeName);
      setUploadedFile(null);
    } else if (isOpen) {
      setFormData({
        employeeId: '',
        employeeName: '',
        employeeCode: '',
        department: '',
        position: '',
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
      setEmployeeSearch('');
      setUploadedFile(null);
    }
    setErrors({});
    setShowEmployeeList(false);
  }, [isOpen, degree]);

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const handleEmployeeSelect = (employee: typeof mockEmployees[0]) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      department: employee.department,
      position: employee.position,
    }));
    setEmployeeSearch(employee.name);
    setShowEmployeeList(false);
    if (errors.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documentUrl: 'Kích thước file không được vượt quá 10MB' }));
        return;
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, documentUrl: 'Chỉ chấp nhận file PDF, JPG, JPEG, PNG' }));
        return;
      }

      setUploadedFile(file);
      const fakeUrl = `/documents/degree-${Date.now()}.${file.name.split('.').pop()}`;
      setFormData(prev => ({ ...prev, documentUrl: fakeUrl }));
      if (errors.documentUrl) {
        setErrors(prev => ({ ...prev, documentUrl: undefined }));
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFormData(prev => ({ ...prev, documentUrl: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DegreeFormData, string>> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }

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

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (isEdit && degree) {
        const index = mockDegrees.findIndex(d => d.id === degree.id);
        if (index > -1) {
          mockDegrees[index] = {
            ...mockDegrees[index],
            employeeId: formData.employeeId,
            employeeName: formData.employeeName,
            employeeCode: formData.employeeCode,
            department: formData.department,
            position: formData.position,
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
            updatedDate: new Date().toISOString(),
            updatedBy: user?.name || 'Admin',
          };
        }
      } else {
        const newDegree: Degree = {
          id: `DEG${String(mockDegrees.length + 1).padStart(3, '0')}`,
          employeeId: formData.employeeId,
          employeeName: formData.employeeName,
          employeeCode: formData.employeeCode,
          department: formData.department,
          position: formData.position,
          type: formData.type as Degree['type'],
          name: formData.name.trim(),
          institution: formData.institution.trim(),
          major: formData.major.trim() || undefined,
          level: formData.level || undefined,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate || undefined,
          certificateNumber: formData.certificateNumber.trim() || undefined,
          documentUrl: formData.documentUrl.trim() || undefined,
          createdDate: new Date().toISOString(),
          createdBy: user?.name || 'Admin',
          notes: formData.notes.trim() || undefined,
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

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800">
            <p className="font-medium">Lưu ý:</p>
            <p>Bằng cấp sẽ được lưu trữ vào hồ sơ của nhân viên và nhân viên có thể xem được thông tin này.</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label htmlFor="employee">
              Nhân viên <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="employee"
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setShowEmployeeList(true);
                  }}
                  onFocus={() => setShowEmployeeList(true)}
                  placeholder="Tìm kiếm nhân viên theo tên, mã hoặc phòng ban"
                  className={`pl-10 ${errors.employeeId ? 'border-red-500' : ''}`}
                />
              </div>

              {showEmployeeList && employeeSearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        onClick={() => handleEmployeeSelect(emp)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {emp.code} • {emp.department} • {emp.position}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Không tìm thấy nhân viên
                    </div>
                  )}
                </div>
              )}

              {formData.employeeId && formData.employeeName && (
                <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
                  <div className="font-medium">{formData.employeeName}</div>
                  <div className="text-muted-foreground">
                    {formData.employeeCode} • {formData.department} • {formData.position}
                  </div>
                </div>
              )}
            </div>
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>

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
                <Label htmlFor="major">Chuyên ngành</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  placeholder="VD: Khoa học Máy tính"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Trình độ</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleChange('level', value)}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cử nhân">Cử nhân</SelectItem>
                    <SelectItem value="Thạc sĩ">Thạc sĩ</SelectItem>
                    <SelectItem value="Tiến sĩ">Tiến sĩ</SelectItem>
                  </SelectContent>
                </Select>
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
                <span className="text-xs text-muted-foreground ml-1">
                  (để trống nếu vô thời hạn)
                </span>
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

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="document">
              Tài liệu đính kèm
              <span className="text-xs text-muted-foreground ml-1">
                (PDF, JPG, PNG - Tối đa 10MB)
              </span>
            </Label>

            {!uploadedFile && !formData.documentUrl ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  id="document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="document"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nhấn để chọn file</p>
                    <p className="text-xs text-muted-foreground">
                      hoặc kéo thả file vào đây
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedFile?.name || formData.documentUrl.split('/').pop()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedFile ? `${(uploadedFile.size / 1024).toFixed(2)} KB` : 'Đã tải lên'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {errors.documentUrl && (
              <p className="text-sm text-red-500">{errors.documentUrl}</p>
            )}
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
                isEdit ? 'Xác nhận' : 'Xác nhận'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}