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
import { Loader2, X, Plus, Briefcase, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddFamilyPolicyModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [familyPolicies, setFamilyPolicies] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && familyPolicies.length === 0) {
            handleAddFamilyPolicy();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.policyFamily.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${familyPolicies.length} gia đình chính sách thành công`);
            queryClient.invalidateQueries({ queryKey: ['policyFamilies'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm gia đình chính sách');
        },
    });

    const createNewFamilyPolicy = () => {
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
            const mainSheet = workbook.addWorksheet('Gia đình chính sách');

            const columns = [
                { header: 'Mã chính sách', key: 'code', width: 20 },
                { header: 'Tên gia đình chính sách *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            familyPolicies.forEach(fp => {
                mainSheet.addRow({
                    code: fp.code,
                    name: fp.name,
                    description: fp.description,
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

            const fileName = familyPolicies.length > 0
                ? `Them_gia_dinh_chinh_sach_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_gia_dinh_chinh_sach.xlsx`;

            saveAs(blob, fileName);

            toast.success(familyPolicies.length > 0
                ? `Đã tải xuống file với ${familyPolicies.length} gia đình chính sách`
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

            const worksheet = workbook.getWorksheet('Gia đình chính sách');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Gia đình chính sách"');
            }

            const importedFamilyPolicies: any[] = [];
            const existingNames = new Map(familyPolicies.map(fp => [fp.name, fp]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const familyPolicyData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedFamilyPolicies.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedFamilyPolicies.push(familyPolicyData);
            });

            const updatedFamilyPolicies = familyPolicies.map(fp => {
                const imported = importedFamilyPolicies.find(imp => imp.name === fp.name);
                return imported || fp;
            });

            const newFamilyPolicies = importedFamilyPolicies.filter(
                imp => !existingNames.has(imp.name)
            );

            setFamilyPolicies([...updatedFamilyPolicies, ...newFamilyPolicies]);
            setNextId(prev => prev + newFamilyPolicies.length);

            toast.success(`Đã nhập ${importedFamilyPolicies.length} gia đình chính sách (${newFamilyPolicies.length} mới, ${importedFamilyPolicies.length - newFamilyPolicies.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyFamilyPolicy = (tempId: number) => {
        const familyPolicyToCopy = familyPolicies.find(fp => fp.tempId === tempId);
        if (familyPolicyToCopy) {
            const newFamilyPolicy = {
                ...familyPolicyToCopy,
                tempId: nextId,
                code: '',
            };
            setFamilyPolicies(prev => [...prev, newFamilyPolicy]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép gia đình chính sách');
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

    const handleAddFamilyPolicy = () => {
        setFamilyPolicies(prev => [...prev, createNewFamilyPolicy()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveFamilyPolicy = (tempId: number) => {
        setFamilyPolicies(prev => prev.filter(fp => fp.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setFamilyPolicies(prev =>
            prev.map(fp =>
                fp.tempId === tempId ? { ...fp, [field]: value } : fp
            )
        );
    };

    const handleSubmit = () => {
        if (familyPolicies.length === 0) {
            toast.error('Vui lòng thêm ít nhất một gia đình chính sách');
            return;
        }

        const invalidFamilyPolicies = familyPolicies.filter(fp => !fp.name);

        if (invalidFamilyPolicies.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên gia đình chính sách cho tất cả các dòng');
            return;
        }

        const payload = familyPolicies.map(fp => ({
            code: fp.code || null,
            name: fp.name,
            description: fp.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setFamilyPolicies([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (familyPolicy, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={familyPolicy[field]}
                        onChange={(e) => handleFieldChange(familyPolicy.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã chính sách' : 'Tên gia đình chính sách'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={familyPolicy.description}
                        onChange={(e) => handleFieldChange(familyPolicy.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderFamilyPolicyFieldsExpanded = (familyPolicy, index) => (
        <div key={familyPolicy.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {familyPolicy.name || 'Gia đình chính sách mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFamilyPolicy(familyPolicy.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã chính sách
                    </Label>
                    <Input
                        value={familyPolicy.code}
                        onChange={(e) => handleFieldChange(familyPolicy.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: GDCS-01, TNLĐ, TNTN..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên gia đình chính sách <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={familyPolicy.name}
                        onChange={(e) => handleFieldChange(familyPolicy.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Gia đình liệt sĩ, Thương binh..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={familyPolicy.description}
                        onChange={(e) => handleFieldChange(familyPolicy.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về gia đình chính sách..."
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
                        Thêm gia đình chính sách hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều gia đình chính sách và lưu một lần
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
                                onClick={handleAddFamilyPolicy}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm gia đình chính sách
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{familyPolicies.length}</b> gia đình chính sách
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {familyPolicies.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có gia đình chính sách nào. Nhấn <b>Thêm gia đình chính sách</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã chính sách</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên gia đình chính sách *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {familyPolicies.map((familyPolicy, index) => (
                                            <>
                                                <TableRow key={familyPolicy.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(familyPolicy.tempId)}
                                                                title={expandedRows.has(familyPolicy.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(familyPolicy.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyFamilyPolicy(familyPolicy.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveFamilyPolicy(familyPolicy.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(familyPolicy, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(familyPolicy, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(familyPolicy, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(familyPolicy.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderFamilyPolicyFieldsExpanded(familyPolicy, index)}
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
                                {familyPolicies.map((familyPolicy, index) => renderFamilyPolicyFieldsExpanded(familyPolicy, index))}
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
                                disabled={createMutation.isPending || familyPolicies.length === 0}
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