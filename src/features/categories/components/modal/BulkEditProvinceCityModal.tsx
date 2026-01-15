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
import { provinceCityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditProvinceCityModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditProvinceCityModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditProvinceCityModalProps) {
    const queryClient = useQueryClient();
    const [selectedProvinceCities, setSelectedProvinceCities] = useState([]);
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

    const { data: allProvinceCities = [] } = useQuery({
        queryKey: ['provinceCities'],
        queryFn: () => provinceCityApi.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedProvinceCities = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    provinceCityApi.getById(id).then(response => response.data || response)
                );

                const provinceCitiesData = await Promise.all(promises);

                const mappedProvinceCities = provinceCitiesData.map(pc => ({
                    id: pc.id,
                    code: pc.code || '',
                    name: pc.name || '',
                }));

                setSelectedProvinceCities(mappedProvinceCities);
            } catch (error) {
                console.error('Error loading pre-selected province cities:', error);
                toast.error('Không thể tải thông tin tỉnh/thành phố');
            }
        };

        loadPreSelectedProvinceCities();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                provinceCityApi.update(item.id, {
                    code: item.code,
                    name: item.name,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedProvinceCities.length} tỉnh/thành phố`);
            queryClient.invalidateQueries({ queryKey: ['provinceCities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật tỉnh/thành phố');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Tỉnh thành phố');

            const columns = [
                { header: 'Mã tỉnh/thành phố', key: 'code', width: 20 },
                { header: 'Tên tỉnh/thành phố *', key: 'name', width: 35 },
            ];

            mainSheet.columns = columns;

            selectedProvinceCities.forEach(pc => {
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

            saveAs(blob, `Chinh_sua_tinh_thanh_pho_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedProvinceCities.length} tỉnh/thành phố`);
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

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedProvinceCities.push({
                    code,
                    name,
                });
            });

            if (importedProvinceCities.length === selectedProvinceCities.length) {
                setSelectedProvinceCities(prev => prev.map((pc, index) => ({
                    ...pc,
                    ...importedProvinceCities[index]
                })));
                toast.success(`Đã cập nhật ${importedProvinceCities.length} tỉnh/thành phố từ file`);
            } else {
                toast.warning(`File có ${importedProvinceCities.length} dòng nhưng đang chỉnh sửa ${selectedProvinceCities.length} tỉnh/thành phố`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddProvinceCity = async (id: number) => {
        if (selectedProvinceCities.find(pc => pc.id === id)) {
            toast.error('Tỉnh/thành phố này đã được thêm');
            return;
        }

        try {
            const response = await provinceCityApi.getById(id);
            const provinceCityData = response.data || response;

            setSelectedProvinceCities(prev => [...prev, {
                id: provinceCityData.id,
                code: provinceCityData.code || '',
                name: provinceCityData.name || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching province city:', error);
            toast.error('Không thể tải thông tin tỉnh/thành phố');
        }
    };

    const handleRemoveProvinceCity = (id: number) => {
        setSelectedProvinceCities(prev => prev.filter(pc => pc.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedProvinceCities(prev =>
            prev.map(pc =>
                pc.id === id ? { ...pc, [field]: value } : pc
            )
        );
    };

    const handleSubmit = () => {
        if (selectedProvinceCities.length === 0) {
            toast.error('Vui lòng chọn ít nhất một tỉnh/thành phố');
            return;
        }

        const invalidProvinceCities = selectedProvinceCities.filter(pc => !pc.name);

        if (invalidProvinceCities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên tỉnh/thành phố cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedProvinceCities);
    };

    const handleClose = () => {
        setSelectedProvinceCities([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredProvinceCities = allProvinceCities.filter(pc =>
        pc.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        pc.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (provinceCity, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        return (
            <Input
                value={provinceCity[field]}
                onChange={(e) => handleFieldChange(provinceCity.id, field, e.target.value)}
                className={commonInputClass}
                placeholder={field === 'code' ? 'Mã tỉnh/thành phố' : 'Tên tỉnh/thành phố'}
            />
        );
    };

    const renderProvinceCityFieldsExpanded = (provinceCity, index) => (
        <div key={provinceCity.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {provinceCity.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProvinceCity(provinceCity.id)}
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
                        onChange={(e) => handleFieldChange(provinceCity.id, 'code', e.target.value)}
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
                        onChange={(e) => handleFieldChange(provinceCity.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Hà Nội, Hồ Chí Minh..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa tỉnh/thành phố hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn tỉnh/thành phố để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã tỉnh/thành phố..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm tỉnh/thành phố..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy tỉnh/thành phố.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredProvinceCities.map((provinceCity) => (
                                                <CommandItem
                                                    key={provinceCity.id}
                                                    value={provinceCity.name}
                                                    onSelect={() => handleAddProvinceCity(provinceCity.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedProvinceCities.find(pc => pc.id === provinceCity.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{provinceCity.name}</span>
                                                        {provinceCity.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {provinceCity.code}
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

                    {selectedProvinceCities.length > 0 && (
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
                                Đã chọn: <b>{selectedProvinceCities.length}</b> tỉnh/thành phố
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedProvinceCities.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có tỉnh/thành phố nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã tỉnh/thành phố</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên tỉnh/thành phố *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedProvinceCities.map((provinceCity, index) => (
                                            <>
                                                <TableRow key={provinceCity.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(provinceCity.id)}
                                                                title={expandedRows.has(provinceCity.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(provinceCity.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveProvinceCity(provinceCity.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(provinceCity, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(provinceCity, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(provinceCity.id) && (
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
                                {selectedProvinceCities.map((provinceCity, index) => renderProvinceCityFieldsExpanded(provinceCity, index))}
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
                        disabled={updateMutation.isPending || selectedProvinceCities.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedProvinceCities.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}