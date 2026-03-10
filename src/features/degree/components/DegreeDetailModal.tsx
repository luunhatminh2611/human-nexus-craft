import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { FileText, Download, Calendar, Building, Award, User } from 'lucide-react';
import { certificateApi } from '@/features/degree/api/degree';
import type { Certificate } from '../pages/DegreeHRPage';

interface DegreeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateId: number | null;
}

export default function DegreeDetailModal({ isOpen, onClose, certificateId }: DegreeDetailModalProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && certificateId != null) {
      fetchDetail();
    }
  }, [isOpen, certificateId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await certificateApi.getById(certificateId!);
      setCertificate(res?.data || res);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết bằng cấp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!certificate?.downloadUrl) return;
    // ✅ Dùng downloadUrl từ response trực tiếp
    const a = document.createElement('a');
    a.href = certificate.downloadUrl;
    a.target = '_blank';
    a.click();
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      EDUCATION: { label: 'Học vấn', className: 'bg-blue-100 text-blue-800' },
      CERTIFICATION: { label: 'Chứng chỉ', className: 'bg-purple-100 text-purple-800' },
      LICENSE: { label: 'Giấy phép', className: 'bg-orange-100 text-orange-800' },
    };
    const config = typeConfig[type];
    if (!config) return null;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bằng cấp</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </div>
        ) : certificate ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              {getTypeBadge(certificate.certificateType)}
              <h3 className="text-xl font-semibold">{certificate.certificateName}</h3>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4">
              {certificate.employeeName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Nhân viên</span>
                  </div>
                  <p className="font-medium">{certificate.employeeName}</p>
                  {certificate.employeeCode && (
                    <p className="text-sm text-muted-foreground">{certificate.employeeCode}</p>
                  )}
                  {certificate.department && (
                    <p className="text-sm text-muted-foreground">{certificate.department}</p>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  <span>Tổ chức cấp</span>
                </div>
                <p className="font-medium">{certificate.organization}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày cấp</span>
                </div>
                <p className="font-medium">
                  {certificate.issueDate
                    ? new Date(certificate.issueDate).toLocaleDateString('vi-VN')
                    : '-'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Ngày hết hạn</span>
                </div>
                <p className="font-medium">
                  {certificate.expiryDate
                    ? new Date(certificate.expiryDate).toLocaleDateString('vi-VN')
                    : 'Vô thời hạn'}
                </p>
              </div>

              {certificate.certificateNumber && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>Số bằng cấp / chứng chỉ</span>
                  </div>
                  <p className="font-medium">{certificate.certificateNumber}</p>
                </div>
              )}
            </div>

            {certificate.downloadUrl && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Tài liệu đính kèm</p>
                      <p className="text-sm text-muted-foreground">
                        {certificate.certificateName}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Tải xuống
                  </Button>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-semibold mb-3">Thông tin lưu trữ</h4>
              <div className="space-y-2 text-sm">
                {certificate.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày tạo:</span>
                    <span className="font-medium">
                      {new Date(certificate.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
                {certificate.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày cập nhật:</span>
                    <span className="font-medium">
                      {new Date(certificate.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {certificate.note && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Ghi chú</h4>
                <p className="text-muted-foreground">{certificate.note}</p>
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