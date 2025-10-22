import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Search } from 'lucide-react';
import mockData from '@/mock/data';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/badge';

export default function ManagerSafetyDistribution() {
  const navigate = useNavigate();
  const { employeeId } = useAuthStore(); // ID của Manager hiện tại
  const [searchTerm, setSearchTerm] = useState('');

  const manager = mockData.employees.find((e) => e.id === employeeId);

  // Lấy danh sách nhân viên thuộc quyền quản lý
  const managedEmployees = useMemo(
    () => mockData.employees.filter((e) => e.managerId === manager?.id),
    [manager]
  );

  const issuedItems = mockData.issuedSafetyItems || [];
  const replacementRequests = mockData.safetyReplacementRequests || [];

  // Lọc nhân viên theo tìm kiếm
  const filteredEmployees = managedEmployees.filter((emp) => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  // Thống kê số vật tư theo trạng thái
  const getItemStats = (empId) => {
    const items = issuedItems.filter((i) => i.employeeId === empId);
    return {
      inUse: items.filter((i) => i.status === 'In Use').length,
      expiring: items.filter((i) => i.status === 'Expiring Soon').length,
      expired: items.filter((i) => i.status === 'Expired').length,
    };
  };

  // Số yêu cầu đổi của nhân viên
  const getReplacementCount = (empId) =>
    replacementRequests.filter(
      (r) => r.employeeId === empId && r.status === 'Pending'
    ).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Tiêu đề */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Danh sách nhân viên</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý vật tư bảo hộ của từng nhân viên trong phòng ban của bạn
            </p>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <Card className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Bảng danh sách nhân viên */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Sắp hết hạn</TableHead>
                <TableHead>Đã hết hạn</TableHead>
                <TableHead>Yêu cầu đổi</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredEmployees.map((emp) => {
                const deptName =
                  mockData.departments.find((d) => d.id === emp.departmentId)?.name || '-';
                const stats = getItemStats(emp.id);
                const replacementCount = getReplacementCount(emp.id);

                return (
                  <TableRow key={emp.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{deptName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{stats.expiring}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{stats.expired}</Badge>
                    </TableCell>
                    <TableCell>
                      {replacementCount > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-700 border-blue-300 cursor-pointer hover:bg-blue-200"
                          onClick={() => navigate(`/manager/replacements/${emp.id}`)}
                        >
                          {replacementCount} yêu cầu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          0
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/manager/safety/${emp.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Không tìm thấy nhân viên nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <div className="text-sm text-muted-foreground">
          Hiển thị {filteredEmployees.length} / {managedEmployees.length} nhân viên
        </div>
      </div>
    </Layout>
  );
}
