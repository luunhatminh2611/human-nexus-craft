import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Search, Eye, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import mockData from '@/mock/data';

export default function Employees() {
  const navigate = useNavigate();
  const { role, employeeId } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // State cho dialog thêm nhân viên
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employees, setEmployees] = useState(mockData.employees);
  const [departments, setDepartments] = useState(mockData.departments);

  // Form state
  const emptyForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    grade: 'Junior',
    isManager: false,
    startDate: new Date().toISOString().split('T')[0],
  };
  const [form, setForm] = useState(emptyForm);

  // Kiểm tra phòng ban đã có trưởng phòng chưa
  const canBeManager = useMemo(() => {
    if (!form.departmentId) return false;
    const dept = departments.find(d => d.id === form.departmentId);
    return !dept?.managerId; // Trả về true nếu chưa có managerId
  }, [form.departmentId, departments]);

  // Filter based on role
  const baseEmployees = useMemo(() => {
    if (role === 'Admin') {
      return employees;
    } else if (role === 'Manager') {
      return employees.filter(e => e.managerId === employeeId || e.id === employeeId);
    }
    return [];
  }, [role, employeeId, employees]);

  const filteredEmployees = baseEmployees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept === 'all' || emp.departmentId === filterDept;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddEmployee = () => {
    const { firstName, lastName, email, phone, departmentId, position, grade, isManager, startDate } = form;

    // Validation
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !departmentId || !position.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Kiểm tra email trùng
    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      alert('Email đã tồn tại');
      return;
    }

    const newEmpId = `emp${Date.now()}`;

    const newEmployee = {
      id: newEmpId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || '',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      departmentId,
      position: position.trim(),
      grade,
      status: 'Probation' as const,
      startDate,
      managerId: null,
      salary: {
        base: 0,
        allowances: {
          housing: 0,
          transport: 0,
        },
        currency: 'VND',
      },
      performance: [],
      leaves: [],
      contractType: 'Full-time' as const,
      trainingsCompleted: [],
    };

    // Thêm nhân viên mới
    setEmployees(prev => [...prev, newEmployee]);

    // Nếu là trưởng phòng, cập nhật department
    if (isManager && canBeManager) {
      setDepartments(prev =>
        prev.map(d =>
          d.id === departmentId ? { ...d, managerId: newEmpId } : d
        )
      );
    }

    // Reset form
    setForm(emptyForm);
    setIsAddDialogOpen(false);
    alert(`Đã thêm nhân viên ${firstName} ${lastName} thành công!`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Active: 'default',
      'On Leave': 'secondary',
      Resigned: 'destructive',
      Probation: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status === 'Active'
          ? 'Đang làm'
          : status === 'On Leave'
            ? 'Nghỉ phép'
            : status === 'Resigned'
              ? 'Đã nghỉ'
              : 'Thử việc'}
      </Badge>
    );
  };

  const getDeptName = (deptId: string) => {
    return departments.find((d) => d.id === deptId)?.name || deptId;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {role === 'Manager' ? 'Quản lý team' : 'Danh sách nhân viên'}
            </h1>
            <p className="text-muted-foreground">
              {role === 'Manager' ? 'Danh sách thành viên trong team' : 'Quản lý thông tin nhân viên'}
            </p>
          </div>
          {role === 'Admin' && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, chức danh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Active">Đang làm</SelectItem>
                <SelectItem value="On Leave">Nghỉ phép</SelectItem>
                <SelectItem value="Probation">Thử việc</SelectItem>
                <SelectItem value="Resigned">Đã nghỉ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức danh</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Bậc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày vào</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{emp.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>{getDeptName(emp.departmentId)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{emp.grade}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(emp.status)}</TableCell>
                  <TableCell>
                    {new Date(emp.startDate).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/profile/${emp.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredEmployees.length} / {baseEmployees.length} nhân viên
        </div>

        {/* Dialog thêm nhân viên */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm nhân viên mới</DialogTitle>
              <DialogDescription>
                Điền đầy đủ thông tin để thêm nhân viên vào hệ thống
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Họ <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="Nguyễn Văn"
                    value={form.firstName}
                    onChange={(e) => setForm(s => ({ ...s, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tên <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="A"
                    value={form.lastName}
                    onChange={(e) => setForm(s => ({ ...s, lastName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    placeholder="example@company.com"
                    value={form.email}
                    onChange={(e) => setForm(s => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Số điện thoại</Label>
                  <Input
                    placeholder="0123456789"
                    value={form.phone}
                    onChange={(e) => setForm(s => ({ ...s, phone: e.target.value }))}
                  />
                </div>
              </div>

              {/* Phòng ban */}
              <div>
                <Label>Phòng ban <span className="text-red-500">*</span></Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => {
                    setForm(s => ({
                      ...s,
                      departmentId: v,
                      position: '',
                      grade: '',
                      isManager: false,
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phòng ban" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} {dept.managerId ? '(Đã có trưởng phòng)' : '(Chưa có trưởng phòng)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chức danh và bậc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Chức danh <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.position}
                    onValueChange={(v) => {
                      setForm(s => ({ ...s, position: v, grade: '' }));
                    }}
                    disabled={!form.departmentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chức danh" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.jobTitles
                        .filter(j => j.departmentId === form.departmentId)
                        .map(j => (
                          <SelectItem key={j.id} value={j.id}>
                            {j.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Bậc <span className="text-red-500">*</span></Label>
                  <Select
                    value={form.grade}
                    onValueChange={(v) => setForm(s => ({ ...s, grade: v }))}
                    disabled={!form.position}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bậc" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockData.grades
                        .filter(g => g.jobTitleId === form.position)
                        .map(g => (
                          <SelectItem key={g.id} value={g.name}>
                            {g.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm(s => ({ ...s, startDate: e.target.value }))}
                />
              </div>

              {/* Checkbox trưởng phòng */}
              {canBeManager && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="isManager"
                    checked={form.isManager}
                    onChange={(e) => setForm(s => ({ ...s, isManager: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isManager" className="cursor-pointer">
                    Đặt làm trưởng phòng {departments.find(d => d.id === form.departmentId)?.name}
                  </Label>
                </div>
              )}

              {form.departmentId && !canBeManager && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  ℹ️ Phòng ban này đã có trưởng phòng. Nhân viên mới sẽ được thêm với vai trò nhân viên.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setForm(emptyForm);
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleAddEmployee}>
                  Thêm nhân viên
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}