import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Plus, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, Upload, Download, Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import BulkAddPartyCommitteeModal from './modal/BulkAddPartyCommitteeModal';
import BulkEditPartyCommitteeModal from './modal/BulkEditPartyCommitteeModal';
import { partyCommitteeApi } from '../api/categoriesApi';

interface PartyCommittee {
  id: number;
  code?: string;
  name: string;
}

export default function PartyCommitteeTab() {
  const [items, setItems] = useState<PartyCommittee[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PartyCommittee | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({ name: '', code: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await partyCommitteeApi.getAll();
      setItems(data || []);
    } catch {
      toast.error('Không thể tải danh sách cấp ủy');
    } finally {
      setLoading(false);
    }
  };

  // ── Filter & paginate ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return items.filter(i =>
      i.name.toLowerCase().includes(s) ||
      (i.code && i.code.toLowerCase().includes(s)),
    );
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // ── Checkbox ─────────────────────────────────────────────────────────────
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedIds(checked ? paginated.map(i => i.id) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
      setSelectAll(false);
    }
  };

  useEffect(() => {
    setSelectAll(selectedIds.length === paginated.length && paginated.length > 0);
  }, [selectedIds, paginated]);

  useEffect(() => {
    setSelectedIds([]);
    setSelectAll(false);
  }, [currentPage, searchTerm]);

  // ── Dialog helpers ────────────────────────────────────────────────────────
  const handleOpenDialog = (item?: PartyCommittee) => {
    if (item) {
      setSelectedItem(item);
      setFormData({ name: item.name, code: item.code || '' });
    } else {
      setSelectedItem(null);
      setFormData({ name: '', code: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
    setFormData({ name: '', code: '' });
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên cấp ủy');
      return;
    }
    try {
      setLoading(true);
      if (selectedItem) {
        await partyCommitteeApi.update(selectedItem.id, formData);
        toast.success('Cập nhật cấp ủy thành công');
      } else {
        await partyCommitteeApi.create(formData);
        toast.success('Thêm cấp ủy thành công');
      }
      handleCloseDialog();
      fetchItems();
    } catch {
      toast.error(selectedItem ? 'Cập nhật thất bại' : 'Thêm mới thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      await partyCommitteeApi.delete(selectedItem.id);
      toast.success('Xóa cấp ủy thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch {
      toast.error('Xóa cấp ủy thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEdit = () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một cấp ủy');
      return;
    }
    setIsBulkEditOpen(true);
  };

  const handleCloseBulkEdit = () => {
    setIsBulkEditOpen(false);
    setSelectedIds([]);
    setSelectAll(false);
    fetchItems();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã cấp ủy..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button className="shrink-0" variant="outline">
          <Upload className="mr-1 h-4 w-4" /> Tải lên
        </Button>
        <Button className="shrink-0" variant="outline">
          <Download className="mr-1 h-4 w-4" /> Tải xuống
        </Button>
        <Button
          className="shrink-0" variant="default"
          onClick={handleBulkEdit}
          disabled={selectedIds.length === 0}
        >
          <Edit className="mr-2 h-4 w-4" /> Sửa ({selectedIds.length})
        </Button>
        <Button onClick={() => setIsBulkAddOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Thêm cấp ủy
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[50px] border">
                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
              </TableHead>
              <TableHead className="w-[80px] border">STT</TableHead>
              <TableHead className="border">Mã cấp ủy</TableHead>
              <TableHead className="border">Tên cấp ủy</TableHead>
              <TableHead className="text-center w-[150px] border">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Đang tải...</TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có dữ liệu'}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="border">
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={checked => handleSelectOne(item.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium border">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell className="border">
                    {item.code ? (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                        {item.code}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="font-medium border">{item.name}</TableCell>
                  <TableCell className="text-center border">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }}
                        className="hover:bg-red-50 hover:text-red-600"
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
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} –{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} trong tổng số{' '}
            {filtered.length} cấp ủy
            {selectedIds.length > 0 && (
              <span className="ml-2 font-semibold text-blue-600">({selectedIds.length} được chọn)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" /> Trước
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm"
                      onClick={() => setCurrentPage(page)} className="w-10">
                      {page}
                    </Button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>;
                }
                return null;
              })}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
              Sau <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog thêm/sửa */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Cập nhật cấp ủy' : 'Thêm cấp ủy mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã cấp ủy</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ví dụ: CU-01..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Tên cấp ủy <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên cấp ủy..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : selectedItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <p>Bạn có chắc chắn muốn xóa cấp ủy <strong>"{selectedItem?.name}"</strong> không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setSelectedItem(null); }}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Add */}
      <BulkAddPartyCommitteeModal
        isOpen={isBulkAddOpen}
        onClose={() => { setIsBulkAddOpen(false); fetchItems(); }}
      />

      {/* Bulk Edit */}
      <BulkEditPartyCommitteeModal
        isOpen={isBulkEditOpen}
        onClose={handleCloseBulkEdit}
        preSelectedIds={selectedIds}
      />
    </div>
  );
}