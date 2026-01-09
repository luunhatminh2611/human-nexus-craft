// components/OverseasFormModal.tsx

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Calendar, AlertCircle, Search, Upload, X, FileText } from 'lucide-react';
import { type OverseasTrip, mockOverseasTrips } from '../../../mock/overseasTrip';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface OverseasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: OverseasTrip | null;
  onSuccess: () => void;
}

// Mock data nhân viên
const mockEmployees = [
  { id: 'EMP001', name: 'Nguyễn Văn An', code: 'NV001', department: 'Phòng Kỹ thuật', position: 'Trưởng phòng' },
  { id: 'EMP002', name: 'Lê Thị Hương', code: 'NV002', department: 'Phòng Nhân sự', position: 'Nhân viên' },
  { id: 'EMP003', name: 'Phạm Minh Tuấn', code: 'NV003', department: 'Phòng Kinh doanh', position: 'Giám đốc' },
  { id: 'EMP004', name: 'Hoàng Văn Đức', code: 'NV004', department: 'Phòng Kỹ thuật', position: 'Nhân viên' },
  { id: 'EMP005', name: 'Đỗ Thị Mai', code: 'NV005', department: 'Phòng Marketing', position: 'Trưởng phòng' },
];

export default function OverseasFormModal({
  isOpen,
  onClose,
  trip,
  onSuccess,
}: OverseasFormModalProps) {
  const { user } = useAuthStore();
  const isEdit = !!trip;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeCode: '',
    departmentName: '',
    positionName: '',
    country: '',
    purpose: '',
    fundingSource: '' as 'COMPANY' | 'PERSONAL' | 'PARTNER' | '',
    departureDate: '',
    returnDate: '',
    estimatedCost: '',
    actualCost: '',
    decisionNumber: '',
    decisionDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && trip) {
      setFormData({
        employeeId: trip.employeeId,
        employeeName: trip.employeeName,
        employeeCode: trip.employeeCode,
        departmentName: trip.departmentName,
        positionName: trip.positionName,
        country: trip.country,
        purpose: trip.purpose,
        fundingSource: trip.fundingSource,
        departureDate: trip.departureDate,
        returnDate: trip.returnDate,
        estimatedCost: trip.estimatedCost.toString(),
        actualCost: trip.actualCost?.toString() || '',
        decisionNumber: trip.decisionNumber,
        decisionDate: trip.decisionDate,
        notes: trip.notes || '',
      });
      setEmployeeSearch(trip.employeeName);
      setUploadedFiles([]);
    } else if (isOpen) {
      setFormData({
        employeeId: '',
        employeeName: '',
        employeeCode: '',
        departmentName: '',
        positionName: '',
        country: '',
        purpose: '',
        fundingSource: '',
        departureDate: '',
        returnDate: '',
        estimatedCost: '',
        actualCost: '',
        decisionNumber: '',
        decisionDate: '',
        notes: '',
      });
      setEmployeeSearch('');
      setUploadedFiles([]);
    }
    setErrors({});
    setShowEmployeeList(false);
  }, [trip, isOpen]);

  const filteredEmployees = mockEmployees.filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.code.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const handleEmployeeSelect = (employee: typeof mockEmployees[0]) => {
    setFormData(prev => ({
      ...prev,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      departmentName: employee.department,
      positionName: employee.position,
    }));
    setEmployeeSearch(employee.name);
    setShowEmployeeList(false);
    if (errors.employeeId) {
      setErrors(prev => ({ ...prev, employeeId: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateDuration = () => {
    if (formData.departureDate && formData.returnDate) {
      const start = new Date(formData.departureDate);
      const end = new Date(formData.returnDate);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }
    if (!formData.country) {
      newErrors.country = 'Vui lòng nhập quốc gia';
    }
    if (!formData.purpose) {
      newErrors.purpose = 'Vui lòng nhập mục đích';
    }
    if (!formData.fundingSource) {
      newErrors.fundingSource = 'Vui lòng chọn nguồn tài trợ';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'Vui lòng chọn ngày xuất cảnh';
    }
    if (!formData.returnDate) {
      newErrors.returnDate = 'Vui lòng chọn ngày về';
    }
    if (formData.departureDate && formData.returnDate) {
      if (new Date(formData.returnDate) <= new Date(formData.departureDate)) {
        newErrors.returnDate = 'Ngày về phải sau ngày xuất cảnh';
      }
    }
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      newErrors.estimatedCost = 'Vui lòng nhập chi phí dự toán hợp lệ';
    }
    if (formData.actualCost && parseFloat(formData.actualCost) < 0) {
      newErrors.actualCost = 'Chi phí thực tế không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const durationDays = calculateDuration();
      
      if (isEdit && trip) {
        const index = mockOverseasTrips.findIndex(t => t.id === trip.id);
        if (index > -1) {
          mockOverseasTrips[index] = {
            ...mockOverseasTrips[index],
            employeeId: formData.employeeId,
            employeeName: formData.employeeName,
            employeeCode: formData.employeeCode,
            departmentName: formData.departmentName,
            positionName: formData.positionName,
            country: formData.country,
            purpose: formData.purpose,
            fundingSource: formData.fundingSource as OverseasTrip['fundingSource'],
            departureDate: formData.departureDate,
            returnDate: formData.returnDate,
            durationDays,
            estimatedCost: parseFloat(formData.estimatedCost),
            actualCost: formData.actualCost ? parseFloat(formData.actualCost) : null,
            decisionNumber: formData.decisionNumber,
            decisionDate: formData.decisionDate,
            notes: formData.notes || undefined,
            updatedBy: user?.employeeId || 'ADMIN',
            updatedByName: user?.name || 'Admin',
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        const newTrip: OverseasTrip = {
          id: `${mockOverseasTrips.length + 1}`,
          employeeId: formData.employeeId,
          employeeName: formData.employeeName,
          employeeCode: formData.employeeCode,
          departmentId: 'DEPT001',
          departmentName: formData.departmentName,
          positionId: 'POS001',
          positionName: formData.positionName,
          country: formData.country,
          purpose: formData.purpose,
          fundingSource: formData.fundingSource as OverseasTrip['fundingSource'],
          departureDate: formData.departureDate,
          returnDate: formData.returnDate,
          durationDays,
          estimatedCost: parseFloat(formData.estimatedCost),
          actualCost: formData.actualCost ? parseFloat(formData.actualCost) : null,
          decisionNumber: formData.decisionNumber,
          decisionDate: formData.decisionDate,
          attachments: uploadedFiles.map(f => f.name),
          notes: formData.notes || undefined,
          createdBy: user?.employeeId || 'ADMIN',
          createdByName: user?.name || 'Admin',
          createdAt: new Date().toISOString(),
        };

        mockOverseasTrips.push(newTrip);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving trip:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const duration = calculateDuration();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa lịch sử xuất cảnh' : 'Thêm lịch sử xuất cảnh'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800">
            <p className="font-medium">Lưu ý:</p>
            <p>Lịch sử xuất cảnh sẽ được lưu trữ vào hồ sơ của nhân viên và nhân viên có thể xem được thông tin này.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Employee Selection */}
          <div className="space-y-2">
            <Label>Nhân viên <span className="text-red-500">*</span></Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={employeeSearch}
                  onChange={(e) => {
                    setEmployeeSearch(e.target.value);
                    setShowEmployeeList(true);
                  }}
                  onFocus={() => setShowEmployeeList(true)}
                  placeholder="Tìm kiếm nhân viên theo tên, mã hoặc phòng ban"
                  className={`pl-10 ${errors.employeeId ? 'border-red-500' : ''}`}
                />
              </div>

              {showEmployeeList && employeeSearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleEmployeeSelect(emp)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {emp.code} • {emp.department} • {emp.position}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Không tìm thấy nhân viên
                    </div>
                  )}
                </div>
              )}

              {formData.employeeId && formData.employeeName && (
                <div className="mt-2 p-2 bg-gray-50 rounded border text-sm">
                  <div className="font-medium">{formData.employeeName}</div>
                  <div className="text-muted-foreground">
                    {formData.employeeCode} • {formData.departmentName} • {formData.positionName}
                  </div>
                </div>
              )}
            </div>
            {errors.employeeId && (
              <p className="text-sm text-red-500">{errors.employeeId}</p>
            )}
          </div>

          {/* Trip Info */}
          <div className="space-y-4">
            <h3 className="font-medium">Thông tin chuyến đi</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quốc gia <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="Singapore, Nhật Bản, ..."
                  className={errors.country ? 'border-red-500' : ''}
                />
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">{errors.country}</p>
                )}
              </div>
              <div>
                <Label>Nguồn tài trợ <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.fundingSource}
                  onValueChange={(value) => handleChange('fundingSource', value)}
                >
                  <SelectTrigger className={errors.fundingSource ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">Công ty</SelectItem>
                    <SelectItem value="PERSONAL">Cá nhân</SelectItem>
                    <SelectItem value="PARTNER">Đối tác</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fundingSource && (
                  <p className="text-sm text-red-500 mt-1">{errors.fundingSource}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Mục đích chuyến đi <span className="text-red-500">*</span></Label>
              <Textarea
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder="Mô tả mục đích chuyến đi..."
                rows={3}
                className={errors.purpose ? 'border-red-500' : ''}
              />
              {errors.purpose && (
                <p className="text-sm text-red-500 mt-1">{errors.purpose}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày xuất cảnh <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => handleChange('departureDate', e.target.value)}
                    className={errors.departureDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.departureDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.departureDate}</p>
                )}
              </div>
              <div>
                <Label>Ngày về <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => handleChange('returnDate', e.target.value)}
                    className={errors.returnDate ? 'border-red-500' : ''}
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
                {errors.returnDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.returnDate}</p>
                )}
              </div>
            </div>

            {duration > 0 && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Thời gian xuất cảnh:</strong> {duration} ngày
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Chi phí dự toán (VNĐ) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => handleChange('estimatedCost', e.target.value)}
                  placeholder="50000000"
                  className={errors.estimatedCost ? 'border-red-500' : ''}
                />
                {errors.estimatedCost && (
                  <p className="text-sm text-red-500 mt-1">{errors.estimatedCost}</p>
                )}
              </div>
              <div>
                <Label>Chi phí thực tế (VNĐ)</Label>
                <Input
                  type="number"
                  value={formData.actualCost}
                  onChange={(e) => handleChange('actualCost', e.target.value)}
                  placeholder="48000000"
                  className={errors.actualCost ? 'border-red-500' : ''}
                />
                {errors.actualCost && (
                  <p className="text-sm text-red-500 mt-1">{errors.actualCost}</p>
                )}
              </div>
            </div>

            {/* File Upload */}
            {!isEdit && (
              <div>
                <Label>Tài liệu đính kèm</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Nhấn để chọn file</p>
                      <p className="text-xs text-muted-foreground">
                        hoặc kéo thả file vào đây
                      </p>
                    </div>
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 border rounded">
                        <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <Label>Ghi chú</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Thông tin bổ sung..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}