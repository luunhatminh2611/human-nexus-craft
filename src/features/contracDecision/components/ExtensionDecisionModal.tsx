import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
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
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { X, Save, AlertCircle, FileText, Upload, File } from 'lucide-react';

import {
  ExtensionDecision,
  extensionDecisionTypeLabels,
  FileAttachment,
} from '../../../mock/contractDecision';

interface ExtensionDecisionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: ExtensionDecision | null;
  onSuccess: () => void;
}

export default function ExtensionDecisionFormModal({
  isOpen,
  onClose,
  decision,
  onSuccess,
}: ExtensionDecisionFormModalProps) {
  const isEdit = !!decision;

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: '',
    position: '',
    decisionType: 'EXTEND' as 'EXTEND' | 'RENEW',
    decisionNumber: '',
    decisionDate: '',
    effectiveDate: '',
    previousExpiryDate: '',
    termMonths: 12,
    newExpiryDate: '',
    salary: 0,
    reason: '',
    note: '',
    attachments: [] as FileAttachment[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (decision) {
        setFormData({
          employeeId: decision.employeeId,
          employeeName: decision.employeeName,
          department: decision.department,
          position: decision.position,
          decisionType: decision.decisionType,
          decisionNumber: decision.decisionNumber,
          decisionDate: decision.decisionDate,
          effectiveDate: decision.effectiveDate,
          previousExpiryDate: decision.previousExpiryDate,
          termMonths: decision.termMonths,
          newExpiryDate: decision.newExpiryDate,
          salary: decision.salary,
          reason: decision.reason,
          note: decision.note || '',
          attachments: decision.attachments || [],
        });
      } else {
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, decision]);

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      department: '',
      position: '',
      decisionType: 'EXTEND',
      decisionNumber: '',
      decisionDate: '',
      effectiveDate: '',
      previousExpiryDate: '',
      termMonths: 12,
      newExpiryDate: '',
      salary: 0,
      reason: '',
      note: '',
      attachments: [],
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeName.trim())
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    if (!formData.department.trim())
      newErrors.department = 'Vui lòng nhập phòng ban';
    if (!formData.position.trim())
      newErrors.position = 'Vui lòng nhập chức vụ';
    if (!formData.decisionNumber.trim())
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
    if (!formData.decisionDate)
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    if (!formData.effectiveDate)
      newErrors.effectiveDate = 'Vui lòng chọn ngày hiệu lực';
    if (!formData.previousExpiryDate)
      newErrors.previousExpiryDate = 'Vui lòng chọn ngày hết hạn cũ';
    if (formData.termMonths <= 0)
      newErrors.termMonths = 'Thời hạn phải lớn hơn 0';
    if (!formData.reason.trim())
      newErrors.reason = 'Vui lòng nhập lý do';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto calculate new expiry date
  useEffect(() => {
    if (formData.previousExpiryDate && formData.termMonths > 0) {
      const previousDate = new Date(formData.previousExpiryDate);
      const newDate = new Date(previousDate);
      newDate.setMonth(newDate.getMonth() + formData.termMonths);
      
      setFormData(prev => ({
        ...prev,
        newExpiryDate: newDate.toISOString().split('T')[0],
      }));
    }
  }, [formData.previousExpiryDate, formData.termMonths]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files: FileAttachment[] = Array.from(e.target.files).map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: '#',
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const handleRemoveFile = (fileId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(f => f.id !== fileId),
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    console.log(isEdit ? 'Updating' : 'Creating', formData);

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEdit ? 'Chỉnh sửa' : 'Tạo mới'} quyết định gia hạn/tái ký
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Thông tin nhân viên</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Tên nhân viên <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.employeeName}
                  onChange={e =>
                    setFormData({ ...formData, employeeName: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                />
                {errors.employeeName && (
                  <p className="text-sm text-red-500">{errors.employeeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Phòng ban <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.department}
                  onChange={e =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Phòng Kỹ thuật"
                />
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Chức vụ <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.position}
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="Nhân viên"
                />
                {errors.position && (
                  <p className="text-sm text-red-500">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Lương (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.salary}
                  onChange={e =>
                    setFormData({ ...formData, salary: Number(e.target.value) })
                  }
                  placeholder="15000000"
                />
              </div>
            </div>
          </div>

          {/* Decision Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Thông tin quyết định</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Loại quyết định <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.decisionType}
                  onValueChange={v =>
                    setFormData({ ...formData, decisionType: v as 'EXTEND' | 'RENEW' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXTEND">
                      {extensionDecisionTypeLabels.EXTEND}
                    </SelectItem>
                    <SelectItem value="RENEW">
                      {extensionDecisionTypeLabels.RENEW}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Số quyết định <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.decisionNumber}
                  onChange={e =>
                    setFormData({ ...formData, decisionNumber: e.target.value })
                  }
                  placeholder="123/QĐ-GH"
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
                  onChange={e =>
                    setFormData({ ...formData, decisionDate: e.target.value })
                  }
                />
                {errors.decisionDate && (
                  <p className="text-sm text-red-500">{errors.decisionDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Ngày hiệu lực <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={e =>
                    setFormData({ ...formData, effectiveDate: e.target.value })
                  }
                />
                {errors.effectiveDate && (
                  <p className="text-sm text-red-500">{errors.effectiveDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contract Term */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Thời hạn hợp đồng</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>
                  Ngày hết hạn cũ <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.previousExpiryDate}
                  onChange={e =>
                    setFormData({ ...formData, previousExpiryDate: e.target.value })
                  }
                />
                {errors.previousExpiryDate && (
                  <p className="text-sm text-red-500">{errors.previousExpiryDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Gia hạn (tháng) <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  value={formData.termMonths}
                  onChange={e =>
                    setFormData({ ...formData, termMonths: Number(e.target.value) })
                  }
                  min="1"
                />
                {errors.termMonths && (
                  <p className="text-sm text-red-500">{errors.termMonths}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Ngày hết hạn mới</Label>
                <Input
                  type="date"
                  value={formData.newExpiryDate}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ngày hết hạn mới được tính tự động từ ngày hết hạn cũ + {formData.termMonths} tháng
              </AlertDescription>
            </Alert>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>
              Lý do <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.reason}
              onChange={e =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Nhập lý do gia hạn/tái ký..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.note}
              onChange={e =>
                setFormData({ ...formData, note: e.target.value })
              }
              placeholder="Ghi chú thêm về quyết định..."
              rows={2}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>File đính kèm</Label>
            <div className="flex items-center gap-2">
              <Input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Đã chọn {formData.attachments.length} file
                </p>
                {formData.attachments.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                  >
                    <File className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Hủy
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
                {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}