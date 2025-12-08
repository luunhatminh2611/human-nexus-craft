import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import Button from '@/shared/components/ui/button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { employeeApi } from '../../api/employeeApi';
import { unitApi } from '../../../departments/api/departmentApi';
import {
  jobTitleApi,
  degreeApi,
  ethnicityApi,
  wardApi,
  provinceCityApi,
  specialtyApi,
  politicalTheoryApi,
  languageLevelApi,
  nationalityApi,
} from '../../../categories/api/categoriesApi';
import { toast } from '@/shared/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export default function EmployeeModal({
  isOpen,
  onClose,
  employeeId,
  mode,
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    id: "",
    code: '',
    fullName: '',
    birthDate: '',
    startDate: '',
    gender: 'Nam',
    status: 'Đang làm việc',
    // IDs for categories
    positionId: '',
    departmentId: '',
    ethnicity: '',
    wardId: '',
    provinceCityId: '',
    specialtyId: '',
    educationLevelId: '',
    politicalTheoryId: '',
    languageLevelId: '',
    religion: '',
    nationalityId: '',
    user: null as any,
  });

  // Fetch all categories
  const { data: jobTitles, isLoading: loadingJobTitles } = useQuery({
    queryKey: ['jobTitles'],
    queryFn: () => jobTitleApi.getAll(),
  });

  const { data: degrees, isLoading: loadingDegrees } = useQuery({
    queryKey: ['degrees'],
    queryFn: () => degreeApi.getAll(),
  });

  const { data: ethnicities, isLoading: loadingEthnicities } = useQuery({
    queryKey: ['ethnicities'],
    queryFn: () => ethnicityApi.getAll(),
  });

  const { data: wards, isLoading: loadingWards } = useQuery({
    queryKey: ['wards'],
    queryFn: () => wardApi.getAll(),
  });

  const { data: provinceCities, isLoading: loadingProvinceCities } = useQuery({
    queryKey: ['provinceCities'],
    queryFn: () => provinceCityApi.getAll(),
  });

  const { data: specialties, isLoading: loadingSpecialties } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyApi.getAll(),
  });

  const { data: politicalTheories, isLoading: loadingPoliticalTheories } = useQuery({
    queryKey: ['politicalTheories'],
    queryFn: () => politicalTheoryApi.getAll(),
  });

  const { data: languageLevels, isLoading: loadingLanguageLevels } = useQuery({
    queryKey: ['languageLevels'],
    queryFn: () => languageLevelApi.getAll(),
  });

  const { data: departments, isLoading: loadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => unitApi.getAll(),
  });

  // Fetch employee data for edit mode
  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeApi.getById(employeeId!),
    enabled: mode === 'edit' && !!employeeId,
  });

  const { data: nationalities, isLoading: loadingNationalities } = useQuery({
    queryKey: ['nationalities'],
    queryFn: () => nationalityApi.getAll(),
  });

  // Load employee data into form when editing
  useEffect(() => {
    if (mode === 'edit' && employee) {
      setFormData({
        id: employee.id,
        code: employee.code || '',
        fullName: employee.fullName || '',
        birthDate: employee.birthDate || '',
        startDate: employee.startDate || '',
        gender: employee.gender || 'Nam',
        status: employee.status || 'Đang làm việc',
        positionId: employee.position?.id?.toString() || '',
        departmentId: employee.department?.id?.toString() || '',
        ethnicity: employee.ethnicity || '',
        wardId: employee.ward?.id?.toString() || '',
        provinceCityId: employee.provinceCity?.id?.toString() || '',
        specialtyId: employee.specialty?.id?.toString() || '',
        educationLevelId: employee.educationLevel?.id?.toString() || '',
        politicalTheoryId: employee.politicalTheory?.id?.toString() || '',
        languageLevelId: employee.languageLevel?.id?.toString() || '',
        religion: employee.religion || '',
        nationalityId: employee.nationality?.id?.toString() || '',
        user: employee.user || null,
      });
    } else if (mode === 'create') {
      setFormData({
        id: "",
        code: '',
        fullName: '',
        birthDate: '',
        startDate: '',
        gender: 'Nam',
        status: 'Đang làm việc',
        positionId: '',
        departmentId: '',
        ethnicity: '',
        wardId: '',
        provinceCityId: '',
        specialtyId: '',
        educationLevelId: '',
        politicalTheoryId: '',
        languageLevelId: '',
        religion: '',
        nationalityId: '',
        user: null,
      });
    }
  }, [isOpen, mode, employee]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => employeeApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Tạo nhân viên mới thành công',
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo nhân viên',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => employeeApi.update(employeeId!, data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Cập nhật thông tin nhân viên thành công',
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      handleClose();

      setTimeout(() => {
        window.location.reload();
      }, 300);
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật thông tin nhân viên',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.departmentId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn phòng ban",
        variant: "destructive",
      });
      return;
    }

    if (!formData.positionId) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn chức danh",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...(mode === 'edit' && { id: formData.id }),
      code: formData.code,
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      startDate: formData.startDate,
      gender: formData.gender,
      status: 'Đang làm việc',
      ethnicity: formData.ethnicity || null,
      religion: formData.religion || null,

      // Truyền object thay vì chỉ ID
      department: formData.departmentId ? { id: Number(formData.departmentId) } : null,
      position: formData.positionId ? { id: Number(formData.positionId) } : null,
      nationality: formData.nationalityId ? { id: Number(formData.nationalityId) } : null,
      ward: formData.wardId ? { id: Number(formData.wardId) } : null,
      provinceCity: formData.provinceCityId ? { id: Number(formData.provinceCityId) } : null,
      specialty: formData.specialtyId ? { id: Number(formData.specialtyId) } : null,
      educationLevel: formData.educationLevelId ? { id: Number(formData.educationLevelId) } : null,
      politicalTheory: formData.politicalTheoryId ? { id: Number(formData.politicalTheoryId) } : null,
      languageLevel: formData.languageLevelId ? { id: Number(formData.languageLevelId) } : null,
      ...(mode === 'edit' && formData.user && { user: formData.user }),
    };

    if (mode === 'create') {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isCategoriesLoading = loadingJobTitles || loadingDegrees || loadingEthnicities ||
    loadingWards || loadingProvinceCities || loadingSpecialties ||
    loadingPoliticalTheories || loadingLanguageLevels || loadingDepartments || loadingNationalities;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm nhân viên mới' : 'Cập nhật thông tin nhân viên'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập thông tin để tạo nhân viên mới'
              : `Chỉnh sửa thông tin nhân viên ${employee?.fullName || ''}`}
          </DialogDescription>
        </DialogHeader>

        {isCategoriesLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Đang tải danh mục...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">
                      Mã nhân viên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value)}
                      placeholder="Nhập mã nhân viên"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Họ và tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">
                      Ngày sinh <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Giới tính</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => handleChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Nam">Nam</SelectItem>
                        <SelectItem value="Nữ">Nữ</SelectItem>
                        <SelectItem value="Khác">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccd">
                      CCCD/CMND
                    </Label>
                    <Input
                      id="cccd"
                      placeholder="Nhập CCCD hoặc CMND"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccd-place">
                      Ngày cấp
                    </Label>
                    <Input
                      id="cccd-place"
                      placeholder="Nhập nơi cấp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccd-date">
                      Nơi cấp
                    </Label>
                    <Input
                      id="cccd-date"
                      placeholder="Nhập ngày cấp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Dân tộc</Label>
                    <Select
                      value={formData.ethnicity}
                      onValueChange={(value) => handleChange('ethnicity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn dân tộc" />
                      </SelectTrigger>
                      <SelectContent>
                        {ethnicities?.map((item) => (
                          <SelectItem key={item.id} value={item.name}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalityId">Quốc tịch</Label>
                    <Select
                      value={formData.nationalityId}
                      onValueChange={(value) => handleChange('nationalityId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn quốc tịch" />
                      </SelectTrigger>
                      <SelectContent>
                        {nationalities?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="religion">Tôn giáo</Label>
                    <Input
                      id="religion"
                      value={formData.religion}
                      onChange={(e) => handleChange('religion', e.target.value)}
                      placeholder="Nhập tôn giáo"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin địa chỉ */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Thông tin địa chỉ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="provinceCityId">Tỉnh/Thành phố</Label>
                    <Select
                      value={formData.provinceCityId}
                      onValueChange={(value) => handleChange('provinceCityId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tỉnh/thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {provinceCities?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wardId">Phường/Xã</Label>
                    <Select
                      value={formData.wardId}
                      onValueChange={(value) => handleChange('wardId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phường/xã" />
                      </SelectTrigger>
                      <SelectContent>
                        {wards?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Thông tin công việc */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Thông tin công việc</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Ngày vào làm <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Phòng ban/Phân xưởng <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => handleChange('departmentId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positionId">Chức danh <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.positionId}
                      onValueChange={(value) => handleChange('positionId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chức danh" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTitles?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Trình độ & chuyên môn */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Trình độ & Chuyên môn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationLevelId">Bậc học</Label>
                    <Select
                      value={formData.educationLevelId}
                      onValueChange={(value) => handleChange('educationLevelId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn bậc học" />
                      </SelectTrigger>
                      <SelectContent>
                        {degrees?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialtyId">Chuyên ngành</Label>
                    <Select
                      value={formData.specialtyId}
                      onValueChange={(value) => handleChange('specialtyId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chuyên ngành" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languageLevelId">Trình độ ngoại ngữ</Label>
                    <Select
                      value={formData.languageLevelId}
                      onValueChange={(value) => handleChange('languageLevelId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trình độ ngoại ngữ" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageLevels?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="politicalTheoryId">Lý luận chính trị</Label>
                    <Select
                      value={formData.politicalTheoryId}
                      onValueChange={(value) => handleChange('politicalTheoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý luận chính trị" />
                      </SelectTrigger>
                      <SelectContent>
                        {politicalTheories?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className='bg-green-500 text-white'>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading
                  ? 'Đang xử lý...'
                  : mode === 'create'
                    ? 'Tạo nhân viên'
                    : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}