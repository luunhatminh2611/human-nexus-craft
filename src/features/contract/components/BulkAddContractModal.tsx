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
    ChevronDown, Search, FileText, User, Paperclip,
} from 'lucide-react';
import { contractApi } from '../api/contractApi';
import { employeeApi } from '../../employees/api/employeeApi';
import { categoryConfigs } from '@/features/employees/components/CategoriesConfig';

interface ContractRow {
    tempId: number;
    employeeId: string;
    employeeName: string;
    contractType: string;
    startDate: string;
    endDate: string;
    salary: string;
    notes: string;
    file: File | null;
    rowStatus: 'pending' | 'success' | 'error';
    errorMessage?: string;
}

interface EmployeeOption {
    id: number;
    fullName: string;
    code: string;
    department?: { id: number; name: string };
}

interface ContractTypeOption {
    id: number;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({ row, allEmployees, onSelect }: {
    row: ContractRow;
    allEmployees: EmployeeOption[];
    onSelect: (emp: EmployeeOption) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = search.trim()
        ? allEmployees.filter(e =>
            e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            e.code?.toLowerCase().includes(search.toLowerCase()))
        : allEmployees.slice(0, 20);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button type="button" className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[170px] hover:bg-gray-50 transition-colors text-left ${!row.employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}`}>
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
                                {emp.code}{emp.department?.name && ` · ${emp.department.name}`}
                            </div>
                        </button>
                    )) : (
                        <div className="px-3 py-4 text-xs text-muted-foreground text-center">Không tìm thấy nhân viên</div>
                    )}
                </div>
                {row.employeeId && (
                    <div className="p-2 border-t">
                        <button type="button"
                            onClick={() => { onSelect({ id: 0, fullName: '', code: '' }); setOpen(false); }}
                            className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1">
                            Bỏ chọn
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ─── FileCell ─────────────────────────────────────────────────────────────────
function FileCell({ row, onFileChange }: {
    row: ContractRow;
    onFileChange: (id: number, file: File | null) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex items-center gap-1.5 min-w-[160px]">
            <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => onFileChange(row.tempId, e.target.files?.[0] ?? null)}
            />
            {row.file ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                    <Paperclip className="h-3.5 w-3.5 shrink-0 text-green-600" />
                    <span className="text-xs text-green-700 truncate flex-1 max-w-[110px]" title={row.file.name}>
                        {row.file.name}
                    </span>
                    <button
                        type="button"
                        onClick={() => onFileChange(row.tempId, null)}
                        className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-1 h-8 px-2 text-xs border border-dashed rounded hover:bg-gray-50 transition-colors text-muted-foreground w-full"
                >
                    <Upload className="h-3.5 w-3.5" />
                    Chọn PDF...
                </button>
            )}
            {row.file && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-muted-foreground hover:text-blue-500 shrink-0"
                    title="Đổi file"
                >
                    <Upload className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BulkAddContractModal({ isOpen, onClose, onSuccess }: Props) {
    const [rows, setRows] = useState<ContractRow[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractTypeOption[]>([]);

    const templateInputRef = useRef<HTMLInputElement>(null);
    const idCounter = useRef(1);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (!isOpen) return;
        employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
        categoryConfigs.laborContractType.api.getAll()
            .then(d => setContractTypes(d || []))
            .catch(console.error);
        if (rows.length === 0) addRow();
    }, [isOpen]);

    const makeRow = (): ContractRow => ({
        tempId: idCounter.current++,
        employeeId: '', employeeName: '',
        contractType: '', startDate: today,
        endDate: '', salary: '',
        notes: '', file: null,
        rowStatus: 'pending',
    });

    const addRow = () => setRows(prev => [...prev, makeRow()]);
    const removeRow = (id: number) => setRows(prev => prev.filter(r => r.tempId !== id));

    const copyRow = (id: number) => {
        const row = rows.find(r => r.tempId === id);
        if (row) {
            // File không copy để tránh dùng chung reference
            setRows(prev => [...prev, { ...row, tempId: idCounter.current++, file: null, rowStatus: 'pending', errorMessage: undefined }]);
            toast.success('Đã sao chép dòng (cần chọn lại file PDF)');
        }
    };

    const update = (id: number, field: keyof ContractRow, value: any) =>
        setRows(prev => prev.map(r => r.tempId === id ? { ...r, [field]: value } : r));

    const handleFileChange = (id: number, file: File | null) =>
        setRows(prev => prev.map(r => r.tempId === id ? { ...r, file } : r));

    // ─── Excel template (không có cột file vì file phải chọn thủ công) ────────
    const handleExportTemplate = async () => {
        try {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Hợp đồng');
            ws.columns = [
                { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
                { header: 'Loại hợp đồng * (nhập tên loại)', key: 'contractType', width: 40 },
                { header: 'Ngày bắt đầu * (YYYY-MM-DD)', key: 'startDate', width: 28 },
                { header: 'Ngày kết thúc * (YYYY-MM-DD)', key: 'endDate', width: 28 },
                { header: 'Lương cơ bản (VNĐ) *', key: 'salary', width: 24 },
                { header: 'Ghi chú', key: 'notes', width: 40 },
            ];
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

            // Sheet danh sách loại hợp đồng để tham khảo
            if (contractTypes.length > 0) {
                const wsTypes = wb.addWorksheet('Loại hợp đồng');
                wsTypes.columns = [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Tên loại hợp đồng', key: 'name', width: 40 },
                ];
                wsTypes.getRow(1).font = { bold: true };
                contractTypes.forEach(t => wsTypes.addRow({ id: t.id, name: t.name }));
            }

            const buf = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_hop_dong.xlsx');
            toast.success('Đã tải xuống file mẫu');
        } catch {
            toast.error('Không thể tải file mẫu');
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const wb = new ExcelJS.Workbook();
            await wb.xlsx.load(await file.arrayBuffer());
            const ws = wb.getWorksheet('Hợp đồng');
            if (!ws) throw new Error('Không tìm thấy sheet "Hợp đồng"');
            const imported: ContractRow[] = [];
            ws.eachRow((row, n) => {
                if (n === 1) return;
                const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
                const code = g(1);
                const emp = allEmployees.find(e => e.code === code);
                // Tìm contractType theo tên
                const typeName = g(2);
                const matchedType = contractTypes.find(t => t.name.toLowerCase() === typeName.toLowerCase());
                imported.push({
                    tempId: idCounter.current++,
                    employeeId: emp?.id.toString() || '',
                    employeeName: emp?.fullName || code,
                    contractType: matchedType ? matchedType.id.toString() : typeName,
                    startDate: g(3) || today,
                    endDate: g(4),
                    salary: g(5),
                    notes: g(6),
                    file: null, // File PDF phải chọn thủ công
                    rowStatus: 'pending',
                });
            });
            setRows(prev => [...prev, ...imported]);
            toast.success(`Đã nhập ${imported.length} dòng — vui lòng chọn file PDF cho từng dòng`);
        } catch (err: any) {
            toast.error(err.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    // ─── Validate ─────────────────────────────────────────────────────────────
    const validate = () => {
        let ok = true;
        setRows(prev => prev.map(r => {
            const errs: string[] = [];
            if (!r.employeeId) errs.push('Chưa chọn nhân viên');
            if (!r.contractType) errs.push('Chưa chọn loại HĐ');
            if (!r.startDate) errs.push('Chưa nhập ngày bắt đầu');
            if (!r.endDate) errs.push('Chưa nhập ngày kết thúc');
            if (r.startDate && r.endDate && new Date(r.endDate) <= new Date(r.startDate))
                errs.push('Ngày kết thúc phải sau ngày bắt đầu');
            if (!r.salary || Number(r.salary) <= 0) errs.push('Lương không hợp lệ');
            if (!r.file) errs.push('Chưa chọn file PDF');
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
                    employee: { id: Number(row.employeeId) },
                    contractType: row.contractType,
                    startDate: row.startDate,
                    endDate: row.endDate,
                    salary: Number(row.salary),
                    notes: row.notes || null,
                };
                await contractApi.create(payload, row.file!);
                setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, rowStatus: 'success' } : r));
                ok++;
            } catch (err: any) {
                setRows(prev => prev.map(r => r.tempId === row.tempId
                    ? { ...r, rowStatus: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
                fail++;
            }
        }
        setIsSubmitting(false);
        if (!fail) { toast.success(`Đã thêm ${ok} hợp đồng thành công`); onSuccess?.(); handleClose(); }
        else toast.warning(`${ok} thành công · ${fail} thất bại — kiểm tra dòng đỏ`);
    };

    const handleClose = () => {
        setRows([]); idCounter.current = 1; onClose();
    };

    const successCount = rows.filter(r => r.rowStatus === 'success').length;
    const errorCount = rows.filter(r => r.rowStatus === 'error').length;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Thêm hợp đồng hàng loạt
                    </DialogTitle>
                    <DialogDescription>Thêm nhiều hợp đồng lao động cho nhiều nhân viên cùng lúc</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {/* Toolbar */}
                    <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0 flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <input ref={templateInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImportExcel} />
                            <Button size="sm" className="gap-1.5" onClick={() => templateInputRef.current?.click()}>
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
                            {errorCount > 0 && <span className="text-red-500 font-medium">✗ {errorCount}</span>}
                            <span>Tổng: <b>{rows.length}</b></span>
                        </div>
                    </div>

                    {/* Note about PDF */}
                    <div className="px-6 pt-3 shrink-0">
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                            ⚠️ File PDF hợp đồng phải được chọn thủ công cho từng dòng. Nhập Excel chỉ điền các thông tin còn lại.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                        {rows.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                                <FileText className="h-10 w-10 opacity-30" />
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
                                            <TableHead className="whitespace-nowrap">Loại hợp đồng *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày bắt đầu *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày kết thúc *</TableHead>
                                            <TableHead className="whitespace-nowrap">Lương cơ bản (VNĐ) *</TableHead>
                                            <TableHead className="whitespace-nowrap">File PDF *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <TableRow key={row.tempId} className={
                                                row.rowStatus === 'error' ? 'bg-red-50 border-l-2 border-l-red-400' :
                                                row.rowStatus === 'success' ? 'bg-green-50 border-l-2 border-l-green-400' : ''
                                            }>
                                                {/* # */}
                                                <TableCell className="sticky left-0 bg-inherit z-10 w-10 border-r text-sm font-medium text-muted-foreground">
                                                    {index + 1}
                                                </TableCell>
                                                {/* Actions */}
                                                <TableCell className="sticky left-10 bg-inherit z-10 w-20 border-r">
                                                    <div className="flex gap-0.5">
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
                                                {/* Loại hợp đồng */}
                                                <TableCell>
                                                    <Select value={row.contractType} onValueChange={v => update(row.tempId, 'contractType', v)}>
                                                        <SelectTrigger className="h-8 text-sm min-w-[160px]">
                                                            <SelectValue placeholder="Chọn loại" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {contractTypes.map(t => (
                                                                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                {/* Ngày bắt đầu */}
                                                <TableCell>
                                                    <Input
                                                        type="date"
                                                        value={row.startDate}
                                                        onChange={e => update(row.tempId, 'startDate', e.target.value)}
                                                        className="h-8 text-sm min-w-[140px]"
                                                    />
                                                </TableCell>
                                                {/* Ngày kết thúc */}
                                                <TableCell>
                                                    <Input
                                                        type="date"
                                                        value={row.endDate}
                                                        onChange={e => update(row.tempId, 'endDate', e.target.value)}
                                                        className="h-8 text-sm min-w-[140px]"
                                                    />
                                                </TableCell>
                                                {/* Lương */}
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={row.salary}
                                                        onChange={e => update(row.tempId, 'salary', e.target.value)}
                                                        className="h-8 text-sm min-w-[140px]"
                                                        placeholder="15000000"
                                                    />
                                                </TableCell>
                                                {/* File PDF */}
                                                <TableCell>
                                                    <FileCell row={row} onFileChange={handleFileChange} />
                                                </TableCell>
                                                {/* Ghi chú */}
                                                <TableCell>
                                                    <Input
                                                        value={row.notes}
                                                        onChange={e => update(row.tempId, 'notes', e.target.value)}
                                                        className="h-8 text-sm min-w-[160px]"
                                                        placeholder="Ghi chú..."
                                                    />
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