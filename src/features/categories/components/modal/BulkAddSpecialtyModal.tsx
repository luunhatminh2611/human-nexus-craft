// File: BulkAddSpecialtyModal.tsx
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
import { specialtyApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Briefcase, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddSpecialtyModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [specialties, setSpecialties] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && specialties.length === 0) {
            handleAddSpecialty();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => specialtyApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${specialties.length} nghề nghiệp thành công`);
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm nghề nghiệp');
        },
    });

    const createNewSpecialty = () => {
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
            const mainSheet = workbook.addWorksheet('Nghề nghiệp');

            const columns = [
                { header: 'Mã nghề nghiệp', key: 'code', width: 30 },
                { header: 'Tên nghề nghiệp *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            specialties.forEach(specialty => {
                mainSheet.addRow({
                    code: specialty.code,
                    name: specialty.name,
                    description: specialty.description,
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

            const fileName = specialties.length > 0
                ? `Them_nghe_nghiep_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_nghe_nghiep.xlsx`;

            saveAs(blob, fileName);

            toast.success(specialties.length > 0
                ? `Đã tải xuống file với ${specialties.length} nghề nghiệp`
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

            const worksheet = workbook.getWorksheet('Nghề nghiệp');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Nghề nghiệp"');
            }

            const importedSpecialties: any[] = [];
            const existingNames = new Map(specialties.map(s => [s.name, s]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                const specialtyData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedSpecialties.length,
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                };

                importedSpecialties.push(specialtyData);
            });

            const updatedSpecialties = specialties.map(s => {
                const imported = importedSpecialties.find(imp => imp.name === s.name);
                return imported || s;
            });

            const newSpecialties = importedSpecialties.filter(
                imp => !existingNames.has(imp.name)
            );

            setSpecialties([...updatedSpecialties, ...newSpecialties]);
            setNextId(prev => prev + newSpecialties.length);

            toast.success(`Đã nhập ${importedSpecialties.length} nghề nghiệp (${newSpecialties.length} mới, ${importedSpecialties.length - newSpecialties.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopySpecialty = (tempId: number) => {
        const specialtyToCopy = specialties.find(s => s.tempId === tempId);
        if (specialtyToCopy) {
            const newSpecialty = {
                ...specialtyToCopy,
                tempId: nextId,
            };
            setSpecialties(prev => [...prev, newSpecialty]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép nghề nghiệp');
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

    const handleAddSpecialty = () => {
        setSpecialties(prev => [...prev, createNewSpecialty()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveSpecialty = (tempId: number) => {
        setSpecialties(prev => prev.filter(s => s.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setSpecialties(prev =>
            prev.map(s =>
                s.tempId === tempId ? { ...s, [field]: value } : s
            )
        );
    };

    const handleSubmit = () => {
        if (specialties.length === 0) {
            toast.error('Vui lòng thêm ít nhất một nghề nghiệp');
            return;
        }

        const invalidSpecialties = specialties.filter(s => !s.name);

        if (invalidSpecialties.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên nghề nghiệp cho tất cả các dòng');
            return;
        }

        const payload = specialties.map(s => ({
            code: s.code || null,
            name: s.name,
            description: s.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setSpecialties([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (specialty, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
                return (
                    <Input
                        value={specialty[field]}
                        onChange={(e) => handleFieldChange(specialty.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="NN-01"
                    />
                );
            case 'name':
                return (
                    <Input
                        value={specialty[field]}
                        onChange={(e) => handleFieldChange(specialty.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên nghề nghiệp"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={specialty.description}
                        onChange={(e) => handleFieldChange(specialty.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderSpecialtyFieldsExpanded = (specialty, index) => (
        <div key={specialty.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {specialty.name || 'Nghề nghiệp mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecialty(specialty.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã nghề nghiệp</Label>
                    <Input
                        value={specialty.code}
                        onChange={(e) => handleFieldChange(specialty.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: NN-01, IT-DEV..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên nghề nghiệp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={specialty.name}
                        onChange={(e) => handleFieldChange(specialty.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kỹ sư phần mềm, Quản lý nhân sự..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={specialty.description}
                        onChange={(e) => handleFieldChange(specialty.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về nghề nghiệp..."
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
                        Thêm nghề nghiệp hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều nghề nghiệp và lưu một lần
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
                                onClick={handleAddSpecialty}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm nghề nghiệp
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{specialties.length}</b> nghề nghiệp
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {specialties.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có nghề nghiệp nào. Nhấn <b>Thêm nghề nghiệp</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã nghề nghiệp</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên nghề nghiệp *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {specialties.map((specialty, index) => (
                                            <>
                                                <TableRow key={specialty.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(specialty.tempId)}
                                                                title={expandedRows.has(specialty.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(specialty.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopySpecialty(specialty.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveSpecialty(specialty.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(specialty.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderSpecialtyFieldsExpanded(specialty, index)}
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
                                {specialties.map((specialty, index) => renderSpecialtyFieldsExpanded(specialty, index))}
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
                                disabled={createMutation.isPending || specialties.length === 0}
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