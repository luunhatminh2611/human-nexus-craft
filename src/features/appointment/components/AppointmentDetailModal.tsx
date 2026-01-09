// pages/hr/components/AppointmentDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Label } from '@/shared/components/ui/label';
import { 
  X, 
  UserCheck, 
  Briefcase, 
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Download,
  File
} from 'lucide-react';
import { mockAppointments, type Appointment, appointmentTypeLabels } from '../../../mock/appointment';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onSuccess: () => void;
  isAdmin: boolean;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointmentId,
  onSuccess,
  isAdmin,
}: AppointmentDetailModalProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [isOpen, appointmentId]);

  const fetchAppointmentDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundAppointment = mockAppointments.find(a => a.id === appointmentId);
    if (foundAppointment) {
      setAppointment(foundAppointment);
    }

    setIsLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const threeMonthsLater = new Date(today.getFullYear(), today.getMonth() + 3, today.getDate());
    return expiry > today && expiry <= threeMonthsLater;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!appointment) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin quyết định bổ nhiệm</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quyết định bổ nhiệm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Information */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Số QĐ: {appointment.decisionNumber}</span>
                {getTypeBadge(appointment.appointmentType)}
                {isExpiringSoon(appointment.expiryDate) && (
                  <Badge className="bg-orange-100 text-orange-800">
                    Sắp hết hạn
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Ngày quyết định: {new Date(appointment.decisionDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Expiring Soon Alert */}
          {isExpiringSoon(appointment.expiryDate) && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Quyết định này sắp hết hạn vào ngày {appointment.expiryDate && new Date(appointment.expiryDate).toLocaleDateString('vi-VN')}. 
                Vui lòng xem xét bổ nhiệm lại nếu cần.
              </AlertDescription>
            </Alert>
          )}

          {/* Employee Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Tên nhân viên</Label>
                <p className="font-medium text-lg">{appointment.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng ban</Label>
                <p className="font-medium">{appointment.department}</p>
              </div>
            </div>
          </Card>

          {/* Appointment Details */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
              <Briefcase className="h-4 w-4" />
              Thông tin bổ nhiệm
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Chức vụ</Label>
                <p className="font-semibold text-lg text-blue-900">{appointment.position}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Lý do bổ nhiệm</Label>
                <p className="whitespace-pre-wrap mt-1">{appointment.reason}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Nhiệm vụ và quyền hạn</Label>
                <p className="whitespace-pre-wrap mt-1">{appointment.responsibilities}</p>
              </div>
            </div>
          </Card>

          {/* Time Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Ngày có hiệu lực</Label>
                <p className="font-medium">
                  {new Date(appointment.effectiveDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Thời hạn bổ nhiệm</Label>
                <p className="font-medium">
                  {appointment.termMonths ? `${appointment.termMonths} tháng` : 'Vô thời hạn'}
                </p>
              </div>
              {appointment.expiryDate && (
                <div>
                  <Label className="text-muted-foreground">Ngày hết hạn</Label>
                  <p className="font-medium">
                    {new Date(appointment.expiryDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Salary Information */}
          {(appointment.salary || appointment.allowance) && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Lương và phúc lợi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appointment.salary && (
                  <div>
                    <Label className="text-muted-foreground">Mức lương</Label>
                    <p className="font-semibold text-lg text-green-600">
                      {formatCurrency(appointment.salary)}
                    </p>
                  </div>
                )}
                {appointment.allowance && (
                  <div>
                    <Label className="text-muted-foreground">Phụ cấp</Label>
                    <p className="font-medium text-green-600">
                      {formatCurrency(appointment.allowance)}
                    </p>
                  </div>
                )}
                {appointment.salary && appointment.allowance && (
                  <div>
                    <Label className="text-muted-foreground">Tổng thu nhập</Label>
                    <p className="font-bold text-lg text-green-600">
                      {formatCurrency(appointment.salary + appointment.allowance)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Attachments */}
          {appointment.attachments && appointment.attachments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <File className="h-4 w-4" />
                File đính kèm ({appointment.attachments.length})
              </h3>
              <div className="space-y-2">
                {appointment.attachments.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded hover:bg-muted/70 transition-colors">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Download:', file.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Note */}
          {appointment.note && (
            <Card className="p-4 bg-muted/50">
              <Label className="text-muted-foreground">Ghi chú</Label>
              <p className="whitespace-pre-wrap mt-1 italic">{appointment.note}</p>
            </Card>
          )}

          {/* Created By */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>Người tạo: {appointment.createdBy}</p>
            <p>Ngày tạo: {new Date(appointment.createdAt).toLocaleString('vi-VN')}</p>
            {appointment.updatedAt !== appointment.createdAt && (
              <p>Cập nhật lần cuối: {new Date(appointment.updatedAt).toLocaleString('vi-VN')}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>

          <Button variant="outline" onClick={() => console.log('Download PDF')}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}