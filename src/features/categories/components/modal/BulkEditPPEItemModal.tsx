import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
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
import { ppeItemApi } from '@/features/safety/api/ppeItemApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditPPEItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

// ✅ Helper: Retry với Exponential Backoff
const retryRequest = async (
    fn: () => Promise<any>,
    maxRetries = 3,
    delayMs = 1000
): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error: any) {
            const isDeadlock = error?.message?.includes('Deadlock') ||
                error?.response?.data?.message?.includes('Deadlock');
            const isLastRetry = i === maxRetries - 1;

            if (isDeadlock && !isLastRetry) {
                const waitTime = delayMs * Math.pow(2, i);
                console.warn(`⚠️ Deadlock detected, retry ${i + 1}/${maxRetries} after ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
                throw error;
            }
        }
    }
};

export default function BulkEditPPEItemModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditPPEItemModalProps) {
    const queryClient = useQueryClient();
    const [selectedPPEItems, setSelectedPPEItems] = useState([]);
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

    // Fetch data
    const { data: allPPEItems = [] } = useQuery({
        queryKey: ['ppeItems'],
        queryFn: ppeItemApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedPPEItems = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    ppeItemApi.getById(id).then(response => response.data || response)
                );

                const ppeItemsData = await Promise.all(promises);

                const mappedPPEItems = ppeItemsData.map(item => ({
                    id: item.id,
                    name: item.name || '',
                    size: item.size || '',
                    description: item.description || '',
                }));

                setSelectedPPEItems(mappedPPEItems);
            } catch (error) {
                console.error('Error loading pre-selected PPE items:', error);
                toast.error('Không thể tải thông tin đồ bảo hộ');
            }
        };

        loadPreSelectedPPEItems();
    }, [isOpen, preSelectedIds]);

    // ✅ Sequential update với retry
    const updatePPEItemsSequentially = async (items: any[]) => {
        const results = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const result = await retryRequest(() => ppeItemApi.update(items[i].id, {
                    name: (items[i].name || '').trim(),
                    size: (items[i].size || '').trim() || undefined,
                    description: (items[i].description || '').trim() || undefined,
                }));
                results.push(result);

                if (i < items.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`❌ Lỗi cập nhật đồ bảo hộ ${i + 1}:`, error);
                throw error;
            }
        }
        return results;
    };

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // ✅ Sequential update thay vì Promise.all
            return await updatePPEItemsSequentially(payload);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedPPEItems.length} đồ bảo hộ`);
            queryClient.invalidateQueries({ queryKey: ['ppeItems'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật đồ bảo hộ');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Đồ bảo hộ');

            const columns = [
                { header: 'Tên đồ bảo hộ *', key: 'name', width: 30 },
                { header: 'Kích cỡ', key: 'size', width: 15 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedPPEItems.forEach(item => {
                mainSheet.addRow({
                    name: item.name,
                    size: item.size,
                    description: item.description,
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

            saveAs(blob, `Chinh_sua_do_bao_ho_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedPPEItems.length} đồ bảo hộ`);
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

            const worksheet = workbook.getWorksheet('Đồ bảo hộ');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Đồ bảo hộ"');
            }

            const importedPPEItems: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedPPEItems.push({
                    name,
                    size: getCellValue(2),
                    description: getCellValue(3),
                });
            });

            if (importedPPEItems.length === selectedPPEItems.length) {
                setSelectedPPEItems(prev => prev.map((item, index) => ({
                    ...item,
                    ...importedPPEItems[index]
                })));
                toast.success(`Đã cập nhật ${importedPPEItems.length} đồ bảo hộ từ file`);
            } else {
                toast.warning(`File có ${importedPPEItems.length} dòng nhưng đang chỉnh sửa ${selectedPPEItems.length} đồ bảo hộ`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddPPEItem = async (id: number) => {
        if (selectedPPEItems.find(d => d.id === id)) {
            toast.error('Đồ bảo hộ này đã được thêm');
            return;
        }

        try {
            const response = await ppeItemApi.getById(id);
            const ppeItemData = response.data || response;

            setSelectedPPEItems(prev => [...prev, {
                id: ppeItemData.id,
                name: ppeItemData.name || '',
                size: ppeItemData.size || '',
                description: ppeItemData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching PPE item:', error);
            toast.error('Không thể tải thông tin đồ bảo hộ');
        }
    };

    const handleRemovePPEItem = (id: number) => {
        setSelectedPPEItems(prev => prev.filter(d => d.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedPPEItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = () => {
        if (selectedPPEItems.length === 0) {
            toast.error('Vui lòng chọn ít nhất một đồ bảo hộ');
            return;
        }

        // ✅ Validate: Kiểm tra tên không được trống
        const invalidNames = selectedPPEItems.filter(item => {
            const name = (item.name || '').trim();
            return !name;
        });

        if (invalidNames.length > 0) {
            toast.error('Vui lòng điền tên đồ bảo hộ cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedPPEItems);
    };

    const handleClose = () => {
        setSelectedPPEItems([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredPPEItems = allPPEItems.filter(item =>
        item.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.size?.toLowerCase().includes(searchValue.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (item, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
            case 'size':
                return (
                    <Input
                        value={item[field]}
                        onChange={(e) => handleFieldChange(item.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'name' ? 'Tên đồ bảo hộ' : 'Kích cỡ'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={item.description}
                        onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderPPEItemFieldsExpanded = (item, index) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {item.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePPEItem(item.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên đồ bảo hộ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={item.name}
                        onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Mũ bảo hiểm, Găng tay..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Kích cỡ</Label>
                    <Input
                        value={item.size}
                        onChange={(e) => handleFieldChange(item.id, 'size', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: M, L, XL, Free size..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={item.description}
                        onChange={(e) => handleFieldChange(item.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về đồ bảo hộ..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa đồ bảo hộ hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn đồ bảo hộ để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Tìm kiếm đồ bảo hộ..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm đồ bảo hộ..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy đồ bảo hộ.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredPPEItems.map((item) => (
                                                <CommandItem
                                                    key={item.id}
                                                    value={item.name}
                                                    onSelect={() => handleAddPPEItem(item.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedPPEItems.find(d => d.id === item.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.name}</span>
                                                        {item.size && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Kích cỡ: {item.size}
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

                    {selectedPPEItems.length > 0 && (
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
                                Đã chọn: <b>{selectedPPEItems.length}</b> đồ bảo hộ
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedPPEItems.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có đồ bảo hộ nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên đồ bảo hộ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Kích cỡ</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedPPEItems.map((item, index) => (
                                            <>
                                                <TableRow key={item.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(item.id)}
                                                                title={expandedRows.has(item.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(item.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePPEItem(item.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(item, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(item, 'size')}</TableCell>
                                                    <TableCell>{renderTableCell(item, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(item.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderPPEItemFieldsExpanded(item, index)}
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
                                {selectedPPEItems.map((item, index) => renderPPEItemFieldsExpanded(item, index))}
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
                        disabled={updateMutation.isPending || selectedPPEItems.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedPPEItems.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}