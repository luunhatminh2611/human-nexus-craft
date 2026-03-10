// components/BulkAddDocumentModal.tsx

import { useEffect, useRef, useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/tables/table';
import { toast } from 'sonner';
import {
  Loader2, X, Plus, Download, Upload,
  ChevronDown, Search, User, Paperclip, FolderOpen,
} from 'lucide-react';
import { employeeDocumentApi } from '../api/document';
import { employeeApi } from '@/features/employees/api/employeeApi';

const DOCUMENT_TYPES = [
  { value: 'RECRUITMENT',  label: 'Hồ sơ tuyển dụng' },
  { value: 'CONTRACT',     label: 'Hợp đồng' },
  { value: 'INSURANCE',    label: 'Bảo hiểm & Thuế' },
  { value: 'CERTIFICATE',  label: 'Bằng cấp' },
  { value: 'DECISION',     label: 'Quyết định' },
  { value: 'TRAINING',     label: 'Đào tạo' },
  { value: 'OTHER',        label: 'Khác' },
];

interface DocRow {
  tempId: number;
  employeeId: string;
  employeeName: string;
  documentType: string;
  documentName: string;
  description: string;
  file: File | null;
  rowStatus: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({ row, allEmployees, onSelect }: {
  row: DocRow;
  allEmployees: any[];
  onSelect: (emp: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = search.trim()
    ? allEmployees.filter(e =>
        e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(search.toLowerCase()))
    : allEmployees.slice(0, 20);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[160px] hover:bg-gray-50 transition-colors text-left
            ${!row.employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}`}>
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1">{row.employeeName || 'Chọn...'}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="bottom">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tên hoặc mã nhân viên..." className="pl-7 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(emp => (
            <button key={emp.id} type="button"
              onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors
                ${row.employeeId === emp.id.toString() ? 'bg-green-50' : ''}`}>
              <div className="text-sm font-medium">{emp.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
              </div>
            </button>
          )) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">Không tìm thấy</div>
          )}
        </div>
        {row.employeeId && (
          <div className="p-2 border-t">
            <button type="button" onClick={() => { onSelect({ id: 0, fullName: '' }); setOpen(false); }}
              className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1">Bỏ chọn</button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── FileCell ─────────────────────────────────────────────────────────────────
function FileCell({ row, onFileChange }: {
  row: DocRow;
  onFileChange: (id: number, file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-1.5 min-w-[160px]">
      <input ref={inputRef} type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={e => onFileChange(row.tempId, e.target.files?.[0] ?? null)} />
      {row.file ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-green-600" />
          <span className="text-xs text-green-700 truncate flex-1 max-w-[100px]" title={row.file.name}>
            {row.file.name}
          </span>
          <button type="button" onClick={() => onFileChange(row.tempId, null)}
            className="text-muted-foreground hover:text-red-500 shrink-0"><X className="h-3 w-3" /></button>
          <button type="button" onClick={() => inputRef.current?.click()}
            className="text-muted-foreground hover:text-blue-500 shrink-0" title="Đổi file">
            <Upload className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 h-8 px-2 text-xs border border-dashed rounded hover:bg-gray-50 transition-colors text-muted-foreground w-full">
          <Upload className="h-3.5 w-3.5" /> Chọn file...
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function BulkAddDocumentModal({ isOpen, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<DocRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(1);

  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
    if (rows.length === 0) addRow();
  }, [isOpen]);

  const makeRow = (): DocRow => ({
    tempId: idCounter.current++,
    employeeId: '', employeeName: '',
    documentType: '', documentName: '',
    description: '', file: null,
    rowStatus: 'pending',
  });

  const addRow = () => setRows(prev => [...prev, makeRow()]);
  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.tempId !== id));
  const copyRow = (id: number) => {
    const row = rows.find(r => r.tempId === id);
    if (row) {
      setRows(prev => [...prev, { ...row, tempId: idCounter.current++, file: null, rowStatus: 'pending', errorMessage: undefined }]);
      toast.info('Đã sao chép dòng (cần chọn lại file)');
    }
  };
  const update = (id: number, field: keyof DocRow, value: any) =>
    setRows(prev => prev.map(r => r.tempId === id ? { ...r, [field]: value } : r));
  const handleFileChange = (id: number, file: File | null) =>
    setRows(prev => prev.map(r => r.tempId === id ? { ...r, file } : r));

  // ─── Excel ──────────────────────────────────────────────────────────────────
  const handleExportTemplate = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Hồ sơ');
      ws.columns = [
        { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
        { header: 'Loại tài liệu * (xem sheet Loại)', key: 'documentType', width: 36 },
        { header: 'Tên tài liệu *', key: 'documentName', width: 36 },
        { header: 'Mô tả', key: 'description', width: 40 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };

      const wsRef = wb.addWorksheet('Loại tài liệu');
      wsRef.columns = [
        { header: 'Giá trị', key: 'value', width: 16 },
        { header: 'Mô tả',   key: 'label', width: 26 },
      ];
      wsRef.getRow(1).font = { bold: true };
      DOCUMENT_TYPES.forEach(t => wsRef.addRow({ value: t.value, label: t.label }));

      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_ho_so.xlsx');
      toast.success('Đã tải xuống file mẫu');
    } catch { toast.error('Không thể tải file mẫu'); }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      const ws = wb.getWorksheet('Hồ sơ');
      if (!ws) throw new Error('Không tìm thấy sheet "Hồ sơ"');
      const imported: DocRow[] = [];
      ws.eachRow((row, n) => {
        if (n === 1) return;
        const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
        const code = g(1);
        const emp = allEmployees.find(e => e.employeeCode === code);
        imported.push({
          tempId: idCounter.current++,
          employeeId: emp?.id.toString() || '',
          employeeName: emp?.fullName || code,
          documentType: g(2),
          documentName: g(3),
          description: g(4),
          file: null,
          rowStatus: 'pending',
        });
      });
      setRows(prev => [...prev, ...imported]);
      toast.success(`Đã nhập ${imported.length} dòng — vui lòng chọn file cho từng dòng`);
    } catch (err: any) { toast.error(err.message || 'Không thể đọc file'); }
    finally { e.target.value = ''; }
  };

  // ─── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    let ok = true;
    setRows(prev => prev.map(r => {
      const errs: string[] = [];
      if (!r.employeeId)           errs.push('Chưa chọn nhân viên');
      if (!r.documentType)         errs.push('Chưa chọn loại');
      if (!r.documentName.trim())  errs.push('Thiếu tên tài liệu');
      if (!r.file)                 errs.push('Chưa chọn file');
      if (errs.length) { ok = false; return { ...r, rowStatus: 'error', errorMessage: errs.join(' · ') }; }
      return { ...r, rowStatus: 'pending', errorMessage: undefined };
    }));
    return ok;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!rows.length) { toast.error('Vui lòng thêm ít nhất một dòng'); return; }
    if (!validate())  { toast.error('Kiểm tra các dòng bị lỗi (đường viền đỏ)'); return; }
    setIsSubmitting(true);
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        await employeeDocumentApi.create(
          Number(row.employeeId),
          { documentType: row.documentType, documentName: row.documentName, description: row.description || null },
          row.file!,
        );
        setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, rowStatus: 'success' } : r));
        ok++;
      } catch (err: any) {
        setRows(prev => prev.map(r => r.tempId === row.tempId
          ? { ...r, rowStatus: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
        fail++;
      }
    }
    setIsSubmitting(false);
    if (!fail) { toast.success(`Đã upload ${ok} tài liệu thành công`); onSuccess?.(); handleClose(); }
    else toast.warning(`${ok} thành công · ${fail} thất bại — kiểm tra dòng đỏ`);
  };

  const handleClose = () => { setRows([]); idCounter.current = 1; onClose(); };

  const successCount = rows.filter(r => r.rowStatus === 'success').length;
  const errorCount   = rows.filter(r => r.rowStatus === 'error').length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> Upload hồ sơ hàng loạt
          </DialogTitle>
          <DialogDescription>Upload tài liệu hồ sơ cho nhiều nhân viên cùng lúc</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
              <Button size="sm" className="gap-1.5" onClick={() => excelInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" /> Nhập Excel
              </Button>
              <Button size="sm" className="gap-1.5" onClick={handleExportTemplate}>
                <Download className="h-3.5 w-3.5" /> Tải mẫu
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
                <Plus className="h-3.5 w-3.5" /> Thêm dòng
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {successCount > 0 && <span className="text-green-600 font-medium">✓ {successCount}</span>}
              {errorCount   > 0 && <span className="text-red-500  font-medium">✗ {errorCount}</span>}
              <span>Tổng: <b>{rows.length}</b></span>
            </div>
          </div>

          <div className="px-6 pt-3 shrink-0">
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              ⚠️ File phải được chọn thủ công cho từng dòng. Nhập Excel chỉ điền thông tin còn lại. Định dạng: PDF, JPG, PNG, DOC, DOCX · tối đa 10MB/file.
            </p>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                <FolderOpen className="h-10 w-10 opacity-30" />
                <p>Chưa có dòng nào. Nhấn <b>Thêm dòng</b> hoặc <b>Nhập Excel</b> để bắt đầu.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto mx-6 my-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-20 w-10 border-r">#</TableHead>
                      <TableHead className="sticky left-10 bg-background z-20 w-20 border-r text-center">Thao tác</TableHead>
                      <TableHead className="min-w-[170px] whitespace-nowrap">Nhân viên *</TableHead>
                      <TableHead className="min-w-[170px] whitespace-nowrap">Loại tài liệu *</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap">Tên tài liệu *</TableHead>
                      <TableHead className="min-w-[200px] whitespace-nowrap">Mô tả</TableHead>
                      <TableHead className="min-w-[170px] whitespace-nowrap">File *</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow key={row.tempId} className={
                        row.rowStatus === 'error'   ? 'bg-red-50 border-l-2 border-l-red-400' :
                        row.rowStatus === 'success' ? 'bg-green-50 border-l-2 border-l-green-400' : ''
                      }>
                        <TableCell className="sticky left-0 bg-inherit z-10 w-10 border-r text-sm font-medium text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="sticky left-10 bg-inherit z-10 w-20 border-r">
                          <div className="flex gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => copyRow(row.tempId)} title="Sao chép"><Copy className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => removeRow(row.tempId)} title="Xóa dòng"><X className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                        {/* Nhân viên */}
                        <TableCell>
                          <EmployeePopover row={row} allEmployees={allEmployees}
                            onSelect={emp => {
                              update(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                              update(row.tempId, 'employeeName', emp.fullName || '');
                            }} />
                        </TableCell>
                        {/* Loại */}
                        <TableCell>
                          <Select value={row.documentType} onValueChange={v => update(row.tempId, 'documentType', v)}>
                            <SelectTrigger className="h-8 text-sm min-w-[150px]"><SelectValue placeholder="Chọn" /></SelectTrigger>
                            <SelectContent>
                              {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {/* Tên tài liệu */}
                        <TableCell>
                          <Input value={row.documentName} onChange={e => update(row.tempId, 'documentName', e.target.value)}
                            className="h-8 text-sm" placeholder="Tên tài liệu..." />
                        </TableCell>
                        {/* Mô tả */}
                        <TableCell>
                          <Input value={row.description} onChange={e => update(row.tempId, 'description', e.target.value)}
                            className="h-8 text-sm" placeholder="Mô tả..." />
                        </TableCell>
                        {/* File */}
                        <TableCell><FileCell row={row} onFileChange={handleFileChange} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !rows.length}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isSubmitting ? 'Đang upload...' : `Xác nhận (${rows.length} dòng)`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// workaround: Copy icon not imported above
function Copy(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>
  );
}