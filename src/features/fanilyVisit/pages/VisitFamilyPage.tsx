import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Plus, Eye, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { employeeVisitApi, EmployeeVisit } from '../api/familyVisitApi';
import FamilyVisitFormModal from '../components/VisitFormModal';
import FamilyVisitDetailModal from '../components/VisitDetailModal';
import BulkAddVisitModal from '../components/BulkAddVisitModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';

const VISIT_TYPES = ['Thăm ốm', 'Thăm hiếu', 'Thăm hỷ', 'Thăm sinh nhật', 'Thăm khác'];

export default function FamilyVisitList() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [visits, setVisits] = useState<EmployeeVisit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<EmployeeVisit | null>(null);

  const fetchVisits = useCallback(async () => {
    setIsLoading(true);
    try {
      let data: EmployeeVisit[];
      if (!isAdmin && user?.employeeId) {
        data = await employeeVisitApi.getByEmployee(user.employeeId);
      } else {
        // Admin: fetch all — dùng getByEmployee với employeeId=0 nếu BE không có getAll
        // Thay bằng endpoint getAll nếu BE hỗ trợ
        data = await employeeVisitApi.getByEmployee(0);
      }
      setVisits(data || []);
    } catch {
      toast.error('Không thể tải danh sách thăm nhân');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user?.employeeId]);

  useEffect(() => { fetchVisits(); }, [fetchVisits]);

  const filteredVisits = useMemo(() => {
    const text = searchTerm.toLowerCase();
    return visits.filter(v => {
      const matchSearch =
        v.visitedPerson?.toLowerCase().includes(text) ||
        v.visitType?.toLowerCase().includes(text) ||
        v.representative?.toLowerCase().includes(text);
      const matchStatus = filterStatus === 'all' || v.status === filterStatus;
      const matchType = filterType === 'all' || v.visitType === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [visits, searchTerm, filterStatus, filterType]);

  const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
  const paginatedVisits = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVisits.slice(start, start + itemsPerPage);
  }, [filteredVisits, currentPage, itemsPerPage]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa lượt thăm này?')) return;
    try {
      await employeeVisitApi.delete(id);
      setVisits(prev => prev.filter(v => v.id !== id));
      toast.success('Đã xóa lượt thăm người thân');
    } catch {
      toast.error('Không thể xóa lượt thăm');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isAdmin ? 'Thăm nhân' : 'Thăm nhân của tôi'}</h1>
          <p className="text-muted-foreground">
            {isAdmin ? 'Quản lý các lượt thăm hỏi người thân của tất cả nhân viên' : 'Xem các lượt thăm người thân của bạn'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={() => { setSelectedVisit(null); setIsFormModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Thêm thăm nhân
            </Button>
            <Button variant="outline" onClick={() => setIsBulkAddOpen(true)}>
              <Users className="h-4 w-4 mr-2" /> Thêm hàng loạt
            </Button>
          </div>
        )}
      </div>

      {/* FILTERS */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo người thăm, loại thăm..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={v => { setFilterType(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Loại thăm" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              {VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Đã thăm">Đã thăm</SelectItem>
              <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-16">STT</TableHead>
                  <TableHead>Loại thăm</TableHead>
                  <TableHead>Người được thăm</TableHead>
                  <TableHead>Ngày thăm</TableHead>
                  <TableHead>Quà tặng</TableHead>
                  <TableHead>Người đại diện</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-center w-28">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-8 w-8" />
                        <p>Chưa có dữ liệu</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedVisits.map((visit, index) => (
                  <TableRow key={visit.id}>
                    <TableCell className="text-center text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell><Badge variant="outline">{visit.visitType}</Badge></TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{visit.visitedPerson}</p>
                        <p className="text-xs text-muted-foreground">{visit.relationship}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(visit.visitDate)}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{formatCurrency(visit.giftAmount)}</p>
                        {visit.giftDescription && <p className="text-xs text-muted-foreground">{visit.giftDescription}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{visit.representative || '—'}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={visit.status === 'Đã thăm' ? 'default' : 'secondary'}>
                        {visit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-center">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedVisit(visit); setIsDetailModalOpen(true); }} title="Xem chi tiết">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedVisit(visit); setIsFormModalOpen(true); }} title="Chỉnh sửa">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={e => handleDelete(visit.id, e)} title="Xóa" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* PAGINATION */}
      {filteredVisits.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hiển thị</span>
              <Select value={itemsPerPage.toString()} onValueChange={v => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">mục · Tổng {filteredVisits.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>Đầu</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Trước</Button>
              <span className="text-sm px-3">Trang {currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Sau</Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Cuối</Button>
            </div>
          </div>
        </Card>
      )}

      {/* MODALS */}
      <FamilyVisitFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedVisit(null); }}
        visit={selectedVisit}
        onSuccess={() => { setIsFormModalOpen(false); setSelectedVisit(null); fetchVisits(); }}
      />
      <FamilyVisitDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedVisit(null); }}
        visit={selectedVisit}
      />
      <BulkAddVisitModal
        isOpen={isBulkAddOpen}
        onClose={() => setIsBulkAddOpen(false)}
        onSuccess={() => { setIsBulkAddOpen(false); fetchVisits(); }}
      />
    </div>
  );
}