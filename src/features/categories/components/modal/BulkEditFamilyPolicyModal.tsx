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
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditFamilyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditFamilyPolicyModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditFamilyPolicyModalProps) {
    const queryClient = useQueryClient();
    const [selectedFamilyPolicies, setSelectedFamilyPolicies] = useState([]);
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

    const { data: allFamilyPolicies = [] } = useQuery({
        queryKey: ['policyFamilies'],
        queryFn: () => categoriesApi.policyFamily.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedFamilyPolicies = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.policyFamily.getById(id).then(response => response.data || response)
                );

                const familyPoliciesData = await Promise.all(promises);

                const mappedFamilyPolicies = familyPoliciesData.map(fp => ({
                    id: fp.id,
                    code: fp.code || '',
                    name: fp.name || '',
                    description: fp.description || '',
                }));

                setSelectedFamilyPolicies(mappedFamilyPolicies);
            } catch (error) {
                console.error('Error loading pre-selected family policies:', error);
                toast.error('Không thể tải thông tin gia đình chính sách');
            }
        };

        loadPreSelectedFamilyPolicies();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.policyFamily.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedFamilyPolicies.length} gia đình chính sách`);
            queryClient.invalidateQueries({ queryKey: ['policyFamilies'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật gia đình chính sách');
        },
    });

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

            selectedFamilyPolicies.forEach(fp => {
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

            saveAs(blob, `Chinh_sua_gia_dinh_chinh_sach_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedFamilyPolicies.length} gia đình chính sách`);
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

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedFamilyPolicies.push({
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedFamilyPolicies.length === selectedFamilyPolicies.length) {
                setSelectedFamilyPolicies(prev => prev.map((fp, index) => ({
                    ...fp,
                    ...importedFamilyPolicies[index]
                })));
                toast.success(`Đã cập nhật ${importedFamilyPolicies.length} gia đình chính sách từ file`);
            } else {
                toast.warning(`File có ${importedFamilyPolicies.length} dòng nhưng đang chỉnh sửa ${selectedFamilyPolicies.length} gia đình chính sách`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddFamilyPolicy = async (id: number) => {
        if (selectedFamilyPolicies.find(fp => fp.id === id)) {
            toast.error('Gia đình chính sách này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.policyFamily.getById(id);
            const familyPolicyData = response.data || response;

            setSelectedFamilyPolicies(prev => [...prev, {
                id: familyPolicyData.id,
                code: familyPolicyData.code || '',
                name: familyPolicyData.name || '',
                description: familyPolicyData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching family policy:', error);
            toast.error('Không thể tải thông tin gia đình chính sách');
        }
    };

    const handleRemoveFamilyPolicy = (id: number) => {
        setSelectedFamilyPolicies(prev => prev.filter(fp => fp.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedFamilyPolicies(prev =>
            prev.map(fp =>
                fp.id === id ? { ...fp, [field]: value } : fp
            )
        );
    };

    const handleSubmit = () => {
        if (selectedFamilyPolicies.length === 0) {
            toast.error('Vui lòng chọn ít nhất một gia đình chính sách');
            return;
        }

        const invalidFamilyPolicies = selectedFamilyPolicies.filter(fp => !fp.name);

        if (invalidFamilyPolicies.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên gia đình chính sách cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedFamilyPolicies);
    };

    const handleClose = () => {
        setSelectedFamilyPolicies([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredFamilyPolicies = allFamilyPolicies.filter(fp =>
        fp.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        fp.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (familyPolicy, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={familyPolicy[field]}
                        onChange={(e) => handleFieldChange(familyPolicy.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã chính sách' : 'Tên gia đình chính sách'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={familyPolicy.description}
                        onChange={(e) => handleFieldChange(familyPolicy.id, 'description', e.target.value)}
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
        <div key={familyPolicy.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {familyPolicy.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFamilyPolicy(familyPolicy.id)}
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
                        onChange={(e) => handleFieldChange(familyPolicy.id, 'code', e.target.value)}
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
                        onChange={(e) => handleFieldChange(familyPolicy.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Gia đình liệt sĩ, Thương binh..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={familyPolicy.description}
                        onChange={(e) => handleFieldChange(familyPolicy.id, 'description', e.target.value)}
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
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa gia đình chính sách hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn gia đình chính sách để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã gia đình chính sách..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm gia đình chính sách..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy gia đình chính sách.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredFamilyPolicies.map((familyPolicy) => (
                                                <CommandItem
                                                    key={familyPolicy.id}
                                                    value={familyPolicy.name}
                                                    onSelect={() => handleAddFamilyPolicy(familyPolicy.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedFamilyPolicies.find(fp => fp.id === familyPolicy.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{familyPolicy.name}</span>
                                                        {familyPolicy.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {familyPolicy.code}
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

                    {selectedFamilyPolicies.length > 0 && (
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
                                Đã chọn: <b>{selectedFamilyPolicies.length}</b> gia đình chính sách
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedFamilyPolicies.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có gia đình chính sách nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã chính sách</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên gia đình chính sách *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedFamilyPolicies.map((familyPolicy, index) => (
                                            <>
                                                <TableRow key={familyPolicy.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(familyPolicy.id)}
                                                                title={expandedRows.has(familyPolicy.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(familyPolicy.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveFamilyPolicy(familyPolicy.id)}
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
                                                {expandedRows.has(familyPolicy.id) && (
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
                                {selectedFamilyPolicies.map((familyPolicy, index) => renderFamilyPolicyFieldsExpanded(familyPolicy, index))}
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
                        disabled={updateMutation.isPending || selectedFamilyPolicies.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedFamilyPolicies.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}