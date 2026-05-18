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
import { toast } from 'sonner';
import { Loader2, X, Plus, GraduationCap, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { trainingLevelApi, TrainingLevel } from '../../api/trainingLevel';

export default function BulkAddTrainingLevelModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [trainingLevels, setTrainingLevels] = useState<TrainingLevel[]>([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && trainingLevels.length === 0) {
            handleAddTrainingLevel();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: TrainingLevel[]) => {
            return trainingLevelApi.createBulk(payload);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${trainingLevels.length} trình độ đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm trình độ đào tạo');
        },
    });

    const createNewTrainingLevel = () => {
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
            const mainSheet = workbook.addWorksheet('Trình độ đào tạo');

            mainSheet.columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            trainingLevels.forEach(tl => {
                mainSheet.addRow({
                    code: tl.code,
                    name: tl.name,
                    description: tl.description,
                });
            });

            mainSheet.getRow(1).font = { bold: true };
            mainSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' },
            };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const fileName = trainingLevels.length > 0
                ? `Them_trinh_do_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_trinh_do_dao_tao.xlsx`;

            saveAs(blob, fileName);

            toast.success(trainingLevels.length > 0
                ? `Đã tải xuống file với ${trainingLevels.length} trình độ đào tạo`
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

            const worksheet = workbook.getWorksheet('Trình độ đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ đào tạo"');
            }

            const importedLevels: any[] = [];
            const existingNames = new Map(trainingLevels.map(tl => [tl.name, tl]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedLevels.push({
                    tempId: existingNames.has(name)
                        ? existingNames.get(name)!.tempId
                        : nextId + importedLevels.length,
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            const updatedLevels = trainingLevels.map(tl => {
                const imported = importedLevels.find(imp => imp.name === tl.name);
                return imported || tl;
            });

            const newLevels = importedLevels.filter(imp => !existingNames.has(imp.name));

            setTrainingLevels([...updatedLevels, ...newLevels]);
            setNextId(prev => prev + newLevels.length);

            toast.success(
                `Đã nhập ${importedLevels.length} trình độ đào tạo (${newLevels.length} mới, ${importedLevels.length - newLevels.length} cập nhật)`
            );
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyTrainingLevel = (tempId: number) => {
        const toCopy = trainingLevels.find(tl => tl.tempId === tempId);
        if (toCopy) {
            setTrainingLevels(prev => [...prev, { ...toCopy, tempId: nextId }]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép trình độ đào tạo');
        }
    };

    const toggleRowExpansion = (tempId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.has(tempId) ? newSet.delete(tempId) : newSet.add(tempId);
            return newSet;
        });
    };

    const handleAddTrainingLevel = () => {
        setTrainingLevels(prev => [...prev, createNewTrainingLevel()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveTrainingLevel = (tempId: number) => {
        setTrainingLevels(prev => prev.filter(tl => tl.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setTrainingLevels(prev =>
            prev.map(tl => tl.tempId === tempId ? { ...tl, [field]: value } : tl)
        );
    };

    const handleSubmit = () => {
        if (trainingLevels.length === 0) {
            toast.error('Vui lòng thêm ít nhất một trình độ đào tạo');
            return;
        }

        const invalid = trainingLevels.filter(tl => !tl.name);
        if (invalid.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ đào tạo cho tất cả các dòng');
            return;
        }

        const payload = trainingLevels.map(tl => ({
            code: tl.code || '',
            name: tl.name,
            description: tl.description || '',
        }));
        console.log('Payload to submit:', payload);
        // đợi em vũ
        // createMutation.mutate(payload);
    };

    const handleClose = () => {
        setTrainingLevels([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (trainingLevel: any, field: string) => {
        const commonInputClass = 'h-8 text-sm w-full min-w-[150px]';

        if (field === 'code' || field === 'name') {
            return (
                <Input
                    value={trainingLevel[field] || ''}
                    onChange={(e) => handleFieldChange(trainingLevel.tempId, field, e.target.value)}
                    className={commonInputClass}
                    placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ đào tạo'}
                />
            );
        }

        if (field === 'description') {
            return (
                <Textarea
                    value={trainingLevel.description || ''}
                    onChange={(e) => handleFieldChange(trainingLevel.tempId, 'description', e.target.value)}
                    className="text-sm min-w-[200px]"
                    rows={2}
                    placeholder="Mô tả..."
                />
            );
        }

        return null;
    };

    const renderExpandedFields = (trainingLevel: any, index: number) => (
        <div key={trainingLevel.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingLevel.name || 'Trình độ đào tạo mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingLevel(trainingLevel.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã trình độ</Label>
                    <Input
                        value={trainingLevel.code || ''}
                        onChange={(e) => handleFieldChange(trainingLevel.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: DH, CD, TC, SD..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingLevel.name || ''}
                        onChange={(e) => handleFieldChange(trainingLevel.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Đại học, Cao đẳng, Trung cấp..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingLevel.description || ''}
                        onChange={(e) => handleFieldChange(trainingLevel.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ đào tạo..."
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
                        Thêm trình độ đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều trình độ đào tạo và lưu một lần
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
                            <Button size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4" />
                                Tải lên
                            </Button>
                            <Button size="sm" className="gap-2" onClick={handleExportExcel}>
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
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleAddTrainingLevel}>
                                <Plus className="h-4 w-4" />
                                Thêm trình độ đào tạo
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{trainingLevels.length}</b> trình độ đào tạo
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {trainingLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có trình độ đào tạo nào. Nhấn <b>Thêm trình độ đào tạo</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingLevels.map((trainingLevel, index) => (
                                            <>
                                                <TableRow key={trainingLevel.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingLevel.tempId)}
                                                                title={expandedRows.has(trainingLevel.tempId) ? 'Thu gọn' : 'Mở rộng'}
                                                            >
                                                                {expandedRows.has(trainingLevel.tempId)
                                                                    ? <ChevronUp className="h-4 w-4" />
                                                                    : <ChevronDown className="h-4 w-4" />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyTrainingLevel(trainingLevel.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingLevel(trainingLevel.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingLevel.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderExpandedFields(trainingLevel, index)}
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
                                {trainingLevels.map((tl, index) => renderExpandedFields(tl, index))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || trainingLevels.length === 0}
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