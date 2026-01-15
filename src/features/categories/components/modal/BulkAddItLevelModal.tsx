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
import { Loader2, X, Plus, Monitor, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddITLevelModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [itLevels, setItLevels] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && itLevels.length === 0) {
            handleAddITLevel();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.itLevel.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${itLevels.length} trình độ tin học thành công`);
            queryClient.invalidateQueries({ queryKey: ['itLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm trình độ tin học');
        },
    });

    const createNewITLevel = () => {
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
            const mainSheet = workbook.addWorksheet('Trình độ tin học');

            const columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ tin học *', key: 'name', width: 35 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            itLevels.forEach(itl => {
                mainSheet.addRow({
                    code: itl.code,
                    name: itl.name,
                    description: itl.description,
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

            const fileName = itLevels.length > 0
                ? `Them_trinh_do_tin_hoc_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_trinh_do_tin_hoc.xlsx`;

            saveAs(blob, fileName);

            toast.success(itLevels.length > 0
                ? `Đã tải xuống file với ${itLevels.length} trình độ tin học`
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

            const worksheet = workbook.getWorksheet('Trình độ tin học');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ tin học"');
            }

            const importedITLevels: any[] = [];
            const existingNames = new Map(itLevels.map(itl => [itl.name, itl]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const itLevelData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedITLevels.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedITLevels.push(itLevelData);
            });

            const updatedITLevels = itLevels.map(itl => {
                const imported = importedITLevels.find(imp => imp.name === itl.name);
                return imported || itl;
            });

            const newITLevels = importedITLevels.filter(
                imp => !existingNames.has(imp.name)
            );

            setItLevels([...updatedITLevels, ...newITLevels]);
            setNextId(prev => prev + newITLevels.length);

            toast.success(`Đã nhập ${importedITLevels.length} trình độ tin học (${newITLevels.length} mới, ${importedITLevels.length - newITLevels.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyITLevel = (tempId: number) => {
        const itLevelToCopy = itLevels.find(itl => itl.tempId === tempId);
        if (itLevelToCopy) {
            const newITLevel = {
                ...itLevelToCopy,
                tempId: nextId,
                code: '',
            };
            setItLevels(prev => [...prev, newITLevel]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép trình độ tin học');
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

    const handleAddITLevel = () => {
        setItLevels(prev => [...prev, createNewITLevel()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveITLevel = (tempId: number) => {
        setItLevels(prev => prev.filter(itl => itl.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setItLevels(prev =>
            prev.map(itl =>
                itl.tempId === tempId ? { ...itl, [field]: value } : itl
            )
        );
    };

    const handleSubmit = () => {
        if (itLevels.length === 0) {
            toast.error('Vui lòng thêm ít nhất một trình độ tin học');
            return;
        }

        const invalidITLevels = itLevels.filter(itl => !itl.name);

        if (invalidITLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ tin học cho tất cả các dòng');
            return;
        }

        const payload = itLevels.map(itl => ({
            code: itl.code || null,
            name: itl.name,
            description: itl.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setItLevels([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (itLevel, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={itLevel[field]}
                        onChange={(e) => handleFieldChange(itLevel.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ tin học'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={itLevel.description}
                        onChange={(e) => handleFieldChange(itLevel.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderITLevelFieldsExpanded = (itLevel, index) => (
        <div key={itLevel.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {itLevel.name || 'Trình độ tin học mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveITLevel(itLevel.tempId)}
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
                        value={itLevel.code}
                        onChange={(e) => handleFieldChange(itLevel.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: TDTH-01, CB, KH, NC..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ tin học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={itLevel.name}
                        onChange={(e) => handleFieldChange(itLevel.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Cơ bản, Khá, Giỏi..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={itLevel.description}
                        onChange={(e) => handleFieldChange(itLevel.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ tin học..."
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
                        <Monitor className="h-5 w-5" />
                        Thêm trình độ tin học hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều trình độ tin học và lưu một lần
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
                                onClick={handleAddITLevel}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm trình độ tin học
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{itLevels.length}</b> trình độ tin học
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {itLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có trình độ tin học nào. Nhấn <b>Thêm trình độ tin học</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ tin học *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {itLevels.map((itLevel, index) => (
                                            <>
                                                <TableRow key={itLevel.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(itLevel.tempId)}
                                                                title={expandedRows.has(itLevel.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(itLevel.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyITLevel(itLevel.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveITLevel(itLevel.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(itLevel.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderITLevelFieldsExpanded(itLevel, index)}
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
                                {itLevels.map((itLevel, index) => renderITLevelFieldsExpanded(itLevel, index))}
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
                                disabled={createMutation.isPending || itLevels.length === 0}
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