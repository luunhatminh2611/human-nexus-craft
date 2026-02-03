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
import { Search, Eye, Plane, Download, AlertCircle } from 'lucide-react';
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
} from '../../../mock/overseasTrip';
import OverseasDetailModal from '../components/OverseasDetailModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

export default function OverseasEmployeePage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [trips, setTrips] = useState<OverseasTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [searchTerm, yearFilter, user]);

  const fetchTrips = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...mockOverseasTrips];
    
    // Lọc theo user hiện tại
    if (user?.employeeId) {
      filtered = filtered.filter(t => t.employeeId === user.employeeId);
    }

    if (yearFilter !== 'ALL') {
      filtered = filtered.filter(t => new Date(t.departureDate).getFullYear().toString() === yearFilter);
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

  const handleOpenDetailModal = (id: string) => {
    setSelectedTripId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTripId(null);
  };

  const handleDownload = (trip: OverseasTrip) => {
    console.log('Download documents for trip:', trip.id);
    alert(`Đang tải xuống tài liệu cho chuyến đi: ${trip.country}`);
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

  const stats = {
    total: trips.length,
    totalDays: trips.reduce((sum, t) => sum + t.durationDays, 0),
    thisYear: trips.filter(t => new Date(t.departureDate).getFullYear() === new Date().getFullYear()).length,
    countries: new Set(trips.map(t => t.country)).size,
  };

  const years = Array.from(new Set(trips.map(t => new Date(t.departureDate).getFullYear()))).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử xuất cảnh</h1>
          <p className="text-muted-foreground">
            Xem lịch sử các chuyến xuất cảnh của bạn
          </p>
        </div>
      </div>

      {/* Info banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Thông tin quan trọng</p>
            <p>Lịch sử xuất cảnh của bạn được quản lý bởi phòng Nhân sự. Nếu có thắc mắc hoặc cần cập nhật thông tin, vui lòng liên hệ với phòng Nhân sự.</p>
          </div>
        </div>
      </Card>

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
                      <p>Bạn chưa có lịch sử xuất cảnh nào</p>
                      <p className="text-sm">Liên hệ phòng Nhân sự để cập nhật lịch sử xuất cảnh của bạn</p>
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
                        {trip.attachments && trip.attachments.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(trip)}
                            title="Tải xuống tài liệu"
                          >
                            <Download className="h-4 w-4" />
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
      </Card>

      {/* Detail Modal */}
      <OverseasDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        tripId={selectedTripId}
      />
    </div>
  );
}