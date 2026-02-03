// pages/hr/overseas/OverseasHRPage.tsx

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { 
  mockOverseasTrips, 
  type OverseasTrip, 
  calculateOverseasStatistics,
  fundingSourceLabels,
} from '../../../mock/overseasTrip';
import OverseasDetailModal from '../components/OverseasDetailModal';
import OverseasFormModal from '../components/OverseasFormModal';

export default function OverseasHRPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [fundingFilter, setFundingFilter] = useState<string>('ALL');
  const [trips, setTrips] = useState<OverseasTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<OverseasTrip | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<OverseasTrip | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [page, pageSize, searchTerm, yearFilter, departmentFilter, fundingFilter, refreshKey]);

  const fetchTrips = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockOverseasTrips];

    if (yearFilter !== 'ALL') {
      filtered = filtered.filter(t => new Date(t.departureDate).getFullYear().toString() === yearFilter);
    }

    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter(t => t.departmentName === departmentFilter);
    }

    if (fundingFilter !== 'ALL') {
      filtered = filtered.filter(t => t.fundingSource === fundingFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by departure date (newest first)
    filtered.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());

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

  const handleOpenDetailModal = (id: string) => {
    setSelectedTripId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTripId(null);
  };

  const handleDeleteClick = (trip: OverseasTrip) => {
    setTripToDelete(trip);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockOverseasTrips.findIndex(t => t.id === tripToDelete.id);
    if (index > -1) {
      mockOverseasTrips.splice(index, 1);
    }
    
    setIsDeleteDialogOpen(false);
    setTripToDelete(null);
    setRefreshKey(prev => prev + 1);
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

  const stats = calculateOverseasStatistics(mockOverseasTrips);
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = Array.from(new Set(mockOverseasTrips.map(t => t.departmentName)));
  const years = Array.from(new Set(mockOverseasTrips.map(t => new Date(t.departureDate).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý xuất cảnh</h1>
          <p className="text-muted-foreground">
            Lưu trữ và quản lý lịch sử xuất cảnh của tất cả nhân viên
          </p>
        </div>
        <Button onClick={() => handleOpenFormModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm lịch sử xuất cảnh
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, quốc gia, mục đích"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả năm</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={fundingFilter} onValueChange={setFundingFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả nguồn</SelectItem>
              <SelectItem value="COMPANY">Công ty</SelectItem>
              <SelectItem value="PERSONAL">Cá nhân</SelectItem>
              <SelectItem value="PARTNER">Đối tác</SelectItem>
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
                <TableHead>Quốc gia</TableHead>
                <TableHead>Mục đích</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead>Nguồn</TableHead>
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
                      <p>Không tìm thấy lịch sử xuất cảnh nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{trip.employeeName}</p>
                        <p className="text-sm text-muted-foreground">{trip.employeeCode}</p>
                        <p className="text-xs text-muted-foreground">{trip.departmentName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{trip.country}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[200px] line-clamp-2">{trip.purpose}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(trip.departureDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">
                          đến {new Date(trip.returnDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ({trip.durationDays} ngày)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(trip.actualCost || trip.estimatedCost)}
                        </div>
                        {trip.actualCost && trip.actualCost !== trip.estimatedCost && (
                          <div className="text-xs text-muted-foreground">
                            DT: {formatCurrency(trip.estimatedCost)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getFundingBadge(trip.fundingSource)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(trip.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenFormModal(trip)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(trip)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modals */}
      <OverseasDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        tripId={selectedTripId}
      />

      <OverseasFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        trip={selectedTrip}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch sử xuất cảnh "{tripToDelete?.country}" của nhân viên {tripToDelete?.employeeName}?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}