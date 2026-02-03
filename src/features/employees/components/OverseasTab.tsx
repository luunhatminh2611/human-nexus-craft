// components/OverseasTab.tsx

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
import { Search, Plus, Edit, Trash2, Plane, Eye } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { Label } from '@/shared/components/ui/label';
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
import { mockOverseasTrips, type OverseasTrip, fundingSourceLabels } from '../../../mock/overseasTrip';
import OverseasDetailModal from '../../overseasTrip/components/OverseasDetailModal';
import OverseasFormModal from '../../overseasTrip/components/OverseasFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface OverseasTabProps {
  userData: any;
  employeeId: number | string;
}

export default function OverseasTab({ userData, employeeId }: OverseasTabProps) {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [fundingFilter, setFundingFilter] = useState<string>('ALL');
  const [trips, setTrips] = useState<OverseasTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<OverseasTrip | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<OverseasTrip | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isAdmin = user?.roles?.includes('ADMIN');

  useEffect(() => {
    fetchTrips();
  }, [employeeId, searchTerm, yearFilter, fundingFilter, refreshKey]);

  const fetchTrips = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter trips for this specific employee
    let filtered = mockOverseasTrips.filter(t => t.employeeId === employeeId.toString());
    
    if (yearFilter !== 'ALL') {
      filtered = filtered.filter(t => new Date(t.departureDate).getFullYear().toString() === yearFilter);
    }
    
    if (fundingFilter !== 'ALL') {
      filtered = filtered.filter(t => t.fundingSource === fundingFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by departure date (newest first)
    filtered.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());
    
    setTrips(filtered);
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

  // Calculate statistics
  const stats = {
    total: trips.length,
    totalDays: trips.reduce((sum, t) => sum + t.durationDays, 0),
    totalCost: trips.reduce((sum, t) => sum + (t.actualCost || t.estimatedCost), 0),
    companyFunded: trips.filter(t => t.fundingSource === 'COMPANY').length,
    personalFunded: trips.filter(t => t.fundingSource === 'PERSONAL').length,
    partnerFunded: trips.filter(t => t.fundingSource === 'PARTNER').length,
    countries: new Set(trips.map(t => t.country)).size,
  };

  // Get unique years from trips
  const years = Array.from(new Set(trips.map(t => new Date(t.departureDate).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {/* Summary Info */}
      {stats.total > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Tóm tắt lịch sử xuất cảnh</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-blue-600">Tổng chuyến đi</Label>
                  <p className="font-semibold text-blue-900">{stats.total}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Tổng số ngày</Label>
                  <p className="font-semibold text-blue-700">{stats.totalDays} ngày</p>
                </div>
                <div>
                  <Label className="text-blue-600">Tổng chi phí</Label>
                  <p className="font-semibold text-green-600">{formatCurrency(stats.totalCost)}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Số quốc gia</Label>
                  <p className="font-semibold text-purple-600">{stats.countries} quốc gia</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mt-3 pt-3 border-t border-blue-200">
                <div>
                  <Label className="text-blue-600">Công ty</Label>
                  <p className="font-semibold text-blue-700">{stats.companyFunded}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Cá nhân</Label>
                  <p className="font-semibold text-gray-700">{stats.personalFunded}</p>
                </div>
                <div>
                  <Label className="text-blue-600">Đối tác</Label>
                  <p className="font-semibold text-purple-600">{stats.partnerFunded}</p>
                </div>
              </div>
            </div>
            <Plane className="h-12 w-12 text-blue-400" />
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo quốc gia, mục đích"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

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

          {isAdmin && (
            <Button onClick={() => handleOpenFormModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm xuất cảnh
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
                <TableHead>Quốc gia</TableHead>
                <TableHead>Mục đích</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead>Nguồn</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Plane className="h-8 w-8" />
                      <p>Nhân viên này chưa có lịch sử xuất cảnh nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-muted/50">
                    <TableCell>
                      <span className="font-medium text-sm">{trip.country}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm max-w-[250px] line-clamp-2">{trip.purpose}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">
                          {new Date(trip.departureDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          đến {new Date(trip.returnDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ({trip.durationDays} ngày)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{trip.decisionNumber}</span>
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
                        {isAdmin && (
                          <>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Modal */}
      <OverseasDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        tripId={selectedTripId}
      />

      {/* Form Modal */}
      <OverseasFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        trip={selectedTrip}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lịch sử xuất cảnh đến "{tripToDelete?.country}"? 
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