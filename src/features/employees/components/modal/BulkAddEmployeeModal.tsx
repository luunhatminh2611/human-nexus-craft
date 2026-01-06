import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { employeeApi } from '../../api/employeeApi';
import { toast } from '@/shared/components/ui/use-toast';
import { Loader2, X, Plus, UserPlus, Download, Upload } from 'lucide-react';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddEmployeeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [employees, setEmployees] = useState([]);
    const [nextId, setNextId] = useState(1);


    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table'); // Chế độ hiển thị
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
        'code', 'fullName', 'birthDate', 'startDate', 'departmentId', 'positionId',
        'gender', 'contactAddress', 'laborContractTypeId'
    ]));

    const allColumns = {
        // Cột bắt buộc (không thể ẩn)
        required: [
            { key: 'code', label: 'Mã NV *' },
            { key: 'fullName', label: 'Tên NV *' },
            { key: 'birthDate', label: 'Ngày sinh *' },
            { key: 'startDate', label: 'Ngày vào làm *' },
            { key: 'departmentId', label: 'Phòng ban *' },
            { key: 'positionId', label: 'Chức vụ *' },
        ],
        // Cột tùy chọn
        optional: [
            { key: 'gender', label: 'Giới tính', group: 'Cơ bản' },
            { key: 'birthPlace', label: 'Nơi sinh', group: 'Cơ bản' },
            { key: 'ethnicity', label: 'Dân tộc', group: 'Cơ bản' },
            { key: 'religion', label: 'Tôn giáo', group: 'Cơ bản' },
            { key: 'nationalityId', label: 'Quốc tịch', group: 'Cơ bản' },
            { key: 'policyFamilyId', label: 'Gia đình CS', group: 'Cơ bản' },
            { key: 'cccdNumber', label: 'Số CCCD', group: 'Cơ bản' },
            { key: 'cccdDate', label: 'Ngày cấp CCCD', group: 'Cơ bản' },
            { key: 'cccdPlace', label: 'Nơi cấp CCCD', group: 'Cơ bản' },

            { key: 'provinceCityId', label: 'Tỉnh/TP', group: 'Địa chỉ' },
            { key: 'wardId', label: 'Phường/Xã', group: 'Địa chỉ' },
            { key: 'contactAddress', label: 'Địa chỉ liên hệ', group: 'Địa chỉ' },
            { key: 'permanentAddress', label: 'Hộ khẩu', group: 'Địa chỉ' },
            { key: 'nativePlace', label: 'Nguyên quán', group: 'Địa chỉ' },
            { key: 'homeTown', label: 'Quê quán', group: 'Địa chỉ' },

            { key: 'endDate', label: 'Ngày kết thúc', group: 'Công việc' },
            { key: 'laborContractTypeId', label: 'Loại HĐ', group: 'Công việc' },
            { key: 'currentJobDetail', label: 'Công việc cụ thể', group: 'Công việc' },
            { key: 'title', label: 'Danh hiệu', group: 'Công việc' },
            { key: 'cardNumber', label: 'Số thẻ từ', group: 'Công việc' },
            { key: 'documentReturnDate', label: 'Ngày trả HS', group: 'Công việc' },
            { key: 'isWoundedSoldier', label: 'Thương binh', group: 'Công việc' },

            { key: 'educationLevelId', label: 'Bậc học', group: 'Trình độ' },
            { key: 'educationDetail', label: 'Trình độ cụ thể', group: 'Trình độ' },
            { key: 'culturalLevelId', label: 'Văn hóa', group: 'Trình độ' },
            { key: 'professionalLevelId', label: 'Chuyên môn', group: 'Trình độ' },
            { key: 'specialtyId', label: 'Nghề nghiệp', group: 'Trình độ' },
            { key: 'itLevelId', label: 'Tin học', group: 'Trình độ' },
            { key: 'languageLevelId', label: 'Ngoại ngữ', group: 'Trình độ' },
            { key: 'politicalTheoryId', label: 'Lý luận CT', group: 'Trình độ' },
            { key: 'trainingInstitutionId', label: 'Trường ĐT', group: 'Trình độ' },
            { key: 'trainingMajorId', label: 'Ngành ĐT', group: 'Trình độ' },
            { key: 'trainingTypeId', label: 'Hình thức ĐT', group: 'Trình độ' },

            { key: 'socialInsuranceNumber', label: 'Số sổ BHXH', group: 'Khác' },
            { key: 'socialInsuranceStartDate', label: 'Ngày tham gia BHXH', group: 'Khác' },
            { key: 'socialInsuranceJobId', label: 'Công việc BHXH', group: 'Khác' },
            { key: 'partyJoinDate', label: 'Ngày vào Đảng', group: 'Khác' },
            { key: 'partyOfficialDate', label: 'Ngày CT Đảng', group: 'Khác' },
            { key: 'youthUnionJoinDate', label: 'Ngày vào Đoàn', group: 'Khác' },
            { key: 'militaryJoinDate', label: 'Ngày nhập ngũ', group: 'Khác' },
            { key: 'militaryEndDate', label: 'Ngày xuất ngũ', group: 'Khác' },
            { key: 'militaryRankId', label: 'Quân hàm', group: 'Khác' },
            { key: 'note', label: 'Ghi chú', group: 'Khác' },
        ]
    };

    const toggleColumn = (columnKey: string) => {
        const newVisible = new Set(visibleColumns);
        if (newVisible.has(columnKey)) {
            newVisible.delete(columnKey);
        } else {
            newVisible.add(columnKey);
        }
        setVisibleColumns(newVisible);
    };

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (payload: any[]) => employeeApi.saveAll(payload),
        onSuccess: () => {
            toast({
                title: 'Thành công',
                description: `Đã thêm ${employees.length} nhân viên`,
            });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            handleClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể thêm nhân viên',
                variant: 'destructive',
            });
        },
    });

    const createNewEmployee = () => {
        return {
            tempId: nextId,
            code: '',
            fullName: '',
            birthDate: '',
            birthPlace: '',
            startDate: '',
            endDate: '',
            gender: 'NAM',
            status: 'Đang làm việc',

            // CCCD
            cccdNumber: '',
            cccdDate: '',
            cccdPlace: '',

            // Địa chỉ
            contactAddress: '',
            nativePlace: '',
            homeTown: '',
            permanentAddress: '',

            // Công việc
            departmentId: '',
            positionId: '',
            laborContractTypeId: '',
            currentJobDetail: '',
            title: '',
            cardNumber: '',
            documentReturnDate: '',
            isWoundedSoldier: false,

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

            // Ghi chú
            note: '',
        };
    };

    const handleAddEmployee = () => {
        setEmployees(prev => [...prev, createNewEmployee()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveEmployee = (tempId: number) => {
        setEmployees(prev => prev.filter(e => e.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setEmployees(prev =>
            prev.map(emp =>
                emp.tempId === tempId ? { ...emp, [field]: value } : emp
            )
        );
    };

    const handleSubmit = () => {
        if (employees.length === 0) {
            toast({
                title: 'Thông báo',
                description: 'Vui lòng thêm ít nhất một nhân viên',
                variant: 'destructive',
            });
            return;
        }

        // Validate required fields
        const invalidEmployees = employees.filter(emp =>
            !emp.code || !emp.fullName || !emp.birthDate || !emp.startDate || !emp.departmentId || !emp.positionId
        );

        // if (invalidEmployees.length > 0) {
        //     toast({
        //         title: 'Thông báo',
        //         description: 'Vui lòng điền đầy đủ các trường bắt buộc (*)',
        //         variant: 'destructive',
        //     });
        //     return;
        // }

        const payload = employees.map(emp => ({
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
            cccdPlace: emp.cccdPlace || null,

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
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setEmployees([]);
        setNextId(1);
        onClose();
    };

    const renderTableCell = (employee, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'fullName':
            case 'birthPlace':
            case 'religion':
            case 'currentJobDetail':
            case 'title':
            case 'cardNumber':
            case 'educationDetail':
            case 'contactAddress':
            case 'permanentAddress':
            case 'nativePlace':
            case 'homeTown':
            case 'cccdNumber':
            case 'cccdPlace':
            case 'socialInsuranceNumber':
                return (
                    <Input
                        value={employee[field]}
                        onChange={(e) => handleFieldChange(employee.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="..."
                    />
                );

            case 'birthDate':
            case 'startDate':
            case 'endDate':
            case 'cccdDate':
            case 'documentReturnDate':
            case 'socialInsuranceStartDate':
            case 'partyJoinDate':
            case 'partyOfficialDate':
            case 'youthUnionJoinDate':
            case 'militaryJoinDate':
            case 'militaryEndDate':
                return (
                    <Input
                        type="date"
                        value={employee[field]}
                        onChange={(e) => handleFieldChange(employee.tempId, field, e.target.value)}
                        className={commonInputClass}
                    />
                );

            case 'gender':
                return (
                    <Select
                        value={employee.gender}
                        onValueChange={(value) => handleFieldChange(employee.tempId, 'gender', value)}
                    >
                        <SelectTrigger className={commonInputClass}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="NAM">Nam</SelectItem>
                            <SelectItem value="NỮ">Nữ</SelectItem>
                            <SelectItem value="KHÁC">Khác</SelectItem>
                        </SelectContent>
                    </Select>
                );

            case 'isWoundedSoldier':
                return (
                    <div className="flex items-center justify-center">
                        <Checkbox
                            checked={employee.isWoundedSoldier}
                            onCheckedChange={(checked) => handleFieldChange(employee.tempId, 'isWoundedSoldier', checked)}
                        />
                    </div>
                );

            case 'note':
                return (
                    <Textarea
                        value={employee.note}
                        onChange={(e) => handleFieldChange(employee.tempId, 'note', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                    />
                );

            // Các trường GenericSearchSelect
            case 'ethnicity':
            case 'nationalityId':
            case 'policyFamilyId':
            case 'provinceCityId':
            case 'wardId':
            case 'departmentId':
            case 'positionId':
            case 'laborContractTypeId':
            case 'specialtyId':
            case 'educationLevelId':
            case 'politicalTheoryId':
            case 'languageLevelId':
            case 'culturalLevelId':
            case 'professionalLevelId':
            case 'itLevelId':
            case 'trainingInstitutionId':
            case 'trainingMajorId':
            case 'trainingTypeId':
            case 'militaryRankId':
            case 'socialInsuranceJobId':
                const configKey = field === 'positionId' ? 'jobTitle' :
                    field === 'educationLevelId' ? 'degree' :
                        field.replace('Id', '');
                const config = categoryConfigs[configKey];
                if (!config) return <div className="text-xs text-muted-foreground">N/A</div>;

                return (
                    <div className="min-w-[180px]">
                        <GenericSearchSelect
                            api={config.api}
                            config={config}
                            value={employee[field]}
                            onChange={(v) => handleFieldChange(employee.tempId, field, String(v))}
                        />
                    </div>
                );

            default:
                return <div className="text-xs text-muted-foreground">-</div>;
        }
    };

    const renderEmployeeFieldsExpanded = (employee, index) => (
        <div key={employee.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {employee.fullName || 'Nhân viên mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmployee(employee.tempId)}
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
                                onChange={(e) => handleFieldChange(employee.tempId, 'code', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập mã nhân viên"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tên nhân viên *</Label>
                            <Input
                                value={employee.fullName}
                                onChange={(e) => handleFieldChange(employee.tempId, 'fullName', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập tên nhân viên"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày sinh *</Label>
                            <Input
                                type="date"
                                value={employee.birthDate}
                                onChange={(e) => handleFieldChange(employee.tempId, 'birthDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi sinh</Label>
                            <Input
                                value={employee.birthPlace}
                                onChange={(e) => handleFieldChange(employee.tempId, 'birthPlace', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập nơi sinh"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Giới tính</Label>
                            <Select
                                value={employee.gender}
                                onValueChange={(value) => handleFieldChange(employee.tempId, 'gender', value)}
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
                            <GenericSearchSelect
                                api={categoryConfigs.ethnicity.api}
                                config={categoryConfigs.ethnicity}
                                value={employee.ethnicity?.toString()}
                                onChange={(v) => handleFieldChange(employee.tempId, "ethnicity", String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tôn giáo</Label>
                            <Input
                                value={employee.religion}
                                onChange={(e) => handleFieldChange(employee.tempId, 'religion', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập tôn giáo"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quốc tịch</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.nationality.api}
                                config={categoryConfigs.nationality}
                                value={employee.nationalityId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'nationalityId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gia đình chính sách</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.policyFamily.api}
                                config={categoryConfigs.policyFamily}
                                value={employee.policyFamilyId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'policyFamilyId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số CCCD</Label>
                            <Input
                                value={employee.cccdNumber}
                                onChange={(e) => handleFieldChange(employee.tempId, 'cccdNumber', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập số CCCD"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày cấp CCCD</Label>
                            <Input
                                type="date"
                                value={employee.cccdDate}
                                onChange={(e) => handleFieldChange(employee.tempId, 'cccdDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi cấp CCCD</Label>
                            <Input
                                value={employee.cccdPlace}
                                onChange={(e) => handleFieldChange(employee.tempId, 'cccdPlace', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập nơi cấp"
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
                                onChange={(v) => handleFieldChange(employee.tempId, 'provinceCityId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phường/Xã</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.ward.api}
                                config={categoryConfigs.ward}
                                value={employee.wardId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'wardId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Địa chỉ liên hệ</Label>
                            <Input
                                value={employee.contactAddress}
                                onChange={(e) => handleFieldChange(employee.tempId, 'contactAddress', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập địa chỉ"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hộ khẩu thường trú</Label>
                            <Input
                                value={employee.permanentAddress}
                                onChange={(e) => handleFieldChange(employee.tempId, 'permanentAddress', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập hộ khẩu"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nguyên quán</Label>
                            <Input
                                value={employee.nativePlace}
                                onChange={(e) => handleFieldChange(employee.tempId, 'nativePlace', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập nguyên quán"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quê quán</Label>
                            <Input
                                value={employee.homeTown}
                                onChange={(e) => handleFieldChange(employee.tempId, 'homeTown', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập quê quán"
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
                                onChange={(e) => handleFieldChange(employee.tempId, 'startDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày kết thúc</Label>
                            <Input
                                type="date"
                                value={employee.endDate}
                                onChange={(e) => handleFieldChange(employee.tempId, 'endDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phòng ban *</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.department.api}
                                config={categoryConfigs.department}
                                value={employee.departmentId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'departmentId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chức vụ *</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.jobTitle.api}
                                config={categoryConfigs.jobTitle}
                                value={employee.positionId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'positionId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Loại hợp đồng</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.laborContractType.api}
                                config={categoryConfigs.laborContractType}
                                value={employee.laborContractTypeId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'laborContractTypeId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc cụ thể</Label>
                            <Input
                                value={employee.currentJobDetail}
                                onChange={(e) => handleFieldChange(employee.tempId, 'currentJobDetail', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập công việc"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Danh hiệu</Label>
                            <Input
                                value={employee.title}
                                onChange={(e) => handleFieldChange(employee.tempId, 'title', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập danh hiệu"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số thẻ từ</Label>
                            <Input
                                value={employee.cardNumber}
                                onChange={(e) => handleFieldChange(employee.tempId, 'cardNumber', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập số thẻ"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày trả hồ sơ</Label>
                            <Input
                                type="date"
                                value={employee.documentReturnDate}
                                onChange={(e) => handleFieldChange(employee.tempId, 'documentReturnDate', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1 flex items-center gap-2 pt-5">
                            <Checkbox
                                checked={employee.isWoundedSoldier}
                                onCheckedChange={(checked) => handleFieldChange(employee.tempId, 'isWoundedSoldier', checked)}
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
                                onChange={(v) => handleFieldChange(employee.tempId, 'educationLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ cụ thể</Label>
                            <Input
                                value={employee.educationDetail}
                                onChange={(e) => handleFieldChange(employee.tempId, 'educationDetail', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập trình độ"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ văn hóa</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.culturalLevel.api}
                                config={categoryConfigs.culturalLevel}
                                value={employee.culturalLevelId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'culturalLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ chuyên môn</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.professionalLevel.api}
                                config={categoryConfigs.professionalLevel}
                                value={employee.professionalLevelId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'professionalLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nghề nghiệp</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.specialty.api}
                                config={categoryConfigs.specialty}
                                value={employee.specialtyId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'specialtyId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ tin học</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.itLevel.api}
                                config={categoryConfigs.itLevel}
                                value={employee.itLevelId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'itLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ ngoại ngữ</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.languageLevel.api}
                                config={categoryConfigs.languageLevel}
                                value={employee.languageLevelId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'languageLevelId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lý luận chính trị</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.politicalTheory.api}
                                config={categoryConfigs.politicalTheory}
                                value={employee.politicalTheoryId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'politicalTheoryId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trường đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingInstitution.api}
                                config={categoryConfigs.trainingInstitution}
                                value={employee.trainingInstitutionId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'trainingInstitutionId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngành đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingMajor.api}
                                config={categoryConfigs.trainingMajor}
                                value={employee.trainingMajorId}
                                onChange={(v) => handleFieldChange(employee.tempId, 'trainingMajorId', String(v))}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hình thức đào tạo</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.trainingType.api}
                                config={categoryConfigs.trainingType}
                                value={employee.trainingTypeId}
                                onChange={(v) =>
                                    handleFieldChange(employee.tempId, 'trainingTypeId', String(v))
                                }
                            />
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="other" className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                        {/* BHXH */}
                        <div className="space-y-1">
                            <Label className="text-xs">Số sổ BHXH</Label>
                            <Input
                                value={employee.socialInsuranceNumber}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'socialInsuranceNumber', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Ngày tham gia BHXH</Label>
                            <Input
                                type="date"
                                value={employee.socialInsuranceStartDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'socialInsuranceStartDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Công việc BHXH</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.socialInsuranceJob.api}
                                config={categoryConfigs.socialInsuranceJob}
                                value={employee.socialInsuranceJobId}
                                onChange={(v) =>
                                    handleFieldChange(employee.tempId, 'socialInsuranceJobId', String(v))
                                }
                            />
                        </div>

                        {/* Đảng */}
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào Đảng</Label>
                            <Input
                                type="date"
                                value={employee.partyJoinDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'partyJoinDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Ngày chính thức Đảng</Label>
                            <Input
                                type="date"
                                value={employee.partyOfficialDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'partyOfficialDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        {/* Đoàn */}
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào Đoàn</Label>
                            <Input
                                type="date"
                                value={employee.youthUnionJoinDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'youthUnionJoinDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        {/* Quân đội */}
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày nhập ngũ</Label>
                            <Input
                                type="date"
                                value={employee.militaryJoinDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'militaryJoinDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Ngày xuất ngũ</Label>
                            <Input
                                type="date"
                                value={employee.militaryEndDate}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'militaryEndDate', e.target.value)
                                }
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Quân hàm</Label>
                            <GenericSearchSelect
                                api={categoryConfigs.militaryRank.api}
                                config={categoryConfigs.militaryRank}
                                value={employee.militaryRankId}
                                onChange={(v) =>
                                    handleFieldChange(employee.tempId, 'militaryRankId', String(v))
                                }
                            />
                        </div>

                        {/* Ghi chú */}
                        <div className="space-y-1 col-span-3">
                            <Label className="text-xs">Ghi chú</Label>
                            <Textarea
                                value={employee.note}
                                onChange={(e) =>
                                    handleFieldChange(employee.tempId, 'note', e.target.value)
                                }
                                className="text-sm"
                                rows={3}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );

    const ColumnSelector = () => {
        const groupedColumns = allColumns.optional.reduce((acc, col) => {
            if (!acc[col.group]) acc[col.group] = [];
            acc[col.group].push(col);
            return acc;
        }, {} as Record<string, typeof allColumns.optional>);

        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <ChevronDown className="h-4 w-4" />
                        Tùy chỉnh cột ({visibleColumns.size}/{allColumns.required.length + allColumns.optional.length})
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-[400px] overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Cột bắt buộc</h4>
                            <div className="space-y-2">
                                {allColumns.required.map(col => (
                                    <div key={col.key} className="flex items-center gap-2 opacity-50">
                                        <Checkbox checked disabled />
                                        <Label className="text-sm cursor-not-allowed">{col.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {Object.entries(groupedColumns).map(([group, cols]) => (
                            <div key={group}>
                                <h4 className="font-semibold text-sm mb-2">{group}</h4>
                                <div className="space-y-2">
                                    {cols.map(col => (
                                        <div key={col.key} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={visibleColumns.has(col.key)}
                                                onCheckedChange={() => toggleColumn(col.key)}
                                            />
                                            <Label className="text-sm cursor-pointer" onClick={() => toggleColumn(col.key)}>
                                                {col.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Thêm nhân viên
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều nhân viên và lưu một lần
                    </DialogDescription>
                </DialogHeader>

                {/* BODY */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Tải lên
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'table' ? 'expanded' : 'table')}
                                className="gap-2"
                            >
                                {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
                            </Button>

                            {viewMode === 'table' && <ColumnSelector />}

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleAddEmployee}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm nhân viên
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{employees.length}</b> nhân viên
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-6 py-4">
                        {employees.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có nhân viên nào. Nhấn <b>Thêm nhân viên</b> để bắt đầu.
                            </div>
                        ) : viewMode === 'table' ? (
                            // TABLE VIEW
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-12 sticky left-12 bg-background z-10">
                                                Xóa
                                            </TableHead>
                                            {allColumns.required.map(col => (
                                                <TableHead key={col.key} className="whitespace-nowrap">
                                                    {col.label}
                                                </TableHead>
                                            ))}
                                            {allColumns.optional
                                                .filter(col => visibleColumns.has(col.key))
                                                .map(col => (
                                                    <TableHead key={col.key} className="whitespace-nowrap">
                                                        {col.label}
                                                    </TableHead>
                                                ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.map((employee, index) => (
                                            <TableRow key={employee.tempId}>
                                                <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                    <span className="font-medium">{index + 1}</span>
                                                </TableCell>
                                                <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveEmployee(employee.tempId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                {allColumns.required.map(col => (
                                                    <TableCell key={col.key}>
                                                        {renderTableCell(employee, col.key)}
                                                    </TableCell>
                                                ))}
                                                {allColumns.optional
                                                    .filter(col => visibleColumns.has(col.key))
                                                    .map(col => (
                                                        <TableCell key={col.key}>
                                                            {renderTableCell(employee, col.key)}
                                                        </TableCell>
                                                    ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            // EXPANDED VIEW
                            <div className="space-y-4">
                                {employees.map((employee, index) => renderEmployeeFieldsExpanded(employee, index))}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <DialogFooter className="px-6 py-4 border-t">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={createMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || employees.length === 0}
                            >
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {createMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả'}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

