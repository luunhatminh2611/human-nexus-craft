import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Plus } from 'lucide-react';
import EmployeeTable from '@/features/employees/components/EmployeeTable';
import { employeeApi } from '../../api/employeeApi';
import EmployeeModal from '../../components/modal/EmployeeModal';
import { unitApi } from '@/features/departments/api/departmentApi';

export default function Employees() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch employees
  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.getAll,
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
        <p className="text-destructive">Lỗi: Không thể tải danh sách nhân viên</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh sách nhân viên</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin nhân viên ({filteredEmployees.length}/{employees.length})
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className='bg-green-500 text-white'>
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã nhân viên, email"
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
        </div>
      </Card>

      {/* Table */}
      <Card>
        <EmployeeTable
          employees={filteredEmployees}
          onView={(id) => navigate(`/admin/profile/${id}`)}
          onEdit={handleOpenEditModal}
          onDelete={handleDelteEmployee}
        />
      </Card>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        employeeId={selectedEmployeeId}
        mode={modalMode}
      />
    </div>
  );
}
