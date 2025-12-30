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
import { X, Save, Send, AlertCircle } from 'lucide-react';
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
    currentPosition: '',
    currentDepartment: '',
    newPosition: '',
    newDepartment: '',
    appointmentType: 'NEW' as 'NEW' | 'REAPPOINTMENT' | 'CONCURRENT',
    reason: '',
    responsibilities: '',
    currentSalary: '',
    newSalary: '',
    allowance: '',
    decisionNumber: '',
    decisionDate: '',
    effectiveDate: '',
    termMonths: '',
    hasTermLimit: 'yes' as 'yes' | 'no',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'draft' | 'publish'>('draft');

  useEffect(() => {
    if (appointment) {
      setFormData({
        employeeName: appointment.employeeName,
        currentPosition: appointment.currentPosition,
        currentDepartment: appointment.currentDepartment,
        newPosition: appointment.newPosition,
        newDepartment: appointment.newDepartment,
        appointmentType: appointment.appointmentType,
        reason: appointment.reason,
        responsibilities: appointment.responsibilities,
        currentSalary: appointment.currentSalary?.toString() || '',
        newSalary: appointment.newSalary?.toString() || '',
        allowance: appointment.allowance?.toString() || '',
        decisionNumber: appointment.decisionNumber,
        decisionDate: appointment.decisionDate,
        effectiveDate: appointment.effectiveDate,
        termMonths: appointment.termMonths?.toString() || '',
        hasTermLimit: appointment.termMonths ? 'yes' : 'no',
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [appointment, isOpen]);

  const resetForm = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      employeeName: '',
      currentPosition: '',
      currentDepartment: '',
      newPosition: '',
      newDepartment: '',
      appointmentType: 'NEW',
      reason: '',
      responsibilities: '',
      currentSalary: '',
      newSalary: '',
      allowance: '',
      decisionNumber: '',
      decisionDate: today,
      effectiveDate: today,
      termMonths: '',
      hasTermLimit: 'yes',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (action: 'draft' | 'publish') => {
    const newErrors: Record<string, string> = {};

    // Required fields for both draft and publish
    if (!formData.employeeName.trim()) {
      newErrors.employeeName = 'Vui lòng nhập tên nhân viên';
    }

    if (!formData.newPosition.trim()) {
      newErrors.newPosition = 'Vui lòng nhập chức vụ mới';
    }

    if (!formData.newDepartment.trim()) {
      newErrors.newDepartment = 'Vui lòng nhập phòng ban mới';
    }

    // Additional validations for publish
    if (action === 'publish') {
      if (!formData.currentPosition.trim()) {
        newErrors.currentPosition = 'Vui lòng nhập chức vụ hiện tại';
      }

      if (!formData.currentDepartment.trim()) {
        newErrors.currentDepartment = 'Vui lòng nhập phòng ban hiện tại';
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
        newErrors.decisionDate = 'Vui lòng chọn ngày ban hành';
      }

      if (!formData.effectiveDate) {
        newErrors.effectiveDate = 'Vui lòng chọn ngày có hiệu lực';
      }

      if (formData.hasTermLimit === 'yes' && !formData.termMonths) {
        newErrors.termMonths = 'Vui lòng nhập thời hạn bổ nhiệm';
      }
    }

    // Validate numbers
    if (formData.currentSalary && isNaN(Number(formData.currentSalary))) {
      newErrors.currentSalary = 'Lương hiện tại phải là số';
    }

    if (formData.newSalary && isNaN(Number(formData.newSalary))) {
      newErrors.newSalary = 'Lương mới phải là số';
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

  const handleSubmit = async (action: 'draft' | 'publish') => {
    setSubmitAction(action);

    if (!validateForm(action)) {
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const expiryDate = formData.hasTermLimit === 'yes' && formData.termMonths && formData.effectiveDate
      ? calculateExpiryDate(formData.effectiveDate, Number(formData.termMonths))
      : null;

    console.log('Submitting appointment:', {
      ...formData,
      status: action === 'draft' ? 'DRAFT' : 'PUBLISHED',
      termMonths: formData.hasTermLimit === 'yes' ? Number(formData.termMonths) : null,
      expiryDate,
      createdBy: user?.name || 'Admin',
      createdById: user?.id || 'ADMIN_ID',
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {appointment ? 'Chỉnh sửa quyết định bổ nhiệm' : 'Tạo quyết định bổ nhiệm mới'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            <TabsTrigger value="details">Chi tiết bổ nhiệm</TabsTrigger>
            <TabsTrigger value="salary">Lương & Phúc lợi</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Employee Information */}
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-sm">Thông tin nhân viên</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="currentDepartment">
                    Phòng ban hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentDepartment"
                    value={formData.currentDepartment}
                    onChange={(e) => handleChange('currentDepartment', e.target.value)}
                    placeholder="Nhập phòng ban hiện tại"
                  />
                  {errors.currentDepartment && (
                    <p className="text-sm text-red-500">{errors.currentDepartment}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPosition">
                    Chức vụ hiện tại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="currentPosition"
                    value={formData.currentPosition}
                    onChange={(e) => handleChange('currentPosition', e.target.value)}
                    placeholder="Nhập chức vụ hiện tại"
                  />
                  {errors.currentPosition && (
                    <p className="text-sm text-red-500">{errors.currentPosition}</p>
                  )}
                </div>
              </div>
            </div>

            {/* New Position Information */}
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-sm text-blue-900">Thông tin bổ nhiệm</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="newDepartment">
                    Phòng ban mới <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newDepartment"
                    value={formData.newDepartment}
                    onChange={(e) => handleChange('newDepartment', e.target.value)}
                    placeholder="Nhập phòng ban mới"
                  />
                  {errors.newDepartment && (
                    <p className="text-sm text-red-500">{errors.newDepartment}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPosition">
                    Chức vụ mới <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="newPosition"
                    value={formData.newPosition}
                    onChange={(e) => handleChange('newPosition', e.target.value)}
                    placeholder="Nhập chức vụ mới"
                  />
                  {errors.newPosition && (
                    <p className="text-sm text-red-500">{errors.newPosition}</p>
                  )}
                </div>
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
                  placeholder="Mô tả chi tiết nhiệm vụ, trách nhiệm và quyền hạn của chức vụ mới"
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
                    Ngày ban hành <span className="text-red-500">*</span>
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
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasTermLimit"
                      value="yes"
                      checked={formData.hasTermLimit === 'yes'}
                      onChange={(e) => handleChange('hasTermLimit', e.target.value)}
                    />
                    <span>Có thời hạn</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasTermLimit"
                      value="no"
                      checked={formData.hasTermLimit === 'no'}
                      onChange={(e) => handleChange('hasTermLimit', e.target.value)}
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
                        Hết hạn: {calculateExpiryDate(formData.effectiveDate, Number(formData.termMonths))}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="salary" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentSalary">Lương hiện tại (VNĐ)</Label>
                <Input
                  id="currentSalary"
                  value={formatCurrency(formData.currentSalary)}
                  onChange={(e) => handleAmountChange('currentSalary', e.target.value)}
                  placeholder="Nhập lương hiện tại"
                />
                {errors.currentSalary && (
                  <p className="text-sm text-red-500">{errors.currentSalary}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newSalary">Lương mới (VNĐ)</Label>
                <Input
                  id="newSalary"
                  value={formatCurrency(formData.newSalary)}
                  onChange={(e) => handleAmountChange('newSalary', e.target.value)}
                  placeholder="Nhập lương mới"
                />
                {errors.newSalary && (
                  <p className="text-sm text-red-500">{errors.newSalary}</p>
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

            {(formData.currentSalary || formData.newSalary || formData.allowance) && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-sm text-green-900 mb-2">Tổng thu nhập</h4>
                <div className="space-y-1 text-sm">
                  {formData.currentSalary && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thu nhập hiện tại:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.currentSalary))}
                      </span>
                    </div>
                  )}
                  {formData.newSalary && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lương mới:</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(formData.newSalary))}
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
                  {formData.newSalary && formData.allowance && (
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Tổng thu nhập mới:</span>
                      <span className="font-bold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                          Number(formData.newSalary) + Number(formData.allowance)
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Lưu ý:</strong> Bản nháp có thể chỉnh sửa. Khi ban hành quyết định, thông tin sẽ được gửi cho nhân viên và không thể chỉnh sửa.
          </AlertDescription>
        </Alert>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Hủy
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            {isSubmitting && submitAction === 'draft' ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Lưu nháp
              </>
            )}
          </Button>
          <Button
            onClick={() => handleSubmit('publish')}
            disabled={isSubmitting}
          >
            {isSubmitting && submitAction === 'publish' ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang ban hành...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Ban hành quyết định
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}