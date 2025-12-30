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
import { Textarea } from '@/shared/components/ui/textarea';
import { Separator } from '@/shared/components/ui/separator';
import { 
  X, 
  UserCheck, 
  Briefcase, 
  Calendar,
  DollarSign,
  FileText,
  History,
  AlertCircle,
  Ban,
  Download,
  CheckCircle,
  Send
} from 'lucide-react';
import { mockAppointments, type Appointment, statusLabels, appointmentTypeLabels } from '../../../mock/appointment';
import { Input } from '@/shared/components/ui/input';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const [revokedReason, setRevokedReason] = useState('');
  const [revokeError, setRevokeError] = useState('');
  
  const [showTerminationForm, setShowTerminationForm] = useState(false);
  const [terminationData, setTerminationData] = useState({
    terminationDate: '',
    terminationDecisionNumber: '',
    terminationDecisionDate: '',
    terminationReason: '',
    terminationNote: '',
  });
  const [terminationErrors, setTerminationErrors] = useState<Record<string, string>>({});

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
      if (foundAppointment.revokedReason) {
        setRevokedReason(foundAppointment.revokedReason);
      }
    }

    setIsLoading(false);
  };

  const handlePublish = async () => {
    if (!appointment) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Publishing appointment:', {
      appointmentId: appointment.id,
      status: 'PUBLISHED',
    });

    setIsSubmitting(false);
    onSuccess();
  };

  const handleRevoke = async () => {
    if (!revokedReason.trim()) {
      setRevokeError('Vui lòng nhập lý do hủy bỏ quyết định');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Revoking appointment:', {
      appointmentId: appointment?.id,
      revokedReason,
      revokedDate: new Date().toISOString().split('T')[0],
      status: 'REVOKED',
    });

    setIsSubmitting(false);
    setShowRevokeForm(false);
    onSuccess();
  };

  const handleTerminate = async () => {
    const newErrors: Record<string, string> = {};

    if (!terminationData.terminationDate) {
      newErrors.terminationDate = 'Vui lòng chọn ngày miễn nhiệm';
    }

    if (!terminationData.terminationDecisionNumber.trim()) {
      newErrors.terminationDecisionNumber = 'Vui lòng nhập số quyết định miễn nhiệm';
    }

    if (!terminationData.terminationDecisionDate) {
      newErrors.terminationDecisionDate = 'Vui lòng chọn ngày quyết định';
    }

    if (!terminationData.terminationReason.trim()) {
      newErrors.terminationReason = 'Vui lòng nhập lý do miễn nhiệm';
    }

    if (Object.keys(newErrors).length > 0) {
      setTerminationErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Terminating appointment:', {
      appointmentId: appointment?.id,
      ...terminationData,
      status: 'TERMINATED',
    });

    setIsSubmitting(false);
    setShowTerminationForm(false);
    onSuccess();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { label: statusLabels.DRAFT, className: 'bg-gray-100 text-gray-800' },
      'PUBLISHED': { label: statusLabels.PUBLISHED, className: 'bg-blue-100 text-blue-800' },
      'PENDING_EFFECTIVE': { label: statusLabels.PENDING_EFFECTIVE, className: 'bg-yellow-100 text-yellow-800' },
      'IN_EFFECT': { label: statusLabels.IN_EFFECT, className: 'bg-green-100 text-green-800' },
      'EXPIRING_SOON': { label: statusLabels.EXPIRING_SOON, className: 'bg-orange-100 text-orange-800' },
      'EXPIRED': { label: statusLabels.EXPIRED, className: 'bg-red-100 text-red-800' },
      'REVOKED': { label: statusLabels.REVOKED, className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
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

  const canPublish = isAdmin && appointment.status === 'DRAFT';
  const canRevoke = isAdmin && (appointment.status === 'PUBLISHED' || appointment.status === 'PENDING_EFFECTIVE' || appointment.status === 'IN_EFFECT');
  const canTerminate = isAdmin && (appointment.status === 'IN_EFFECT' || appointment.status === 'EXPIRING_SOON');

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
                {getStatusBadge(appointment.status)}
                {getTypeBadge(appointment.appointmentType)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Ngày ban hành: {new Date(appointment.decisionDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Expiring Soon Alert */}
          {appointment.status === 'EXPIRING_SOON' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Quyết định này sắp hết hạn vào ngày {appointment.expiryDate && new Date(appointment.expiryDate).toLocaleDateString('vi-VN')}. 
                Vui lòng xem xét bổ nhiệm lại hoặc kết thúc nhiệm kỳ.
              </AlertDescription>
            </Alert>
          )}

          {/* Expired Alert */}
          {appointment.status === 'EXPIRED' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Quyết định này đã hết hiệu lực vào ngày {appointment.expiryDate && new Date(appointment.expiryDate).toLocaleDateString('vi-VN')}. 
                Cần có quyết định mới nếu tiếp tục bổ nhiệm.
              </AlertDescription>
            </Alert>
          )}

          {/* Employee Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-muted-foreground">Họ và tên</Label>
                <p className="font-medium text-lg">{appointment.employeeName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phòng ban hiện tại</Label>
                  <p className="font-medium">{appointment.currentDepartment}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Chức vụ hiện tại</Label>
                  <p className="font-medium">{appointment.currentPosition}</p>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Chức vụ mới</Label>
                  <p className="font-semibold text-lg text-blue-900">{appointment.newPosition}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phòng ban mới</Label>
                  <p className="font-semibold text-lg text-blue-900">{appointment.newDepartment}</p>
                </div>
              </div>

              <Separator />

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
          {(appointment.currentSalary || appointment.newSalary || appointment.allowance) && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Lương và phúc lợi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {appointment.currentSalary && (
                  <div>
                    <Label className="text-muted-foreground">Lương hiện tại</Label>
                    <p className="font-medium">{formatCurrency(appointment.currentSalary)}</p>
                  </div>
                )}
                {appointment.newSalary && (
                  <div>
                    <Label className="text-muted-foreground">Lương mới</Label>
                    <p className="font-semibold text-lg text-green-600">
                      {formatCurrency(appointment.newSalary)}
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
              </div>
              {appointment.newSalary && appointment.allowance && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <Label className="text-muted-foreground">Tổng thu nhập mới</Label>
                    <p className="font-bold text-xl text-green-600">
                      {formatCurrency(appointment.newSalary + appointment.allowance)}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Revoked Information */}
          {appointment.status === 'REVOKED' && appointment.revokedReason && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                <Ban className="h-4 w-4" />
                Thông tin hủy bỏ
              </h3>
              <div className="space-y-2">
                <div>
                  <Label className="text-muted-foreground">Ngày hủy bỏ</Label>
                  <p className="font-medium">
                    {appointment.revokedDate && new Date(appointment.revokedDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Lý do hủy bỏ</Label>
                  <p className="whitespace-pre-wrap mt-1">{appointment.revokedReason}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Terminated Information */}
          {appointment.status === 'TERMINATED' && appointment.terminationReason && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-700">
                <Ban className="h-4 w-4" />
                Thông tin miễn nhiệm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Số quyết định miễn nhiệm</Label>
                  <p className="font-medium">{appointment.terminationDecisionNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày quyết định</Label>
                  <p className="font-medium">
                    {appointment.terminationDecisionDate && new Date(appointment.terminationDecisionDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày miễn nhiệm</Label>
                  <p className="font-medium">
                    {appointment.terminationDate && new Date(appointment.terminationDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Người quyết định</Label>
                  <p className="font-medium">{appointment.terminationBy}</p>
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-muted-foreground">Lý do miễn nhiệm</Label>
                <p className="whitespace-pre-wrap mt-1">{appointment.terminationReason}</p>
              </div>
              {appointment.terminationNote && (
                <div className="mt-2">
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="whitespace-pre-wrap mt-1 text-muted-foreground italic">
                    {appointment.terminationNote}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Previous Appointments History */}
          {appointment.previousAppointments && appointment.previousAppointments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử bổ nhiệm
              </h3>
              <div className="space-y-3">
                {appointment.previousAppointments.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{item.position}</p>
                        <Badge variant="outline">{item.department}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Số QĐ: {item.decisionNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Từ {new Date(item.effectiveDate).toLocaleDateString('vi-VN')}
                        {item.expiryDate && ` đến ${new Date(item.expiryDate).toLocaleDateString('vi-VN')}`}
                        {item.termMonths && ` (${item.termMonths} tháng)`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Termination Form (Admin only) */}
          {isAdmin && canTerminate && showTerminationForm && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-orange-700">
                <Ban className="h-4 w-4" />
                Miễn nhiệm
              </h3>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Miễn nhiệm sẽ kết thúc quyết định bổ nhiệm này. Nhân viên sẽ nhận được thông báo.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="terminationDecisionNumber">
                      Số quyết định miễn nhiệm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="terminationDecisionNumber"
                      value={terminationData.terminationDecisionNumber}
                      onChange={(e) => {
                        setTerminationData(prev => ({ ...prev, terminationDecisionNumber: e.target.value }));
                        setTerminationErrors(prev => ({ ...prev, terminationDecisionNumber: '' }));
                      }}
                      placeholder="VD: QD-MN/2024/001"
                    />
                    {terminationErrors.terminationDecisionNumber && (
                      <p className="text-sm text-red-500">{terminationErrors.terminationDecisionNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="terminationDecisionDate">
                      Ngày quyết định <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="terminationDecisionDate"
                      type="date"
                      value={terminationData.terminationDecisionDate}
                      onChange={(e) => {
                        setTerminationData(prev => ({ ...prev, terminationDecisionDate: e.target.value }));
                        setTerminationErrors(prev => ({ ...prev, terminationDecisionDate: '' }));
                      }}
                    />
                    {terminationErrors.terminationDecisionDate && (
                      <p className="text-sm text-red-500">{terminationErrors.terminationDecisionDate}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationDate">
                    Ngày miễn nhiệm <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="terminationDate"
                    type="date"
                    value={terminationData.terminationDate}
                    onChange={(e) => {
                      setTerminationData(prev => ({ ...prev, terminationDate: e.target.value }));
                      setTerminationErrors(prev => ({ ...prev, terminationDate: '' }));
                    }}
                  />
                  {terminationErrors.terminationDate && (
                    <p className="text-sm text-red-500">{terminationErrors.terminationDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationReason">
                    Lý do miễn nhiệm <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="terminationReason"
                    value={terminationData.terminationReason}
                    onChange={(e) => {
                      setTerminationData(prev => ({ ...prev, terminationReason: e.target.value }));
                      setTerminationErrors(prev => ({ ...prev, terminationReason: '' }));
                    }}
                    placeholder="Nhập lý do miễn nhiệm chi tiết"
                    rows={3}
                  />
                  {terminationErrors.terminationReason && (
                    <p className="text-sm text-red-500">{terminationErrors.terminationReason}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="terminationNote">Ghi chú</Label>
                  <Textarea
                    id="terminationNote"
                    value={terminationData.terminationNote}
                    onChange={(e) => setTerminationData(prev => ({ ...prev, terminationNote: e.target.value }))}
                    placeholder="Ghi chú thêm (nếu có)"
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowTerminationForm(false);
                      setTerminationData({
                        terminationDate: '',
                        terminationDecisionNumber: '',
                        terminationDecisionDate: '',
                        terminationReason: '',
                        terminationNote: '',
                      });
                      setTerminationErrors({});
                    }}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleTerminate}
                    disabled={isSubmitting}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Xác nhận miễn nhiệm
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}
          {isAdmin && canRevoke && showRevokeForm && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-700">
                <Ban className="h-4 w-4" />
                Hủy bỏ quyết định
              </h3>
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Hành động này không thể hoàn tác. Quyết định sẽ bị hủy bỏ và nhân viên sẽ nhận được thông báo.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="revokedReason">
                    Lý do hủy bỏ <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="revokedReason"
                    value={revokedReason}
                    onChange={(e) => {
                      setRevokedReason(e.target.value);
                      setRevokeError('');
                    }}
                    placeholder="Nhập lý do chi tiết về việc hủy bỏ quyết định này"
                    rows={4}
                  />
                  {revokeError && (
                    <p className="text-sm text-red-500">{revokeError}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRevokeForm(false);
                      setRevokedReason('');
                      setRevokeError('');
                    }}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRevoke}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Xác nhận hủy bỏ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Created By */}
          <div className="text-sm text-muted-foreground">
            <p>Người tạo: {appointment.createdBy}</p>
            <p>Ngày tạo: {new Date(appointment.createdAt).toLocaleString('vi-VN')}</p>
            {appointment.updatedAt !== appointment.createdAt && (
              <p>Cập nhật lần cuối: {new Date(appointment.updatedAt).toLocaleString('vi-VN')}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>

          {!isAdmin && (
            <Button variant="outline" onClick={() => console.log('Download PDF')}>
              <Download className="h-4 w-4 mr-2" />
              Tải xuống PDF
            </Button>
          )}

          {isAdmin && canRevoke && !showRevokeForm && (
            <Button
              variant="destructive"
              onClick={() => setShowRevokeForm(true)}
              disabled={isSubmitting}
            >
              <Ban className="h-4 w-4 mr-2" />
              Hủy bỏ quyết định
            </Button>
          )}

          {isAdmin && canTerminate && !showTerminationForm && (
            <Button
              onClick={() => setShowTerminationForm(true)}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Ban className="h-4 w-4 mr-2" />
              Miễn nhiệm
            </Button>
          )}

          {canPublish && (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang ban hành...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Ban hành quyết định
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}