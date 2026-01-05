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
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
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
  laborContractTypeApi,
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
    // Địa chỉ
    contactAddress: '',
    birthPlace: '',
    nativePlace: '',
    homeTown: '',
    permanentAddress: '',
    // Công việc
    positionId: '',
    departmentId: '',
    laborContractTypeId: '',
    currentJobDetail: '',
    // Thông tin cá nhân
    ethnicity: '',
    religion: '',
    nationalityId: '',
    policyFamilyId: '',
    // Địa chỉ hành chính
    wardId: '',
    provinceCityId: '',
    // Trình độ
    specialtyId: '',
    educationLevelId: '',
    educationDetail: '',
    politicalTheoryId: '',
    languageLevelId: '',
    culturalLevelId: '',
    professionalLevelId: '',
    itLevelId: '',
    // Đào tạo
    trainingInstitutionId: '',
    trainingMajorId: '',
    trainingTypeId: '',
    // BHXH
    socialInsuranceNumber: '',
    socialInsuranceStartDate: '',
    socialInsuranceJobId: '',
    // Đảng, Đoàn, Quân đội
    partyJoinDate: '',
    partyOfficialDate: '',
    youthUnionJoinDate: '',
    militaryJoinDate: '',
    militaryEndDate: '',
    militaryRankId: '',
    // Thông tin khác
    title: '',
    isWoundedSoldier: false,
    cardNumber: '',
    endDate: '',
    documentReturnDate: '',
    note: '',
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

  const { data: laborContractTypes, isLoading: loadingLaborContractTypes } = useQuery({
    queryKey: ['laborContractTypes'],
    queryFn: () => laborContractTypeApi.getAll(),
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
        // Thông tin CCCD
        cccdNumber: employeeData.cccdNumber || '',
        cccdDate: employeeData.cccdDate || '',
        cccdPlace: employeeData.cccdPlace || '',
        // Địa chỉ
        contactAddress: employeeData.contactAddress || '',
        birthPlace: employeeData.birthPlace || '',
        nativePlace: employeeData.nativePlace || '',
        homeTown: employeeData.homeTown || '',
        permanentAddress: employeeData.permanentAddress || '',
        // Công việc
        positionId: employeeData.positionId?.toString() || '',
        departmentId: employeeData.departmentId?.toString() || '',
        laborContractTypeId: employeeData.laborContractTypeId?.toString() || '',
        currentJobDetail: employeeData.currentJobDetail || '',
        // Thông tin cá nhân
        ethnicity: employeeData.ethnicity || '',
        religion: employeeData.religion || '',
        nationalityId: employeeData.nationalityId?.toString() || '',
        policyFamilyId: employeeData.policyFamilyId?.toString() || '',
        // Địa chỉ hành chính
        wardId: employeeData.wardId?.toString() || '',
        provinceCityId: employeeData.provinceCityId?.toString() || '',
        // Trình độ
        specialtyId: employeeData.specialtyId?.toString() || '',
        educationLevelId: employeeData.educationLevelId?.toString() || '',
        educationDetail: employeeData.educationDetail || '',
        politicalTheoryId: employeeData.politicalTheoryId?.toString() || '',
        languageLevelId: employeeData.languageLevelId?.toString() || '',
        culturalLevelId: employeeData.culturalLevelId?.toString() || '',
        professionalLevelId: employeeData.professionalLevelId?.toString() || '',
        itLevelId: employeeData.itLevelId?.toString() || '',
        trainingInstitutionId: employeeData.trainingInstitutionId?.toString() || '',
        trainingMajorId: employeeData.trainingMajorId?.toString() || '',
        trainingTypeId: employeeData.trainingTypeId?.toString() || '',
        // BHXH
        socialInsuranceNumber: employeeData.socialInsuranceNumber || '',
        socialInsuranceStartDate: employeeData.socialInsuranceStartDate || '',
        socialInsuranceJobId: employeeData.socialInsuranceJobId?.toString() || '',
        // Đảng, Đoàn, Quân đội
        partyJoinDate: employeeData.partyJoinDate || '',
        partyOfficialDate: employeeData.partyOfficialDate || '',
        youthUnionJoinDate: employeeData.youthUnionJoinDate || '',
        militaryJoinDate: employeeData.militaryJoinDate || '',
        militaryEndDate: employeeData.militaryEndDate || '',
        militaryRankId: employeeData.militaryRankId?.toString() || '',
        // Thông tin khác
        title: employeeData.title || '',
        isWoundedSoldier: employeeData.isWoundedSoldier || false,
        cardNumber: employeeData.cardNumber || '',
        endDate: employeeData.endDate || '',
        documentReturnDate: employeeData.documentReturnDate || '',
        note: employeeData.note || '',
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
        birthPlace: '',
        nativePlace: '',
        homeTown: '',
        permanentAddress: '',
        positionId: '',
        departmentId: '',
        laborContractTypeId: '',
        currentJobDetail: '',
        ethnicity: '',
        religion: '',
        nationalityId: '',
        policyFamilyId: '',
        wardId: '',
        provinceCityId: '',
        specialtyId: '',
        educationLevelId: '',
        educationDetail: '',
        politicalTheoryId: '',
        languageLevelId: '',
        culturalLevelId: '',
        professionalLevelId: '',
        itLevelId: '',
        trainingInstitutionId: '',
        trainingMajorId: '',
        trainingTypeId: '',
        socialInsuranceNumber: '',
        socialInsuranceStartDate: '',
        socialInsuranceJobId: '',
        partyJoinDate: '',
        partyOfficialDate: '',
        youthUnionJoinDate: '',
        militaryJoinDate: '',
        militaryEndDate: '',
        militaryRankId: '',
        title: '',
        isWoundedSoldier: false,
        cardNumber: '',
        endDate: '',
        documentReturnDate: '',
        note: '',
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

      // Thông tin CCCD
      cccdNumber: formData.cccdNumber || null,
      cccdDate: formData.cccdDate || null,
      cccdPlace: formData.cccdPlace || null,

      // Địa chỉ
      contactAddress: formData.contactAddress || null,
      birthPlace: formData.birthPlace || null,
      nativePlace: formData.nativePlace || null,
      homeTown: formData.homeTown || null,
      permanentAddress: formData.permanentAddress || null,

      // Thông tin cá nhân
      ethnicity: formData.ethnicity || null,
      religion: formData.religion || null,

      // Công việc
      currentJobDetail: formData.currentJobDetail || null,

      // BHXH
      socialInsuranceNumber: formData.socialInsuranceNumber || null,
      socialInsuranceStartDate: formData.socialInsuranceStartDate || null,

      // Đảng, Đoàn, Quân đội
      partyJoinDate: formData.partyJoinDate || null,
      partyOfficialDate: formData.partyOfficialDate || null,
      youthUnionJoinDate: formData.youthUnionJoinDate || null,
      militaryJoinDate: formData.militaryJoinDate || null,
      militaryEndDate: formData.militaryEndDate || null,

      // Thông tin khác
      title: formData.title || null,
      isWoundedSoldier: formData.isWoundedSoldier,
      cardNumber: formData.cardNumber || null,
      endDate: formData.endDate || null,
      documentReturnDate: formData.documentReturnDate || null,
      note: formData.note || null,
      educationDetail: formData.educationDetail || null,

      // Object references (backend REQUIRE objects)
      department: formData.departmentId ? { id: Number(formData.departmentId) } : null,
      position: formData.positionId ? { id: Number(formData.positionId) } : null,
      laborContractType: formData.laborContractTypeId ? { id: Number(formData.laborContractTypeId) } : null,
      ward: formData.wardId ? { id: Number(formData.wardId) } : null,
      provinceCity: formData.provinceCityId ? { id: Number(formData.provinceCityId) } : null,
      specialty: formData.specialtyId ? { id: Number(formData.specialtyId) } : null,
      educationLevel: formData.educationLevelId ? { id: Number(formData.educationLevelId) } : null,
      politicalTheory: formData.politicalTheoryId ? { id: Number(formData.politicalTheoryId) } : null,
      languageLevel: formData.languageLevelId ? { id: Number(formData.languageLevelId) } : null,
      nationality: formData.nationalityId ? { id: Number(formData.nationalityId) } : null,
      culturalLevel: formData.culturalLevelId ? { id: Number(formData.culturalLevelId) } : null,
      professionalLevel: formData.professionalLevelId ? { id: Number(formData.professionalLevelId) } : null,
      itLevel: formData.itLevelId ? { id: Number(formData.itLevelId) } : null,
      trainingInstitution: formData.trainingInstitutionId ? { id: Number(formData.trainingInstitutionId) } : null,
      trainingMajor: formData.trainingMajorId ? { id: Number(formData.trainingMajorId) } : null,
      trainingType: formData.trainingTypeId ? { id: Number(formData.trainingTypeId) } : null,
      militaryRank: formData.militaryRankId ? { id: Number(formData.militaryRankId) } : null,
      policyFamily: formData.policyFamilyId ? { id: Number(formData.policyFamilyId) } : null,
      socialInsuranceJob: formData.socialInsuranceJobId ? { id: Number(formData.socialInsuranceJobId) } : null,

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
        description: 'Chỉnh sửa nhân viên thành công',
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
        description: error.message || 'Không thể Chỉnh sửa nhân viên',
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

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onClose();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isCategoriesLoading = loadingDegrees || loadingEthnicities ||
    loadingWards || loadingProvinceCities || loadingSpecialties ||
    loadingPoliticalTheories || loadingLanguageLevels || loadingDepartments ||
    loadingNationalities || loadingLaborContractTypes;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm nhân viên' : 'Chỉnh sửa nhân viên'}
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
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin cơ bản</h3>
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
                      Tên nhân viên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Nhập tên nhân viên"
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
                    <Label htmlFor="birthPlace">Nơi sinh</Label>
                    <Input
                      id="birthPlace"
                      value={formData.birthPlace}
                      onChange={(e) => handleChange('birthPlace', e.target.value)}
                      placeholder="Nhập nơi sinh"
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

                  <div className="space-y-2">
                    <Label htmlFor="policyFamilyId">Gia đình chính sách</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.policyFamily.api}
                      config={categoryConfigs.policyFamily}
                      value={formData.policyFamilyId?.toString()}
                      onChange={(v) => handleChange("policyFamilyId", String(v))}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin CCCD */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin CCCD/CMND</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cccdNumber">Số CCCD/CMND</Label>
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
                </div>
              </div>

              {/* Thông tin địa chỉ */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin địa chỉ</h3>
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

                  <div className="space-y-2">
                    <Label htmlFor="contactAddress">Địa chỉ liên hệ</Label>
                    <Input
                      id="contactAddress"
                      value={formData.contactAddress}
                      onChange={(e) => handleChange('contactAddress', e.target.value)}
                      placeholder="Nhập địa chỉ liên hệ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">Hộ khẩu thường trú</Label>
                    <Input
                      id="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={(e) => handleChange('permanentAddress', e.target.value)}
                      placeholder="Nhập địa chỉ hộ khẩu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nativePlace">Nguyên quán</Label>
                    <Input
                      id="nativePlace"
                      value={formData.nativePlace}
                      onChange={(e) => handleChange('nativePlace', e.target.value)}
                      placeholder="Nhập nguyên quán"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeTown">Quê quán</Label>
                    <Input
                      id="homeTown"
                      value={formData.homeTown}
                      onChange={(e) => handleChange('homeTown', e.target.value)}
                      placeholder="Nhập quê quán"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin công việc */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin công việc</h3>
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
                    <Label htmlFor="endDate">Ngày kết thúc</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
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

                  <div className="space-y-2">
                    <Label htmlFor="laborContractTypeId">Loại hợp đồng lao động</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.laborContractType.api}
                      config={categoryConfigs.laborContractType}
                      value={formData.laborContractTypeId?.toString()}
                      onChange={(v) => handleChange("laborContractTypeId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentJobDetail">Công việc cụ thể đang làm</Label>
                    <Input
                      id="currentJobDetail"
                      value={formData.currentJobDetail}
                      onChange={(e) => handleChange('currentJobDetail', e.target.value)}
                      placeholder="Nhập công việc cụ thể"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Danh hiệu</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="Nhập danh hiệu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Số thẻ từ</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleChange('cardNumber', e.target.value)}
                      placeholder="Nhập số thẻ từ"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentReturnDate">Ngày trả hồ sơ</Label>
                    <Input
                      id="documentReturnDate"
                      type="date"
                      value={formData.documentReturnDate}
                      onChange={(e) => handleChange('documentReturnDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 flex items-center gap-2 pt-6">
                    <Checkbox
                      id="isWoundedSoldier"
                      checked={formData.isWoundedSoldier}
                      onCheckedChange={(checked) => handleChange('isWoundedSoldier', checked)}
                    />
                    <Label htmlFor="isWoundedSoldier" className="cursor-pointer">
                      Thương binh
                    </Label>
                  </div>
                </div>
              </div>

              {/* Trình độ & chuyên môn */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Trình độ & Chuyên môn</h3>
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
                    <Label htmlFor="educationDetail">Trình độ cụ thể</Label>
                    <Input
                      id="educationDetail"
                      value={formData.educationDetail}
                      onChange={(e) => handleChange('educationDetail', e.target.value)}
                      placeholder="Nhập trình độ cụ thể"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="culturalLevelId">Trình độ văn hóa</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.culturalLevel.api}
                      config={categoryConfigs.culturalLevel}
                      value={formData.culturalLevelId?.toString()}
                      onChange={(v) => handleChange("culturalLevelId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="professionalLevelId">Trình độ chuyên môn</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.professionalLevel.api}
                      config={categoryConfigs.professionalLevel}
                      value={formData.professionalLevelId?.toString()}
                      onChange={(v) => handleChange("professionalLevelId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialtyId">Nghề nghiệp</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.specialty.api}
                      config={categoryConfigs.specialty}
                      value={formData.specialtyId?.toString()}
                      onChange={(v) => handleChange("specialtyId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="itLevelId">Trình độ tin học</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.itLevel.api}
                      config={categoryConfigs.itLevel}
                      value={formData.itLevelId?.toString()}
                      onChange={(v) => handleChange("itLevelId", String(v))}
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

              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin đào tạo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trainingInstitutionId">Trường đào tạo</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.trainingInstitution.api}
                      config={categoryConfigs.trainingInstitution}
                      value={formData.trainingInstitutionId?.toString()}
                      onChange={(v) => handleChange("trainingInstitutionId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingMajorId">Ngành đào tạo</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.trainingMajor.api}
                      config={categoryConfigs.trainingMajor}
                      value={formData.trainingMajorId?.toString()}
                      onChange={(v) => handleChange("trainingMajorId", String(v))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trainingTypeId">Hình thức đào tạo</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.trainingType.api}
                      config={categoryConfigs.trainingType}
                      value={formData.trainingTypeId?.toString()}
                      onChange={(v) => handleChange("trainingTypeId", String(v))}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin BHXH */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin bảo hiểm xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialInsuranceNumber">Số sổ BHXH</Label>
                    <Input
                      id="socialInsuranceNumber"
                      value={formData.socialInsuranceNumber}
                      onChange={(e) => handleChange('socialInsuranceNumber', e.target.value)}
                      placeholder="Nhập số sổ BHXH"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialInsuranceStartDate">Ngày tham gia BHXH</Label>
                    <Input
                      id="socialInsuranceStartDate"
                      type="date"
                      value={formData.socialInsuranceStartDate}
                      onChange={(e) => handleChange('socialInsuranceStartDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socialInsuranceJobId">Công việc BHXH</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.socialInsuranceJob.api}
                      config={categoryConfigs.socialInsuranceJob}
                      value={formData.socialInsuranceJobId?.toString()}
                      onChange={(v) => handleChange("socialInsuranceJobId", String(v))}
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin Đảng, Đoàn, Quân đội */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Thông tin tổ chức chính trị – xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="partyJoinDate">Ngày vào Đảng</Label>
                    <Input
                      id="partyJoinDate"
                      type="date"
                      value={formData.partyJoinDate}
                      onChange={(e) => handleChange('partyJoinDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="partyOfficialDate">Ngày chính thức kết nạp Đảng</Label>
                    <Input
                      id="partyOfficialDate"
                      type="date"
                      value={formData.partyOfficialDate}
                      onChange={(e) => handleChange('partyOfficialDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="youthUnionJoinDate">Ngày vào Đoàn</Label>
                    <Input
                      id="youthUnionJoinDate"
                      type="date"
                      value={formData.youthUnionJoinDate}
                      onChange={(e) => handleChange('youthUnionJoinDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="militaryJoinDate">Ngày nhập ngũ</Label>
                    <Input
                      id="militaryJoinDate"
                      type="date"
                      value={formData.militaryJoinDate}
                      onChange={(e) => handleChange('militaryJoinDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="militaryEndDate">Ngày xuất ngũ</Label>
                    <Input
                      id="militaryEndDate"
                      type="date"
                      value={formData.militaryEndDate}
                      onChange={(e) => handleChange('militaryEndDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="militaryRankId">Quân hàm</Label>
                    <GenericSearchSelect
                      api={categoryConfigs.militaryRank.api}
                      config={categoryConfigs.militaryRank}
                      value={formData.militaryRankId?.toString()}
                      onChange={(v) => handleChange("militaryRankId", String(v))}
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-600">Ghi chú</h3>
                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    value={formData.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    placeholder="Nhập ghi chú..."
                    rows={4}
                  />
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
                    : 'Xác nhận'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}