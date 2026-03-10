import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, ChevronLeft, ChevronRight, AlertCircle, FileText, Plus, Edit, Trash2, GraduationCap } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { certificateApi } from '@/features/degree/api/degree';
import DegreeDetailModal from '../components/DegreeDetailModal';
import DegreeFormModal from '../components/DegreeFormModal';
import BulkAddCertificateModal from '../components/BulkAddDegree';

export interface Certificate {
  id: number;
  certificateNumber?: string;
  certificateName: string;
  certificateType: string;
  organization: string;
  issueDate: string;
  expiryDate?: string;
  downloadUrl?: string;  // ✅ đổi từ attachment sang downloadUrl
  note?: string;
  deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  employeeId?: number;
  employeeName?: string;
  employeeCode?: string;
  department?: string;
}

export default function DegreeHRPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<Certificate | null>(null);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, [page, pageSize, searchTerm, typeFilter, refreshKey]);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const data = await certificateApi.getAll();
      let filtered: Certificate[] = data || [];

      if (typeFilter !== 'ALL') {
        filtered = filtered.filter((c) => c.certificateType === typeFilter);
      }

      if (searchTerm) {
        filtered = filtered.filter(
          (c) =>
            c.certificateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.certificateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setTotalItems(filtered.length);
      const start = page * pageSize;
      setCertificates(filtered.slice(start, start + pageSize));
    } catch (error) {
      console.error('Lỗi khi tải danh sách bằng cấp:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFormModal = (cert?: Certificate) => {
    setSelectedCertificate(cert || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedCertificate(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    handleCloseFormModal();
  };

  const handleOpenDetailModal = (id: number) => {
    setSelectedCertificateId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCertificateId(null);
  };

  const handleDeleteClick = (cert: Certificate) => {
    setCertificateToDelete(cert);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!certificateToDelete) return;
    try {
      await certificateApi.delete(certificateToDelete.id);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error('Lỗi khi xóa bằng cấp:', error);
    } finally {
      setIsDeleteDialogOpen(false);
      setCertificateToDelete(null);
    }
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

  const getExpiryWarning = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>Đã hết hạn</span>
        </div>
      );
    }
    if (days <= 30) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs">
          <AlertCircle className="h-3 w-3" />
          <span>Còn {days} ngày</span>
        </div>
      );
    }
    return null;
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bằng cấp</h1>
          <p className="text-muted-foreground">Lưu trữ và quản lý bằng cấp của tất cả nhân viên</p>
        </div>
        <div className='flex gap-2'>
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm bằng cấp
          </Button>
          <Button onClick={() => setIsBulkAddOpen(true)} variant="outline">
            <GraduationCap className="h-4 w-4 mr-2" />
            Thêm hàng loạt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên nhân viên, mã nhân viên, tên bằng cấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại</SelectItem>
              <SelectItem value="EDUCATION">Học vấn</SelectItem>
              <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
              <SelectItem value="LICENSE">Giấy phép</SelectItem>
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tên bằng cấp</TableHead>
                <TableHead>Tổ chức cấp</TableHead>
                <TableHead>Số bằng cấp</TableHead>
                <TableHead>Ngày cấp</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : certificates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>Không tìm thấy bằng cấp nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cert.employeeName || '-'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(cert.certificateType)}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{cert.certificateName}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cert.organization}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cert.certificateNumber || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {cert.expiryDate ? (
                        <div>
                          <span className="text-sm">
                            {new Date(cert.expiryDate).toLocaleDateString('vi-VN')}
                          </span>
                          {getExpiryWarning(cert.expiryDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Vô thời hạn</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetailModal(cert.id)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenFormModal(cert)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(cert)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && certificates.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => { setPageSize(Number(value)); setPage(0); }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0}>Đầu</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">Trang {page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>Cuối</Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <DegreeDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        certificateId={selectedCertificateId}
      />

      <DegreeFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        certificate={selectedCertificate}
        onSuccess={handleFormSuccess}
      />

      <BulkAddCertificateModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={() => fetchCertificates()}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bằng cấp "{certificateToDelete?.certificateName}"?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}