// pages/hr/insurance/SocialInsurancePage.tsx

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import {
  Search, Eye, ChevronLeft, ChevronRight, Plus, Edit,
  Trash2, FileText, ListPlus, AlertCircle, Download,
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
import { employeeSocialInsuranceApi } from '../api/socialInsurance';
import { employeeApi } from '@/features/employees/api/employeeApi';
import SocialInsuranceFormModal from '../components/InsuranceFormModal';
import SocialInsuranceDetailModal from '../components/InsuranceDetailModal';
import BulkAddSocialInsuranceModal from '../components/BulkAddSocialInsuranceModal';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ACTIVE:    { label: 'Đang tham gia', className: 'bg-green-100 text-green-800' },
  INACTIVE:  { label: 'Ngừng tham gia', className: 'bg-gray-100 text-gray-800' },
  SUSPENDED: { label: 'Tạm dừng',       className: 'bg-yellow-100 text-yellow-800' },
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SocialInsurancePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  // Data
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isAdmin) {
        // Admin: lấy tất cả NV → song song lấy BHXH
        const employees = await employeeApi.getAll();
        const results = await Promise.allSettled(
          (employees || []).map((emp: any) =>
            employeeSocialInsuranceApi.getByEmployeeId(emp.id).then((records: any[]) =>
              (records || []).map(r => ({
                ...r,
                employeeName: emp.fullName,
                employeeCode: emp.employeeCode,
                departmentName: emp.departmentName,
              })),
            ),
          ),
        );
        setAllRecords(results.flatMap(r => (r.status === 'fulfilled' ? r.value : [])));
      } else {
        // Nhân viên: chỉ lấy của chính mình
        const data = await employeeSocialInsuranceApi.getByEmployeeId(user.employeeId);
        setAllRecords(data || []);
      }
    } catch {
      toast.error('Không thể tải dữ liệu BHXH');
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { fetchRecords(); }, [fetchRecords, refreshKey]);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      await employeeSocialInsuranceApi.delete(recordToDelete.id);
      toast.success('Đã xóa thông tin BHXH');
      setRefreshKey(p => p + 1);
    } catch {
      toast.error('Không thể xóa thông tin BHXH');
    } finally {
      setIsDeleteDialogOpen(false);
      setRecordToDelete(null);
    }
  };

  // ─── Filter + Paginate ──────────────────────────────────────────────────────
  const filtered = allRecords.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        r.employeeName?.toLowerCase().includes(s) ||
        r.employeeCode?.toLowerCase().includes(s) ||
        r.insuranceBookNumber?.toLowerCase().includes(s) ||
        r.insuranceCode?.toLowerCase().includes(s)
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
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý bảo hiểm xã hội' : 'Bảo hiểm xã hội của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Quản lý thông tin BHXH của tất cả nhân viên'
              : 'Xem thông tin BHXH, BHYT, BHTN của bạn'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => { setSelectedRecord(null); setIsFormModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Thêm hồ sơ BHXH
            </Button>
            <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
              <ListPlus className="h-4 w-4 mr-2" /> Thêm hàng loạt
            </Button>
          </div>
        )}
      </div>

      {/* Info banner (employee only) */}
      {!isAdmin && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Thông tin quan trọng</p>
              <p>
                Thông tin BHXH của bạn được quản lý bởi phòng Nhân sự.
                Nếu có thắc mắc hoặc cần cập nhật, vui lòng liên hệ phòng Nhân sự.
              </p>
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
              placeholder={
                isAdmin
                  ? 'Tìm theo tên NV, mã NV, số sổ, mã số BHXH...'
                  : 'Tìm theo số sổ, mã số BHXH...'
              }
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full md:w-[190px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
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
                {isAdmin && <TableHead>Nhân viên</TableHead>}
                <TableHead>Số sổ BHXH</TableHead>
                <TableHead>Mã số BHXH</TableHead>
                <TableHead>Ngày tham gia</TableHead>
                <TableHead>Mức lương đóng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p>
                        {isAdmin
                          ? 'Không tìm thấy hồ sơ BHXH nào'
                          : 'Bạn chưa có thông tin BHXH nào'}
                      </p>
                      {!isAdmin && (
                        <p className="text-sm">Liên hệ phòng Nhân sự để cập nhật</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map(record => (
                  <TableRow key={record.id}>
                    {/* Cột nhân viên chỉ admin thấy */}
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.employeeName}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.employeeCode}
                            {record.departmentName && ` · ${record.departmentName}`}
                          </p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm font-medium">
                      {record.insuranceBookNumber}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.insuranceCode}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(record.startDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatCurrency(record.salaryBase)}
                    </TableCell>
                    <TableCell>
                      {STATUS_CONFIG[record.status] ? (
                        <Badge className={STATUS_CONFIG[record.status].className}>
                          {STATUS_CONFIG[record.status].label}
                        </Badge>
                      ) : (
                        <span className="text-sm">{record.status}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => { setSelectedRecordId(record.id); setIsDetailModalOpen(true); }}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {/* Tải file — employee tự xem */}
                        {!isAdmin && record.fileName && (
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => window.open(record.downloadUrl, '_blank')}
                            title="Tải xuống tài liệu"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {/* Admin: sửa + xóa */}
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => { setSelectedRecord(record); setIsFormModalOpen(true); }}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => { setRecordToDelete(record); setIsDeleteDialogOpen(true); }}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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
              Hiển thị {startIndex} – {endIndex} trong tổng số {totalItems}
            </p>
            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={v => { setPageSize(Number(v)); setPage(0); }}
              >
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0}>
                  Đầu
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm">Trang {page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      <SocialInsuranceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedRecordId(null); }}
        recordId={selectedRecordId}
      />

      {isAdmin && (
        <>
          <SocialInsuranceFormModal
            isOpen={isFormModalOpen}
            onClose={() => { setIsFormModalOpen(false); setSelectedRecord(null); }}
            record={selectedRecord}
            onSuccess={() => {
              setRefreshKey(p => p + 1);
              setIsFormModalOpen(false);
              setSelectedRecord(null);
            }}
          />

          <BulkAddSocialInsuranceModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            onSuccess={() => setRefreshKey(p => p + 1)}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa thông tin BHXH của nhân viên{' '}
                  <b>{recordToDelete?.employeeName}</b>{' '}
                  (sổ: {recordToDelete?.insuranceBookNumber})?
                  Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}