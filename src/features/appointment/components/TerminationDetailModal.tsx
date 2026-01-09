// pages/hr/components/TerminationDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Card } from '@/shared/components/ui/card';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Label } from '@/shared/components/ui/label';
import { Badge } from '@/shared/components/ui/badge';
import { 
  X, 
  UserMinus, 
  Briefcase, 
  Calendar,
  FileText,
  AlertCircle,
  Download,
  File,
  Link as LinkIcon
} from 'lucide-react';
import { mockTerminations, type Termination } from '../../../mock/appointment';

interface TerminationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  terminationId: string | null;
  onSuccess: () => void;
  isAdmin: boolean;
}

export default function TerminationDetailModal({
  isOpen,
  onClose,
  terminationId,
  onSuccess,
  isAdmin,
}: TerminationDetailModalProps) {
  const [termination, setTermination] = useState<Termination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && terminationId) {
      fetchTerminationDetails();
    }
  }, [isOpen, terminationId]);

  const fetchTerminationDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundTermination = mockTerminations.find(t => t.id === terminationId);
    if (foundTermination) {
      setTermination(foundTermination);
    }

    setIsLoading(false);
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

  if (!termination) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin quyết định miễn nhiệm</AlertDescription>
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
            <FileText className="h-5 w-5 text-orange-600" />
            Quyết định miễn nhiệm
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Information */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Số QĐ: {termination.decisionNumber}
                </span>
                <Badge className="bg-orange-100 text-orange-800">
                  Quyết định miễn nhiệm
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Ngày quyết định: {new Date(termination.decisionDate).toLocaleDateString('vi-VN')}
            </div>
          </div>

          {/* Employee Information */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-orange-900">
              <UserMinus className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Tên nhân viên</Label>
                <p className="font-medium text-lg">{termination.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng ban</Label>
                <p className="font-medium">{termination.department}</p>
              </div>
            </div>
          </Card>

          {/* Termination Details */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Chi tiết miễn nhiệm
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Chức vụ bị miễn nhiệm</Label>
                <p className="font-semibold text-lg">{termination.position}</p>
              </div>

              {termination.appointmentDecisionNumber && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <Label className="text-blue-900">Liên kết với quyết định bổ nhiệm</Label>
                      <p className="font-medium text-blue-700">
                        {termination.appointmentDecisionNumber}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Quyết định miễn nhiệm này liên quan đến quyết định bổ nhiệm trước đó
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Lý do miễn nhiệm</Label>
                <p className="whitespace-pre-wrap mt-1 text-justify">{termination.reason}</p>
              </div>
            </div>
          </Card>

          {/* Time Information */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Ngày quyết định</Label>
                <p className="font-medium">
                  {new Date(termination.decisionDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Ngày có hiệu lực miễn nhiệm</Label>
                <p className="font-medium">
                  {new Date(termination.effectiveDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
            
            {termination.decisionDate !== termination.effectiveDate && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Có khoảng thời gian {
                    Math.ceil(
                      (new Date(termination.effectiveDate).getTime() - new Date(termination.decisionDate).getTime()) 
                      / (1000 * 60 * 60 * 24)
                    )
                  } ngày giữa ngày quyết định và ngày có hiệu lực để thực hiện bàn giao công việc.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Attachments */}
          {termination.attachments && termination.attachments.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <File className="h-4 w-4" />
                File đính kèm ({termination.attachments.length})
              </h3>
              <div className="space-y-2">
                {termination.attachments.map((file) => (
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
          {termination.note && (
            <Card className="p-4 bg-muted/50">
              <Label className="text-muted-foreground">Ghi chú</Label>
              <p className="whitespace-pre-wrap mt-1 italic">{termination.note}</p>
            </Card>
          )}

          {/* Timeline Summary */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 border-l-4 border-l-blue-500">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tóm tắt thời gian
            </h3>
            <div className="space-y-3">
              {termination.appointmentDecisionNumber && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Bổ nhiệm</p>
                    <p className="text-xs text-muted-foreground">
                      Quyết định số {termination.appointmentDecisionNumber}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <div className="h-3 w-3 rounded-full bg-orange-600"></div>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Miễn nhiệm - {new Date(termination.decisionDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Có hiệu lực từ {new Date(termination.effectiveDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Created By */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>Người tạo: {termination.createdBy}</p>
            <p>Ngày tạo: {new Date(termination.createdAt).toLocaleString('vi-VN')}</p>
            {termination.updatedAt !== termination.createdAt && (
              <p>Cập nhật lần cuối: {new Date(termination.updatedAt).toLocaleString('vi-VN')}</p>
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