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
import { Textarea } from '@/shared/components/ui/textarea';
import { nationalityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Globe, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddNationalityModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [nationalities, setNationalities] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && nationalities.length === 0) {
            handleAddNationality();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => nationalityApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${nationalities.length} quốc tịch thành công`);
            queryClient.invalidateQueries({ queryKey: ['nationalities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm quốc tịch');
        },
    });

    const createNewNationality = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Quốc tịch');
            const dropdownSheet = workbook.addWorksheet('Danh mục');

            dropdownSheet.state = 'hidden';

            const columns = [
                { header: 'Mã quốc tịch', key: 'code', width: 20 },
                { header: 'Tên quốc tịch *', key: 'name', width: 30 },
            ];

            mainSheet.columns = columns;

            nationalities.forEach(nat => {
                mainSheet.addRow({
                    code: nat.code,
                    name: nat.name,
                });
            });

            mainSheet.getRow(1).font = { bold: true };
            mainSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            const fileName = nationalities.length > 0
                ? `Them_quoc_tich_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_quoc_tich.xlsx`;

            saveAs(blob, fileName);

            toast.success(nationalities.length > 0
                ? `Đã tải xuống file với ${nationalities.length} quốc tịch`
                : 'Đã tải xuống file mẫu');
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải xuống file');
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(await file.arrayBuffer());

            const worksheet = workbook.getWorksheet('Quốc tịch');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Quốc tịch"');
            }

            const importedNationalities: any[] = [];
            const existingCodes = new Map(nationalities.map(nat => [nat.code, nat]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const nationalityData = {
                    tempId: existingCodes.has(code) ? existingCodes.get(code)!.tempId : nextId + importedNationalities.length,
                    code,
                    name,
                };

                importedNationalities.push(nationalityData);
            });

            const updatedNationalities = nationalities.map(nat => {
                const imported = importedNationalities.find(imp => imp.code === nat.code);
                return imported || nat;
            });

            const newNationalities = importedNationalities.filter(
                imp => !existingCodes.has(imp.code)
            );

            setNationalities([...updatedNationalities, ...newNationalities]);
            setNextId(prev => prev + newNationalities.length);

            toast.success(`Đã nhập ${importedNationalities.length} quốc tịch (${newNationalities.length} mới, ${importedNationalities.length - newNationalities.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyNationality = (tempId: number) => {
        const nationalityToCopy = nationalities.find(nat => nat.tempId === tempId);
        if (nationalityToCopy) {
            const newNationality = {
                ...nationalityToCopy,
                tempId: nextId,
                code: '',
            };
            setNationalities(prev => [...prev, newNationality]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép quốc tịch');
        }
    };

    const toggleRowExpansion = (tempId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tempId)) {
                newSet.delete(tempId);
            } else {
                newSet.add(tempId);
            }
            return newSet;
        });
    };

    const handleAddNationality = () => {
        setNationalities(prev => [...prev, createNewNationality()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveNationality = (tempId: number) => {
        setNationalities(prev => prev.filter(nat => nat.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setNationalities(prev =>
            prev.map(nat =>
                nat.tempId === tempId ? { ...nat, [field]: value } : nat
            )
        );
    };

    const handleSubmit = () => {
        if (nationalities.length === 0) {
            toast.error('Vui lòng thêm ít nhất một quốc tịch');
            return;
        }

        const invalidNationalities = nationalities.filter(nat => !nat.name);

        if (invalidNationalities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên quốc tịch cho tất cả các dòng');
            return;
        }

        const payload = nationalities.map(nat => ({
            code: nat.code || null,
            name: nat.name,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setNationalities([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (nationality, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={nationality[field]}
                        onChange={(e) => handleFieldChange(nationality.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã quốc tịch' : 'Tên quốc tịch'}
                    />
                );
            default:
                return null;
        }
    };

    const renderNationalityFieldsExpanded = (nationality, index) => (
        <div key={nationality.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {nationality.name || 'Quốc tịch mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNationality(nationality.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã quốc tịch
                    </Label>
                    <Input
                        value={nationality.code}
                        onChange={(e) => handleFieldChange(nationality.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: VN, US, JP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên quốc tịch <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={nationality.name}
                        onChange={(e) => handleFieldChange(nationality.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Việt Nam, Hoa Kỳ..."
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
                        <Globe className="h-5 w-5" />
                        Thêm quốc tịch hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều quốc tịch và lưu một lần
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
                        <div className="flex items-center gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleImportExcel}
                            />

                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4" />
                                Tải lên
                            </Button>

                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={handleExportExcel}
                            >
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'table' ? 'expanded' : 'table')}
                                className="gap-2"
                            >
                                {viewMode === 'table' ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                {viewMode === 'table' ? 'Mở rộng' : 'Thu gọn'}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleAddNationality}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm quốc tịch
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{nationalities.length}</b> quốc tịch
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {nationalities.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có quốc tịch nào. Nhấn <b>Thêm quốc tịch</b> để bắt đầu.
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-32 text-center sticky left-12 bg-background z-10">
                                                Thao tác
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">Mã quốc tịch</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên quốc tịch *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {nationalities.map((nationality, index) => (
                                            <>
                                                <TableRow key={nationality.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(nationality.tempId)}
                                                                title={expandedRows.has(nationality.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(nationality.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyNationality(nationality.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveNationality(nationality.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(nationality, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(nationality, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(nationality.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderNationalityFieldsExpanded(nationality, index)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {nationalities.map((nationality, index) => renderNationalityFieldsExpanded(nationality, index))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={createMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || nationalities.length === 0}
                            >
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