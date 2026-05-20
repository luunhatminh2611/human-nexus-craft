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
import { Loader2, X, Plus, BookOpen, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { trainingSystemApi, TrainingSystem } from '../../api/trainingSystem';

export default function BulkAddTrainingSystemModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [trainingSystems, setTrainingSystems] = useState<TrainingSystem[]>([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && trainingSystems.length === 0) {
            handleAddTrainingSystem();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: TrainingSystem[]) => {
            return trainingSystemApi.createBulk(payload);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${trainingSystems.length} hệ đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingSystems'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm hệ đào tạo');
        },
    });

    const createNewTrainingSystem = () => {
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
            const mainSheet = workbook.addWorksheet('Hệ đào tạo');

            mainSheet.columns = [
                { header: 'Mã hệ đào tạo', key: 'code', width: 20 },
                { header: 'Tên hệ đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            trainingSystems.forEach(ts => {
                mainSheet.addRow({
                    code: ts.code,
                    name: ts.name,
                    description: ts.description,
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

            const fileName = trainingSystems.length > 0
                ? `Them_he_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_he_dao_tao.xlsx`;

            saveAs(blob, fileName);

            toast.success(trainingSystems.length > 0
                ? `Đã tải xuống file với ${trainingSystems.length} hệ đào tạo`
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

            const worksheet = workbook.getWorksheet('Hệ đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Hệ đào tạo"');
            }

            const importedSystems: any[] = [];
            const existingNames = new Map(trainingSystems.map(ts => [ts.name, ts]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedSystems.push({
                    tempId: existingNames.has(name)
                        ? existingNames.get(name)!.tempId
                        : nextId + importedSystems.length,
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            const updatedSystems = trainingSystems.map(ts => {
                const imported = importedSystems.find(imp => imp.name === ts.name);
                return imported || ts;
            });

            const newSystems = importedSystems.filter(imp => !existingNames.has(imp.name));

            setTrainingSystems([...updatedSystems, ...newSystems]);
            setNextId(prev => prev + newSystems.length);

            toast.success(
                `Đã nhập ${importedSystems.length} hệ đào tạo (${newSystems.length} mới, ${importedSystems.length - newSystems.length} cập nhật)`
            );
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyTrainingSystem = (tempId: number) => {
        const toCopy = trainingSystems.find(ts => ts.tempId === tempId);
        if (toCopy) {
            setTrainingSystems(prev => [...prev, { ...toCopy, tempId: nextId}]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép hệ đào tạo');
        }
    };

    const toggleRowExpansion = (tempId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.has(tempId) ? newSet.delete(tempId) : newSet.add(tempId);
            return newSet;
        });
    };

    const handleAddTrainingSystem = () => {
        setTrainingSystems(prev => [...prev, createNewTrainingSystem()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveTrainingSystem = (tempId: number) => {
        setTrainingSystems(prev => prev.filter(ts => ts.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setTrainingSystems(prev =>
            prev.map(ts => ts.tempId === tempId ? { ...ts, [field]: value } : ts)
        );
    };

    const handleSubmit = () => {
        if (trainingSystems.length === 0) {
            toast.error('Vui lòng thêm ít nhất một hệ đào tạo');
            return;
        }

        const invalid = trainingSystems.filter(ts => !ts.name);
        if (invalid.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên hệ đào tạo cho tất cả các dòng');
            return;
        }

        const payload = trainingSystems.map(ts => ({
            code: ts.code || '',
            name: ts.name,
            description: ts.description || '',
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setTrainingSystems([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (trainingSystem, field: string) => {
        const commonInputClass = 'h-8 text-sm w-full min-w-[150px]';

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={trainingSystem[field]}
                        onChange={(e) => handleFieldChange(trainingSystem.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã hệ đào tạo' : 'Tên hệ đào tạo'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={trainingSystem.description}
                        onChange={(e) => handleFieldChange(trainingSystem.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderExpandedFields = (trainingSystem, index) => (
        <div key={trainingSystem.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingSystem.name || 'Hệ đào tạo mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingSystem(trainingSystem.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã hệ đào tạo</Label>
                    <Input
                        value={trainingSystem.code}
                        onChange={(e) => handleFieldChange(trainingSystem.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: CQ, TC, LT, VB2..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên hệ đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingSystem.name}
                        onChange={(e) => handleFieldChange(trainingSystem.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Chính quy, Tại chức, Liên thông..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingSystem.description}
                        onChange={(e) => handleFieldChange(trainingSystem.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về hệ đào tạo..."
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
                        <BookOpen className="h-5 w-5" />
                        Thêm hệ đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều hệ đào tạo và lưu một lần
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
                            <Button variant="outline" size="sm" className="gap-2" onClick={handleAddTrainingSystem}>
                                <Plus className="h-4 w-4" />
                                Thêm hệ đào tạo
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{trainingSystems.length}</b> hệ đào tạo
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {trainingSystems.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có hệ đào tạo nào. Nhấn <b>Thêm hệ đào tạo</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã hệ đào tạo</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên hệ đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingSystems.map((trainingSystem, index) => (
                                            <>
                                                <TableRow key={trainingSystem.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingSystem.tempId)}
                                                                title={expandedRows.has(trainingSystem.tempId) ? 'Thu gọn' : 'Mở rộng'}
                                                            >
                                                                {expandedRows.has(trainingSystem.tempId)
                                                                    ? <ChevronUp className="h-4 w-4" />
                                                                    : <ChevronDown className="h-4 w-4" />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyTrainingSystem(trainingSystem.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingSystem(trainingSystem.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingSystem, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingSystem, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingSystem, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingSystem.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderExpandedFields(trainingSystem, index)}
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
                                {trainingSystems.map((ts, index) => renderExpandedFields(ts, index))}
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
                                disabled={createMutation.isPending || trainingSystems.length === 0}
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