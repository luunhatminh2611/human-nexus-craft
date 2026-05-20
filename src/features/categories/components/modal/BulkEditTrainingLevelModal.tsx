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
import { Loader2, GraduationCap, Download, Upload, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';
import { trainingLevelApi, TrainingLevel } from '../../api/trainingLevel';

interface BulkEditTrainingLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds: number[];
}

export default function BulkEditTrainingLevelModal({ isOpen, onClose, preSelectedIds }: BulkEditTrainingLevelModalProps) {
    const queryClient = useQueryClient();
    const [trainingLevels, setTrainingLevels] = useState<TrainingLevel[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (isOpen && preSelectedIds.length > 0) {
            fetchSelectedLevels();
        }
    }, [isOpen]);

    const fetchSelectedLevels = async () => {
        try {
            setFetchLoading(true);
            const data = await trainingLevelApi.getAll();
            const filtered = data
                .filter(tl => preSelectedIds.includes(tl.id))
                .map(tl => ({ ...tl, tempId: tl.id }));
            setTrainingLevels(filtered);
        } catch (error) {
            toast.error('Không thể tải danh sách trình độ đào tạo');
            console.error(error);
        } finally {
            setFetchLoading(false);
        }
    };

    const updateMutation = useMutation({
        mutationFn: async (payload: TrainingLevel[]) => {
            return trainingLevelApi.updateBulk(payload);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${trainingLevels.length} trình độ đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật trình độ đào tạo');
        },
    });

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

            saveAs(blob, `Sua_trinh_do_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success(`Đã tải xuống file với ${trainingLevels.length} trình độ đào tạo`);
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

            const existingNames = new Map(trainingLevels.map(tl => [tl.name, tl]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name || !existingNames.has(name)) return;

                setTrainingLevels(prev =>
                    prev.map(tl =>
                        tl.name === name
                            ? { ...tl, code: getCellValue(1), description: getCellValue(3) }
                            : tl
                    )
                );
            });

            toast.success('Đã nhập dữ liệu từ file Excel');
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const toggleRowExpansion = (tempId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.has(tempId) ? newSet.delete(tempId) : newSet.add(tempId);
            return newSet;
        });
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setTrainingLevels(prev =>
            prev.map(tl => tl.tempId === tempId ? { ...tl, [field]: value } : tl)
        );
    };

    const handleSubmit = () => {
        if (trainingLevels.length === 0) {
            toast.error('Không có trình độ đào tạo nào để cập nhật');
            return;
        }

        const invalid = trainingLevels.filter(tl => !tl.name);
        if (invalid.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ đào tạo cho tất cả các dòng');
            return;
        }

        const payload = trainingLevels.map(tl => ({
            id: tl.id,
            code: tl.code || '',
            name: tl.name,
            description: tl.description || '',
        }));
        // đọi em vũ
        console.log('Payload to submit edit nhaa:', payload);

        // updateMutation.mutate(payload);
    };

    const handleClose = () => {
        setTrainingLevels([]);
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
                    {trainingLevel.name || 'Trình độ đào tạo'}
                </h4>
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
                        Sửa trình độ đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin các trình độ đào tạo đã chọn và lưu một lần
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
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{trainingLevels.length}</b> trình độ đào tạo được chọn
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {fetchLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-sm text-muted-foreground">Đang tải...</span>
                            </div>
                        ) : trainingLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Không có trình độ đào tạo nào được chọn.
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-24 text-center sticky left-12 bg-background z-10">
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
                            <Button variant="outline" onClick={handleClose} disabled={updateMutation.isPending}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={updateMutation.isPending || trainingLevels.length === 0}
                            >
                                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {updateMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}