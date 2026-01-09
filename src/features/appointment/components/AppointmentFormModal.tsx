// pages/hr/components/AppointmentFormModal.tsx

import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { X, Save, AlertCircle, Upload, FileText } from 'lucide-react';
import { type Appointment, appointmentTypeLabels } from '../../../mock/appointment';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  onSuccess: () => void;
}

export default function AppointmentFormModal({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}: AppointmentFormModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    department: '',
    appointmentType: 'NEW' as 'NEW' | 'REAPPOINTMENT' | 'CONCURRENT',
    reason: '',
    responsibilities: '',
    salary: '',
    allowance: '',
    decisionNumber: '',
    decisionDate: '',
    effectiveDate: '',
    termMonths: '',
    hasTermLimit: 'yes' as 'yes' | 'no',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        employeeName: appointment.employeeName,
        position: appointment.position,
        department: appointment.department,
        appointmentType: appointment.appointmentType,
        reason: appointment.reason,
        responsibilities: appointment.responsibilities,
        salary: appointment.salary?.toString() || '',
        allowance: appointment.allowance?.toString() || '',
        decisionNumber: appointment.decisionNumber,
        decisionDate: appointment.decisionDate,
        effectiveDate: appointment.effectiveDate,
        termMonths: appointment.termMonths?.toString() || '',
        hasTermLimit: appointment.termMonths ? 'yes' : 'no',
        note: appointment.note || '',
      });
    } else {
      resetForm();
    }
    setErrors({});
    setUploadedFiles([]);
  }, [appointment, isOpen]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      employeeName: '',
      position: '',
      department: '',
      appointmentType: 'NEW',
      reason: '',
      responsibilities: '',
      salary: '',
      allowance: '',
      decisionNumber: '',
      decisionDate: today,
      effectiveDate: today,
      termMonths: '',
      hasTermLimit: 'yes',
      note: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Vui lòng nhập chức vụ';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Vui lòng nhập phòng ban';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do bổ nhiệm';
    }

    if (!formData.responsibilities.trim()) {
      newErrors.responsibilities = 'Vui lòng nhập nhiệm vụ và quyền hạn';
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

    if (formData.hasTermLimit === 'yes' && !formData.termMonths) {
      newErrors.termMonths = 'Vui lòng nhập thời hạn bổ nhiệm';
    }

    // Validate numbers
    if (formData.salary && isNaN(Number(formData.salary))) {
      newErrors.salary = 'Lương phải là số';
    }

    if (formData.allowance && isNaN(Number(formData.allowance))) {
      newErrors.allowance = 'Phụ cấp phải là số';
    }

    if (formData.termMonths && isNaN(Number(formData.termMonths))) {
      newErrors.termMonths = 'Thời hạn phải là số';
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

    const expiryDate = formData.hasTermLimit === 'yes' && formData.termMonths && formData.effectiveDate
      ? calculateExpiryDate(formData.effectiveDate, Number(formData.termMonths))
      : null;

    console.log('Submitting appointment:', {
      ...formData,
      termMonths: formData.hasTermLimit === 'yes' ? Number(formData.termMonths) : null,
      expiryDate,
      salary: formData.salary ? Number(formData.salary) : null,
      allowance: formData.allowance ? Number(formData.allowance) : null,
      createdBy: user?.name || 'Admin',
      createdById: user?.id || 'ADMIN_ID',
      attachments: uploadedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const calculateExpiryDate = (effectiveDate: string, termMonths: number): string => {
    const date = new Date(effectiveDate);
    date.setMonth(date.getMonth() + termMonths);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Chỉnh sửa quyết định bổ nhiệm' : 'Tạo quyết định bổ nhiệm mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="details">Chi tiết bổ nhiệm</TabsTrigger>
            <TabsTrigger value="salary">Lương & Phúc lợi</TabsTrigger>
            <TabsTrigger value="files">File đính kèm</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="appointmentType">
                  Loại bổ nhiệm <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value: any) => handleChange('appointmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">{appointmentTypeLabels.NEW}</SelectItem>
                    <SelectItem value="REAPPOINTMENT">{appointmentTypeLabels.REAPPOINTMENT}</SelectItem>
                    <SelectItem value="CONCURRENT">{appointmentTypeLabels.CONCURRENT}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  Chức vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Nhập chức vụ được bổ nhiệm"
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
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do bổ nhiệm <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  placeholder="Mô tả chi tiết lý do bổ nhiệm, thành tích và năng lực của nhân viên"
                  rows={4}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">
                  Nhiệm vụ và quyền hạn <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  placeholder="Mô tả chi tiết nhiệm vụ, trách nhiệm và quyền hạn của chức vụ"
                  rows={6}
                />
                {errors.responsibilities && (
                  <p className="text-sm text-red-500">{errors.responsibilities}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionNumber">
                    Số quyết định <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="decisionNumber"
                    value={formData.decisionNumber}
                    onChange={(e) => handleChange('decisionNumber', e.target.value)}
                    placeholder="VD: QD-BN/2024/001"
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
              </div>

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <Label>Thời hạn bổ nhiệm</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasTermLimit"
                      value="yes"
                      checked={formData.hasTermLimit === 'yes'}
                      onChange={(e) => handleChange('hasTermLimit', e.target.value)}
                      className="cursor-pointer"
                    />
                    <span>Có thời hạn</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hasTermLimit"
                      value="no"
                      checked={formData.hasTermLimit === 'no'}
                      onChange={(e) => handleChange('hasTermLimit', e.target.value)}
                      className="cursor-pointer"
                    />
                    <span>Vô thời hạn</span>
                  </label>
                </div>

                {formData.hasTermLimit === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor="termMonths">Số tháng</Label>
                    <Input
                      id="termMonths"
                      type="number"
                      value={formData.termMonths}
                      onChange={(e) => handleChange('termMonths', e.target.value)}
                      placeholder="VD: 36 (3 năm)"
                    />
                    {errors.termMonths && (
                      <p className="text-sm text-red-500">{errors.termMonths}</p>
                    )}
                    {formData.termMonths && formData.effectiveDate && (
                      <p className="text-sm text-muted-foreground">
                        Hết hạn: {new Date(calculateExpiryDate(formData.effectiveDate, Number(formData.termMonths))).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
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
          </TabsContent>

          <TabsContent value="salary" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Mức lương (VNĐ)</Label>
                <Input
                  id="salary"
                  value={formatCurrency(formData.salary)}
                  onChange={(e) => handleAmountChange('salary', e.target.value)}
                  placeholder="Nhập mức lương"
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

            {(formData.salary || formData.allowance) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-sm text-green-900 mb-2">Tổng thu nhập</h4>
                <div className="space-y-1 text-sm">
                  {formData.salary && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lương:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.salary))}
                      </span>
                    </div>
                  )}
                  {formData.allowance && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phụ cấp:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.allowance))}
                      </span>
                    </div>
                  )}
                  {formData.salary && formData.allowance && (
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Tổng:</span>
                      <span className="font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          Number(formData.salary) + Number(formData.allowance)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="fileUpload"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nhấp để chọn file hoặc kéo thả file vào đây
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hỗ trợ: PDF, Word, JPG, PNG (Tối đa 10MB)
                  </p>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>File đã chọn ({uploadedFiles.length})</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Quyết định bổ nhiệm có thể chỉnh sửa sau khi tạo. Đảm bảo thông tin chính xác trước khi lưu.
          </AlertDescription>
        </Alert>

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
                {appointment ? 'Xác nhận' : 'Xác nhận'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}