// File: BulkAddPoliticalTheoryModal.tsx
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
import { politicalTheoryApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, BookMarked, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddPoliticalTheoryModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [politicalTheories, setPoliticalTheories] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && politicalTheories.length === 0) {
            handleAddPoliticalTheory();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => politicalTheoryApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${politicalTheories.length} lý luận chính trị thành công`);
            queryClient.invalidateQueries({ queryKey: ['politicalTheories'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm lý luận chính trị');
        },
    });

    const createNewPoliticalTheory = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Lý luận chính trị');

            const columns = [
                { header: 'Tên lý luận chính trị *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            politicalTheories.forEach(theory => {
                mainSheet.addRow({
                    name: theory.name,
                    description: theory.description,
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

            const fileName = politicalTheories.length > 0
                ? `Them_ly_luan_chinh_tri_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_ly_luan_chinh_tri.xlsx`;

            saveAs(blob, fileName);

            toast.success(politicalTheories.length > 0
                ? `Đã tải xuống file với ${politicalTheories.length} lý luận chính trị`
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

            const worksheet = workbook.getWorksheet('Lý luận chính trị');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Lý luận chính trị"');
            }

            const importedTheories: any[] = [];
            const existingNames = new Map(politicalTheories.map(t => [t.name, t]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const theoryData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedTheories.length,
                    name,
                    description: getCellValue(2),
                };

                importedTheories.push(theoryData);
            });

            const updatedTheories = politicalTheories.map(t => {
                const imported = importedTheories.find(imp => imp.name === t.name);
                return imported || t;
            });

            const newTheories = importedTheories.filter(
                imp => !existingNames.has(imp.name)
            );

            setPoliticalTheories([...updatedTheories, ...newTheories]);
            setNextId(prev => prev + newTheories.length);

            toast.success(`Đã nhập ${importedTheories.length} lý luận chính trị (${newTheories.length} mới, ${importedTheories.length - newTheories.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyPoliticalTheory = (tempId: number) => {
        const theoryToCopy = politicalTheories.find(t => t.tempId === tempId);
        if (theoryToCopy) {
            const newTheory = {
                ...theoryToCopy,
                tempId: nextId,
            };
            setPoliticalTheories(prev => [...prev, newTheory]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép lý luận chính trị');
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

    const handleAddPoliticalTheory = () => {
        setPoliticalTheories(prev => [...prev, createNewPoliticalTheory()]);
        setNextId(prev => prev + 1);
    };

    const handleRemovePoliticalTheory = (tempId: number) => {
        setPoliticalTheories(prev => prev.filter(t => t.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setPoliticalTheories(prev =>
            prev.map(t =>
                t.tempId === tempId ? { ...t, [field]: value } : t
            )
        );
    };

    const handleSubmit = () => {
        if (politicalTheories.length === 0) {
            toast.error('Vui lòng thêm ít nhất một lý luận chính trị');
            return;
        }

        const invalidTheories = politicalTheories.filter(t => !t.name);

        if (invalidTheories.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên lý luận chính trị cho tất cả các dòng');
            return;
        }

        const payload = politicalTheories.map(t => ({
            name: t.name,
            description: t.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setPoliticalTheories([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (theory, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={theory[field]}
                        onChange={(e) => handleFieldChange(theory.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên lý luận chính trị"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={theory.description}
                        onChange={(e) => handleFieldChange(theory.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTheoryFieldsExpanded = (theory, index) => (
        <div key={theory.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {theory.name || 'Lý luận chính trị mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePoliticalTheory(theory.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên lý luận chính trị <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={theory.name}
                        onChange={(e) => handleFieldChange(theory.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Sơ cấp lý luận chính trị, Trung cấp..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={theory.description}
                        onChange={(e) => handleFieldChange(theory.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về lý luận chính trị..."
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
                        <BookMarked className="h-5 w-5" />
                        Thêm lý luận chính trị hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều lý luận chính trị và lưu một lần
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
                                onClick={handleAddPoliticalTheory}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm lý luận chính trị
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{politicalTheories.length}</b> lý luận chính trị
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {politicalTheories.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có lý luận chính trị nào. Nhấn <b>Thêm lý luận chính trị</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên lý luận chính trị *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {politicalTheories.map((theory, index) => (
                                            <>
                                                <TableRow key={theory.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(theory.tempId)}
                                                                title={expandedRows.has(theory.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(theory.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyPoliticalTheory(theory.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePoliticalTheory(theory.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(theory, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(theory, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(theory.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderTheoryFieldsExpanded(theory, index)}
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
                                {politicalTheories.map((theory, index) => renderTheoryFieldsExpanded(theory, index))}
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
                                disabled={createMutation.isPending || politicalTheories.length === 0}
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