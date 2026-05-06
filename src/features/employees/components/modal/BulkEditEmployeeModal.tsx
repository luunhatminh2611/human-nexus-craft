import { useState, useEffect, useRef } from 'react';
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
import { employeeApi } from '../../api/employeeApi';
import { toast } from '@/shared/components/ui/use-toast';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp } from 'lucide-react';
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { ChevronDown, Maximize2, Minimize2, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import ExcelJS from 'exceljs'; // Thêm import
import { saveAs } from 'file-saver';

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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const mapEmployeeToSelected = (employeeData: any) => ({
        id: employeeData.id,
        code: employeeData.code || '',
        fullName: employeeData.name || '',
        birthDate: employeeData.birthday || '',
        birthPlace: employeeData.birthPlace || '',
        startDate: employeeData.startDate || '',
        endDate: employeeData.endDate || '',
        gender: employeeData.gender || 'NAM',
        status: employeeData.status || 'Đang công tác',

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
        religionId: employeeData.religionId?.toString() || '',
        nationalityId: employeeData.nationalityId?.toString() || '',
        policyFamilyId: employeeData.policyFamilyId?.toString() || '',

        // Địa chỉ hành chính
        wardId: employeeData.wardId?.toString() || '',
        provinceCityId: employeeData.provinceCityId?.toString() || '',

        // Đào tạo / trình độ
        specialtyId: employeeData.specialtyId?.toString() || '',
        educationLevelId: employeeData.educationLevelId?.toString() || '',
        educationDetail: employeeData.educationDetail || '',
        politicalTheoryId: employeeData.politicalTheoryId?.toString() || '',
        languageLevelId: employeeData.languageLevelId?.toString() || '',
        languageId: employeeData.languageId?.toString() || '',
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
        socialInsurancePlace: employeeData.socialInsurancePlace || '',
        socialInsurancePayrollId: employeeData.socialInsurancePayrollId?.toString() || '',
        socialInsuranceSalaryScaleId: employeeData.socialInsuranceSalaryScaleId?.toString() || '',
        socialInsuranceSalaryCoefficient: employeeData.socialInsuranceSalaryCoefficient || '',
        socialInsuranceSalaryAmount: employeeData.socialInsuranceSalaryAmount || '',
        socialInsuranceJobTitleId: employeeData.socialInsuranceJobTitleId?.toString() || '',
        unionSalary: employeeData.unionSalary || '',

        // Đảng, Đoàn, Quân đội
        partyJoinDate: employeeData.partyJoinDate || '',
        partyOfficialDate: employeeData.partyOfficialDate || '',
        youthUnionJoinDate: employeeData.youthUnionJoinDate || '',
        militaryJoinDate: employeeData.militaryJoinDate || '',
        militaryEndDate: employeeData.militaryEndDate || '',
        militaryRankId: employeeData.militaryRankId?.toString() || '',
        injuryRank: employeeData.injuryRank || '',

        // Ghi chú
        note: employeeData.note || '',

        // Bổ sung thông tin khác
        companyId: employeeData.companyId?.toString() || '',
        otherName: employeeData.otherName || '',
        partyCommitteeId: employeeData.partyCommitteeId?.toString() || '',
        subPartyCommitteeId: employeeData.subPartyCommitteeId?.toString() || '',
        positionAllowance: employeeData.positionAllowance || '',
        taxCode: employeeData.taxCode || '',
        subPositionId: employeeData.subPositionId?.toString() || '',
        jobTitleId: employeeData.jobTitleId?.toString() || '',
        jobPositionId: employeeData.jobPositionId?.toString() || '',
        organizationId: employeeData.organizationId?.toString() || '',
        organizationAddress: employeeData.organizationAddress || '',
        healthStatus: employeeData.healthStatus || '',
        height: employeeData.height || '',
        weight: employeeData.weight || '',
        bloodType: employeeData.bloodType || '',
        familyIncome: employeeData.familyIncome || '',
        otherIncome: employeeData.otherIncome || '',
        housingType: employeeData.housingType || '',
        housingArea: employeeData.housingArea || '',
        selfHousingType: employeeData.selfHousingType || '',
        usableArea: employeeData.usableArea || '',
        grantedLandArea: employeeData.grantedLandArea || '',
        purchasedLandArea: employeeData.purchasedLandArea || '',
        otherLand: employeeData.otherLand || '',
        bankAccountNumber: employeeData.bankAccountNumber || '',
        bankName: employeeData.bankName || '',
        bankAccountHolder: employeeData.bankAccountHolder || '',
        bankBranch: employeeData.bankBranch || '',
        previousJob: employeeData.previousJob || '',
        recruitmentDate: employeeData.recruitmentDate || '',
        workStrength: employeeData.workStrength || '',
        longestJob: employeeData.longestJob || '',
        salaryPayrollId: employeeData.salaryPayrollId?.toString() || '',
        salaryScaleId: employeeData.salaryScaleId?.toString() || '',
        salaryCoefficient: employeeData.salaryCoefficient || '',
        salaryAmount: employeeData.salaryAmount || '',
        salaryEffectiveDate: employeeData.salaryEffectiveDate || '',
        legalHistory: employeeData.legalHistory || '',
        workedInOldRegime: employeeData.workedInOldRegime || '',
        foreignOrganizationRelation: employeeData.foreignOrganizationRelation || '',
        relativesAbroad: employeeData.relativesAbroad || '',
        userId: employeeData.userId || null,
    });

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
            { key: 'companyId', label: 'Công ty', group: 'Thông tin định danh' },
            { key: 'gender', label: 'Giới tính', group: 'Thông tin định danh' },
            { key: 'otherName', label: 'Tên gọi khác', group: 'Thông tin định danh' },
            { key: 'birthPlace', label: 'Nơi sinh', group: 'Thông tin định danh' },
            { key: 'status', label: 'Trạng thái', group: 'Thông tin định danh' },

            { key: 'partyCommitteeId', label: 'Cấp ủy hiện tại', group: 'Cấp ủy' },
            { key: 'subPartyCommitteeId', label: 'Cấp ủy kiêm', group: 'Cấp ủy' },

            { key: 'positionAllowance', label: 'Phụ cấp chức vụ', group: 'Chức vụ & Chức danh' },
            { key: 'taxCode', label: 'Mã số thuế', group: 'Chức vụ & Chức danh' },
            { key: 'subPositionId', label: 'Chức vụ kiêm', group: 'Chức vụ & Chức danh' },
            { key: 'jobTitleId', label: 'Chức danh', group: 'Chức vụ & Chức danh' },
            { key: 'jobPositionId', label: 'Vị trí công việc', group: 'Chức vụ & Chức danh' },

            { key: 'contactAddress', label: 'Nơi ở hiện nay', group: 'Địa chỉ' },
            { key: 'provinceCityId', label: 'Tỉnh/TP', group: 'Địa chỉ' },
            { key: 'wardId', label: 'Phường/Xã', group: 'Địa chỉ' },
            { key: 'permanentAddress', label: 'Thường trú', group: 'Địa chỉ' },
            { key: 'nativePlace', label: 'Nguyên quán', group: 'Địa chỉ' },
            { key: 'homeTown', label: 'Quê quán', group: 'Địa chỉ' },
            { key: 'organizationId', label: 'Cơ quan tuyển dụng', group: 'Địa chỉ' },
            { key: 'organizationAddress', label: 'Địa chỉ cơ quan', group: 'Địa chỉ' },

            { key: 'ethnicity', label: 'Dân tộc', group: 'Thông tin cá nhân' },
            { key: 'religionId', label: 'Tôn giáo', group: 'Thông tin cá nhân' },
            { key: 'nationalityId', label: 'Quốc tịch', group: 'Thông tin cá nhân' },
            { key: 'policyFamilyId', label: 'Gia đình CS', group: 'Thông tin cá nhân' },

            { key: 'youthUnionJoinDate', label: 'Ngày vào Đoàn', group: 'Tổ chức chính trị' },
            { key: 'partyJoinDate', label: 'Ngày vào Đảng', group: 'Tổ chức chính trị' },
            { key: 'partyOfficialDate', label: 'Ngày chính thức Đảng', group: 'Tổ chức chính trị' },

            { key: 'militaryJoinDate', label: 'Ngày nhập ngũ', group: 'Quân sự & Danh hiệu' },
            { key: 'militaryEndDate', label: 'Ngày xuất ngũ', group: 'Quân sự & Danh hiệu' },
            { key: 'title', label: 'Danh hiệu', group: 'Quân sự & Danh hiệu' },
            { key: 'militaryRankId', label: 'Danh hiệu', group: 'Quân sự & Danh hiệu' },
            { key: 'injuryRank', label: 'Hạng thương binh', group: 'Quân sự & Danh hiệu' },
            { key: 'isWoundedSoldier', label: 'Thương binh', group: 'Quân sự & Danh hiệu' },

            { key: 'healthStatus', label: 'Tình trạng sức khỏe', group: 'Sức khỏe' },
            { key: 'height', label: 'Chiều cao', group: 'Sức khỏe' },
            { key: 'weight', label: 'Cân nặng', group: 'Sức khỏe' },
            { key: 'bloodType', label: 'Nhóm máu', group: 'Sức khỏe' },

            { key: 'cccdNumber', label: 'Số CCCD', group: 'CCCD' },
            { key: 'cccdDate', label: 'Ngày cấp', group: 'CCCD' },
            { key: 'cccdPlace', label: 'Nơi cấp', group: 'CCCD' },

            { key: 'familyIncome', label: 'Thu nhập gia đình', group: 'Thu nhập' },
            { key: 'otherIncome', label: 'Thu nhập khác', group: 'Thu nhập' },

            { key: 'housingType', label: 'Loại nhà', group: 'Nhà ở' },
            { key: 'housingArea', label: 'Diện tích nhà', group: 'Nhà ở' },
            { key: 'selfHousingType', label: 'Nhà tự mua', group: 'Nhà ở' },
            { key: 'usableArea', label: 'Diện tích sử dụng', group: 'Nhà ở' },

            { key: 'grantedLandArea', label: 'Đất được cấp', group: 'Đất đai' },
            { key: 'purchasedLandArea', label: 'Đất mua', group: 'Đất đai' },
            { key: 'otherLand', label: 'Đất khác', group: 'Đất đai' },

            { key: 'bankAccountNumber', label: 'Số tài khoản', group: 'Tài khoản ngân hàng' },
            { key: 'bankName', label: 'Ngân hàng', group: 'Tài khoản ngân hàng' },
            { key: 'bankAccountHolder', label: 'Chủ tài khoản', group: 'Tài khoản ngân hàng' },
            { key: 'bankBranch', label: 'Chi nhánh', group: 'Tài khoản ngân hàng' },

            { key: 'previousJob', label: 'Nghề trước', group: 'Tuyển dụng' },
            { key: 'recruitmentDate', label: 'Ngày tuyển dụng', group: 'Tuyển dụng' },

            { key: 'educationDetail', label: 'Trình độ cụ thể', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'educationLevelId', label: 'Bằng cấp', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'languageId', label: 'Ngoại ngữ', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'languageLevelId', label: 'Trình độ NN', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'culturalLevelId', label: 'Văn hóa', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'professionalLevelId', label: 'Chuyên môn', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'specialtyId', label: 'Nghề nghiệp', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'trainingInstitutionId', label: 'Trường đào tạo', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'trainingMajorId', label: 'Ngành đào tạo', group: 'Trình độ học vấn & chuyên môn' },
            { key: 'trainingTypeId', label: 'Hình thức đào tạo', group: 'Trình độ học vấn & chuyên môn' },

            { key: 'currentJobDetail', label: 'Công việc hiện tại', group: 'Chi tiết công việc' },
            { key: 'workStrength', label: 'Sở trường', group: 'Chi tiết công việc' },
            { key: 'longestJob', label: 'Công việc lâu nhất', group: 'Chi tiết công việc' },

            { key: 'salaryPayrollId', label: 'Bảng lương', group: 'Lương' },
            { key: 'salaryScaleId', label: 'Thang lương', group: 'Lương' },
            { key: 'salaryCoefficient', label: 'Hệ số', group: 'Lương' },
            { key: 'salaryAmount', label: 'Mức lương', group: 'Lương' },
            { key: 'salaryEffectiveDate', label: 'Ngày áp dụng', group: 'Lương' },

            { key: 'socialInsurancePayrollId', label: 'Bảng lương BHXH', group: 'BHXH' },
            { key: 'socialInsuranceSalaryScaleId', label: 'Thang BHXH', group: 'BHXH' },
            { key: 'socialInsuranceSalaryCoefficient', label: 'Hệ số BHXH', group: 'BHXH' },
            { key: 'socialInsuranceSalaryAmount', label: 'Lương BHXH', group: 'BHXH' },
            { key: 'socialInsurancePlace', label: 'Nơi đóng', group: 'BHXH' },
            { key: 'socialInsuranceNumber', label: 'Số BHXH', group: 'BHXH' },
            { key: 'unionSalary', label: 'Lương công đoàn', group: 'BHXH' },
            { key: 'socialInsuranceJobTitleId', label: 'Chức danh BHXH', group: 'BHXH' },

            { key: 'legalHistory', label: 'Lịch sử pháp lý', group: 'Lịch sử bản thân' },
            { key: 'workedInOldRegime', label: 'Chế độ cũ', group: 'Lịch sử bản thân' },
            { key: 'foreignOrganizationRelation', label: 'Quan hệ nước ngoài', group: 'Lịch sử bản thân' },
            { key: 'relativesAbroad', label: 'Thân nhân nước ngoài', group: 'Lịch sử bản thân' },

            { key: 'note', label: 'Ghi chú', group: 'Ghi chú' },
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
                console.log("data", employeesData)
                const mappedEmployees = employeesData.map(mapEmployeeToSelected);
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
            setSelectedEmployees(prev => [...prev, mapEmployeeToSelected(employeeData)]);

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

    function getColumnLetter(colNumber: number) {
        let letter = '';
        while (colNumber > 0) {
            const mod = (colNumber - 1) % 26;
            letter = String.fromCharCode(65 + mod) + letter;
            colNumber = Math.floor((colNumber - mod) / 26);
        }
        return letter;
    }

    // ✅ Thêm function Export Excel
    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Nhân viên');
            const dropdownSheet = workbook.addWorksheet('Danh mục');

            dropdownSheet.state = 'hidden';

            // Định nghĩa các cột
            const columns = [
                { header: 'Mã nhân viên *', key: 'code', width: 15 },
                { header: 'Tên nhân viên *', key: 'fullName', width: 25 },
                { header: 'Ngày sinh *', key: 'birthDate', width: 15 },
                { header: 'Giới tính', key: 'gender', width: 10 },
                { header: 'Nơi sinh', key: 'birthPlace', width: 20 },
                { header: 'Dân tộc', key: 'ethnicity', width: 15 },
                { header: 'Quốc tịch', key: 'nationality', width: 15 },
                { header: 'Tôn giáo', key: 'religion', width: 15 },
                { header: 'Gia đình CS', key: 'policyFamily', width: 20 },
                { header: 'Số CCCD', key: 'cccdNumber', width: 15 },
                { header: 'Ngày cấp CCCD', key: 'cccdDate', width: 15 },
                { header: 'Nơi cấp CCCD', key: 'cccdPlace', width: 20 },
                { header: 'Tỉnh/TP', key: 'provinceCity', width: 20 },
                { header: 'Phường/Xã', key: 'ward', width: 20 },
                { header: 'Địa chỉ liên hệ', key: 'contactAddress', width: 30 },
                { header: 'Hộ khẩu TT', key: 'permanentAddress', width: 30 },
                { header: 'Nguyên quán', key: 'nativePlace', width: 20 },
                { header: 'Quê quán', key: 'homeTown', width: 20 },
                { header: 'Ngày vào làm *', key: 'startDate', width: 15 },
                { header: 'Ngày kết thúc', key: 'endDate', width: 15 },
                { header: 'Phòng ban *', key: 'department', width: 25 },
                { header: 'Chức vụ *', key: 'position', width: 20 },
                { header: 'Loại HĐ lao động', key: 'laborContractType', width: 20 },
                { header: 'Công việc cụ thể', key: 'currentJobDetail', width: 30 },
                { header: 'Danh hiệu', key: 'title', width: 20 },
                { header: 'Số thẻ từ', key: 'cardNumber', width: 15 },
                { header: 'Ngày trả hồ sơ', key: 'documentReturnDate', width: 15 },
                { header: 'Thương binh', key: 'isWoundedSoldier', width: 12 },
                { header: 'Bậc học', key: 'educationLevel', width: 20 },
                { header: 'Trình độ cụ thể', key: 'educationDetail', width: 30 },
                { header: 'Trình độ VH', key: 'culturalLevel', width: 20 },
                { header: 'Trình độ CM', key: 'professionalLevel', width: 20 },
                { header: 'Nghề nghiệp', key: 'specialty', width: 20 },
                { header: 'Trình độ TH', key: 'itLevel', width: 20 },
                { header: 'Trình độ NN', key: 'languageLevel', width: 20 },
                { header: 'Lý luận CT', key: 'politicalTheory', width: 20 },
                { header: 'Trường ĐT', key: 'trainingInstitution', width: 30 },
                { header: 'Ngành ĐT', key: 'trainingMajor', width: 25 },
                { header: 'Hình thức ĐT', key: 'trainingType', width: 20 },
                { header: 'Số sổ BHXH', key: 'socialInsuranceNumber', width: 15 },
                { header: 'Ngày tham gia BHXH', key: 'socialInsuranceStartDate', width: 18 },
                { header: 'Nghề BHXH', key: 'socialInsuranceJob', width: 20 },
                { header: 'Ngày vào Đảng', key: 'partyJoinDate', width: 15 },
                { header: 'Ngày chính thức', key: 'partyOfficialDate', width: 15 },
                { header: 'Ngày vào Đoàn', key: 'youthUnionJoinDate', width: 15 },
                { header: 'Ngày nhập ngũ', key: 'militaryJoinDate', width: 15 },
                { header: 'Ngày xuất ngũ', key: 'militaryEndDate', width: 15 },
                { header: 'Quân hàm', key: 'militaryRank', width: 15 },
                { header: 'Ghi chú', key: 'note', width: 40 },
            ];

            mainSheet.columns = columns;

            // Lấy danh mục
            const [
                departments,
                positions,
                laborContractTypes,
                nationalities,
                ethnicities,
                policyFamilies,
                provinceCities,
                wards,
                degrees,
                culturalLevels,
                professionalLevels,
                specialties,
                itLevels,
                languageLevels,
                politicalTheories,
                trainingInstitutions,
                trainingMajors,
                trainingTypes,
                socialInsuranceJobs,
                militaryRanks,
            ] = await Promise.all([
                categoryConfigs.department.api.getAll(),
                categoryConfigs.jobTitle.api.getAll(),
                categoryConfigs.laborContractType.api.getAll(),
                categoryConfigs.nationality.api.getAll(),
                categoryConfigs.ethnicity.api.getAll(),
                categoryConfigs.policyFamily.api.getAll(),
                categoryConfigs.provinceCity.api.getAll(),
                categoryConfigs.ward.api.getAll(),
                categoryConfigs.degree.api.getAll(),
                categoryConfigs.culturalLevel.api.getAll(),
                categoryConfigs.professionalLevel.api.getAll(),
                categoryConfigs.specialty.api.getAll(),
                categoryConfigs.itLevel.api.getAll(),
                categoryConfigs.languageLevel.api.getAll(),
                categoryConfigs.politicalTheory.api.getAll(),
                categoryConfigs.trainingInstitution.api.getAll(),
                categoryConfigs.trainingMajor.api.getAll(),
                categoryConfigs.trainingType.api.getAll(),
                categoryConfigs.socialInsuranceJob.api.getAll(),
                categoryConfigs.militaryRank.api.getAll(),
            ]);

            // Helper: Tìm tên từ ID
            const findNameById = (list: any[], id: string) => {
                if (!id) return '';
                const found = list?.find(item => item.id === Number(id));
                return found?.name || '';
            };

            // Helper: Ghi dropdown
            let colIndex = 1;
            const dropdownRanges = {};
            const writeDropdown = (data: any[], key: string) => {
                if (data && data.length > 0) {
                    dropdownSheet.getCell(1, colIndex).value = key;
                    data.forEach((item, idx) => {
                        dropdownSheet.getCell(idx + 2, colIndex).value = item.name || item;
                    });
                    dropdownRanges[key] = `'Danh mục'!$${getColumnLetter(colIndex)}$2:$${getColumnLetter(colIndex)}$${data.length + 1}`;
                    colIndex++;
                }
            };

            // Ghi danh mục
            writeDropdown(['Nam', 'Nữ', 'Khác'], 'gender');
            writeDropdown(departments, 'department');
            writeDropdown(positions, 'position');
            writeDropdown(laborContractTypes, 'laborContractType');
            writeDropdown(nationalities, 'nationality');
            writeDropdown(ethnicities, 'ethnicity');
            writeDropdown(policyFamilies, 'policyFamily');
            writeDropdown(provinceCities, 'provinceCity');
            writeDropdown(wards, 'ward');
            writeDropdown(degrees, 'educationLevel');
            writeDropdown(culturalLevels, 'culturalLevel');
            writeDropdown(professionalLevels, 'professionalLevel');
            writeDropdown(specialties, 'specialty');
            writeDropdown(itLevels, 'itLevel');
            writeDropdown(languageLevels, 'languageLevel');
            writeDropdown(politicalTheories, 'politicalTheory');
            writeDropdown(trainingInstitutions, 'trainingInstitution');
            writeDropdown(trainingMajors, 'trainingMajor');
            writeDropdown(trainingTypes, 'trainingType');
            writeDropdown(socialInsuranceJobs, 'socialInsuranceJob');
            writeDropdown(militaryRanks, 'militaryRank');
            writeDropdown(['Có', 'Không'], 'isWoundedSoldier');


            // Ghi dữ liệu nhân viên
            selectedEmployees.forEach(emp => {
                // ✅ Helper: Convert string yyyy-mm-dd sang Date object
                const parseDate = (dateStr: string) => {
                    if (!dateStr) return null;
                    // Parse yyyy-mm-dd thành Date
                    const parts = dateStr.split('-');
                    if (parts.length === 3) {
                        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                    }
                    return null;
                };

                const rowData = mainSheet.addRow({
                    code: emp.code,
                    fullName: emp.fullName,
                    birthDate: parseDate(emp.birthDate), // ✅ Convert sang Date
                    gender: emp.gender,
                    birthPlace: emp.birthPlace,
                    ethnicity: emp.ethnicity,
                    nationality: findNameById(nationalities, emp.nationalityId),
                    religion: emp.religion,
                    policyFamily: findNameById(policyFamilies, emp.policyFamilyId),
                    cccdNumber: emp.cccdNumber,
                    cccdDate: parseDate(emp.cccdDate), // ✅
                    cccdPlace: emp.cccdPlace,
                    provinceCity: findNameById(provinceCities, emp.provinceCityId),
                    ward: findNameById(wards, emp.wardId),
                    contactAddress: emp.contactAddress,
                    permanentAddress: emp.permanentAddress,
                    nativePlace: emp.nativePlace,
                    homeTown: emp.homeTown,
                    startDate: parseDate(emp.startDate), // ✅
                    endDate: parseDate(emp.endDate), // ✅
                    department: findNameById(departments, emp.departmentId),
                    position: findNameById(positions, emp.positionId),
                    laborContractType: findNameById(laborContractTypes, emp.laborContractTypeId),
                    currentJobDetail: emp.currentJobDetail,
                    title: emp.title,
                    cardNumber: emp.cardNumber,
                    documentReturnDate: parseDate(emp.documentReturnDate), // ✅
                    isWoundedSoldier: emp.isWoundedSoldier ? 'Có' : 'Không',
                    educationLevel: findNameById(degrees, emp.educationLevelId),
                    educationDetail: emp.educationDetail,
                    culturalLevel: findNameById(culturalLevels, emp.culturalLevelId),
                    professionalLevel: findNameById(professionalLevels, emp.professionalLevelId),
                    specialty: findNameById(specialties, emp.specialtyId),
                    itLevel: findNameById(itLevels, emp.itLevelId),
                    languageLevel: findNameById(languageLevels, emp.languageLevelId),
                    politicalTheory: findNameById(politicalTheories, emp.politicalTheoryId),
                    trainingInstitution: findNameById(trainingInstitutions, emp.trainingInstitutionId),
                    trainingMajor: findNameById(trainingMajors, emp.trainingMajorId),
                    trainingType: findNameById(trainingTypes, emp.trainingTypeId),
                    socialInsuranceNumber: emp.socialInsuranceNumber,
                    socialInsuranceStartDate: parseDate(emp.socialInsuranceStartDate), // ✅
                    socialInsuranceJob: findNameById(socialInsuranceJobs, emp.socialInsuranceJobId),
                    partyJoinDate: parseDate(emp.partyJoinDate), // ✅
                    partyOfficialDate: parseDate(emp.partyOfficialDate), // ✅
                    youthUnionJoinDate: parseDate(emp.youthUnionJoinDate), // ✅
                    militaryJoinDate: parseDate(emp.militaryJoinDate), // ✅
                    militaryEndDate: parseDate(emp.militaryEndDate), // ✅
                    militaryRank: findNameById(militaryRanks, emp.militaryRankId),
                    note: emp.note,
                });

                // Set format ngày tháng
                const dateColumns = [3, 11, 19, 20, 27, 41, 43, 44, 45, 46, 47];
                dateColumns.forEach(colNum => {
                    const cell = rowData.getCell(colNum);
                    if (cell.value) {
                        cell.numFmt = 'dd/mm/yyyy'; // Format hiển thị
                    }
                });
            });

            // Thêm validation
            const addValidation = (columnKey: string, dropdownKey: string) => {
                const colNumber = columns.findIndex(col => col.key === columnKey) + 1;
                if (colNumber > 0 && dropdownRanges[dropdownKey]) {
                    const maxRow = Math.max(selectedEmployees.length + 1, 100);
                    for (let i = 2; i <= maxRow; i++) {
                        mainSheet.getCell(i, colNumber).dataValidation = {
                            type: 'list',
                            allowBlank: true,
                            formulae: [dropdownRanges[dropdownKey]],
                        };
                    }
                }
            };

            addValidation('gender', 'gender');
            addValidation('department', 'department');
            addValidation('position', 'position');
            addValidation('laborContractType', 'laborContractType');
            addValidation('nationality', 'nationality');
            addValidation('ethnicity', 'ethnicity');
            addValidation('policyFamily', 'policyFamily');
            addValidation('provinceCity', 'provinceCity');
            addValidation('ward', 'ward');
            addValidation('educationLevel', 'educationLevel');
            addValidation('culturalLevel', 'culturalLevel');
            addValidation('professionalLevel', 'professionalLevel');
            addValidation('specialty', 'specialty');
            addValidation('itLevel', 'itLevel');
            addValidation('languageLevel', 'languageLevel');
            addValidation('politicalTheory', 'politicalTheory');
            addValidation('trainingInstitution', 'trainingInstitution');
            addValidation('trainingMajor', 'trainingMajor');
            addValidation('trainingType', 'trainingType');
            addValidation('socialInsuranceJob', 'socialInsuranceJob');
            addValidation('militaryRank', 'militaryRank');
            addValidation('isWoundedSoldier', 'isWoundedSoldier');

            // Style header
            mainSheet.getRow(1).font = { bold: true };
            mainSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            saveAs(blob, `Chinh_sua_nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast({
                title: 'Thành công',
                description: `Đã tải xuống file với ${selectedEmployees.length} nhân viên`
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Lỗi',
                description: 'Không thể tải xuống file',
                variant: 'destructive'
            });
        }
    };

    // ✅ Thêm function Import Excel
    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());

            const worksheet = workbook.getWorksheet('Nhân viên');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Nhân viên"');
            }

            // Lấy danh mục
            const [
                departments,
                positions,
                laborContractTypes,
                nationalities,
                ethnicities,
                policyFamilies,
                provinceCities,
                wards,
                degrees,
                culturalLevels,
                professionalLevels,
                specialties,
                itLevels,
                languageLevels,
                politicalTheories,
                trainingInstitutions,
                trainingMajors,
                trainingTypes,
                socialInsuranceJobs,
                militaryRanks,
            ] = await Promise.all([
                categoryConfigs.department.api.getAll(),
                categoryConfigs.jobTitle.api.getAll(),
                categoryConfigs.laborContractType.api.getAll(),
                categoryConfigs.nationality.api.getAll(),
                categoryConfigs.ethnicity.api.getAll(),
                categoryConfigs.policyFamily.api.getAll(),
                categoryConfigs.provinceCity.api.getAll(),
                categoryConfigs.ward.api.getAll(),
                categoryConfigs.degree.api.getAll(),
                categoryConfigs.culturalLevel.api.getAll(),
                categoryConfigs.professionalLevel.api.getAll(),
                categoryConfigs.specialty.api.getAll(),
                categoryConfigs.itLevel.api.getAll(),
                categoryConfigs.languageLevel.api.getAll(),
                categoryConfigs.politicalTheory.api.getAll(),
                categoryConfigs.trainingInstitution.api.getAll(),
                categoryConfigs.trainingMajor.api.getAll(),
                categoryConfigs.trainingType.api.getAll(),
                categoryConfigs.socialInsuranceJob.api.getAll(),
                categoryConfigs.militaryRank.api.getAll(),
            ]);

            // ✅ Helper: Parse ngày tháng
            const formatDateFromExcel = (value: any) => {
                if (!value) return '';

                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }

                if (typeof value === 'number') {
                    const date = new Date((value - 25569) * 86400 * 1000);
                    return date.toISOString().split('T')[0];
                }

                if (typeof value === 'string') {
                    const trimmed = value.trim();
                    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
                    if (ddmmyyyyMatch) {
                        const [, day, month, year] = ddmmyyyyMatch;
                        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                        return trimmed;
                    }
                }

                return '';
            };

            // Helper: Tìm ID từ tên
            const findIdByName = (list: any[], name: string) => {
                if (!name) return '';
                const found = list?.find(item =>
                    item.name?.toLowerCase().trim() === name?.toLowerCase().trim()
                );
                return found ? String(found.id) : '';
            };

            const importedEmployees: any[] = [];
            const existingCodes = new Map(selectedEmployees.map(emp => [emp.code, emp]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                if (!code) return;

                const employeeData = {
                    id: existingCodes.has(code) ? existingCodes.get(code)!.id : null,
                    code,
                    fullName: getCellValue(2),
                    birthDate: formatDateFromExcel(getCellValue(3)),
                    gender: getCellValue(4)?.toUpperCase() || 'NAM',
                    birthPlace: getCellValue(5),
                    ethnicity: getCellValue(6),
                    nationalityId: findIdByName(nationalities, getCellValue(7)),
                    religion: getCellValue(8),
                    policyFamilyId: findIdByName(policyFamilies, getCellValue(9)),
                    cccdNumber: getCellValue(10),
                    cccdDate: formatDateFromExcel(getCellValue(11)),
                    cccdPlace: getCellValue(12),
                    provinceCityId: findIdByName(provinceCities, getCellValue(13)),
                    wardId: findIdByName(wards, getCellValue(14)),
                    contactAddress: getCellValue(15),
                    permanentAddress: getCellValue(16),
                    nativePlace: getCellValue(17),
                    homeTown: getCellValue(18),
                    startDate: formatDateFromExcel(getCellValue(19)),
                    endDate: formatDateFromExcel(getCellValue(20)),
                    departmentId: findIdByName(departments, getCellValue(21)),
                    positionId: findIdByName(positions, getCellValue(22)),
                    laborContractTypeId: findIdByName(laborContractTypes, getCellValue(23)),
                    currentJobDetail: getCellValue(24),
                    title: getCellValue(25),
                    cardNumber: getCellValue(26),
                    documentReturnDate: formatDateFromExcel(getCellValue(27)),
                    isWoundedSoldier: getCellValue(28) === 'Có',
                    educationLevelId: findIdByName(degrees, getCellValue(29)),
                    educationDetail: getCellValue(30),
                    culturalLevelId: findIdByName(culturalLevels, getCellValue(31)),
                    professionalLevelId: findIdByName(professionalLevels, getCellValue(32)),
                    specialtyId: findIdByName(specialties, getCellValue(33)),
                    itLevelId: findIdByName(itLevels, getCellValue(34)),
                    languageLevelId: findIdByName(languageLevels, getCellValue(35)),
                    politicalTheoryId: findIdByName(politicalTheories, getCellValue(36)),
                    trainingInstitutionId: findIdByName(trainingInstitutions, getCellValue(37)),
                    trainingMajorId: findIdByName(trainingMajors, getCellValue(38)),
                    trainingTypeId: findIdByName(trainingTypes, getCellValue(39)),
                    socialInsuranceNumber: getCellValue(40),
                    socialInsuranceStartDate: formatDateFromExcel(getCellValue(41)),
                    socialInsuranceJobId: findIdByName(socialInsuranceJobs, getCellValue(42)),
                    partyJoinDate: formatDateFromExcel(getCellValue(43)),
                    partyOfficialDate: formatDateFromExcel(getCellValue(44)),
                    youthUnionJoinDate: formatDateFromExcel(getCellValue(45)),
                    militaryJoinDate: formatDateFromExcel(getCellValue(46)),
                    militaryEndDate: formatDateFromExcel(getCellValue(47)),
                    militaryRankId: findIdByName(militaryRanks, getCellValue(48)),
                    note: getCellValue(49),
                    status: 'Đang làm việc',
                };

                importedEmployees.push(employeeData);
            });

            // Merge: Cập nhật nếu có trong danh sách hiện tại
            const updatedEmployees = selectedEmployees.map(emp => {
                const imported = importedEmployees.find(imp => imp.code === emp.code);
                return imported || emp;
            });

            const newEmployees = importedEmployees.filter(
                imp => !existingCodes.has(imp.code)
            );

            setSelectedEmployees([...updatedEmployees, ...newEmployees]);

            toast({
                title: 'Thành công',
                description: `Đã nhập ${importedEmployees.length} nhân viên (${newEmployees.length} mới, ${importedEmployees.length - newEmployees.length} cập nhật)`
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Lỗi',
                description: error.message || 'Không thể đọc file',
                variant: 'destructive'
            });
        } finally {
            e.target.value = '';
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
            ...emp,
            id: Number(emp.id),
            status: emp.status,
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
            company: emp.companyId ? { id: Number(emp.companyId) } : null,
            partyCommittee: emp.partyCommitteeId ? { id: Number(emp.partyCommitteeId) } : null,
            subPartyCommittee: emp.subPartyCommitteeId ? { id: Number(emp.subPartyCommitteeId) } : null,
            subPosition: emp.subPositionId ? { id: Number(emp.subPositionId) } : null,
            jobTitle: emp.jobTitleId ? { id: Number(emp.jobTitleId) } : null,
            jobPosition: emp.jobPositionId ? { id: Number(emp.jobPositionId) } : null,
            organization: emp.organizationId ? { id: Number(emp.organizationId) } : null,
            salaryPayroll: emp.salaryPayrollId ? { id: Number(emp.salaryPayrollId) } : null,
            salaryScale: emp.salaryScaleId ? { id: Number(emp.salaryScaleId) } : null,
            socialInsurancePayroll: emp.socialInsurancePayrollId ? { id: Number(emp.socialInsurancePayrollId) } : null,
            socialInsuranceSalaryScale: emp.socialInsuranceSalaryScaleId ? { id: Number(emp.socialInsuranceSalaryScaleId) } : null,
            socialInsuranceJobTitle: emp.socialInsuranceJobTitleId ? { id: Number(emp.socialInsuranceJobTitleId) } : null,
            religion: emp.religionId ? { id: Number(emp.religionId) } : null,
            language: emp.languageId ? { id: Number(emp.languageId) } : null,
            ...(emp.userId && { user: { id: emp.userId } }),
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
                return (
                    <Input
                        value={employee[field] ?? ''}
                        onChange={(e) => handleFieldChange(employee.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="..."
                    />
                );
        }
    };

    const renderEmployeeFieldsExpanded = (employee, index) => (
        <div key={employee.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between bg-muted/30 pb-2 border-b">
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

            <div className="space-y-6">
                {/* TAB 1: THÔNG TIN CƠ BẢN */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Thông tin cơ bản</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Công ty</Label>
                            <GenericSearchSelect api={categoryConfigs.company.api} config={categoryConfigs.company} value={employee.companyId} onChange={(v) => handleFieldChange(employee.id, 'companyId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Mã nhân viên*</Label>
                            <Input
                                value={employee.code}
                                onChange={(e) => handleFieldChange(employee.id, 'code', e.target.value)}
                                className="h-8 text-sm"
                                placeholder="Nhập mã nhân viên"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tên nhân viên *</Label>
                            <Input value={employee.fullName} onChange={(e) => handleFieldChange(employee.id, 'fullName', e.target.value)} className="h-8 text-sm" placeholder="Nhập tên" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Các tên gọi khác</Label>
                            <Input value={employee.otherName} onChange={(e) => handleFieldChange(employee.id, 'otherName', e.target.value)} className="h-8 text-sm" placeholder="Tên khác" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Giới tính *</Label>
                            <Select value={employee.gender} onValueChange={(v) => handleFieldChange(employee.id, 'gender', v)}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="NAM">Nam</SelectItem>
                                    <SelectItem value="NỮ">Nữ</SelectItem>
                                    <SelectItem value="KHÁC">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày sinh *</Label>
                            <Input type="date" value={employee.birthDate} onChange={(e) => handleFieldChange(employee.id, 'birthDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi sinh</Label>
                            <Input value={employee.birthPlace} onChange={(e) => handleFieldChange(employee.id, 'birthPlace', e.target.value)} className="h-8 text-sm" placeholder="Nhập nơi sinh" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trạng thái</Label>
                            <Select value={{
                                'DANG_CONG_TAC': 'Đang công tác',
                                'NGHI_CHE_DO': 'Nghỉ chế độ',
                                'NGHI_HUU_TRI': 'Nghỉ hưu trí',
                                'NGHI_VIEC': 'Nghỉ việc',
                                'TU_TRAN': 'Từ trần',
                            }[employee.status] ?? employee.status} onValueChange={(v) => handleFieldChange(employee.id, 'status', v)}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Đang công tác">Đang công tác</SelectItem>
                                    <SelectItem value="Nghỉ chế độ">Nghỉ chế độ</SelectItem>
                                    <SelectItem value="Nghỉ hưu trí">Nghỉ hưu trí</SelectItem>
                                    <SelectItem value="Nghỉ việc">Nghỉ việc</SelectItem>
                                    <SelectItem value="Từ trần">Từ trần</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Dân tộc</Label>
                            <GenericSearchSelect api={categoryConfigs.ethnicity.api} config={categoryConfigs.ethnicity} value={employee.ethnicity?.toString()} onChange={(v) => handleFieldChange(employee.id, "ethnicity", String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tôn giáo</Label>
                            <GenericSearchSelect api={categoryConfigs.religion.api} config={categoryConfigs.religion} value={employee.religionId} onChange={(v) => handleFieldChange(employee.id, 'religionId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quốc tịch</Label>
                            <GenericSearchSelect api={categoryConfigs.nationality.api} config={categoryConfigs.nationality} value={employee.nationalityId} onChange={(v) => handleFieldChange(employee.id, 'nationalityId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gia đình chính sách</Label>
                            <GenericSearchSelect api={categoryConfigs.policyFamily.api} config={categoryConfigs.policyFamily} value={employee.policyFamilyId} onChange={(v) => handleFieldChange(employee.id, 'policyFamilyId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số CCCD</Label>
                            <Input value={employee.cccdNumber} onChange={(e) => handleFieldChange(employee.id, 'cccdNumber', e.target.value)} className="h-8 text-sm" placeholder="Nhập số CCCD" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày cấp</Label>
                            <Input type="date" value={employee.cccdDate} onChange={(e) => handleFieldChange(employee.id, 'cccdDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi cấp</Label>
                            <Input value={employee.cccdPlace} onChange={(e) => handleFieldChange(employee.id, 'cccdPlace', e.target.value)} className="h-8 text-sm" placeholder="Nhập nơi cấp" />
                        </div>
                    </div>
                </div>

                {/* TAB 1b: SỨC KHỎE */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Sức khỏe</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Tình trạng sức khỏe</Label>
                            <Input value={employee.healthStatus} onChange={(e) => handleFieldChange(employee.id, 'healthStatus', e.target.value)} className="h-8 text-sm" placeholder="Nhập tình trạng" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chiều cao (cm)</Label>
                            <Input type="number" value={employee.height} onChange={(e) => handleFieldChange(employee.id, 'height', e.target.value)} className="h-8 text-sm" placeholder="cm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Cân nặng (kg)</Label>
                            <Input type="number" value={employee.weight} onChange={(e) => handleFieldChange(employee.id, 'weight', e.target.value)} className="h-8 text-sm" placeholder="kg" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nhóm máu</Label>
                            <Select value={employee.bloodType} onValueChange={(v) => handleFieldChange(employee.id, 'bloodType', v)}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn" /></SelectTrigger>
                                <SelectContent>
                                    {['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* TAB 2: CẤP ỦY */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Cấp ủy</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Cấp ủy hiện tại</Label>
                            <GenericSearchSelect api={categoryConfigs.partyCommittee.api} config={categoryConfigs.partyCommittee} value={employee.partyCommitteeId} onChange={(v) => handleFieldChange(employee.id, 'partyCommitteeId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Cấp ủy kiêm</Label>
                            <GenericSearchSelect api={categoryConfigs.partyCommittee.api} config={categoryConfigs.partyCommittee} value={employee.subPartyCommitteeId} onChange={(v) => handleFieldChange(employee.id, 'subPartyCommitteeId', String(v))} />
                        </div>
                    </div>
                </div>

                {/* TAB 3: CHỨC VỤ & CHỨC DANH */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Chức vụ & Chức danh</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Chức vụ</Label>
                            <GenericSearchSelect api={categoryConfigs.position.api} config={categoryConfigs.position} value={employee.positionId} onChange={(v) => handleFieldChange(employee.id, 'positionId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phụ cấp chức vụ</Label>
                            <Input type="number" value={employee.positionAllowance} onChange={(e) => handleFieldChange(employee.id, 'positionAllowance', e.target.value)} className="h-8 text-sm" placeholder="VNĐ" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Mã số thuế</Label>
                            <Input value={employee.taxCode} onChange={(e) => handleFieldChange(employee.id, 'taxCode', e.target.value)} className="h-8 text-sm" placeholder="Nhập mã" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chức vụ kiêm</Label>
                            <GenericSearchSelect api={categoryConfigs.position.api} config={categoryConfigs.position} value={employee.subPositionId} onChange={(v) => handleFieldChange(employee.id, 'subPositionId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chức danh</Label>
                            <GenericSearchSelect api={categoryConfigs.jobTitle.api} config={categoryConfigs.jobTitle} value={employee.jobTitleId} onChange={(v) => handleFieldChange(employee.id, 'jobTitleId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Vị trí công việc</Label>
                            <GenericSearchSelect api={categoryConfigs.jobPosition.api} config={categoryConfigs.jobPosition} value={employee.jobPositionId} onChange={(v) => handleFieldChange(employee.id, 'jobPositionId', String(v))} />
                        </div>
                    </div>
                </div>

                {/* TAB 4: ĐỊA CHỈ */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Địa chỉ</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Địa chỉ liên hệ</Label>
                            <Input value={employee.contactAddress} onChange={(e) => handleFieldChange(employee.id, 'contactAddress', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tỉnh/Thành phố</Label>
                            <GenericSearchSelect api={categoryConfigs.provinceCity.api} config={categoryConfigs.provinceCity} value={employee.provinceCityId} onChange={(v) => handleFieldChange(employee.id, 'provinceCityId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phường/Xã</Label>
                            <GenericSearchSelect api={categoryConfigs.ward.api} config={categoryConfigs.ward} value={employee.wardId} onChange={(v) => handleFieldChange(employee.id, 'wardId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hộ khẩu thường trú</Label>
                            <Input value={employee.permanentAddress} onChange={(e) => handleFieldChange(employee.id, 'permanentAddress', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nguyên quán</Label>
                            <Input value={employee.nativePlace} onChange={(e) => handleFieldChange(employee.id, 'nativePlace', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quê quán</Label>
                            <Input value={employee.homeTown} onChange={(e) => handleFieldChange(employee.id, 'homeTown', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                    </div>
                </div>

                {/* TAB 5: TUYỂN DỤNG */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Tuyển dụng</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào làm *</Label>
                            <Input type="date" value={employee.startDate} onChange={(e) => handleFieldChange(employee.id, 'startDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày kết thúc</Label>
                            <Input type="date" value={employee.endDate} onChange={(e) => handleFieldChange(employee.id, 'endDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Phòng ban *</Label>
                            <GenericSearchSelect api={categoryConfigs.department.api} config={categoryConfigs.department} value={employee.departmentId} onChange={(v) => handleFieldChange(employee.id, 'departmentId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Loại hợp đồng</Label>
                            <GenericSearchSelect api={categoryConfigs.laborContractType.api} config={categoryConfigs.laborContractType} value={employee.laborContractTypeId} onChange={(v) => handleFieldChange(employee.id, 'laborContractTypeId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nghề trước tuyển dụng</Label>
                            <Input value={employee.previousJob} onChange={(e) => handleFieldChange(employee.id, 'previousJob', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày tuyển dụng</Label>
                            <Input type="date" value={employee.recruitmentDate} onChange={(e) => handleFieldChange(employee.id, 'recruitmentDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Cơ quan tuyển dụng</Label>
                            <GenericSearchSelect api={categoryConfigs.organization.api} config={categoryConfigs.organization} value={employee.organizationId} onChange={(v) => handleFieldChange(employee.id, 'organizationId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Địa chỉ cơ quan</Label>
                            <Input value={employee.organizationAddress} onChange={(e) => handleFieldChange(employee.id, 'organizationAddress', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc chính đang làm</Label>
                            <Input value={employee.currentJobDetail} onChange={(e) => handleFieldChange(employee.id, 'currentJobDetail', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Sở trường công tác</Label>
                            <Input value={employee.workStrength} onChange={(e) => handleFieldChange(employee.id, 'workStrength', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc đã làm lâu nhất</Label>
                            <Input value={employee.longestJob} onChange={(e) => handleFieldChange(employee.id, 'longestJob', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                    </div>
                </div>

                {/* TAB 6: TRÌNH ĐỘ & LƯƠNG BHXH */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Trình độ & Lương BHXH</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Bậc học</Label>
                            <GenericSearchSelect api={categoryConfigs.degree.api} config={categoryConfigs.degree} value={employee.educationLevelId} onChange={(v) => handleFieldChange(employee.id, 'educationLevelId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ cụ thể</Label>
                            <Input value={employee.educationDetail} onChange={(e) => handleFieldChange(employee.id, 'educationDetail', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ văn hóa</Label>
                            <GenericSearchSelect api={categoryConfigs.culturalLevel.api} config={categoryConfigs.culturalLevel} value={employee.culturalLevelId} onChange={(v) => handleFieldChange(employee.id, 'culturalLevelId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ chuyên môn</Label>
                            <GenericSearchSelect api={categoryConfigs.professionalLevel.api} config={categoryConfigs.professionalLevel} value={employee.professionalLevelId} onChange={(v) => handleFieldChange(employee.id, 'professionalLevelId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nghề nghiệp</Label>
                            <GenericSearchSelect api={categoryConfigs.specialty.api} config={categoryConfigs.specialty} value={employee.specialtyId} onChange={(v) => handleFieldChange(employee.id, 'specialtyId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ tin học</Label>
                            <GenericSearchSelect api={categoryConfigs.itLevel.api} config={categoryConfigs.itLevel} value={employee.itLevelId} onChange={(v) => handleFieldChange(employee.id, 'itLevelId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngoại ngữ</Label>
                            <GenericSearchSelect api={categoryConfigs.languageLevel.api} config={categoryConfigs.languageLevel} value={employee.languageId} onChange={(v) => {
                                handleFieldChange(employee.id, 'languageId', String(v));
                                console.log("ngoaingu", v);
                            }} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trình độ ngoại ngữ</Label>
                            <GenericSearchSelect api={categoryConfigs.languageLevel.api} config={categoryConfigs.languageLevel} value={employee.languageLevelId} onChange={(v) => handleFieldChange(employee.id, 'languageLevelId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lý luận chính trị</Label>
                            <GenericSearchSelect api={categoryConfigs.politicalTheory.api} config={categoryConfigs.politicalTheory} value={employee.politicalTheoryId} onChange={(v) => handleFieldChange(employee.id, 'politicalTheoryId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Trường đào tạo</Label>
                            <GenericSearchSelect api={categoryConfigs.trainingInstitution.api} config={categoryConfigs.trainingInstitution} value={employee.trainingInstitutionId} onChange={(v) => handleFieldChange(employee.id, 'trainingInstitutionId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngành đào tạo</Label>
                            <GenericSearchSelect api={categoryConfigs.trainingMajor.api} config={categoryConfigs.trainingMajor} value={employee.trainingMajorId} onChange={(v) => handleFieldChange(employee.id, 'trainingMajorId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hình thức đào tạo</Label>
                            <GenericSearchSelect api={categoryConfigs.trainingType.api} config={categoryConfigs.trainingType} value={employee.trainingTypeId} onChange={(v) => handleFieldChange(employee.id, 'trainingTypeId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Số sổ BHXH</Label>
                            <Input value={employee.socialInsuranceNumber} onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceNumber', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày tham gia BHXH</Label>
                            <Input type="date" value={employee.socialInsuranceStartDate} onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceStartDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nơi đóng BHXH</Label>
                            <Input value={employee.socialInsurancePlace} onChange={(e) => handleFieldChange(employee.id, 'socialInsurancePlace', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công việc BHXH</Label>
                            <GenericSearchSelect api={categoryConfigs.socialInsuranceJob.api} config={categoryConfigs.socialInsuranceJob} value={employee.socialInsuranceJobId} onChange={(v) => handleFieldChange(employee.id, 'socialInsuranceJobId', String(v))} />
                        </div>
                        {/* Lương chính */}
                        <div className="space-y-1">
                            <Label className="text-xs">Bảng lương</Label>
                            <GenericSearchSelect api={categoryConfigs.payroll.api} config={categoryConfigs.payroll} value={employee.salaryPayrollId} onChange={(v) => handleFieldChange(employee.id, 'salaryPayrollId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Bậc lương</Label>
                            <GenericSearchSelect api={categoryConfigs.salaryScale.api} config={categoryConfigs.salaryScale} value={employee.salaryScaleId} onChange={(v) => handleFieldChange(employee.id, 'salaryScaleId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hệ số lương</Label>
                            <Input type="number" step="0.01" value={employee.salaryCoefficient} onChange={(e) => handleFieldChange(employee.id, 'salaryCoefficient', e.target.value)} className="h-8 text-sm" placeholder="Nhập hệ số" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Mức lương (VNĐ)</Label>
                            <Input type="number" value={employee.salaryAmount} onChange={(e) => handleFieldChange(employee.id, 'salaryAmount', e.target.value)} className="h-8 text-sm" placeholder="Nhập mức lương" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày áp dụng lương</Label>
                            <Input type="date" value={employee.salaryEffectiveDate} onChange={(e) => handleFieldChange(employee.id, 'salaryEffectiveDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        {/* Lương BHXH */}
                        <div className="space-y-1">
                            <Label className="text-xs">Bảng lương BHXH</Label>
                            <GenericSearchSelect api={categoryConfigs.payroll.api} config={categoryConfigs.payroll} value={employee.socialInsurancePayrollId} onChange={(v) => handleFieldChange(employee.id, 'socialInsurancePayrollId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Bậc lương BHXH</Label>
                            <GenericSearchSelect api={categoryConfigs.salaryScale.api} config={categoryConfigs.salaryScale} value={employee.socialInsuranceSalaryScaleId} onChange={(v) => handleFieldChange(employee.id, 'socialInsuranceSalaryScaleId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Hệ số lương BHXH</Label>
                            <Input type="number" step="0.01" value={employee.socialInsuranceSalaryCoefficient} onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceSalaryCoefficient', e.target.value)} className="h-8 text-sm" placeholder="Nhập hệ số" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Mức lương BHXH (VNĐ)</Label>
                            <Input type="number" value={employee.socialInsuranceSalaryAmount} onChange={(e) => handleFieldChange(employee.id, 'socialInsuranceSalaryAmount', e.target.value)} className="h-8 text-sm" placeholder="Nhập mức lương" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lương NS tài chính công đoàn (VNĐ)</Label>
                            <Input type="number" value={employee.unionSalary} onChange={(e) => handleFieldChange(employee.id, 'unionSalary', e.target.value)} className="h-8 text-sm" placeholder="Nhập số tiền" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chức danh BHXH</Label>
                            <GenericSearchSelect api={categoryConfigs.jobTitle.api} config={categoryConfigs.jobTitle} value={employee.socialInsuranceJobTitleId} onChange={(v) => handleFieldChange(employee.id, 'socialInsuranceJobTitleId', String(v))} />
                        </div>
                    </div>
                </div>

                {/* TAB 6b: NGUỒN THU NHẬP */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Nguồn thu nhập</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Nguồn thu nhập gia đình (VNĐ)</Label>
                            <Input type="number" value={employee.familyIncome} onChange={(e) => handleFieldChange(employee.id, 'familyIncome', e.target.value)} className="h-8 text-sm" placeholder="Nhập số tiền" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Các nguồn thu nhập khác</Label>
                            <Input value={employee.otherIncome} onChange={(e) => handleFieldChange(employee.id, 'otherIncome', e.target.value)} className="h-8 text-sm" placeholder="Mô tả" />
                        </div>
                        {/* Nhà ở */}
                        <div className="space-y-1">
                            <Label className="text-xs">Loại nhà được cấp/thuê</Label>
                            <Input value={employee.housingType} onChange={(e) => handleFieldChange(employee.id, 'housingType', e.target.value)} className="h-8 text-sm" placeholder="Nhập loại nhà" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Diện tích được cấp/thuê (m²)</Label>
                            <Input type="number" value={employee.housingArea} onChange={(e) => handleFieldChange(employee.id, 'housingArea', e.target.value)} className="h-8 text-sm" placeholder="m²" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Nhà tự mua/xây – Loại nhà</Label>
                            <Input value={employee.selfHousingType} onChange={(e) => handleFieldChange(employee.id, 'selfHousingType', e.target.value)} className="h-8 text-sm" placeholder="Nhập loại nhà" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Diện tích tự mua/xây (m²)</Label>
                            <Input type="number" value={employee.usableArea} onChange={(e) => handleFieldChange(employee.id, 'usableArea', e.target.value)} className="h-8 text-sm" placeholder="m²" />
                        </div>
                        {/* Đất đai */}
                        <div className="space-y-1">
                            <Label className="text-xs">Đất được cấp (m²)</Label>
                            <Input type="number" value={employee.grantedLandArea} onChange={(e) => handleFieldChange(employee.id, 'grantedLandArea', e.target.value)} className="h-8 text-sm" placeholder="m²" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Đất tự mua (m²)</Label>
                            <Input type="number" value={employee.purchasedLandArea} onChange={(e) => handleFieldChange(employee.id, 'purchasedLandArea', e.target.value)} className="h-8 text-sm" placeholder="m²" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Các loại đất khác</Label>
                            <Input value={employee.otherLand} onChange={(e) => handleFieldChange(employee.id, 'otherLand', e.target.value)} className="h-8 text-sm" placeholder="Mô tả" />
                        </div>
                        {/* Tài khoản ngân hàng */}
                        <div className="space-y-1">
                            <Label className="text-xs">Số tài khoản ngân hàng</Label>
                            <Input value={employee.bankAccountNumber} onChange={(e) => handleFieldChange(employee.id, 'bankAccountNumber', e.target.value)} className="h-8 text-sm" placeholder="Nhập số tài khoản" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Tên ngân hàng</Label>
                            <Input value={employee.bankName} onChange={(e) => handleFieldChange(employee.id, 'bankName', e.target.value)} className="h-8 text-sm" placeholder="Nhập tên ngân hàng" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chủ tài khoản</Label>
                            <Input value={employee.bankAccountHolder} onChange={(e) => handleFieldChange(employee.id, 'bankAccountHolder', e.target.value)} className="h-8 text-sm" placeholder="Nhập tên chủ tài khoản" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Chi nhánh ngân hàng</Label>
                            <Input value={employee.bankBranch} onChange={(e) => handleFieldChange(employee.id, 'bankBranch', e.target.value)} className="h-8 text-sm" placeholder="Nhập chi nhánh" />
                        </div>
                    </div>
                </div>

                {/* TAB 7: LỊCH SỬ BẢN THÂN */}
                <div>
                    <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">Lịch sử bản thân</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày tham gia cách mạng</Label>
                            <Input type="date" value={employee.youthUnionJoinDate} onChange={(e) => handleFieldChange(employee.id, 'youthUnionJoinDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày vào Đảng</Label>
                            <Input type="date" value={employee.partyJoinDate} onChange={(e) => handleFieldChange(employee.id, 'partyJoinDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày chính thức Đảng</Label>
                            <Input type="date" value={employee.partyOfficialDate} onChange={(e) => handleFieldChange(employee.id, 'partyOfficialDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày nhập ngũ</Label>
                            <Input type="date" value={employee.militaryJoinDate} onChange={(e) => handleFieldChange(employee.id, 'militaryJoinDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Ngày xuất ngũ</Label>
                            <Input type="date" value={employee.militaryEndDate} onChange={(e) => handleFieldChange(employee.id, 'militaryEndDate', e.target.value)} className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quân hàm, chức vụ cao nhất</Label>
                            <Input value={employee.title} onChange={(e) => handleFieldChange(employee.id, 'title', e.target.value)} className="h-8 text-sm" placeholder="Nhập quân hàm / chức vụ" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Danh hiệu được phong</Label>
                            <GenericSearchSelect api={categoryConfigs.militaryRank.api} config={categoryConfigs.militaryRank} value={employee.militaryRankId} onChange={(v) => handleFieldChange(employee.id, 'militaryRankId', String(v))} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Thương binh hạng</Label>
                            <Input type="number" value={employee.injuryRank} onChange={(e) => handleFieldChange(employee.id, 'injuryRank', e.target.value)} className="h-8 text-sm" placeholder="Nhập hạng (số)" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Gia đình liệt sĩ</Label>
                            <Select value={employee.isWoundedSoldier ? 'co' : 'khong'} onValueChange={(v) => handleFieldChange(employee.id, 'isWoundedSoldier', v === 'co')}>
                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="co">Có</SelectItem>
                                    <SelectItem value="khong">Không</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Lịch sử pháp lý</Label>
                            <Input value={employee.legalHistory} onChange={(e) => handleFieldChange(employee.id, 'legalHistory', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Công tác tại chế độ cũ</Label>
                            <Input value={employee.workedInOldRegime} onChange={(e) => handleFieldChange(employee.id, 'workedInOldRegime', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Quan hệ nước ngoài</Label>
                            <Input value={employee.foreignOrganizationRelation} onChange={(e) => handleFieldChange(employee.id, 'foreignOrganizationRelation', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Thân nhân ở nước ngoài</Label>
                            <Input value={employee.relativesAbroad} onChange={(e) => handleFieldChange(employee.id, 'relativesAbroad', e.target.value)} className="h-8 text-sm" placeholder="Nhập" />
                        </div>
                        <div className="col-span-4 space-y-1">
                            <Label className="text-xs">Ghi chú</Label>
                            <Textarea value={employee.note} onChange={(e) => handleFieldChange(employee.id, 'note', e.target.value)} className="text-sm" rows={3} placeholder="Nhập ghi chú" />
                        </div>
                    </div>
                </div>
            </div>
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
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn nhân viên để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleImportExcel}
                                />
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-4 w-4" />
                                    Tải lên
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={handleExportExcel}
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
                    <div className="flex-1 overflow-auto px-4 py-4 min-h-0">
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