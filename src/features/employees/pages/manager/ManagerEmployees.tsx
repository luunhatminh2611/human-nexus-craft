import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/shared/components/layouts/Layout';
import Button from '@/shared/components/ui/button/Button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import mockData from '@/mock/data';

export default function ManagerEmployees() {
  const navigate = useNavigate();
  const { employeeId } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Manager sees only their team
  const baseEmployees = useMemo(() => {
    return mockData.employees.filter(e => e.managerId === employeeId || e.id === employeeId);
  }, [employeeId]);

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
    return mockData.departments.find((d) => d.id === deptId)?.name || deptId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý team</h1>
          <p className="text-muted-foreground">Danh sách thành viên trong team</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, email, chức vụ..."
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
              {mockData.departments.map((dept) => (
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
              <TableHead>Chức vụ</TableHead>
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
                    onClick={() => navigate(`/manager/profile/${emp.id}`)}
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
        Hiển thị {filteredEmployees.length} / {baseEmployees.length} thành viên
      </div>
    </div>
  );
}
