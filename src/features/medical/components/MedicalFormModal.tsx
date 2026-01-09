// components/MedicalFormModal.tsx

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
import { mockMedicalProfiles, type MedicalProfile } from '../../../mock/medicalProfile';
import { toast } from 'sonner';
import { Activity, AlertCircle } from 'lucide-react';

interface MedicalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: MedicalProfile | null;
  onSuccess: () => void;
}

// Mock data nhân viên (trong thực tế sẽ lấy từ API)
const mockEmployees = [
  { id: 'emp-021', name: 'Nguyễn Văn A', code: 'NV021', department: 'Phòng Kỹ thuật' },
  { id: 'emp-022', name: 'Trần Thị B', code: 'NV022', department: 'Phòng Nhân sự' },
  { id: 'emp-023', name: 'Lê Văn C', code: 'NV023', department: 'Phòng Kinh doanh' },
  { id: 'emp-024', name: 'Phạm Thị D', code: 'NV024', department: 'Phòng Marketing' },
  { id: 'emp-025', name: 'Hoàng Văn E', code: 'NV025', department: 'Phòng IT' },
];

export default function MedicalFormModal({
  isOpen,
  onClose,
  profile,
  onSuccess,
}: MedicalFormModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    employeeCode: '',
    departmentName: '',
    bloodType: '',
    height: '',
    weight: '',
    allergy: '',
    chronicDisease: '',
    occupationalDisease: '',
    medication: '',
    healthClassification: '',
    lastCheckDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (profile) {
        // Edit mode
        setFormData({
          employeeId: profile.employeeId,
          employeeName: profile.employeeName,
          employeeCode: profile.employeeCode,
          departmentName: profile.departmentName,
          bloodType: profile.bloodType || '',
          height: profile.height?.toString() || '',
          weight: profile.weight?.toString() || '',
          allergy: profile.allergy || '',
          chronicDisease: profile.chronicDisease || '',
          occupationalDisease: profile.occupationalDisease || '',
          medication: profile.medication || '',
          healthClassification: profile.healthClassification || '',
          lastCheckDate: profile.lastCheckDate || '',
        });
      } else {
        // Create mode
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, profile]);

  const resetForm = () => {
    setFormData({
      employeeId: '',
      employeeName: '',
      employeeCode: '',
      departmentName: '',
      bloodType: '',
      height: '',
      weight: '',
      allergy: '',
      chronicDisease: '',
      occupationalDisease: '',
      medication: '',
      healthClassification: '',
      lastCheckDate: '',
    });
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    if (employee) {
      setFormData(prev => ({
        ...prev,
        employeeId: employee.id,
        employeeName: employee.name,
        employeeCode: employee.code,
        departmentName: employee.department,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employeeId) {
      newErrors.employeeId = 'Vui lòng chọn nhân viên';
    }

    if (!formData.bloodType) {
      newErrors.bloodType = 'Vui lòng chọn nhóm máu';
    }

    if (formData.height) {
      const height = parseFloat(formData.height);
      if (isNaN(height) || height <= 0 || height > 300) {
        newErrors.height = 'Chiều cao không hợp lệ (0-300 cm)';
      }
    }

    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight <= 0 || weight > 300) {
        newErrors.weight = 'Cân nặng không hợp lệ (0-300 kg)';
      }
    }

    if (!formData.healthClassification) {
      newErrors.healthClassification = 'Vui lòng chọn phân loại sức khỏe';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (profile) {
        // Update existing profile
        const index = mockMedicalProfiles.findIndex(p => p.id === profile.id);
        if (index > -1) {
          mockMedicalProfiles[index] = {
            ...mockMedicalProfiles[index],
            bloodType: formData.bloodType,
            height: parseFloat(formData.height) || 0,
            weight: parseFloat(formData.weight) || 0,
            allergy: formData.allergy || 'Không',
            chronicDisease: formData.chronicDisease || 'Không',
            occupationalDisease: formData.occupationalDisease || 'Không',
            medication: formData.medication || 'Không',
            healthClassification: formData.healthClassification,
            lastCheckDate: formData.lastCheckDate || undefined,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        toast.success('Cập nhật hồ sơ y tế thành công');
      } else {
        // Create new profile
        const newProfile: MedicalProfile = {
          id: `med-${Date.now()}`,
          employeeId: formData.employeeId,
          employeeName: formData.employeeName,
          employeeCode: formData.employeeCode,
          departmentName: formData.departmentName,
          bloodType: formData.bloodType,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          allergy: formData.allergy || 'Không',
          chronicDisease: formData.chronicDisease || 'Không',
          occupationalDisease: formData.occupationalDisease || 'Không',
          medication: formData.medication || 'Không',
          healthClassification: formData.healthClassification,
          lastCheckDate: formData.lastCheckDate || undefined,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0],
        };
        mockMedicalProfiles.push(newProfile);
        toast.success('Thêm hồ sơ y tế thành công');
      }

      onSuccess();
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height && weight && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return bmi.toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {profile ? 'Cập nhật hồ sơ y tế' : 'Thêm hồ sơ y tế mới'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Employee Selection */}
          {!profile && (
            <div className="space-y-2">
              <Label>
                Nhân viên <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.employeeId}
                onValueChange={handleEmployeeChange}
              >
                <SelectTrigger className={errors.employeeId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>
                <SelectContent>
                  {mockEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code}) - {emp.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.employeeId}
                </p>
              )}
            </div>
          )}

          {/* Employee Info Display (Edit mode) */}
          {profile && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Nhân viên</p>
              <p className="font-semibold">{formData.employeeName}</p>
              <p className="text-sm text-muted-foreground">
                {formData.employeeCode} - {formData.departmentName}
              </p>
            </div>
          )}

          {/* Basic Health Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Nhóm máu <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.bloodType}
                onValueChange={(value) => setFormData({ ...formData, bloodType: value })}
              >
                <SelectTrigger className={errors.bloodType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
              {errors.bloodType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.bloodType}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Ngày khám gần nhất</Label>
              <Input
                type="date"
                value={formData.lastCheckDate}
                onChange={(e) => setFormData({ ...formData, lastCheckDate: e.target.value })}
              />
            </div>
          </div>

          {/* Height & Weight with BMI */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Chiều cao (cm)</Label>
              <Input
                type="number"
                placeholder="170"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className={errors.height ? 'border-red-500' : ''}
              />
              {errors.height && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.height}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cân nặng (kg)</Label>
              <Input
                type="number"
                placeholder="65"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.weight}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>BMI</Label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center justify-center">
                {bmi ? (
                  <span className="font-semibold text-lg">{bmi}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">--</span>
                )}
              </div>
            </div>
          </div>

          {/* Health Classification */}
          <div className="space-y-2">
            <Label>
              Phân loại sức khỏe <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.healthClassification}
              onValueChange={(value) => setFormData({ ...formData, healthClassification: value })}
            >
              <SelectTrigger className={errors.healthClassification ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Loại I">Loại I (Khỏe mạnh)</SelectItem>
                <SelectItem value="Loại II">Loại II (Khá)</SelectItem>
                <SelectItem value="Loại III">Loại III (Trung bình)</SelectItem>
                <SelectItem value="Loại IV">Loại IV (Yếu)</SelectItem>
                <SelectItem value="Loại V">Loại V (Rất yếu)</SelectItem>
              </SelectContent>
            </Select>
            {errors.healthClassification && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.healthClassification}
              </p>
            )}
          </div>

          {/* Medical Conditions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Dị ứng</Label>
              <Input
                placeholder="Ví dụ: Penicillin, Hải sản (phân cách bằng dấu phẩy)"
                value={formData.allergy}
                onChange={(e) => setFormData({ ...formData, allergy: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Nhập "Không" nếu không có dị ứng
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bệnh mãn tính</Label>
              <Textarea
                placeholder="Mô tả các bệnh mãn tính (nếu có)"
                value={formData.chronicDisease}
                onChange={(e) => setFormData({ ...formData, chronicDisease: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Bệnh nghề nghiệp</Label>
              <Textarea
                placeholder="Mô tả các bệnh nghề nghiệp (nếu có)"
                value={formData.occupationalDisease}
                onChange={(e) => setFormData({ ...formData, occupationalDisease: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Thuốc đang sử dụng</Label>
              <Textarea
                placeholder="Liệt kê các loại thuốc đang sử dụng thường xuyên"
                value={formData.medication}
                onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>{profile ? 'Cập nhật' : 'Thêm mới'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}