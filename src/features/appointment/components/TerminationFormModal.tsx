// pages/hr/components/TerminationFormModal.tsx

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
import { X, Save, AlertCircle, Upload, FileText } from 'lucide-react';
import { type Termination } from '../../../mock/appointment';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

interface TerminationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  termination?: Termination | null;
  onSuccess: () => void;
}

export default function TerminationFormModal({
  isOpen,
  onClose,
  termination,
  onSuccess,
}: TerminationFormModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    department: '',
    appointmentDecisionNumber: '',
    reason: '',
    decisionNumber: '',
    decisionDate: '',
    effectiveDate: '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (termination) {
      setFormData({
        employeeName: termination.employeeName,
        position: termination.position,
        department: termination.department,
        appointmentDecisionNumber: termination.appointmentDecisionNumber || '',
        reason: termination.reason,
        decisionNumber: termination.decisionNumber,
        decisionDate: termination.decisionDate,
        effectiveDate: termination.effectiveDate,
        note: termination.note || '',
      });
    } else {
      resetForm();
    }
    setErrors({});
    setUploadedFiles([]);
  }, [termination, isOpen]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      employeeName: '',
      position: '',
      department: '',
      appointmentDecisionNumber: '',
      reason: '',
      decisionNumber: '',
      decisionDate: today,
      effectiveDate: today,
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
      newErrors.position = 'Vui lòng nhập chức vụ bị miễn nhiệm';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Vui lòng nhập phòng ban';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do miễn nhiệm';
    }

    if (!formData.decisionNumber.trim()) {
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định miễn nhiệm';
    }

    if (!formData.decisionDate) {
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Vui lòng chọn ngày có hiệu lực';
    }

    // Validate effective date is after decision date
    if (formData.decisionDate && formData.effectiveDate) {
      const decision = new Date(formData.decisionDate);
      const effective = new Date(formData.effectiveDate);
      if (effective < decision) {
        newErrors.effectiveDate = 'Ngày có hiệu lực phải sau hoặc bằng ngày quyết định';
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

    console.log('Submitting termination:', {
      ...formData,
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
            {termination ? 'Chỉnh sửa quyết định miễn nhiệm' : 'Tạo quyết định miễn nhiệm mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="details">Chi tiết miễn nhiệm</TabsTrigger>
            <TabsTrigger value="files">File đính kèm</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Quyết định miễn nhiệm là bản ghi độc lập, không cần phải liên kết với quyết định bổ nhiệm trước đó.
              </AlertDescription>
            </Alert>

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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="position">
                  Chức vụ bị miễn nhiệm <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Nhập chức vụ bị miễn nhiệm"
                />
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="appointmentDecisionNumber">
                  Số quyết định bổ nhiệm (nếu có)
                </Label>
                <Input
                  id="appointmentDecisionNumber"
                  value={formData.appointmentDecisionNumber}
                  onChange={(e) => handleChange('appointmentDecisionNumber', e.target.value)}
                  placeholder="VD: QD-BN/2024/001"
                />
                <p className="text-xs text-muted-foreground">
                  Nhập số quyết định bổ nhiệm trước đó nếu muốn liên kết (không bắt buộc)
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Lý do miễn nhiệm <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                  placeholder="Mô tả chi tiết lý do miễn nhiệm (VD: hết thời hạn bổ nhiệm, nghỉ hưu, vi phạm kỷ luật, chuyển công tác, v.v.)"
                  rows={6}
                />
                {errors.reason && (
                  <p className="text-sm text-red-500">{errors.reason}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="decisionNumber">
                    Số quyết định miễn nhiệm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="decisionNumber"
                    value={formData.decisionNumber}
                    onChange={(e) => handleChange('decisionNumber', e.target.value)}
                    placeholder="VD: QD-MN/2024/001"
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

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                  placeholder="Ghi chú thêm về quá trình chuyển giao, kế hoạch tái cơ cấu, v.v. (nếu có)"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Đính kèm quyết định miễn nhiệm đã ký, biên bản bàn giao (nếu có), và các tài liệu liên quan khác.
                </AlertDescription>
              </Alert>

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

        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Lưu ý:</strong> Quyết định miễn nhiệm có thể chỉnh sửa sau khi tạo. 
            Đảm bảo thông tin chính xác và đầy đủ trước khi lưu.
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
                {termination ? 'Cập nhật' : 'Tạo quyết định'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}