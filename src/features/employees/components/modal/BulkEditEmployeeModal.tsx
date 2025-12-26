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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/shared/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { employeeApi } from '../../api/employeeApi';
import { toast } from '@/shared/components/ui/use-toast';
import { Loader2, X, Search, Check, ChevronsUpDown } from 'lucide-react';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";

export default function BulkEditEmployeeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Fetch all employees for search
    const { data: allEmployees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: employeeApi.getAll,
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (payload: any[]) => employeeApi.updateBulk(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: `Đã cập nhật ${selectedEmployees.length} nhân viên`,
            });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            handleClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể cập nhật nhân viên',
                variant: 'destructive',
            });
        },
    });

    const handleAddEmployee = async (employeeId: number) => {
        if (selectedEmployees.find(e => e.id === employeeId)) {
            toast({
                title: 'Thông báo',
                description: 'Nhân viên này đã được thêm',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await employeeApi.getById(employeeId);
            const employeeData = response.data || response;

            setSelectedEmployees(prev => [...prev, {
                id: employeeData.id,
                code: employeeData.code || '',
                fullName: employeeData.name || '',
                birthDate: employeeData.birthday || '',
                birthPlace: employeeData.birthPlace || '',
                startDate: employeeData.startDate || '',
                endDate: employeeData.endDate || '',
                gender: employeeData.gender || 'NAM',
                status: employeeData.status || 'Đang làm việc',

                // CCCD
                cccdNumber: employeeData.cccdNumber || '',
                cccdDate: employeeData.cccdDate || '',
                cccdPalce: employeeData.cccdPalce || '',

                // Địa chỉ
                contactAddress: employeeData.contactAddress || '',
                nativePlace: employeeData.nativePlace || '',
                homeTown: employeeData.homeTown || '',
                permanentAddress: employeeData.permanentAddress || '',

                // Công việc
                departmentId: employeeData.departmentId?.toString() || '',
                positionId: employeeData.positionId?.toString() || '',
                laborContractTypeId: employeeData.laborContractTypeId?.toString() || '',
                currentJobDetail: employeeData.currentJobDetail || '',
                title: employeeData.title || '',
                cardNumber: employeeData.cardNumber || '',
                documentReturnDate: employeeData.documentReturnDate || '',
                isWoundedSoldier: employeeData.isWoundedSoldier || false,

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

                // Đào tạo
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

                // Ghi chú
                note: employeeData.note || '',
                userId: employeeData.userId || null,
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching employee:', error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải thông tin nhân viên',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveEmployee = (employeeId: number) => {
        setSelectedEmployees(prev => prev.filter(e => e.id !== employeeId));
    };

    const handleFieldChange = (employeeId: number, field: string, value: any) => {
        setSelectedEmployees(prev =>
            prev.map(emp =>
                emp.id === employeeId ? { ...emp, [field]: value } : emp
            )
        );
    };

    const handleSubmit = () => {
        if (selectedEmployees.length === 0) {
            toast({
                title: 'Thông báo',
                description: 'Vui lòng chọn ít nhất một nhân viên',
                variant: 'destructive',
            });
            return;
        }

        const payload = selectedEmployees.map(emp => ({
            id: Number(emp.id),
            code: emp.code,
            fullName: emp.fullName,
            birthDate: emp.birthDate,
            birthPlace: emp.birthPlace || null,
            startDate: emp.startDate,
            endDate: emp.endDate || null,
            gender: emp.gender,
            status: emp.status,

            // CCCD
            cccdNumber: emp.cccdNumber || null,
            cccdDate: emp.cccdDate || null,
            cccdPalce: emp.cccdPalce || null,

            // Địa chỉ
            contactAddress: emp.contactAddress || null,
            nativePlace: emp.nativePlace || null,
            homeTown: emp.homeTown || null,
            permanentAddress: emp.permanentAddress || null,

            // Công việc
            currentJobDetail: emp.currentJobDetail || null,
            title: emp.title || null,
            cardNumber: emp.cardNumber || null,
            documentReturnDate: emp.documentReturnDate || null,
            isWoundedSoldier: emp.isWoundedSoldier,

            // Thông tin cá nhân
            ethnicity: emp.ethnicity || null,
            religion: emp.religion || null,
            educationDetail: emp.educationDetail || null,

            // BHXH
            socialInsuranceNumber: emp.socialInsuranceNumber || null,
            socialInsuranceStartDate: emp.socialInsuranceStartDate || null,

            // Đảng, Đoàn, Quân đội
            partyJoinDate: emp.partyJoinDate || null,
            partyOfficialDate: emp.partyOfficialDate || null,
            youthUnionJoinDate: emp.youthUnionJoinDate || null,
            militaryJoinDate: emp.militaryJoinDate || null,
            militaryEndDate: emp.militaryEndDate || null,

            // Ghi chú
            note: emp.note || null,

            // Object references
            department: emp.departmentId ? { id: Number(emp.departmentId) } : null,
            position: emp.positionId ? { id: Number(emp.positionId) } : null,
            laborContractType: emp.laborContractTypeId ? { id: Number(emp.laborContractTypeId) } : null,
            ward: emp.wardId ? { id: Number(emp.wardId) } : null,
            provinceCity: emp.provinceCityId ? { id: Number(emp.provinceCityId) } : null,
            specialty: emp.specialtyId ? { id: Number(emp.specialtyId) } : null,
            educationLevel: emp.educationLevelId ? { id: Number(emp.educationLevelId) } : null,
            politicalTheory: emp.politicalTheoryId ? { id: Number(emp.politicalTheoryId) } : null,
            languageLevel: emp.languageLevelId ? { id: Number(emp.languageLevelId) } : null,
            nationality: emp.nationalityId ? { id: Number(emp.nationalityId) } : null,
            culturalLevel: emp.culturalLevelId ? { id: Number(emp.culturalLevelId) } : null,
            professionalLevel: emp.professionalLevelId ? { id: Number(emp.professionalLevelId) } : null,
            itLevel: emp.itLevelId ? { id: Number(emp.itLevelId) } : null,
            trainingInstitution: emp.trainingInstitutionId ? { id: Number(emp.trainingInstitutionId) } : null,
            trainingMajor: emp.trainingMajorId ? { id: Number(emp.trainingMajorId) } : null,
            trainingType: emp.trainingTypeId ? { id: Number(emp.trainingTypeId) } : null,
            militaryRank: emp.militaryRankId ? { id: Number(emp.militaryRankId) } : null,
            policyFamily: emp.policyFamilyId ? { id: Number(emp.policyFamilyId) } : null,
            socialInsuranceJob: emp.socialInsuranceJobId ? { id: Number(emp.socialInsuranceJobId) } : null,

            ...(emp.userId && {
                user: { id: emp.userId }
            }),
        }));

        updateMutation.mutate(payload);
    };

    const handleClose = () => {
        setSelectedEmployees([]);
        setSearchValue('');
        onClose();
    };

    const filteredEmployees = allEmployees.filter(emp =>
        emp.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderEmployeeFields = (employee, index) => (
        <div key={employee.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {employee.fullName}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmployee(employee.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Cơ bản</TabsTrigger>
                    <TabsTrigger value="address">Địa chỉ</TabsTrigger>
                    <TabsTrigger value="work">Công việc</TabsTrigger>
                    <TabsTrigger value="education">Trình độ</TabsTrigger>
                    <TabsTrigger value="other">Khác</TabsTrigger>
                </TabsList>

                {/* Tab Cơ bản */}
                <TabsContent value="basic" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Mã NV *</Label>
                            <Input
                                value={employee.code}
                                onChange={(e) => handleFieldChange(employee.id, 'code', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Họ và tên *</Label>
                            <Input
                                value={employee.fullName}
                                onChange={(e) => handleFieldChange(employee.id, 'fullName', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày sinh *</Label>
                            <Input
                                type="date"
                                value={employee.birthDate}
                                onChange={(e) => handleFieldChange(employee.id, 'birthDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi sinh</Label>
                            <Input
                                value={employee.birthPlace}
                                onChange={(e) => handleFieldChange(employee.id, 'birthPlace', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Giới tính</Label>
                            <Select
                                value={employee.gender}
                                onValueChange={(value) => handleFieldChange(employee.id, 'gender', value)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAM">Nam</SelectItem>
                                    <SelectItem value="NỮ">Nữ</SelectItem>
                                    <SelectItem value="KHÁC">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Dân tộc</Label>
                            <Input
                                value={employee.ethnicity}
                                onChange={(e) => handleFieldChange(employee.id, 'ethnicity', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tôn giáo</Label>
                            <Input
                                value={employee.religion}
                                onChange={(e) => handleFieldChange(employee.id, 'religion', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quốc tịch</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.nationality.api}
                                config={categoryConfigs.nationality}
                                value={employee.nationalityId}
                                onChange={(v) => handleFieldChange(employee.id, 'nationalityId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gia đình chính sách</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.policyFamily.api}
                                config={categoryConfigs.policyFamily}
                                value={employee.policyFamilyId}
                                onChange={(v) => handleFieldChange(employee.id, 'policyFamilyId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số CCCD</Label>
                            <Input
                                value={employee.cccdNumber}
                                onChange={(e) => handleFieldChange(employee.id, 'cccdNumber', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày cấp CCCD</Label>
                            <Input
                                type="date"
                                value={employee.cccdDate}
                                onChange={(e) => handleFieldChange(employee.id, 'cccdDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi cấp CCCD</Label>
                            <Input
                                value={employee.cccdPalce}
                                onChange={(e) => handleFieldChange(employee.id, 'cccdPalce', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Địa chỉ */}
                <TabsContent value="address" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Tỉnh/Thành phố</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.provinceCity.api}
                                config={categoryConfigs.provinceCity}
                                value={employee.provinceCityId}
                                onChange={(v) => handleFieldChange(employee.id, 'provinceCityId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phường/Xã</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.ward.api}
                                config={categoryConfigs.ward}
                                value={employee.wardId}
                                onChange={(v) => handleFieldChange(employee.id, 'wardId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Địa chỉ liên hệ</Label>
                            <Input
                                value={employee.contactAddress}
                                onChange={(e) => handleFieldChange(employee.id, 'contactAddress', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hộ khẩu thường trú</Label>
                            <Input
                                value={employee.permanentAddress}
                                onChange={(e) => handleFieldChange(employee.id, 'permanentAddress', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nguyên quán</Label>
                            <Input
                                value={employee.nativePlace}
                                onChange={(e) => handleFieldChange(employee.id, 'nativePlace', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quê quán</Label>
                            <Input
                                value={employee.homeTown}
                                onChange={(e) => handleFieldChange(employee.id, 'homeTown', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Công việc */}
                <TabsContent value="work" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào làm *</Label>
                            <Input
                                type="date"
                                value={employee.startDate}
                                onChange={(e) => handleFieldChange(employee.id, 'startDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày kết thúc</Label>
                            <Input
                                type="date"
                                value={employee.endDate}
                                onChange={(e) => handleFieldChange(employee.id, 'endDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trạng thái</Label>
                            <Select
                                value={employee.status}
                                onValueChange={(value) => handleFieldChange(employee.id, 'status', value)}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Đang làm việc">Đang làm việc</SelectItem>
                                    <SelectItem value="Đã nghỉ việc">Đã nghỉ việc</SelectItem>
                                    <SelectItem value="Tạm nghỉ">Tạm nghỉ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phòng ban *</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.department.api}
                                config={categoryConfigs.department}
                                value={employee.departmentId}
                                onChange={(v) => handleFieldChange(employee.id, 'departmentId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chức vụ *</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.jobTitle.api}
                                config={categoryConfigs.jobTitle}
                                value={employee.positionId}
                                onChange={(v) => handleFieldChange(employee.id, 'positionId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Loại hợp đồng</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.laborContractType.api}
                                config={categoryConfigs.laborContractType}
                                value={employee.laborContractTypeId}
                                onChange={(v) => handleFieldChange(employee.id, 'laborContractTypeId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc cụ thể</Label>
                            <Input
                                value={employee.currentJobDetail}
                                onChange={(e) => handleFieldChange(employee.id, 'currentJobDetail', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Danh hiệu</Label>
                            <Input
                                value={employee.title}
                                onChange={(e) => handleFieldChange(employee.id, 'title', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số thẻ từ</Label>
                            <Input
                                value={employee.cardNumber}
                                onChange={(e) => handleFieldChange(employee.id, 'cardNumber', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày trả hồ sơ</Label>
                            <Input
                                type="date"
                                value={employee.documentReturnDate}
                                onChange={(e) => handleFieldChange(employee.id, 'documentReturnDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1 flex items-center gap-2 pt-5">
                            <Checkbox
                                checked={employee.isWoundedSoldier}
                                onCheckedChange={(checked) => handleFieldChange(employee.id, 'isWoundedSoldier', checked)}
                            />
                            <Label className="text-xs cursor-pointer">Thương binh</Label>
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Trình độ */}
                <TabsContent value="education" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Bậc học</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.degree.api}
                                config={categoryConfigs.degree}
                                value={employee.educationLevelId}
                                onChange={(v) => handleFieldChange(employee.id, 'educationLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ cụ thể</Label>
                            <Input
                                value={employee.educationDetail}
                                onChange={(e) => handleFieldChange(employee.id, 'educationDetail', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ văn hóa</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.culturalLevel.api}
                                config={categoryConfigs.culturalLevel}
                                value={employee.culturalLevelId}
                                onChange={(v) => handleFieldChange(employee.id, 'culturalLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ chuyên môn</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.professionalLevel.api}
                                config={categoryConfigs.professionalLevel}
                                value={employee.professionalLevelId}
                                onChange={(v) => handleFieldChange(employee.id, 'professionalLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nghề nghiệp</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.specialty.api}
                                config={categoryConfigs.specialty}
                                value={employee.specialtyId}
                                onChange={(v) => handleFieldChange(employee.id, 'specialtyId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ tin học</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.itLevel.api}
                                config={categoryConfigs.itLevel}
                                value={employee.itLevelId}
                                onChange={(v) => handleFieldChange(employee.id, 'itLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ ngoại ngữ</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.languageLevel.api}
                                config={categoryConfigs.languageLevel}
                                value={employee.languageLevelId}
                                onChange={(v) => handleFieldChange(employee.id, 'languageLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lý luận chính trị</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.politicalTheory.api}
                                config={categoryConfigs.politicalTheory}
                                value={employee.politicalTheoryId}
                                onChange={(v) => handleFieldChange(employee.id, 'politicalTheoryId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trường đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingInstitution.api}
                                config={categoryConfigs.trainingInstitution}
                                value={employee.trainingInstitutionId}
                                onChange={(v) => handleFieldChange(employee.id, 'trainingInstitutionId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngành đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingMajor.api}
                                config={categoryConfigs.trainingMajor}
                                value={employee.trainingMajorId}
                                onChange={(v) => handleFieldChange(employee.id, 'trainingMajorId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hình thức đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingType.api}
                                config={categoryConfigs.trainingType}
                                value={employee.trainingTypeId}
                                onChange={(v) => handleFieldChange(employee.id, 'trainingTypeId', String(v))}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab Khác */}
                <TabsContent value="other" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Số sổ BHXH</Label>
                            <Input
                                value={employee.socialInsuranceNumber}
                                onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceNumber', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày tham gia BHXH</Label>
                            <Input
                                type="date"
                                value={employee.socialInsuranceStartDate}
                                onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceStartDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc BHXH</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.socialInsuranceJob.api}
                                config={categoryConfigs.socialInsuranceJob}
                                value={employee.socialInsuranceJobId}
                                onChange={(v) => handleFieldChange(employee.id, 'socialInsuranceJobId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào Đảng</Label>
                            <Input
                                type="date"
                                value={employee.partyJoinDate}
                                onChange={(e) => handleFieldChange(employee.id, 'partyJoinDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày chính thức Đảng</Label>
                            <Input
                                type="date"
                                value={employee.partyOfficialDate}
                                onChange={(e) => handleFieldChange(employee.id, 'partyOfficialDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào Đoàn</Label>
                            <Input
                                type="date"
                                value={employee.youthUnionJoinDate}
                                onChange={(e) => handleFieldChange(employee.id, 'youthUnionJoinDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày nhập ngũ</Label>
                            <Input
                                type="date"
                                value={employee.militaryJoinDate}
                                onChange={(e) => handleFieldChange(employee.id, 'militaryJoinDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày xuất ngũ</Label>
                            <Input
                                type="date"
                                value={employee.militaryEndDate}
                                onChange={(e) => handleFieldChange(employee.id, 'militaryEndDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quân hàm</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.militaryRank.api}
                                config={categoryConfigs.militaryRank}
                                value={employee.militaryRankId}
                                onChange={(v) => handleFieldChange(employee.id, 'militaryRankId', String(v))}
                            />
                        </div>
                        <div className="space-y-1 col-span-3">
                            <Label className="text-xs">Ghi chú</Label>
                            <Textarea
                                value={employee.note}
                                onChange={(e) => handleFieldChange(employee.id, 'note', e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa hàng loạt nhân viên</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn nhân viên để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-4 px-1">
                    {/* Search and Add Employee */}
                    <div className="flex gap-2">
                        {/* Search Popover */}
                        <div className="flex-1">
                            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={searchOpen}
                                        className="w-full justify-between"
                                    >
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        {searchValue || "Nhập tên nhân viên..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm nhân viên..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredEmployees.map((employee) => (
                                                <CommandItem
                                                    key={employee.id}
                                                    value={employee.fullName}
                                                    onSelect={() => handleAddEmployee(employee.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedEmployees.find(e => e.id === employee.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{employee.fullName}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {employee.code} • {employee.departmentName}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Import Excel */}
                        <Button
                            className="shrink-0 whitespace-nowrap"
                        >
                            Import Excel
                        </Button>
                    </div>


                    {/* Selected Employees List */}
                    {selectedEmployees.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between sticky top-0 bg-background z-20 py-2">
                                <Label className="text-base font-semibold">
                                    Đã chọn {selectedEmployees.length} nhân viên
                                </Label>
                            </div>

                            {selectedEmployees.map((employee, index) => renderEmployeeFields(employee, index))}
                        </div>
                    )}

                    {selectedEmployees.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>Chưa có nhân viên nào được chọn</p>
                            <p className="text-sm">Sử dụng ô tìm kiếm ở trên để thêm nhân viên</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={updateMutation.isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || selectedEmployees.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Lưu thay đổi (${selectedEmployees.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}