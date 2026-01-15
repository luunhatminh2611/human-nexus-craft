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

export default function BulkAddTrainingTypeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [trainingTypes, setTrainingTypes] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && trainingTypes.length === 0) {
            handleAddTrainingType();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.trainingType.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${trainingTypes.length} hình thức đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm hình thức đào tạo');
        },
    });

    const createNewTrainingType = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Hình thức đào tạo');

            const columns = [
                { header: 'Tên hình thức đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            trainingTypes.forEach(tt => {
                mainSheet.addRow({
                    name: tt.name,
                    description: tt.description,
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

            const fileName = trainingTypes.length > 0
                ? `Them_hinh_thuc_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_hinh_thuc_dao_tao.xlsx`;

            saveAs(blob, fileName);

            toast.success(trainingTypes.length > 0
                ? `Đã tải xuống file với ${trainingTypes.length} hình thức đào tạo`
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

            const worksheet = workbook.getWorksheet('Hình thức đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Hình thức đào tạo"');
            }

            const importedTrainingTypes: any[] = [];
            const existingNames = new Map(trainingTypes.map(tt => [tt.name, tt]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const trainingTypeData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedTrainingTypes.length,
                    name,
                    description: getCellValue(2),
                };

                importedTrainingTypes.push(trainingTypeData);
            });

            const updatedTrainingTypes = trainingTypes.map(tt => {
                const imported = importedTrainingTypes.find(imp => imp.name === tt.name);
                return imported || tt;
            });

            const newTrainingTypes = importedTrainingTypes.filter(
                imp => !existingNames.has(imp.name)
            );

            setTrainingTypes([...updatedTrainingTypes, ...newTrainingTypes]);
            setNextId(prev => prev + newTrainingTypes.length);

            toast.success(`Đã nhập ${importedTrainingTypes.length} hình thức đào tạo (${newTrainingTypes.length} mới, ${importedTrainingTypes.length - newTrainingTypes.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyTrainingType = (tempId: number) => {
        const trainingTypeToCopy = trainingTypes.find(tt => tt.tempId === tempId);
        if (trainingTypeToCopy) {
            const newTrainingType = {
                ...trainingTypeToCopy,
                tempId: nextId,
            };
            setTrainingTypes(prev => [...prev, newTrainingType]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép hình thức đào tạo');
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

    const handleAddTrainingType = () => {
        setTrainingTypes(prev => [...prev, createNewTrainingType()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveTrainingType = (tempId: number) => {
        setTrainingTypes(prev => prev.filter(tt => tt.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setTrainingTypes(prev =>
            prev.map(tt =>
                tt.tempId === tempId ? { ...tt, [field]: value } : tt
            )
        );
    };

    const handleSubmit = () => {
        if (trainingTypes.length === 0) {
            toast.error('Vui lòng thêm ít nhất một hình thức đào tạo');
            return;
        }

        const invalidTrainingTypes = trainingTypes.filter(tt => !tt.name);

        if (invalidTrainingTypes.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên hình thức đào tạo cho tất cả các dòng');
            return;
        }

        const payload = trainingTypes.map(tt => ({
            name: tt.name,
            description: tt.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setTrainingTypes([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (trainingType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={trainingType[field]}
                        onChange={(e) => handleFieldChange(trainingType.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên hình thức đào tạo"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={trainingType.description}
                        onChange={(e) => handleFieldChange(trainingType.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTrainingTypeFieldsExpanded = (trainingType, index) => (
        <div key={trainingType.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingType.name || 'Hình thức đào tạo mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingType(trainingType.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên hình thức đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingType.name}
                        onChange={(e) => handleFieldChange(trainingType.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Chính quy, Tại chức, Từ xa..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingType.description}
                        onChange={(e) => handleFieldChange(trainingType.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về hình thức đào tạo..."
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
                        Thêm hình thức đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều hình thức đào tạo và lưu một lần
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
                                onClick={handleAddTrainingType}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm hình thức đào tạo
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{trainingTypes.length}</b> hình thức đào tạo
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {trainingTypes.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có hình thức đào tạo nào. Nhấn <b>Thêm hình thức đào tạo</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên hình thức đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingTypes.map((trainingType, index) => (
                                            <>
                                                <TableRow key={trainingType.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingType.tempId)}
                                                                title={expandedRows.has(trainingType.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(trainingType.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyTrainingType(trainingType.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingType(trainingType.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingType, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingType, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingType.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderTrainingTypeFieldsExpanded(trainingType, index)}
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
                                {trainingTypes.map((trainingType, index) => renderTrainingTypeFieldsExpanded(trainingType, index))}
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
                                disabled={createMutation.isPending || trainingTypes.length === 0}
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