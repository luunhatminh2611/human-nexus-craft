// pages/hr/components/UploadDocumentModal.tsx

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import { documentTypeLabels } from '../../../mock/employeeFile';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
}: UploadDocumentModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: 'OTHER' as 'RECRUITMENT' | 'CONTRACT' | 'INSURANCE' | 'CERTIFICATE' | 'DECISION' | 'TRAINING' | 'OTHER',
    documentName: '',
    description: '',
    decisionNumber: '',
    issueDate: '',
    expiryDate: '',
    isImportant: false,
    isConfidential: false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File không được vượt quá 10MB' }));
        return;
      }

      // Check file type
      const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        setErrors(prev => ({ 
          ...prev, 
          file: 'Chỉ chấp nhận file PDF, JPG, PNG, DOC, DOCX' 
        }));
        return;
      }

      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Vui lòng nhập tên tài liệu';
    }

    if (!selectedFile) {
      newErrors.file = 'Vui lòng chọn file để upload';
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

    console.log('Uploading document:', {
      ...formData,
      file: selectedFile,
      uploadedBy: user?.name || 'Admin',
      uploadedById: user?.id || 'ADMIN_ID',
    });

    setIsSubmitting(false);
    resetForm();
    onSuccess();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      documentType: 'OTHER',
      documentName: '',
      description: '',
      decisionNumber: '',
      issueDate: '',
      expiryDate: '',
      isImportant: false,
      isConfidential: false,
    });
    setSelectedFile(null);
    setErrors({});
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload tài liệu hồ sơ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              File được chấp nhận: PDF, JPG, PNG, DOC, DOCX. Dung lượng tối đa: 10MB
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Nhân viên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                placeholder="Nhập mã hoặc tên nhân viên"
              />
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">
                Loại tài liệu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.documentType}
                onValueChange={(value: any) => handleChange('documentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECRUITMENT">{documentTypeLabels.RECRUITMENT}</SelectItem>
                  <SelectItem value="CONTRACT">{documentTypeLabels.CONTRACT}</SelectItem>
                  <SelectItem value="INSURANCE">{documentTypeLabels.INSURANCE}</SelectItem>
                  <SelectItem value="CERTIFICATE">{documentTypeLabels.CERTIFICATE}</SelectItem>
                  <SelectItem value="DECISION">{documentTypeLabels.DECISION}</SelectItem>
                  <SelectItem value="TRAINING">{documentTypeLabels.TRAINING}</SelectItem>
                  <SelectItem value="OTHER">{documentTypeLabels.OTHER}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentName">
              Tên tài liệu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="documentName"
              value={formData.documentName}
              onChange={(e) => handleChange('documentName', e.target.value)}
              placeholder="VD: Hợp đồng lao động, Bằng tốt nghiệp..."
            />
            {errors.documentName && (
              <p className="text-sm text-red-500">{errors.documentName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về tài liệu"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="decisionNumber">Số quyết định</Label>
              <Input
                id="decisionNumber"
                value={formData.decisionNumber}
                onChange={(e) => handleChange('decisionNumber', e.target.value)}
                placeholder="VD: HĐ-2024/001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueDate">Ngày ban hành</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Ngày hết hạn</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Để trống nếu không có thời hạn
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">
              File tài liệu <span className="text-red-500">*</span>
            </Label>
            <div className="border-2 border-dashed rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                {selectedFile ? (
                  <>
                    <File className="h-12 w-12 text-blue-600" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Chọn file khác
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Kéo thả file vào đây hoặc click để chọn
                    </p>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={handleFileChange}
                      className="max-w-xs"
                    />
                  </>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isImportant"
                checked={formData.isImportant}
                onChange={(e) => handleChange('isImportant', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isImportant" className="cursor-pointer">
                Đánh dấu là tài liệu quan trọng
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isConfidential"
                checked={formData.isConfidential}
                onChange={(e) => handleChange('isConfidential', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isConfidential" className="cursor-pointer">
                Đánh dấu là tài liệu bảo mật
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Xác nhận
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}