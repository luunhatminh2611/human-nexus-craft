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
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";

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
    gender: 'NAM',
    status: 'Đang làm việc',
    // Thêm các trường mới
    cccdNumber: '',
    cccdDate: '',
    cccdPlace: '',
    contactAddress: '',
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

  const { data: nationalities, isLoading: loadingNationalities } = useQuery({
    queryKey: ['nationalities'],
    queryFn: () => nationalityApi.getAll(),
  });

  // Fetch employee data for edit mode
  const { data: employee } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeApi.getById(employeeId!),
    enabled: mode === 'edit' && !!employeeId,
  });

  // Load employee data into form when editing
  useEffect(() => {
    if (mode === 'edit' && employee) {
      const employeeData = employee.data || employee;
      setFormData({
        id: employeeData.id,
        code: employeeData.code || '',
        fullName: employeeData.name || '',
        birthDate: employeeData.birthday || '',
        startDate: employeeData.startDate || '',
        gender: employeeData.gender || 'NAM',
        status: employeeData.status || 'Đang làm việc',
        // Các trường mới
        cccdNumber: employeeData.cccdNumber || '',
        cccdDate: employeeData.cccdDate || '',
        cccdPlace: employeeData.cccdPalce || '', // Lưu ý: API trả về "cccdPalce" (có thể là typo)
        contactAddress: employeeData.contactAddress || '',
        // IDs từ response
        positionId: employeeData.positionId?.toString() || '',
        departmentId: employeeData.departmentId?.toString() || '',
        ethnicity: employeeData.ethnicity || '',
        wardId: employeeData.wardId?.toString() || '',
        provinceCityId: employeeData.provinceCityId?.toString() || '',
        specialtyId: employeeData.specialtyId?.toString() || '',
        educationLevelId: employeeData.educationLevelId?.toString() || '',
        politicalTheoryId: employeeData.politicalTheoryId?.toString() || '',
        languageLevelId: employeeData.languageLevelId?.toString() || '',
        religion: employeeData.religion || '',
        nationalityId: employeeData.nationalityId?.toString() || '',
        user: employeeData.userId ? { id: employeeData.userId } : null,
      });
    } else if (mode === 'create') {
      setFormData({
        id: "",
        code: '',
        fullName: '',
        birthDate: '',
        startDate: '',
        gender: 'NAM',
        status: 'Đang làm việc',
        cccdNumber: '',
        cccdDate: '',
        cccdPlace: '',
        contactAddress: '',
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


  const mapEmployeeToPayload = (formData, mode) => {
    return {
      ...(mode === "edit" && { id: Number(formData.id) }),

      code: formData.code,
      fullName: formData.fullName,
      birthDate: formData.birthDate,
      startDate: formData.startDate,
      gender: formData.gender,
      status: formData.status,

      // Thông tin cá nhân
      cccdNumber: formData.cccdNumber || null,
      cccdDate: formData.cccdDate || null,
      cccdPlace: formData.cccdPlace || null,
      contactAddress: formData.contactAddress || null,
      ethnicity: formData.ethnicity || null,
      religion: formData.religion || null,

      // Object references (backend REQUIRE objects)
      department: formData.departmentId ? { id: Number(formData.departmentId) } : null,
      position: formData.positionId ? { id: Number(formData.positionId) } : null,
      ward: formData.wardId ? { id: Number(formData.wardId) } : null,
      provinceCity: formData.provinceCityId ? { id: Number(formData.provinceCityId) } : null,
      specialty: formData.specialtyId ? { id: Number(formData.specialtyId) } : null,
      educationLevel: formData.educationLevelId ? { id: Number(formData.educationLevelId) } : null,
      politicalTheory: formData.politicalTheoryId ? { id: Number(formData.politicalTheoryId) } : null,
      languageLevel: formData.languageLevelId ? { id: Number(formData.languageLevelId) } : null,
      nationality: formData.nationalityId ? { id: Number(formData.nationalityId) } : null,

      ...(mode === "edit" && formData.user && {
        user: { id: formData.user.id }
      }),
    };
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn phòng ban",
        variant: "destructive",
      });
    }

    if (!formData.positionId) {
      return toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn chức vụ",
        variant: "destructive",
      });
    }

    const payload = mapEmployeeToPayload(formData, mode);

    if (mode === "create") {
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
  const isCategoriesLoading = loadingDegrees || loadingEthnicities ||
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
              : `Chỉnh sửa thông tin nhân viên ${employee?.data?.name || ''}`}
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
                        <SelectItem value="NAM">Nam</SelectItem>
                        <SelectItem value="NỮ">Nữ</SelectItem>
                        <SelectItem value="KHÁC">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccdNumber">CCCD/CMND</Label>
                    <Input
                      id="cccdNumber"
                      value={formData.cccdNumber}
                      onChange={(e) => handleChange('cccdNumber', e.target.value)}
                      placeholder="Nhập số CCCD/CMND"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccdDate">Ngày cấp</Label>
                    <Input
                      id="cccdDate"
                      type="date"
                      value={formData.cccdDate}
                      onChange={(e) => handleChange('cccdDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cccdPlace">Nơi cấp</Label>
                    <Input
                      id="cccdPlace"
                      value={formData.cccdPlace}
                      onChange={(e) => handleChange('cccdPlace', e.target.value)}
                      placeholder="Nhập nơi cấp"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ethnicity">Dân tộc</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.ethnicity.api}
                      config={categoryConfigs.ethnicity}
                      value={formData.ethnicity?.toString()}
                      onChange={(v) => handleChange("ethnicity", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationalityId">Quốc tịch</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.nationality.api}
                      config={categoryConfigs.nationality}
                      value={formData.nationalityId?.toString()}
                      onChange={(v) => handleChange("nationalityId", String(v))}
                    />
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
                    <GenericSearchSelect
                      api={categoryConfigs.provinceCity.api}
                      config={categoryConfigs.provinceCity}
                      value={formData.provinceCityId?.toString()}
                      onChange={(v) => handleChange("provinceCityId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wardId">Phường/Xã</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.ward.api}
                      config={categoryConfigs.ward}
                      value={formData.wardId?.toString()}
                      onChange={(v) => handleChange("wardId", String(v))}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contactAddress">Địa chỉ cụ thể</Label>
                    <Input
                      id="contactAddress"
                      value={formData.contactAddress}
                      onChange={(e) => handleChange('contactAddress', e.target.value)}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
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
                    <Label htmlFor="departmentId">
                      Phòng ban/Phân xưởng <span className="text-destructive">*</span>
                    </Label>
                    <GenericSearchSelect
                      api={categoryConfigs.department.api}
                      config={categoryConfigs.department}
                      value={formData.departmentId?.toString()}
                      onChange={(v) => handleChange("departmentId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="positionId">
                      Chức vụ <span className="text-destructive">*</span>
                    </Label>
                    <GenericSearchSelect
                      api={categoryConfigs.jobTitle.api}
                      config={categoryConfigs.jobTitle}
                      value={formData.positionId?.toString()}
                      onChange={(v) => handleChange("positionId", String(v))}
                    />
                  </div>
                </div>
              </div>

              {/* Trình độ & chuyên môn */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Trình độ & Chuyên ngành</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="educationLevelId">Bậc học</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.degree.api}
                      config={categoryConfigs.degree}
                      value={formData.educationLevelId?.toString()}
                      onChange={(v) => handleChange("educationLevelId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialtyId">Chuyên ngành</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.specialty.api}
                      config={categoryConfigs.specialty}
                      value={formData.specialtyId?.toString()}
                      onChange={(v) => handleChange("specialtyId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="languageLevelId">Trình độ ngoại ngữ</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.languageLevel.api}
                      config={categoryConfigs.languageLevel}
                      value={formData.languageLevelId?.toString()}
                      onChange={(v) => handleChange("languageLevelId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="politicalTheoryId">Lý luận chính trị</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.politicalTheory.api}
                      config={categoryConfigs.politicalTheory}
                      value={formData.politicalTheoryId?.toString()}
                      onChange={(v) => handleChange("politicalTheoryId", String(v))}
                    />
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
                    ? 'Thêm nhân viên'
                    : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}