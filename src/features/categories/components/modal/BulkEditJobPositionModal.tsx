import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/shared/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { toast } from 'sonner';
import {
  Loader2, X, Search, Check, ChevronsUpDown,
  Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { jobPositionApi } from '../../api/categoriesApi';

interface BulkEditJobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedIds?: number[];
}

export default function BulkEditJobPositionModal({
  isOpen,
  onClose,
  preSelectedIds = [],
}: BulkEditJobPositionModalProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

  const { data: allItems = [] } = useQuery({
    queryKey: ['jobPositions'],
    queryFn: () => jobPositionApi.getAll(),
  });

  useEffect(() => {
    const load = async () => {
      if (!isOpen || preSelectedIds.length === 0) return;
      try {
        const results = await Promise.all(preSelectedIds.map(id => jobPositionApi.getById(id)));
        setSelected(results.map(r => ({
          id: r.id,
          code: r.code || '',
          name: r.name || '',
        })));
      } catch {
        toast.error('Không thể tải thông tin vị trí công việc');
      }
    };
    load();
  }, [isOpen, preSelectedIds]);

  const updateMutation = useMutation({
    mutationFn: async (payload: any[]) => {
      const promises = payload.map(item => jobPositionApi.update(item.id, { code: item.code, name: item.name }));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`Đã cập nhật ${selected.length} vị trí công việc`);
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật vị trí công việc');
    },
  });

  const handleAddItem = async (id: number) => {
    if (selected.find(i => i.id === id)) {
      toast.error('Vị trí này đã được thêm');
      return;
    }
    try {
      const data = await jobPositionApi.getById(id);
      setSelected(prev => [...prev, { id: data.id, code: data.code || '', name: data.name || '' }]);
      setSearchValue('');
      setSearchOpen(false);
    } catch {
      toast.error('Không thể tải thông tin vị trí công việc');
    }
  };

  const handleRemove = (id: number) => setSelected(prev => prev.filter(i => i.id !== id));

  const handleFieldChange = (id: number, field: string, value: string) => {
    setSelected(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Vị trí công việc');
      sheet.columns = [
        { header: 'Mã vị trí', key: 'code', width: 20 },
        { header: 'Tên vị trí công việc *', key: 'name', width: 40 },
      ];
      selected.forEach(i => sheet.addRow({ code: i.code, name: i.name }));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Chinh_sua_vi_tri_cong_viec_${new Date().toISOString().split('T')[0]}.xlsx`,
      );
      toast.success(`Đã tải xuống file với ${selected.length} vị trí công việc`);
    } catch {
      toast.error('Không thể tải xuống file');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.getWorksheet('Vị trí công việc');
      if (!sheet) throw new Error('Không tìm thấy sheet "Vị trí công việc"');
      const imported: any[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const getCellValue = (col: number) => {
          const cell = row.getCell(col);
          return cell.value ? String(cell.value).trim() : '';
        };
        const code = getCellValue(1);
        const name = getCellValue(2);
        if (!name) return;
        imported.push({ code, name });
      });
      if (imported.length === selected.length) {
        setSelected(prev => prev.map((i, idx) => ({ ...i, ...imported[idx] })));
        toast.success(`Đã cập nhật ${imported.length} vị trí từ file`);
      } else {
        toast.warning(`File có ${imported.length} dòng nhưng đang chỉnh sửa ${selected.length} vị trí`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể đọc file');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return toast.error('Vui lòng chọn ít nhất một vị trí công việc');
    const invalid = selected.filter(i => !i.name.trim());
    if (invalid.length > 0) return toast.error('Vui lòng điền đầy đủ tên vị trí cho tất cả các dòng');
    updateMutation.mutate(selected);
  };

  const handleClose = () => {
    setSelected([]);
    setSearchValue('');
    setExpandedRows(new Set());
    onClose();
  };

  const filteredItems = allItems.filter((i: any) =>
    i.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    i.code?.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const renderTableCell = (item: any, field: string) => (
    <Input
      value={item[field]}
      onChange={e => handleFieldChange(item.id, field, e.target.value)}
      className="h-8 text-sm w-full min-w-[150px]"
      placeholder={field === 'code' ? 'Mã vị trí' : 'Tên vị trí công việc'}
    />
  );

  const renderExpanded = (item: any, index: number) => (
    <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {index + 1}
          </span>
          {item.name}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Mã vị trí</Label>
          <Input value={item.code} onChange={e => handleFieldChange(item.id, 'code', e.target.value)}
            className="h-8 text-sm" placeholder="Ví dụ: VT-01..." />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Tên vị trí công việc <span className="text-red-500">*</span></Label>
          <Input value={item.name} onChange={e => handleFieldChange(item.id, 'name', e.target.value)}
            className="h-8 text-sm" placeholder="Nhập tên vị trí công việc..." />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa vị trí công việc hàng loạt</DialogTitle>
          <DialogDescription>
            Tìm kiếm và chọn vị trí công việc để chỉnh sửa. Các trường (*) là bắt buộc.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search — chỉ hiển thị khi không có preSelectedIds */}
          {preSelectedIds.length === 0 && (
            <div className="px-4 py-3 border-b bg-muted/30">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    {searchValue || 'Nhập tên hoặc mã vị trí công việc...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm vị trí công việc..." value={searchValue} onValueChange={setSearchValue} />
                    <CommandEmpty>Không tìm thấy vị trí công việc.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredItems.map((item: any) => (
                        <CommandItem key={item.id} value={item.name} onSelect={() => handleAddItem(item.id)}>
                          <Check className={`mr-2 h-4 w-4 ${selected.find(i => i.id === item.id) ? 'opacity-100' : 'opacity-0'}`} />
                          <div className="flex flex-col">
                            <span className="font-medium">{item.name}</span>
                            {item.code && <span className="text-xs text-muted-foreground">Mã: {item.code}</span>}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Toolbar */}
          {selected.length > 0 && (
            <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
                <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Tải lên
                </Button>
                <Button size="sm" className="gap-2" onClick={handleExportExcel}>
                  <Download className="h-4 w-4" /> Tải xuống
                </Button>
                <Button variant="outline" size="sm" className="gap-2"
                  onClick={() => setViewMode(viewMode === 'table' ? 'expanded' : 'table')}>
                  {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Đã chọn: <b>{selected.length}</b> vị trí công việc
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 py-4">
            {selected.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có vị trí công việc nào được chọn</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-24 text-center sticky left-12 bg-background z-10">Thao tác</TableHead>
                      <TableHead className="whitespace-nowrap">Mã vị trí</TableHead>
                      <TableHead className="whitespace-nowrap">Tên vị trí công việc *</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.map((item, index) => (
                      <>
                        <TableRow key={item.id}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r">
                            <span className="font-medium">{index + 1}</span>
                          </TableCell>
                          <TableCell className="sticky left-12 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)}
                                title={expandedRows.has(item.id) ? 'Thu gọn' : 'Mở rộng'}>
                                {expandedRows.has(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)} title="Xóa">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{renderTableCell(item, 'code')}</TableCell>
                          <TableCell>{renderTableCell(item, 'name')}</TableCell>
                        </TableRow>
                        {expandedRows.has(item.id) && (
                          <TableRow>
                            <TableCell colSpan={4}>{renderExpanded(item, index)}</TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-4">
                {selected.map((item, index) => renderExpanded(item, index))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={updateMutation.isPending}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending || selected.length === 0}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}