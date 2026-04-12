// src/features/categories/components/CompanyTab.tsx
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight, Download, Upload, Edit } from 'lucide-react';
import { companyApi } from '@/features/company/api/company';
import { toast } from 'sonner';
import GenericBulkAddModal from './bulk/BulkAddModal';
import GenericBulkEditModal from './bulk/BulkEditModal';

// Field config cho Company — dùng lại ở cả BulkAdd và BulkEdit
const COMPANY_FIELDS = [
  { key: 'code',    label: 'Mã đơn vị/ công ty',   required: false, type: 'input'    as const, placeholder: 'VD: ABC, XYZ...',      width: 15 },
  { key: 'name',    label: 'Tên đơn vị/công ty',   required: true,  type: 'input'    as const, placeholder: 'Nhập tên công ty',      width: 30 },
  { key: 'address', label: 'Địa chỉ',       required: false, type: 'input'    as const, placeholder: 'Nhập địa chỉ',          width: 35 },
  { key: 'phone',   label: 'Số điện thoại', required: false, type: 'input'    as const, placeholder: 'Nhập số điện thoại',    width: 20 },
  { key: 'email',   label: 'Email',         required: false, type: 'input'    as const, placeholder: 'Nhập email liên hệ',    width: 25 },
];

interface Company {
  id: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function CompanyTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dialog single
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Company | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '', address: '', phone: '', email: '' });

  // Bulk
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getAll();
      setCompanies(data || []);
    } catch { toast.error('Không thể tải danh sách công ty'); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => companies.filter(c => {
    const s = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(s) ||
      (c.code && c.code.toLowerCase().includes(s)) ||
      (c.address && c.address.toLowerCase().includes(s));
  }), [companies, searchTerm]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  // Checkbox
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

  // CRUD single
  const handleOpenDialog = (item?: Company) => {
    setSelectedItem(item || null);
    setFormData(item
      ? { name: item.name, code: item.code || '', address: item.address || '', phone: item.phone || '', email: item.email || '' }
      : { name: '', code: '', address: '', phone: '', email: '' }
    );
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return toast.error('Vui lòng nhập tên công ty');
    try {
      setLoading(true);
      if (selectedItem) {
        await companyApi.update({ id: selectedItem.id, ...formData });
        toast.success('Cập nhật công ty thành công');
      } else {
        await companyApi.create(formData);
        toast.success('Thêm công ty thành công');
      }
      setIsDialogOpen(false);
      fetchCompanies();
    } catch { toast.error(selectedItem ? 'Cập nhật thất bại' : 'Thêm mới thất bại'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      await companyApi.delete(selectedItem.id);
      toast.success('Xóa công ty thành công');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchCompanies();
    } catch { toast.error('Xóa công ty thất bại'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Tìm kiếm theo mã, tên, địa chỉ công ty..." value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full" />
        </div>
        <Button variant="outline" className="shrink-0"><Upload className="mr-1 h-4 w-4" />Tải lên</Button>
        <Button variant="outline" className="shrink-0"><Download className="mr-1 h-4 w-4" />Tải xuống</Button>
        <Button variant="default" className="shrink-0" onClick={() => setIsBulkEditOpen(true)} disabled={selectedIds.length === 0}>
          <Edit className="mr-2 h-4 w-4" />Chỉnh sửa ({selectedIds.length})
        </Button>
        <Button className="shrink-0" onClick={() => setIsBulkAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Thêm công ty
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="w-[50px] border"><Checkbox checked={selectAll} onCheckedChange={handleSelectAll} /></TableHead>
              <TableHead className="w-[60px] border">STT</TableHead>
              <TableHead className="border">Mã</TableHead>
              <TableHead className="border">Tên công ty</TableHead>
              <TableHead className="border">Địa chỉ</TableHead>
              <TableHead className="border">Điện thoại</TableHead>
              <TableHead className="border">Email</TableHead>
              <TableHead className="text-center w-[120px] border">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center">Đang tải...</TableCell></TableRow>
            ) : paginated.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center">{searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu'}</TableCell></TableRow>
            ) : paginated.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="border"><Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={c => handleSelectOne(item.id, c as boolean)} /></TableCell>
                <TableCell className="border font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="border">
                  {item.code ? <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{item.code}</span> : '-'}
                </TableCell>
                <TableCell className="border font-medium">{item.name}</TableCell>
                <TableCell className="border">{item.address || '-'}</TableCell>
                <TableCell className="border">{item.phone || '-'}</TableCell>
                <TableCell className="border">{item.email || '-'}</TableCell>
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

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} trong {filtered.length} công ty
            {selectedIds.length > 0 && <span className="ml-2 font-semibold text-blue-600">({selectedIds.length} được chọn)</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page =>
              (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) ? (
                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className="w-10">{page}</Button>
              ) : Math.abs(page - currentPage) === 2 ? <span key={page} className="px-2">...</span> : null
            )}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
              Sau<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Single Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Cập nhật công ty' : 'Thêm công ty mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {COMPANY_FIELDS.map(f => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</Label>
                <Input value={(formData as any)[f.key]} onChange={e => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Đang xử lý...' : selectedItem ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận xóa</DialogTitle></DialogHeader>
          <p>Bạn có chắc chắn muốn xóa công ty <strong>"{selectedItem?.name}"</strong> không?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setSelectedItem(null); }}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? 'Đang xóa...' : 'Xóa'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generic Bulk Add */}
      <GenericBulkAddModal
        isOpen={isBulkAddOpen}
        onClose={() => { setIsBulkAddOpen(false); fetchCompanies(); }}
        api={companyApi}
        fields={COMPANY_FIELDS}
        title="Thêm công ty hàng loạt"
        itemLabel="công ty"
        queryKey="companies"
        sheetName="Công ty"
      />

      {/* Generic Bulk Edit */}
      <GenericBulkEditModal
        isOpen={isBulkEditOpen}
        onClose={() => { setIsBulkEditOpen(false); setSelectedIds([]); setSelectAll(false); fetchCompanies(); }}
        api={{ ...companyApi, updateBulk: async (items) => Promise.all(items.map(i => companyApi.update(i))) }}
        fields={COMPANY_FIELDS}
        title="Chỉnh sửa công ty hàng loạt"
        itemLabel="công ty"
        queryKey="companies"
        preSelectedIds={selectedIds}
        sheetName="Công ty"
      />
    </div>
  );
}