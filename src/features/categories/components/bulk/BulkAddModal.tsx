// src/features/categories/components/modal/GenericBulkAddModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, X, Plus, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export interface FieldConfig {
  key: string;
  label: string;
  required?: boolean;
  type?: 'input' | 'textarea';
  placeholder?: string;
  width?: number; // excel column width
}

interface GenericBulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  api: {
    create: (data: any) => Promise<any>;
  };
  fields: FieldConfig[];
  title: string;
  itemLabel: string;       // VD: "chức danh", "công ty"
  queryKey: string;        // để invalidate
  sheetName?: string;
}

export default function GenericBulkAddModal({
  isOpen, onClose, api, fields, title, itemLabel, queryKey, sheetName
}: GenericBulkAddModalProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const _sheetName = sheetName || itemLabel;

  useEffect(() => {
    if (isOpen && items.length === 0) handleAdd();
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: async (payload: any[]) => {
      const promises = payload.map(item => api.create(item));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`Đã thêm ${items.length} ${itemLabel} thành công`);
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || `Không thể thêm ${itemLabel}`);
    },
  });

  const handleAdd = () => {
    const newItem: any = { tempId: nextId };
    fields.forEach(f => { newItem[f.key] = ''; });
    setItems(prev => [...prev, newItem]);
    setNextId(prev => prev + 1);
  };

  const handleRemove = (tempId: number) => setItems(prev => prev.filter(i => i.tempId !== tempId));

  const handleCopy = (tempId: number) => {
    const item = items.find(i => i.tempId === tempId);
    if (item) {
      const copy = { ...item, tempId: nextId };
      // clear first field (thường là code) để tránh trùng
      if (fields[0]) copy[fields[0].key] = '';
      setItems(prev => [...prev, copy]);
      setNextId(prev => prev + 1);
      toast.success(`Đã sao chép ${itemLabel}`);
    }
  };

  const handleChange = (tempId: number, field: string, value: any) => {
    setItems(prev => prev.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  };

  const toggleExpand = (tempId: number) => {
    setExpandedRows(prev => {
      const s = new Set(prev);
      s.has(tempId) ? s.delete(tempId) : s.add(tempId);
      return s;
    });
  };

  const handleExport = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(_sheetName);
      sheet.columns = fields.map(f => ({
        header: f.label + (f.required ? ' *' : ''),
        key: f.key,
        width: f.width || 30,
      }));
      items.forEach(item => {
        const row: any = {};
        fields.forEach(f => { row[f.key] = item[f.key]; });
        sheet.addRow(row);
      });
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `Them_${itemLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        const item: any = { tempId: nextId + imported.length };
        fields.forEach((f, i) => {
          const cell = row.getCell(i + 1);
          item[f.key] = cell.value ? String(cell.value).trim() : '';
        });
        const requiredField = fields.find(f => f.required);
        if (requiredField && !item[requiredField.key]) return;
        imported.push(item);
      });

      setItems(prev => [...prev, ...imported]);
      setNextId(prev => prev + imported.length);
      toast.success(`Đã nhập ${imported.length} ${itemLabel}`);
    } catch (err: any) {
      toast.error(err.message || 'Không thể đọc file');
    } finally { e.target.value = ''; }
  };

  const handleSubmit = () => {
    if (items.length === 0) return toast.error(`Vui lòng thêm ít nhất một ${itemLabel}`);
    const requiredField = fields.find(f => f.required);
    if (requiredField && items.some(i => !i[requiredField.key])) {
      return toast.error(`Vui lòng điền "${requiredField.label}" cho tất cả các dòng`);
    }
    const payload = items.map(item => {
      const data: any = {};
      fields.forEach(f => { data[f.key] = item[f.key] || null; });
      return data;
    });
    createMutation.mutate(payload);
  };

  const handleClose = () => {
    setItems([]);
    setNextId(1);
    setExpandedRows(new Set());
    onClose();
  };

  const renderCell = (item: any, field: FieldConfig) => {
    if (field.type === 'textarea') {
      return (
        <Textarea
          value={item[field.key]}
          onChange={e => handleChange(item.tempId, field.key, e.target.value)}
          className="text-sm min-w-[200px]"
          rows={2}
          placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
        />
      );
    }
    return (
      <Input
        value={item[field.key]}
        onChange={e => handleChange(item.tempId, field.key, e.target.value)}
        className="h-8 text-sm w-full min-w-[150px]"
        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}...`}
      />
    );
  };

  const renderExpanded = (item: any, index: number) => (
    <div key={item.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between border-b pb-2">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">{index + 1}</span>
          {item[fields.find(f => f.required)?.key || fields[0]?.key] || `${itemLabel} mới`}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => handleRemove(item.tempId)}>
          <X className="h-4 w-4" />
        </Button>
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
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Có thể thêm nhiều {itemLabel} và lưu một lần</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
              <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Tải lên
              </Button>
              <Button size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" /> Tải xuống
              </Button>
              <Button variant="outline" size="sm" className="gap-2"
                onClick={() => setViewMode(v => v === 'table' ? 'expanded' : 'table')}>
                {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" /> Thêm {itemLabel}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">Tổng số: <b>{items.length}</b> {itemLabel}</div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10">
                Chưa có {itemLabel} nào. Nhấn <b>Thêm {itemLabel}</b> để bắt đầu.
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-32 text-center sticky left-12 bg-background z-10">Thao tác</TableHead>
                      {fields.map(f => (
                        <TableHead key={f.key} className="whitespace-nowrap">
                          {f.label}{f.required && ' *'}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <>
                        <TableRow key={item.tempId}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r">
                            <span className="font-medium">{index + 1}</span>
                          </TableCell>
                          <TableCell className="sticky left-12 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.tempId)}>
                                {expandedRows.has(item.tempId) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(item.tempId)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemove(item.tempId)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          {fields.map(f => (
                            <TableCell key={f.key}>{renderCell(item, f)}</TableCell>
                          ))}
                        </TableRow>
                        {expandedRows.has(item.tempId) && (
                          <TableRow>
                            <TableCell colSpan={fields.length + 2}>{renderExpanded(item, index)}</TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => renderExpanded(item, index))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending || items.length === 0}>
            {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}