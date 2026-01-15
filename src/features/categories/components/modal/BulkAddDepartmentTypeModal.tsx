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
import { Switch } from '@/shared/components/ui/switch';
import { departmentTypeApi } from '@/features/departments/api/departmentTypeApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, FolderTree, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddDepartmentTypeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [departmentTypes, setDepartmentTypes] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && departmentTypes.length === 0) {
            handleAddDepartmentType();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API create từng item một vì chưa có API bulk
            const promises = payload.map(item => departmentTypeApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${departmentTypes.length} loại phòng ban thành công`);
            queryClient.invalidateQueries({ queryKey: ['departmentTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm loại phòng ban');
        },
    });

    const createNewDepartmentType = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
            description: '',
            isActive: true,
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Loại phòng ban');
            const dropdownSheet = workbook.addWorksheet('Danh mục');

            dropdownSheet.state = 'hidden';

            const columns = [
                { header: 'Mã loại phòng ban *', key: 'code', width: 20 },
                { header: 'Tên loại phòng ban *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
                { header: 'Trạng thái', key: 'isActive', width: 15 },
            ];

            mainSheet.columns = columns;

            departmentTypes.forEach(dt => {
                mainSheet.addRow({
                    code: dt.code,
                    name: dt.name,
                    description: dt.description,
                    isActive: dt.isActive ? 'Hoạt động' : 'Không hoạt động',
                });
            });

            // Write dropdown for status
            dropdownSheet.getCell(1, 1).value = 'isActive';
            dropdownSheet.getCell(2, 1).value = 'Hoạt động';
            dropdownSheet.getCell(3, 1).value = 'Không hoạt động';

            const dropdownRange = `'Danh mục'!$A$2:$A$3`;

            // Add validation for status column
            const maxRow = Math.max(departmentTypes.length + 1, 100);
            for (let i = 2; i <= maxRow; i++) {
                mainSheet.getCell(i, 4).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [dropdownRange],
                };
            }

            // Style header
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

            const fileName = departmentTypes.length > 0
                ? `Them_loai_phong_ban_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_loai_phong_ban.xlsx`;

            saveAs(blob, fileName);

            toast.success(departmentTypes.length > 0
                ? `Đã tải xuống file với ${departmentTypes.length} loại phòng ban`
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

            const worksheet = workbook.getWorksheet('Loại phòng ban');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Loại phòng ban"');
            }

            const importedDepartmentTypes: any[] = [];
            const existingCodes = new Map(departmentTypes.map(dt => [dt.code, dt]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!code || !name) return;

                const departmentTypeData = {
                    tempId: existingCodes.has(code) ? existingCodes.get(code)!.tempId : nextId + importedDepartmentTypes.length,
                    code,
                    name,
                    description: getCellValue(3),
                    isActive: getCellValue(4) !== 'Không hoạt động',
                };

                importedDepartmentTypes.push(departmentTypeData);
            });

            const updatedDepartmentTypes = departmentTypes.map(dt => {
                const imported = importedDepartmentTypes.find(imp => imp.code === dt.code);
                return imported || dt;
            });

            const newDepartmentTypes = importedDepartmentTypes.filter(
                imp => !existingCodes.has(imp.code)
            );

            setDepartmentTypes([...updatedDepartmentTypes, ...newDepartmentTypes]);
            setNextId(prev => prev + newDepartmentTypes.length);

            toast.success(`Đã nhập ${importedDepartmentTypes.length} loại phòng ban (${newDepartmentTypes.length} mới, ${importedDepartmentTypes.length - newDepartmentTypes.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyDepartmentType = (tempId: number) => {
        const departmentTypeToCopy = departmentTypes.find(dt => dt.tempId === tempId);
        if (departmentTypeToCopy) {
            const newDepartmentType = {
                ...departmentTypeToCopy,
                tempId: nextId,
                code: '',
            };
            setDepartmentTypes(prev => [...prev, newDepartmentType]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép loại phòng ban');
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

    const handleAddDepartmentType = () => {
        setDepartmentTypes(prev => [...prev, createNewDepartmentType()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveDepartmentType = (tempId: number) => {
        setDepartmentTypes(prev => prev.filter(dt => dt.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setDepartmentTypes(prev =>
            prev.map(dt =>
                dt.tempId === tempId ? { ...dt, [field]: value } : dt
            )
        );
    };

    const handleSubmit = () => {
        if (departmentTypes.length === 0) {
            toast.error('Vui lòng thêm ít nhất một loại phòng ban');
            return;
        }

        const invalidDepartmentTypes = departmentTypes.filter(dt => !dt.code || !dt.name);

        if (invalidDepartmentTypes.length > 0) {
            toast.error('Vui lòng điền đầy đủ mã và tên loại phòng ban cho tất cả các dòng');
            return;
        }

        const payload = departmentTypes.map(dt => ({
            code: dt.code,
            name: dt.name,
            description: dt.description || null,
            isActive: dt.isActive,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setDepartmentTypes([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (departmentType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={departmentType[field]}
                        onChange={(e) => handleFieldChange(departmentType.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã loại phòng ban' : 'Tên loại phòng ban'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={departmentType.description}
                        onChange={(e) => handleFieldChange(departmentType.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            case 'isActive':
                return (
                    <div className="flex items-center justify-center">
                        <Switch
                            checked={departmentType.isActive}
                            onCheckedChange={(checked) => handleFieldChange(departmentType.tempId, 'isActive', checked)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderDepartmentTypeFieldsExpanded = (departmentType, index) => (
        <div key={departmentType.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {departmentType.name || 'Loại phòng ban mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDepartmentType(departmentType.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã loại phòng ban <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={departmentType.code}
                        onChange={(e) => handleFieldChange(departmentType.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: PB, BP, VP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên loại phòng ban <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={departmentType.name}
                        onChange={(e) => handleFieldChange(departmentType.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phòng ban, Bộ phận..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={departmentType.description}
                        onChange={(e) => handleFieldChange(departmentType.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về loại phòng ban..."
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={departmentType.isActive}
                        onCheckedChange={(checked) => handleFieldChange(departmentType.tempId, 'isActive', checked)}
                    />
                    <Label className="text-xs cursor-pointer">Hoạt động</Label>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <FolderTree className="h-5 w-5" />
                        Thêm loại phòng ban hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều loại phòng ban và lưu một lần
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
                                onClick={handleAddDepartmentType}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm loại phòng ban
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{departmentTypes.length}</b> loại phòng ban
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {departmentTypes.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có loại phòng ban nào. Nhấn <b>Thêm loại phòng ban</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                            <TableHead className="whitespace-nowrap text-center">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departmentTypes.map((departmentType, index) => (
                                            <>
                                                <TableRow key={departmentType.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(departmentType.tempId)}
                                                                title={expandedRows.has(departmentType.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(departmentType.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyDepartmentType(departmentType.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDepartmentType(departmentType.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(departmentType, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(departmentType, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(departmentType, 'description')}</TableCell>
                                                    <TableCell>{renderTableCell(departmentType, 'isActive')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(departmentType.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            {renderDepartmentTypeFieldsExpanded(departmentType, index)}
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
                                {departmentTypes.map((departmentType, index) => renderDepartmentTypeFieldsExpanded(departmentType, index))}
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
                                disabled={createMutation.isPending || departmentTypes.length === 0}
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