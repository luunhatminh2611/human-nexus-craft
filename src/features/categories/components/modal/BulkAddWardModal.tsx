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
import { wardApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, MapPin, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddWardModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [wards, setWards] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && wards.length === 0) {
            handleAddWard();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => wardApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${wards.length} phường/xã thành công`);
            queryClient.invalidateQueries({ queryKey: ['wards'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm phường/xã');
        },
    });

    const createNewWard = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Phuong_Xa');

            const columns = [
                { header: 'Mã phường/xã', key: 'code', width: 20 },
                { header: 'Tên phường/xã *', key: 'name', width: 30 },
            ];

            mainSheet.columns = columns;

            wards.forEach(ward => {
                mainSheet.addRow({
                    code: ward.code,
                    name: ward.name,
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

            const fileName = wards.length > 0
                ? `Them_phuong_xa_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_phuong_xa.xlsx`;

            saveAs(blob, fileName);

            toast.success(wards.length > 0
                ? `Đã tải xuống file với ${wards.length} phường/xã`
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

            const worksheet = workbook.getWorksheet('Phuong_Xa');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Phuong_Xa"');
            }

            const importedWards: any[] = [];
            const existingNames = new Map(wards.map(ward => [ward.name, ward]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const wardData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedWards.length,
                    code,
                    name,
                };

                importedWards.push(wardData);
            });

            const updatedWards = wards.map(ward => {
                const imported = importedWards.find(imp => imp.name === ward.name);
                return imported || ward;
            });

            const newWards = importedWards.filter(
                imp => !existingNames.has(imp.name)
            );

            setWards([...updatedWards, ...newWards]);
            setNextId(prev => prev + newWards.length);

            toast.success(`Đã nhập ${importedWards.length} phường/xã (${newWards.length} mới, ${importedWards.length - newWards.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyWard = (tempId: number) => {
        const wardToCopy = wards.find(ward => ward.tempId === tempId);
        if (wardToCopy) {
            const newWard = {
                ...wardToCopy,
                tempId: nextId,
                code: '',
            };
            setWards(prev => [...prev, newWard]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép phường/xã');
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

    const handleAddWard = () => {
        setWards(prev => [...prev, createNewWard()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveWard = (tempId: number) => {
        setWards(prev => prev.filter(ward => ward.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setWards(prev =>
            prev.map(ward =>
                ward.tempId === tempId ? { ...ward, [field]: value } : ward
            )
        );
    };

    const handleSubmit = () => {
        if (wards.length === 0) {
            toast.error('Vui lòng thêm ít nhất một phường/xã');
            return;
        }

        const invalidWards = wards.filter(ward => !ward.name);

        if (invalidWards.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên phường/xã cho tất cả các dòng');
            return;
        }

        const payload = wards.map(ward => ({
            code: ward.code || null,
            name: ward.name,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setWards([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (ward, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={ward[field]}
                        onChange={(e) => handleFieldChange(ward.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã phường/xã' : 'Tên phường/xã'}
                    />
                );
            default:
                return null;
        }
    };

    const renderWardFieldsExpanded = (ward, index) => (
        <div key={ward.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {ward.name || 'Phường/xã mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWard(ward.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã phường/xã
                    </Label>
                    <Input
                        value={ward.code}
                        onChange={(e) => handleFieldChange(ward.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: PX01, X01..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên phường/xã <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={ward.name}
                        onChange={(e) => handleFieldChange(ward.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phường 1, Xã Tân Lập..."
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
                        <MapPin className="h-5 w-5" />
                        Thêm phường/xã hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều phường/xã và lưu một lần
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
                                onClick={handleAddWard}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm phường/xã
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{wards.length}</b> phường/xã
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {wards.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có phường/xã nào. Nhấn <b>Thêm phường/xã</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã phường/xã</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên phường/xã *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {wards.map((ward, index) => (
                                            <React.Fragment key={ward.tempId}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(ward.tempId)}
                                                                title={expandedRows.has(ward.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(ward.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyWard(ward.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveWard(ward.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(ward, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(ward, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(ward.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderWardFieldsExpanded(ward, index)}
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
                                {wards.map((ward, index) => renderWardFieldsExpanded(ward, index))}
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
                                disabled={createMutation.isPending || wards.length === 0}
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