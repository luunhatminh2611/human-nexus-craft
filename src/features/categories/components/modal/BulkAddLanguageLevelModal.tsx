// File: BulkAddLanguageLevelModal.tsx
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
import { languageLevelApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Languages, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddLanguageLevelModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [languageLevels, setLanguageLevels] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && languageLevels.length === 0) {
            handleAddLanguageLevel();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => languageLevelApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${languageLevels.length} trình độ ngoại ngữ thành công`);
            queryClient.invalidateQueries({ queryKey: ['languageLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm trình độ ngoại ngữ');
        },
    });

    const createNewLanguageLevel = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Trình độ ngoại ngữ');

            const columns = [
                { header: 'Tên trình độ ngoại ngữ *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            languageLevels.forEach(level => {
                mainSheet.addRow({
                    name: level.name,
                    description: level.description,
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

            const fileName = languageLevels.length > 0
                ? `Them_trinh_do_ngoai_ngu_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_trinh_do_ngoai_ngu.xlsx`;

            saveAs(blob, fileName);

            toast.success(languageLevels.length > 0
                ? `Đã tải xuống file với ${languageLevels.length} trình độ ngoại ngữ`
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

            const worksheet = workbook.getWorksheet('Trình độ ngoại ngữ');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ ngoại ngữ"');
            }

            const importedLevels: any[] = [];
            const existingNames = new Map(languageLevels.map(l => [l.name, l]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const levelData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedLevels.length,
                    name,
                    description: getCellValue(2),
                };

                importedLevels.push(levelData);
            });

            const updatedLevels = languageLevels.map(l => {
                const imported = importedLevels.find(imp => imp.name === l.name);
                return imported || l;
            });

            const newLevels = importedLevels.filter(
                imp => !existingNames.has(imp.name)
            );

            setLanguageLevels([...updatedLevels, ...newLevels]);
            setNextId(prev => prev + newLevels.length);

            toast.success(`Đã nhập ${importedLevels.length} trình độ ngoại ngữ (${newLevels.length} mới, ${importedLevels.length - newLevels.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyLanguageLevel = (tempId: number) => {
        const levelToCopy = languageLevels.find(l => l.tempId === tempId);
        if (levelToCopy) {
            const newLevel = {
                ...levelToCopy,
                tempId: nextId,
            };
            setLanguageLevels(prev => [...prev, newLevel]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép trình độ ngoại ngữ');
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

    const handleAddLanguageLevel = () => {
        setLanguageLevels(prev => [...prev, createNewLanguageLevel()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveLanguageLevel = (tempId: number) => {
        setLanguageLevels(prev => prev.filter(l => l.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setLanguageLevels(prev =>
            prev.map(l =>
                l.tempId === tempId ? { ...l, [field]: value } : l
            )
        );
    };

    const handleSubmit = () => {
        if (languageLevels.length === 0) {
            toast.error('Vui lòng thêm ít nhất một trình độ ngoại ngữ');
            return;
        }

        const invalidLevels = languageLevels.filter(l => !l.name);

        if (invalidLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ ngoại ngữ cho tất cả các dòng');
            return;
        }

        const payload = languageLevels.map(l => ({
            name: l.name,
            description: l.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setLanguageLevels([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (level, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={level[field]}
                        onChange={(e) => handleFieldChange(level.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên trình độ ngoại ngữ"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={level.description}
                        onChange={(e) => handleFieldChange(level.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderLevelFieldsExpanded = (level, index) => (
        <div key={level.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {level.name || 'Trình độ ngoại ngữ mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLanguageLevel(level.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ ngoại ngữ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={level.name}
                        onChange={(e) => handleFieldChange(level.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: A1, A2, B1, B2, C1, IELTS 6.0..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={level.description}
                        onChange={(e) => handleFieldChange(level.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ ngoại ngữ..."
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
                        <Languages className="h-5 w-5" />
                        Thêm trình độ ngoại ngữ hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều trình độ ngoại ngữ và lưu một lần
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
                                onClick={handleAddLanguageLevel}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm trình độ ngoại ngữ
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{languageLevels.length}</b> trình độ ngoại ngữ
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {languageLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có trình độ ngoại ngữ nào. Nhấn <b>Thêm trình độ ngoại ngữ</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ ngoại ngữ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {languageLevels.map((level, index) => (
                                            <>
                                                <TableRow key={level.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(level.tempId)}
                                                                title={expandedRows.has(level.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(level.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyLanguageLevel(level.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveLanguageLevel(level.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(level, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(level, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(level.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderLevelFieldsExpanded(level, index)}
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
                                {languageLevels.map((level, index) => renderLevelFieldsExpanded(level, index))}
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
                                disabled={createMutation.isPending || languageLevels.length === 0}
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