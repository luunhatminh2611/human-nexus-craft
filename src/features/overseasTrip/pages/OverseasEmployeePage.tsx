// pages/employee/overseas/OverseasEmployeePage.tsx

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
import { Search, Eye, ChevronLeft, ChevronRight, Plane, Plus, Edit, Trash2 } from 'lucide-react';
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
  mockOverseasTrips, 
  type OverseasTrip, 
  fundingSourceLabels,
  statusLabels 
} from '../../../mock/overseasTrip';
import OverseasViewModal from '../components/OverseasDetailModal';
import OverseasFormModal from '../components/OverseasFormModal';

// Mock user hiện tại
const CURRENT_USER_ID = 'EMP002';

export default function OverseasEmployeePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [trips, setTrips] = useState<OverseasTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<OverseasTrip | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [page, pageSize, searchTerm, statusFilter, refreshKey]);

  const fetchTrips = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Chỉ lấy chuyến đi của nhân viên hiện tại
    let filtered = mockOverseasTrips.filter(t => t.employeeId === CURRENT_USER_ID);

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.decisionNumber && t.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setTotalItems(filtered.length);

    const start = page * pageSize;
    const end = start + pageSize;
    setTrips(filtered.slice(start, end));

    setIsLoading(false);
  };

  const handleOpenFormModal = (trip?: OverseasTrip) => {
    setSelectedTrip(trip || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTrip(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenViewModal = (id: string) => {
    setSelectedTripId(id);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTripId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
    
    // TODO: Call API to delete
    console.log('Delete trip:', id);
    setRefreshKey(prev => prev + 1);
  };

  const canEdit = (trip: OverseasTrip) => {
    return trip.status === 'PENDING';
  };

  const canDelete = (trip: OverseasTrip) => {
    return trip.status === 'PENDING';
  };

  const canUpdateActualDates = (trip: OverseasTrip) => {
    return trip.status === 'APPROVED' || trip.status === 'IN_PROGRESS';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: statusLabels.PENDING, className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: statusLabels.APPROVED, className: 'bg-blue-100 text-blue-800' },
      'IN_PROGRESS': { label: statusLabels.IN_PROGRESS, className: 'bg-purple-100 text-purple-800' },
      'COMPLETED': { label: statusLabels.COMPLETED, className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: statusLabels.REJECTED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getFundingBadge = (fundingSource: string) => {
    const fundingConfig = {
      'COMPANY': { label: fundingSourceLabels.COMPANY, className: 'bg-blue-100 text-blue-800' },
      'PERSONAL': { label: fundingSourceLabels.PERSONAL, className: 'bg-gray-100 text-gray-800' },
      'PARTNER': { label: fundingSourceLabels.PARTNER, className: 'bg-purple-100 text-purple-800' },
    };

    const config = fundingConfig[fundingSource];
    if (!config) return null;

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

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // Thống kê của cá nhân
  const myTrips = mockOverseasTrips.filter(t => t.employeeId === CURRENT_USER_ID);
  const myStats = {
    total: myTrips.length,
    pending: myTrips.filter(t => t.status === 'PENDING').length,
    approved: myTrips.filter(t => t.status === 'APPROVED').length,
    inProgress: myTrips.filter(t => t.status === 'IN_PROGRESS').length,
    completed: myTrips.filter(t => t.status === 'COMPLETED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý xuất cảnh</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các chuyến xuất cảnh của bạn
          </p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Đăng ký chuyến đi
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo quốc gia, mục đích hoặc số quyết định"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="REJECTED">Từ chối</SelectItem>
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
                <TableHead>Quốc gia</TableHead>
                <TableHead>Mục đích</TableHead>
                <TableHead>Thời gian dự kiến</TableHead>
                <TableHead>Số QĐ</TableHead>
                <TableHead>Chi phí ước tính</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Plane className="h-8 w-8" />
                      <p>Bạn chưa có chuyến đi nào</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenFormModal()}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Đăng ký chuyến đi đầu tiên
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <span className="font-medium">{trip.country}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">{trip.purpose}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(trip.plannedDepartureDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">
                          đến {new Date(trip.plannedReturnDate).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {trip.decisionNumber ? (
                        <div className="text-sm">
                          <div className="font-medium">{trip.decisionNumber}</div>
                          <div className="text-muted-foreground">
                            {trip.decisionDate && new Date(trip.decisionDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Chưa có</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {formatCurrency(trip.estimatedCost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getFundingBadge(trip.fundingSource)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(trip.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        {canEdit(trip) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFormModal(trip)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenViewModal(trip.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canDelete(trip) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(trip.id)}
                            title="Xóa"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && trips.length > 0 && (
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

      <OverseasViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        tripId={selectedTripId}
      />

      <OverseasFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        trip={selectedTrip}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}