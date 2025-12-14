import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Plus } from 'lucide-react';
import EmployeeTable from '@/features/employees/components/EmployeeTable';
import UserTable from '@/features/employees/components/UserTable';
import { employeeApi } from '../../api/employeeApi';
import { userApi } from '../../api/userApi';
import EmployeeModal from '../../components/modal/EmployeeModal';
import UserAccountModal from '../../components/modal/UserAccountModal';
import RoleModal from '../../../auth/components/RoleModal';
import { unitApi } from '@/features/departments/api/departmentApi';

export default function Employees() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // User modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');

  // Role modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  // Fetch employees
  const { data: employees = [], isLoading: isLoadingEmployees, error: employeesError } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
  });

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
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

  const filteredEmployees = useMemo(() => {
    const result = employees.filter((emp) => {
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

    return result;
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

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedEmployeeId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (id: number) => {
    setModalMode('edit');
    setSelectedEmployeeId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleDelteEmployee = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa nhân viên này không?')) {
      try {
        await employeeApi.delete(id);
        alert('Xóa nhân viên thành công');
      } catch (error) {
        alert('Lỗi khi xóa nhân viên');
      }
    }
  };

  // User modal handlers
  const handleOpenCreateUserModal = () => {
    setUserModalMode('create');
    setSelectedUserId(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUserModal = (id: number) => {
    setUserModalMode('edit');
    setSelectedUserId(id);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này không?')) {
      try {
        // await userApi.delete(id);
        alert('Xóa tài khoản thành công');
      } catch (error) {
        alert('Lỗi khi xóa tài khoản');
      }
    }
  };

  const handleToggleUserStatus = async (user: any) => {
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

  // Role modal handlers
  const handleOpenRoleModal = (user: any) => {
    // Thêm userId để RoleModal có thể sử dụng
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
        {/* Header with Tabs on Same Row */}
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
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã nhân viên, tên nhân viên, email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={filterDepartment}
                onValueChange={(v) => {
                  setFilterDepartment(v);
                }}
              >
                <SelectTrigger className="w-full md:w-48">
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

              <Button onClick={handleOpenCreateModal} className='bg-green-500 text-white'>
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhân viên
              </Button>
            </div>
          </Card>

          {/* Employee Table */}
          <Card>
            <EmployeeTable
              employees={filteredEmployees}
              onView={(id) => navigate(`/admin/profile/${id}`)}
              onEdit={handleOpenEditModal}
              onDelete={handleDelteEmployee}
            />
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4 mt-6">
          {/* Search for Users */}
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
              
              <Button onClick={handleOpenCreateUserModal} className='bg-green-500 text-white'>
                <Plus className="h-4 w-4 mr-2" />
                Thêm tài khoản
              </Button>
            </div>
          </Card>

          {/* Users Table */}
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

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employeeId={selectedEmployeeId}
        mode={modalMode}
      />

      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        userId={selectedUserId}
        mode={userModalMode}
      />

      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        userData={selectedUserData}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}