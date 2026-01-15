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
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditTrainingInstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditTrainingInstitutionModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditTrainingInstitutionModalProps) {
    const queryClient = useQueryClient();
    const [selectedInstitutions, setSelectedInstitutions] = useState([]);
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

    const { data: allInstitutions = [] } = useQuery({
        queryKey: ['trainingInstitutions'],
        queryFn: () => categoriesApi.trainingInstitution.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedInstitutions = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.trainingInstitution.getById(id).then(response => response.data || response)
                );

                const institutionsData = await Promise.all(promises);

                const mappedInstitutions = institutionsData.map(inst => ({
                    id: inst.id,
                    name: inst.name || '',
                    address: inst.address || '',
                    phone: inst.phone || '',
                    email: inst.email || '',
                }));

                setSelectedInstitutions(mappedInstitutions);
            } catch (error) {
                console.error('Error loading pre-selected institutions:', error);
                toast.error('Không thể tải thông tin cơ sở đào tạo');
            }
        };

        loadPreSelectedInstitutions();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.trainingInstitution.update(item.id, {
                    name: item.name,
                    address: item.address,
                    phone: item.phone,
                    email: item.email,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedInstitutions.length} cơ sở đào tạo`);
            queryClient.invalidateQueries({ queryKey: ['trainingInstitutions'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật cơ sở đào tạo');
        },
    });

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

            selectedInstitutions.forEach(inst => {
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

            saveAs(blob, `Chinh_sua_co_so_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedInstitutions.length} cơ sở đào tạo`);
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

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedInstitutions.push({
                    name,
                    address: getCellValue(2),
                    phone: getCellValue(3),
                    email: getCellValue(4),
                });
            });

            if (importedInstitutions.length === selectedInstitutions.length) {
                setSelectedInstitutions(prev => prev.map((inst, index) => ({
                    ...inst,
                    ...importedInstitutions[index]
                })));
                toast.success(`Đã cập nhật ${importedInstitutions.length} cơ sở đào tạo từ file`);
            } else {
                toast.warning(`File có ${importedInstitutions.length} dòng nhưng đang chỉnh sửa ${selectedInstitutions.length} cơ sở đào tạo`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddInstitution = async (id: number) => {
        if (selectedInstitutions.find(inst => inst.id === id)) {
            toast.error('Cơ sở đào tạo này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.trainingInstitution.getById(id);
            const institutionData = response.data || response;

            setSelectedInstitutions(prev => [...prev, {
                id: institutionData.id,
                name: institutionData.name || '',
                address: institutionData.address || '',
                phone: institutionData.phone || '',
                email: institutionData.email || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching institution:', error);
            toast.error('Không thể tải thông tin cơ sở đào tạo');
        }
    };

    const handleRemoveInstitution = (id: number) => {
        setSelectedInstitutions(prev => prev.filter(inst => inst.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedInstitutions(prev =>
            prev.map(inst =>
                inst.id === id ? { ...inst, [field]: value } : inst
            )
        );
    };

    const handleSubmit = () => {
        if (selectedInstitutions.length === 0) {
            toast.error('Vui lòng chọn ít nhất một cơ sở đào tạo');
            return;
        }

        const invalidInstitutions = selectedInstitutions.filter(inst => !inst.name);

        if (invalidInstitutions.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên cơ sở đào tạo cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedInstitutions);
    };

    const handleClose = () => {
        setSelectedInstitutions([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredInstitutions = allInstitutions.filter(inst =>
        inst.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        inst.address?.toLowerCase().includes(searchValue.toLowerCase()) ||
        inst.phone?.toLowerCase().includes(searchValue.toLowerCase()) ||
        inst.email?.toLowerCase().includes(searchValue.toLowerCase())
    );

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
                        onChange={(e) => handleFieldChange(institution.id, field, e.target.value)}
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
        <div key={institution.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {institution.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInstitution(institution.id)}
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
                        onChange={(e) => handleFieldChange(institution.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Đại học Bách Khoa Hà Nội..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Địa chỉ</Label>
                    <Input
                        value={institution.address}
                        onChange={(e) => handleFieldChange(institution.id, 'address', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Số điện thoại</Label>
                    <Input
                        value={institution.phone}
                        onChange={(e) => handleFieldChange(institution.id, 'phone', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: 0243 868 3008"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Email</Label>
                    <Input
                        value={institution.email}
                        onChange={(e) => handleFieldChange(institution.id, 'email', e.target.value)}
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
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa cơ sở đào tạo hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn cơ sở đào tạo để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên, địa chỉ hoặc email cơ sở đào tạo..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm cơ sở đào tạo..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy cơ sở đào tạo.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredInstitutions.map((institution) => (
                                                <CommandItem
                                                    key={institution.id}
                                                    value={institution.name}
                                                    onSelect={() => handleAddInstitution(institution.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedInstitutions.find(i => i.id === institution.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{institution.name}</span>
                                                        {institution.email && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {institution.email}
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

                    {selectedInstitutions.length > 0 && (
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
                                Đã chọn: <b>{selectedInstitutions.length}</b> cơ sở đào tạo
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedInstitutions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có cơ sở đào tạo nào được chọn</p>
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-24 text-center sticky left-12 bg-background z-10">
                                                Thao tác
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">Tên cơ sở đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Địa chỉ</TableHead>
                                            <TableHead className="whitespace-nowrap">Số điện thoại</TableHead>
                                            <TableHead className="whitespace-nowrap">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInstitutions.map((institution, index) => (
                                            <React.Fragment key={institution.id}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(institution.id)}
                                                                title={expandedRows.has(institution.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(institution.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveInstitution(institution.id)}
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
                                                {expandedRows.has(institution.id) && (
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
                                {selectedInstitutions.map((institution, index) => renderInstitutionFieldsExpanded(institution, index))}
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
                        disabled={updateMutation.isPending || selectedInstitutions.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedInstitutions.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}