import { useState, useEffect, useRef } from 'react';
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
import { certificateApi } from '@/features/degree/api/degree';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { AlertCircle, Upload, X, FileText, Search, Loader2 } from 'lucide-react';
import type { Certificate } from '../pages/DegreeHRPage';

interface DegreeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate?: Certificate | null;
  onSuccess: () => void;
}

interface FormData {
  employeeId: string;
  certificateType: string;
  certificateName: string;
  organization: string;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  note: string;
}

interface EmployeeOption {
  id: number;
  fullName: string;
  employeeCode: string;
  departmentName?: string;
  positionName?: string;
}

export default function DegreeFormModal({ isOpen, onClose, certificate, onSuccess }: DegreeFormModalProps) {
  const isEdit = !!certificate;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<FormData>({
    employeeId: '',
    certificateType: '',
    certificateName: '',
    organization: '',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    note: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Employee search states
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch danh sách nhân viên khi modal mở
  useEffect(() => {
    if (!isOpen) return;
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const data = await employeeApi.getAll();
        setAllEmployees(data || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhân viên:', error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [isOpen]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowEmployeeList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (isOpen && certificate) {
      setFormData({
        employeeId: certificate.employeeId?.toString() || '',
        certificateType: certificate.certificateType || '',
        certificateName: certificate.certificateName || '',
        organization: certificate.organization || '',
        certificateNumber: certificate.certificateNumber || '',
        issueDate: certificate.issueDate ? certificate.issueDate.split('T')[0] : '',
        expiryDate: certificate.expiryDate ? certificate.expiryDate.split('T')[0] : '',
        note: certificate.note || '',
      });
      setSelectedEmployeeName(certificate.employeeName || '');
      setEmployeeSearch(certificate.employeeName || '');
      setUploadedFile(null);
    } else if (isOpen) {
      setFormData({
        employeeId: '',
        certificateType: '',
        certificateName: '',
        organization: '',
        certificateNumber: '',
        issueDate: '',
        expiryDate: '',
        note: '',
      });
      setEmployeeSearch('');
      setSelectedEmployeeName('');
      setUploadedFile(null);
    }
    setErrors({});
    setShowEmployeeList(false);
  }, [isOpen, certificate]);

  // Filter nhân viên theo tên hoặc mã
  const filteredEmployees: EmployeeOption[] = employeeSearch.trim()
    ? allEmployees.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
          emp.employeeCode?.toLowerCase().includes(employeeSearch.toLowerCase())
      )
    : allEmployees.slice(0, 20);

  const handleEmployeeSelect = (emp: EmployeeOption) => {
    setFormData((prev) => ({ ...prev, employeeId: emp.id.toString() }));
    setSelectedEmployeeName(emp.fullName);
    setEmployeeSearch(emp.fullName);
    setShowEmployeeList(false);
    setErrors((prev) => ({ ...prev, employeeId: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, uploadedFile: 'Kích thước file không được vượt quá 10MB' }));
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({ ...prev, uploadedFile: 'Chỉ chấp nhận file PDF, JPG, JPEG, PNG' }));
      return;
    }
    setUploadedFile(file);
  };

  const handleRemoveFile = () => setUploadedFile(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.employeeId) newErrors.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.certificateType) newErrors.certificateType = 'Vui lòng chọn loại bằng cấp';
    if (!formData.certificateName.trim()) newErrors.certificateName = 'Vui lòng nhập tên bằng cấp';
    if (!formData.organization.trim()) newErrors.organization = 'Vui lòng nhập tổ chức cấp';
    if (!formData.issueDate) newErrors.issueDate = 'Vui lòng chọn ngày cấp';
    if (formData.expiryDate && formData.issueDate) {
      if (new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
        newErrors.expiryDate = 'Ngày hết hạn phải sau ngày cấp';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const payload = {
      employeeId: Number(formData.employeeId),
      certificateNumber: formData.certificateNumber || undefined,
      certificateName: formData.certificateName,
      certificateType: formData.certificateType,
      organization: formData.organization,
      issueDate: formData.issueDate,
      expiryDate: formData.expiryDate || undefined,
      note: formData.note || undefined,
      ...(isEdit && certificate ? { id: certificate.id } : {}),
    };

    try {
      if (isEdit) {
        await certificateApi.update(payload, uploadedFile || undefined);
      } else {
        await certificateApi.create(payload, uploadedFile || undefined);
      }
      onSuccess();
    } catch (error) {
      console.error('Lỗi khi lưu bằng cấp:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Tìm thông tin nhân viên đã chọn để hiển thị
  const selectedEmployee = allEmployees.find((e) => e.id.toString() === formData.employeeId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa bằng cấp' : 'Thêm bằng cấp mới'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800">
            <p className="font-medium">Lưu ý:</p>
            <p>Bằng cấp sẽ được lưu trữ vào hồ sơ của nhân viên và nhân viên có thể xem được thông tin này.</p>
          </div>
        </div>

        <div className="space-y-4 mt-4">
          {/* Employee Search */}
          <div className="space-y-2">
            <Label>
              Nhân viên <span className="text-red-500">*</span>
            </Label>
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                {isLoadingEmployees ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setShowEmployeeList(true);
                    // Nếu xóa hết text thì clear selection
                    if (!e.target.value) {
                      setFormData((prev) => ({ ...prev, employeeId: '' }));
                      setSelectedEmployeeName('');
                    }
                  }}
                  onFocus={() => setShowEmployeeList(true)}
                  placeholder="Tìm theo mã hoặc tên nhân viên..."
                  className={`pl-10 ${errors.employeeId ? 'border-red-500' : ''}`}
                  disabled={isLoadingEmployees}
                />
              </div>

              {/* Dropdown danh sách nhân viên */}
              {showEmployeeList && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                  {isLoadingEmployees ? (
                    <div className="px-3 py-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải danh sách...
                    </div>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleEmployeeSelect(emp)}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                          formData.employeeId === emp.id.toString() ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="font-medium text-sm">{emp.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {emp.employeeCode}
                          {emp.departmentName && ` · ${emp.departmentName}`}
                          {emp.positionName && ` · ${emp.positionName}`}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-sm text-muted-foreground text-center">
                      Không tìm thấy nhân viên nào
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin nhân viên đã chọn */}
              {selectedEmployee && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-green-800">{selectedEmployee.fullName}</span>
                    <span className="text-green-600 ml-2 text-xs">
                      {selectedEmployee.employeeCode}
                      {selectedEmployee.departmentName && ` · ${selectedEmployee.departmentName}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, employeeId: '' }));
                      setSelectedEmployeeName('');
                      setEmployeeSearch('');
                    }}
                    className="text-green-600 hover:text-red-500 transition-colors ml-2"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Loại bằng cấp <span className="text-red-500">*</span></Label>
            <Select value={formData.certificateType} onValueChange={(v) => handleChange('certificateType', v)}>
              <SelectTrigger className={errors.certificateType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn loại bằng cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDUCATION">Học vấn</SelectItem>
                <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
                <SelectItem value="LICENSE">Giấy phép hành nghề</SelectItem>
              </SelectContent>
            </Select>
            {errors.certificateType && <p className="text-sm text-red-500">{errors.certificateType}</p>}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Tên bằng cấp <span className="text-red-500">*</span></Label>
            <Input
              value={formData.certificateName}
              onChange={(e) => handleChange('certificateName', e.target.value)}
              placeholder="VD: Cử nhân Khoa học Máy tính"
              className={errors.certificateName ? 'border-red-500' : ''}
            />
            {errors.certificateName && <p className="text-sm text-red-500">{errors.certificateName}</p>}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label>Tổ chức cấp <span className="text-red-500">*</span></Label>
            <Input
              value={formData.organization}
              onChange={(e) => handleChange('organization', e.target.value)}
              placeholder="VD: Đại học Bách Khoa Hà Nội"
              className={errors.organization ? 'border-red-500' : ''}
            />
            {errors.organization && <p className="text-sm text-red-500">{errors.organization}</p>}
          </div>

          {/* Certificate Number */}
          <div className="space-y-2">
            <Label>Số bằng cấp / chứng chỉ</Label>
            <Input
              value={formData.certificateNumber}
              onChange={(e) => handleChange('certificateNumber', e.target.value)}
              placeholder="VD: BKHN-2019-12345"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày cấp <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                className={errors.issueDate ? 'border-red-500' : ''}
              />
              {errors.issueDate && <p className="text-sm text-red-500">{errors.issueDate}</p>}
            </div>
            <div className="space-y-2">
              <Label>
                Ngày hết hạn
                <span className="text-xs text-muted-foreground ml-1">(để trống nếu vô thời hạn)</span>
              </Label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleChange('expiryDate', e.target.value)}
                className={errors.expiryDate ? 'border-red-500' : ''}
              />
              {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>
              Tài liệu đính kèm
              <span className="text-xs text-muted-foreground ml-1">(PDF, JPG, PNG – tối đa 10MB)</span>
            </Label>
            {!uploadedFile && !certificate?.id ? (
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  id="cert-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="cert-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nhấn để chọn file</p>
                    <p className="text-xs text-muted-foreground">hoặc kéo thả file vào đây</p>
                  </div>
                </label>
              </div>
            ) : uploadedFile ? (
              // Đã chọn file mới
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <FileText className="h-8 w-8 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB · File mới
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} title="Bỏ chọn file mới">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // Đang edit, hiển thị file cũ từ server
              <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{certificate?.certificateName}</p>
                  <p className="text-xs text-muted-foreground">File đã lưu trên server</p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `https://118.70.151.69:1234/api/certificate/${certificate.id}/download`,
                          {
                            headers: {
                              Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`,
                            },
                          }
                        );
                        if (!response.ok) throw new Error('Tải file thất bại');
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = certificate.certificateName || 'certificate';
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Lỗi tải file:', err);
                      }
                    }}
                    className="text-xs text-blue-600 hover:underline mt-0.5 block"
                  >
                    Tải file hiện tại
                  </button>
                </div>
                {/* Nút thay file mới */}
                <div>
                  <input
                    id="cert-file-replace"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cert-file-replace"
                    className="cursor-pointer inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="h-3 w-3" />
                    Thay file
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Thông tin bổ sung về bằng cấp..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang lưu...
                </>
              ) : (
                'Xác nhận'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}