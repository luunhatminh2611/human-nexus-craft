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
import { jobTitleApi } from '../../api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Briefcase, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddPositionModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [positions, setPositions] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && positions.length === 0) {
            handleAddPosition();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API create từng item một
            const promises = payload.map(item => jobTitleApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${positions.length} chức vụ thành công`);
            queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm chức vụ');
        },
    });

    const createNewPosition = () => {
        return {
            tempId: nextId,
            name: '',
            code: '',
            description: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Chức vụ');

            const columns = [
                { header: 'Mã chức vụ', key: 'code', width: 15 },
                { header: 'Tên chức vụ *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            positions.forEach(pos => {
                mainSheet.addRow({
                    code: pos.code,
                    name: pos.name,
                    description: pos.description,
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

            const fileName = positions.length > 0
                ? `Them_chuc_vu_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_chuc_vu.xlsx`;

            saveAs(blob, fileName);

            toast.success(positions.length > 0
                ? `Đã tải xuống file với ${positions.length} chức vụ`
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

            const worksheet = workbook.getWorksheet('Chức vụ');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Chức vụ"');
            }

            const importedPositions: any[] = [];
            const existingCodes = new Map(positions.map(pos => [pos.code, pos]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const positionData = {
                    tempId: existingCodes.has(code) ? existingCodes.get(code)!.tempId : nextId + importedPositions.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedPositions.push(positionData);
            });

            const updatedPositions = positions.map(pos => {
                const imported = importedPositions.find(imp => imp.code === pos.code && pos.code);
                return imported || pos;
            });

            const newPositions = importedPositions.filter(
                imp => !existingCodes.has(imp.code) || !imp.code
            );

            setPositions([...updatedPositions, ...newPositions]);
            setNextId(prev => prev + newPositions.length);

            toast.success(`Đã nhập ${importedPositions.length} chức vụ (${newPositions.length} mới, ${importedPositions.length - newPositions.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyPosition = (tempId: number) => {
        const positionToCopy = positions.find(p => p.tempId === tempId);
        if (positionToCopy) {
            const newPosition = {
                ...positionToCopy,
                tempId: nextId,
                code: '',
            };
            setPositions(prev => [...prev, newPosition]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép chức vụ');
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

    const handleAddPosition = () => {
        setPositions(prev => [...prev, createNewPosition()]);
        setNextId(prev => prev + 1);
    };

    const handleRemovePosition = (tempId: number) => {
        setPositions(prev => prev.filter(p => p.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setPositions(prev =>
            prev.map(pos =>
                pos.tempId === tempId ? { ...pos, [field]: value } : pos
            )
        );
    };

    const handleSubmit = () => {
        if (positions.length === 0) {
            toast.error('Vui lòng thêm ít nhất một chức vụ');
            return;
        }

        const invalidPositions = positions.filter(pos => !pos.name);

        if (invalidPositions.length > 0) {
            toast.error('Vui lòng điền tên chức vụ cho tất cả các dòng');
            return;
        }

        const payload = positions.map(pos => ({
            name: pos.name,
            code: pos.code || null,
            description: pos.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setPositions([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (position, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={position[field]}
                        onChange={(e) => handleFieldChange(position.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Ví dụ: GD, PGD...' : 'Nhập tên chức vụ'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={position.description}
                        onChange={(e) => handleFieldChange(position.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Nhập mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderPositionFieldsExpanded = (position, index) => (
        <div key={position.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {position.name || 'Chức vụ mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePosition(position.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã chức vụ</Label>
                    <Input
                        value={position.code}
                        onChange={(e) => handleFieldChange(position.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: GD, PGD, TP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên chức vụ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={position.name}
                        onChange={(e) => handleFieldChange(position.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Giám đốc, Phó giám đốc..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={position.description}
                        onChange={(e) => handleFieldChange(position.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về chức vụ..."
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
                        <Briefcase className="h-5 w-5" />
                        Thêm chức vụ hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều chức vụ và lưu một lần
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
                                onClick={handleAddPosition}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm chức vụ
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{positions.length}</b> chức vụ
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {positions.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có chức vụ nào. Nhấn <b>Thêm chức vụ</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã chức vụ</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên chức vụ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {positions.map((position, index) => (
                                            <>
                                                <TableRow key={position.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(position.tempId)}
                                                                title={expandedRows.has(position.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(position.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyPosition(position.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePosition(position.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(position, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(position, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(position, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(position.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderPositionFieldsExpanded(position, index)}
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
                                {positions.map((position, index) => renderPositionFieldsExpanded(position, index))}
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
                                disabled={createMutation.isPending || positions.length === 0}
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