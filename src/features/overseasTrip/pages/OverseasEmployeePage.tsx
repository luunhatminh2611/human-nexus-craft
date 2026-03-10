// pages/employee/overseas/OverseasEmployeePage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, Plane, Download, AlertCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import OverseasDetailModal from '../components/OverseasDetailModal';
import { employeeTravelApi } from '../api/overSeas';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

const FUNDING_CONFIG: Record<string, { label: string; className: string }> = {
  COMPANY:  { label: 'Công ty',  className: 'bg-blue-100 text-blue-800' },
  PERSONAL: { label: 'Cá nhân',  className: 'bg-gray-100 text-gray-800' },
  PARTNER:  { label: 'Đối tác',  className: 'bg-purple-100 text-purple-800' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function OverseasEmployeePage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.employeeId) return;
    setIsLoading(true);
    employeeTravelApi.getByEmployeeId(user.employeeId)
      .then(d => setTrips(d || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.employeeId]);

  const filtered = trips.filter(t => {
    if (yearFilter !== 'ALL' && new Date(t.departureDate).getFullYear().toString() !== yearFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!t.country?.toLowerCase().includes(s) && !t.travelPurpose?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const years = Array.from(new Set(trips.map(t => new Date(t.departureDate).getFullYear()))).sort((a, b) => b - a);

  const duration = (dep: string, ret: string) => {
    const d = Math.floor((new Date(ret).getTime() - new Date(dep).getTime()) / 86400000);
    return d > 0 ? d : 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch sử xuất cảnh</h1>
        <p className="text-muted-foreground">Xem lịch sử các chuyến xuất cảnh của bạn</p>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Thông tin quan trọng</p>
            <p>Lịch sử xuất cảnh của bạn được quản lý bởi phòng Nhân sự. Nếu có thắc mắc, vui lòng liên hệ phòng Nhân sự.</p>
          </div>
        </div>
      </Card>

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
        </div>
      </Card>

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
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Plane className="h-8 w-8" />
                      <p>Bạn chưa có lịch sử xuất cảnh nào</p>
                      <p className="text-sm">Liên hệ phòng Nhân sự để cập nhật</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(trip => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.country}</TableCell>
                    <TableCell className="text-sm max-w-[250px] truncate">{trip.travelPurpose}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(trip.departureDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted-foreground">đến {new Date(trip.returnDate).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs text-muted-foreground">({duration(trip.departureDate, trip.returnDate)} ngày)</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(trip.actualCost ?? trip.estimatedCost)}
                    </TableCell>
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
                        {trip.fileName && (
                          <Button variant="ghost" size="sm" onClick={() => window.open(trip.downloadUrl, '_blank')} title="Tải xuống">
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

      <OverseasDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedTripId(null); }}
        tripId={selectedTripId}
      />
    </div>
  );
}