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
import { provinceCityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, MapPin, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddProvinceCityModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [provinceCities, setProvinceCities] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && provinceCities.length === 0) {
            handleAddProvinceCity();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => provinceCityApi.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${provinceCities.length} tỉnh/thành phố thành công`);
            queryClient.invalidateQueries({ queryKey: ['provinceCities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm tỉnh/thành phố');
        },
    });

    const createNewProvinceCity = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Tỉnh thành phố');

            const columns = [
                { header: 'Mã tỉnh/thành phố', key: 'code', width: 20 },
                { header: 'Tên tỉnh/thành phố *', key: 'name', width: 35 },
            ];

            mainSheet.columns = columns;

            provinceCities.forEach(pc => {
                mainSheet.addRow({
                    code: pc.code,
                    name: pc.name,
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

            const fileName = provinceCities.length > 0
                ? `Them_tinh_thanh_pho_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_tinh_thanh_pho.xlsx`;

            saveAs(blob, fileName);

            toast.success(provinceCities.length > 0
                ? `Đã tải xuống file với ${provinceCities.length} tỉnh/thành phố`
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

            const worksheet = workbook.getWorksheet('Tỉnh thành phố');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Tỉnh thành phố"');
            }

            const importedProvinceCities: any[] = [];
            const existingNames = new Map(provinceCities.map(pc => [pc.name, pc]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const provinceCityData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedProvinceCities.length,
                    code,
                    name,
                };

                importedProvinceCities.push(provinceCityData);
            });

            const updatedProvinceCities = provinceCities.map(pc => {
                const imported = importedProvinceCities.find(imp => imp.name === pc.name);
                return imported || pc;
            });

            const newProvinceCities = importedProvinceCities.filter(
                imp => !existingNames.has(imp.name)
            );

            setProvinceCities([...updatedProvinceCities, ...newProvinceCities]);
            setNextId(prev => prev + newProvinceCities.length);

            toast.success(`Đã nhập ${importedProvinceCities.length} tỉnh/thành phố (${newProvinceCities.length} mới, ${importedProvinceCities.length - newProvinceCities.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyProvinceCity = (tempId: number) => {
        const provinceCityToCopy = provinceCities.find(pc => pc.tempId === tempId);
        if (provinceCityToCopy) {
            const newProvinceCity = {
                ...provinceCityToCopy,
                tempId: nextId,
                code: '',
            };
            setProvinceCities(prev => [...prev, newProvinceCity]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép tỉnh/thành phố');
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

    const handleAddProvinceCity = () => {
        setProvinceCities(prev => [...prev, createNewProvinceCity()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveProvinceCity = (tempId: number) => {
        setProvinceCities(prev => prev.filter(pc => pc.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setProvinceCities(prev =>
            prev.map(pc =>
                pc.tempId === tempId ? { ...pc, [field]: value } : pc
            )
        );
    };

    const handleSubmit = () => {
        if (provinceCities.length === 0) {
            toast.error('Vui lòng thêm ít nhất một tỉnh/thành phố');
            return;
        }

        const invalidProvinceCities = provinceCities.filter(pc => !pc.name);

        if (invalidProvinceCities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên tỉnh/thành phố cho tất cả các dòng');
            return;
        }

        const payload = provinceCities.map(pc => ({
            code: pc.code || null,
            name: pc.name,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setProvinceCities([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (provinceCity, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        return (
            <Input
                value={provinceCity[field]}
                onChange={(e) => handleFieldChange(provinceCity.tempId, field, e.target.value)}
                className={commonInputClass}
                placeholder={field === 'code' ? 'Mã tỉnh/thành phố' : 'Tên tỉnh/thành phố'}
            />
        );
    };

    const renderProvinceCityFieldsExpanded = (provinceCity, index) => (
        <div key={provinceCity.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {provinceCity.name || 'Tỉnh/thành phố mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProvinceCity(provinceCity.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã tỉnh/thành phố
                    </Label>
                    <Input
                        value={provinceCity.code}
                        onChange={(e) => handleFieldChange(provinceCity.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: HN, HCM, DN, HP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên tỉnh/thành phố <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={provinceCity.name}
                        onChange={(e) => handleFieldChange(provinceCity.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Hà Nội, Hồ Chí Minh..."
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
                        Thêm tỉnh/thành phố hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều tỉnh/thành phố và lưu một lần
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
                                onClick={handleAddProvinceCity}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm tỉnh/thành phố
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{provinceCities.length}</b> tỉnh/thành phố
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {provinceCities.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có tỉnh/thành phố nào. Nhấn <b>Thêm tỉnh/thành phố</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã tỉnh/thành phố</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên tỉnh/thành phố *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {provinceCities.map((provinceCity, index) => (
                                            <>
                                                <TableRow key={provinceCity.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(provinceCity.tempId)}
                                                                title={expandedRows.has(provinceCity.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(provinceCity.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyProvinceCity(provinceCity.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveProvinceCity(provinceCity.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(provinceCity, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(provinceCity, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(provinceCity.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderProvinceCityFieldsExpanded(provinceCity, index)}
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
                                {provinceCities.map((provinceCity, index) => renderProvinceCityFieldsExpanded(provinceCity, index))}
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
                                disabled={createMutation.isPending || provinceCities.length === 0}
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