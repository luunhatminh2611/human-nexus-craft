// pages/hr/documents/EmployeeDocumentsPage.tsx

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import {
  Search, Eye, ChevronLeft, ChevronRight, Plus, FileText,
  AlertCircle, Download, Trash2, ListPlus,
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { employeeDocumentApi } from '../api/document';
import DocumentDetailModal from '../components/DocumentDetailModal';
import UploadDocumentModal from '../components/UploadDocumentModal';
import BulkAddDocumentModal from '../components/BulkAddDocument';

// ─── Constants ────────────────────────────────────────────────────────────────
const DOC_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  RECRUITMENT: { label: 'Hồ sơ tuyển dụng', className: 'bg-blue-100 text-blue-800' },
  CONTRACT:    { label: 'Hợp đồng',          className: 'bg-purple-100 text-purple-800' },
  INSURANCE:   { label: 'Bảo hiểm & Thuế',   className: 'bg-green-100 text-green-800' },
  CERTIFICATE: { label: 'Bằng cấp',           className: 'bg-yellow-100 text-yellow-800' },
  DECISION:    { label: 'Quyết định',          className: 'bg-indigo-100 text-indigo-800' },
  TRAINING:    { label: 'Đào tạo',             className: 'bg-pink-100 text-pink-800' },
  OTHER:       { label: 'Khác',                className: 'bg-gray-100 text-gray-800' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EmployeeDocumentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  // Data
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<any>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchDocs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isAdmin) {
        // Admin có getAll thật
        const data = await employeeDocumentApi.getAll();
        setAllDocs(data || []);
      } else {
        // Employee: chỉ lấy của mình
        const data = await employeeDocumentApi.getByEmployeeId(user.employeeId);
        setAllDocs(data || []);
      }
    } catch {
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { fetchDocs(); }, [fetchDocs, refreshKey]);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
      await employeeDocumentApi.delete(docToDelete.id);
      toast.success('Đã xóa tài liệu');
      setRefreshKey(p => p + 1);
    } catch {
      toast.error('Không thể xóa tài liệu');
    } finally {
      setIsDeleteDialogOpen(false);
      setDocToDelete(null);
    }
  };

  // ─── Filter + Paginate ──────────────────────────────────────────────────────
  const filtered = allDocs.filter(d => {
    if (typeFilter !== 'ALL' && d.documentType !== typeFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        d.documentName?.toLowerCase().includes(s) ||
        d.fileName?.toLowerCase().includes(s) ||
        d.description?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hồ sơ</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Quản lý tài liệu và hồ sơ của tất cả nhân viên'
              : 'Xem tài liệu hồ sơ của bạn'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
              <ListPlus className="h-4 w-4 mr-2" /> Thêm hàng loạt
            </Button>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Thêm hồ sơ
            </Button>
          </div>
        )}
      </div>

      {/* Employee info banner */}
      {!isAdmin && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Thông tin hồ sơ</p>
              <p>Tài liệu hồ sơ được quản lý bởi phòng Nhân sự. Nếu cần cập nhật, vui lòng liên hệ phòng Nhân sự.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAdmin ? 'Tìm theo tên tài liệu, mô tả, tên file...' : 'Tìm theo tên tài liệu...'}
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              {Object.entries(DOC_TYPE_CONFIG).map(([v, cfg]) => (
                <SelectItem key={v} value={v}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên tài liệu</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>{isAdmin ? 'Không tìm thấy tài liệu nào' : 'Bạn chưa có tài liệu nào'}</p>
                      {!isAdmin && <p className="text-sm">Liên hệ phòng Nhân sự để cập nhật hồ sơ</p>}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(doc => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="font-medium">{doc.documentName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {DOC_TYPE_CONFIG[doc.documentType] ? (
                        <Badge className={DOC_TYPE_CONFIG[doc.documentType].className}>
                          {DOC_TYPE_CONFIG[doc.documentType].label}
                        </Badge>
                      ) : <span className="text-sm">{doc.documentType}</span>}
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground truncate max-w-[160px]">
                        {doc.fileName}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {doc.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="sm"
                          onClick={() => { setSelectedDocId(doc.id); setIsDetailModalOpen(true); }}
                          title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {doc.downloadUrl && (
                          <Button variant="ghost" size="sm"
                            onClick={() => window.open(doc.downloadUrl, '_blank')}
                            title="Tải xuống">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button variant="ghost" size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => { setDocToDelete(doc); setIsDeleteDialogOpen(true); }}
                            title="Xóa">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && paginated.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Hiển thị {startIndex} – {endIndex} trong {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={v => { setPageSize(Number(v)); setPage(0); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0}>Đầu</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">Trang {page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>Cuối</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <DocumentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedDocId(null); }}
        documentId={selectedDocId}
        isAdmin={isAdmin}
        onSuccess={() => setRefreshKey(p => p + 1)}
      />

      {isAdmin && (
        <>
          <UploadDocumentModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSuccess={() => { setRefreshKey(p => p + 1); setIsUploadModalOpen(false); }}
          />
          <BulkAddDocumentModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            onSuccess={() => setRefreshKey(p => p + 1)}
          />
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa tài liệu <b>"{docToDelete?.documentName}"</b>?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Xóa</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}