import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp } from 'lucide-react';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { ChevronDown, Maximize2, Minimize2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedEmployeeIds?: number[];
}

export default function BulkEditEmployeeModal({
    isOpen,
    onClose,
    preSelectedEmployeeIds = []
}: BulkEditEmployeeModalProps) {
    const queryClient = useQueryClient();
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const toggleRowExpansion = (employeeId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(employeeId)) {
                newSet.delete(employeeId);
            } else {
                newSet.add(employeeId);
            }
            return newSet;
        });
    };

    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
        'code', 'fullName', 'birthDate', 'startDate', 'departmentId', 'positionId',
        'gender', 'contactAddress', 'laborContractTypeId'
    ]));

    // Định nghĩa tất cả các cột
    const allColumns = {
        required: [
            { key: 'code', label: 'Mã nhân viên *' },
            { key: 'fullName', label: 'Tên nhân viên *' },
            { key: 'birthDate', label: 'Ngày sinh *' },
            { key: 'startDate', label: 'Ngày vào làm *' },
            { key: 'departmentId', label: 'Phòng ban *' },
            { key: 'positionId', label: 'Chức vụ *' },
        ],
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

    useEffect(() => {
        const loadPreSelectedEmployees = async () => {
            if (!isOpen || preSelectedEmployeeIds.length === 0) return;

            try {
                // Load tất cả nhân viên đã chọn
                const promises = preSelectedEmployeeIds.map(id =>
                    employeeApi.getById(id).then(response => response.data || response)
                );

                const employeesData = await Promise.all(promises);

                // Map data giống như handleAddEmployee
                const mappedEmployees = employeesData.map(employeeData => ({
                    id: employeeData.id,
                    code: employeeData.code || '',
                    fullName: employeeData.name || '',
                    birthDate: employeeData.birthday || '',
                    birthPlace: employeeData.birthPlace || '',
                    startDate: employeeData.startDate || '',
                    endDate: employeeData.endDate || '',
                    gender: employeeData.gender || 'NAM',
                    status: employeeData.status || 'Đang làm việc',
                    cccdNumber: employeeData.cccdNumber || '',
                    cccdDate: employeeData.cccdDate || '',
                    cccdPlace: employeeData.cccdPlace || '',
                    contactAddress: employeeData.contactAddress || '',
                    nativePlace: employeeData.nativePlace || '',
                    homeTown: employeeData.homeTown || '',
                    permanentAddress: employeeData.permanentAddress || '',
                    departmentId: employeeData.departmentId?.toString() || '',
                    positionId: employeeData.positionId?.toString() || '',
                    laborContractTypeId: employeeData.laborContractTypeId?.toString() || '',
                    currentJobDetail: employeeData.currentJobDetail || '',
                    title: employeeData.title || '',
                    cardNumber: employeeData.cardNumber || '',
                    documentReturnDate: employeeData.documentReturnDate || '',
                    isWoundedSoldier: employeeData.isWoundedSoldier || false,
                    ethnicity: employeeData.ethnicity || '',
                    religion: employeeData.religion || '',
                    nationalityId: employeeData.nationalityId?.toString() || '',
                    policyFamilyId: employeeData.policyFamilyId?.toString() || '',
                    wardId: employeeData.wardId?.toString() || '',
                    provinceCityId: employeeData.provinceCityId?.toString() || '',
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
                    socialInsuranceNumber: employeeData.socialInsuranceNumber || '',
                    socialInsuranceStartDate: employeeData.socialInsuranceStartDate || '',
                    socialInsuranceJobId: employeeData.socialInsuranceJobId?.toString() || '',
                    partyJoinDate: employeeData.partyJoinDate || '',
                    partyOfficialDate: employeeData.partyOfficialDate || '',
                    youthUnionJoinDate: employeeData.youthUnionJoinDate || '',
                    militaryJoinDate: employeeData.militaryJoinDate || '',
                    militaryEndDate: employeeData.militaryEndDate || '',
                    militaryRankId: employeeData.militaryRankId?.toString() || '',
                    note: employeeData.note || '',
                    userId: employeeData.userId || null,
                }));

                setSelectedEmployees(mappedEmployees);
            } catch (error) {
                console.error('Error loading pre-selected employees:', error);
                toast({
                    title: 'Lỗi',
                    description: 'Không thể tải thông tin nhân viên',
                    variant: 'destructive',
                });
            }
        };

        loadPreSelectedEmployees();
    }, [isOpen, preSelectedEmployeeIds]);

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
                cccdPlace: employeeData.cccdPlace || '',

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

            ...(emp.userId && {
                user: { id: emp.userId }
            }),
        }));

        updateMutation.mutate(payload);
    };

    const handleClose = () => {
        setSelectedEmployees([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredEmployees = allEmployees.filter(emp =>
        emp.fullName?.toLowerCase().includes(searchValue.toLowerCase()) ||
        emp.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (employee, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'fullName':
            case 'birthPlace':
            case 'religion':
            case 'ethnicity':
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
                        onChange={(e) => handleFieldChange(employee.id, field, e.target.value)}
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
                        onChange={(e) => handleFieldChange(employee.id, field, e.target.value)}
                        className={commonInputClass}
                    />
                );

            case 'gender':
                return (
                    <Select
                        value={employee.gender}
                        onValueChange={(value) => handleFieldChange(employee.id, 'gender', value)}
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
                            onCheckedChange={(checked) => handleFieldChange(employee.id, 'isWoundedSoldier', checked)}
                        />
                    </div>
                );

            case 'note':
                return (
                    <Textarea
                        value={employee.note}
                        onChange={(e) => handleFieldChange(employee.id, 'note', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                    />
                );

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
                            onChange={(v) => handleFieldChange(employee.id, field, String(v))}
                        />
                    </div>
                );

            default:
                return <div className="text-xs text-muted-foreground">-</div>;
        }
    };

    const renderEmployeeFieldsExpanded = (employee, index) => (
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
                            <Label className="text-xs">Mã nhân viên *</Label>
                            <Input
                                value={employee.code}
                                onChange={(e) => handleFieldChange(employee.id, 'code', e.target.value)}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tên nhân viên *</Label>
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
                                value={employee.cccdPlace}
                                onChange={(e) => handleFieldChange(employee.id, 'cccdPlace', e.target.value)}
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
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn nhân viên để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* Search Bar - giữ nguyên như cũ */}
                    {preSelectedEmployeeIds.length === 0 && (
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <div className="flex gap-2">
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
                                <Button className="shrink-0 whitespace-nowrap">
                                    Import Excel
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Toolbar - chỉ hiển thị khi có nhân viên được chọn */}
                    {selectedEmployees.length > 0 && (
                        <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
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
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Đã chọn: <b>{selectedEmployees.length}</b> nhân viên
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedEmployees.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có nhân viên nào được chọn</p>
                            </div>
                        ) : viewMode === 'table' ? (
                            // TABLE VIEW
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-24 text-center sticky left-12 bg-background z-10">
                                                Thao tác
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
                                        {selectedEmployees.map((employee, index) => (
                                            <>
                                                <TableRow key={employee.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(employee.id)}
                                                                title={expandedRows.has(employee.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(employee.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveEmployee(employee.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
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
                                                {expandedRows.has(employee.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={2 + allColumns.required.length + allColumns.optional.filter(col => visibleColumns.has(col.key)).length}>
                                                            {renderEmployeeFieldsExpanded(employee, index)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            // EXPANDED VIEW
                            <div className="space-y-4">
                                {selectedEmployees.map((employee, index) => renderEmployeeFieldsExpanded(employee, index))}
                            </div>
                        )}
                    </div>
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
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedEmployees.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}