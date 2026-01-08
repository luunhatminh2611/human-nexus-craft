// components/InsuranceTab.tsx

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
import { Search, Eye, Plus, Edit, FileText } from 'lucide-react';
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
import { 
  mockInsuranceRecords,
  type InsuranceRecord,
  statusLabels,
  calculateInsuranceAmount
} from '../../../mock/socialInsurance';
import InsuranceFormModal from '../../socialInsurance/components/InsuranceFormModal';
import InsuranceDetailModal from '../../socialInsurance/components/InsuranceDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface InsuranceTabProps {
  userData: any;
  employeeId: number | string;
}

export default function InsuranceTab({ userData, employeeId }: InsuranceTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [records, setRecords] = useState<InsuranceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InsuranceRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [employeeId, searchTerm, statusFilter, refreshKey]);

  const fetchRecords = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter insurance records for this specific employee
    let filtered = mockInsuranceRecords.filter(r => 
      r.employeeId === employeeId.toString()
    );

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.insuranceBookNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.insuranceCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by start date (newest first)
    filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    setRecords(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (record?: InsuranceRecord) => {
    setSelectedRecord(record || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedRecord(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedRecordId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRecordId(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { label: statusLabels.ACTIVE, className: 'bg-green-100 text-green-800' },
      'SUSPENDED': { label: statusLabels.SUSPENDED, className: 'bg-yellow-100 text-yellow-800' },
      'TERMINATED': { label: statusLabels.TERMINATED, className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      {records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Tổng số hồ sơ</div>
            <div className="text-2xl font-bold">{records.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Đang tham gia</div>
            <div className="text-2xl font-bold text-green-600">
              {records.filter(r => r.status === 'ACTIVE').length}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Tổng tháng đóng</div>
            <div className="text-2xl font-bold text-blue-600">
              {records.reduce((sum, r) => sum + r.totalMonthsPaid, 0)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Lương đóng hiện tại</div>
            <div className="text-lg font-bold text-purple-600">
              {records[0] && formatCurrency(records[0].currentSalaryBase)}
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo số sổ BHXH hoặc mã số BHXH"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang tham gia</SelectItem>
              <SelectItem value="SUSPENDED">Tạm dừng</SelectItem>
              <SelectItem value="TERMINATED">Đã dừng</SelectItem>
            </SelectContent>
          </Select>

          {isAdmin && (
            <Button onClick={() => handleOpenFormModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm hồ sơ BHXH
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Số sổ / Mã số</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Lương đóng</TableHead>
                <TableHead>Tháng đã đóng</TableHead>
                <TableHead>NV phải đóng</TableHead>
                <TableHead>Công ty phải đóng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Nhân viên này chưa có hồ sơ BHXH nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => {
                  const amounts = calculateInsuranceAmount(record.currentSalaryBase);
                  const employeeTotal = amounts.socialInsurance.employee + 
                                      amounts.healthInsurance.employee + 
                                      amounts.unemploymentInsurance.employee;
                  const employerTotal = amounts.socialInsurance.employer + 
                                       amounts.healthInsurance.employer + 
                                       amounts.unemploymentInsurance.employer;
                  
                  return (
                    <TableRow key={record.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{record.insuranceBookNumber}</div>
                          <div className="text-muted-foreground">{record.insuranceCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(record.startDate).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {record.endDate ? (
                          <span className="text-sm">
                            {new Date(record.endDate).toLocaleDateString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Đang tham gia</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {formatCurrency(record.currentSalaryBase)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{record.totalMonthsPaid} tháng</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-orange-600 font-medium">
                          {formatCurrency(employeeTotal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-blue-600 font-medium">
                          {formatCurrency(employerTotal)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {isAdmin && record.status !== 'TERMINATED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(record)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(record.id)}
                            title="Xem chi tiết"
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

      {/* Modals */}
      <InsuranceFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        record={selectedRecord}
        onSuccess={handleFormSuccess}
      />

      <InsuranceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        recordId={selectedRecordId}
      />
    </div>
  );
}