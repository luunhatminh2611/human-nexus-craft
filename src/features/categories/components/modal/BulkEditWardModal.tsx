import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/shared/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import { wardApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditWardModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditWardModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditWardModalProps) {
    const queryClient = useQueryClient();
    const [selectedWards, setSelectedWards] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    const toggleRowExpansion = (id: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const { data: allWards = [] } = useQuery({
        queryKey: ['wards'],
        queryFn: wardApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedWards = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    wardApi.getById(id).then(response => response.data || response)
                );

                const wardsData = await Promise.all(promises);

                const mappedWards = wardsData.map(ward => ({
                    id: ward.id,
                    code: ward.code || '',
                    name: ward.name || '',
                }));

                setSelectedWards(mappedWards);
            } catch (error) {
                console.error('Error loading pre-selected wards:', error);
                toast.error('Không thể tải thông tin phường/xã');
            }
        };

        loadPreSelectedWards();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                wardApi.update(item.id, {
                    code: item.code,
                    name: item.name,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedWards.length} phường/xã`);
            queryClient.invalidateQueries({ queryKey: ['wards'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật phường/xã');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Phuong_Xa');

            const columns = [
                { header: 'Mã phường/xã', key: 'code', width: 20 },
                { header: 'Tên phường/xã *', key: 'name', width: 30 },
            ];

            mainSheet.columns = columns;

            selectedWards.forEach(ward => {
                mainSheet.addRow({
                    code: ward.code,
                    name: ward.name,
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

            saveAs(blob, `Chinh_sua_phuong_xa_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedWards.length} phường/xã`);
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

            const worksheet = workbook.getWorksheet('Phuong_Xa');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Phuong_Xa"');
            }

            const importedWards: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedWards.push({
                    code,
                    name,
                });
            });

            if (importedWards.length === selectedWards.length) {
                setSelectedWards(prev => prev.map((ward, index) => ({
                    ...ward,
                    ...importedWards[index]
                })));
                toast.success(`Đã cập nhật ${importedWards.length} phường/xã từ file`);
            } else {
                toast.warning(`File có ${importedWards.length} dòng nhưng đang chỉnh sửa ${selectedWards.length} phường/xã`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddWard = async (id: number) => {
        if (selectedWards.find(ward => ward.id === id)) {
            toast.error('Phường/xã này đã được thêm');
            return;
        }

        try {
            const response = await wardApi.getById(id);
            const wardData = response.data || response;

            setSelectedWards(prev => [...prev, {
                id: wardData.id,
                code: wardData.code || '',
                name: wardData.name || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching ward:', error);
            toast.error('Không thể tải thông tin phường/xã');
        }
    };

    const handleRemoveWard = (id: number) => {
        setSelectedWards(prev => prev.filter(ward => ward.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedWards(prev =>
            prev.map(ward =>
                ward.id === id ? { ...ward, [field]: value } : ward
            )
        );
    };

    const handleSubmit = () => {
        if (selectedWards.length === 0) {
            toast.error('Vui lòng chọn ít nhất một phường/xã');
            return;
        }

        const invalidWards = selectedWards.filter(ward => !ward.name);

        if (invalidWards.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên phường/xã cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedWards);
    };

    const handleClose = () => {
        setSelectedWards([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredWards = allWards.filter(ward =>
        ward.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        ward.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (ward, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={ward[field]}
                        onChange={(e) => handleFieldChange(ward.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã phường/xã' : 'Tên phường/xã'}
                    />
                );
            default:
                return null;
        }
    };

    const renderWardFieldsExpanded = (ward, index) => (
        <div key={ward.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {ward.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWard(ward.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã phường/xã
                    </Label>
                    <Input
                        value={ward.code}
                        onChange={(e) => handleFieldChange(ward.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: PX01, X01..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên phường/xã <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={ward.name}
                        onChange={(e) => handleFieldChange(ward.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phường 1, Xã Tân Lập..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa phường/xã hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn phường/xã để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {preSelectedIds.length === 0 && (
                        <div className="px-4 py-3 border-b bg-muted/30">
                            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={searchOpen}
                                        className="w-full justify-between"
                                    >
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        {searchValue || "Nhập tên hoặc mã phường/xã..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm phường/xã..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy phường/xã.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredWards.map((ward) => (
                                                <CommandItem
                                                    key={ward.id}
                                                    value={ward.name}
                                                    onSelect={() => handleAddWard(ward.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedWards.find(w => w.id === ward.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{ward.name}</span>
                                                        {ward.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {ward.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedWards.length > 0 && (
                        <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
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
                            </div>

                            <div className="text-sm text-muted-foreground">
                                Đã chọn: <b>{selectedWards.length}</b> phường/xã
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedWards.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có phường/xã nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã phường/xã</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên phường/xã *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedWards.map((ward, index) => (
                                            <React.Fragment key={ward.id}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(ward.id)}
                                                                title={expandedRows.has(ward.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(ward.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveWard(ward.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(ward, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(ward, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(ward.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderWardFieldsExpanded(ward, index)}
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
                                {selectedWards.map((ward, index) => renderWardFieldsExpanded(ward, index))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={updateMutation.isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending || selectedWards.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedWards.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}