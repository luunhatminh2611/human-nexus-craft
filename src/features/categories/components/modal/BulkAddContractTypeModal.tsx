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
import { categoriesApi } from '../../api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, FileText, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddLaborContractTypeModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [contractTypes, setContractTypes] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && contractTypes.length === 0) {
            handleAddContractType();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API create từng item một vì chưa có API bulk
            const promises = payload.map(item => 
                categoriesApi.laborContractType.create(item)
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${contractTypes.length} loại hợp đồng thành công`);
            queryClient.invalidateQueries({ queryKey: ['laborContractTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm loại hợp đồng');
        },
    });

    const createNewContractType = () => {
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
            const mainSheet = workbook.addWorksheet('Loại hợp đồng');

            const columns = [
                { header: 'Mã loại hợp đồng', key: 'code', width: 20 },
                { header: 'Tên loại hợp đồng *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            contractTypes.forEach(ct => {
                mainSheet.addRow({
                    code: ct.code,
                    name: ct.name,
                    description: ct.description,
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

            const fileName = contractTypes.length > 0
                ? `Them_loai_hop_dong_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_loai_hop_dong.xlsx`;

            saveAs(blob, fileName);

            toast.success(contractTypes.length > 0
                ? `Đã tải xuống file với ${contractTypes.length} loại hợp đồng`
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

            const worksheet = workbook.getWorksheet('Loại hợp đồng');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Loại hợp đồng"');
            }

            const importedContractTypes: any[] = [];
            const existingCodes = new Map(contractTypes.map(ct => [ct.code, ct]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const contractTypeData = {
                    tempId: existingCodes.has(code) ? existingCodes.get(code)!.tempId : nextId + importedContractTypes.length,
                    code,
                    name,
                    description: getCellValue(3),
                };

                importedContractTypes.push(contractTypeData);
            });

            const updatedContractTypes = contractTypes.map(ct => {
                const imported = importedContractTypes.find(imp => imp.code === ct.code && ct.code);
                return imported || ct;
            });

            const newContractTypes = importedContractTypes.filter(
                imp => !existingCodes.has(imp.code) || !imp.code
            );

            setContractTypes([...updatedContractTypes, ...newContractTypes]);
            setNextId(prev => prev + newContractTypes.length);

            toast.success(`Đã nhập ${importedContractTypes.length} loại hợp đồng (${newContractTypes.length} mới, ${importedContractTypes.length - newContractTypes.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyContractType = (tempId: number) => {
        const contractTypeToCopy = contractTypes.find(ct => ct.tempId === tempId);
        if (contractTypeToCopy) {
            const newContractType = {
                ...contractTypeToCopy,
                tempId: nextId,
                code: '',
            };
            setContractTypes(prev => [...prev, newContractType]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép loại hợp đồng');
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

    const handleAddContractType = () => {
        setContractTypes(prev => [...prev, createNewContractType()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveContractType = (tempId: number) => {
        setContractTypes(prev => prev.filter(ct => ct.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setContractTypes(prev =>
            prev.map(ct =>
                ct.tempId === tempId ? { ...ct, [field]: value } : ct
            )
        );
    };

    const handleSubmit = () => {
        if (contractTypes.length === 0) {
            toast.error('Vui lòng thêm ít nhất một loại hợp đồng');
            return;
        }

        const invalidContractTypes = contractTypes.filter(ct => !ct.name);

        if (invalidContractTypes.length > 0) {
            toast.error('Vui lòng điền tên loại hợp đồng cho tất cả các dòng');
            return;
        }

        const payload = contractTypes.map(ct => ({
            name: ct.name,
            code: ct.code || null,
            description: ct.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setContractTypes([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (contractType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={contractType[field]}
                        onChange={(e) => handleFieldChange(contractType.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Ví dụ: HDLD-01...' : 'Nhập tên loại hợp đồng'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={contractType.description}
                        onChange={(e) => handleFieldChange(contractType.tempId, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Nhập mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderContractTypeFieldsExpanded = (contractType, index) => (
        <div key={contractType.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {contractType.name || 'Loại hợp đồng mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContractType(contractType.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã loại hợp đồng</Label>
                    <Input
                        value={contractType.code}
                        onChange={(e) => handleFieldChange(contractType.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: HDLD-01, HĐXĐ-TH..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên loại hợp đồng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={contractType.name}
                        onChange={(e) => handleFieldChange(contractType.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Hợp đồng xác định thời hạn..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={contractType.description}
                        onChange={(e) => handleFieldChange(contractType.tempId, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về loại hợp đồng..."
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
                        <FileText className="h-5 w-5" />
                        Thêm loại hợp đồng hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều loại hợp đồng và lưu một lần
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
                                onClick={handleAddContractType}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm loại hợp đồng
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{contractTypes.length}</b> loại hợp đồng
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {contractTypes.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có loại hợp đồng nào. Nhấn <b>Thêm loại hợp đồng</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã loại hợp đồng</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên loại hợp đồng *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contractTypes.map((contractType, index) => (
                                            <>
                                                <TableRow key={contractType.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(contractType.tempId)}
                                                                title={expandedRows.has(contractType.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(contractType.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyContractType(contractType.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveContractType(contractType.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(contractType, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(contractType, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(contractType, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(contractType.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderContractTypeFieldsExpanded(contractType, index)}
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
                                {contractTypes.map((contractType, index) => renderContractTypeFieldsExpanded(contractType, index))}
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
                                disabled={createMutation.isPending || contractTypes.length === 0}
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