import { useEffect, useState } from 'react';
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
} from 'lucide-react';

import {
  TerminationDecision,
  mockTerminationDecisions,
} from '../../../mock/contractDecision';

interface TerminationDecisionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  decisionId: string | null;
}

export default function TerminationDecisionDetailModal({
  isOpen,
  onClose,
  decisionId,
}: TerminationDecisionDetailModalProps) {
  const [decision, setDecision] =
    useState<TerminationDecision | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && decisionId) {
      loadDecision();
    }
  }, [isOpen, decisionId]);

  const loadDecision = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const found = mockTerminationDecisions.find(
      d => d.id === decisionId,
    );
    setDecision(found || null);
    setIsLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
      ' ' +
      sizes[i]
    );
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ================= NOT FOUND ================= */
  if (!decision) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>
              Không tìm thấy quyết định chấm dứt hợp đồng
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  /* ================= RENDER ================= */
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            Quyết định chấm dứt hợp đồng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Số QĐ: {decision.decisionNumber}
              </span>
              <Badge variant="destructive">
                Chấm dứt hợp đồng
              </Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              Ngày quyết định:{' '}
              {new Date(decision.decisionDate).toLocaleDateString(
                'vi-VN',
              )}
            </span>
          </div>

          {/* ===== EMPLOYEE INFO ===== */}
          <Card className="p-4 bg-red-50 border-red-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-red-900">
              <UserMinus className="h-4 w-4" />
              Thông tin nhân viên
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">
                  Họ tên
                </Label>
                <p className="font-semibold text-lg">
                  {decision.employeeName}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Phòng ban
                </Label>
                <p className="font-medium">
                  {decision.department}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Chức vụ
                </Label>
                <p className="font-medium">
                  {decision.position}
                </p>
              </div>
            </div>
          </Card>

          {/* ===== TERMINATION DETAIL ===== */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Nội dung chấm dứt
            </h3>

            <div>
              <Label className="text-muted-foreground">
                Lý do
              </Label>
              <p className="mt-1 whitespace-pre-wrap text-justify">
                {decision.reason}
              </p>
            </div>
          </Card>

          {/* ===== TIME ===== */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thời gian
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">
                  Ngày quyết định
                </Label>
                <p className="font-medium">
                  {new Date(
                    decision.decisionDate,
                  ).toLocaleDateString('vi-VN')}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">
                  Ngày hiệu lực
                </Label>
                <p className="font-medium">
                  {new Date(
                    decision.effectiveDate,
                  ).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {decision.decisionDate !==
              decision.effectiveDate && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Có{' '}
                  {Math.ceil(
                    (new Date(
                      decision.effectiveDate,
                    ).getTime() -
                      new Date(
                        decision.decisionDate,
                      ).getTime()) /
                      (1000 * 60 * 60 * 24),
                  )}{' '}
                  ngày để thực hiện các thủ tục bàn giao.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* ===== ATTACHMENTS ===== */}
          {decision.attachments &&
            decision.attachments.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <File className="h-4 w-4" />
                  File đính kèm (
                  {decision.attachments.length})
                </h3>

                <div className="space-y-2">
                  {decision.attachments.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                    >
                      <FileText className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)} •{' '}
                          {new Date(
                            file.uploadedAt,
                          ).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          console.log(
                            'Download',
                            file.name,
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* ===== NOTE ===== */}
          {decision.note && (
            <Card className="p-4 bg-muted/50">
              <Label className="text-muted-foreground">
                Ghi chú
              </Label>
              <p className="mt-1 italic whitespace-pre-wrap">
                {decision.note}
              </p>
            </Card>
          )}

          {/* ===== CREATED INFO ===== */}
          <div className="text-sm text-muted-foreground border-t pt-4">
            <p>Người tạo: {decision.createdBy}</p>
            <p>
              Ngày tạo:{' '}
              {new Date(decision.createdAt).toLocaleString(
                'vi-VN',
              )}
            </p>
            {decision.updatedAt !== decision.createdAt && (
              <p>
                Cập nhật:{' '}
                {new Date(
                  decision.updatedAt,
                ).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>

          <Button
            variant="outline"
            onClick={() => console.log('Export PDF')}
          >
            <Download className="h-4 w-4 mr-2" />
            Tải PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
