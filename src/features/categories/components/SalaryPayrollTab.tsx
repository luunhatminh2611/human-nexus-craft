import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload, Edit } from 'lucide-react';
import { payrollApi } from '@/features/payroll/api/payroll';
import { toast } from 'sonner';
import GenericBulkAddModal from './bulk/BulkAddModal';
import GenericBulkEditModal from './bulk/BulkEditModal';

const PAYROLL_FIELDS = [
  { key: 'code', label: 'Mã bảng lương',  required: false, type: 'input' as const, placeholder: 'VD: BL01...', width: 20 },
  { key: 'name', label: 'Tên bảng lương', required: true,  type: 'input' as const, placeholder: 'Nhập tên bảng lương', width: 80 },
];

interface Payroll {
  id: number;
  name: string;
  code?: string;
}

export default function PayrollTab() {
  const [items, setItems] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Payroll | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await payrollApi.getAll();
      setItems(data || []);
    } catch {
      toast.error('Không thể tải danh sách bảng lương');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => items.filter(o => {
    const s = searchTerm.toLowerCase();
    return o.name.toLowerCase().includes(s) || (o.code && o.code.toLowerCase().includes(s));
  }), [items, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filtered, currentPage]
  );

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedIds(checked ? paginated.map(i => i.id) : []);
  };
  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
    if (!checked) setSelectAll(false);
  };
  useEffect(() => {
    setSelectAll(selectedIds.length === paginated.length && paginated.length > 0);
  }, [selectedIds, paginated]);
  useEffect(() => { setSelectedIds([]); setSelectAll(false); }, [currentPage, searchTerm]);

  const handleOpenDialog = (item?: Payroll) => {
    setSelectedItem(item || null);
    setFormData(item ? { name: item.name, code: item.code || '' } : { name: '', code: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Vui lòng nhập tên bảng lương');
    try {
      setLoading(true);
      if (selectedItem) {
        await payrollApi.update({ id: selectedItem.id, ...formData });
        toast.success('Cập nhật bảng lương thành công');
      } else {
        await payrollApi.create(formData);
        toast.success('Thêm bảng lương thành công');
      }
      setIsDialogOpen(false);
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
      await payrollApi.delete(selectedItem.id);
      toast.success('Xóa bảng lương thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch {
      toast.error('Xóa bảng lương thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm kiếm theo mã, tên bảng lương..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
        <Button variant="outline" className="shrink-0"><Upload className="mr-1 h-4 w-4" />Tải lên</Button>
        <Button variant="outline" className="shrink-0"><Download className="mr-1 h-4 w-4" />Tải xuống</Button>
        <Button variant="default" className="shrink-0" onClick={() => setIsBulkEditOpen(true)} disabled={selectedIds.length === 0}>
          <Edit className="mr-2 h-4 w-4" />Chỉnh sửa ({selectedIds.length})
        </Button>
        <Button className="shrink-0" onClick={() => setIsBulkAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Thêm bảng lương
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[50px] border"><Checkbox checked={selectAll} onCheckedChange={handleSelectAll} /></TableHead>
              <TableHead className="w-[60px] border">STT</TableHead>
              <TableHead className="border">Mã</TableHead>
              <TableHead className="border">Tên bảng lương</TableHead>
              <TableHead className="text-center w-[120px] border">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Đang tải...</TableCell></TableRow>
            ) : paginated.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center">{searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}</TableCell></TableRow>
            ) : paginated.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="border"><Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={c => handleSelectOne(item.id, c as boolean)} /></TableCell>
                <TableCell className="border font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="border">
                  {item.code ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{item.code}</span> : '-'}
                </TableCell>
                <TableCell className="border font-medium">{item.name}</TableCell>
                <TableCell className="text-center border">
                  <div className="flex justify-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} className="hover:bg-blue-50"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setIsDeleteDialogOpen(true); }} className="hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} trong {filtered.length} bảng lương
            {selectedIds.length > 0 && <span className="ml-2 font-semibold text-blue-600">({selectedIds.length} được chọn)</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" />Trước</Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
              (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) ? (
                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className="w-10">{page}</Button>
              ) : Math.abs(page - currentPage) === 2 ? <span key={page} className="px-2">...</span> : null
            )}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>Sau<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader><DialogTitle>{selectedItem ? 'Cập nhật bảng lương' : 'Thêm bảng lương mới'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label>Mã bảng lương</Label>
              <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="VD: BL01..." />
            </div>
            <div className="space-y-2">
              <Label>Tên bảng lương <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nhập tên bảng lương" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Đang xử lý...' : selectedItem ? 'Cập nhật' : 'Thêm mới'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p>Bạn có chắc chắn muốn xóa bảng lương <strong>"{selectedItem?.name}"</strong> không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setSelectedItem(null); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? 'Đang xóa...' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenericBulkAddModal
        isOpen={isBulkAddOpen}
        onClose={() => { setIsBulkAddOpen(false); fetchItems(); }}
        api={payrollApi}
        fields={PAYROLL_FIELDS}
        title="Thêm bảng lương hàng loạt"
        itemLabel="bảng lương"
        queryKey="payrolls"
        sheetName="Bảng lương"
      />
      <GenericBulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => { setIsBulkEditOpen(false); setSelectedIds([]); setSelectAll(false); fetchItems(); }}
        api={{ ...payrollApi, updateBulk: async (items) => Promise.all(items.map(i => payrollApi.update(i))) }}
        fields={PAYROLL_FIELDS}
        title="Chỉnh sửa bảng lương hàng loạt"
        itemLabel="bảng lương"
        queryKey="payrolls"
        preSelectedIds={selectedIds}
        sheetName="Bảng lương"
      />
    </div>
  );
}