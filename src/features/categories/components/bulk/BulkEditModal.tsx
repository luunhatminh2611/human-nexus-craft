// src/features/categories/components/modal/GenericBulkEditModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/shared/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import type { FieldConfig } from './BulkAddModal';

interface GenericBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  api: {
    getAll: () => Promise<any[]>;
    getById: (id: number) => Promise<any>;
    updateBulk: (payload: any[]) => Promise<any>;
  };
  fields: FieldConfig[];
  title: string;
  itemLabel: string;
  queryKey: string;
  preSelectedIds?: number[];
  sheetName?: string;
}

export default function GenericBulkEditModal({
  isOpen, onClose, api, fields, title, itemLabel, queryKey, preSelectedIds = [], sheetName
}: GenericBulkEditModalProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const _sheetName = sheetName || itemLabel;

  useEffect(() => {
    if (!isOpen || preSelectedIds.length === 0) return;
    const load = async () => {
      try {
        const results = await Promise.all(
          preSelectedIds.map(id => api.getById(id).then(r => r.data || r))
        );
        setSelected(results.map(item => {
          const mapped: any = { id: item.id };
          fields.forEach(f => { mapped[f.key] = item[f.key] || ''; });
          return mapped;
        }));
      } catch { toast.error(`Không thể tải thông tin ${itemLabel}`); }
    };
    load();
  }, [isOpen, preSelectedIds]);

  const { data: allItems = [] } = useQuery({
    queryKey: [queryKey],
    queryFn: api.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: any[]) => api.updateBulk(payload),
    onSuccess: () => {
      toast.success(`Đã cập nhật ${selected.length} ${itemLabel}`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || `Không thể cập nhật ${itemLabel}`);
    },
  });

  const handleAdd = async (id: number) => {
    if (selected.find(i => i.id === id)) return toast.error(`${itemLabel} này đã được thêm`);
    try {
      const data = await api.getById(id).then(r => r.data || r);
      const item: any = { id: data.id };
      fields.forEach(f => { item[f.key] = data[f.key] || ''; });
      setSelected(prev => [...prev, item]);
      setSearchValue('');
      setSearchOpen(false);
    } catch { toast.error(`Không thể tải thông tin ${itemLabel}`); }
  };

  const handleRemove = (id: number) => setSelected(prev => prev.filter(i => i.id !== id));

  const handleChange = (id: number, field: string, value: any) => {
    setSelected(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(_sheetName);
      sheet.columns = fields.map(f => ({ header: f.label + (f.required ? ' *' : ''), key: f.key, width: f.width || 30 }));
      selected.forEach(item => {
        const row: any = {};
        fields.forEach(f => { row[f.key] = item[f.key]; });
        sheet.addRow(row);
      });
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Sua_${itemLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Đã tải xuống file');
    } catch { toast.error('Không thể tải xuống file'); }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.getWorksheet(_sheetName);
      if (!sheet) throw new Error(`Không tìm thấy sheet "${_sheetName}"`);
      const imported: any[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const item: any = {};
        fields.forEach((f, i) => {
          const cell = row.getCell(i + 1);
          item[f.key] = cell.value ? String(cell.value).trim() : '';
        });
        imported.push(item);
      });
      if (imported.length === selected.length) {
        setSelected(prev => prev.map((item, i) => ({ ...item, ...imported[i] })));
        toast.success(`Đã cập nhật ${imported.length} ${itemLabel} từ file`);
      } else {
        toast.warning(`File có ${imported.length} dòng nhưng đang chỉnh sửa ${selected.length} ${itemLabel}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể đọc file');
    } finally { e.target.value = ''; }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return toast.error(`Vui lòng chọn ít nhất một ${itemLabel}`);
    const requiredField = fields.find(f => f.required);
    if (requiredField && selected.some(i => !i[requiredField.key])) {
      return toast.error(`Vui lòng điền "${requiredField.label}" cho tất cả các dòng`);
    }
    const payload = selected.map(item => {
      const data: any = { id: Number(item.id) };
      fields.forEach(f => { data[f.key] = item[f.key] || null; });
      return data;
    });
    updateMutation.mutate(payload);
  };

  const handleClose = () => {
    setSelected([]);
    setSearchValue('');
    setExpandedRows(new Set());
    onClose();
  };

  const filteredAll = (allItems as any[]).filter(i =>
    i.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
    i.code?.toLowerCase().includes(searchValue.toLowerCase())
  );

  const renderCell = (item: any, field: FieldConfig) => {
    if (field.type === 'textarea') {
      return (
        <Textarea value={item[field.key]} onChange={e => handleChange(item.id, field.key, e.target.value)}
          className="text-sm min-w-[200px]" rows={2}
          placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`} />
      );
    }
    return (
      <Input value={item[field.key]} onChange={e => handleChange(item.id, field.key, e.target.value)}
        className="h-8 text-sm w-full min-w-[150px]"
        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`} />
    );
  };

  const renderExpanded = (item: any, index: number) => (
    <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">{index + 1}</span>
          {item[fields.find(f => f.required)?.key || fields[0]?.key] || `${itemLabel}`}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)}><X className="h-4 w-4" /></Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {fields.map(f => (
          <div key={f.key} className={`space-y-2 ${f.type === 'textarea' ? 'col-span-2' : ''}`}>
            <Label className="text-xs">{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</Label>
            {renderCell(item, f)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Tìm kiếm và chọn {itemLabel} để chỉnh sửa. Các trường (*) là bắt buộc.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {preSelectedIds.length === 0 && (
            <div className="px-4 py-3 border-b bg-muted/30">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" className="w-full justify-between">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    {searchValue || `Nhập tên hoặc mã ${itemLabel}...`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder={`Tìm kiếm ${itemLabel}...`} value={searchValue} onValueChange={setSearchValue} />
                    <CommandEmpty>Không tìm thấy {itemLabel}.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredAll.map(item => (
                        <CommandItem key={item.id} value={item.name} onSelect={() => handleAdd(item.id)}>
                          <Check className={`mr-2 h-4 w-4 ${selected.find(s => s.id === item.id) ? 'opacity-100' : 'opacity-0'}`} />
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

          {selected.length > 0 && (
            <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /> Tải lên</Button>
                <Button size="sm" className="gap-2" onClick={handleExport}><Download className="h-4 w-4" /> Tải xuống</Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewMode(v => v === 'table' ? 'expanded' : 'table')}>
                  {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">Đã chọn: <b>{selected.length}</b> {itemLabel}</div>
            </div>
          )}

          <div className="flex-1 overflow-auto px-4 py-4">
            {selected.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Chưa có {itemLabel} nào được chọn</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-24 text-center sticky left-12 bg-background z-10">Thao tác</TableHead>
                      {fields.map(f => <TableHead key={f.key} className="whitespace-nowrap">{f.label}{f.required && ' *'}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.map((item, index) => (
                      <>
                        <TableRow key={item.id}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r"><span className="font-medium">{index + 1}</span></TableCell>
                          <TableCell className="sticky left-12 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.id)}>
                                {expandedRows.has(item.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemove(item.id)}><X className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                          {fields.map(f => <TableCell key={f.key}>{renderCell(item, f)}</TableCell>)}
                        </TableRow>
                        {expandedRows.has(item.id) && (
                          <TableRow><TableCell colSpan={fields.length + 2}>{renderExpanded(item, index)}</TableCell></TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-4">{selected.map((item, index) => renderExpanded(item, index))}</div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={updateMutation.isPending}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending || selected.length === 0} className="bg-green-500 text-white hover:bg-green-600">
            {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selected.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}