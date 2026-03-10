// components/DocumentDetailModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { FileText, Download, Trash2, File } from 'lucide-react';
import { toast } from 'sonner';
import { employeeDocumentApi } from '../api/document';

interface DocumentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  isAdmin: boolean;
  onSuccess: () => void;
}

const DOC_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  RECRUITMENT: { label: 'Hồ sơ tuyển dụng', className: 'bg-blue-100 text-blue-800' },
  CONTRACT:    { label: 'Hợp đồng',          className: 'bg-purple-100 text-purple-800' },
  INSURANCE:   { label: 'Bảo hiểm & Thuế',   className: 'bg-green-100 text-green-800' },
  CERTIFICATE: { label: 'Bằng cấp',           className: 'bg-yellow-100 text-yellow-800' },
  DECISION:    { label: 'Quyết định',          className: 'bg-indigo-100 text-indigo-800' },
  TRAINING:    { label: 'Đào tạo',             className: 'bg-pink-100 text-pink-800' },
  OTHER:       { label: 'Khác',                className: 'bg-gray-100 text-gray-800' },
};

export default function DocumentDetailModal({
  isOpen, onClose, documentId, isAdmin, onSuccess,
}: DocumentDetailModalProps) {
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentId) return;
    setIsLoading(true);
    employeeDocumentApi.getById(documentId)
      .then(d => setDoc(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isOpen, documentId]);

  const handleDownload = () => {
    if (doc?.downloadUrl) window.open(doc.downloadUrl, '_blank');
  };

  const handleDelete = async () => {
    if (!doc) return;
    setIsDeleting(true);
    try {
      await employeeDocumentApi.delete(doc.id);
      toast.success('Đã xóa tài liệu');
      onSuccess();
      onClose();
    } catch {
      toast.error('Không thể xóa tài liệu');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Chi tiết tài liệu
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </div>
          ) : !doc ? (
            <p className="text-center py-10 text-muted-foreground">Không tìm thấy thông tin tài liệu</p>
          ) : (
            <div className="space-y-4">
              {/* Tên + loại */}
              <div>
                <h3 className="text-lg font-semibold">{doc.documentName}</h3>
                <div className="mt-2">
                  {DOC_TYPE_CONFIG[doc.documentType] ? (
                    <Badge className={DOC_TYPE_CONFIG[doc.documentType].className}>
                      {DOC_TYPE_CONFIG[doc.documentType].label}
                    </Badge>
                  ) : (
                    <Badge>{doc.documentType}</Badge>
                  )}
                </div>
              </div>

              {/* Mô tả */}
              {doc.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Mô tả</Label>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{doc.description}</p>
                </div>
              )}

              {/* File */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 border rounded-lg">
                <File className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.fileName}</p>
                  {doc.fileType && (
                    <p className="text-xs text-muted-foreground">{doc.fileType}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>Đóng</Button>
            {doc?.downloadUrl && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" /> Tải xuống
              </Button>
            )}
            {isAdmin && doc && (
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)} disabled={isDeleting}>
                <Trash2 className="h-4 w-4 mr-2" /> Xóa tài liệu
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu "<b>{doc?.documentName}</b>"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}