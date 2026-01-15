import { useState, useEffect, useRef } from 'react';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { categoriesApi } from '../../api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditLaborContractTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditLaborContractTypeModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditLaborContractTypeModalProps) {
    const queryClient = useQueryClient();
    const [selectedContractTypes, setSelectedContractTypes] = useState([]);
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

    useEffect(() => {
        const loadPreSelectedContractTypes = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.laborContractType.getById(id).then(response => response.data || response)
                );

                const contractTypesData = await Promise.all(promises);

                const mappedContractTypes = contractTypesData.map(ct => ({
                    id: ct.id,
                    name: ct.name || '',
                    code: ct.code || '',
                    description: ct.description || '',
                }));

                setSelectedContractTypes(mappedContractTypes);
            } catch (error) {
                console.error('Error loading pre-selected contract types:', error);
                toast.error('Không thể tải thông tin loại hợp đồng');
            }
        };

        loadPreSelectedContractTypes();
    }, [isOpen, preSelectedIds]);

    const { data: allContractTypes = [] } = useQuery({
        queryKey: ['laborContractTypes'],
        queryFn: categoriesApi.laborContractType.getAll,
    });

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API update từng item một vì chưa có API bulk
            const promises = payload.map(item => 
                categoriesApi.laborContractType.update(item.id, {
                    name: item.name,
                    code: item.code,
                    description: item.description
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedContractTypes.length} loại hợp đồng`);
            queryClient.invalidateQueries({ queryKey: ['laborContractTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật loại hợp đồng');
        },
    });

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

            selectedContractTypes.forEach(ct => {
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

            saveAs(blob, `Chinh_sua_loai_hop_dong_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedContractTypes.length} loại hợp đồng`);
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

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                importedContractTypes.push({
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedContractTypes.length === selectedContractTypes.length) {
                setSelectedContractTypes(prev => prev.map((ct, index) => ({
                    ...ct,
                    ...importedContractTypes[index]
                })));
                toast.success(`Đã cập nhật ${importedContractTypes.length} loại hợp đồng từ file`);
            } else {
                toast.warning(`File có ${importedContractTypes.length} dòng nhưng đang chỉnh sửa ${selectedContractTypes.length} loại hợp đồng`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddContractType = async (id: number) => {
        if (selectedContractTypes.find(ct => ct.id === id)) {
            toast.error('Loại hợp đồng này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.laborContractType.getById(id);
            const contractTypeData = response.data || response;

            setSelectedContractTypes(prev => [...prev, {
                id: contractTypeData.id,
                name: contractTypeData.name || '',
                code: contractTypeData.code || '',
                description: contractTypeData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching contract type:', error);
            toast.error('Không thể tải thông tin loại hợp đồng');
        }
    };

    const handleRemoveContractType = (id: number) => {
        setSelectedContractTypes(prev => prev.filter(ct => ct.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedContractTypes(prev =>
            prev.map(ct =>
                ct.id === id ? { ...ct, [field]: value } : ct
            )
        );
    };

    const handleSubmit = () => {
        if (selectedContractTypes.length === 0) {
            toast.error('Vui lòng chọn ít nhất một loại hợp đồng');
            return;
        }

        const invalidContractTypes = selectedContractTypes.filter(ct => !ct.name);

        if (invalidContractTypes.length > 0) {
            toast.error('Vui lòng điền tên loại hợp đồng cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedContractTypes);
    };

    const handleClose = () => {
        setSelectedContractTypes([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredContractTypes = allContractTypes.filter(ct =>
        ct.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        ct.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (contractType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={contractType[field]}
                        onChange={(e) => handleFieldChange(contractType.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã loại hợp đồng' : 'Tên loại hợp đồng'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={contractType.description}
                        onChange={(e) => handleFieldChange(contractType.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả"
                    />
                );
            default:
                return null;
        }
    };

    const renderContractTypeFieldsExpanded = (contractType, index) => (
        <div key={contractType.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {contractType.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveContractType(contractType.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã loại hợp đồng</Label>
                    <Input
                        value={contractType.code}
                        onChange={(e) => handleFieldChange(contractType.id, 'code', e.target.value)}
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
                        onChange={(e) => handleFieldChange(contractType.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Hợp đồng xác định thời hạn..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={contractType.description}
                        onChange={(e) => handleFieldChange(contractType.id, 'description', e.target.value)}
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
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa loại hợp đồng hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn loại hợp đồng để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã loại hợp đồng..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm loại hợp đồng..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy loại hợp đồng.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredContractTypes.map((contractType) => (
                                                <CommandItem
                                                    key={contractType.id}
                                                    value={contractType.name}
                                                    onSelect={() => handleAddContractType(contractType.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedContractTypes.find(ct => ct.id === contractType.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{contractType.name}</span>
                                                        {contractType.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {contractType.code}
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

                    {selectedContractTypes.length > 0 && (
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
                                Đã chọn: <b>{selectedContractTypes.length}</b> loại hợp đồng
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedContractTypes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có loại hợp đồng nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã loại hợp đồng</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên loại hợp đồng *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedContractTypes.map((contractType, index) => (
                                            <>
                                                <TableRow key={contractType.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(contractType.id)}
                                                                title={expandedRows.has(contractType.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(contractType.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveContractType(contractType.id)}
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
                                                {expandedRows.has(contractType.id) && (
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
                                {selectedContractTypes.map((contractType, index) => renderContractTypeFieldsExpanded(contractType, index))}
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
                        disabled={updateMutation.isPending || selectedContractTypes.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedContractTypes.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}