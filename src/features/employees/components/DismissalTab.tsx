// components/DismissalTab.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search, Eye, Plus, Edit, TrendingDown, XCircle } from 'lucide-react';
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
import { mockTerminations, mockAppointments, type Termination } from '../../../mock/appointment';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import TerminationFormModal from '../../appointment/components/TerminationFormModal';
import TerminationDetailModal from '../../appointment/components/TerminationDetailModal';

interface DismissalTabProps {
  userData: any;
  employeeId: number | string;
}

export default function DismissalTab({ userData, employeeId }: DismissalTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTerminationId, setSelectedTerminationId] = useState<string | null>(null);

  useEffect(() => {
    fetchTerminations();
  }, [employeeId, searchTerm, refreshKey]);

  const fetchTerminations = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter terminations for this specific employee
    let filtered = mockTerminations.filter(t => t.employeeId === employeeId.toString());

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.appointmentDecisionNumber && t.appointmentDecisionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by effective date (newest first)
    filtered.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    setTerminations(filtered);
    setIsLoading(false);
  };

  const handleOpenFormModal = (termination?: Termination) => {
    setSelectedTermination(termination || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedTermination(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedTerminationId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTerminationId(null);
  };

  const handleDetailSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const mostRecentTermination = terminations.length > 0 ? terminations[0] : null;

  // Helper function to calculate duration
  const calculateDuration = (termination: Termination) => {
    if (!termination.appointmentId) return '';

    const appointment = mockAppointments.find(a => a.id === termination.appointmentId);
    if (!appointment) return '';

    const start = new Date(appointment.effectiveDate);
    const end = new Date(termination.effectiveDate);
    const months = Math.floor((end.getTime() - start.getTime()) / (30 * 24 * 60 * 60 * 1000));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} năm${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
    } else {
      return `${months} tháng`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Most Recent Termination Card */}
      {mostRecentTermination && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-orange-500 text-white">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Miễn nhiệm gần nhất
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-orange-900">{mostRecentTermination.position}</h3>
              <p className="text-orange-700">{mostRecentTermination.department}</p>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <Label className="text-orange-600">Ngày miễn nhiệm</Label>
                  <p className="font-medium text-orange-900">
                    {new Date(mostRecentTermination.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-orange-600">Số quyết định</Label>
                  <p className="font-medium text-orange-900">{mostRecentTermination.decisionNumber}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-orange-600">Lý do</Label>
                  <p className="font-medium text-orange-900 line-clamp-2">{mostRecentTermination.reason}</p>
                </div>
              </div>
            </div>
            <XCircle className="h-12 w-12 text-orange-400" />
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
          
          {(isAdmin || isManager) && (
            <Button 
              onClick={() => handleOpenFormModal()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm quyết định miễn nhiệm
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
                <TableHead>Chức vụ bị miễn nhiệm</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Số QĐ miễn nhiệm</TableHead>
                <TableHead>Số QĐ bổ nhiệm</TableHead>
                <TableHead>Ngày miễn nhiệm</TableHead>
                <TableHead>Thời gian giữ chức</TableHead>
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
              ) : terminations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <TrendingDown className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định miễn nhiệm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                terminations.map((termination) => {
                  const duration = calculateDuration(termination);

                  return (
                    <TableRow key={termination.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium">{termination.position}</p>
                          <Badge className="bg-orange-100 text-orange-800 text-xs mt-1">
                            Đã miễn nhiệm
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{termination.department}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{termination.decisionNumber}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(termination.decisionDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {termination.appointmentDecisionNumber || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {new Date(termination.effectiveDate).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {duration ? (
                          <Badge variant="outline" className="font-medium">
                            {duration}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-2 max-w-[200px]">
                          {termination.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground">{termination.createdBy}</p>
                          <p>{new Date(termination.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {(isManager || isAdmin) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(termination)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(termination.id)}
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
      {(isAdmin || isManager) && (
        <TerminationFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          termination={selectedTermination}
          onSuccess={handleFormSuccess}
        />
      )}

      <TerminationDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        terminationId={selectedTerminationId}
        onSuccess={handleDetailSuccess}
        isAdmin={isAdmin || isManager}
      />
    </div>
  );
}