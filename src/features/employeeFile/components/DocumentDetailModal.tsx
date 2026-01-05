// pages/hr/components/DocumentDetailModal.tsx

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
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { 
  X, 
  FileText, 
  Download,
  Eye,
  Trash2,
  AlertCircle,
  User,
  Calendar,
  File,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { mockEmployeeDocuments, type EmployeeDocument, documentTypeLabels } from '../../../mock/employeeFile';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
  isAdmin: boolean;
  onSuccess: () => void;
}

export default function DocumentDetailModal({
  isOpen,
  onClose,
  documentId,
  isAdmin,
  onSuccess,
}: DocumentDetailModalProps) {
  const [document, setDocument] = useState<EmployeeDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocumentDetails();
    }
  }, [isOpen, documentId]);

  const fetchDocumentDetails = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const foundDocument = mockEmployeeDocuments.find(d => d.id === documentId);
    if (foundDocument) {
      setDocument(foundDocument);
    }

    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!document) return;
    console.log('Downloading document:', document.id);
    // Implement download logic
  };

  const handleDelete = async () => {
    if (!document) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa tài liệu "${document.documentName}"?`)) {
      return;
    }

    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Deleting document:', document.id);

    setIsDeleting(false);
    onSuccess();
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      'RECRUITMENT': { label: documentTypeLabels.RECRUITMENT, className: 'bg-blue-100 text-blue-800' },
      'CONTRACT': { label: documentTypeLabels.CONTRACT, className: 'bg-purple-100 text-purple-800' },
      'INSURANCE': { label: documentTypeLabels.INSURANCE, className: 'bg-green-100 text-green-800' },
      'CERTIFICATE': { label: documentTypeLabels.CERTIFICATE, className: 'bg-yellow-100 text-yellow-800' },
      'DECISION': { label: documentTypeLabels.DECISION, className: 'bg-indigo-100 text-indigo-800' },
      'TRAINING': { label: documentTypeLabels.TRAINING, className: 'bg-pink-100 text-pink-800' },
      'OTHER': { label: documentTypeLabels.OTHER, className: 'bg-gray-100 text-gray-800' },
    };

    const config = typeConfig[type] || { label: type, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  };

  const isExpired = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
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

  if (!document) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>Không tìm thấy thông tin tài liệu</AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Chi tiết tài liệu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{document.documentName}</h3>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge(document.documentType)}
                {document.isImportant && (
                  <Badge variant="outline" className="text-red-600">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Quan trọng
                  </Badge>
                )}
                {document.isConfidential && (
                  <Badge variant="outline" className="text-orange-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Bảo mật
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Expiry Alert */}
          {document.expiryDate && isExpired(document.expiryDate) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tài liệu này đã hết hạn vào ngày {new Date(document.expiryDate).toLocaleDateString('vi-VN')}. 
                Vui lòng cập nhật tài liệu mới.
              </AlertDescription>
            </Alert>
          )}

          {document.expiryDate && isExpiringSoon(document.expiryDate) && !isExpired(document.expiryDate) && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Tài liệu này sắp hết hạn vào ngày {new Date(document.expiryDate).toLocaleDateString('vi-VN')}. 
                Vui lòng chuẩn bị cập nhật.
              </AlertDescription>
            </Alert>
          )}

          {/* Employee Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Thông tin nhân viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Tên nhân viên</Label>
                <p className="font-medium">{document.employeeName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Mã nhân viên</Label>
                <p className="font-medium">{document.employeeId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phòng ban</Label>
                <p className="font-medium">{document.departmentName}</p>
              </div>
            </div>
          </Card>

          {/* Document Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <File className="h-4 w-4" />
              Thông tin tài liệu
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tên file</Label>
                  <p className="font-mono text-sm">{document.fileName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Dung lượng</Label>
                  <p className="font-medium">{formatFileSize(document.fileSize)}</p>
                </div>
              </div>

              {document.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="whitespace-pre-wrap">{document.description}</p>
                </div>
              )}

              {document.decisionNumber && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Số quyết định</Label>
                    <p className="font-medium">{document.decisionNumber}</p>
                  </div>
                  {document.issueDate && (
                    <div>
                      <Label className="text-muted-foreground">Ngày ban hành</Label>
                      <p className="font-medium">
                        {new Date(document.issueDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {document.expiryDate && (
                <div>
                  <Label className="text-muted-foreground">Ngày hết hạn</Label>
                  <p className="font-medium">
                    {new Date(document.expiryDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Upload Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin upload
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Người upload</Label>
                <p className="font-medium">{document.uploadedBy}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Thời gian upload</Label>
                <p className="font-medium">
                  {new Date(document.uploadedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            {document.updatedAt !== document.uploadedAt && (
              <div className="mt-2">
                <Label className="text-muted-foreground">Cập nhật lần cuối</Label>
                <p className="font-medium">
                  {new Date(document.updatedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            )}
          </Card>

          {/* Preview placeholder */}
          <Card className="p-8 bg-muted/50">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <FileText className="h-16 w-16" />
              <p className="text-sm">Xem trước file: {document.fileName}</p>
              <p className="text-xs">Preview sẽ được hiển thị ở đây khi tích hợp viewer</p>
            </div>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>

          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Tải xuống
          </Button>

          {isAdmin && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa tài liệu
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}