// components/AppointmentTab.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search, Eye, Plus, Edit, TrendingUp, Briefcase } from 'lucide-react';
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
import { mockAppointments, type Appointment } from '../../../mock/appointment';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import AppointmentFormModal from '../../appointment/components/AppointmentFormModal';
import AppointmentDetailModal from '../../appointment/components/AppointmentDetailModal';

interface AppointmentTabProps {
  userData: any;
  employeeId: number | string;
}

export default function AppointmentTab({ userData, employeeId }: AppointmentTabProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [employeeId, searchTerm, refreshKey]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filter appointments for this specific employee
    let filtered = mockAppointments.filter(a => a.employeeId === employeeId.toString());

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.decisionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by effective date (newest first)
    filtered.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    setAppointments(filtered);
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
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Find the most recent active appointment (no expiry or not yet expired)
  const currentAppointment = appointments.find(a => {
    if (!a.expiryDate) return true; // Vô thời hạn
    return new Date(a.expiryDate) > new Date(); // Chưa hết hạn
  });

  return (
    <div className="space-y-4">
      {/* Current Position Card */}
      {currentAppointment && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Đang giữ chức
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-blue-900">{currentAppointment.position}</h3>
              <p className="text-blue-700">{currentAppointment.department}</p>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <Label className="text-blue-600">Ngày bổ nhiệm</Label>
                  <p className="font-medium text-blue-900">
                    {new Date(currentAppointment.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-blue-600">Số quyết định</Label>
                  <p className="font-medium text-blue-900">{currentAppointment.decisionNumber}</p>
                </div>
                {currentAppointment.salary && (
                  <div>
                    <Label className="text-blue-600">Lương chức vụ</Label>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(currentAppointment.salary)}
                    </p>
                  </div>
                )}
                {currentAppointment.allowance && (
                  <div>
                    <Label className="text-blue-600">Phụ cấp</Label>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(currentAppointment.allowance)}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Briefcase className="h-12 w-12 text-blue-400" />
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
            <Button onClick={() => handleOpenFormModal()}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm quyết định bổ nhiệm
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
                <TableHead>Chức vụ</TableHead>
                <TableHead>Phòng ban</TableHead>
                <TableHead>Ngày hiệu lực</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead>Số quyết định</TableHead>
                <TableHead>Lương & Phụ cấp</TableHead>
                <TableHead>Lý do</TableHead>
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
                      <TrendingUp className="h-8 w-8" />
                      <p>Nhân viên này chưa có quyết định bổ nhiệm nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => {
                  const isActive = !appointment.expiryDate || new Date(appointment.expiryDate) > new Date();
                  const isExpiringSoon = appointment.expiryDate && 
                    new Date(appointment.expiryDate) > new Date() &&
                    new Date(appointment.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

                  return (
                    <TableRow 
                      key={appointment.id} 
                      className={`hover:bg-muted/50 ${isActive ? 'bg-green-50' : ''}`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{appointment.position}</p>
                          {isActive && (
                            <Badge className="bg-green-500 text-white text-xs mt-1">
                              Đang giữ chức
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge className="bg-orange-500 text-white text-xs mt-1">
                              Sắp hết hạn
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{appointment.department}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {new Date(appointment.effectiveDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
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
                        <div className="text-sm">
                          <p className="font-medium">{appointment.decisionNumber}</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(appointment.decisionDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {appointment.salary && (
                            <p className="font-semibold text-green-600">
                              {formatCurrency(appointment.salary)}
                            </p>
                          )}
                          {appointment.allowance && (
                            <p className="text-muted-foreground text-xs">
                              + PC: {formatCurrency(appointment.allowance)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm line-clamp-2 max-w-[200px]">
                          {appointment.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <p>Người quyết định:</p>
                          <p className="font-medium text-foreground">{appointment.createdBy}</p>
                          <p>{new Date(appointment.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          {(isManager || isAdmin) && (
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modals */}
      {(isAdmin || isManager) && (
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
        isAdmin={isAdmin || isManager}
      />
    </div>
  );
}