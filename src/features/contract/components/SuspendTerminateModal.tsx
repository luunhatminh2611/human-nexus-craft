// components/SuspendTerminateModal.tsx

import { useState, useEffect } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
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
import { 
  type Contract,
  type SuspensionReason,
  type TerminationType,
  suspensionReasonLabels,
  terminationTypeLabels
} from '../../../mock/contract';

interface SuspendTerminateModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  action: 'suspend' | 'terminate';
  onSuccess: () => void;
}

export default function SuspendTerminateModal({
  isOpen,
  onClose,
  contract,
  action,
  onSuccess,
}: SuspendTerminateModalProps) {
  const [suspendData, setSuspendData] = useState({
    reason: 'UNPAID_LEAVE' as SuspensionReason,
    reasonDetail: '',
    startDate: '',
    endDate: '',
    hasEndDate: true,
  });

  const [terminateData, setTerminateData] = useState({
    terminationType: 'RESIGNATION' as TerminationType,
    terminationDate: '',
    reason: '',
    severancePay: '',
    notes: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      
      setSuspendData({
        reason: 'UNPAID_LEAVE',
        reasonDetail: '',
        startDate: today,
        endDate: '',
        hasEndDate: true,
      });

      setTerminateData({
        terminationType: 'RESIGNATION',
        terminationDate: today,
        reason: '',
        severancePay: '',
        notes: '',
      });

      setFiles([]);
      setErrors({});
    }
  }, [isOpen, action]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const validateSuspendForm = () => {
    const newErrors: Record<string, string> = {};

    if (!suspendData.reasonDetail.trim()) {
      newErrors.reasonDetail = 'Vui lòng mô tả chi tiết lý do tạm hoãn';
    }
    if (!suspendData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu tạm hoãn';
    }
    if (suspendData.hasEndDate && !suspendData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc dự kiến';
    }
    if (suspendData.hasEndDate && suspendData.startDate && suspendData.endDate) {
      if (new Date(suspendData.endDate) <= new Date(suspendData.startDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateTerminateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!terminateData.terminationDate) {
      newErrors.terminationDate = 'Vui lòng chọn ngày chấm dứt';
    }
    if (!terminateData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do chấm dứt hợp đồng';
    }
    if (terminateData.severancePay && Number(terminateData.severancePay) < 0) {
      newErrors.severancePay = 'Trợ cấp không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = action === 'suspend' 
      ? validateSuspendForm() 
      : validateTerminateForm();

    if (!isValid) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(action === 'suspend' ? 'Suspend data:' : 'Terminate data:', {
      contractId: contract?.id,
      action,
      data: action === 'suspend' ? suspendData : terminateData,
      files: files.map(f => f.name),
    });

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {action === 'suspend' ? 'Tạm hoãn hợp đồng' : 'Chấm dứt hợp đồng'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Contract Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Thông tin hợp đồng</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nhân viên:</span>{' '}
                <span className="font-medium">{contract.employeeName}</span>
              </div>
              <div>
                <span className="text-gray-600">Số HĐ:</span>{' '}
                <span className="font-medium">{contract.contractNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Phòng ban:</span>{' '}
                <span>{contract.departmentName}</span>
              </div>
              <div>
                <span className="text-gray-600">Vị trí:</span>{' '}
                <span>{contract.position}</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className={`${
            action === 'suspend' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          } border rounded-lg p-4 mb-6`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                action === 'suspend' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <div>
                <p className={`font-medium ${
                  action === 'suspend' ? 'text-yellow-900' : 'text-red-900'
                }`}>
                  {action === 'suspend' 
                    ? 'Tạm hoãn hợp đồng lao động'
                    : 'Chấm dứt hợp đồng lao động'}
                </p>
                <p className={`text-sm mt-1 ${
                  action === 'suspend' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {action === 'suspend' 
                    ? 'Hợp đồng sẽ tạm ngưng hiệu lực trong khoảng thời gian được chỉ định. Nhân viên sẽ không làm việc và có thể không được hưởng lương tùy theo lý do tạm hoãn.'
                    : 'Hợp đồng sẽ bị chấm dứt vĩnh viễn. Nhân viên sẽ không còn làm việc tại công ty. Vui lòng đảm bảo đã quyết toán đầy đủ các khoản lương, phép và trợ cấp (nếu có).'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {action === 'suspend' ? (
              // Suspend Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Lý do tạm hoãn <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={suspendData.reason}
                    onValueChange={(value: SuspensionReason) => 
                      setSuspendData(prev => ({ ...prev, reason: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(suspensionReasonLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reasonDetail">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reasonDetail"
                    value={suspendData.reasonDetail}
                    onChange={(e) => setSuspendData(prev => ({ 
                      ...prev, 
                      reasonDetail: e.target.value 
                    }))}
                    placeholder="Mô tả chi tiết lý do và tình hình..."
                    rows={4}
                    className={errors.reasonDetail ? 'border-red-500' : ''}
                  />
                  {errors.reasonDetail && (
                    <p className="text-sm text-red-500">{errors.reasonDetail}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={suspendData.startDate}
                      onChange={(e) => setSuspendData(prev => ({ 
                        ...prev, 
                        startDate: e.target.value 
                      }))}
                      className={errors.startDate ? 'border-red-500' : ''}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">
                      Ngày kết thúc dự kiến
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={suspendData.endDate}
                      onChange={(e) => setSuspendData(prev => ({ 
                        ...prev, 
                        endDate: e.target.value 
                      }))}
                      disabled={!suspendData.hasEndDate}
                      className={errors.endDate ? 'border-red-500' : ''}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-500">{errors.endDate}</p>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!suspendData.hasEndDate}
                        onChange={(e) => setSuspendData(prev => ({ 
                          ...prev, 
                          hasEndDate: !e.target.checked,
                          endDate: e.target.checked ? '' : prev.endDate
                        }))}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-600">Chưa xác định thời gian kết thúc</span>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              // Terminate Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="terminationType">
                    Loại chấm dứt <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={terminateData.terminationType}
                    onValueChange={(value: TerminationType) => 
                      setTerminateData(prev => ({ ...prev, terminationType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(terminationTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationDate">
                    Ngày chấm dứt <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="terminationDate"
                    type="date"
                    value={terminateData.terminationDate}
                    onChange={(e) => setTerminateData(prev => ({ 
                      ...prev, 
                      terminationDate: e.target.value 
                    }))}
                    className={errors.terminationDate ? 'border-red-500' : ''}
                  />
                  {errors.terminationDate && (
                    <p className="text-sm text-red-500">{errors.terminationDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">
                    Lý do chấm dứt <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    value={terminateData.reason}
                    onChange={(e) => setTerminateData(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }))}
                    placeholder="Mô tả chi tiết lý do chấm dứt hợp đồng..."
                    rows={4}
                    className={errors.reason ? 'border-red-500' : ''}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-500">{errors.reason}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severancePay">
                    Trợ cấp thôi việc (VNĐ)
                  </Label>
                  <Input
                    id="severancePay"
                    type="number"
                    value={terminateData.severancePay}
                    onChange={(e) => setTerminateData(prev => ({ 
                      ...prev, 
                      severancePay: e.target.value 
                    }))}
                    placeholder="0"
                    className={errors.severancePay ? 'border-red-500' : ''}
                  />
                  {errors.severancePay && (
                    <p className="text-sm text-red-500">{errors.severancePay}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Nếu có trợ cấp theo quy định pháp luật hoặc thỏa thuận
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Ghi chú</Label>
                  <Textarea
                    id="notes"
                    value={terminateData.notes}
                    onChange={(e) => setTerminateData(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                    placeholder="Ghi chú về quyết toán, thu hồi tài sản..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="files">
                Tài liệu đính kèm
              </Label>
              <div>
                <label
                  htmlFor="files"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {files.length > 0 
                      ? `${files.length} file đã chọn` 
                      : 'Tải lên tài liệu liên quan (giấy chứng nhận, đơn xin, biên bản...)'}
                  </span>
                </label>
                <input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      • {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={action === 'terminate' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isSubmitting 
              ? 'Đang xử lý...' 
              : action === 'suspend' 
              ? 'Xác nhận tạm hoãn' 
              : 'Xác nhận chấm dứt'}
          </Button>
        </div>
      </div>
    </div>
  );
}