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
import { ethnicityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Users, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddEthnicityModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [ethnicities, setEthnicities] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && ethnicities.length === 0) {
            handleAddEthnicity();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => ethnicityApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${ethnicities.length} dân tộc thành công`);
            queryClient.invalidateQueries({ queryKey: ['ethnicities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm dân tộc');
        },
    });

    const createNewEthnicity = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Dân tộc');

            const columns = [
                { header: 'Tên dân tộc *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            ethnicities.forEach(eth => {
                mainSheet.addRow({
                    name: eth.name,
                    description: eth.description,
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

            const fileName = ethnicities.length > 0
                ? `Them_dan_toc_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_dan_toc.xlsx`;

            saveAs(blob, fileName);

            toast.success(ethnicities.length > 0
                ? `Đã tải xuống file với ${ethnicities.length} dân tộc`
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

            const worksheet = workbook.getWorksheet('Dân tộc');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Dân tộc"');
            }

            const importedEthnicities: any[] = [];
            const existingNames = new Map(ethnicities.map(eth => [eth.name, eth]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const ethnicityData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedEthnicities.length,
                    name,
                    description: getCellValue(2),
                };

                importedEthnicities.push(ethnicityData);
            });

            const updatedEthnicities = ethnicities.map(eth => {
                const imported = importedEthnicities.find(imp => imp.name === eth.name);
                return imported || eth;
            });

            const newEthnicities = importedEthnicities.filter(
                imp => !existingNames.has(imp.name)
            );

            setEthnicities([...updatedEthnicities, ...newEthnicities]);
            setNextId(prev => prev + newEthnicities.length);

            toast.success(`Đã nhập ${importedEthnicities.length} dân tộc (${newEthnicities.length} mới, ${importedEthnicities.length - newEthnicities.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyEthnicity = (tempId: number) => {
        const ethnicityToCopy = ethnicities.find(eth => eth.tempId === tempId);
        if (ethnicityToCopy) {
            const newEthnicity = {
                ...ethnicityToCopy,
                tempId: nextId,
                name: '',
            };
            setEthnicities(prev => [...prev, newEthnicity]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép dân tộc');
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

    const handleAddEthnicity = () => {
        setEthnicities(prev => [...prev, createNewEthnicity()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveEthnicity = (tempId: number) => {
        setEthnicities(prev => prev.filter(eth => eth.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setEthnicities(prev =>
            prev.map(eth =>
                eth.tempId === tempId ? { ...eth, [field]: value } : eth
            )
        );
    };

    const handleSubmit = () => {
        if (ethnicities.length === 0) {
            toast.error('Vui lòng thêm ít nhất một dân tộc');
            return;
        }

        const invalidEthnicities = ethnicities.filter(eth => !eth.name);

        if (invalidEthnicities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên dân tộc cho tất cả các dòng');
            return;
        }

        const payload = ethnicities.map(eth => ({
            name: eth.name,
            description: eth.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setEthnicities([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (ethnicity, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={ethnicity[field]}
                        onChange={(e) => handleFieldChange(ethnicity.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên dân tộc"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={ethnicity.description}
                        onChange={(e) => handleFieldChange(ethnicity.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderEthnicityFieldsExpanded = (ethnicity, index) => (
        <div key={ethnicity.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {ethnicity.name || 'Dân tộc mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEthnicity(ethnicity.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên dân tộc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={ethnicity.name}
                        onChange={(e) => handleFieldChange(ethnicity.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kinh, Tày, Thái..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={ethnicity.description}
                        onChange={(e) => handleFieldChange(ethnicity.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về dân tộc..."
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
                        <Users className="h-5 w-5" />
                        Thêm dân tộc hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều dân tộc và lưu một lần
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
                                onClick={handleAddEthnicity}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm dân tộc
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{ethnicities.length}</b> dân tộc
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {ethnicities.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có dân tộc nào. Nhấn <b>Thêm dân tộc</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên dân tộc *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ethnicities.map((ethnicity, index) => (
                                            <>
                                                <TableRow key={ethnicity.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(ethnicity.tempId)}
                                                                title={expandedRows.has(ethnicity.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(ethnicity.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyEthnicity(ethnicity.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveEthnicity(ethnicity.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(ethnicity, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(ethnicity, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(ethnicity.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderEthnicityFieldsExpanded(ethnicity, index)}
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
                                {ethnicities.map((ethnicity, index) => renderEthnicityFieldsExpanded(ethnicity, index))}
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
                                disabled={createMutation.isPending || ethnicities.length === 0}
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