import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload, Edit } from 'lucide-react';
import { salaryScaleApi } from '@/features/scaleSalary/api/scaleSalary';
import { toast } from 'sonner';
import GenericBulkAddModal from './bulk/BulkAddModal';
import GenericBulkEditModal from './bulk/BulkEditModal';

const SALARY_SCALE_FIELDS = [
  { key: 'code', label: 'Mã thang bảng lương',  required: false, type: 'input' as const, placeholder: 'VD: TBL01...', width: 20 },
  { key: 'name', label: 'Tên thang bảng lương', required: true,  type: 'input' as const, placeholder: 'Nhập tên thang bảng lương', width: 80 },
];

interface SalaryScale {
  id: number;
  name: string;
  code?: string;
}

export default function SalaryScaleTab() {
  const [items, setItems] = useState<SalaryScale[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SalaryScale | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await salaryScaleApi.getAll();
      setItems(data || []);
    } catch {
      toast.error('Không thể tải danh sách thang bảng lương');
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

  const handleOpenDialog = (item?: SalaryScale) => {
    setSelectedItem(item || null);
    setFormData(item ? { name: item.name, code: item.code || '' } : { name: '', code: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast.error('Vui lòng nhập tên thang bảng lương');
    try {
      setLoading(true);
      if (selectedItem) {
        await salaryScaleApi.update({ id: selectedItem.id, ...formData });
        toast.success('Cập nhật thang bảng lương thành công');
      } else {
        await salaryScaleApi.create(formData);
        toast.success('Thêm thang bảng lương thành công');
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
      await salaryScaleApi.delete(selectedItem.id);
      toast.success('Xóa thang bảng lương thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch {
      toast.error('Xóa thang bảng lương thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm kiếm theo mã, tên thang bảng lương..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
        <Button variant="outline" className="shrink-0"><Upload className="mr-1 h-4 w-4" />Tải lên</Button>
        <Button variant="outline" className="shrink-0"><Download className="mr-1 h-4 w-4" />Tải xuống</Button>
        <Button variant="default" className="shrink-0" onClick={() => setIsBulkEditOpen(true)} disabled={selectedIds.length === 0}>
          <Edit className="mr-2 h-4 w-4" />Chỉnh sửa ({selectedIds.length})
        </Button>
        <Button className="shrink-0" onClick={() => setIsBulkAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Thêm thang bảng lương
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[50px] border"><Checkbox checked={selectAll} onCheckedChange={handleSelectAll} /></TableHead>
              <TableHead className="w-[60px] border">STT</TableHead>
              <TableHead className="border">Mã</TableHead>
              <TableHead className="border">Tên thang bảng lương</TableHead>
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
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} trong {filtered.length} thang bảng lương
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
          <DialogHeader><DialogTitle>{selectedItem ? 'Cập nhật thang bảng lương' : 'Thêm thang bảng lương mới'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label>Mã thang bảng lương</Label>
              <Input value={formData.code} onChange={e => setFormData(p => ({ ...p, code: e.target.value }))} placeholder="VD: TBL01..." />
            </div>
            <div className="space-y-2">
              <Label>Tên thang bảng lương <span className="text-red-500">*</span></Label>
              <Input value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Nhập tên thang bảng lương" />
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
          <p>Bạn có chắc chắn muốn xóa thang bảng lương <strong>"{selectedItem?.name}"</strong> không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setSelectedItem(null); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? 'Đang xóa...' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenericBulkAddModal
        isOpen={isBulkAddOpen}
        onClose={() => { setIsBulkAddOpen(false); fetchItems(); }}
        api={salaryScaleApi}
        fields={SALARY_SCALE_FIELDS}
        title="Thêm thang bảng lương hàng loạt"
        itemLabel="thang bảng lương"
        queryKey="salary-scales"
        sheetName="Thang bảng lương"
      />
      <GenericBulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => { setIsBulkEditOpen(false); setSelectedIds([]); setSelectAll(false); fetchItems(); }}
        api={{ ...salaryScaleApi, updateBulk: async (items) => Promise.all(items.map(i => salaryScaleApi.update(i))) }}
        fields={SALARY_SCALE_FIELDS}
        title="Chỉnh sửa thang bảng lương hàng loạt"
        itemLabel="thang bảng lương"
        queryKey="salary-scales"
        preSelectedIds={selectedIds}
        sheetName="Thang bảng lương"
      />
    </div>
  );
}