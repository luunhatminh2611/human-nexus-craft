import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import {
  Loader2, X, Plus, BookOpen, Download, Upload,
  Copy, ChevronDown, ChevronUp, Maximize2, Minimize2,
} from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { partyCommitteeApi } from '../../api/categoriesApi';


interface BulkAddPartyCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BulkAddPartyCommitteeModal({ isOpen, onClose }: BulkAddPartyCommitteeModalProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

  useEffect(() => {
    if (isOpen && items.length === 0) {
      handleAdd();
    }
  }, [isOpen]);

  const createMutation = useMutation({
    mutationFn: async (payload: any[]) => {
      const promises = payload.map(item => partyCommitteeApi.create(item));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`Đã thêm ${items.length} cấp ủy thành công`);
      queryClient.invalidateQueries({ queryKey: ['partyCommittees'] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể thêm cấp ủy');
    },
  });

  const createNew = () => ({ tempId: nextId, code: '', name: '' });

  const handleAdd = () => {
    setItems(prev => [...prev, createNew()]);
    setNextId(prev => prev + 1);
  };

  const handleRemove = (tempId: number) => {
    setItems(prev => prev.filter(i => i.tempId !== tempId));
  };

  const handleCopy = (tempId: number) => {
    const toCopy = items.find(i => i.tempId === tempId);
    if (toCopy) {
      setItems(prev => [...prev, { ...toCopy, tempId: nextId, code: '' }]);
      setNextId(prev => prev + 1);
      toast.success('Đã sao chép cấp ủy');
    }
  };

  const handleFieldChange = (tempId: number, field: string, value: string) => {
    setItems(prev => prev.map(i => i.tempId === tempId ? { ...i, [field]: value } : i));
  };

  const toggleExpand = (tempId: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(tempId) ? next.delete(tempId) : next.add(tempId);
      return next;
    });
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Cấp ủy');
      sheet.columns = [
        { header: 'Mã cấp ủy', key: 'code', width: 20 },
        { header: 'Tên cấp ủy *', key: 'name', width: 40 },
      ];
      items.forEach(i => sheet.addRow({ code: i.code, name: i.name }));
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, items.length > 0
        ? `Them_cap_uy_${new Date().toISOString().split('T')[0]}.xlsx`
        : 'Mau_them_cap_uy.xlsx',
      );
      toast.success(items.length > 0 ? `Đã tải xuống file với ${items.length} cấp ủy` : 'Đã tải xuống file mẫu');
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
      const sheet = workbook.getWorksheet('Cấp ủy');
      if (!sheet) throw new Error('Không tìm thấy sheet "Cấp ủy"');

      const imported: any[] = [];
      const existingNames = new Map(items.map(i => [i.name, i]));

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const getCellValue = (col: number) => {
          const cell = row.getCell(col);
          return cell.value ? String(cell.value).trim() : '';
        };
        const code = getCellValue(1);
        const name = getCellValue(2);
        if (!name) return;
        imported.push({
          tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + imported.length,
          code,
          name,
        });
      });

      const updatedItems = items.map(i => {
        const imp = imported.find(x => x.name === i.name);
        return imp || i;
      });
      const newItems = imported.filter(x => !existingNames.has(x.name));
      setItems([...updatedItems, ...newItems]);
      setNextId(prev => prev + newItems.length);
      toast.success(`Đã nhập ${imported.length} cấp ủy (${newItems.length} mới, ${imported.length - newItems.length} cập nhật)`);
    } catch (error: any) {
      toast.error(error.message || 'Không thể đọc file');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = () => {
    if (items.length === 0) return toast.error('Vui lòng thêm ít nhất một cấp ủy');
    const invalid = items.filter(i => !i.name.trim());
    if (invalid.length > 0) return toast.error('Vui lòng điền đầy đủ tên cấp ủy cho tất cả các dòng');
    createMutation.mutate(items.map(i => ({ code: i.code || null, name: i.name })));
  };

  const handleClose = () => {
    setItems([]);
    setNextId(1);
    setExpandedRows(new Set());
    onClose();
  };

  const renderTableCell = (item: any, field: string) => (
    <Input
      value={item[field]}
      onChange={e => handleFieldChange(item.tempId, field, e.target.value)}
      className="h-8 text-sm w-full min-w-[150px]"
      placeholder={field === 'code' ? 'Mã cấp ủy' : 'Tên cấp ủy'}
    />
  );

  const renderExpanded = (item: any, index: number) => (
    <div key={item.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
      <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {index + 1}
          </span>
          {item.name || 'Cấp ủy mới'}
        </h4>
        <Button variant="ghost" size="sm" onClick={() => handleRemove(item.tempId)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs">Mã cấp ủy</Label>
          <Input
            value={item.code}
            onChange={e => handleFieldChange(item.tempId, 'code', e.target.value)}
            className="h-8 text-sm"
            placeholder="Ví dụ: CU-01..."
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Tên cấp ủy <span className="text-red-500">*</span></Label>
          <Input
            value={item.name}
            onChange={e => handleFieldChange(item.tempId, 'name', e.target.value)}
            className="h-8 text-sm"
            placeholder="Nhập tên cấp ủy..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Thêm cấp ủy hàng loạt
          </DialogTitle>
          <DialogDescription>Có thể thêm nhiều cấp ủy và lưu một lần</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
              <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Tải lên
              </Button>
              <Button size="sm" className="gap-2" onClick={handleExportExcel}>
                <Download className="h-4 w-4" /> Tải xuống
              </Button>
              <Button
                variant="outline" size="sm" className="gap-2"
                onClick={() => setViewMode(viewMode === 'table' ? 'expanded' : 'table')}
              >
                {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" /> Thêm cấp ủy
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Tổng số: <b>{items.length}</b> cấp ủy
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10">
                Chưa có cấp ủy nào. Nhấn <b>Thêm cấp ủy</b> để bắt đầu.
              </div>
            ) : viewMode === 'table' ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                      <TableHead className="w-32 text-center sticky left-12 bg-background z-10">Thao tác</TableHead>
                      <TableHead className="whitespace-nowrap">Mã cấp ủy</TableHead>
                      <TableHead className="whitespace-nowrap">Tên cấp ủy *</TableHead>
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
                              <Button variant="ghost" size="sm" onClick={() => toggleExpand(item.tempId)}
                                title={expandedRows.has(item.tempId) ? 'Thu gọn' : 'Mở rộng'}>
                                {expandedRows.has(item.tempId) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(item.tempId)} title="Sao chép">
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleRemove(item.tempId)} title="Xóa">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>{renderTableCell(item, 'code')}</TableCell>
                          <TableCell>{renderTableCell(item, 'name')}</TableCell>
                        </TableRow>
                        {expandedRows.has(item.tempId) && (
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
                {items.map((item, index) => renderExpanded(item, index))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || items.length === 0}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}