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
import { ppeItemApi } from '@/features/safety/api/ppeItemApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Shield, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddPPEItemModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [ppeItems, setPpeItems] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && ppeItems.length === 0) {
            handleAddPPEItem();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API create từng item một vì chưa có API bulk
            const promises = payload.map(item => ppeItemApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${ppeItems.length} đồ bảo hộ thành công`);
            queryClient.invalidateQueries({ queryKey: ['ppeItems'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm đồ bảo hộ');
        },
    });

    const createNewPPEItem = () => {
        return {
            tempId: nextId,
            name: '',
            description: '',
            size: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Đồ bảo hộ');

            const columns = [
                { header: 'Tên đồ bảo hộ *', key: 'name', width: 30 },
                { header: 'Kích cỡ', key: 'size', width: 15 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            ppeItems.forEach(item => {
                mainSheet.addRow({
                    name: item.name,
                    size: item.size,
                    description: item.description,
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

            const fileName = ppeItems.length > 0
                ? `Them_do_bao_ho_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_do_bao_ho.xlsx`;

            saveAs(blob, fileName);

            toast.success(ppeItems.length > 0
                ? `Đã tải xuống file với ${ppeItems.length} đồ bảo hộ`
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

            const worksheet = workbook.getWorksheet('Đồ bảo hộ');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Đồ bảo hộ"');
            }

            const importedPPEItems: any[] = [];
            const existingNames = new Map(ppeItems.map(item => [item.name, item]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                const ppeItemData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedPPEItems.length,
                    name,
                    size: getCellValue(2),
                    description: getCellValue(3),
                };

                importedPPEItems.push(ppeItemData);
            });

            const updatedPPEItems = ppeItems.map(item => {
                const imported = importedPPEItems.find(imp => imp.name === item.name);
                return imported || item;
            });

            const newPPEItems = importedPPEItems.filter(
                imp => !existingNames.has(imp.name)
            );

            setPpeItems([...updatedPPEItems, ...newPPEItems]);
            setNextId(prev => prev + newPPEItems.length);

            toast.success(`Đã nhập ${importedPPEItems.length} đồ bảo hộ (${newPPEItems.length} mới, ${importedPPEItems.length - newPPEItems.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyPPEItem = (tempId: number) => {
        const ppeItemToCopy = ppeItems.find(item => item.tempId === tempId);
        if (ppeItemToCopy) {
            const newPPEItem = {
                ...ppeItemToCopy,
                tempId: nextId,
                name: '',
            };
            setPpeItems(prev => [...prev, newPPEItem]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép đồ bảo hộ');
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

    const handleAddPPEItem = () => {
        setPpeItems(prev => [...prev, createNewPPEItem()]);
        setNextId(prev => prev + 1);
    };

    const handleRemovePPEItem = (tempId: number) => {
        setPpeItems(prev => prev.filter(item => item.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setPpeItems(prev =>
            prev.map(item =>
                item.tempId === tempId ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = () => {
        if (ppeItems.length === 0) {
            toast.error('Vui lòng thêm ít nhất một đồ bảo hộ');
            return;
        }

        const invalidPPEItems = ppeItems.filter(item => !item.name);

        if (invalidPPEItems.length > 0) {
            toast.error('Vui lòng điền tên đồ bảo hộ cho tất cả các dòng');
            return;
        }

        const payload = ppeItems.map(item => ({
            name: item.name,
            size: item.size || null,
            description: item.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setPpeItems([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (ppeItem, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
            case 'size':
                return (
                    <Input
                        value={ppeItem[field]}
                        onChange={(e) => handleFieldChange(ppeItem.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'name' ? 'Tên đồ bảo hộ' : 'Kích cỡ'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={ppeItem.description}
                        onChange={(e) => handleFieldChange(ppeItem.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderPPEItemFieldsExpanded = (ppeItem, index) => (
        <div key={ppeItem.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {ppeItem.name || 'Đồ bảo hộ mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePPEItem(ppeItem.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên đồ bảo hộ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={ppeItem.name}
                        onChange={(e) => handleFieldChange(ppeItem.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Mũ bảo hiểm, Găng tay..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Kích cỡ</Label>
                    <Input
                        value={ppeItem.size}
                        onChange={(e) => handleFieldChange(ppeItem.tempId, 'size', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: M, L, XL, Free size..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={ppeItem.description}
                        onChange={(e) => handleFieldChange(ppeItem.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về đồ bảo hộ..."
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
                        <Shield className="h-5 w-5" />
                        Thêm đồ bảo hộ lao động hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều đồ bảo hộ và lưu một lần
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
                                onClick={handleAddPPEItem}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm đồ bảo hộ
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{ppeItems.length}</b> đồ bảo hộ
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {ppeItems.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có đồ bảo hộ nào. Nhấn <b>Thêm đồ bảo hộ</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên đồ bảo hộ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Kích cỡ</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ppeItems.map((ppeItem, index) => (
                                            <>
                                                <TableRow key={ppeItem.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(ppeItem.tempId)}
                                                                title={expandedRows.has(ppeItem.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(ppeItem.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyPPEItem(ppeItem.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePPEItem(ppeItem.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(ppeItem, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(ppeItem, 'size')}</TableCell>
                                                    <TableCell>{renderTableCell(ppeItem, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(ppeItem.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderPPEItemFieldsExpanded(ppeItem, index)}
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
                                {ppeItems.map((ppeItem, index) => renderPPEItemFieldsExpanded(ppeItem, index))}
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
                                disabled={createMutation.isPending || ppeItems.length === 0}
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