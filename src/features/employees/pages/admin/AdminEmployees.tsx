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
  Trash2
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

export default function Employees() {
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Employee selection for detail view
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

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
    if (mainTab === 'business') setSubTab('contracts');
    if (mainTab === 'skill') setSubTab('training');
    if (mainTab === 'benefit') setSubTab('salary');
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
      const ids = filteredEmployees.map((e) => e.id);
      const res = await employeeApi.exportExcel(ids);

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employees.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Xuất file thất bại');
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedEmployeeId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
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
          <div>
            <h1 className="text-3xl font-bold">Quản lý nhân viên</h1>
            <p className="text-muted-foreground">
              {activeTab === 'employees'
                ? `Quản lý thông tin nhân viên (${filteredEmployees.length}/${employees.length})`
                : `Quản lý tài khoản người dùng (${filteredUsers.length}/${users.length})`
              }
            </p>
          </div>

          <TabsList>
            <TabsTrigger value="employees">Danh sách nhân viên</TabsTrigger>
            <TabsTrigger value="users">Danh sách tài khoản</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="employees" className="space-y-4 mt-6">
          <div className={`grid gap-4 transition-all duration-300 ${selectedEmployeeId ? 'grid-cols-12' : 'grid-cols-1'}`}>

            <div className={selectedEmployeeId ? 'col-span-4' : 'col-span-12'}>
              <Card className="p-4 mb-4">
                <div className={selectedEmployeeId ? "space-y-3" : "flex flex-col md:flex-row gap-4"}>
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={selectedEmployeeId ? "Tìm kiếm nhân viên..." : "Tìm kiếm theo mã nhân viên, tên nhân viên, email"}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className={selectedEmployeeId ? "flex-1" : "w-full md:w-48"}>
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

                  {selectedEmployeeId ? (
                    <div className="flex gap-2">
                      {/* <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1">
                        <Upload className="h-4 w-4" />
                        Import Excel
                      </Button> */}
                      <Button variant="outline" size="sm" onClick={handleExportExcel} className="flex-1">
                        <Download className="h-4 w-4" />
                        Export Excel
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Excel
                      </Button> */}
                      <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                      </Button>
                    </>
                  )}

                  <div className='flex gap-2'>
                    <Button
                      onClick={handleOpenCreateModal}
                      className={selectedEmployeeId ? "w-full bg-green-500 hover:bg-green-600 text-white" : "bg-green-500 text-white"}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm nhân viên
                    </Button>
                    <Button
                      onClick={() => setIsBulkEditModalOpen(true)}
                      className={selectedEmployeeId ? "w-full bg-green-500 hover:bg-green-600 text-white" : "bg-green-500 text-white"}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      Sửa hàng loạt
                    </Button>
                  </div>
                </div>
              </Card>

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
                    <thead className="bg-white sticky top-0 z-10">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Nhân viên</th>
                        {!selectedEmployeeId && (
                          <>
                            <th className="text-left p-3 text-sm font-semibold">Chức vụ</th>
                            <th className="text-left p-3 text-sm font-semibold">Ngày vào làm</th>
                            <th className="text-left p-3 text-sm font-semibold">Tài khoản</th>
                            <th className="text-center p-3 text-sm font-semibold">Thao tác</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          onClick={() => handleRowClick(employee.id)}
                          className={`border-b cursor-pointer hover:bg-muted/50 transition-colors ${selectedEmployeeId === employee.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                            }`}
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {employee.fullName?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{employee.fullName}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {employee.employeeCode}
                                </p>
                              </div>
                            </div>
                          </td>
                          {!selectedEmployeeId && (
                            <>
                              <td className="p-3">
                                <p className="text-sm">{employee.positionName || '-'}</p>
                                <p className="text-xs text-muted-foreground">{employee.departmentName || '-'}</p>
                              </td>
                              <td className="p-3">
                                <p className="text-sm">{employee.startDate || '-'}</p>
                              </td>
                              <td className="p-3">
                                {employee.email ? (
                                  <Badge variant="default" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Đã tạo TK
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="text-xs">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Chưa có TK
                                  </Badge>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-1 justify-center">
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
                        <TabsList className="grid grid-cols-4 w-full">
                          <TabsTrigger value="info">Thông tin</TabsTrigger>
                          <TabsTrigger value="business">Nghiệp vụ</TabsTrigger>
                          <TabsTrigger value="skill">Chuyên môn</TabsTrigger>
                          <TabsTrigger value="benefit">Chế độ</TabsTrigger>
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
                                Thông tin nhân sự
                              </Button2>
                              <Button2
                                variant={subTab === 'family' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('family')}
                                className={subTab === 'family' ? '' : 'hover:bg-background'}
                              >
                                Quan hệ gia đình
                              </Button2>
                              <Button2
                                variant={subTab === 'profile' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('profile')}
                                className={subTab === 'profile' ? '' : 'hover:bg-background'}
                              >
                                Hồ sơ
                              </Button2>
                              <Button2
                                variant={subTab === 'other' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('other')}
                                className={subTab === 'other' ? '' : 'hover:bg-background'}
                              >
                                Khác
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
                              {subTab === 'family' && <div>Nội dung Quan hệ gia đình</div>}
                              {subTab === 'profile' && <div>Nội dung Hồ sơ</div>}
                              {subTab === 'other' && <div>Nội dung Khác</div>}
                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Nghiệp vụ */}
                        {mainTab === 'business' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'decision' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('decision')}
                                className={subTab === 'decision' ? '' : 'hover:bg-background'}
                              >
                                Quyết định
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
                                variant={subTab === 'leaves' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('leaves')}
                                className={subTab === 'leaves' ? '' : 'hover:bg-background'}
                              >
                                Nghỉ phép
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
                              {subTab === 'decision' && <div>Nội dung Quyết định</div>}
                              {subTab === 'contracts' && <ContractsTab />}
                              {subTab === 'leaves' && (
                                <LeavesTab userData={employeeDetailData} />
                              )}
                              {subTab === 'abroad' && <div>Nội dung Xuất cảnh</div>}
                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Chuyên môn */}
                        {mainTab === 'skill' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                              <Button2
                                variant={subTab === 'degree' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('degree')}
                                className={subTab === 'degree' ? '' : 'hover:bg-background'}
                              >
                                Bằng cấp
                              </Button2>
                              <Button2
                                variant={subTab === 'training' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('training')}
                                className={subTab === 'training' ? '' : 'hover:bg-background'}
                              >
                                Đào tạo
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
                              {subTab === 'degree' && <div>Nội dung Bằng cấp</div>}
                              {subTab === 'training' && (
                                <TrainingTab userData={employeeDetailData} />
                              )}
                              {subTab === 'kpi' && (
                                <KpiTab userData={employeeDetailData} />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Sub Navigation Pills - Chế độ */}
                        {mainTab === 'benefit' && (
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
                                variant={subTab === 'insurance' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('insurance')}
                                className={subTab === 'insurance' ? '' : 'hover:bg-background'}
                              >
                                Bảo hiểm
                              </Button2>
                              <Button2
                                variant={subTab === 'medical' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setSubTab('medical')}
                                className={subTab === 'medical' ? '' : 'hover:bg-background'}
                              >
                                Y tế
                              </Button2>
                            </div>

                            {/* Content */}
                            <div>
                              {subTab === 'salary' && (
                                <SalaryTabWithDragDrop employee={employeeDetailData} />
                              )}
                              {subTab === 'insurance' && <div>Nội dung Bảo hiểm</div>}
                              {subTab === 'medical' && (
                                <MedicalTab userData={employeeDetailData} />
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
        employeeId={null}
        mode={modalMode}
      />

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
        onClose={() => setIsBulkEditModalOpen(false)}
      />
    </div>
  );
}