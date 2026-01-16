// pages/hr/components/RewardFormModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/Button2';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { X, Save, Upload, FileText, Trash2, AlertCircle, Minus } from 'lucide-react';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { employeeApi } from '@/features/employees/api/employeeApi';
import {
  decisionApi,
  decisionAttachmentApi,
  DecisionType,
  DecisionStatus,
  type DecisionResponse,
  type RewardDetails,
} from '@/features/employees/api/decisionApi';

interface RewardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: DecisionResponse | null;
  onSuccess: () => void;
}

interface AttachmentFile {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  isUploading: boolean;
}

interface Employee {
  id: number;
  code: string;
  fullName: string;
  department?: { name: string };
  position?: { name: string };
}

export default function RewardFormModal({
  isOpen,
  onClose,
  reward,
  onSuccess,
}: RewardFormModalProps) {
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    decisionNumber: '',
    decisionDate: '',
    title: '',
    content: '',
    note: '',
    employeeIds: [] as number[],
    rewardType: '',
    rewardReason: '',
    rewardValue: '',
    achievement: '',
  });

  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Employee selection state
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  /* -------------------- Fetch employees -------------------- */
  const fetchEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const employees = await employeeApi.getAll();
      setAllEmployees(employees);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhân viên:', error);
      setApiError('Lỗi khi tải danh sách nhân viên');
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  /* -------------------- Init data -------------------- */
  useEffect(() => {
    // Fetch employees when modal opens
    if (isOpen) {
      fetchEmployees();
    }

    if (reward) {
      setFormData({
        decisionNumber: reward.decisionNumber,
        decisionDate: reward.decisionDate,
        title: reward.title || '',
        content: reward.content || '',
        note: reward.note || '',
        employeeIds: reward.employeeIds || [],
        rewardType: reward.details?.rewardType || '',
        rewardReason: reward.details?.rewardReason || '',
        rewardValue: reward.details?.rewardValue || '',
        achievement: reward.details?.achievement || '',
      });
      if (reward.id) {
        fetchAttachments(reward.id);
      }
    } else {
      setFormData({
        decisionNumber: '',
        decisionDate: '',
        title: '',
        content: '',
        note: '',
        employeeIds: [],
        rewardType: '',
        rewardReason: '',
        rewardValue: '',
        achievement: '',
      });
      setExistingAttachments([]);
    }
    setAttachmentFiles([]);
    setErrors({});
    setApiError(null);
    setSelectedEmployees([]);
  }, [reward, isOpen]);

  /* -------------------- Fetch existing attachments -------------------- */
  const fetchAttachments = async (decisionId: number) => {
    try {
      const attachments = await decisionAttachmentApi.getByDecisionId(decisionId);
      setExistingAttachments(attachments);
    } catch (error) {
      console.error('Lỗi khi lấy file đính kèm:', error);
    }
  };

  /* -------------------- Employee selection handlers -------------------- */
  const handleAddEmployee = (employeeId: string) => {
    const employee = allEmployees.find(e => e.id.toString() === employeeId);
    if (employee && !selectedEmployees.find(e => e.id === employee.id)) {
      setSelectedEmployees(prev => [...prev, employee]);
      setFormData(prev => ({
        ...prev,
        employeeIds: [...prev.employeeIds, employee.id],
      }));
    }
  };

  const handleRemoveEmployee = (employeeId: number) => {
    setSelectedEmployees(prev => prev.filter(e => e.id !== employeeId));
    setFormData(prev => ({
      ...prev,
      employeeIds: prev.employeeIds.filter(id => id !== employeeId),
    }));
  };

  const filteredEmployees = allEmployees.filter(emp =>
    !selectedEmployees.find(sel => sel.id === emp.id)
  );

  /* -------------------- File Upload -------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

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

    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: 'Kích thước file không được vượt quá 10MB',
      }));
      return;
    }

    const newFiles = files.map(file => ({
      id: `ATT_${Date.now()}_${Math.random()}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      isUploading: false,
    }));

    setAttachmentFiles(prev => [...prev, ...newFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const handleRemoveAttachmentFile = (fileId: string) => {
    setAttachmentFiles(prev => prev.filter(a => a.id !== fileId));
  };

  const handleRemoveExistingAttachment = async (attachmentId: number) => {
    if (!reward) return;

    try {
      await decisionAttachmentApi.delete(reward.id, attachmentId);
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (error) {
      setApiError('Lỗi khi xóa file đính kèm');
      console.error('Lỗi delete attachment:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  /* -------------------- Handlers -------------------- */
  const handleChange = (field: string, value: string | number[]) => {
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
    handleChange('rewardValue', value.replace(/\D/g, ''));
  };

  /* -------------------- Validation -------------------- */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.decisionNumber.trim()) {
      newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
    }
    if (!formData.decisionDate) {
      newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
    } else {
      const selectedDate = new Date(formData.decisionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        newErrors.decisionDate = 'Ngày quyết định không được là tương lai';
      }
    }

    if (!formData.rewardType.trim()) {
      newErrors.rewardType = 'Vui lòng nhập loại khen thưởng';
    }
    if (!formData.rewardReason.trim()) {
      newErrors.rewardReason = 'Vui lòng nhập lý do khen thưởng';
    }
    if (!formData.achievement.trim()) {
      newErrors.achievement = 'Vui lòng nhập thành tích';
    }

    if (formData.rewardValue) {
      if (isNaN(Number(formData.rewardValue))) {
        newErrors.rewardValue = 'Mức khen thưởng phải là số';
      }
    }

    if (formData.employeeIds.length === 0) {
      newErrors.employeeIds = 'Vui lòng chọn ít nhất một nhân viên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const details: RewardDetails = {
        rewardType: formData.rewardType,
        rewardReason: formData.rewardReason,
        rewardValue: formData.rewardValue,
        achievement: formData.achievement,
      };

      const payload = {
        decisionNumber: formData.decisionNumber,
        decisionType: DecisionType.REWARD,
        status: DecisionStatus.DRAFT,
        decisionDate: formData.decisionDate,
        title: formData.title || `Quyết định khen thưởng - ${formData.decisionNumber}`,
        content: formData.content,
        note: formData.note,
        employeeIds: formData.employeeIds,
        details,
      };

      let createdDecision: DecisionResponse;

      if (reward) {
        createdDecision = await decisionApi.update(reward.id, payload);
      } else {
        createdDecision = await decisionApi.create(payload);
      }

      // Upload new attachments
      if (attachmentFiles.length > 0) {
        for (const attachmentFile of attachmentFiles) {
          try {
            setAttachmentFiles(prev =>
              prev.map(f => (f.id === attachmentFile.id ? { ...f, isUploading: true } : f))
            );

            await decisionAttachmentApi.upload(createdDecision.id, attachmentFile.file);
            setAttachmentFiles(prev => prev.filter(f => f.id !== attachmentFile.id));
          } catch (error) {
            console.error(`Lỗi khi upload file ${attachmentFile.fileName}:`, error);
            setApiError(`Lỗi khi upload file ${attachmentFile.fileName}`);
          }
        }
      }

      setIsSubmitting(false);
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Lỗi khi lưu quyết định khen thưởng';
      setApiError(errorMessage);
      console.error('Lỗi submit form:', error);
      setIsSubmitting(false);
    }
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
          {/* API Error */}
          {apiError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Decision Info */}
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

            <div className="space-y-2">
              <Label>Tiêu đề quyết định</Label>
              <Input
                value={formData.title}
                onChange={e => handleChange('title', e.target.value)}
                placeholder="VD: Quyết định khen thưởng hoàn thành dự án xuất sắc"
              />
            </div>

            <div className="space-y-2">
              <Label>Nội dung bổ sung</Label>
              <Textarea
                rows={2}
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                placeholder="Thông tin bổ sung về quyết định..."
              />
            </div>

            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea
                rows={2}
                value={formData.note}
                onChange={e => handleChange('note', e.target.value)}
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>

          {/* Employee Selection */}
          <div className="p-4 bg-amber-50 rounded-lg space-y-4">
            <h3 className="font-semibold text-sm">
              Chọn nhân viên <span className="text-red-500">*</span>
            </h3>

            <div className="space-y-2">
              <Label className="text-sm">Tìm và thêm nhân viên</Label>
              <Select value="" onValueChange={handleAddEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <div className="p-2 text-sm text-muted-foreground">Đang tải...</div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      {selectedEmployees.length === 0
                        ? 'Không có nhân viên'
                        : 'Tất cả nhân viên đã được chọn'}
                    </div>
                  ) : (
                    filteredEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        <div className="flex flex-col">
                          <span>{emp.fullName}</span>
                          <span className="text-xs text-muted-foreground">{emp.code}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {errors.employeeIds && (
              <p className="text-sm text-red-500">{errors.employeeIds}</p>
            )}

            {selectedEmployees.length > 0 ? (
              <div className="space-y-2">
                {selectedEmployees.map(emp => (
                  <div
                    key={emp.id}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{emp.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.code}
                        {emp.department && ` • ${emp.department.name}`}
                        {emp.position && ` • ${emp.position.name}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEmployee(emp.id)}
                    >
                      <Minus className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 text-muted-foreground text-sm">
                Chưa chọn nhân viên nào
              </div>
            )}
          </div>

          {/* Reward Details */}
          <div className="space-y-4">


            <div className="space-y-2">
              <Label>
                Lý do khen thưởng <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={3}
                value={formData.rewardReason}
                onChange={e => handleChange('rewardReason', e.target.value)}
                placeholder="Lý do chi tiết cho quyết định khen thưởng..."
              />
              {errors.rewardReason && (
                <p className="text-sm text-red-500">{errors.rewardReason}</p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Loại khen thưởng <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.rewardType}
                  onChange={e => handleChange('rewardType', e.target.value)}
                  placeholder="VD: Giấy khen, Bằng khen, Tiền thưởng..."
                />
                {errors.rewardType && (
                  <p className="text-sm text-red-500">{errors.rewardType}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Mức khen thưởng (VNĐ)</Label>
                <Input
                  value={formatCurrency(formData.rewardValue)}
                  onChange={e => handleAmountChange(e.target.value)}
                  placeholder="VD: 10.000.000"
                />
                {errors.rewardValue && (
                  <p className="text-sm text-red-500">{errors.rewardValue}</p>
                )}
                {formData.rewardValue && !errors.rewardValue && (
                  <p className="text-sm text-muted-foreground">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(Number(formData.rewardValue))}
                  </p>
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
            {attachmentFiles.length > 0 && (
              <div className="space-y-2">
                {attachmentFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    {file.isUploading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <FileText className="h-4 w-4 text-blue-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{file.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.fileSize)}
                        {file.isUploading && ' - Đang tải lên...'}
                      </p>
                    </div>
                    {!file.isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachmentFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">File hiện tại:</p>
                {existingAttachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 border rounded-lg"
                  >
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(attachment.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExistingAttachment(attachment.id)}
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
                {reward ? 'Cập nhật' : 'Tạo'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}