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
import { Switch } from '@/shared/components/ui/switch';
import { departmentTypeApi } from '@/features/departments/api/departmentTypeApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditDepartmentTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditDepartmentTypeModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditDepartmentTypeModalProps) {
    const queryClient = useQueryClient();
    const [selectedDepartmentTypes, setSelectedDepartmentTypes] = useState([]);
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

    const { data: allDepartmentTypes = [] } = useQuery({
        queryKey: ['departmentTypes'],
        queryFn: departmentTypeApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedDepartmentTypes = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    departmentTypeApi.getById(id).then(response => response.data || response)
                );

                const departmentTypesData = await Promise.all(promises);

                const mappedDepartmentTypes = departmentTypesData.map(dt => ({
                    id: dt.id,
                    code: dt.code || '',
                    name: dt.name || '',
                    description: dt.description || '',
                    isActive: dt.isActive !== false,
                }));

                setSelectedDepartmentTypes(mappedDepartmentTypes);
            } catch (error) {
                console.error('Error loading pre-selected department types:', error);
                toast.error('Không thể tải thông tin loại phòng ban');
            }
        };

        loadPreSelectedDepartmentTypes();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // Gọi API update từng item một vì chưa có API bulk
            const promises = payload.map(item => 
                departmentTypeApi.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                    isActive: item.isActive
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedDepartmentTypes.length} loại phòng ban`);
            queryClient.invalidateQueries({ queryKey: ['departmentTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật loại phòng ban');
        },
    });

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

            selectedDepartmentTypes.forEach(dt => {
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

            // Add validation
            const maxRow = Math.max(selectedDepartmentTypes.length + 1, 100);
            for (let i = 2; i <= maxRow; i++) {
                mainSheet.getCell(i, 4).dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [dropdownRange],
                };
            }

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

            saveAs(blob, `Chinh_sua_loai_phong_ban_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedDepartmentTypes.length} loại phòng ban`);
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

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!code || !name) return;

                importedDepartmentTypes.push({
                    code,
                    name,
                    description: getCellValue(3),
                    isActive: getCellValue(4) !== 'Không hoạt động',
                });
            });

            if (importedDepartmentTypes.length === selectedDepartmentTypes.length) {
                setSelectedDepartmentTypes(prev => prev.map((dt, index) => ({
                    ...dt,
                    ...importedDepartmentTypes[index]
                })));
                toast.success(`Đã cập nhật ${importedDepartmentTypes.length} loại phòng ban từ file`);
            } else {
                toast.warning(`File có ${importedDepartmentTypes.length} dòng nhưng đang chỉnh sửa ${selectedDepartmentTypes.length} loại phòng ban`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddDepartmentType = async (id: number) => {
        if (selectedDepartmentTypes.find(dt => dt.id === id)) {
            toast.error('Loại phòng ban này đã được thêm');
            return;
        }

        try {
            const response = await departmentTypeApi.getById(id);
            const departmentTypeData = response.data || response;

            setSelectedDepartmentTypes(prev => [...prev, {
                id: departmentTypeData.id,
                code: departmentTypeData.code || '',
                name: departmentTypeData.name || '',
                description: departmentTypeData.description || '',
                isActive: departmentTypeData.isActive !== false,
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching department type:', error);
            toast.error('Không thể tải thông tin loại phòng ban');
        }
    };

    const handleRemoveDepartmentType = (id: number) => {
        setSelectedDepartmentTypes(prev => prev.filter(dt => dt.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedDepartmentTypes(prev =>
            prev.map(dt =>
                dt.id === id ? { ...dt, [field]: value } : dt
            )
        );
    };

    const handleSubmit = () => {
        if (selectedDepartmentTypes.length === 0) {
            toast.error('Vui lòng chọn ít nhất một loại phòng ban');
            return;
        }

        const invalidDepartmentTypes = selectedDepartmentTypes.filter(dt => !dt.code || !dt.name);

        if (invalidDepartmentTypes.length > 0) {
            toast.error('Vui lòng điền đầy đủ mã và tên loại phòng ban cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedDepartmentTypes);
    };

    const handleClose = () => {
        setSelectedDepartmentTypes([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredDepartmentTypes = allDepartmentTypes.filter(dt =>
        dt.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        dt.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (departmentType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={departmentType[field]}
                        onChange={(e) => handleFieldChange(departmentType.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã loại phòng ban' : 'Tên loại phòng ban'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={departmentType.description}
                        onChange={(e) => handleFieldChange(departmentType.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả"
                    />
                );
            case 'isActive':
                return (
                    <div className="flex items-center justify-center">
                        <Switch
                            checked={departmentType.isActive}
                            onCheckedChange={(checked) => handleFieldChange(departmentType.id, 'isActive', checked)}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderDepartmentTypeFieldsExpanded = (departmentType, index) => (
        <div key={departmentType.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {departmentType.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDepartmentType(departmentType.id)}
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
                        onChange={(e) => handleFieldChange(departmentType.id, 'code', e.target.value)}
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
                        onChange={(e) => handleFieldChange(departmentType.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phòng ban, Bộ phận..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={departmentType.description}
                        onChange={(e) => handleFieldChange(departmentType.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về loại phòng ban..."
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={departmentType.isActive}
                        onCheckedChange={(checked) => handleFieldChange(departmentType.id, 'isActive', checked)}
                    />
                    <Label className="text-xs cursor-pointer">Hoạt động</Label>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa loại phòng ban hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn loại phòng ban để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã loại phòng ban..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm loại phòng ban..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy loại phòng ban.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredDepartmentTypes.map((departmentType) => (
                                                <CommandItem
                                                    key={departmentType.id}
                                                    value={departmentType.name}
                                                    onSelect={() => handleAddDepartmentType(departmentType.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedDepartmentTypes.find(dt => dt.id === departmentType.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{departmentType.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Mã: {departmentType.code}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedDepartmentTypes.length > 0 && (
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
                                Đã chọn: <b>{selectedDepartmentTypes.length}</b> loại phòng ban
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedDepartmentTypes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có loại phòng ban nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                            <TableHead className="whitespace-nowrap text-center">Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedDepartmentTypes.map((departmentType, index) => (
                                            <>
                                                <TableRow key={departmentType.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(departmentType.id)}
                                                                title={expandedRows.has(departmentType.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(departmentType.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDepartmentType(departmentType.id)}
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
                                                {expandedRows.has(departmentType.id) && (
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
                                {selectedDepartmentTypes.map((departmentType, index) => renderDepartmentTypeFieldsExpanded(departmentType, index))}
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
                        disabled={updateMutation.isPending || selectedDepartmentTypes.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedDepartmentTypes.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}