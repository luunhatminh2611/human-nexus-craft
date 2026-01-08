// components/ContractFormModal.tsx

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { contractApi } from '../api/contractApi';
import { employeeApi } from '../../employees/api/employeeApi';
import { toast } from '@/shared/components/ui/use-toast';
import GenericSearchSelect from '@/features/employees/components/GenericSearchSelect';
import { categoryConfigs } from '@/features/employees/components/CategoriesConfig';

interface Contract {
  id: number;
  employee: {
    id: number;
    code: string;
    fullName: string;
    department?: {
      id: number;
      name: string;
    };
    position?: {
      id: number;
      name: string;
    };
  };
  contractType: string;
  startDate: string;
  endDate: string;
  salary: number;
  notes?: string;
  fileName?: string;
  fileType?: string;
  attachmentData?: string;
}

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
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    employeeId: '',
    contractType: '',
    startDate: '',
    endDate: '',
    salary: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contractTypes, setContractTypes] = useState<{id: number, name: string}[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Fetch employees using function instead of useQuery
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!isOpen) return;
      
      setIsLoadingEmployees(true);
      try {
        const data = await employeeApi.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách nhân viên',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, [isOpen]);

  // Fetch contract types
  useEffect(() => {
    const fetchContractTypes = async () => {
      try {
        const response = await categoryConfigs.laborContractType.api.getAll();
        setContractTypes(response);
      } catch (error) {
        console.error('Error fetching contract types:', error);
      }
    };
    if (isOpen) {
      fetchContractTypes();
    }
  }, [isOpen]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) =>
      contractApi.create(data, file),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã tạo hợp đồng mới',
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo hợp đồng',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: any; file?: File }) =>
      contractApi.update(id, data, file),
    onSuccess: (response, variables) => {
      // Nếu backend không trả về fileName, giữ lại fileName cũ
      if (response?.data && !response.data.fileName && contract?.fileName && !variables.file) {
        console.warn('⚠️ Backend không trả về fileName, giữ lại fileName cũ');
        response.data.fileName = contract.fileName;
        response.data.fileType = contract.fileType;
      }
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật hợp đồng',
      });
      // Invalidate tất cả queries liên quan để refresh data
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật hợp đồng',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (contract) {
        // Khi edit: giữ nguyên contractType hiện tại
        setFormData({
          employeeId: contract.employee.id.toString(),
          contractType: contract.contractType, // Giữ nguyên giá trị hiện tại
          startDate: contract.startDate,
          endDate: contract.endDate || '',
          salary: contract.salary.toString(),
          notes: contract.notes || '',
        });
      } else {
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          employeeId: '',
          contractType: '',
          startDate: today,
          endDate: '',
          salary: '',
          notes: '',
        });
      }
      setFile(null);
      setErrors({});
    }
  }, [isOpen, contract]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Clear file error if exists
      if (errors.file) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.contractType) {
      newErrors.contractType = 'Vui lòng chọn loại hợp đồng';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
    }
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }
    if (!formData.salary || Number(formData.salary) <= 0) {
      newErrors.salary = 'Vui lòng nhập lương cơ bản hợp lệ';
    }
    // Chỉ yêu cầu file khi tạo mới
    if (!contract && !file) {
      newErrors.file = 'Vui lòng tải lên file hợp đồng';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      ...(contract && { id: contract.id }),
      employee: {
        id: Number(formData.employeeId)
      },
      contractType: formData.contractType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      salary: Number(formData.salary),
      notes: formData.notes || null,
      // Khi update: Giữ lại fileName, fileType, attachmentData từ contract cũ
      // Chỉ khi có file mới thì backend mới ghi đè
      ...(contract && !file && {
        fileName: contract.fileName || null,
        fileType: contract.fileType || null,
        attachmentData: contract.attachmentData || null,
      }),
    };

    console.log('📤 Payload being sent:', {
      ...payload,
      attachmentData: payload.attachmentData ? '(Base64 data exists)' : null
    });

    if (contract) {
      // Khi update: gửi file nếu có file mới, không thì giữ nguyên data cũ trong payload
      updateMutation.mutate({
        id: contract.id,
        data: payload,
        file: file || undefined,
      });
    } else {
      // Khi create: luôn gửi file (bắt buộc)
      createMutation.mutate({
        data: payload,
        file: file!,
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Helper to get contract type name
  const getContractTypeName = (contractTypeId: string | number) => {
    const type = contractTypes.find(t => t.id === Number(contractTypeId));
    return type?.name || contractTypeId;
  };

  if (!isOpen) return null;

  const selectedEmployee = employees.find((emp: any) => emp.id.toString() === formData.employeeId);

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
              {contract ? (
                // Show employee info when editing
                <div className="border rounded-md p-3 bg-gray-50">
                  <p className="font-medium">{contract.employee.fullName}</p>
                  <p className="text-sm text-gray-600">Mã: {contract.employee.code}</p>
                  {contract.employee.department && (
                    <p className="text-sm text-gray-600">
                      Phòng ban: {contract.employee.department.name}
                    </p>
                  )}
                </div>
              ) : (
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    employeeId: value
                  }))}
                  disabled={isLoadingEmployees}
                >
                  <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                    <SelectValue placeholder={isLoadingEmployees ? "Đang tải..." : "Chọn nhân viên"} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id.toString()}>
                        {emp.fullName} ({emp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.employeeId && (
                <p className="text-sm text-red-500">{errors.employeeId}</p>
              )}
            </div>

            {/* Contract Type */}
            <div className="space-y-2">
              <Label htmlFor="contractType">
                Loại hợp đồng <span className="text-red-500">*</span>
              </Label>
              
              {/* Show current contract type when editing */}
              {contract && contractTypes.length > 0 && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">Loại hợp đồng hiện tại:</span>{' '}
                    {getContractTypeName(contract.contractType)}
                  </p>
                </div>
              )}

              <GenericSearchSelect
                key={`contract-type-${contract?.id || 'new'}-${formData.contractType}`}
                api={categoryConfigs.laborContractType.api}
                config={categoryConfigs.laborContractType}
                value={formData.contractType}
                onChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    contractType: String(value)
                  }));
                  // Clear error if exists
                  if (errors.contractType) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.contractType;
                      return newErrors;
                    });
                  }
                }}
              />
              {errors.contractType && (
                <p className="text-sm text-red-500">{errors.contractType}</p>
              )}
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
                  Ngày kết thúc <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    endDate: e.target.value
                  }))}
                  className={errors.endDate ? 'border-red-500' : ''}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <Label htmlFor="salary">
                Lương cơ bản (VNĐ) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  salary: e.target.value
                }))}
                placeholder="15000000"
                className={errors.salary ? 'border-red-500' : ''}
              />
              {errors.salary && (
                <p className="text-sm text-red-500">{errors.salary}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File hợp đồng {!contract && <span className="text-red-500">*</span>}
              </Label>
              
              {/* Show existing file if editing */}
              {contract?.fileName && !file && (
                <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-900">
                    <span className="font-medium">File hiện tại:</span> {contract.fileName}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Tải lên file mới để thay thế (không bắt buộc)
                  </p>
                </div>
              )}

              {/* Show selected new file */}
              {file && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-900">
                    <span className="font-medium">File mới:</span> {file.name}
                  </p>
                  {contract?.fileName && (
                    <p className="text-xs text-blue-600 mt-1">
                      Sẽ thay thế: {contract.fileName}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="file"
                  className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-md p-6 cursor-pointer hover:border-blue-400 transition-colors ${
                    errors.file ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {file 
                      ? `Đã chọn: ${file.name}` 
                      : contract?.fileName 
                        ? 'Chọn file mới để thay thế' 
                        : 'Tải lên file PDF hợp đồng'}
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