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

export default function BulkAddCulturalLevelModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [culturalLevels, setCulturalLevels] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && culturalLevels.length === 0) {
            handleAddCulturalLevel();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.culturalLevel.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${culturalLevels.length} trình độ văn hóa thành công`);
            queryClient.invalidateQueries({ queryKey: ['culturalLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm trình độ văn hóa');
        },
    });

    const createNewCulturalLevel = () => {
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
            const mainSheet = workbook.addWorksheet('Trình độ văn hóa');

            const columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ văn hóa *', key: 'name', width: 35 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            culturalLevels.forEach(cl => {
                mainSheet.addRow({
                    code: cl.code,
                    name: cl.name,
                    description: cl.description,
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

            const fileName = culturalLevels.length > 0
                ? `Them_trinh_do_van_hoa_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_trinh_do_van_hoa.xlsx`;

            saveAs(blob, fileName);

            toast.success(culturalLevels.length > 0
                ? `Đã tải xuống file với ${culturalLevels.length} trình độ văn hóa`
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

            const worksheet = workbook.getWorksheet('Trình độ văn hóa');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ văn hóa"');
            }

            const importedCulturalLevels: any[] = [];
            const existingNames = new Map(culturalLevels.map(cl => [cl.name, cl]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const culturalLevelData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedCulturalLevels.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedCulturalLevels.push(culturalLevelData);
            });

            const updatedCulturalLevels = culturalLevels.map(cl => {
                const imported = importedCulturalLevels.find(imp => imp.name === cl.name);
                return imported || cl;
            });

            const newCulturalLevels = importedCulturalLevels.filter(
                imp => !existingNames.has(imp.name)
            );

            setCulturalLevels([...updatedCulturalLevels, ...newCulturalLevels]);
            setNextId(prev => prev + newCulturalLevels.length);

            toast.success(`Đã nhập ${importedCulturalLevels.length} trình độ văn hóa (${newCulturalLevels.length} mới, ${importedCulturalLevels.length - newCulturalLevels.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyCulturalLevel = (tempId: number) => {
        const culturalLevelToCopy = culturalLevels.find(cl => cl.tempId === tempId);
        if (culturalLevelToCopy) {
            const newCulturalLevel = {
                ...culturalLevelToCopy,
                tempId: nextId,
                code: '',
            };
            setCulturalLevels(prev => [...prev, newCulturalLevel]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép trình độ văn hóa');
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

    const handleAddCulturalLevel = () => {
        setCulturalLevels(prev => [...prev, createNewCulturalLevel()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveCulturalLevel = (tempId: number) => {
        setCulturalLevels(prev => prev.filter(cl => cl.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setCulturalLevels(prev =>
            prev.map(cl =>
                cl.tempId === tempId ? { ...cl, [field]: value } : cl
            )
        );
    };

    const handleSubmit = () => {
        if (culturalLevels.length === 0) {
            toast.error('Vui lòng thêm ít nhất một trình độ văn hóa');
            return;
        }

        const invalidCulturalLevels = culturalLevels.filter(cl => !cl.name);

        if (invalidCulturalLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ văn hóa cho tất cả các dòng');
            return;
        }

        const payload = culturalLevels.map(cl => ({
            code: cl.code || null,
            name: cl.name,
            description: cl.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setCulturalLevels([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (culturalLevel, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={culturalLevel[field]}
                        onChange={(e) => handleFieldChange(culturalLevel.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ văn hóa'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={culturalLevel.description}
                        onChange={(e) => handleFieldChange(culturalLevel.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderCulturalLevelFieldsExpanded = (culturalLevel, index) => (
        <div key={culturalLevel.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {culturalLevel.name || 'Trình độ văn hóa mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCulturalLevel(culturalLevel.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã trình độ
                    </Label>
                    <Input
                        value={culturalLevel.code}
                        onChange={(e) => handleFieldChange(culturalLevel.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: TDVH-01, 10/12, 12/12..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ văn hóa <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={culturalLevel.name}
                        onChange={(e) => handleFieldChange(culturalLevel.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: 10/12, 12/12, Trung học cơ sở..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={culturalLevel.description}
                        onChange={(e) => handleFieldChange(culturalLevel.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ văn hóa..."
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
                        Thêm trình độ văn hóa hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều trình độ văn hóa và lưu một lần
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
                                onClick={handleAddCulturalLevel}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm trình độ văn hóa
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{culturalLevels.length}</b> trình độ văn hóa
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {culturalLevels.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có trình độ văn hóa nào. Nhấn <b>Thêm trình độ văn hóa</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ văn hóa *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {culturalLevels.map((culturalLevel, index) => (
                                            <>
                                                <TableRow key={culturalLevel.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(culturalLevel.tempId)}
                                                                title={expandedRows.has(culturalLevel.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(culturalLevel.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyCulturalLevel(culturalLevel.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveCulturalLevel(culturalLevel.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(culturalLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(culturalLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(culturalLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(culturalLevel.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderCulturalLevelFieldsExpanded(culturalLevel, index)}
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
                                {culturalLevels.map((culturalLevel, index) => renderCulturalLevelFieldsExpanded(culturalLevel, index))}
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
                                disabled={createMutation.isPending || culturalLevels.length === 0}
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