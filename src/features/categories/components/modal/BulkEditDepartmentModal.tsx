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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { unitApi } from '@/features/departments/api/departmentApi';
import { departmentTypeApi } from '@/features/departments/api/departmentTypeApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditDepartmentModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditDepartmentModalProps) {
    const queryClient = useQueryClient();
    const [selectedDepartments, setSelectedDepartments] = useState([]);
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
    const { data: allDepartments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: unitApi.getAll,
    });

    const { data: departmentTypes = [] } = useQuery({
        queryKey: ['departmentTypes'],
        queryFn: departmentTypeApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedDepartments = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    unitApi.getById(id).then(response => response.data || response)
                );

                const departmentsData = await Promise.all(promises);

                const mappedDepartments = departmentsData.map(dept => ({
                    id: dept.id,
                    name: dept.name || '',
                    code: dept.code || '',
                    departmentTypeId: dept.departmentType?.id ? String(dept.departmentType.id) : '',
                    parentId: dept.parent?.id ? String(dept.parent.id) : '',
                }));

                setSelectedDepartments(mappedDepartments);
            } catch (error) {
                console.error('Error loading pre-selected departments:', error);
                toast.error('Không thể tải thông tin phòng ban');
            }
        };

        loadPreSelectedDepartments();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // ✅ Xử lý payload với company, trim, undefined/null
            const formattedPayload = {
                payload: payload.map(item => {
                    const code = (item.code || '').trim();
                    const parentId = item.parentId && item.parentId !== 'none'
                        ? Number(item.parentId)
                        : null;

                    return {
                        id: item.id,
                        company: { id: 2 }, // ✅ THÊM company
                        name: (item.name || '').trim(),
                        code: code || undefined, // ✅ undefined nếu trống
                        departmentType: item.departmentTypeId
                            ? { id: Number(item.departmentTypeId) }
                            : null,
                        parent: parentId ? { id: parentId } : null,
                        updatedAt: new Date().toISOString(),
                        deleted: false,
                    };
                })
            };

            console.log('Payload gửi lên:', JSON.stringify(formattedPayload, null, 2));
            const response = await unitApi.updateBulk(formattedPayload);
            return response;
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedDepartments.length} phòng ban`);
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật phòng ban');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Phòng ban');
            const dropdownSheet = workbook.addWorksheet('Danh mục');

            dropdownSheet.state = 'hidden';

            const columns = [
                { header: 'Mã phòng ban', key: 'code', width: 20 },
                { header: 'Tên phòng ban *', key: 'name', width: 30 },
                { header: 'Loại phòng ban', key: 'departmentType', width: 25 },
                { header: 'Phòng ban gốc', key: 'parent', width: 30 },
            ];

            mainSheet.columns = columns;

            selectedDepartments.forEach(dept => {
                const deptType = departmentTypes.find(dt => dt.id === Number(dept.departmentTypeId));
                const parentDept = allDepartments.find(d => d.id === Number(dept.parentId));

                mainSheet.addRow({
                    code: dept.code,
                    name: dept.name,
                    departmentType: deptType?.name || '',
                    parent: parentDept?.name || '',
                });
            });

            // Write dropdowns
            let colIndex = 1;
            const dropdownRanges = {};

            const writeDropdown = (data: any[], key: string) => {
                if (data && data.length > 0) {
                    dropdownSheet.getCell(1, colIndex).value = key;
                    data.forEach((item, idx) => {
                        dropdownSheet.getCell(idx + 2, colIndex).value = item.name || item;
                    });
                    const letter = String.fromCharCode(64 + colIndex);
                    dropdownRanges[key] = `'Danh mục'!$${letter}$2:$${letter}$${data.length + 1}`;
                    colIndex++;
                }
            };

            writeDropdown(departmentTypes, 'departmentType');
            writeDropdown(allDepartments, 'parent');

            // Add validation
            const addValidation = (columnKey: string, dropdownKey: string) => {
                const colNumber = columns.findIndex(col => col.key === columnKey) + 1;
                if (colNumber > 0 && dropdownRanges[dropdownKey]) {
                    const maxRow = Math.max(selectedDepartments.length + 1, 100);
                    for (let i = 2; i <= maxRow; i++) {
                        mainSheet.getCell(i, colNumber).dataValidation = {
                            type: 'list',
                            allowBlank: true,
                            formulae: [dropdownRanges[dropdownKey]],
                        };
                    }
                }
            };

            addValidation('departmentType', 'departmentType');
            addValidation('parent', 'parent');

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

            saveAs(blob, `Chinh_sua_phong_ban_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedDepartments.length} phòng ban`);
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

            const worksheet = workbook.getWorksheet('Phòng ban');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Phòng ban"');
            }

            const findIdByName = (list: any[], name: string) => {
                if (!name) return '';
                const found = list?.find(item =>
                    item.name?.toLowerCase().trim() === name?.toLowerCase().trim()
                );
                return found ? String(found.id) : '';
            };

            const importedDepartments: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                importedDepartments.push({
                    code: getCellValue(1),
                    name,
                    departmentTypeId: findIdByName(departmentTypes, getCellValue(3)),
                    parentId: findIdByName(allDepartments, getCellValue(4)) || '',
                });
            });

            if (importedDepartments.length === selectedDepartments.length) {
                setSelectedDepartments(prev => prev.map((dept, index) => ({
                    ...dept,
                    ...importedDepartments[index]
                })));
                toast.success(`Đã cập nhật ${importedDepartments.length} phòng ban từ file`);
            } else {
                toast.warning(`File có ${importedDepartments.length} dòng nhưng đang chỉnh sửa ${selectedDepartments.length} phòng ban`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddDepartment = async (id: number) => {
        if (selectedDepartments.find(d => d.id === id)) {
            toast.error('Phòng ban này đã được thêm');
            return;
        }

        try {
            const response = await unitApi.getById(id);
            const departmentData = response.data || response;

            setSelectedDepartments(prev => [...prev, {
                id: departmentData.id,
                name: departmentData.name || '',
                code: departmentData.code || '',
                departmentTypeId: departmentData.departmentType?.id ? String(departmentData.departmentType.id) : '',
                parentId: departmentData.parent?.id ? String(departmentData.parent.id) : '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching department:', error);
            toast.error('Không thể tải thông tin phòng ban');
        }
    };

    const handleRemoveDepartment = (id: number) => {
        setSelectedDepartments(prev => prev.filter(d => d.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedDepartments(prev =>
            prev.map(dept =>
                dept.id === id ? { ...dept, [field]: value } : dept
            )
        );
    };

    const handleSubmit = () => {
        if (selectedDepartments.length === 0) {
            toast.error('Vui lòng chọn ít nhất một phòng ban');
            return;
        }

        // ✅ Validate: Kiểm tra tên không được trống (sau khi trim)
        const invalidNames = selectedDepartments.filter(dept => {
            const name = (dept.name || '').trim();
            return !name;
        });

        if (invalidNames.length > 0) {
            toast.error('Vui lòng điền tên phòng ban cho tất cả các dòng');
            return;
        }

        // ✅ Validate: Kiểm tra loại phòng ban không được trống
        const missingTypes = selectedDepartments.filter(dept => !dept.departmentTypeId);
        if (missingTypes.length > 0) {
            toast.error('Vui lòng chọn loại phòng ban cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedDepartments);
    };

    const handleClose = () => {
        setSelectedDepartments([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredDepartments = allDepartments.filter(dept =>
        dept.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        dept.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (department, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={department[field]}
                        onChange={(e) => handleFieldChange(department.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã phòng ban' : 'Tên phòng ban'}
                    />
                );
            case 'departmentTypeId':
                return (
                    <Select
                        value={department.departmentTypeId}
                        onValueChange={(value) => handleFieldChange(department.id, 'departmentTypeId', value)}
                    >
                        <SelectTrigger className={commonInputClass}>
                            <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentTypes.map(dt => (
                                <SelectItem key={dt.id} value={String(dt.id)}>
                                    {dt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'parentId':
                return (
                    <Select
                        value={department.parentId || 'none'}
                        onValueChange={(value) => handleFieldChange(department.id, 'parentId', value === 'none' ? '' : value)}
                    >
                        <SelectTrigger className={commonInputClass}>
                            <SelectValue placeholder="Chọn phòng ban gốc" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Không có</SelectItem>
                            {allDepartments.filter(d => d.id !== department.id).map(d => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return null;
        }
    };

    const renderDepartmentFieldsExpanded = (department, index) => (
        <div key={department.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {department.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDepartment(department.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã phòng ban</Label>
                    <Input
                        value={department.code}
                        onChange={(e) => handleFieldChange(department.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: IT, HR, KT..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên phòng ban <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={department.name}
                        onChange={(e) => handleFieldChange(department.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phòng Công nghệ thông tin..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Loại phòng ban <span className="text-red-500">*</span></Label>
                    <Select
                        value={department.departmentTypeId}
                        onValueChange={(value) => handleFieldChange(department.id, 'departmentTypeId', value)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Chọn loại phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentTypes.map(dt => (
                                <SelectItem key={dt.id} value={String(dt.id)}>
                                    {dt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Phòng ban gốc</Label>
                    <Select
                        value={department.parentId || 'none'}
                        onValueChange={(value) => handleFieldChange(department.id, 'parentId', value === 'none' ? '' : value)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Chọn phòng ban gốc" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Không có (Phòng ban gốc)</SelectItem>
                            {allDepartments.filter(d => d.id !== department.id).map(d => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa phòng ban hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn phòng ban để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã phòng ban..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm phòng ban..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy phòng ban.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredDepartments.map((department) => (
                                                <CommandItem
                                                    key={department.id}
                                                    value={department.name}
                                                    onSelect={() => handleAddDepartment(department.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedDepartments.find(d => d.id === department.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{department.name}</span>
                                                        {department.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {department.code}
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

                    {selectedDepartments.length > 0 && (
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
                                Đã chọn: <b>{selectedDepartments.length}</b> phòng ban
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedDepartments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có phòng ban nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã phòng ban</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Phòng ban gốc</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedDepartments.map((department, index) => (
                                            <>
                                                <TableRow key={department.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(department.id)}
                                                                title={expandedRows.has(department.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(department.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDepartment(department.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(department, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'departmentTypeId')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'parentId')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(department.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            {renderDepartmentFieldsExpanded(department, index)}
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
                                {selectedDepartments.map((department, index) => renderDepartmentFieldsExpanded(department, index))}
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
                        disabled={updateMutation.isPending || selectedDepartments.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedDepartments.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}