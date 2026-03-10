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
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
    ChevronDown, ChevronUp, Maximize2, Minimize2,
    Search, Users, User,
} from 'lucide-react';
import { employeeVisitApi, EmployeeVisitPayload } from '../api/familyVisitApi';
import { employeeApi } from '@/features/employees/api/employeeApi';

const VISIT_TYPES = ['Thăm ốm', 'Thăm hiếu', 'Thăm hỷ', 'Thăm sinh nhật', 'Thăm khác'];
const RELATIONSHIPS = ['Bố', 'Mẹ', 'Vợ', 'Chồng', 'Con', 'Anh', 'Chị', 'Em', 'Ông', 'Bà', 'Khác'];

interface VisitRow {
    tempId: number;
    employeeId: string;
    employeeName: string;
    visitType: string;
    visitDate: string;
    visitedPerson: string;
    relationship: string;
    reason: string;
    giftAmount: string;
    giftDescription: string;
    representative: string;
    note: string;
    status: string;
    rowStatus: 'pending' | 'success' | 'error';
    errorMessage?: string;
}

interface EmployeeOption {
    id: number;
    fullName: string;
    employeeCode: string;
    departmentName?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// ─── EmployeePopover ─────────────────────────────────────────────────────────
function EmployeePopover({ row, allEmployees, onSelect }: {
    row: VisitRow;
    allEmployees: EmployeeOption[];
    onSelect: (emp: EmployeeOption) => void;
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
                        <button type="button"
                            onClick={() => { onSelect({ id: 0, fullName: '', employeeCode: '' }); setOpen(false); }}
                            className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1">Bỏ chọn</button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function BulkAddVisitModal({ isOpen, onClose, onSuccess }: Props) {
    const [rows, setRows] = useState<VisitRow[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const idCounter = useRef(1);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!isOpen) return;
        employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
        if (rows.length === 0) addRow();
    }, [isOpen]);

    const makeRow = (): VisitRow => ({
        tempId: idCounter.current++,
        employeeId: '', employeeName: '',
        visitType: '', visitDate: today,
        visitedPerson: '', relationship: '',
        reason: '', giftAmount: '0',
        giftDescription: '', representative: '',
        note: '', status: 'Chưa thăm',
        rowStatus: 'pending',
    });

    const addRow = () => setRows(prev => [...prev, makeRow()]);
    const removeRow = (id: number) => setRows(prev => prev.filter(r => r.tempId !== id));

    const copyRow = (id: number) => {
        const row = rows.find(r => r.tempId === id);
        if (row) {
            setRows(prev => [...prev, { ...row, tempId: idCounter.current++, rowStatus: 'pending', errorMessage: undefined }]);
            toast.success('Đã sao chép dòng');
        }
    };

    const update = (id: number, field: keyof VisitRow, value: any) =>
        setRows(prev => prev.map(r => r.tempId === id ? { ...r, [field]: value } : r));

    const toggleExpand = (id: number) => {
        setExpandedRows(prev => {
            const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
        });
    };

    // ─── Excel ───────────────────────────────────────────────────────────────
    const handleExportTemplate = async () => {
        try {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Thăm nhân');
            ws.columns = [
                { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
                { header: 'Loại thăm * (Thăm ốm/Thăm hiếu/Thăm hỷ/Thăm sinh nhật/Thăm khác)', key: 'visitType', width: 55 },
                { header: 'Ngày thăm * (YYYY-MM-DD)', key: 'visitDate', width: 28 },
                { header: 'Người được thăm *', key: 'visitedPerson', width: 25 },
                { header: 'Quan hệ * (Bố/Mẹ/Vợ/Chồng/Con/...)', key: 'relationship', width: 35 },
                { header: 'Lý do *', key: 'reason', width: 40 },
                { header: 'Số tiền quà (VNĐ)', key: 'giftAmount', width: 22 },
                { header: 'Mô tả quà', key: 'giftDescription', width: 30 },
                { header: 'Người đại diện', key: 'representative', width: 25 },
                { header: 'Trạng thái (Chưa thăm/Đã thăm)', key: 'status', width: 32 },
                { header: 'Ghi chú', key: 'note', width: 40 },
            ];
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            const buf = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_tham_nhan.xlsx');
            toast.success('Đã tải xuống file mẫu');
        } catch { toast.error('Không thể tải file mẫu'); }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(await file.arrayBuffer());
            const ws = wb.getWorksheet('Thăm nhân');
            if (!ws) throw new Error('Không tìm thấy sheet "Thăm nhân"');
            const imported: VisitRow[] = [];
            ws.eachRow((row, n) => {
                if (n === 1) return;
                const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
                const code = g(1);
                const emp = allEmployees.find(e => e.employeeCode === code);
                imported.push({
                    tempId: idCounter.current++,
                    employeeId: emp?.id.toString() || '',
                    employeeName: emp?.fullName || code,
                    visitType: g(2), visitDate: g(3) || today,
                    visitedPerson: g(4), relationship: g(5),
                    reason: g(6), giftAmount: g(7) || '0',
                    giftDescription: g(8), representative: g(9),
                    status: g(10) || 'Chưa thăm', note: g(11),
                    rowStatus: 'pending',
                });
            });
            setRows(prev => [...prev, ...imported]);
            toast.success(`Đã nhập ${imported.length} dòng`);
        } catch (err: any) { toast.error(err.message || 'Không thể đọc file'); }
        finally { e.target.value = ''; }
    };

    // ─── Validate & Submit ───────────────────────────────────────────────────
    const validate = () => {
        let ok = true;
        setRows(prev => prev.map(r => {
            const errs: string[] = [];
            if (!r.employeeId) errs.push('Chưa chọn nhân viên');
            if (!r.visitType) errs.push('Chưa chọn loại');
            if (!r.visitedPerson.trim()) errs.push('Chưa nhập người thăm');
            if (!r.relationship) errs.push('Chưa chọn quan hệ');
            if (!r.reason.trim()) errs.push('Chưa nhập lý do');
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
                const payload: EmployeeVisitPayload = {
                    employeeId: Number(row.employeeId),
                    visitType: row.visitType,
                    visitDate: row.visitDate,
                    visitedPerson: row.visitedPerson,
                    relationship: row.relationship,
                    reason: row.reason,
                    giftAmount: Number(row.giftAmount) || 0,
                    giftDescription: row.giftDescription,
                    representative: row.representative,
                    note: row.note,
                    status: row.status,
                };
                await employeeVisitApi.create(payload);
                setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, rowStatus: 'success' } : r));
                ok++;
            } catch (err: any) {
                setRows(prev => prev.map(r => r.tempId === row.tempId
                    ? { ...r, rowStatus: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
                fail++;
            }
        }
        setIsSubmitting(false);
        if (!fail) { toast.success(`Đã thêm ${ok} lượt thăm thành công`); onSuccess?.(); handleClose(); }
        else toast.warning(`${ok} thành công · ${fail} thất bại — kiểm tra dòng đỏ`);
    };

    const handleClose = () => {
        setRows([]); idCounter.current = 1;
        setExpandedRows(new Set()); onClose();
    };

    const successCount = rows.filter(r => r.rowStatus === 'success').length;
    const errorCount = rows.filter(r => r.rowStatus === 'error').length;

    // ─── Render table row ────────────────────────────────────────────────────
    const renderTableRow = (row: VisitRow, index: number) => (
        <>
            <TableRow key={row.tempId} className={
                row.rowStatus === 'error' ? 'bg-red-50 border-l-2 border-l-red-400' :
                    row.rowStatus === 'success' ? 'bg-green-50 border-l-2 border-l-green-400' : ''
            }>
                <TableCell className="sticky bg-inherit z-10 w-10 border-r text-sm font-medium text-muted-foreground">
                    {index + 1}
                </TableCell>
                <TableCell className="sticky bg-inherit z-10 w-24 border-r">
                    <div className="flex gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(row.tempId)} title={expandedRows.has(row.tempId) ? 'Thu gọn' : 'Mở rộng'}>
                            {expandedRows.has(row.tempId) ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyRow(row.tempId)} title="Sao chép">
                            <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeRow(row.tempId)} title="Xóa">
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </TableCell>
                {/* Nhân viên */}
                <TableCell>
                    <EmployeePopover row={row} allEmployees={allEmployees} onSelect={emp => {
                        update(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                        update(row.tempId, 'employeeName', emp.fullName || '');
                    }} />
                </TableCell>
                {/* Loại thăm */}
                <TableCell>
                    <Select value={row.visitType} onValueChange={v => update(row.tempId, 'visitType', v)}>
                        <SelectTrigger className="h-8 text-sm min-w-[130px]"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                        <SelectContent>{VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </TableCell>
                {/* Ngày thăm */}
                <TableCell>
                    <Input type="date" value={row.visitDate} onChange={e => update(row.tempId, 'visitDate', e.target.value)} className="h-8 text-sm min-w-[130px]" />
                </TableCell>
                {/* Người được thăm */}
                <TableCell>
                    <Input value={row.visitedPerson} onChange={e => update(row.tempId, 'visitedPerson', e.target.value)} className="h-8 text-sm min-w-[130px]" placeholder="Tên người..." />
                </TableCell>
                {/* Quan hệ */}
                <TableCell>
                    <Select value={row.relationship} onValueChange={v => update(row.tempId, 'relationship', v)}>
                        <SelectTrigger className="h-8 text-sm min-w-[100px]"><SelectValue placeholder="Quan hệ" /></SelectTrigger>
                        <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                </TableCell>
                {/* Số tiền quà */}
                <TableCell>
                    <Input type="number" value={row.giftAmount} onChange={e => update(row.tempId, 'giftAmount', e.target.value)} className="h-8 text-sm min-w-[110px]" placeholder="0" />
                </TableCell>
                <TableCell>
                    <Textarea value={row.reason} onChange={e => update(row.tempId, 'reason', e.target.value)} rows={2} className="text-sm min-w-[180px]" placeholder="Lý do thăm hỏi..." />
                </TableCell>
                {/* Mô tả quà */}
                <TableCell>
                    <Input value={row.giftDescription} onChange={e => update(row.tempId, 'giftDescription', e.target.value)} className="h-8 text-sm min-w-[140px]" placeholder="Tiền mặt, hoa quả..." />
                </TableCell>
                {/* Người đại diện */}
                <TableCell>
                    <Input value={row.representative} onChange={e => update(row.tempId, 'representative', e.target.value)} className="h-8 text-sm min-w-[130px]" placeholder="VD: Giám đốc..." />
                </TableCell>
                {/* Ghi chú */}
                <TableCell>
                    <Textarea value={row.note} onChange={e => update(row.tempId, 'note', e.target.value)} rows={2} className="text-sm min-w-[160px]" placeholder="Ghi chú..." />
                </TableCell>
                {/* Trạng thái */}
                <TableCell>
                    <Select value={row.status} onValueChange={v => update(row.tempId, 'status', v)}>
                        <SelectTrigger className="h-8 text-sm min-w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
                            <SelectItem value="Đã thăm">Đã thăm</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
                {/* Lỗi inline */}
                {row.rowStatus !== 'pending' && (
                    <TableCell>
                        {row.rowStatus === 'success'
                            ? <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Thành công</span>
                            : <span className="text-xs text-red-500 whitespace-nowrap">{row.errorMessage}</span>}
                    </TableCell>
                )}
            </TableRow>
            {/* Expanded: lý do, mô tả quà, người đại diện, ghi chú */}
            {expandedRows.has(row.tempId) && (
                <TableRow className={row.rowStatus === 'error' ? 'bg-red-50' : row.rowStatus === 'success' ? 'bg-green-50' : 'bg-muted/20'}>
                    <TableCell colSpan={12}>
                        <div className="p-3 grid grid-cols-2 gap-3">
                            <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Lý do <span className="text-red-500">*</span></Label>
                                <Textarea value={row.reason} onChange={e => update(row.tempId, 'reason', e.target.value)} rows={2} className="text-sm" placeholder="Lý do thăm hỏi..." />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Mô tả quà</Label>
                                <Input value={row.giftDescription} onChange={e => update(row.tempId, 'giftDescription', e.target.value)} className="h-8 text-sm" placeholder="VD: Tiền mặt, hoa quả..." />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Người đại diện</Label>
                                <Input value={row.representative} onChange={e => update(row.tempId, 'representative', e.target.value)} className="h-8 text-sm" placeholder="VD: Giám đốc..." />
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label className="text-xs">Ghi chú</Label>
                                <Textarea value={row.note} onChange={e => update(row.tempId, 'note', e.target.value)} rows={2} className="text-sm" placeholder="Ghi chú..." />
                            </div>
                            {row.errorMessage && row.rowStatus === 'error' && (
                                <div className="col-span-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 self-start">
                                    <b>Lỗi:</b> {row.errorMessage}
                                </div>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );

    // ─── Render expanded card ────────────────────────────────────────────────
    const renderExpandedCard = (row: VisitRow, index: number) => (
        <div key={row.tempId} className={`border rounded-lg p-4 space-y-4 ${row.rowStatus === 'error' ? 'border-red-300 bg-red-50' :
            row.rowStatus === 'success' ? 'border-green-300 bg-green-50' : 'bg-muted/30'
            }`}>
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                    <span className="font-semibold text-sm">{row.visitedPerson || 'Lượt thăm mới'}</span>
                    {row.rowStatus === 'success' && <span className="text-xs text-green-600">✓ Đã lưu</span>}
                    {row.rowStatus === 'error' && <span className="text-xs text-red-500">{row.errorMessage}</span>}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => copyRow(row.tempId)}><Copy className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => removeRow(row.tempId)}><X className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Nhân viên <span className="text-red-500">*</span></Label>
                    <EmployeePopover row={row} allEmployees={allEmployees} onSelect={emp => {
                        update(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                        update(row.tempId, 'employeeName', emp.fullName || '');
                    }} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Loại thăm <span className="text-red-500">*</span></Label>
                    <Select value={row.visitType} onValueChange={v => update(row.tempId, 'visitType', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                        <SelectContent>{VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Ngày thăm</Label>
                    <Input type="date" value={row.visitDate} onChange={e => update(row.tempId, 'visitDate', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Người được thăm <span className="text-red-500">*</span></Label>
                    <Input value={row.visitedPerson} onChange={e => update(row.tempId, 'visitedPerson', e.target.value)} className="h-8 text-sm" placeholder="VD: Mẹ, Bố..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Quan hệ <span className="text-red-500">*</span></Label>
                    <Select value={row.relationship} onValueChange={v => update(row.tempId, 'relationship', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn quan hệ" /></SelectTrigger>
                        <SelectContent>{RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Lý do <span className="text-red-500">*</span></Label>
                    <Textarea value={row.reason} onChange={e => update(row.tempId, 'reason', e.target.value)} rows={2} className="text-sm" placeholder="Lý do thăm hỏi..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Số tiền quà (VNĐ)</Label>
                    <Input type="number" value={row.giftAmount} onChange={e => update(row.tempId, 'giftAmount', e.target.value)} className="h-8 text-sm" placeholder="0" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Mô tả quà</Label>
                    <Input value={row.giftDescription} onChange={e => update(row.tempId, 'giftDescription', e.target.value)} className="h-8 text-sm" placeholder="VD: Tiền mặt, hoa quả..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Người đại diện</Label>
                    <Input value={row.representative} onChange={e => update(row.tempId, 'representative', e.target.value)} className="h-8 text-sm" placeholder="VD: Giám đốc..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Trạng thái</Label>
                    <Select value={row.status} onValueChange={v => update(row.tempId, 'status', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
                            <SelectItem value="Đã thăm">Đã thăm</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Ghi chú</Label>
                    <Textarea value={row.note} onChange={e => update(row.tempId, 'note', e.target.value)} rows={2} className="text-sm" placeholder="Ghi chú bổ sung..." />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Thêm thăm nhân hàng loạt
                    </DialogTitle>
                    <DialogDescription>Thêm nhiều lượt thăm nhân cho nhiều nhân viên cùng lúc</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
                            <Button size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-3.5 w-3.5" /> Nhập Excel
                            </Button>
                            <Button size="sm" className="gap-1.5" onClick={handleExportTemplate}>
                                <Download className="h-3.5 w-3.5" /> Tải mẫu
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setViewMode(v => v === 'table' ? 'expanded' : 'table')} className="gap-1.5">
                                {viewMode === 'table' ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
                                <Plus className="h-3.5 w-3.5" /> Thêm dòng
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {successCount > 0 && <span className="text-green-600 font-medium">✓ {successCount}</span>}
                            {errorCount > 0 && <span className="text-red-500 font-medium">✗ {errorCount}</span>}
                            <span>Tổng: <b>{rows.length}</b></span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {rows.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                                <Users className="h-10 w-10 opacity-30" />
                                <p>Chưa có dòng nào. Nhấn <b>Thêm dòng</b> hoặc <b>Nhập Excel</b> để bắt đầu.</p>
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg overflow-x-auto mx-6 my-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky bg-background z-20 w-10 border-r">#</TableHead>
                                            <TableHead className="sticky bg-background z-20 w-24 border-r text-center">Thao tác</TableHead>
                                            <TableHead className="whitespace-nowrap">Nhân viên *</TableHead>
                                            <TableHead className="whitespace-nowrap">Loại thăm *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày thăm</TableHead>
                                            <TableHead className="whitespace-nowrap">Người được thăm *</TableHead>
                                            <TableHead className="whitespace-nowrap">Quan hệ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Số tiền quà</TableHead>
                                            <TableHead className="whitespace-nowrap">Lý do *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả quà</TableHead>
                                            <TableHead className="whitespace-nowrap">Người đại diện</TableHead>
                                            <TableHead className="whitespace-nowrap">Ghi chú</TableHead>
                                            <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map((row, i) => renderTableRow(row, i))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="space-y-4 px-6 py-4">
                                {rows.map((row, i) => renderExpandedCard(row, i))}
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