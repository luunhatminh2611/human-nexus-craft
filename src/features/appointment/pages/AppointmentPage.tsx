// pages/hr/appointment/AppointmentPage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plus, Edit, UserCheck, AlertCircle } from 'lucide-react';
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
  mockAppointments, 
  type Appointment, 
  calculateAppointmentStatistics,
  statusLabels,
  appointmentTypeLabels
} from '../../../mock/appointment';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import AppointmentFormModal from '../components/AppointmentFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';

export default function AppointmentPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [page, pageSize, searchTerm, statusFilter, typeFilter, refreshKey, isAdmin]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockAppointments];

    // Nếu không phải admin, chỉ xem quyết định của chính mình
    if (!isAdmin && user?.id) {
      filtered = filtered.filter(a => a.employeeId === user.id && a.status !== 'DRAFT');
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.appointmentType === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.newPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.newDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setAppointments(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (appointment?: Appointment) => {
    setSelectedAppointment(appointment || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedAppointmentId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAppointmentId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseDetailModal();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PUBLISHED': { label: statusLabels.PUBLISHED, className: 'bg-blue-100 text-blue-800' },
      'PENDING_EFFECTIVE': { label: statusLabels.PENDING_EFFECTIVE, className: 'bg-yellow-100 text-yellow-800' },
      'IN_EFFECT': { label: statusLabels.IN_EFFECT, className: 'bg-green-100 text-green-800' },
      'EXPIRING_SOON': { label: statusLabels.EXPIRING_SOON, className: 'bg-orange-100 text-orange-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-red-100 text-red-800' },
      'REVOKED': { label: statusLabels.REVOKED, className: 'bg-red-100 text-red-800' },
      'TERMINATED': { label: statusLabels.TERMINATED, className: 'bg-orange-100 text-orange-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'NEW': { label: appointmentTypeLabels.NEW, className: 'bg-blue-100 text-blue-800' },
      'REAPPOINTMENT': { label: appointmentTypeLabels.REAPPOINTMENT, className: 'bg-purple-100 text-purple-800' },
      'CONCURRENT': { label: appointmentTypeLabels.CONCURRENT, className: 'bg-indigo-100 text-indigo-800' },
    };

    const config = typeConfig[type];
    return config ? <Badge className={config.className}>{config.label}</Badge> : null;
  };

  const stats = calculateAppointmentStatistics(mockAppointments);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý bổ nhiệm' : 'Quyết định bổ nhiệm của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Tạo và quản lý quyết định bổ nhiệm nhân sự' 
              : 'Xem các quyết định bổ nhiệm liên quan đến bạn'}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo quyết định bổ nhiệm
          </Button>
        )}
      </div>

      {!isAdmin && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Bạn chỉ có thể xem các quyết định bổ nhiệm đã được ban hành liên quan đến bạn.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, chức vụ, phòng ban hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại bổ nhiệm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="NEW">Bổ nhiệm mới</SelectItem>
              <SelectItem value="REAPPOINTMENT">Bổ nhiệm lại</SelectItem>
              <SelectItem value="CONCURRENT">Kiêm nhiệm</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {isAdmin && <SelectItem value="DRAFT">Bản nháp</SelectItem>}
              <SelectItem value="PUBLISHED">Đã ban hành</SelectItem>
              <SelectItem value="PENDING_EFFECTIVE">Chờ có hiệu lực</SelectItem>
              <SelectItem value="IN_EFFECT">Đang có hiệu lực</SelectItem>
              <SelectItem value="EXPIRING_SOON">Sắp hết hạn</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn</SelectItem>
              <SelectItem value="REVOKED">Đã hủy bỏ</SelectItem>
              <SelectItem value="TERMINATED">Đã miễn nhiệm</SelectItem>
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
                <TableHead>Chức vụ mới</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Ngày ban hành</TableHead>
                <TableHead>Ngày có hiệu lực</TableHead>
                <TableHead>Thời hạn</TableHead>
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
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserCheck className="h-8 w-8" />
                      <p>Không tìm thấy quyết định bổ nhiệm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{appointment.currentDepartment}</p>
                        <p className="text-xs text-muted-foreground">{appointment.currentPosition}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{appointment.newPosition}</p>
                        <p className="text-sm text-muted-foreground">{appointment.newDepartment}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(appointment.appointmentType)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{appointment.decisionNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(appointment.decisionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(appointment.effectiveDate).toLocaleDateString('vi-VN')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {appointment.termMonths ? (
                          <>
                            <div>{appointment.termMonths} tháng</div>
                            {appointment.expiryDate && (
                              <div className="text-muted-foreground text-xs">
                                đến {new Date(appointment.expiryDate).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Vô thời hạn</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(appointment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {isAdmin && appointment.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(appointment)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(appointment.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && appointments.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 text-sm">
                  Trang {page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {isAdmin && (
        <AppointmentFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          appointment={selectedAppointment}
          onSuccess={handleFormSuccess}
        />
      )}

      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        appointmentId={selectedAppointmentId}
        onSuccess={handleDetailSuccess}
        isAdmin={isAdmin}
      />
    </div>
  );
}