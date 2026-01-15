import React, { useEffect, useRef, useState } from 'react';
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
import { degreeApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, GraduationCap, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddDegreeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [degrees, setDegrees] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && degrees.length === 0) {
            handleAddDegree();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => degreeApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${degrees.length} bậc học thành công`);
            queryClient.invalidateQueries({ queryKey: ['degrees'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm bậc học');
        },
    });

    const createNewDegree = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Bac_hoc');

            const columns = [
                { header: 'Tên bậc học *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            degrees.forEach(degree => {
                mainSheet.addRow({
                    name: degree.name,
                    description: degree.description,
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

            const fileName = degrees.length > 0
                ? `Them_bac_hoc_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_bac_hoc.xlsx`;

            saveAs(blob, fileName);

            toast.success(degrees.length > 0
                ? `Đã tải xuống file với ${degrees.length} bậc học`
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

            const worksheet = workbook.getWorksheet('Bac_hoc');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Bac_hoc"');
            }

            const importedDegrees: any[] = [];
            const existingNames = new Map(degrees.map(degree => [degree.name, degree]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const degreeData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedDegrees.length,
                    name,
                    description: getCellValue(2),
                };

                importedDegrees.push(degreeData);
            });

            const updatedDegrees = degrees.map(degree => {
                const imported = importedDegrees.find(imp => imp.name === degree.name);
                return imported || degree;
            });

            const newDegrees = importedDegrees.filter(
                imp => !existingNames.has(imp.name)
            );

            setDegrees([...updatedDegrees, ...newDegrees]);
            setNextId(prev => prev + newDegrees.length);

            toast.success(`Đã nhập ${importedDegrees.length} bậc học (${newDegrees.length} mới, ${importedDegrees.length - newDegrees.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyDegree = (tempId: number) => {
        const degreeToCopy = degrees.find(degree => degree.tempId === tempId);
        if (degreeToCopy) {
            const newDegree = {
                ...degreeToCopy,
                tempId: nextId,
            };
            setDegrees(prev => [...prev, newDegree]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép bậc học');
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

    const handleAddDegree = () => {
        setDegrees(prev => [...prev, createNewDegree()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveDegree = (tempId: number) => {
        setDegrees(prev => prev.filter(degree => degree.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setDegrees(prev =>
            prev.map(degree =>
                degree.tempId === tempId ? { ...degree, [field]: value } : degree
            )
        );
    };

    const handleSubmit = () => {
        if (degrees.length === 0) {
            toast.error('Vui lòng thêm ít nhất một bậc học');
            return;
        }

        const invalidDegrees = degrees.filter(degree => !degree.name);

        if (invalidDegrees.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên bậc học cho tất cả các dòng');
            return;
        }

        const payload = degrees.map(degree => ({
            name: degree.name,
            description: degree.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setDegrees([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (degree, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={degree[field]}
                        onChange={(e) => handleFieldChange(degree.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên bậc học"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={degree.description}
                        onChange={(e) => handleFieldChange(degree.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderDegreeFieldsExpanded = (degree, index) => (
        <div key={degree.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {degree.name || 'Bậc học mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDegree(degree.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên bậc học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={degree.name}
                        onChange={(e) => handleFieldChange(degree.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Đại học, Thạc sĩ, Tiến sĩ..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={degree.description}
                        onChange={(e) => handleFieldChange(degree.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về bậc học..."
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
                        Thêm bậc học hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều bậc học và lưu một lần
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
                                onClick={handleAddDegree}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm bậc học
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{degrees.length}</b> bậc học
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {degrees.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có bậc học nào. Nhấn <b>Thêm bậc học</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên bậc học *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {degrees.map((degree, index) => (
                                            <React.Fragment key={degree.tempId}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(degree.tempId)}
                                                                title={expandedRows.has(degree.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(degree.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyDegree(degree.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDegree(degree.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(degree, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(degree, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(degree.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderDegreeFieldsExpanded(degree, index)}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {degrees.map((degree, index) => renderDegreeFieldsExpanded(degree, index))}
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
                                disabled={createMutation.isPending || degrees.length === 0}
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