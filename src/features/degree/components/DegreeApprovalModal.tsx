import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { FileText, Download, Check, X, AlertCircle, Calendar, Building, Award, User } from 'lucide-react';
import { mockDegrees, type Degree } from '../../../mock/degree';
import { toast } from '@/shared/components/ui/use-toast';

interface DegreeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  degreeId: string | null;
  onSuccess: () => void;
}

export default function DegreeApprovalModal({ 
  isOpen, 
  onClose, 
  degreeId, 
  onSuccess 
}: DegreeApprovalModalProps) {
  const [degree, setDegree] = useState<Degree | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && degreeId) {
      fetchDegreeDetail();
    }
  }, [isOpen, degreeId]);

  const fetchDegreeDetail = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundDegree = mockDegrees.find(d => d.id === degreeId);
    setDegree(foundDegree || null);
    
    setIsLoading(false);
  };

  const handleApprove = () => {
    setAction('approve');
  };

  const handleReject = () => {
    setAction('reject');
  };

  const handleConfirmAction = async () => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (action === 'approve') {
        toast({
          title: 'Thành công',
          description: 'Đã phê duyệt bằng cấp',
        });
      } else {
        toast({
          title: 'Thành công',
          description: 'Đã từ chối bằng cấp',
        });
      }

      onSuccess();
      handleClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xử lý yêu cầu. Vui lòng thử lại sau.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAction = () => {
    setAction(null);
    setRejectionReason('');
  };

  const handleClose = () => {
    setAction(null);
    setRejectionReason('');
    onClose();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDING': { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'EXPIRED': { label: 'Hết hạn', className: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || { label: status, className: '' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'EDUCATION': { label: 'Học vấn', className: 'bg-blue-100 text-blue-800' },
      'CERTIFICATION': { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800' },
      'LICENSE': { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800' },
    };

    const config = typeConfig[type];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (!degree && !isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Phê duyệt bằng cấp</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : degree ? (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getTypeBadge(degree.type)}
                  {getStatusBadge(degree.status)}
                </div>
                <h3 className="text-xl font-semibold">{degree.name}</h3>
                {degree.major && (
                  <p className="text-muted-foreground">{degree.major}</p>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Nhân viên</span>
                </div>
                <p className="font-medium">{degree.employeeName}</p>
                <p className="text-sm text-muted-foreground">{degree.employeeCode}</p>
                <p className="text-sm text-muted-foreground">{degree.department} - {degree.position}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Tổ chức cấp</span>
                </div>
                <p className="font-medium">{degree.institution}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày hiệu lực</span>
                </div>
                <p className="font-medium">
                  {new Date(degree.issueDate).toLocaleDateString('vi-VN')}
                </p>
              </div>

              {degree.expiryDate && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ngày hết hạn</span>
                  </div>
                  <p className="font-medium">
                    {new Date(degree.expiryDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}

              {degree.certificateNumber && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Bằng cấp/chứng chỉ</span>
                  </div>
                  <p className="font-medium">{degree.certificateNumber}</p>
                </div>
              )}
            </div>

            {/* Submitted Date */}
            <div className="border rounded-lg p-3 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ngày nộp:</span>
                <span className="font-medium">
                  {new Date(degree.submittedDate).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Document */}
            {degree.documentUrl && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Tài liệu đính kèm</p>
                      <p className="text-sm text-muted-foreground">
                        {degree.documentUrl.split('/').pop()}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Xem/Tải xuống
                  </Button>
                </div>
              </div>
            )}

            {/* Notes */}
            {degree.notes && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Ghi chú từ nhân viên
                </h4>
                <p className="text-muted-foreground">{degree.notes}</p>
              </div>
            )}

            {/* Action Selection */}
            {!action && degree.status === 'PENDING' && (
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Phê duyệt
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Từ chối
                </Button>
              </div>
            )}

            {/* Approve Confirmation */}
            {action === 'approve' && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Xác nhận phê duyệt</h4>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Bạn có chắc chắn muốn phê duyệt bằng cấp này? Thông tin sẽ được lưu vào hồ sơ chính thức của nhân viên.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmAction}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Xác nhận phê duyệt
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelAction}
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            )}

            {/* Reject Form */}
            {action === 'reject' && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 mb-3">
                  <X className="h-5 w-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">Từ chối bằng cấp</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="rejectionReason" className="text-red-800">
                      Lý do từ chối <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Nhập lý do từ chối chi tiết để nhân viên có thể chỉnh sửa..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConfirmAction}
                      disabled={isSubmitting || !rejectionReason.trim()}
                      variant="destructive"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Xác nhận từ chối
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelAction}
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Already Processed */}
            {degree.status !== 'PENDING' && (
              <div className="border rounded-lg p-4 bg-muted">
                <p className="text-sm text-muted-foreground text-center">
                  Bằng cấp này đã được xử lý
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy thông tin bằng cấp
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}