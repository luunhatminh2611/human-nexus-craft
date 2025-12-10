import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { trainingApi } from '../../training/api/trainingApi';
import { unitApi } from '@/features/departments/api/departmentApi';

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingId?: number | string | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  currentDepartmentId?: number;
}

export default function TrainingModal({
  isOpen,
  onClose,
  trainingId,
  mode,
  onSuccess,
  currentDepartmentId,
}: TrainingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    courseType: '', // 'YEARLY', 'QUARTERLY', 'MONTHLY'
    year: 0, // Năm áp dụng
    quarter: 0, // Quý áp dụng (nếu courseType = QUARTERLY)
    month: 0, // Tháng áp dụng (nếu courseType = MONTHLY)
    departmentId: currentDepartmentId || null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch department name khi có currentDepartmentId
  useEffect(() => {
    if (isOpen && currentDepartmentId) {
      fetchDepartmentName();
    }
  }, [isOpen, currentDepartmentId]);

  // Fetch training data nếu là edit mode
  useEffect(() => {
    if (isOpen && mode === 'edit' && trainingId) {
      fetchTrainingData();
    } else if (isOpen && mode === 'create') {
      resetForm();
    }
  }, [isOpen, mode, trainingId]);

  const fetchDepartmentName = async () => {
    try {
      const res = await unitApi.getAll();
      const departments = Array.isArray(res) ? res : [];
      const dept = departments.find(d => d.id === currentDepartmentId);
      setDepartmentName(dept?.name || 'Chưa xác định');
    } catch (err) {
      console.error("Lỗi khi lấy tên phòng ban", err);
      setDepartmentName('Chưa xác định');
    }
  };

  const fetchTrainingData = async () => {
    try {
      setIsFetching(true);
      const response = await trainingApi.getById(trainingId);
      
      console.log("Response from API:", response); // Debug log
      
      // API trả về dạng {success: true, data: {...}}
      const data = response.data || response;
      
      console.log("Actual data:", data); // Debug log
      
      setFormData({
        title: data.title || '',
        description: data.description || '',
        location: data.location || '',
        courseType: data.courseType || '',
        year: Number(data.year) || 0,
        quarter: Number(data.quarter) || 0,
        month: Number(data.month) || 0,
        departmentId: data.departmentId || currentDepartmentId || null,
      });
      
      console.log("Form data set successfully"); // Debug log
    } catch (err) {
      console.error("Lỗi khi lấy thông tin khóa đào tạo:", err);
      alert('Không thể tải thông tin khóa đào tạo');
    } finally {
      setIsFetching(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      courseType: '',
      year: 0,
      quarter: 0,
      month: 0,
      departmentId: currentDepartmentId || null,
    });
    setErrors({});
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error khi user nhập
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Vui lòng nhập tên khóa đào tạo';
    }

    if (!formData.courseType) {
      newErrors.courseType = 'Vui lòng chọn loại thời gian';
    }

    // Validate theo courseType
    if (formData.courseType === 'YEARLY') {
      if (!formData.year || formData.year === 0) {
        newErrors.year = 'Vui lòng nhập năm áp dụng';
      }
    } else if (formData.courseType === 'QUARTERLY') {
      if (!formData.year || formData.year === 0) {
        newErrors.year = 'Vui lòng nhập năm áp dụng';
      }
      if (!formData.quarter || formData.quarter === 0) {
        newErrors.quarter = 'Vui lòng chọn quý áp dụng';
      }
    } else if (formData.courseType === 'MONTHLY') {
      if (!formData.year || formData.year === 0) {
        newErrors.year = 'Vui lòng nhập năm áp dụng';
      }
      if (!formData.month || formData.month === 0) {
        newErrors.month = 'Vui lòng chọn tháng áp dụng';
      }
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Không xác định được phòng ban';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Xây dựng submitData
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        courseType: formData.courseType,
        departmentId: formData.departmentId,
        year: formData.year,
        quarter: formData.courseType === 'QUARTERLY' ? formData.quarter : 0,
        month: formData.courseType === 'MONTHLY' ? formData.month : 0,
      };

      if (mode === 'create') {
        await trainingApi.create(submitData);
        alert('Tạo khóa đào tạo thành công');
      } else {
        await trainingApi.update(trainingId, {
          id: trainingId,
          ...submitData,
        });
        alert('Cập nhật khóa đào tạo thành công');
      }

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Lỗi khi lưu khóa đào tạo:', error);
      alert(mode === 'create' ? 'Lỗi khi tạo khóa đào tạo' : 'Lỗi khi cập nhật khóa đào tạo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo khóa đào tạo mới' : 'Cập nhật khóa đào tạo'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Điền đầy đủ thông tin để tạo khóa đào tạo mới'
              : 'Cập nhật thông tin khóa đào tạo'
            }
          </DialogDescription>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Tên khóa đào tạo */}
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Tên khóa đào tạo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Nhập tên khóa đào tạo"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Mô tả */}
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Nhập mô tả khóa đào tạo"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Loại thời gian và Địa điểm */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="courseType">
                    Loại thời gian <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.courseType}
                    onValueChange={(value) => handleChange('courseType', value)}
                  >
                    <SelectTrigger className={errors.courseType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Chọn loại thời gian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YEARLY">Theo năm</SelectItem>
                      <SelectItem value="QUARTERLY">Theo quý</SelectItem>
                      <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.courseType && (
                    <p className="text-sm text-red-500">{errors.courseType}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location">Địa điểm</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Nhập địa điểm tổ chức"
                  />
                </div>
              </div>

              {/* Phòng ban (chỉ hiển thị, không cho chọn) */}
              <div className="grid gap-2">
                <Label htmlFor="departmentId">
                  Phòng ban <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="departmentId"
                  value={departmentName}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{errors.departmentId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Phòng ban được lấy theo tài khoản đăng nhập
                </p>
              </div>

              {/* Trường thời gian - hiển thị khác nhau tùy courseType */}
              {formData.courseType && (
                <>
                  {/* Năm áp dụng - hiển thị cho tất cả các loại */}
                  <div className="grid gap-2">
                    <Label htmlFor="year">
                      Năm áp dụng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ''}
                      onChange={(e) => handleChange('year', Number(e.target.value))}
                      placeholder="Nhập năm (VD: 2024)"
                      min={2000}
                      max={2100}
                      className={errors.year ? 'border-red-500' : ''}
                    />
                    {errors.year && (
                      <p className="text-sm text-red-500">{errors.year}</p>
                    )}
                  </div>

                  {/* Quý áp dụng - chỉ hiển thị khi courseType = QUARTERLY */}
                  {formData.courseType === 'QUARTERLY' && (
                    <div className="grid gap-2">
                      <Label htmlFor="quarter">
                        Quý áp dụng <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.quarter?.toString() || ''}
                        onValueChange={(value) => handleChange('quarter', Number(value))}
                      >
                        <SelectTrigger className={errors.quarter ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn quý" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Quý 1</SelectItem>
                          <SelectItem value="2">Quý 2</SelectItem>
                          <SelectItem value="3">Quý 3</SelectItem>
                          <SelectItem value="4">Quý 4</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.quarter && (
                        <p className="text-sm text-red-500">{errors.quarter}</p>
                      )}
                    </div>
                  )}

                  {/* Tháng áp dụng - chỉ hiển thị khi courseType = MONTHLY */}
                  {formData.courseType === 'MONTHLY' && (
                    <div className="grid gap-2">
                      <Label htmlFor="month">
                        Tháng áp dụng <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.month?.toString() || ''}
                        onValueChange={(value) => handleChange('month', Number(value))}
                      >
                        <SelectTrigger className={errors.month ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Chọn tháng" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Tháng {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.month && (
                        <p className="text-sm text-red-500">{errors.month}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                disabled={isLoading || isFetching}
                className="bg-green-500 text-white hover:bg-green-600"
              >
                {isLoading 
                  ? (mode === 'create' ? 'Đang tạo...' : 'Đang cập nhật...') 
                  : (mode === 'create' ? 'Tạo mới' : 'Cập nhật')
                }
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}