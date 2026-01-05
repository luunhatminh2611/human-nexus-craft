// components/DismissalTab.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search, Eye, Plus, Edit, TrendingDown, XCircle, Calendar, FileText } from 'lucide-react';
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
import { Appointment } from '../../../mock/appointment';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

interface DismissalTabProps {
  userData: any;
  employeeId: number | string;
}

export default function DismissalTab({ userData, employeeId }: DismissalTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [dismissals, setDismissals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDismissal, setSelectedDismissal] = useState(null);

  useEffect(() => {
    fetchDismissals();
  }, [employeeId, searchTerm, refreshKey]);

  const fetchDismissals = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const employee = dismissals.find(e => e.employeeId === employeeId.toString());
    
    if (employee) {
      let filtered = employee.history.filter(h => h.type === 'TERMINATION');

      if (searchTerm) {
        filtered = filtered.filter(d =>
          d.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.reason.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by effective date (newest first)
      filtered.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

      setDismissals(filtered);
    } else {
      setDismissals([]);
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const mostRecentDismissal = dismissals.length > 0 ? dismissals[0] : null;

  return (
    <div className="space-y-4">
      {/* Most Recent Dismissal Card */}
      {mostRecentDismissal && (
        <Card className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-red-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-500 text-white">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Miễn nhiệm gần nhất
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-red-900">{mostRecentDismissal.position}</h3>
              <p className="text-red-700">{mostRecentDismissal.department}</p>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <Label className="text-red-600">Ngày miễn nhiệm</Label>
                  <p className="font-medium text-red-900">
                    {new Date(mostRecentDismissal.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-red-600">Số quyết định</Label>
                  <p className="font-medium text-red-900">{mostRecentDismissal.decisionNumber}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-red-600">Lý do</Label>
                  <p className="font-medium text-red-900">{mostRecentDismissal.reason}</p>
                </div>
              </div>
            </div>
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo chức vụ, phòng ban, số quyết định hoặc lý do"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chức vụ bị miễn nhiệm</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Ngày bổ nhiệm</TableHead>
                <TableHead>Ngày miễn nhiệm</TableHead>
                <TableHead>Thời gian giữ chức</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Lý do miễn nhiệm</TableHead>
                <TableHead>Người quyết định</TableHead>
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
              ) : dismissals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <TrendingDown className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định miễn nhiệm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                dismissals.map((dismissal) => {
                  // Find corresponding appointment to calculate duration
                  const employee = dismissals.find(e => e.employeeId === employeeId.toString());
                  const correspondingAppointment = employee?.history.find(
                    h => h.type === 'APPOINTMENT' && 
                    h.position === dismissal.position && 
                    h.department === dismissal.department &&
                    new Date(h.effectiveDate) < new Date(dismissal.effectiveDate)
                  );

                  let duration = '';
                  if (correspondingAppointment) {
                    const start = new Date(correspondingAppointment.effectiveDate);
                    const end = new Date(dismissal.effectiveDate);
                    const months = Math.floor((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000));
                    const years = Math.floor(months / 12);
                    const remainingMonths = months % 12;
                    
                    if (years > 0) {
                      duration = `${years} năm${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
                    } else {
                      duration = `${months} tháng`;
                    }
                  }

                  return (
                    <TableRow key={dismissal.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{dismissal.position}</p>
                          <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                            Đã miễn nhiệm
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{dismissal.department}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {correspondingAppointment ? (
                            <p className="font-medium">
                              {new Date(correspondingAppointment.effectiveDate).toLocaleDateString('vi-VN')}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {new Date(dismissal.effectiveDate).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {duration || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{dismissal.decisionNumber}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(dismissal.decisionDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-2 max-w-[200px]">
                          {dismissal.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">{dismissal.createdBy}</p>
                          <p>{new Date(dismissal.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {(isManager || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => console.log('Edit', dismissal.id)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDismissal(dismissal)}
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

      {/* Detail View Modal */}
      {selectedDismissal && (
        <Card className="p-6 border-2 border-red-300">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold">Chi tiết quyết định miễn nhiệm</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedDismissal(null)}
            >
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Chức vụ bị miễn nhiệm</Label>
              <p className="font-semibold text-lg">{selectedDismissal.position}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phòng ban</Label>
              <p className="font-semibold text-lg">{selectedDismissal.department}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Số quyết định</Label>
              <p className="font-medium">{selectedDismissal.decisionNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ngày quyết định</Label>
              <p className="font-medium">
                {new Date(selectedDismissal.decisionDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Ngày có hiệu lực</Label>
              <p className="font-medium">
                {new Date(selectedDismissal.effectiveDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            {selectedDismissal.endDate && (
              <div>
                <Label className="text-muted-foreground">Ngày kết thúc</Label>
                <p className="font-medium">
                  {new Date(selectedDismissal.endDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}
            <div className="col-span-2">
              <Label className="text-muted-foreground">Lý do miễn nhiệm</Label>
              <p className="mt-1">{selectedDismissal.reason}</p>
            </div>
            {selectedDismissal.note && (
              <div className="col-span-2">
                <Label className="text-muted-foreground">Ghi chú</Label>
                <p className="mt-1 text-muted-foreground italic">{selectedDismissal.note}</p>
              </div>
            )}
            <div className="col-span-2 pt-4 border-t">
              <Label className="text-muted-foreground">Thông tin người quyết định</Label>
              <div className="flex items-center justify-between mt-2">
                <p className="font-medium">{selectedDismissal.createdBy}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedDismissal.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}