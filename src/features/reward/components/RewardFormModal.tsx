// pages/hr/components/RewardFormModal.tsx

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
import { X, Save, Upload, FileText, Trash2 } from 'lucide-react';
import { type Reward, type RewardAttachment } from '../../../mock/reward';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface RewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: Reward | null;
  onSuccess: () => void;
}

export default function RewardFormModal({
  isOpen,
  onClose,
  reward,
  onSuccess,
}: RewardFormModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    employeeName: '',
    departmentName: '',
    position: '',
    rewardType: '',
    achievement: '',
    reason: '',
    amount: '',
    decisionNumber: '',
    decisionDate: '',
  });

  const [attachments, setAttachments] = useState<RewardAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -------------------- Init data -------------------- */
  useEffect(() => {
    if (reward) {
      setFormData({
        employeeName: reward.employeeName,
        departmentName: reward.departmentName,
        position: reward.position,
        rewardType: reward.rewardType,
        achievement: reward.achievement,
        reason: reward.reason,
        amount: reward.amount.toString(),
        decisionNumber: reward.decisionNumber,
        decisionDate: reward.decisionDate,
      });
      setAttachments(reward.attachments || []);
    } else {
      setFormData({
        employeeName: '',
        departmentName: '',
        position: '',
        rewardType: '',
        achievement: '',
        reason: '',
        amount: '',
        decisionNumber: '',
        decisionDate: '',
      });
      setAttachments([]);
    }
    setUploadingFiles([]);
    setErrors({});
  }, [reward, isOpen]);

  /* -------------------- File Upload -------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types (only PDF, images, Word docs)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: 'Chỉ chấp nhận file PDF, ảnh (JPG, PNG) hoặc Word',
      }));
      return;
    }

    // Validate file size (max 10MB per file)
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: 'Kích thước file không được vượt quá 10MB',
      }));
      return;
    }

    setUploadingFiles(prev => [...prev, ...files]);
    setErrors(prev => ({ ...prev, files: '' }));

    // Simulate upload (replace with actual API call)
    files.forEach((file, index) => {
      setTimeout(() => {
        const newAttachment: RewardAttachment = {
          id: `ATT_${Date.now()}_${index}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          url: URL.createObjectURL(file), // Temporary URL for preview
          uploadedAt: new Date().toISOString(),
        };

        setAttachments(prev => [...prev, newAttachment]);
        setUploadingFiles(prev => prev.filter(f => f !== file));
      }, 1000 + index * 500);
    });
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /* -------------------- Handlers -------------------- */
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    if (!number) return '';
    return new Intl.NumberFormat('vi-VN').format(Number(number));
  };

  const handleAmountChange = (value: string) => {
    handleChange('amount', value.replace(/\D/g, ''));
  };

  /* -------------------- Validation -------------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeName.trim())
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    if (!formData.departmentName.trim())
      newErrors.departmentName = 'Vui lòng nhập phòng ban';
    if (!formData.position.trim())
      newErrors.position = 'Vui lòng nhập chức vụ';
    if (!formData.rewardType.trim())
      newErrors.rewardType = 'Vui lòng nhập loại khen thưởng';
    if (!formData.achievement.trim())
      newErrors.achievement = 'Vui lòng nhập thành tích';
    if (!formData.reason.trim())
      newErrors.reason = 'Vui lòng nhập lý do khen thưởng';

    if (!formData.amount) {
      newErrors.amount = 'Vui lòng nhập mức khen thưởng';
    } else if (isNaN(Number(formData.amount))) {
      newErrors.amount = 'Mức khen thưởng phải là số';
    }

    if (!formData.decisionNumber.trim()) {
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
    }
    if (!formData.decisionDate) {
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      attachments,
      createdBy: user?.name,
      createdById: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(reward ? 'Update reward:' : 'Create reward:', payload);

    setIsSubmitting(false);
    onSuccess();
  };

  /* ==================== UI ==================== */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reward ? 'Chỉnh sửa quyết định khen thưởng' : 'Tạo quyết định khen thưởng'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Employee info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h3 className="font-semibold text-sm">Thông tin nhân viên</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['employeeName', 'departmentName', 'position'].map(field => (
                <div key={field} className="space-y-2">
                  <Label>
                    {field === 'employeeName'
                      ? 'Tên nhân viên'
                      : field === 'departmentName'
                      ? 'Phòng ban'
                      : 'Chức vụ'}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={(formData as any)[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    placeholder={
                      field === 'employeeName'
                        ? 'VD: Nguyễn Văn A'
                        : field === 'departmentName'
                        ? 'VD: Phòng Kỹ thuật'
                        : 'VD: Senior Developer'
                    }
                  />
                  {errors[field] && (
                    <p className="text-sm text-red-500">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Reward info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Loại khen thưởng <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.rewardType}
                onChange={e => handleChange('rewardType', e.target.value)}
                placeholder="VD: Giải thưởng hoàn thành dự án xuất sắc"
              />
              {errors.rewardType && (
                <p className="text-sm text-red-500">{errors.rewardType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Thành tích <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={3}
                value={formData.achievement}
                onChange={e => handleChange('achievement', e.target.value)}
                placeholder="Mô tả thành tích của nhân viên..."
              />
              {errors.achievement && (
                <p className="text-sm text-red-500">{errors.achievement}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Lý do khen thưởng <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={4}
                value={formData.reason}
                onChange={e => handleChange('reason', e.target.value)}
                placeholder="Lý do chi tiết cho quyết định khen thưởng..."
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Mức khen thưởng (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formatCurrency(formData.amount)}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="VD: 10.000.000"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
              {formData.amount && !errors.amount && (
                <p className="text-sm text-muted-foreground">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(Number(formData.amount))}
                </p>
              )}
            </div>
          </div>

          {/* Decision info */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-sm">Thông tin quyết định</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Số quyết định <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.decisionNumber}
                  onChange={e => handleChange('decisionNumber', e.target.value)}
                  placeholder="VD: QD-KT/2024/001"
                />
                {errors.decisionNumber && (
                  <p className="text-sm text-red-500">{errors.decisionNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Ngày quyết định <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.decisionDate}
                  onChange={e => handleChange('decisionDate', e.target.value)}
                />
                {errors.decisionDate && (
                  <p className="text-sm text-red-500">{errors.decisionDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>File đính kèm</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Tải file lên
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Chấp nhận: PDF, JPG, PNG, Word. Tối đa 10MB/file
              </p>
              {errors.files && (
                <p className="text-sm text-red-500">{errors.files}</p>
              )}
            </div>

            {/* Uploading files */}
            {uploadingFiles.length > 0 && (
              <div className="space-y-2">
                {uploadingFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} - Đang tải lên...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Attached files */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Alert>
            <AlertDescription>
              <strong>
                {reward
                  ? 'Cập nhật quyết định khen thưởng sẽ được lưu lại trong hệ thống.'
                  : 'Quyết định khen thưởng sẽ được tạo và ghi nhận vào hồ sơ nhân viên.'}
              </strong>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" /> Hủy
          </Button>

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {reward ? 'Xác nhận' : 'Xác nhận'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}