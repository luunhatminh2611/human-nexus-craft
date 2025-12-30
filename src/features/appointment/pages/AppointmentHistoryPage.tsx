// pages/hr/appointment/EmployeeHistoryPage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Plus, Eye, History, UserCheck, Ban } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { mockEmployeeHistory, type EmployeeCareerTimeline } from '../../../mock/mockAppointmentHistory';
import EmployeeHistoryDetailModal from '../components/AppointmentHistoryModal';
import AddHistoryRecordModal from '../components/AddHistoryRecord';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function EmployeeHistoryPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [employees, setEmployees] = useState<EmployeeCareerTimeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, typeFilter, refreshKey]);

  const fetchEmployees = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockEmployeeHistory];

    if (searchTerm) {
      filtered = filtered.filter(e =>
        e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.currentPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.currentDepartment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo loại record
    if (typeFilter !== 'ALL') {
      filtered = filtered.map(e => ({
        ...e,
        history: e.history.filter(h => h.type === typeFilter)
      })).filter(e => e.history.length > 0);
    }

    setEmployees(filtered);
    setIsLoading(false);
  };

  const handleOpenDetailModal = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEmployeeId(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    if (type === 'APPOINTMENT') {
      return <Badge className="bg-blue-100 text-blue-800">Bổ nhiệm</Badge>;
    }
    return <Badge className="bg-red-100 text-red-800">Miễn nhiệm</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử Bổ nhiệm & Miễn nhiệm</h1>
          <p className="text-muted-foreground">
            Xem và quản lý lịch sử bổ nhiệm, miễn nhiệm của tất cả nhân viên
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenAddModal}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm bản ghi lịch sử
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, chức vụ hoặc phòng ban"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại bản ghi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="APPOINTMENT">Bổ nhiệm</SelectItem>
              <SelectItem value="TERMINATION">Miễn nhiệm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Chức vụ hiện tại</TableHead>
                <TableHead>Số bản ghi</TableHead>
                <TableHead>Lần bổ nhiệm gần nhất</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <History className="h-8 w-8" />
                      <p>Không tìm thấy lịch sử nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee) => {
                  const latestRecord = employee.history[employee.history.length - 1];
                  const appointmentCount = employee.history.filter(h => h.type === 'APPOINTMENT').length;
                  const terminationCount = employee.history.filter(h => h.type === 'TERMINATION').length;

                  return (
                    <TableRow key={employee.employeeId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            Mã NV: {employee.employeeId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.currentPosition ? (
                          <div>
                            <p className="font-medium">{employee.currentPosition}</p>
                            <p className="text-sm text-muted-foreground">
                              {employee.currentDepartment}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Không giữ chức vụ
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-blue-600">
                              {appointmentCount} bổ nhiệm
                            </Badge>
                          </div>
                          {terminationCount > 0 && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-red-600">
                                {terminationCount} miễn nhiệm
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(latestRecord.type)}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {new Date(latestRecord.decisionDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.currentPosition ? (
                          <Badge className="bg-green-100 text-green-800">
                            Đang giữ chức
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            Không giữ chức
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(employee.employeeId)}
                            title="Xem chi tiết lịch sử"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EmployeeHistoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        employeeId={selectedEmployeeId}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <AddHistoryRecordModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}