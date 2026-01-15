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
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, GraduationCap, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddProfessionalLevelModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [professionalLevels, setProfessionalLevels] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && professionalLevels.length === 0) {
            handleAddProfessionalLevel();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.professionalLevel.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${professionalLevels.length} trình độ chuyên môn thành công`);
            queryClient.invalidateQueries({ queryKey: ['professionalLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm trình độ chuyên môn');
        },
    });

    const createNewProfessionalLevel = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Trình độ chuyên môn');

            const columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ chuyên môn *', key: 'name', width: 35 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            professionalLevels.forEach(pl => {
                mainSheet.addRow({
                    code: pl.code,
                    name: pl.name,
                    description: pl.description,
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

            const fileName = professionalLevels.length > 0
                ? `Them_trinh_do_chuyen_mon_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_trinh_do_chuyen_mon.xlsx`;

            saveAs(blob, fileName);

            toast.success(professionalLevels.length > 0
                ? `Đã tải xuống file với ${professionalLevels.length} trình độ chuyên môn`
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

            const worksheet = workbook.getWorksheet('Trình độ chuyên môn');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ chuyên môn"');
            }

            const importedProfessionalLevels: any[] = [];
            const existingNames = new Map(professionalLevels.map(pl => [pl.name, pl]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const professionalLevelData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedProfessionalLevels.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedProfessionalLevels.push(professionalLevelData);
            });

            const updatedProfessionalLevels = professionalLevels.map(pl => {
                const imported = importedProfessionalLevels.find(imp => imp.name === pl.name);
                return imported || pl;
            });

            const newProfessionalLevels = importedProfessionalLevels.filter(
                imp => !existingNames.has(imp.name)
            );

            setProfessionalLevels([...updatedProfessionalLevels, ...newProfessionalLevels]);
            setNextId(prev => prev + newProfessionalLevels.length);

            toast.success(`Đã nhập ${importedProfessionalLevels.length} trình độ chuyên môn (${newProfessionalLevels.length} mới, ${importedProfessionalLevels.length - newProfessionalLevels.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyProfessionalLevel = (tempId: number) => {
        const professionalLevelToCopy = professionalLevels.find(pl => pl.tempId === tempId);
        if (professionalLevelToCopy) {
            const newProfessionalLevel = {
                ...professionalLevelToCopy,
                tempId: nextId,
                code: '',
            };
            setProfessionalLevels(prev => [...prev, newProfessionalLevel]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép trình độ chuyên môn');
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

    const handleAddProfessionalLevel = () => {
        setProfessionalLevels(prev => [...prev, createNewProfessionalLevel()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveProfessionalLevel = (tempId: number) => {
        setProfessionalLevels(prev => prev.filter(pl => pl.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setProfessionalLevels(prev =>
            prev.map(pl =>
                pl.tempId === tempId ? { ...pl, [field]: value } : pl
            )
        );
    };

    const handleSubmit = () => {
        if (professionalLevels.length === 0) {
            toast.error('Vui lòng thêm ít nhất một trình độ chuyên môn');
            return;
        }

        const invalidProfessionalLevels = professionalLevels.filter(pl => !pl.name);

        if (invalidProfessionalLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ chuyên môn cho tất cả các dòng');
            return;
        }

        const payload = professionalLevels.map(pl => ({
            code: pl.code || null,
            name: pl.name,
            description: pl.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setProfessionalLevels([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (professionalLevel, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={professionalLevel[field]}
                        onChange={(e) => handleFieldChange(professionalLevel.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ chuyên môn'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={professionalLevel.description}
                        onChange={(e) => handleFieldChange(professionalLevel.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderProfessionalLevelFieldsExpanded = (professionalLevel, index) => (
        <div key={professionalLevel.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {professionalLevel.name || 'Trình độ chuyên môn mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProfessionalLevel(professionalLevel.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã trình độ
                    </Label>
                    <Input
                        value={professionalLevel.code}
                        onChange={(e) => handleFieldChange(professionalLevel.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: TDCM-01, KTV, CN, KS..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ chuyên môn <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={professionalLevel.name}
                        onChange={(e) => handleFieldChange(professionalLevel.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kỹ thuật viên, Công nhân..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={professionalLevel.description}
                        onChange={(e) => handleFieldChange(professionalLevel.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ chuyên môn..."
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
                        <GraduationCap className="h-5 w-5" />
                        Thêm trình độ chuyên môn hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều trình độ chuyên môn và lưu một lần
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
                                onClick={handleAddProfessionalLevel}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm trình độ chuyên môn
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{professionalLevels.length}</b> trình độ chuyên môn
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {professionalLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có trình độ chuyên môn nào. Nhấn <b>Thêm trình độ chuyên môn</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã trình độ</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên trình độ chuyên môn *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {professionalLevels.map((professionalLevel, index) => (
                                            <>
                                                <TableRow key={professionalLevel.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(professionalLevel.tempId)}
                                                                title={expandedRows.has(professionalLevel.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(professionalLevel.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyProfessionalLevel(professionalLevel.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveProfessionalLevel(professionalLevel.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(professionalLevel.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderProfessionalLevelFieldsExpanded(professionalLevel, index)}
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
                                {professionalLevels.map((professionalLevel, index) => renderProfessionalLevelFieldsExpanded(professionalLevel, index))}
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
                                disabled={createMutation.isPending || professionalLevels.length === 0}
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