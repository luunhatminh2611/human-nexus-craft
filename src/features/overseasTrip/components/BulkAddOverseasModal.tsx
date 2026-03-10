// components/BulkAddOverseasModal.tsx

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
  Loader2, X, Plus, Download, Upload, Copy,
  ChevronDown, Search, Plane, User, Paperclip,
} from 'lucide-react';
import { employeeTravelApi } from '../api/overSeas';
import { employeeApi } from '@/features/employees/api/employeeApi';

const FUNDING_SOURCES = [
  { value: 'COMPANY',  label: 'Công ty' },
  { value: 'PERSONAL', label: 'Cá nhân' },
  { value: 'PARTNER',  label: 'Đối tác' },
];

interface TravelRow {
  tempId: number;
  employeeId: string;
  employeeName: string;
  country: string;
  fundingSource: string;
  travelPurpose: string;
  departureDate: string;
  returnDate: string;
  estimatedCost: string;
  actualCost: string;
  note: string;
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
  row: TravelRow;
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
        <button type="button" className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[160px] hover:bg-gray-50 transition-colors text-left ${!row.employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}`}>
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1">{row.employeeName || 'Chọn nhân viên...'}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="bottom">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..." className="pl-7 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(emp => (
            <button key={emp.id} type="button"
              onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${row.employeeId === emp.id.toString() ? 'bg-green-50' : ''}`}>
              <div className="text-sm font-medium">{emp.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
              </div>
            </button>
          )) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">Không tìm thấy nhân viên</div>
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
function FileCell({ row, onFileChange }: { row: TravelRow; onFileChange: (id: number, file: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-1.5 min-w-[150px]">
      <input ref={inputRef} type="file" className="hidden"
        onChange={e => onFileChange(row.tempId, e.target.files?.[0] ?? null)} />
      {row.file ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-green-600" />
          <span className="text-xs text-green-700 truncate flex-1 max-w-[100px]" title={row.file.name}>{row.file.name}</span>
          <button type="button" onClick={() => onFileChange(row.tempId, null)} className="text-muted-foreground hover:text-red-500 shrink-0">
            <X className="h-3 w-3" />
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="text-muted-foreground hover:text-blue-500 shrink-0" title="Đổi file">
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
export default function BulkAddOverseasModal({ isOpen, onClose, onSuccess }: Props) {
  const [rows, setRows] = useState<TravelRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const idCounter = useRef(1);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
    if (rows.length === 0) addRow();
  }, [isOpen]);

  const makeRow = (): TravelRow => ({
    tempId: idCounter.current++,
    employeeId: '', employeeName: '',
    country: '', fundingSource: '',
    travelPurpose: '', departureDate: today,
    returnDate: '', estimatedCost: '',
    actualCost: '', note: '',
    file: null, rowStatus: 'pending',
  });

  const addRow = () => setRows(prev => [...prev, makeRow()]);
  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.tempId !== id));

  const copyRow = (id: number) => {
    const row = rows.find(r => r.tempId === id);
    if (row) {
      setRows(prev => [...prev, { ...row, tempId: idCounter.current++, file: null, rowStatus: 'pending', errorMessage: undefined }]);
      toast.success('Đã sao chép dòng (cần chọn lại file)');
    }
  };

  const update = (id: number, field: keyof TravelRow, value: any) =>
    setRows(prev => prev.map(r => r.tempId === id ? { ...r, [field]: value } : r));

  const handleFileChange = (id: number, file: File | null) =>
    setRows(prev => prev.map(r => r.tempId === id ? { ...r, file } : r));

  // ─── Excel ─────────────────────────────────────────────────────────────────
  const handleExportTemplate = async () => {
    try {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Xuất cảnh');
      ws.columns = [
        { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
        { header: 'Quốc gia *', key: 'country', width: 20 },
        { header: 'Nguồn tài trợ * (COMPANY/PERSONAL/PARTNER)', key: 'fundingSource', width: 42 },
        { header: 'Mục đích chuyến đi *', key: 'travelPurpose', width: 40 },
        { header: 'Ngày xuất cảnh * (YYYY-MM-DD)', key: 'departureDate', width: 30 },
        { header: 'Ngày về * (YYYY-MM-DD)', key: 'returnDate', width: 24 },
        { header: 'Chi phí dự toán (VNĐ) *', key: 'estimatedCost', width: 26 },
        { header: 'Chi phí thực tế (VNĐ)', key: 'actualCost', width: 24 },
        { header: 'Ghi chú', key: 'note', width: 36 },
      ];
      ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      const buf = await wb.xlsx.writeBuffer();
      saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_xuat_canh.xlsx');
      toast.success('Đã tải xuống file mẫu');
    } catch { toast.error('Không thể tải file mẫu'); }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      const ws = wb.getWorksheet('Xuất cảnh');
      if (!ws) throw new Error('Không tìm thấy sheet "Xuất cảnh"');
      const imported: TravelRow[] = [];
      ws.eachRow((row, n) => {
        if (n === 1) return;
        const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
        const code = g(1);
        const emp = allEmployees.find(e => e.employeeCode === code);
        imported.push({
          tempId: idCounter.current++,
          employeeId: emp?.id.toString() || '',
          employeeName: emp?.fullName || code,
          country: g(2), fundingSource: g(3),
          travelPurpose: g(4),
          departureDate: g(5) || today,
          returnDate: g(6),
          estimatedCost: g(7), actualCost: g(8),
          note: g(9), file: null,
          rowStatus: 'pending',
        });
      });
      setRows(prev => [...prev, ...imported]);
      toast.success(`Đã nhập ${imported.length} dòng — vui lòng chọn file cho từng dòng`);
    } catch (err: any) { toast.error(err.message || 'Không thể đọc file'); }
    finally { e.target.value = ''; }
  };

  // ─── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    let ok = true;
    setRows(prev => prev.map(r => {
      const errs: string[] = [];
      if (!r.employeeId) errs.push('Chưa chọn nhân viên');
      if (!r.country.trim()) errs.push('Chưa nhập quốc gia');
      if (!r.fundingSource) errs.push('Chưa chọn nguồn');
      if (!r.travelPurpose.trim()) errs.push('Chưa nhập mục đích');
      if (!r.departureDate) errs.push('Chưa nhập ngày xuất cảnh');
      if (!r.returnDate) errs.push('Chưa nhập ngày về');
      if (r.departureDate && r.returnDate && new Date(r.returnDate) <= new Date(r.departureDate))
        errs.push('Ngày về phải sau ngày xuất cảnh');
      if (!r.estimatedCost || Number(r.estimatedCost) <= 0) errs.push('Chi phí không hợp lệ');
      if (!r.file) errs.push('Chưa chọn file');
      if (errs.length) { ok = false; return { ...r, rowStatus: 'error', errorMessage: errs.join(' · ') }; }
      return { ...r, rowStatus: 'pending', errorMessage: undefined };
    }));
    return ok;
  };

  const handleSubmit = async () => {
    if (!rows.length) { toast.error('Vui lòng thêm ít nhất một dòng'); return; }
    if (!validate()) { toast.error('Kiểm tra các dòng bị lỗi (đường viền đỏ)'); return; }
    setIsSubmitting(true);
    let ok = 0, fail = 0;
    for (const row of rows) {
      try {
        const payload = {
          employeeId: Number(row.employeeId),
          country: row.country,
          fundingSource: row.fundingSource,
          travelPurpose: row.travelPurpose,
          departureDate: row.departureDate,
          returnDate: row.returnDate,
          estimatedCost: Number(row.estimatedCost),
          actualCost: row.actualCost ? Number(row.actualCost) : null,
          note: row.note || null,
        };
        await employeeTravelApi.create(payload, row.file!);
        setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, rowStatus: 'success' } : r));
        ok++;
      } catch (err: any) {
        setRows(prev => prev.map(r => r.tempId === row.tempId
          ? { ...r, rowStatus: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
        fail++;
      }
    }
    setIsSubmitting(false);
    if (!fail) { toast.success(`Đã thêm ${ok} xuất cảnh thành công`); onSuccess?.(); handleClose(); }
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
            <Plane className="h-5 w-5" /> Thêm xuất cảnh hàng loạt
          </DialogTitle>
          <DialogDescription>Thêm lịch sử xuất cảnh nước ngoài cho nhiều nhân viên cùng lúc</DialogDescription>
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
              {errorCount   > 0 && <span className="text-red-500 font-medium">✗ {errorCount}</span>}
              <span>Tổng: <b>{rows.length}</b></span>
            </div>
          </div>

          <div className="px-6 pt-3 shrink-0">
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              ⚠️ File tài liệu phải được chọn thủ công cho từng dòng. Nhập Excel chỉ điền các thông tin còn lại.
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                <Plane className="h-10 w-10 opacity-30" />
                <p>Chưa có dòng nào. Nhấn <b>Thêm dòng</b> hoặc <b>Nhập Excel</b> để bắt đầu.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto mx-6 my-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-20 w-10 border-r">#</TableHead>
                      <TableHead className="sticky left-10 bg-background z-20 w-20 border-r text-center">Thao tác</TableHead>
                      <TableHead className="whitespace-nowrap">Nhân viên *</TableHead>
                      <TableHead className="whitespace-nowrap">Quốc gia *</TableHead>
                      <TableHead className="whitespace-nowrap">Nguồn tài trợ *</TableHead>
                      <TableHead className="whitespace-nowrap">Mục đích *</TableHead>
                      <TableHead className="whitespace-nowrap">Ngày xuất cảnh *</TableHead>
                      <TableHead className="whitespace-nowrap">Ngày về *</TableHead>
                      <TableHead className="whitespace-nowrap">Chi phí DT (VNĐ) *</TableHead>
                      <TableHead className="whitespace-nowrap">Chi phí TT (VNĐ)</TableHead>
                      <TableHead className="whitespace-nowrap">File *</TableHead>
                      <TableHead className="whitespace-nowrap">Ghi chú</TableHead>
                      <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
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
                            <Button variant="ghost" size="sm" onClick={() => removeRow(row.tempId)} title="Xóa"><X className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                        {/* Nhân viên */}
                        <TableCell>
                          <EmployeePopover row={row} allEmployees={allEmployees} onSelect={emp => {
                            update(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                            update(row.tempId, 'employeeName', emp.fullName || '');
                          }} />
                        </TableCell>
                        {/* Quốc gia */}
                        <TableCell>
                          <Input value={row.country} onChange={e => update(row.tempId, 'country', e.target.value)}
                            className="h-8 text-sm min-w-[120px]" placeholder="Singapore..." />
                        </TableCell>
                        {/* Nguồn */}
                        <TableCell>
                          <Select value={row.fundingSource} onValueChange={v => update(row.tempId, 'fundingSource', v)}>
                            <SelectTrigger className="h-8 text-sm min-w-[120px]"><SelectValue placeholder="Chọn" /></SelectTrigger>
                            <SelectContent>
                              {FUNDING_SOURCES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        {/* Mục đích */}
                        <TableCell>
                          <Input value={row.travelPurpose} onChange={e => update(row.tempId, 'travelPurpose', e.target.value)}
                            className="h-8 text-sm min-w-[180px]" placeholder="Hội thảo, đào tạo..." />
                        </TableCell>
                        {/* Ngày xuất cảnh */}
                        <TableCell>
                          <Input type="date" value={row.departureDate} onChange={e => update(row.tempId, 'departureDate', e.target.value)}
                            className="h-8 text-sm min-w-[140px]" />
                        </TableCell>
                        {/* Ngày về */}
                        <TableCell>
                          <Input type="date" value={row.returnDate} onChange={e => update(row.tempId, 'returnDate', e.target.value)}
                            className="h-8 text-sm min-w-[140px]" />
                        </TableCell>
                        {/* Chi phí DT */}
                        <TableCell>
                          <Input type="number" value={row.estimatedCost} onChange={e => update(row.tempId, 'estimatedCost', e.target.value)}
                            className="h-8 text-sm min-w-[130px]" placeholder="50000000" />
                        </TableCell>
                        {/* Chi phí TT */}
                        <TableCell>
                          <Input type="number" value={row.actualCost} onChange={e => update(row.tempId, 'actualCost', e.target.value)}
                            className="h-8 text-sm min-w-[130px]" placeholder="48000000" />
                        </TableCell>
                        {/* File */}
                        <TableCell><FileCell row={row} onFileChange={handleFileChange} /></TableCell>
                        {/* Ghi chú */}
                        <TableCell>
                          <Input value={row.note} onChange={e => update(row.tempId, 'note', e.target.value)}
                            className="h-8 text-sm min-w-[140px]" placeholder="Ghi chú..." />
                        </TableCell>
                        {/* Trạng thái */}
                        <TableCell>
                          {row.rowStatus === 'success' && <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Thành công</span>}
                          {row.rowStatus === 'error'   && <span className="text-xs text-red-500 max-w-[160px] block">{row.errorMessage}</span>}
                        </TableCell>
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
                {isSubmitting ? 'Đang lưu...' : `Xác nhận (${rows.length} dòng)`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}