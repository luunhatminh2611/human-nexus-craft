// components/RenewalModal.tsx

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
  type ContractType,
  contractTypeLabels 
} from '../../../mock/contract';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
  onSuccess: () => void;
}

export default function RenewalModal({
  isOpen,
  onClose,
  contract,
  onSuccess,
}: RenewalModalProps) {
  const [renewalType, setRenewalType] = useState<'renew' | 'resign'>('renew');
  const [formData, setFormData] = useState({
    newContractNumber: '',
    contractType: 'DEFINITE_1_YEAR' as ContractType,
    startDate: '',
    endDate: '',
    hasEndDate: true,
    baseSalary: '',
    allowances: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      // Tính toán ngày bắt đầu mới (ngày sau khi HĐ cũ hết hạn)
      const oldEndDate = contract.endDate ? new Date(contract.endDate) : new Date();
      const newStartDate = new Date(oldEndDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      // Tính toán ngày kết thúc mới (1 năm sau ngày bắt đầu)
      const newEndDate = new Date(newStartDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      setFormData({
        newContractNumber: '',
        contractType: 'DEFINITE_1_YEAR',
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0],
        hasEndDate: true,
        baseSalary: contract.baseSalary.toString(),
        allowances: contract.allowances || '',
        notes: '',
      });
      setFile(null);
      setErrors({});
      
      // Mặc định: nếu đã gia hạn 2 lần thì bắt buộc tái ký hoặc chuyển sang không xác định thời hạn
      if (contract.renewalCount >= 2) {
        setRenewalType('resign');
      } else {
        setRenewalType('renew');
      }
    }
  }, [isOpen, contract]);

  const handleContractTypeChange = (type: ContractType) => {
    setFormData(prev => {
      const hasEndDate = type !== 'INDEFINITE';
      let endDate = prev.endDate;
      
      if (hasEndDate && prev.startDate) {
        const start = new Date(prev.startDate);
        let yearsToAdd = 1;
        
        if (type === 'DEFINITE_2_YEAR') yearsToAdd = 2;
        else if (type === 'DEFINITE_3_YEAR') yearsToAdd = 3;
        
        start.setFullYear(start.getFullYear() + yearsToAdd);
        endDate = start.toISOString().split('T')[0];
      }
      
      return {
        ...prev,
        contractType: type,
        hasEndDate,
        endDate: hasEndDate ? endDate : '',
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (renewalType === 'resign' && !formData.newContractNumber.trim()) {
      newErrors.newContractNumber = 'Vui lòng nhập số hợp đồng mới';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (formData.hasEndDate && !formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    if (formData.hasEndDate && formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }
    if (!formData.baseSalary || Number(formData.baseSalary) <= 0) {
      newErrors.baseSalary = 'Vui lòng nhập lương cơ bản hợp lệ';
    }
    if (!file) {
      newErrors.file = 'Vui lòng tải lên file hợp đồng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Renewal data:', {
      oldContractId: contract?.id,
      renewalType,
      ...formData,
      file: file?.name,
    });

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen || !contract) return null;

  const canOnlyResign = contract.renewalCount >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            Gia hạn / Tái ký hợp đồng
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
          {/* Old Contract Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">Thông tin hợp đồng cũ</h3>
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
                <span className="text-gray-600">Loại HĐ:</span>{' '}
                <span>{contractTypeLabels[contract.contractType]}</span>
              </div>
              <div>
                <span className="text-gray-600">Số lần gia hạn:</span>{' '}
                <span className="font-medium">{contract.renewalCount} lần</span>
              </div>
            </div>
          </div>

          {/* Warning for 2+ renewals */}
          {canOnlyResign && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Lưu ý quan trọng</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Hợp đồng đã được gia hạn 2 lần. Theo Bộ luật Lao động, bạn cần:
                  </p>
                  <ul className="text-sm text-orange-700 mt-2 list-disc list-inside space-y-1">
                    <li>Tái ký hợp đồng mới hoàn toàn, HOẶC</li>
                    <li>Chuyển sang hợp đồng không xác định thời hạn</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Renewal Type */}
            {!canOnlyResign && (
              <div className="space-y-2">
                <Label>Hình thức <span className="text-red-500">*</span></Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="renewalType"
                      value="renew"
                      checked={renewalType === 'renew'}
                      onChange={(e) => setRenewalType(e.target.value as 'renew' | 'resign')}
                      className="h-4 w-4"
                    />
                    <span>Gia hạn (phụ lục)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="renewalType"
                      value="resign"
                      checked={renewalType === 'resign'}
                      onChange={(e) => setRenewalType(e.target.value as 'renew' | 'resign')}
                      className="h-4 w-4"
                    />
                    <span>Tái ký (hợp đồng mới)</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {renewalType === 'renew' 
                    ? 'Gia hạn: Kéo dài thời hạn HĐ hiện tại bằng phụ lục'
                    : 'Tái ký: Ký hợp đồng mới hoàn toàn sau khi HĐ cũ hết hạn'}
                </p>
              </div>
            )}

            {/* New Contract Number (only for resign) */}
            {renewalType === 'resign' && (
              <div className="space-y-2">
                <Label htmlFor="newContractNumber">
                  Số hợp đồng mới <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="newContractNumber"
                  value={formData.newContractNumber}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    newContractNumber: e.target.value 
                  }))}
                  placeholder="VD: HĐ-2025-001"
                  className={errors.newContractNumber ? 'border-red-500' : ''}
                />
                {errors.newContractNumber && (
                  <p className="text-sm text-red-500">{errors.newContractNumber}</p>
                )}
              </div>
            )}

            {/* Contract Type */}
            <div className="space-y-2">
              <Label htmlFor="contractType">
                Loại hợp đồng mới <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.contractType}
                onValueChange={(value: ContractType) => handleContractTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canOnlyResign && (
                    <SelectItem value="INDEFINITE">Không xác định thời hạn</SelectItem>
                  )}
                  <SelectItem value="DEFINITE_1_YEAR">Xác định thời hạn - 1 năm</SelectItem>
                  <SelectItem value="DEFINITE_2_YEAR">Xác định thời hạn - 2 năm</SelectItem>
                  <SelectItem value="DEFINITE_3_YEAR">Xác định thời hạn - 3 năm</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    startDate: e.target.value 
                  }))}
                  className={errors.startDate ? 'border-red-500' : ''}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">
                  Ngày kết thúc {formData.hasEndDate && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    endDate: e.target.value 
                  }))}
                  disabled={!formData.hasEndDate}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="baseSalary">
                Lương cơ bản mới (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="baseSalary"
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  baseSalary: e.target.value 
                }))}
                placeholder="15000000"
                className={errors.baseSalary ? 'border-red-500' : ''}
              />
              {errors.baseSalary && (
                <p className="text-sm text-red-500">{errors.baseSalary}</p>
              )}
            </div>

            {/* Allowances */}
            <div className="space-y-2">
              <Label htmlFor="allowances">Phụ cấp</Label>
              <Textarea
                id="allowances"
                value={formData.allowances}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  allowances: e.target.value 
                }))}
                placeholder="VD: Phụ cấp xăng xe: 2tr, Phụ cấp ăn trưa: 1tr"
                rows={2}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File hợp đồng {renewalType === 'renew' ? 'phụ lục' : 'mới'}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <div>
                <label
                  htmlFor="file"
                  className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors ${
                    errors.file ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {file ? file.name : 'Tải lên file PDF hợp đồng'}
                  </span>
                </label>
                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf"
                />
              </div>
              {errors.file && (
                <p className="text-sm text-red-500">{errors.file}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Ghi chú về thay đổi điều khoản (nếu có)..."
                rows={3}
              />
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
          >
            {isSubmitting 
              ? 'Đang xử lý...' 
              : renewalType === 'renew' 
              ? 'Gia hạn hợp đồng' 
              : 'Tái ký hợp đồng'}
          </Button>
        </div>
      </div>
    </div>
  );
}