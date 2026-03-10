// components/SocialInsuranceDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { BookOpen, Hash, Calendar, DollarSign, FileText, Download } from 'lucide-react';
import { employeeSocialInsuranceApi } from '../api/socialInsurance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  recordId: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Đang tham gia', className: 'bg-green-100 text-green-800' },
  INACTIVE:  { label: 'Ngừng tham gia', className: 'bg-gray-100 text-gray-800' },
  SUSPENDED: { label: 'Tạm dừng',       className: 'bg-yellow-100 text-yellow-800' },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

export default function SocialInsuranceDetailModal({ isOpen, onClose, recordId }: Props) {
  const [record, setRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !recordId) return;
    setIsLoading(true);
    employeeSocialInsuranceApi.getById(recordId)
      .then(d => setRecord(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen, recordId]);

  const handleDownload = () => {
    if (record?.downloadUrl) window.open(record.downloadUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bảo hiểm xã hội</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : !record ? (
          <div className="text-center py-10 text-muted-foreground">Không tìm thấy thông tin</div>
        ) : (
          <div className="space-y-4">
            {/* Trạng thái */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Trạng thái</span>
              {STATUS_CONFIG[record.status] ? (
                <Badge className={STATUS_CONFIG[record.status].className}>
                  {STATUS_CONFIG[record.status].label}
                </Badge>
              ) : (
                <span className="text-sm font-medium">{record.status}</span>
              )}
            </div>

            {/* Thông tin sổ BHXH */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Thông tin sổ BHXH
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Số sổ BHXH</p>
                    <p className="font-medium text-sm">{record.insuranceBookNumber}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mã số BHXH</p>
                    <p className="font-medium text-sm">{record.insuranceCode}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                    <p className="font-medium text-sm">
                      {new Date(record.startDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mức lương đóng</p>
                    <p className="font-medium text-sm">{formatCurrency(record.salaryBase)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {record.note && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                <p className="text-sm p-3 bg-muted/30 rounded">{record.note}</p>
              </div>
            )}

            {/* File đính kèm */}
            {record.fileName && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border rounded">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">{record.fileName}</p>
                    {record.fileType && (
                      <p className="text-xs text-muted-foreground">{record.fileType}</p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" /> Tải xuống
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}