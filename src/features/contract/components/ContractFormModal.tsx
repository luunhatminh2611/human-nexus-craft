// components/ContractFormModal.tsx

import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
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

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  onSuccess: () => void;
}

export default function ContractFormModal({
  isOpen,
  onClose,
  contract,
  onSuccess,
}: ContractFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    contractNumber: '',
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

  // Mock employees
  const mockEmployees = [
    { id: 'EMP-001', name: 'Nguyễn Văn An', department: 'Phòng IT', position: 'Developer' },
    { id: 'EMP-002', name: 'Lê Thị Cẩm', department: 'Phòng Kinh doanh', position: 'Sales' },
    { id: 'EMP-003', name: 'Hoàng Minh F', department: 'Phòng Kế toán', position: 'Accountant' },
    { id: 'EMP-004', name: 'Đỗ Văn H', department: 'Phòng Hành chính', position: 'Admin Staff' },
    { id: 'EMP-005', name: 'Bùi Thị K', department: 'Phòng Marketing', position: 'Marketing' },
  ];

  useEffect(() => {
    if (isOpen) {
      if (contract) {
        setFormData({
          employeeId: contract.employeeId,
          employeeName: contract.employeeName,
          contractNumber: contract.contractNumber,
          contractType: contract.contractType,
          startDate: contract.startDate,
          endDate: contract.endDate || '',
          hasEndDate: contract.endDate !== null,
          baseSalary: contract.baseSalary.toString(),
          allowances: contract.allowances || '',
          notes: contract.notes || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        setFormData({
          employeeId: '',
          employeeName: '',
          contractNumber: '',
          contractType: 'DEFINITE_1_YEAR',
          startDate: today,
          endDate: nextYear.toISOString().split('T')[0],
          hasEndDate: true,
          baseSalary: '',
          allowances: '',
          notes: '',
        });
      }
      setFile(null);
      setErrors({});
    }
  }, [isOpen, contract]);

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: employee.name,
      }));
    }
  };

  const handleContractTypeChange = (type: ContractType) => {
    setFormData(prev => {
      const hasEndDate = type !== 'INDEFINITE';
      let endDate = prev.endDate;
      
      if (hasEndDate && prev.startDate) {
        const start = new Date(prev.startDate);
        let yearsToAdd = 1;
        
        if (type === 'DEFINITE_2_YEAR') yearsToAdd = 2;
        else if (type === 'DEFINITE_3_YEAR') yearsToAdd = 3;
        else if (type === 'PROBATION') yearsToAdd = 0.25; // 3 tháng
        
        start.setFullYear(start.getFullYear() + Math.floor(yearsToAdd));
        if (yearsToAdd < 1) {
          start.setMonth(start.getMonth() + Math.round(yearsToAdd * 12));
        }
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

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.contractNumber.trim()) {
      newErrors.contractNumber = 'Vui lòng nhập số hợp đồng';
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
    if (!contract && !file) {
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

    console.log('Form data:', {
      ...formData,
      file: file?.name,
    });
    console.log(contract ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng mới');

    setIsSubmitting(false);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">
            {contract ? 'Chỉnh sửa hợp đồng' : 'Tạo hợp đồng mới'}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">
                Nhân viên <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={handleEmployeeChange}
                disabled={!!contract}
              >
                <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} - {emp.department} - {emp.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            {/* Contract Number */}
            <div className="space-y-2">
              <Label htmlFor="contractNumber">
                Số hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contractNumber"
                value={formData.contractNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contractNumber: e.target.value 
                }))}
                placeholder="VD: HĐ-2024-001"
                className={errors.contractNumber ? 'border-red-500' : ''}
              />
              {errors.contractNumber && (
                <p className="text-sm text-red-500">{errors.contractNumber}</p>
              )}
            </div>

            {/* Contract Type */}
            <div className="space-y-2">
              <Label htmlFor="contractType">
                Loại hợp đồng <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.contractType}
                onValueChange={(value: ContractType) => handleContractTypeChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INDEFINITE">Không xác định thời hạn</SelectItem>
                  <SelectItem value="DEFINITE_1_YEAR">Xác định thời hạn - 1 năm</SelectItem>
                  <SelectItem value="DEFINITE_2_YEAR">Xác định thời hạn - 2 năm</SelectItem>
                  <SelectItem value="DEFINITE_3_YEAR">Xác định thời hạn - 3 năm</SelectItem>
                  <SelectItem value="PROBATION">Thử việc</SelectItem>
                  <SelectItem value="SEASONAL">Theo mùa vụ</SelectItem>
                  <SelectItem value="PROJECT_BASED">Theo dự án</SelectItem>
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
                {!formData.hasEndDate && (
                  <p className="text-xs text-gray-500">Hợp đồng không xác định thời hạn</p>
                )}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="baseSalary">
                Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
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
                File hợp đồng {!contract && <span className="text-red-500">*</span>}
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
                placeholder="Ghi chú bổ sung (nếu có)..."
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
            {isSubmitting ? 'Đang lưu...' : contract ? 'Cập nhật' : 'Tạo hợp đồng'}
          </Button>
        </div>
      </div>
    </div>
  );
}