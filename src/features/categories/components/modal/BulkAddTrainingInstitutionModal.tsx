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
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Building2, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddTrainingInstitutionModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [institutions, setInstitutions] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && institutions.length === 0) {
            handleAddInstitution();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.trainingInstitution.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${institutions.length} cơ sở đào tạo thành công`);
            queryClient.invalidateQueries({ queryKey: ['trainingInstitutions'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm cơ sở đào tạo');
        },
    });

    const createNewInstitution = () => {
        return {
            tempId: nextId,
            name: '',
            address: '',
            phone: '',
            email: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Co_so_dao_tao');

            const columns = [
                { header: 'Tên cơ sở đào tạo *', key: 'name', width: 30 },
                { header: 'Địa chỉ', key: 'address', width: 40 },
                { header: 'Số điện thoại', key: 'phone', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
            ];

            mainSheet.columns = columns;

            institutions.forEach(inst => {
                mainSheet.addRow({
                    name: inst.name,
                    address: inst.address,
                    phone: inst.phone,
                    email: inst.email,
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

            const fileName = institutions.length > 0
                ? `Them_co_so_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_co_so_dao_tao.xlsx`;

            saveAs(blob, fileName);

            toast.success(institutions.length > 0
                ? `Đã tải xuống file với ${institutions.length} cơ sở đào tạo`
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

            const worksheet = workbook.getWorksheet('Co_so_dao_tao');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Co_so_dao_tao"');
            }

            const importedInstitutions: any[] = [];
            const existingNames = new Map(institutions.map(inst => [inst.name, inst]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);

                    if (!cell.value) return '';

                    // Xử lý object (hyperlink, rich text, formula)
                    if (typeof cell.value === 'object' && cell.value !== null) {
                        if ('text' in cell.value) return String(cell.value.text).trim();
                        if ('richText' in cell.value) return cell.value.richText.map(rt => rt.text).join('').trim();
                        if ('result' in cell.value) return String(cell.value.result).trim();
                        return String(cell.value).trim();
                    }

                    return String(cell.value).trim();
                };

                const name = getCellValue(1);
                if (!name) return;

                const institutionData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedInstitutions.length,
                    name,
                    address: getCellValue(2),
                    phone: getCellValue(3),
                    email: getCellValue(4),
                };

                importedInstitutions.push(institutionData);
            });

            const updatedInstitutions = institutions.map(inst => {
                const imported = importedInstitutions.find(imp => imp.name === inst.name);
                return imported || inst;
            });

            const newInstitutions = importedInstitutions.filter(
                imp => !existingNames.has(imp.name)
            );

            setInstitutions([...updatedInstitutions, ...newInstitutions]);
            setNextId(prev => prev + newInstitutions.length);

            toast.success(`Đã nhập ${importedInstitutions.length} cơ sở đào tạo (${newInstitutions.length} mới, ${importedInstitutions.length - newInstitutions.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyInstitution = (tempId: number) => {
        const institutionToCopy = institutions.find(inst => inst.tempId === tempId);
        if (institutionToCopy) {
            const newInstitution = {
                ...institutionToCopy,
                tempId: nextId,
            };
            setInstitutions(prev => [...prev, newInstitution]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép cơ sở đào tạo');
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

    const handleAddInstitution = () => {
        setInstitutions(prev => [...prev, createNewInstitution()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveInstitution = (tempId: number) => {
        setInstitutions(prev => prev.filter(inst => inst.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setInstitutions(prev =>
            prev.map(inst =>
                inst.tempId === tempId ? { ...inst, [field]: value } : inst
            )
        );
    };

    const handleSubmit = () => {
        if (institutions.length === 0) {
            toast.error('Vui lòng thêm ít nhất một cơ sở đào tạo');
            return;
        }

        const invalidInstitutions = institutions.filter(inst => !inst.name);

        if (invalidInstitutions.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên cơ sở đào tạo cho tất cả các dòng');
            return;
        }

        const payload = institutions.map(inst => ({
            name: inst.name,
            address: inst.address || null,
            phone: inst.phone || null,
            email: inst.email || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setInstitutions([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (institution, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
            case 'address':
            case 'phone':
            case 'email':
                return (
                    <Input
                        value={institution[field]}
                        onChange={(e) => handleFieldChange(institution.tempId, field, e.target.value)}
                        className={commonInputClass}
                        type={field === 'email' ? 'email' : 'text'}
                        placeholder={
                            field === 'name' ? 'Tên cơ sở đào tạo' :
                                field === 'address' ? 'Địa chỉ' :
                                    field === 'phone' ? 'Số điện thoại' :
                                        'Email'
                        }
                    />
                );
            default:
                return null;
        }
    };

    const renderInstitutionFieldsExpanded = (institution, index) => (
        <div key={institution.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {institution.name || 'Cơ sở đào tạo mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInstitution(institution.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">
                        Tên cơ sở đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={institution.name}
                        onChange={(e) => handleFieldChange(institution.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Đại học Bách Khoa Hà Nội..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Địa chỉ</Label>
                    <Input
                        value={institution.address}
                        onChange={(e) => handleFieldChange(institution.tempId, 'address', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Số điện thoại</Label>
                    <Input
                        value={institution.phone}
                        onChange={(e) => handleFieldChange(institution.tempId, 'phone', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: 0243 868 3008"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                        value={institution.email}
                        onChange={(e) => handleFieldChange(institution.tempId, 'email', e.target.value)}
                        className="h-8 text-sm"
                        type="email"
                        placeholder="Ví dụ: info@university.edu.vn"
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
                        <Building2 className="h-5 w-5" />
                        Thêm cơ sở đào tạo hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều cơ sở đào tạo và lưu một lần
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
                                onClick={handleAddInstitution}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm cơ sở đào tạo
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{institutions.length}</b> cơ sở đào tạo
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {institutions.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có cơ sở đào tạo nào. Nhấn <b>Thêm cơ sở đào tạo</b> để bắt đầu.
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-32 text-center sticky left-12 bg-background z-10">
                                                Thao tác
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">Tên cơ sở đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Địa chỉ</TableHead>
                                            <TableHead className="whitespace-nowrap">Số điện thoại</TableHead>
                                            <TableHead className="whitespace-nowrap">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {institutions.map((institution, index) => (
                                            <React.Fragment key={institution.tempId}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(institution.tempId)}
                                                                title={expandedRows.has(institution.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(institution.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyInstitution(institution.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveInstitution(institution.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(institution, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(institution, 'address')}</TableCell>
                                                    <TableCell>{renderTableCell(institution, 'phone')}</TableCell>
                                                    <TableCell>{renderTableCell(institution, 'email')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(institution.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            {renderInstitutionFieldsExpanded(institution, index)}
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
                                {institutions.map((institution, index) => renderInstitutionFieldsExpanded(institution, index))}
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
                                disabled={createMutation.isPending || institutions.length === 0}
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