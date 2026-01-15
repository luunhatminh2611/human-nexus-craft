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

export default function BulkAddTrainingMajorModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [trainingMajors, setTrainingMajors] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && trainingMajors.length === 0) {
            handleAddTrainingMajor();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.trainingMajor.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${trainingMajors.length} ngành đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingMajors'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm ngành đào tạo');
        },
    });

    const createNewTrainingMajor = () => {
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
            const mainSheet = workbook.addWorksheet('Ngành đào tạo');

            const columns = [
                { header: 'Mã ngành', key: 'code', width: 20 },
                { header: 'Tên ngành đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            trainingMajors.forEach(tm => {
                mainSheet.addRow({
                    code: tm.code,
                    name: tm.name,
                    description: tm.description,
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

            const fileName = trainingMajors.length > 0
                ? `Them_nganh_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_nganh_dao_tao.xlsx`;

            saveAs(blob, fileName);

            toast.success(trainingMajors.length > 0
                ? `Đã tải xuống file với ${trainingMajors.length} ngành đào tạo`
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

            const worksheet = workbook.getWorksheet('Ngành đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Ngành đào tạo"');
            }

            const importedTrainingMajors: any[] = [];
            const existingNames = new Map(trainingMajors.map(tm => [tm.name, tm]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const trainingMajorData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedTrainingMajors.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedTrainingMajors.push(trainingMajorData);
            });

            const updatedTrainingMajors = trainingMajors.map(tm => {
                const imported = importedTrainingMajors.find(imp => imp.name === tm.name);
                return imported || tm;
            });

            const newTrainingMajors = importedTrainingMajors.filter(
                imp => !existingNames.has(imp.name)
            );

            setTrainingMajors([...updatedTrainingMajors, ...newTrainingMajors]);
            setNextId(prev => prev + newTrainingMajors.length);

            toast.success(`Đã nhập ${importedTrainingMajors.length} ngành đào tạo (${newTrainingMajors.length} mới, ${importedTrainingMajors.length - newTrainingMajors.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyTrainingMajor = (tempId: number) => {
        const trainingMajorToCopy = trainingMajors.find(tm => tm.tempId === tempId);
        if (trainingMajorToCopy) {
            const newTrainingMajor = {
                ...trainingMajorToCopy,
                tempId: nextId,
                code: '',
            };
            setTrainingMajors(prev => [...prev, newTrainingMajor]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép ngành đào tạo');
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

    const handleAddTrainingMajor = () => {
        setTrainingMajors(prev => [...prev, createNewTrainingMajor()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveTrainingMajor = (tempId: number) => {
        setTrainingMajors(prev => prev.filter(tm => tm.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setTrainingMajors(prev =>
            prev.map(tm =>
                tm.tempId === tempId ? { ...tm, [field]: value } : tm
            )
        );
    };

    const handleSubmit = () => {
        if (trainingMajors.length === 0) {
            toast.error('Vui lòng thêm ít nhất một ngành đào tạo');
            return;
        }

        const invalidTrainingMajors = trainingMajors.filter(tm => !tm.name);

        if (invalidTrainingMajors.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên ngành đào tạo cho tất cả các dòng');
            return;
        }

        const payload = trainingMajors.map(tm => ({
            code: tm.code || null,
            name: tm.name,
            description: tm.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setTrainingMajors([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (trainingMajor, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={trainingMajor[field]}
                        onChange={(e) => handleFieldChange(trainingMajor.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã ngành' : 'Tên ngành đào tạo'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={trainingMajor.description}
                        onChange={(e) => handleFieldChange(trainingMajor.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTrainingMajorFieldsExpanded = (trainingMajor, index) => (
        <div key={trainingMajor.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingMajor.name || 'Ngành đào tạo mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingMajor(trainingMajor.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã ngành
                    </Label>
                    <Input
                        value={trainingMajor.code}
                        onChange={(e) => handleFieldChange(trainingMajor.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: CNTT, KTXD, QTKD..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên ngành đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingMajor.name}
                        onChange={(e) => handleFieldChange(trainingMajor.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Công nghệ thông tin, Kế toán..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingMajor.description}
                        onChange={(e) => handleFieldChange(trainingMajor.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về ngành đào tạo..."
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
                        Thêm ngành đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều ngành đào tạo và lưu một lần
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
                                onClick={handleAddTrainingMajor}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm ngành đào tạo
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{trainingMajors.length}</b> ngành đào tạo
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {trainingMajors.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có ngành đào tạo nào. Nhấn <b>Thêm ngành đào tạo</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã ngành</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên ngành đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainingMajors.map((trainingMajor, index) => (
                                            <>
                                                <TableRow key={trainingMajor.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingMajor.tempId)}
                                                                title={expandedRows.has(trainingMajor.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(trainingMajor.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyTrainingMajor(trainingMajor.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingMajor(trainingMajor.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingMajor.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderTrainingMajorFieldsExpanded(trainingMajor, index)}
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
                                {trainingMajors.map((trainingMajor, index) => renderTrainingMajorFieldsExpanded(trainingMajor, index))}
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
                                disabled={createMutation.isPending || trainingMajors.length === 0}
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