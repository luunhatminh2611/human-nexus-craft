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
import { X, Save, Send } from 'lucide-react';
import { type Reward } from '../../../mock/reward';
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
  const isAdmin = user?.roles === 'ADMIN';

  const [formData, setFormData] = useState({
    employeeName: '',
    departmentName: '',
    position: '',
    rewardType: '',
    achievement: '',
    reason: '',
    proposedAmount: '',
    decisionNumber: '',
    decisionDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'draft' | 'submit'>('draft');

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
        proposedAmount: reward.proposedAmount?.toString() || '',
        decisionNumber: reward.decisionNumber || '',
        decisionDate: reward.decisionDate || '',
      });
    } else {
      setFormData({
        employeeName: '',
        departmentName: '',
        position: '',
        rewardType: '',
        achievement: '',
        reason: '',
        proposedAmount: '',
        decisionNumber: '',
        decisionDate: '',
      });
    }
    setErrors({});
  }, [reward, isOpen]);

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
    handleChange('proposedAmount', value.replace(/\D/g, ''));
  };

  /* -------------------- Validation -------------------- */
  const validateForm = (action: 'draft' | 'submit') => {
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

    if (action === 'submit' && !formData.proposedAmount) {
      newErrors.proposedAmount = isAdmin
        ? 'Vui lòng nhập mức khen thưởng'
        : 'Vui lòng nhập mức khen thưởng đề xuất';
    }

    if (formData.proposedAmount && isNaN(Number(formData.proposedAmount))) {
      newErrors.proposedAmount = 'Mức khen thưởng phải là số';
    }

    if (isAdmin && action === 'submit') {
      if (!formData.decisionNumber.trim()) {
        newErrors.decisionNumber = 'Vui lòng nhập số quyết định';
      }
      if (!formData.decisionDate) {
        newErrors.decisionDate = 'Vui lòng chọn ngày quyết định';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async (action: 'draft' | 'submit') => {
    setSubmitAction(action);
    if (!validateForm(action)) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const payload = {
      ...formData,
      rewardAmount: Number(formData.proposedAmount),
      status:
        action === 'draft'
          ? 'DRAFT'
          : isAdmin
          ? 'APPROVED'
          : 'PENDING',

      proposedBy: user?.name,
      proposedById: user?.id,
      proposedDate: new Date().toISOString(),

      ...(isAdmin && action === 'submit'
        ? {
            approvedBy: user?.name,
            approvedById: user?.id,
            approvedDate: new Date().toISOString(),
          }
        : {}),
    };

    console.log('Submit reward:', payload);

    setIsSubmitting(false);
    onSuccess();
  };

  /* ==================== UI ==================== */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAdmin
              ? 'Xác nhận khen thưởng'
              : reward
              ? 'Chỉnh sửa đề xuất khen thưởng'
              : 'Đề xuất khen thưởng mới'}
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
              <Label>Loại khen thưởng *</Label>
              <Input
                value={formData.rewardType}
                onChange={e => handleChange('rewardType', e.target.value)}
                placeholder='Nhập loại khen thưởng...'
              />
              {errors.rewardType && (
                <p className="text-sm text-red-500">{errors.rewardType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Thành tích *</Label>
              <Textarea
                rows={3}
                value={formData.achievement}
                onChange={e => handleChange('achievement', e.target.value)}
                placeholder='Nhập thành tích...'
              />
            </div>

            <div className="space-y-2">
              <Label>Lý do khen thưởng *</Label>
              <Textarea
                rows={4}
                value={formData.reason}
                onChange={e => handleChange('reason', e.target.value)}
                placeholder='Nhập lý do khen thưởng...'
              />
            </div>

            <div className="space-y-2">
              <Label>
                {isAdmin
                  ? 'Mức khen thưởng (VNĐ)'
                  : 'Mức khen thưởng đề xuất (VNĐ)'}
              </Label>
              <Input
                value={formatCurrency(formData.proposedAmount)}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder='VD: 1.000.000'
              />
            </div>

            {/* Admin decision */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Số quyết định *</Label>
                  <Input
                    value={formData.decisionNumber}
                    onChange={e =>
                      handleChange('decisionNumber', e.target.value)
                    }
                  />
                  {errors.decisionNumber && (
                    <p className="text-sm text-red-500">
                      {errors.decisionNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Ngày quyết định *</Label>
                  <Input
                    type="date"
                    value={formData.decisionDate}
                    onChange={e =>
                      handleChange('decisionDate', e.target.value)
                    }
                  />
                  {errors.decisionDate && (
                    <p className="text-sm text-red-500">
                      {errors.decisionDate}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Alert>
            <AlertDescription>
              {isAdmin ? (
                <strong>
                  Xác nhận sẽ tạo quyết định khen thưởng chính thức.
                </strong>
              ) : (
                <strong>
                  Khi gửi đề xuất, hồ sơ sẽ chuyển cho HR xem xét.
                </strong>
              )}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" /> Hủy
          </Button>

          <Button variant="outline" onClick={() => handleSubmit('draft')}>
            <Save className="h-4 w-4 mr-2" /> Lưu nháp
          </Button>

          <Button onClick={() => handleSubmit('submit')}>
            <Send className="h-4 w-4 mr-2" />
            {isAdmin ? 'Xác nhận' : 'Gửi đề xuất'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
