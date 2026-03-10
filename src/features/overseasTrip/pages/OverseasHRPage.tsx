// pages/hr/overseas/OverseasHRPage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, ChevronLeft, ChevronRight, Plane, Plus, Edit, Trash2, ListPlus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import OverseasDetailModal from '../components/OverseasDetailModal';
import OverseasFormModal from '../components/OverseasFormModal';
import BulkAddOverseasModal from '../components/BulkAddOverseasModal';
import { employeeTravelApi } from '../api/overSeas';
import { toast } from 'sonner';

const FUNDING_CONFIG: Record<string, { label: string; className: string }> = {
  COMPANY:  { label: 'Công ty',  className: 'bg-blue-100 text-blue-800' },
  PERSONAL: { label: 'Cá nhân',  className: 'bg-gray-100 text-gray-800' },
  PARTNER:  { label: 'Đối tác',  className: 'bg-purple-100 text-purple-800' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OverseasHRPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [fundingFilter, setFundingFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any>(null);

  // Lấy tất cả — API không có getAll nên gọi theo employeeId khi cần
  // Tạm thời dùng state tổng hợp từ danh sách nhân viên hoặc endpoint khác
  // TODO: thay bằng endpoint getAll nếu backend bổ sung
  useEffect(() => {
    fetchTrips();
  }, [refreshKey]);

  const fetchTrips = async () => {
    setIsLoading(true);
    try {
      // Gọi endpoint lấy tất cả nếu có, hiện tại placeholder
      // const data = await employeeTravelApi.getAll();
      // setTrips(data || []);
      setTrips([]); // thay bằng API khi backend sẵn sàng
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải danh sách xuất cảnh');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tripToDelete) return;
    try {
      await employeeTravelApi.delete(tripToDelete.id);
      toast.success('Đã xóa xuất cảnh');
      setRefreshKey(prev => prev + 1);
    } catch {
      toast.error('Không thể xóa');
    } finally {
      setIsDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  // Filter
  const filtered = trips.filter(t => {
    if (yearFilter !== 'ALL' && new Date(t.departureDate).getFullYear().toString() !== yearFilter) return false;
    if (fundingFilter !== 'ALL' && t.fundingSource !== fundingFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!t.country?.toLowerCase().includes(s) && !t.travelPurpose?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const years = Array.from(new Set(trips.map(t => new Date(t.departureDate).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Xuất cảnh nước ngoài</h1>
          <p className="text-muted-foreground">Lưu trữ và quản lý lịch sử xuất cảnh của tất cả nhân viên</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setSelectedTrip(null); setIsFormModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Thêm xuất cảnh
          </Button>
          <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
            <ListPlus className="h-4 w-4 mr-2" /> Thêm hàng loạt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm theo quốc gia, mục đích..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Năm" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả năm</SelectItem>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fundingFilter} onValueChange={setFundingFilter}>
            <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Nguồn" /></SelectTrigger>
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
                <TableHead>Quốc gia</TableHead>
                <TableHead>Mục đích</TableHead>
                <TableHead>Ngày xuất cảnh</TableHead>
                <TableHead>Ngày về</TableHead>
                <TableHead>Chi phí DT</TableHead>
                <TableHead>Chi phí TT</TableHead>
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
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Plane className="h-8 w-8" />
                      <p>Không tìm thấy lịch sử xuất cảnh nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(trip => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.country}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{trip.travelPurpose}</TableCell>
                    <TableCell className="text-sm">{new Date(trip.departureDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-sm">{new Date(trip.returnDate).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(trip.estimatedCost)}</TableCell>
                    <TableCell className="text-sm">{trip.actualCost != null ? formatCurrency(trip.actualCost) : '-'}</TableCell>
                    <TableCell>
                      {FUNDING_CONFIG[trip.fundingSource] ? (
                        <Badge className={FUNDING_CONFIG[trip.fundingSource].className}>
                          {FUNDING_CONFIG[trip.fundingSource].label}
                        </Badge>
                      ) : trip.fundingSource}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTripId(trip.id); setIsDetailModalOpen(true); }} title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedTrip(trip); setIsFormModalOpen(true); }} title="Chỉnh sửa">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                          onClick={() => { setTripToDelete(trip); setIsDeleteDialogOpen(true); }} title="Xóa">
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

        {!isLoading && paginated.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {page * pageSize + 1} - {Math.min((page + 1) * pageSize, totalItems)} trong {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(0); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0}>Đầu</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">Trang {page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>Cuối</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <OverseasDetailModal isOpen={isDetailModalOpen} onClose={() => { setIsDetailModalOpen(false); setSelectedTripId(null); }} tripId={selectedTripId} />
      <OverseasFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setSelectedTrip(null); }}
        trip={selectedTrip} onSuccess={() => { setRefreshKey(p => p + 1); setIsFormModalOpen(false); setSelectedTrip(null); }} />
      <BulkAddOverseasModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => setRefreshKey(p => p + 1)} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa xuất cảnh "{tripToDelete?.country}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}