import { useEffect, useRef, useState } from 'react';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { toast } from 'sonner';
import {
    Loader2, X, Plus, FileText, Download, Upload,
    Copy, ChevronDown, ChevronUp, Maximize2, Minimize2,
    Search, GraduationCap, Edit2, Trash2, User,
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { certificateApi } from '@/features/degree/api/degree';
import { employeeApi } from '@/features/employees/api/employeeApi';

interface CertificateRow {
    tempId: number;
    employeeId: string;
    employeeName: string;
    certificateType: string;
    certificateName: string;
    organization: string;
    certificateNumber: string;
    issueDate: string;
    expiryDate: string;
    note: string;
    file?: File | null;
    status?: 'pending' | 'success' | 'error';
    errorMessage?: string;
}

interface EmployeeOption {
    id: number;
    fullName: string;
    employeeCode: string;
    departmentName?: string;
}

interface BulkEditFields {
    certificateType?: string;
    organization?: string;
    issueDate?: string;
    expiryDate?: string;
}

interface BulkAddCertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// ─── EmployeePopover ────────────────────────────────────────────────────────
function EmployeePopover({
    row,
    allEmployees,
    onSelect,
}: {
    row: CertificateRow;
    allEmployees: EmployeeOption[];
    onSelect: (emp: EmployeeOption) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? allEmployees.filter(e =>
            e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            e.employeeCode?.toLowerCase().includes(search.toLowerCase())
        )
        : allEmployees.slice(0, 20);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[160px] hover:bg-gray-50 transition-colors text-left ${
                        !row.employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'
                    }`}
                >
                    <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1">
                        {row.employeeName || 'Chọn nhân viên...'}
                    </span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start" side="bottom">
                <div className="p-2 border-b">
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            autoFocus
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm theo tên hoặc mã..."
                            className="pl-7 h-8 text-sm"
                        />
                    </div>
                </div>
                <div className="max-h-52 overflow-y-auto">
                    {filtered.length > 0 ? (
                        filtered.map(emp => (
                            <button
                                key={emp.id}
                                type="button"
                                onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
                                className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                                    row.employeeId === emp.id.toString() ? 'bg-green-50' : ''
                                }`}
                            >
                                <div className="text-sm font-medium">{emp.fullName}</div>
                                <div className="text-xs text-muted-foreground">
                                    {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-xs text-muted-foreground text-center">
                            Không tìm thấy nhân viên
                        </div>
                    )}
                </div>
                {row.employeeId && (
                    <div className="p-2 border-t">
                        <button
                            type="button"
                            onClick={() => { onSelect({ id: 0, fullName: '', employeeCode: '' }); setOpen(false); }}
                            className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1"
                        >
                            Bỏ chọn
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function BulkAddCertificateModal({ isOpen, onClose, onSuccess }: BulkAddCertificateModalProps) {
    const [rows, setRows] = useState<CertificateRow[]>([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);

    // Checkbox selection
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
    const [bulkEditFields, setBulkEditFields] = useState<BulkEditFields>({});

    const fileInputRef = useRef<HTMLInputElement>(null);
    const idCounter = useRef(1);

    useEffect(() => {
        if (!isOpen) return;
        employeeApi.getAll().then(data => setAllEmployees(data || [])).catch(console.error);
        if (rows.length === 0) addRow();
    }, [isOpen]);

    const makeRow = (): CertificateRow => {
        const id = idCounter.current++;
        setNextId(idCounter.current);
        return {
            tempId: id,
            employeeId: '', employeeName: '',
            certificateType: '', certificateName: '',
            organization: '', certificateNumber: '',
            issueDate: '', expiryDate: '', note: '',
            file: null, status: 'pending',
        };
    };

    const addRow = () => setRows(prev => [...prev, makeRow()]);

    const removeRow = (tempId: number) => {
        setRows(prev => prev.filter(r => r.tempId !== tempId));
        setSelectedIds(prev => { const s = new Set(prev); s.delete(tempId); return s; });
    };

    const removeSelected = () => {
        setRows(prev => prev.filter(r => !selectedIds.has(r.tempId)));
        setSelectedIds(new Set());
    };

    const copyRow = (tempId: number) => {
        const row = rows.find(r => r.tempId === tempId);
        if (row) {
            const newRow = { ...row, tempId: idCounter.current++, certificateNumber: '', file: null, status: 'pending' as const };
            setNextId(idCounter.current);
            setRows(prev => [...prev, newRow]);
            toast.success('Đã sao chép dòng');
        }
    };

    const updateRow = (tempId: number, field: keyof CertificateRow, value: any) =>
        setRows(prev => prev.map(r => r.tempId === tempId ? { ...r, [field]: value } : r));

    const toggleExpand = (tempId: number) => {
        setExpandedRows(prev => {
            const s = new Set(prev); s.has(tempId) ? s.delete(tempId) : s.add(tempId); return s;
        });
    };

    // ─── Checkbox helpers ───────────────────────────────────────────────────
    const isAllSelected = rows.length > 0 && selectedIds.size === rows.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < rows.length;

    const toggleSelectAll = () => {
        if (isAllSelected) setSelectedIds(new Set());
        else setSelectedIds(new Set(rows.map(r => r.tempId)));
    };

    const toggleSelect = (tempId: number) => {
        setSelectedIds(prev => {
            const s = new Set(prev);
            s.has(tempId) ? s.delete(tempId) : s.add(tempId);
            return s;
        });
    };

    // ─── Bulk edit apply ────────────────────────────────────────────────────
    const applyBulkEdit = () => {
        setRows(prev => prev.map(r => {
            if (!selectedIds.has(r.tempId)) return r;
            return {
                ...r,
                ...(bulkEditFields.certificateType ? { certificateType: bulkEditFields.certificateType } : {}),
                ...(bulkEditFields.organization ? { organization: bulkEditFields.organization } : {}),
                ...(bulkEditFields.issueDate ? { issueDate: bulkEditFields.issueDate } : {}),
                ...(bulkEditFields.expiryDate ? { expiryDate: bulkEditFields.expiryDate } : {}),
            };
        }));
        setBulkEditFields({});
        setIsBulkEditOpen(false);
        toast.success(`Đã cập nhật ${selectedIds.size} dòng`);
    };

    // ─── File ───────────────────────────────────────────────────────────────
    const handleFileChange = (tempId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        updateRow(tempId, 'file', e.target.files?.[0] || null);
        e.target.value = '';
    };

    // ─── Excel ──────────────────────────────────────────────────────────────
    const handleExportTemplate = async () => {
        try {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Bằng cấp');
            ws.columns = [
                { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
                { header: 'Loại * (EDUCATION/CERTIFICATION/LICENSE)', key: 'certificateType', width: 42 },
                { header: 'Tên bằng cấp *', key: 'certificateName', width: 35 },
                { header: 'Tổ chức cấp *', key: 'organization', width: 35 },
                { header: 'Số bằng cấp', key: 'certificateNumber', width: 20 },
                { header: 'Ngày cấp * (YYYY-MM-DD)', key: 'issueDate', width: 25 },
                { header: 'Ngày hết hạn (YYYY-MM-DD)', key: 'expiryDate', width: 25 },
                { header: 'Ghi chú', key: 'note', width: 40 },
            ];
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            const buf = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_bang_cap.xlsx');
            toast.success('Đã tải xuống file mẫu');
        } catch { toast.error('Không thể tải file mẫu'); }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(await file.arrayBuffer());
            const ws = wb.getWorksheet('Bằng cấp');
            if (!ws) throw new Error('Không tìm thấy sheet "Bằng cấp"');
            const imported: CertificateRow[] = [];
            ws.eachRow((row, n) => {
                if (n === 1) return;
                const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
                const code = g(1);
                const emp = allEmployees.find(e => e.employeeCode === code);
                const id = idCounter.current++;
                imported.push({
                    tempId: id, employeeId: emp?.id.toString() || '',
                    employeeName: emp?.fullName || code,
                    certificateType: g(2), certificateName: g(3),
                    organization: g(4), certificateNumber: g(5),
                    issueDate: g(6), expiryDate: g(7), note: g(8),
                    file: null, status: 'pending',
                });
            });
            setNextId(idCounter.current);
            setRows(prev => [...prev, ...imported]);
            toast.success(`Đã nhập ${imported.length} dòng`);
        } catch (err: any) { toast.error(err.message || 'Không thể đọc file'); }
        finally { e.target.value = ''; }
    };

    // ─── Validate & Submit ──────────────────────────────────────────────────
    const validate = () => {
        let ok = true;
        setRows(prev => prev.map(r => {
            const errs: string[] = [];
            if (!r.employeeId) errs.push('Chưa chọn nhân viên');
            if (!r.certificateType) errs.push('Chưa chọn loại');
            if (!r.certificateName.trim()) errs.push('Chưa nhập tên');
            if (!r.organization.trim()) errs.push('Chưa nhập tổ chức');
            if (!r.issueDate) errs.push('Chưa nhập ngày cấp');
            if (errs.length) { ok = false; return { ...r, status: 'error', errorMessage: errs.join(' · ') }; }
            return { ...r, status: 'pending', errorMessage: undefined };
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
                await certificateApi.create({
                    employeeId: Number(row.employeeId),
                    certificateType: row.certificateType,
                    certificateName: row.certificateName,
                    organization: row.organization,
                    certificateNumber: row.certificateNumber || undefined,
                    issueDate: row.issueDate,
                    expiryDate: row.expiryDate || undefined,
                    note: row.note || undefined,
                }, row.file || undefined);
                setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, status: 'success' } : r));
                ok++;
            } catch (err: any) {
                setRows(prev => prev.map(r => r.tempId === row.tempId
                    ? { ...r, status: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
                fail++;
            }
        }
        setIsSubmitting(false);
        if (!fail) { toast.success(`Đã thêm ${ok} bằng cấp thành công`); onSuccess?.(); handleClose(); }
        else toast.warning(`${ok} thành công · ${fail} thất bại — kiểm tra dòng đỏ`);
    };

    const handleClose = () => {
        setRows([]); setNextId(1); idCounter.current = 1;
        setExpandedRows(new Set()); setSelectedIds(new Set());
        setBulkEditFields({}); setIsBulkEditOpen(false);
        onClose();
    };

    const successCount = rows.filter(r => r.status === 'success').length;
    const errorCount = rows.filter(r => r.status === 'error').length;

    // ─── Render table row ───────────────────────────────────────────────────
    const renderTableRow = (row: CertificateRow, index: number) => (
        <>
            <TableRow
                key={row.tempId}
                className={
                    row.status === 'error' ? 'bg-red-50 border-l-2 border-l-red-400' :
                    row.status === 'success' ? 'bg-green-50 border-l-2 border-l-green-400' : ''
                }
            >
                {/* STT */}
                <TableCell className="sticky bg-inherit z-10 w-10 border-r text-sm font-medium">
                    {index + 1}
                </TableCell>
                {/* Actions */}
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
                {/* Nhân viên — Popover */}
                <TableCell>
                    <EmployeePopover
                        row={row}
                        allEmployees={allEmployees}
                        onSelect={emp => {
                            updateRow(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                            updateRow(row.tempId, 'employeeName', emp.fullName || '');
                        }}
                    />
                </TableCell>
                {/* Loại */}
                <TableCell>
                    <Select value={row.certificateType} onValueChange={v => updateRow(row.tempId, 'certificateType', v)}>
                        <SelectTrigger className="h-8 text-sm min-w-[130px]"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EDUCATION">Học vấn</SelectItem>
                            <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
                            <SelectItem value="LICENSE">Giấy phép</SelectItem>
                        </SelectContent>
                    </Select>
                </TableCell>
                {/* Tên */}
                <TableCell>
                    <Input value={row.certificateName} onChange={e => updateRow(row.tempId, 'certificateName', e.target.value)} className="h-8 text-sm min-w-[150px]" placeholder="Tên bằng cấp..." />
                </TableCell>
                {/* Tổ chức */}
                <TableCell>
                    <Input value={row.organization} onChange={e => updateRow(row.tempId, 'organization', e.target.value)} className="h-8 text-sm min-w-[140px]" placeholder="Tổ chức cấp..." />
                </TableCell>
                {/* Số bằng */}
                <TableCell>
                    <Input value={row.certificateNumber} onChange={e => updateRow(row.tempId, 'certificateNumber', e.target.value)} className="h-8 text-sm min-w-[110px]" placeholder="Số bằng..." />
                </TableCell>
                {/* Ngày cấp */}
                <TableCell>
                    <Input type="date" value={row.issueDate} onChange={e => updateRow(row.tempId, 'issueDate', e.target.value)} className="h-8 text-sm min-w-[130px]" />
                </TableCell>
                {/* Ngày HH */}
                <TableCell>
                    <Input type="date" value={row.expiryDate} onChange={e => updateRow(row.tempId, 'expiryDate', e.target.value)} className="h-8 text-sm min-w-[130px]" />
                </TableCell>
                {/* File */}
                <TableCell>
                    <input id={`f-${row.tempId}`} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileChange(row.tempId, e)} />
                    {row.file ? (
                        <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 min-w-[110px]">
                            <FileText className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-[70px]">{row.file.name}</span>
                            <button onClick={() => updateRow(row.tempId, 'file', null)} className="ml-auto shrink-0"><X className="h-3 w-3" /></button>
                        </div>
                    ) : (
                        <label htmlFor={`f-${row.tempId}`} className="cursor-pointer flex items-center gap-1 text-xs text-muted-foreground border rounded px-2 py-1 hover:bg-gray-50 min-w-[80px]">
                            <Upload className="h-3 w-3" /> Chọn file
                        </label>
                    )}
                </TableCell>
                {/* Lỗi inline */}
                {row.status !== 'pending' && (
                    <TableCell>
                        {row.status === 'success'
                            ? <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Thành công</span>
                            : <span className="text-xs text-red-500 whitespace-nowrap">{row.errorMessage}</span>
                        }
                    </TableCell>
                )}
            </TableRow>
            {/* Expanded row */}
            {expandedRows.has(row.tempId) && (
                <TableRow className={row.status === 'error' ? 'bg-red-50' : row.status === 'success' ? 'bg-green-50' : 'bg-muted/20'}>
                    <TableCell colSpan={12}>
                        <div className="p-3 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs">Ghi chú</Label>
                                <Textarea value={row.note} onChange={e => updateRow(row.tempId, 'note', e.target.value)} rows={2} className="text-sm" placeholder="Ghi chú..." />
                            </div>
                            {row.errorMessage && row.status === 'error' && (
                                <div className="p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700 self-start">
                                    <b>Lỗi:</b> {row.errorMessage}
                                </div>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );

    // ─── Render expanded card ───────────────────────────────────────────────
    const renderExpandedCard = (row: CertificateRow, index: number) => (
        <div key={row.tempId} className={`border rounded-lg p-4 space-y-4 ${
            row.status === 'error' ? 'border-red-300 bg-red-50' :
            row.status === 'success' ? 'border-green-300 bg-green-50' : 'bg-muted/30'
        }`}>
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                    <Checkbox checked={selectedIds.has(row.tempId)} onCheckedChange={() => toggleSelect(row.tempId)} />
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{index + 1}</span>
                    <span className="font-semibold text-sm">{row.certificateName || 'Bằng cấp mới'}</span>
                    {row.status === 'success' && <span className="text-xs text-green-600">✓ Đã lưu</span>}
                    {row.status === 'error' && <span className="text-xs text-red-500">{row.errorMessage}</span>}
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
                        updateRow(row.tempId, 'employeeId', emp.id ? emp.id.toString() : '');
                        updateRow(row.tempId, 'employeeName', emp.fullName || '');
                    }} />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Loại <span className="text-red-500">*</span></Label>
                    <Select value={row.certificateType} onValueChange={v => updateRow(row.tempId, 'certificateType', v)}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="EDUCATION">Học vấn</SelectItem>
                            <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
                            <SelectItem value="LICENSE">Giấy phép</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Tên bằng cấp <span className="text-red-500">*</span></Label>
                    <Input value={row.certificateName} onChange={e => updateRow(row.tempId, 'certificateName', e.target.value)} className="h-8 text-sm" placeholder="VD: Cử nhân KHMT..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Tổ chức cấp <span className="text-red-500">*</span></Label>
                    <Input value={row.organization} onChange={e => updateRow(row.tempId, 'organization', e.target.value)} className="h-8 text-sm" placeholder="VD: ĐH Bách Khoa..." />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Số bằng cấp</Label>
                    <Input value={row.certificateNumber} onChange={e => updateRow(row.tempId, 'certificateNumber', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Ngày cấp <span className="text-red-500">*</span></Label>
                    <Input type="date" value={row.issueDate} onChange={e => updateRow(row.tempId, 'issueDate', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">Ngày hết hạn</Label>
                    <Input type="date" value={row.expiryDate} onChange={e => updateRow(row.tempId, 'expiryDate', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Ghi chú</Label>
                    <Textarea value={row.note} onChange={e => updateRow(row.tempId, 'note', e.target.value)} rows={2} className="text-sm" />
                </div>
                <div className="space-y-1 col-span-2">
                    <Label className="text-xs">Tài liệu đính kèm</Label>
                    <input id={`fe-${row.tempId}`} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={e => handleFileChange(row.tempId, e)} />
                    {row.file ? (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                            <FileText className="h-4 w-4" />
                            <span className="flex-1 truncate">{row.file.name}</span>
                            <button onClick={() => updateRow(row.tempId, 'file', null)}><X className="h-3.5 w-3.5" /></button>
                        </div>
                    ) : (
                        <label htmlFor={`fe-${row.tempId}`} className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground border-2 border-dashed rounded px-3 py-2 hover:bg-gray-50">
                            <Upload className="h-4 w-4" /> Nhấn để chọn file (PDF, JPG, PNG)
                        </label>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Thêm bằng cấp hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Thêm nhiều bằng cấp cho nhiều nhân viên cùng lúc
                    </DialogDescription>
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

                            {/* Bulk actions — hiện khi có chọn */}
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2 pl-2 border-l">
                                    <span className="text-sm text-muted-foreground font-medium">
                                        Đã chọn <b>{selectedIds.size}</b> dòng
                                    </span>

                                    {/* Bulk edit popover */}
                                    <Popover open={isBulkEditOpen} onOpenChange={setIsBulkEditOpen}>
                                        <PopoverTrigger asChild>
                                            <Button size="sm" variant="outline" className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50">
                                                <Edit2 className="h-3.5 w-3.5" /> Sửa hàng loạt
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4" align="start">
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold mb-1">Sửa hàng loạt ({selectedIds.size} dòng)</p>
                                                    <p className="text-xs text-muted-foreground">Chỉ điền trường muốn áp dụng, trường trống sẽ bỏ qua</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Loại bằng cấp</Label>
                                                    <Select value={bulkEditFields.certificateType || ''} onValueChange={v => setBulkEditFields(p => ({ ...p, certificateType: v }))}>
                                                        <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Giữ nguyên" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="EDUCATION">Học vấn</SelectItem>
                                                            <SelectItem value="CERTIFICATION">Chứng chỉ</SelectItem>
                                                            <SelectItem value="LICENSE">Giấy phép</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Tổ chức cấp</Label>
                                                    <Input
                                                        value={bulkEditFields.organization || ''}
                                                        onChange={e => setBulkEditFields(p => ({ ...p, organization: e.target.value }))}
                                                        className="h-8 text-sm" placeholder="Giữ nguyên nếu trống"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Ngày cấp</Label>
                                                    <Input type="date" value={bulkEditFields.issueDate || ''} onChange={e => setBulkEditFields(p => ({ ...p, issueDate: e.target.value }))} className="h-8 text-sm" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Ngày hết hạn</Label>
                                                    <Input type="date" value={bulkEditFields.expiryDate || ''} onChange={e => setBulkEditFields(p => ({ ...p, expiryDate: e.target.value }))} className="h-8 text-sm" />
                                                </div>
                                                <div className="flex gap-2 pt-1">
                                                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setIsBulkEditOpen(false); setBulkEditFields({}); }}>Hủy</Button>
                                                    <Button size="sm" className="flex-1" onClick={applyBulkEdit}>Áp dụng</Button>
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>

                                    <Button size="sm" variant="outline" className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50" onClick={removeSelected}>
                                        <Trash2 className="h-3.5 w-3.5" /> Xóa đã chọn
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {successCount > 0 && <span className="text-green-600 font-medium">✓ {successCount}</span>}
                            {errorCount > 0 && <span className="text-red-500 font-medium">✗ {errorCount}</span>}
                            <span>Tổng: <b>{rows.length}</b></span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto px-6 py-4 min-h-0">
                        {rows.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                                <GraduationCap className="h-10 w-10 opacity-30" />
                                <p>Chưa có dòng nào. Nhấn <b>Thêm dòng</b> hoặc <b>Nhập Excel</b> để bắt đầu.</p>
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky bg-background z-20 w-10 border-r">#</TableHead>
                                            <TableHead className="sticky bg-background z-20 w-24 border-r text-center">Thao tác</TableHead>
                                            <TableHead className="whitespace-nowrap">Nhân viên *</TableHead>
                                            <TableHead className="whitespace-nowrap">Loại *</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên bằng cấp *</TableHead>
                                            <TableHead className="whitespace-nowrap">Tổ chức cấp *</TableHead>
                                            <TableHead className="whitespace-nowrap">Số bằng</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày cấp *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày hết hạn</TableHead>
                                            <TableHead className="whitespace-nowrap">File</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map((row, i) => renderTableRow(row, i))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="space-y-4">
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