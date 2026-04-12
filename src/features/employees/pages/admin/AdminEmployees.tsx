import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Search,
  Plus,
  Upload,
  Download,
  X,
  Mail,
  Phone,
  MapPin,
  Code,
  CalendarDays,
  Shield,
  UserPlus,
  UserCog,
  ShieldPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  ArrowLeft,
  Edit,
  Edit2,
  ChevronDown
} from 'lucide-react';
import { employeeApi } from '../../api/employeeApi';
import { userApi } from '../../api/userApi';
import authService from '@/features/auth/api/authApi';
import { unitApi } from '@/features/departments/api/departmentApi';
import EmployeeModal from '../../components/modal/EmployeeModal';
import UserAccountModal from '../../components/modal/UserAccountModal';
import RoleModal from '../../../auth/components/RoleModal';
import AccountModal from '@/features/auth/components/AccountModal';
import InfoTab from '@/features/employees/components/InfoTab';
import MedicalTab from '../../components/MedicalTab';
import TrainingTab from '../../components/TrainingTab';
import KpiTab from '../../components/KpiTab';
import ContractsTab from '../../components/ContractsTab';
import LeavesTab from '../../components/LeavesTab';
import { SalaryTabWithDragDrop } from '../../components/SalaryTabWithDragDrop';
import UserTable from '@/features/employees/components/UserTable';
import { Button as Button2 } from '@/shared/components/ui/button/Button2';
import BulkEditEmployeeModal from '../../components/modal/BulkEditEmployeeModal';
import BulkAddEmployeeModal from '../../components/modal/BulkAddEmployeeModal';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/components/ui/popover';
import RewardTab from '../../components/RewardTab';
import DisciplineTab from '../../components/DisciplineTab';
import AppointmentTab from '../../components/AppointmentTab';
import DismissalTab from '../../components/DismissalTab';
import TransferTab from '../../components/TransferTab';
import SalaryAdjustmentTab from '../../components/SalaryAdjustmentTab';
import DegreeTab from '../../components/DegreeTab';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { exportEmployeesToExcel } from '@/shared/helper/src/utils/exportEmployeeExcel';
import { culturalLevelApi, degreeApi, ethnicityApi, itLevelApi, jobTitleApi, laborContractTypeApi, languageLevelApi, militaryRankApi, nationalityApi, policyFamilyApi, politicalTheoryApi, professionalLevelApi, provinceCityApi, socialInsuranceJobApi, specialtyApi, trainingInstitutionApi, trainingMajorApi, trainingTypeApi, wardApi } from '@/features/categories/api/categoriesApi';
import { toast } from '@/shared/hooks/use-toast';
import EmployeeFamilyVisitTab from '../../components/VistFamilyTab';
import InsuranceTab from '../../components/InsuranceTab';
import AllDecisionsTab from '../../components/AlldecisionTab';
import clsx from 'clsx';
import TerminationTab from '../../components/TerminationTab';
import ExtensionTab from '../../components/ExtensionTab';
import EmployeeDocumentsTab from '../../components/EmployeeDocumentTab';
import FamilyTab from '../../components/FamilyTab';
import WorkScheduleTab from '../../components/WorkScheduleTab';
import OverseasTab from '../../components/OverseasTab';

export default function Employees() {
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDecisionDropdownOpen, setIsDecisionDropdownOpen] = useState(false);
  // Employee selection for detail view
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState<'create' | 'edit'>('create');

  // Detail view data
  const [employeeDetailData, setEmployeeDetailData] = useState(null);
  const [userDetailData, setUserDetailData] = useState(null);
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [hasUserRole, setHasUserRole] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [mainTab, setMainTab] = useState('info');
  const [subTab, setSubTab] = useState('info');
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [isBulkAddModalOpen, setIsBulkAddModalOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [decisionType, setDecisionType] = useState('all');
  const [medicalType, setMedicalType] = useState('record');
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    employeeName: true,
    employeeCode: true,
    positionName: true,
    departmentName: true,
    status: true,

    startDate: false,
    phone: false,
    contractType: false,
    dateOfBirth: false,
    cccdNumber: false,
    cccdDate: false,
    cccdPlace: false,
    contactAddress: false,
    birthPlace: false,
    nativePlace: false,
    homeTown: false,
    permanentAddress: false,
    socialInsuranceNumber: false,
    socialInsuranceStartDate: false,
    partyJoinDate: false,
    partyOfficialDate: false,
    youthUnionJoinDate: false,
    militaryJoinDate: false,
    militaryEndDate: false,
    title: false,
    isWoundedSoldier: false,
    currentJobDetail: false,
    note: false,
    cardNumber: false,
    documentReturnDate: false,
    educationDetail: false,
    laborContractTypeName: false,
    culturalLevelName: false,
    professionalLevelName: false,
    itLevelName: false,
    trainingMajorName: false,
    militaryRankName: false,
    policyFamilyName: false,
    socialInsuranceJobName: false,
  });

  const ColumnSettingsDialog = () => {
    const columnGroups = {
      'Thông tin cơ bản': {
        employeeCode: 'Mã nhân viên',
        positionName: 'Chức vụ',
        departmentName: 'Phòng ban',
        status: 'Trạng thái',
        startDate: 'Ngày vào làm',
        phone: 'Số điện thoại',
        email: 'Email',
        contractType: 'Loại hợp đồng',
      },
      'Thông tin cá nhân': {
        dateOfBirth: 'Ngày sinh',
        birthPlace: 'Nơi sinh',
        nativePlace: 'Quê quán',
        homeTown: 'Nguyên quán',
        contactAddress: 'Địa chỉ liên hệ',
        permanentAddress: 'Địa chỉ thường trú',
      },
      'Giấy tờ tùy thân': {
        cccdNumber: 'Số CCCD/CMND',
        cccdDate: 'Ngày cấp CCCD',
        cccdPlace: 'Nơi cấp CCCD',
        cardNumber: 'Số thẻ',
      },
      'Bảo hiểm': {
        socialInsuranceNumber: 'Số sổ BHXH',
        socialInsuranceStartDate: 'Ngày tham gia BHXH',
        socialInsuranceJobName: 'Nghề BHXH',
      },
      'Đảng - Đoàn - Quân đội': {
        partyJoinDate: 'Ngày vào Đảng',
        partyOfficialDate: 'Ngày chính thức',
        youthUnionJoinDate: 'Ngày vào Đoàn',
        militaryJoinDate: 'Ngày nhập ngũ',
        militaryEndDate: 'Ngày xuất ngũ',
        militaryRankName: 'Quân hàm',
        isWoundedSoldier: 'Thương binh',
      },
      'Trình độ & Chuyên môn': {
        culturalLevelName: 'Trình độ văn hóa',
        professionalLevelName: 'Trình độ chuyên môn',
        itLevelName: 'Trình độ tin học',
        trainingMajorName: 'Chuyên ngành đào tạo',
        educationDetail: 'Chi tiết học vấn',
        laborContractTypeName: 'Loại hợp đồng lao động',
      },
      'Chính sách & Khác': {
        policyFamilyName: 'Gia đình chính sách',
        title: 'Chức danh',
        currentJobDetail: 'Chi tiết công việc hiện tại',
        documentReturnDate: 'Ngày trả hồ sơ',
        note: 'Ghi chú',
      },
    };

    return (
      <Dialog open={isColumnSettingsOpen} onOpenChange={setIsColumnSettingsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh cột hiển thị</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Chọn các cột bạn muốn hiển thị trong bảng nhân viên
            </p>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-4">
            {Object.entries(columnGroups).map(([groupName, columns]) => (
              <div key={groupName} className="space-y-3">
                <h3 className="font-semibold text-sm border-b pb-2">{groupName}</h3>
                <div className="grid grid-cols-2 gap-3 pl-2">
                  {Object.entries(columns).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={visibleColumns[key]}
                        onCheckedChange={(checked) => {
                          setVisibleColumns(prev => ({
                            ...prev,
                            [key]: checked
                          }));
                        }}
                      />
                      <label
                        htmlFor={key}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setVisibleColumns({
                    employeeName: true,
                    employeeCode: true,
                    positionName: true,
                    departmentName: true,
                    status: true,
                    startDate: false,
                    phone: false,
                    contractType: false,
                    dateOfBirth: false,
                    cccdNumber: false,
                    cccdDate: false,
                    cccdPlace: false,
                    contactAddress: false,
                    birthPlace: false,
                    nativePlace: false,
                    homeTown: false,
                    permanentAddress: false,
                    socialInsuranceNumber: false,
                    socialInsuranceStartDate: false,
                    partyJoinDate: false,
                    partyOfficialDate: false,
                    youthUnionJoinDate: false,
                    militaryJoinDate: false,
                    militaryEndDate: false,
                    title: false,
                    isWoundedSoldier: false,
                    currentJobDetail: false,
                    note: false,
                    cardNumber: false,
                    documentReturnDate: false,
                    educationDetail: false,
                    laborContractTypeName: false,
                    culturalLevelName: false,
                    professionalLevelName: false,
                    itLevelName: false,
                    trainingMajorName: false,
                    militaryRankName: false,
                    policyFamilyName: false,
                    socialInsuranceJobName: false,
                  });
                }}
              >
                Đặt lại mặc định
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsColumnSettingsOpen(false)}
                >
                  Đóng
                </Button>
                <Button2
                  onClick={() => {
                    setIsColumnSettingsOpen(false);
                    // Có thể thêm toast thông báo
                    alert('Đã lưu cấu hình cột');
                  }}
                >
                  Xác nhận
                </Button2>
              </div>
            </div>
          </div>


        </DialogContent>
      </Dialog>
    );
  };

  const fileInputRef = useRef(null);

  // Fetch employees
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    error: employeesError,
    refetch: refetchEmployees
  } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  // Fetch users
  const {
    data: users = [],
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getAll,
    enabled: activeTab === 'users',
  });

  // Fetch departments
  const { data: departmentsFromApi = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: unitApi.getAll,
  });

  const departments = departmentsFromApi;

  useEffect(() => {
    if (mainTab === 'info') setSubTab('info');
    if (mainTab === 'business') setSubTab('leaves');
    if (mainTab === 'skill') setSubTab('training');
    if (mainTab === 'benefit') setSubTab('insurance');
    if (mainTab === 'salary-review') setSubTab('salary');
  }, [mainTab]);

  // Fetch employee detail when selected
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      if (!selectedEmployeeId) {
        setEmployeeDetailData(null);
        setUserDetailData(null);
        return;
      }

      try {
        setLoadingDetail(true);

        // Fetch employee data
        const employeeResponse = await employeeApi.getById(Number(selectedEmployeeId));
        const employee = employeeResponse.data || employeeResponse;
        setEmployeeDetailData(employee);

        // Check if has user account
        const hasAccount = Boolean(employee.userId);
        setHasUserAccount(hasAccount);

        // Fetch user data if exists
        if (hasAccount && employee.userId) {
          try {
            const userResponse = await userApi.getById(employee.userId);
            const user = userResponse.data || userResponse;
            setUserDetailData(user);

            // Fetch user role
            try {
              const userRoles = await authService.getUserRole(employee.userId);
              if (userRoles && userRoles.length > 0) {
                setUserRole(userRoles[0]);
                setHasUserRole(true);
              } else {
                setUserRole(null);
                setHasUserRole(false);
              }
            } catch (roleError) {
              console.error('Error fetching user role:', roleError);
              setUserRole(null);
              setHasUserRole(false);
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            setUserDetailData(null);
            setHasUserAccount(false);
          }
        } else {
          setUserDetailData(null);
          setUserRole(null);
          setHasUserRole(false);
        }
      } catch (error) {
        console.error('Error fetching employee detail:', error);
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchEmployeeDetail();
  }, [selectedEmployeeId]);

  const handleToggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Toggle all checkboxes
  const handleToggleAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const text = searchTerm.toLowerCase();

      const matchesSearch =
        emp.fullName?.toLowerCase().includes(text) ||
        emp.employeeCode?.toLowerCase().includes(text) ||
        emp.email?.toLowerCase().includes(text) ||
        emp.position?.name?.toLowerCase().includes(text) ||
        emp.department?.name?.toLowerCase().includes(text);

      const matchesStatus =
        filterStatus === 'all' || emp.status === filterStatus;

      const matchesDepartment =
        filterDepartment === 'all' ||
        emp.departmentName === filterDepartment ||
        emp.department?.name === filterDepartment;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [employees, searchTerm, filterStatus, filterDepartment]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterDepartment]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = searchTerm.toLowerCase();
      return (
        user.username?.toLowerCase().includes(text) ||
        user.email?.toLowerCase().includes(text) ||
        user.fullName?.toLowerCase().includes(text)
      );
    });
  }, [users, searchTerm]);

  // Check if all are selected
  const isAllSelected = selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0;
  const isIndeterminate = selectedEmployeeIds.length > 0 && selectedEmployeeIds.length < filteredEmployees.length;

  const handleRowClick = (employeeId) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleCloseDetail = () => {
    setSelectedEmployeeId(null);
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await employeeApi.importExcel(file);
      alert('Import nhân viên thành công');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err?.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleExportExcel = async () => {
    try {
      // Hiển thị loading
      const loadingToast = toast({
        title: 'Đang xử lý...',
        description: 'Đang tải dữ liệu và tạo file Excel'
      });

      // Lấy tất cả danh mục cần thiết - PHẢI CÓ AWAIT
      const [
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
        jobTitleApi.getAll(),
        laborContractTypeApi.getAll(),
        nationalityApi.getAll(),
        ethnicityApi.getAll(),
        policyFamilyApi.getAll(),
        provinceCityApi.getAll(),
        wardApi.getAll(),
        degreeApi.getAll(),
        culturalLevelApi.getAll(),
        professionalLevelApi.getAll(),
        specialtyApi.getAll(),
        itLevelApi.getAll(),
        languageLevelApi.getAll(),
        politicalTheoryApi.getAll(),
        trainingInstitutionApi.getAll(),
        trainingMajorApi.getAll(),
        trainingTypeApi.getAll(),
        socialInsuranceJobApi.getAll(),
        militaryRankApi.getAll(),
      ]);

      const categories = {
        departments: departments || [],
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
      };

      // Gọi hàm export
      await exportEmployeesToExcel(filteredEmployees, categories);

      toast({
        title: 'Thành công',
        description: 'Đã tải xuống file Excel với đầy đủ thông tin'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Lỗi',
        description: error?.message || 'Xuất file thất bại',
        variant: 'destructive'
      });
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedEmployeeId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployeeId(null);
  };

  const handleDeleteEmployee = async (id, e) => {
    e.stopPropagation(); // Prevent row click
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      try {
        await employeeApi.delete(id);
        alert('Xóa nhân viên thành công');
        refetchEmployees();
      } catch (error) {
        alert('Lỗi khi xóa nhân viên');
      }
    }
  };

  const handleManageAccount = () => {
    if (hasUserAccount) {
      setAccountModalMode('edit');
    } else {
      setAccountModalMode('create');
    }
    setIsAccountModalOpen(true);
  };

  const handleManageRole = () => {
    if (!hasUserAccount) {
      alert('Vui lòng tạo tài khoản trước khi phân quyền');
      return;
    }

    // Tạo userData với thông tin từ userDetailData
    const userData = {
      ...userDetailData,
      userId: userDetailData?.id || employeeDetailData?.userId
    };

    console.log('Setting user data for role modal:', userData);
    setSelectedUserData(userData);
    setIsRoleModalOpen(true);
  };

  // User modal handlers
  const handleOpenCreateUserModal = () => {
    setUserModalMode('create');
    setSelectedUserId(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (id) => {
    setUserModalMode('edit');
    setSelectedUserId(id);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
  };

  const handleOpenBulkEdit = async () => {
    if (selectedEmployeeIds.length === 0) {
      alert('Vui lòng chọn ít nhất một nhân viên để chỉnh sửa');
      return;
    }
    setIsBulkEditModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
      try {
        alert('Xóa tài khoản thành công');
      } catch (error) {
        alert('Lỗi khi xóa tài khoản');
      }
    }
  };

  const handleToggleUserStatus = async (user) => {
    const action = user.status === 'Active' ? 'vô hiệu hóa' : 'kích hoạt';
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.username}" không?`)) {
      try {
        await userApi.toggleStatus(user.id, user.status);
        alert(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`);
        window.location.reload();
      } catch (error) {
        console.error('Error toggling user status:', error);
        alert(`Lỗi khi ${action} tài khoản`);
      }
    }
  };

  const handleOpenRoleModal = (user) => {
    const userData = {
      ...user,
      userId: user.id
    };
    setSelectedUserData(userData);
    console.log('Selected user data for role modal:', userData);
    setIsRoleModalOpen(true);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
    setSelectedUserData(null);
  };

  const isLoading = activeTab === 'employees' ? isLoadingEmployees : isLoadingUsers;
  const error = activeTab === 'employees' ? employeesError : usersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-destructive">Lỗi: Không thể tải dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedEmployeeId && (
              <Button2
                size="sm"
                onClick={handleCloseDetail}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button2>
            )}
            <div>
              <h1 className="text-3xl font-bold">Nhân viên</h1>
              <p className="text-muted-foreground">
                {activeTab === 'employees'
                  ? `Quản lý danh sách nhân viên (${filteredEmployees.length}/${employees.length})`
                  : `Quản lý danh sách tài khoản (${filteredUsers.length}/${users.length})`
                }
              </p>
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="employees">Danh sách nhân viên</TabsTrigger>
            <TabsTrigger value="users">Danh sách tài khoản</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees" className="space-y-4 mt-6">
          <Card className="p-4 mb-4">
            <div className={"flex flex-col md:flex-row gap-4"}>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={"Tìm kiếm theo tên nhân viên, mã nhân viên"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className={"w-full md:w-48"}>
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phòng ban</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* {selectedEmployeeId ? (
                <div>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" />
                    Tải lên
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="ml-2 flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>

                </div>
              ) : (
                <>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1" />
                    Tải lên
                  </Button>
                  <Button variant="outline" onClick={handleExportExcel} >
                    <Download className="h-4 w-4 mr-1" />
                    Tải xuống
                  </Button>
                  <Button variant="outline" onClick={() => setIsColumnSettingsOpen(true)}>
                    <UserCog className="h-4 w-4 mr-1" />
                    Tùy chỉnh cột
                  </Button>
                </>
              )} */}

              <div className='flex gap-2'>
                <Button
                  // onClick={handleOpenCreateModal}
                  onClick={() => setIsBulkAddModalOpen(true)}
                  className={"bg-green-500 hover:bg-green-600 text-white"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm nhân viên
                </Button>

                <Button2
                  onClick={handleOpenBulkEdit}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Chỉnh sửa ({selectedEmployeeIds.length})
                </Button2>
              </div>
            </div>
          </Card>
          <div className={`grid gap-4 transition-all duration-300 ${selectedEmployeeId ? 'grid-cols-12' : 'grid-cols-1'}`}>
            <div className={selectedEmployeeId ? 'col-span-4' : 'col-span-12'}>


              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleImportExcel}
              />

              {/* Employee Table */}
              <Card className="overflow-hidden">
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        {!selectedEmployeeId && (
                          <>
                            <th className="text-center p-3 text-sm font-semibold w-12">
                              <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} />
                            </th>
                            <th className="text-center p-3 text-sm font-semibold w-6">STT</th>
                          </>
                        )}
                        {!selectedEmployeeId && (
                          <>
                            {visibleColumns.employeeName && <th className="text-left p-3 text-sm font-semibold">Tên nhân viên</th>}
                            {visibleColumns.employeeCode && <th className="text-left p-3 text-sm font-semibold">Mã nhân viên</th>}
                            {visibleColumns.positionName && <th className="text-left p-3 text-sm font-semibold">Chức vụ</th>}
                            {visibleColumns.departmentName && <th className="text-left p-3 text-sm font-semibold">Phòng ban</th>}
                            {visibleColumns.status && <th className="text-left p-3 text-sm font-semibold">Trạng thái</th>}
                            {visibleColumns.startDate && <th className="text-left p-3 text-sm font-semibold">Ngày vào làm</th>}
                            {visibleColumns.phone && <th className="text-left p-3 text-sm font-semibold">SĐT</th>}
                            {visibleColumns.contractType && <th className="text-left p-3 text-sm font-semibold">Loại HĐ</th>}
                            {visibleColumns.dateOfBirth && <th className="text-left p-3 text-sm font-semibold">Ngày sinh</th>}
                            {visibleColumns.birthPlace && <th className="text-left p-3 text-sm font-semibold">Nơi sinh</th>}
                            {visibleColumns.nativePlace && <th className="text-left p-3 text-sm font-semibold">Quê quán</th>}
                            {visibleColumns.homeTown && <th className="text-left p-3 text-sm font-semibold">Nguyên quán</th>}
                            {visibleColumns.contactAddress && <th className="text-left p-3 text-sm font-semibold">Địa chỉ LH</th>}
                            {visibleColumns.permanentAddress && <th className="text-left p-3 text-sm font-semibold">Địa chỉ TT</th>}
                            {visibleColumns.cccdNumber && <th className="text-left p-3 text-sm font-semibold">Số CCCD</th>}
                            {visibleColumns.cccdDate && <th className="text-left p-3 text-sm font-semibold">Ngày cấp CCCD</th>}
                            {visibleColumns.cccdPlace && <th className="text-left p-3 text-sm font-semibold">Nơi cấp CCCD</th>}
                            {visibleColumns.cardNumber && <th className="text-left p-3 text-sm font-semibold">Số thẻ</th>}
                            {visibleColumns.socialInsuranceNumber && <th className="text-left p-3 text-sm font-semibold">Số sổ BHXH</th>}
                            {visibleColumns.socialInsuranceStartDate && <th className="text-left p-3 text-sm font-semibold">Ngày tham gia BHXH</th>}
                            {visibleColumns.socialInsuranceJobName && <th className="text-left p-3 text-sm font-semibold">Nghề BHXH</th>}
                            {visibleColumns.partyJoinDate && <th className="text-left p-3 text-sm font-semibold">Ngày vào Đảng</th>}
                            {visibleColumns.partyOfficialDate && <th className="text-left p-3 text-sm font-semibold">Ngày chính thức</th>}
                            {visibleColumns.youthUnionJoinDate && <th className="text-left p-3 text-sm font-semibold">Ngày vào Đoàn</th>}
                            {visibleColumns.militaryJoinDate && <th className="text-left p-3 text-sm font-semibold">Ngày nhập ngũ</th>}
                            {visibleColumns.militaryEndDate && <th className="text-left p-3 text-sm font-semibold">Ngày xuất ngũ</th>}
                            {visibleColumns.militaryRankName && <th className="text-left p-3 text-sm font-semibold">Quân hàm</th>}
                            {visibleColumns.isWoundedSoldier && <th className="text-left p-3 text-sm font-semibold">Thương binh</th>}
                            {visibleColumns.culturalLevelName && <th className="text-left p-3 text-sm font-semibold">Trình độ VH</th>}
                            {visibleColumns.professionalLevelName && <th className="text-left p-3 text-sm font-semibold">Trình độ CM</th>}
                            {visibleColumns.itLevelName && <th className="text-left p-3 text-sm font-semibold">Trình độ TH</th>}
                            {visibleColumns.trainingMajorName && <th className="text-left p-3 text-sm font-semibold">Chuyên ngành</th>}
                            {visibleColumns.educationDetail && <th className="text-left p-3 text-sm font-semibold">Chi tiết học vấn</th>}
                            {visibleColumns.laborContractTypeName && <th className="text-left p-3 text-sm font-semibold">Loại HĐLĐ</th>}
                            {visibleColumns.policyFamilyName && <th className="text-left p-3 text-sm font-semibold">Gia đình CS</th>}
                            {visibleColumns.title && <th className="text-left p-3 text-sm font-semibold">Chức danh</th>}
                            {visibleColumns.currentJobDetail && <th className="text-left p-3 text-sm font-semibold">CV hiện tại</th>}
                            {visibleColumns.documentReturnDate && <th className="text-left p-3 text-sm font-semibold">Ngày trả HS</th>}
                            {visibleColumns.note && <th className="text-left p-3 text-sm font-semibold">Ghi chú</th>}

                            <th className="text-center p-3 text-sm font-semibold">Thao tác</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedEmployees.map((employee, index) => (
                        <tr
                          key={employee.id}
                          className={`border-b hover:bg-muted/50 transition-colors ${selectedEmployeeId === employee.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            } ${selectedEmployeeIds.includes(employee.id) ? 'bg-blue-50' : ''}`}
                        >
                          {!selectedEmployeeId && (
                            <>
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedEmployeeIds.includes(employee.id)}
                                  onCheckedChange={() => handleToggleEmployee(employee.id)}
                                />
                              </td>
                              <td className="p-3 text-center text-sm text-muted-foreground">
                                {index + 1}
                              </td>
                            </>
                          )}
                          <td className="p-3 cursor-pointer" onClick={() => handleRowClick(employee.id)}>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {employee.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{employee.fullName}</p>
                              </div>
                            </div>
                          </td>
                          {!selectedEmployeeId && (
                            <>
                              {visibleColumns.employeeCode && (
                                <td className="p-3"><p className="text-sm">{employee.employeeCode || '-'}</p></td>
                              )}
                              {visibleColumns.positionName && (
                                <td className="p-3"><p className="text-sm">{employee.positionName || '-'}</p></td>
                              )}
                              {visibleColumns.departmentName && (
                                <td className="p-3"><p className="text-sm">{employee.departmentName || '-'}</p></td>
                              )}
                              {visibleColumns.startDate && (
                                <td className="p-3"><p className="text-sm">{employee.startDate ? new Date(employee.startDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              <td className="p-3">
                                {employee.email ? (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã có tài khoản
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Chưa có tài khoản
                                  </Badge>
                                )}
                              </td>
                              {visibleColumns.phone && (
                                <td className="p-3"><p className="text-sm">{employee.phone || '-'}</p></td>
                              )}
                              {visibleColumns.contractType && (
                                <td className="p-3"><p className="text-sm">{employee.contractType || '-'}</p></td>
                              )}
                              {visibleColumns.dateOfBirth && (
                                <td className="p-3"><p className="text-sm">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.birthPlace && (
                                <td className="p-3"><p className="text-sm">{employee.birthPlace || '-'}</p></td>
                              )}
                              {visibleColumns.nativePlace && (
                                <td className="p-3"><p className="text-sm">{employee.nativePlace || '-'}</p></td>
                              )}
                              {visibleColumns.homeTown && (
                                <td className="p-3"><p className="text-sm">{employee.homeTown || '-'}</p></td>
                              )}
                              {visibleColumns.contactAddress && (
                                <td className="p-3"><p className="text-sm">{employee.contactAddress || '-'}</p></td>
                              )}
                              {visibleColumns.permanentAddress && (
                                <td className="p-3"><p className="text-sm">{employee.permanentAddress || '-'}</p></td>
                              )}
                              {visibleColumns.cccdNumber && (
                                <td className="p-3"><p className="text-sm">{employee.cccdNumber || '-'}</p></td>
                              )}
                              {visibleColumns.cccdDate && (
                                <td className="p-3"><p className="text-sm">{employee.cccdDate ? new Date(employee.cccdDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.cccdPlace && (
                                <td className="p-3"><p className="text-sm">{employee.cccdPlace || '-'}</p></td>
                              )}
                              {visibleColumns.cardNumber && (
                                <td className="p-3"><p className="text-sm">{employee.cardNumber || '-'}</p></td>
                              )}
                              {visibleColumns.socialInsuranceNumber && (
                                <td className="p-3"><p className="text-sm">{employee.socialInsuranceNumber || '-'}</p></td>
                              )}
                              {visibleColumns.socialInsuranceStartDate && (
                                <td className="p-3"><p className="text-sm">{employee.socialInsuranceStartDate ? new Date(employee.socialInsuranceStartDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.socialInsuranceJobName && (
                                <td className="p-3"><p className="text-sm">{employee.socialInsuranceJobName || '-'}</p></td>
                              )}
                              {visibleColumns.partyJoinDate && (
                                <td className="p-3"><p className="text-sm">{employee.partyJoinDate ? new Date(employee.partyJoinDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.partyOfficialDate && (
                                <td className="p-3"><p className="text-sm">{employee.partyOfficialDate ? new Date(employee.partyOfficialDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.youthUnionJoinDate && (
                                <td className="p-3"><p className="text-sm">{employee.youthUnionJoinDate ? new Date(employee.youthUnionJoinDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.militaryJoinDate && (
                                <td className="p-3"><p className="text-sm">{employee.militaryJoinDate ? new Date(employee.militaryJoinDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.militaryEndDate && (
                                <td className="p-3"><p className="text-sm">{employee.militaryEndDate ? new Date(employee.militaryEndDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.militaryRankName && (
                                <td className="p-3"><p className="text-sm">{employee.militaryRankName || '-'}</p></td>
                              )}
                              {visibleColumns.isWoundedSoldier && (
                                <td className="p-3"><p className="text-sm">{employee.isWoundedSoldier ? 'Có' : 'Không'}</p></td>
                              )}
                              {visibleColumns.culturalLevelName && (
                                <td className="p-3"><p className="text-sm">{employee.culturalLevelName || '-'}</p></td>
                              )}
                              {visibleColumns.professionalLevelName && (
                                <td className="p-3"><p className="text-sm">{employee.professionalLevelName || '-'}</p></td>
                              )}
                              {visibleColumns.itLevelName && (
                                <td className="p-3"><p className="text-sm">{employee.itLevelName || '-'}</p></td>
                              )}
                              {visibleColumns.trainingMajorName && (
                                <td className="p-3"><p className="text-sm">{employee.trainingMajorName || '-'}</p></td>
                              )}
                              {visibleColumns.educationDetail && (
                                <td className="p-3"><p className="text-sm truncate max-w-xs" title={employee.educationDetail}>{employee.educationDetail || '-'}</p></td>
                              )}
                              {visibleColumns.laborContractTypeName && (
                                <td className="p-3"><p className="text-sm">{employee.laborContractTypeName || '-'}</p></td>
                              )}
                              {visibleColumns.policyFamilyName && (
                                <td className="p-3"><p className="text-sm">{employee.policyFamilyName || '-'}</p></td>
                              )}
                              {visibleColumns.title && (
                                <td className="p-3"><p className="text-sm">{employee.title || '-'}</p></td>
                              )}
                              {visibleColumns.currentJobDetail && (
                                <td className="p-3"><p className="text-sm truncate max-w-xs" title={employee.currentJobDetail}>{employee.currentJobDetail || '-'}</p></td>
                              )}
                              {visibleColumns.documentReturnDate && (
                                <td className="p-3"><p className="text-sm">{employee.documentReturnDate ? new Date(employee.documentReturnDate).toLocaleDateString('vi-VN') : '-'}</p></td>
                              )}
                              {visibleColumns.note && (
                                <td className="p-3"><p className="text-sm truncate max-w-xs" title={employee.note}>{employee.note || '-'}</p></td>
                              )}

                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <div className="flex gap-1 justify-center">
                                  <Button2
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setModalMode('edit');
                                      setEditingEmployeeId(employee.id);
                                      setIsModalOpen(true);
                                    }}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button2>
                                  <Button2
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleDeleteEmployee(employee.id, e)}
                                    title="Xóa"
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button2>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {filteredEmployees.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">Hiển thị</span>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        Đầu
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>

                      <span className="text-sm px-4">
                        Trang {currentPage} / {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Sau
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        Cuối
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            {selectedEmployeeId && (
              <div className="col-span-8">
                <Card className="h-full">
                  {loadingDetail ? (
                    <div className="flex items-center justify-center p-12">
                      <p className="text-muted-foreground">Đang tải thông tin...</p>
                    </div>
                  ) : employeeDetailData ? (
                    <div className="p-6 space-y-6">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                            style={{
                              backgroundColor: `hsl(${(employeeDetailData.fullName?.charCodeAt(0) || 0) * 137.508 % 360}, 70%, 50%)`
                            }}
                          >
                            {employeeDetailData.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{employeeDetailData.name}</h2>
                            <p className="text-muted-foreground">
                              {employeeDetailData.positionName || 'Chưa có chức vụ'}
                              {employeeDetailData.departmentName && ` • ${employeeDetailData.departmentName}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button2 variant="outline" size="sm" onClick={handleManageAccount}>
                            {hasUserAccount ? (
                              <>
                                <UserCog className="h-4 w-4 mr-2" />
                                Tài khoản
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Thêm tài khoản
                              </>
                            )}
                          </Button2>
                          {hasUserRole ? (
                            <Button2
                              variant="outline"
                              size="sm"
                              onClick={handleManageRole}
                              disabled={!hasUserAccount}
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Vai trò
                            </Button2>
                          ) : (
                            <>
                            </>
                          )}
                          <Button2 variant="ghost" size="sm" onClick={handleCloseDetail}>
                            <X className="h-4 w-4" />
                          </Button2>
                        </div>
                      </div>

                      {/* Action Buttons */}


                      {/* Info Grid */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <span>{employeeDetailData.employeeCode || employeeDetailData.code}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {employeeDetailData.startDate
                              ? new Date(employeeDetailData.startDate).toLocaleDateString('vi-VN')
                              : 'Chưa có ngày vào làm'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{userDetailData?.email || employeeDetailData.email || 'Chưa có email'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{userDetailData?.phone || employeeDetailData.phone || 'Chưa có SĐT'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {[employeeDetailData.wardName, employeeDetailData.provinceCityName]
                              .filter(Boolean)
                              .join(', ') || 'Chưa cập nhật địa chỉ'}
                          </span>
                        </div>
                        {hasUserAccount && userDetailData && (
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span className="flex items-center gap-2">
                              Tài khoản:
                              <Badge variant="outline">{userDetailData.username}</Badge>
                              <Badge variant={userDetailData.status === 'Active' ? 'default' : 'destructive'}>
                                {userDetailData.status}
                              </Badge>
                              {/* {hasUserRole && userRole && (
                                <Badge variant="secondary">{userRole.roleName || 'N/A'}</Badge>
                              )} */}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Tabs */}
                      <Tabs value={mainTab} onValueChange={setMainTab}>
                        <TabsList
                          className="grid w-full"
                          style={{
                            gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto',
                          }}
                        >
                          <TabsTrigger value="info">Hồ sơ & Quyết định</TabsTrigger>
                          <TabsTrigger value="benefit">Chế độ & Phúc lợi</TabsTrigger>
                          <TabsTrigger value="salary-review">Lương & KPI</TabsTrigger>
                          <TabsTrigger value="skill">Đào tạo, bồi dưỡng</TabsTrigger>
                          <TabsTrigger value="business">Nghỉ phép & Công tác</TabsTrigger>
                          <TabsTrigger value="/">Khác</TabsTrigger>
                        </TabsList>
                      </Tabs>

                      <div className="mt-6">
                        {/* Sub Navigation Pills - Thông tin */}
                        {mainTab === 'info' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'info' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('info')}
                                className={subTab === 'info' ? '' : 'hover:bg-background'}
                              >
                                Sơ yếu lý lịch
                              </Button2>
                              <div className="relative">
                                <Button2
                                  variant={subTab === 'decision' ? 'default' : 'ghost'}
                                  size="sm"
                                  onClick={() => {
                                    setSubTab('decision');
                                    setIsDecisionDropdownOpen(!isDecisionDropdownOpen);
                                  }}
                                  className={subTab === 'decision' ? '' : 'hover:bg-background'}
                                >
                                  Quyết định
                                  <ChevronDown
                                    className={clsx(
                                      'h-4 w-4 ml-1 transition-transform',
                                      isDecisionDropdownOpen && 'rotate-180'
                                    )}
                                  />
                                </Button2>

                                {/* Dropdown menu */}
                                {subTab === 'decision' && isDecisionDropdownOpen && (
                                  <div className="absolute left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                                    <button
                                      onClick={() => {
                                        setDecisionType('all');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'all'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Tất cả quyết định
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('reward');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'reward'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Khen thưởng
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('discipline');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'discipline'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Kỷ luật
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('appointment');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'appointment'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Bổ nhiệm
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('dismissal');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'dismissal'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Miễn nhiệm
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('transfer');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'transfer'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Điều chuyển công tác
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('salary-adjustment');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'salary-adjustment'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Điều chỉnh lương
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('suspend-terminate');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'suspend-terminate'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Chấm dứt hợp đồng
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDecisionType('renew-extend');
                                        setIsDecisionDropdownOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full px-4 py-2 text-sm text-left transition-colors',
                                        decisionType === 'renew-extend'
                                          ? 'bg-green-100 text-green-600 font-medium'
                                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                      )}
                                    >
                                      Gia hạn/Tái ký hợp đồng
                                    </button>
                                  </div>
                                )}
                              </div>
                              <Button2
                                variant={subTab === 'degree' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('degree')}
                                className={subTab === 'degree' ? '' : 'hover:bg-background'}
                              >
                                Bằng cấp
                              </Button2>
                              <Button2
                                variant={subTab === 'contracts' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('contracts')}
                                className={subTab === 'contracts' ? '' : 'hover:bg-background'}
                              >
                                Hợp đồng
                              </Button2>
                              <Button2
                                variant={subTab === 'medical' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('medical')}
                                className={subTab === 'medical' ? '' : 'hover:bg-background'}
                              >
                                Y tế
                              </Button2>
                              <Button2
                                variant={subTab === 'profile' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('profile')}
                                className={subTab === 'profile' ? '' : 'hover:bg-background'}
                              >
                                Hồ sơ khác
                              </Button2>
                              <Button2
                                variant={subTab === 'family' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('family')}
                                className={subTab === 'family' ? '' : 'hover:bg-background'}
                              >
                                Quan hệ gia đình
                              </Button2>
                            </div>

                            {/* Content */}
                            <div>
                              {subTab === 'info' && (
                                <InfoTab
                                  userData={employeeDetailData}
                                  employeeId={selectedEmployeeId}
                                />
                              )}
                              {subTab === 'decision' && (
                                <div className="space-y-4">
                                  {decisionType === 'all' && (
                                    <AllDecisionsTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                  {decisionType === 'reward' && (
                                    <RewardTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                  {decisionType === 'discipline' && (
                                    <DisciplineTab
                                      userData={employeeDetailData}
                                      employeeId={Number(selectedEmployeeId)}
                                    />
                                  )}
                                  {decisionType === 'appointment' && (
                                    <AppointmentTab employeeId={Number(selectedEmployeeId)} userData={employeeDetailData} />
                                  )}
                                  {decisionType === 'dismissal' && (
                                    <DismissalTab employeeId={Number(selectedEmployeeId)} userData={employeeDetailData} />
                                  )}
                                  {decisionType === 'transfer' && (
                                    <TransferTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                  {decisionType === 'salary-adjustment' && (
                                    <SalaryAdjustmentTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                  {decisionType === 'suspend-terminate' && (
                                    <TerminationTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                  {decisionType === 'renew-extend' && (
                                    <ExtensionTab
                                      employeeId={Number(selectedEmployeeId)}
                                      userData={employeeDetailData}
                                    />
                                  )}
                                </div>
                              )}
                              {subTab === 'degree' && (
                                <DegreeTab
                                  userData={employeeDetailData}
                                  employeeId={Number(selectedEmployeeId)}
                                />
                              )}
                              {subTab === 'contracts' && (
                                <ContractsTab employeeId={Number(selectedEmployeeId)} />
                              )}
                              {subTab === 'medical' && (
                                <div className="space-y-4">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className="w-fit">
                                        {medicalType === 'record' && 'Hồ sơ y tế'}
                                        {medicalType === 'accident' && 'Tai nạn LĐ & BNN'}
                                        <span className="ml-2">▼</span>
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-64 p-2">
                                      <div className="flex flex-col gap-1">
                                        <Button
                                          variant={medicalType === 'record' ? 'primary' : 'ghost'}
                                          className="justify-start"
                                          onClick={() => setMedicalType('record')}
                                        >
                                          Hồ sơ y tế
                                        </Button>
                                        <Button
                                          variant={medicalType === 'accident' ? 'primary' : 'ghost'}
                                          className="justify-start"
                                          onClick={() => setMedicalType('accident')}
                                        >
                                          Tai nạn LĐ & BNN
                                        </Button>
                                      </div>
                                    </PopoverContent>
                                  </Popover>

                                  {medicalType === 'record' && (
                                    <MedicalTab userData={employeeDetailData} />
                                  )}
                                </div>
                              )}
                              {subTab === 'profile' && (
                                <EmployeeDocumentsTab
                                  userData={employeeDetailData}
                                  employeeId={Number(selectedEmployeeId)}
                                />
                              )}
                              {subTab === 'family' && (
                                <FamilyTab
                                  employeeId={selectedEmployeeId}
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Nghiệp vụ */}
                        {mainTab === 'business' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'leaves' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('leaves')}
                                className={subTab === 'leaves' ? '' : 'hover:bg-background'}
                              >
                                Nghỉ phép
                              </Button2>
                              <Button2
                                variant={subTab === 'workSchedule' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('workSchedule')}
                                className={subTab === 'workSchedule' ? '' : 'hover:bg-background'}
                              >
                                Lịch công tác
                              </Button2>
                              <Button2
                                variant={subTab === 'abroad' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('abroad')}
                                className={subTab === 'abroad' ? '' : 'hover:bg-background'}
                              >
                                Xuất cảnh
                              </Button2>
                            </div>

                            {/* Content */}
                            <div>
                              {subTab === 'workSchedule' &&
                                <WorkScheduleTab
                                  employeeId={selectedEmployeeId}
                                />
                              }
                              {subTab === 'leaves' && (
                                <LeavesTab userData={employeeDetailData} />
                              )}
                              {subTab === 'abroad' &&  (
                                <OverseasTab 
                                  userData={employeeDetailData}
                                  employeeId={selectedEmployeeId}                                  
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Chuyên môn */}
                        {mainTab === 'skill' && (
                          <div className="space-y-4">

                            {/* Content */}
                            <div>
                              {subTab === 'training' && (
                                <TrainingTab userData={employeeDetailData} />
                              )}

                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Chế độ */}
                        {mainTab === 'benefit' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'insurance' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('insurance')}
                                className={subTab === 'insurance' ? '' : 'hover:bg-background'}
                              >
                                Bảo hiểm xã hội
                              </Button2>
                              <Button2
                                variant={subTab === 'visit' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('visit')}
                                className={subTab === 'visit' ? '' : 'hover:bg-background'}
                              >
                                Thăm nhân
                              </Button2>
                            </div>

                            {/* Content */}
                            <div>
                              {subTab === 'insurance' && (
                                <InsuranceTab
                                  userData={userDetailData}
                                  employeeId={selectedEmployeeId}
                                />
                              )}
                              {subTab === 'visit' && (
                                <EmployeeFamilyVisitTab
                                  employeeId={selectedEmployeeId}
                                />
                              )}
                            </div>
                            {/* <div>
                              {subTab === 'insurance' && <div>Nội dung Bảo hiểm</div>}
                              {subTab === 'medical' && (
                                <MedicalTab userData={employeeDetailData} />
                              )}
                            </div> */}
                          </div>
                        )}

                        {mainTab === 'salary-review' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'salary' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('salary')}
                                className={subTab === 'salary' ? '' : 'hover:bg-background'}
                              >
                                Lương
                              </Button2>
                              <Button2
                                variant={subTab === 'kpi' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('kpi')}
                                className={subTab === 'kpi' ? '' : 'hover:bg-background'}
                              >
                                KPI
                              </Button2>
                            </div>

                            {/* Content */}
                            <div>
                              {subTab === 'salary' && (
                                <SalaryTabWithDragDrop employee={employeeDetailData} />
                              )}
                              {subTab === 'kpi' && (
                                <KpiTab userData={employeeDetailData} />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-12">
                      <p className="text-muted-foreground">Không tìm thấy thông tin nhân viên</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên đăng nhập, email, họ tên"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleOpenCreateUserModal} className="bg-green-500 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài khoản
              </Button>
            </div>
          </Card>

          <Card>
            <UserTable
              users={filteredUsers}
              onEdit={handleOpenEditUserModal}
              onDelete={handleDeleteUser}
              onManageRole={handleOpenRoleModal}
              onToggleStatus={handleToggleUserStatus}
            />
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employeeId={editingEmployeeId}
        mode={modalMode}
      />

      <BulkAddEmployeeModal
        isOpen={isBulkAddModalOpen}
        onClose={() => setIsBulkAddModalOpen(false)}
      />

      <ColumnSettingsDialog />

      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userId={selectedUserId}
        mode={userModalMode}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        employeeId={Number(selectedEmployeeId)}
        existingUser={userDetailData || null}
        mode={accountModalMode}
        employeeData={employeeDetailData}
      />

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        userData={selectedUserData}
        onSuccess={() => {
          window.location.reload();
        }}
      />
      <BulkEditEmployeeModal
        isOpen={isBulkEditModalOpen}
        onClose={() => {
          setIsBulkEditModalOpen(false);
          setSelectedEmployeeIds([]);
        }}
        preSelectedEmployeeIds={selectedEmployeeIds}
      />
    </div>
  );
}