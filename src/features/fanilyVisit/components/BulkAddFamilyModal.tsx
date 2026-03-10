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
    ChevronDown, Search, Users, User,
} from 'lucide-react';
import { familyApi, FamilyPayload } from '../../employees/api/family';
import { employeeApi } from '@/features/employees/api/employeeApi';

const RELATIONSHIPS = ['Cha', 'Mẹ', 'Vợ', 'Chồng', 'Con', 'Anh', 'Chị', 'Em', 'Khác'];

interface FamilyRow {
    tempId: number;
    employeeId: string;
    employeeName: string;
    name: string;
    relationship: string;
    birthday: string;
    phone: string;
    address: string;
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

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({ row, allEmployees, onSelect }: {
    row: FamilyRow;
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
                            className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1">
                            Bỏ chọn
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BulkAddFamilyModal({ isOpen, onClose, onSuccess }: Props) {
    const [rows, setRows] = useState<FamilyRow[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const idCounter = useRef(1);

    useEffect(() => {
        if (!isOpen) return;
        employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
        if (rows.length === 0) addRow();
    }, [isOpen]);

    const makeRow = (): FamilyRow => ({
        tempId: idCounter.current++,
        employeeId: '', employeeName: '',
        name: '', relationship: '',
        birthday: '', phone: '', address: '',
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

    const update = (id: number, field: keyof FamilyRow, value: any) =>
        setRows(prev => prev.map(r => r.tempId === id ? { ...r, [field]: value } : r));

    // ─── Excel ────────────────────────────────────────────────────────────────
    const handleExportTemplate = async () => {
        try {
            const wb = new ExcelJS.Workbook();
            const ws = wb.addWorksheet('Quan hệ gia đình');
            ws.columns = [
                { header: 'Mã nhân viên *', key: 'employeeCode', width: 20 },
                { header: 'Họ tên thân nhân *', key: 'name', width: 28 },
                { header: 'Quan hệ * (Cha/Mẹ/Vợ/Chồng/Con/Anh/Chị/Em/Khác)', key: 'relationship', width: 48 },
                { header: 'Ngày sinh (YYYY-MM-DD)', key: 'birthday', width: 26 },
                { header: 'Số điện thoại', key: 'phone', width: 20 },
                { header: 'Địa chỉ', key: 'address', width: 40 },
            ];
            ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
            const buf = await wb.xlsx.writeBuffer();
            saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'Mau_them_quan_he_gia_dinh.xlsx');
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
            const ws = wb.getWorksheet('Quan hệ gia đình');
            if (!ws) throw new Error('Không tìm thấy sheet "Quan hệ gia đình"');
            const imported: FamilyRow[] = [];
            ws.eachRow((row, n) => {
                if (n === 1) return;
                const g = (c: number) => { const v = row.getCell(c).value; return v ? String(v).trim() : ''; };
                const code = g(1);
                const emp = allEmployees.find(e => e.employeeCode === code);
                imported.push({
                    tempId: idCounter.current++,
                    employeeId: emp?.id.toString() || '',
                    employeeName: emp?.fullName || code,
                    name: g(2),
                    relationship: g(3),
                    birthday: g(4),
                    phone: g(5),
                    address: g(6),
                    rowStatus: 'pending',
                });
            });
            setRows(prev => [...prev, ...imported]);
            toast.success(`Đã nhập ${imported.length} dòng`);
        } catch (err: any) {
            toast.error(err.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    // ─── Validate & Submit ────────────────────────────────────────────────────
    const validate = () => {
        let ok = true;
        setRows(prev => prev.map(r => {
            const errs: string[] = [];
            if (!r.employeeId) errs.push('Chưa chọn nhân viên');
            if (!r.name.trim()) errs.push('Chưa nhập họ tên');
            if (!r.relationship) errs.push('Chưa chọn quan hệ');
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
                const payload: FamilyPayload = {
                    employeeId: Number(row.employeeId),
                    name: row.name,
                    relationship: row.relationship,
                    birthday: row.birthday || undefined,
                    phone: row.phone || undefined,
                    address: row.address || undefined,
                };
                await familyApi.create(payload);
                setRows(prev => prev.map(r => r.tempId === row.tempId ? { ...r, rowStatus: 'success' } : r));
                ok++;
            } catch (err: any) {
                setRows(prev => prev.map(r => r.tempId === row.tempId
                    ? { ...r, rowStatus: 'error', errorMessage: err?.response?.data?.message || 'Lỗi khi lưu' } : r));
                fail++;
            }
        }
        setIsSubmitting(false);
        if (!fail) { toast.success(`Đã thêm ${ok} quan hệ gia đình thành công`); onSuccess?.(); handleClose(); }
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
                        <Users className="h-5 w-5" /> Thêm quan hệ gia đình hàng loạt
                    </DialogTitle>
                    <DialogDescription>Thêm thông tin thân nhân cho nhiều nhân viên cùng lúc</DialogDescription>
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
                        ) : (
                            <div className="border rounded-lg overflow-x-auto mx-6 my-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="sticky left-0 bg-background z-20 w-10 border-r">#</TableHead>
                                            <TableHead className="sticky left-10 bg-background z-20 w-20 border-r text-center">Thao tác</TableHead>
                                            <TableHead className="whitespace-nowrap">Nhân viên *</TableHead>
                                            <TableHead className="whitespace-nowrap">Họ tên thân nhân *</TableHead>
                                            <TableHead className="whitespace-nowrap">Quan hệ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Ngày sinh</TableHead>
                                            <TableHead className="whitespace-nowrap">Số điện thoại</TableHead>
                                            <TableHead className="whitespace-nowrap">Địa chỉ</TableHead>
                                            <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
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
                                                {/* Họ tên thân nhân */}
                                                <TableCell>
                                                    <Input
                                                        value={row.name}
                                                        onChange={e => update(row.tempId, 'name', e.target.value)}
                                                        className="h-8 text-sm min-w-[160px]"
                                                        placeholder="Nguyễn Thị A..."
                                                    />
                                                </TableCell>
                                                {/* Quan hệ */}
                                                <TableCell>
                                                    <Select value={row.relationship} onValueChange={v => update(row.tempId, 'relationship', v)}>
                                                        <SelectTrigger className="h-8 text-sm min-w-[110px]">
                                                            <SelectValue placeholder="Chọn" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                {/* Ngày sinh */}
                                                <TableCell>
                                                    <Input
                                                        type="date"
                                                        value={row.birthday}
                                                        onChange={e => update(row.tempId, 'birthday', e.target.value)}
                                                        className="h-8 text-sm min-w-[140px]"
                                                    />
                                                </TableCell>
                                                {/* Số điện thoại */}
                                                <TableCell>
                                                    <Input
                                                        value={row.phone}
                                                        onChange={e => update(row.tempId, 'phone', e.target.value)}
                                                        className="h-8 text-sm min-w-[130px]"
                                                        placeholder="0912345678"
                                                    />
                                                </TableCell>
                                                {/* Địa chỉ */}
                                                <TableCell>
                                                    <Input
                                                        value={row.address}
                                                        onChange={e => update(row.tempId, 'address', e.target.value)}
                                                        className="h-8 text-sm min-w-[200px]"
                                                        placeholder="Số nhà, đường, quận..."
                                                    />
                                                </TableCell>
                                                {/* Trạng thái */}
                                                <TableCell>
                                                    {row.rowStatus === 'success' && (
                                                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Thành công</span>
                                                    )}
                                                    {row.rowStatus === 'error' && (
                                                        <span className="text-xs text-red-500 whitespace-nowrap">{row.errorMessage}</span>
                                                    )}
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