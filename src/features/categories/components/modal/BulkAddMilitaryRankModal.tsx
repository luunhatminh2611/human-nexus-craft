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
import { Loader2, X, Plus, Award, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddMilitaryRankModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [militaryRanks, setMilitaryRanks] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && militaryRanks.length === 0) {
            handleAddMilitaryRank();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.militaryRank.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${militaryRanks.length} quân hàm thành công`);
            queryClient.invalidateQueries({ queryKey: ['militaryRanks'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm quân hàm');
        },
    });

    const createNewMilitaryRank = () => {
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
            const mainSheet = workbook.addWorksheet('Quân hàm');

            const columns = [
                { header: 'Mã quân hàm', key: 'code', width: 20 },
                { header: 'Tên quân hàm *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            militaryRanks.forEach(mr => {
                mainSheet.addRow({
                    code: mr.code,
                    name: mr.name,
                    description: mr.description,
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

            const fileName = militaryRanks.length > 0
                ? `Them_quan_ham_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_quan_ham.xlsx`;

            saveAs(blob, fileName);

            toast.success(militaryRanks.length > 0
                ? `Đã tải xuống file với ${militaryRanks.length} quân hàm`
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

            const worksheet = workbook.getWorksheet('Quân hàm');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Quân hàm"');
            }

            const importedMilitaryRanks: any[] = [];
            const existingNames = new Map(militaryRanks.map(mr => [mr.name, mr]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const militaryRankData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedMilitaryRanks.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedMilitaryRanks.push(militaryRankData);
            });

            const updatedMilitaryRanks = militaryRanks.map(mr => {
                const imported = importedMilitaryRanks.find(imp => imp.name === mr.name);
                return imported || mr;
            });

            const newMilitaryRanks = importedMilitaryRanks.filter(
                imp => !existingNames.has(imp.name)
            );

            setMilitaryRanks([...updatedMilitaryRanks, ...newMilitaryRanks]);
            setNextId(prev => prev + newMilitaryRanks.length);

            toast.success(`Đã nhập ${importedMilitaryRanks.length} quân hàm (${newMilitaryRanks.length} mới, ${importedMilitaryRanks.length - newMilitaryRanks.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyMilitaryRank = (tempId: number) => {
        const militaryRankToCopy = militaryRanks.find(mr => mr.tempId === tempId);
        if (militaryRankToCopy) {
            const newMilitaryRank = {
                ...militaryRankToCopy,
                tempId: nextId,
                code: '',
            };
            setMilitaryRanks(prev => [...prev, newMilitaryRank]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép quân hàm');
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

    const handleAddMilitaryRank = () => {
        setMilitaryRanks(prev => [...prev, createNewMilitaryRank()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveMilitaryRank = (tempId: number) => {
        setMilitaryRanks(prev => prev.filter(mr => mr.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setMilitaryRanks(prev =>
            prev.map(mr =>
                mr.tempId === tempId ? { ...mr, [field]: value } : mr
            )
        );
    };

    const handleSubmit = () => {
        if (militaryRanks.length === 0) {
            toast.error('Vui lòng thêm ít nhất một quân hàm');
            return;
        }

        const invalidMilitaryRanks = militaryRanks.filter(mr => !mr.name);

        if (invalidMilitaryRanks.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên quân hàm cho tất cả các dòng');
            return;
        }

        const payload = militaryRanks.map(mr => ({
            code: mr.code || null,
            name: mr.name,
            description: mr.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setMilitaryRanks([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (militaryRank, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={militaryRank[field]}
                        onChange={(e) => handleFieldChange(militaryRank.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã quân hàm' : 'Tên quân hàm'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={militaryRank.description}
                        onChange={(e) => handleFieldChange(militaryRank.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderMilitaryRankFieldsExpanded = (militaryRank, index) => (
        <div key={militaryRank.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {militaryRank.name || 'Quân hàm mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMilitaryRank(militaryRank.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã quân hàm
                    </Label>
                    <Input
                        value={militaryRank.code}
                        onChange={(e) => handleFieldChange(militaryRank.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: SQ, HĐ, ĐW, TW, TĐ..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên quân hàm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={militaryRank.name}
                        onChange={(e) => handleFieldChange(militaryRank.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Sĩ quan, Hạ sĩ quan..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={militaryRank.description}
                        onChange={(e) => handleFieldChange(militaryRank.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về quân hàm..."
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
                        <Award className="h-5 w-5" />
                        Thêm quân hàm hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều quân hàm và lưu một lần
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
                                onClick={handleAddMilitaryRank}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm quân hàm
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{militaryRanks.length}</b> quân hàm
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {militaryRanks.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có quân hàm nào. Nhấn <b>Thêm quân hàm</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã quân hàm</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên quân hàm *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {militaryRanks.map((militaryRank, index) => (
                                            <>
                                                <TableRow key={militaryRank.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(militaryRank.tempId)}
                                                                title={expandedRows.has(militaryRank.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(militaryRank.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyMilitaryRank(militaryRank.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveMilitaryRank(militaryRank.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(militaryRank.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderMilitaryRankFieldsExpanded(militaryRank, index)}
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
                                {militaryRanks.map((militaryRank, index) => renderMilitaryRankFieldsExpanded(militaryRank, index))}
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
                                disabled={createMutation.isPending || militaryRanks.length === 0}
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