// File: BulkEditSpecialtyModal.tsx
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
import { specialtyApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditSpecialtyModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditSpecialtyModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditSpecialtyModalProps) {
    const queryClient = useQueryClient();
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
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

    const { data: allSpecialties = [] } = useQuery({
        queryKey: ['specialties'],
        queryFn: () => specialtyApi.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedSpecialties = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    specialtyApi.getById(id).then(response => response.data || response)
                );

                const specialtiesData = await Promise.all(promises);

                const mappedSpecialties = specialtiesData.map(s => ({
                    id: s.id,
                    code: s.code || '',
                    name: s.name || '',
                    description: s.description || '',
                }));

                setSelectedSpecialties(mappedSpecialties);
            } catch (error) {
                console.error('Error loading pre-selected specialties:', error);
                toast.error('Không thể tải thông tin nghề nghiệp');
            }
        };

        loadPreSelectedSpecialties();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                specialtyApi.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedSpecialties.length} nghề nghiệp`);
            queryClient.invalidateQueries({ queryKey: ['specialties'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật nghề nghiệp');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Nghề nghiệp');

            const columns = [
                { header: 'Mã nghề nghiệp', key: 'code', width: 30 },
                { header: 'Tên nghề nghiệp *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedSpecialties.forEach(s => {
                mainSheet.addRow({
                    code: s.code,
                    name: s.name,
                    description: s.description,
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

            saveAs(blob, `Chinh_sua_nghe_nghiep_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedSpecialties.length} nghề nghiệp`);
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

            const worksheet = workbook.getWorksheet('Nghề nghiệp');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Nghề nghiệp"');
            }

            const importedSpecialties: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                importedSpecialties.push({
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedSpecialties.length === selectedSpecialties.length) {
                setSelectedSpecialties(prev => prev.map((s, index) => ({
                    ...s,
                    ...importedSpecialties[index]
                })));
                toast.success(`Đã cập nhật ${importedSpecialties.length} nghề nghiệp từ file`);
            } else {
                toast.warning(`File có ${importedSpecialties.length} dòng nhưng đang chỉnh sửa ${selectedSpecialties.length} nghề nghiệp`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddSpecialty = async (id: number) => {
        if (selectedSpecialties.find(s => s.id === id)) {
            toast.error('Nghề nghiệp này đã được thêm');
            return;
        }

        try {
            const response = await specialtyApi.getById(id);
            const specialtyData = response.data || response;

            setSelectedSpecialties(prev => [...prev, {
                id: specialtyData.id,
                code: specialtyData.code || '',
                name: specialtyData.name || '',
                description: specialtyData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching specialty:', error);
            toast.error('Không thể tải thông tin nghề nghiệp');
        }
    };

    const handleRemoveSpecialty = (id: number) => {
        setSelectedSpecialties(prev => prev.filter(s => s.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedSpecialties(prev =>
            prev.map(s =>
                s.id === id ? { ...s, [field]: value } : s
            )
        );
    };

    const handleSubmit = () => {
        if (selectedSpecialties.length === 0) {
            toast.error('Vui lòng chọn ít nhất một nghề nghiệp');
            return;
        }

        const invalidSpecialties = selectedSpecialties.filter(s => !s.name);

        if (invalidSpecialties.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên nghề nghiệp cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedSpecialties);
    };

    const handleClose = () => {
        setSelectedSpecialties([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredSpecialties = allSpecialties.filter(s =>
        s.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (specialty, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
                return (
                    <Input
                        value={specialty[field]}
                        onChange={(e) => handleFieldChange(specialty.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="NN-01"
                    />
                );
            case 'name':
                return (
                    <Input
                        value={specialty[field]}
                        onChange={(e) => handleFieldChange(specialty.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên nghề nghiệp"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={specialty.description}
                        onChange={(e) => handleFieldChange(specialty.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderSpecialtyFieldsExpanded = (specialty, index) => (
        <div key={specialty.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {specialty.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSpecialty(specialty.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã nghề nghiệp</Label>
                    <Input
                        value={specialty.code}
                        onChange={(e) => handleFieldChange(specialty.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: NN-01, IT-DEV..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên nghề nghiệp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={specialty.name}
                        onChange={(e) => handleFieldChange(specialty.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kỹ sư phần mềm, Quản lý nhân sự..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={specialty.description}
                        onChange={(e) => handleFieldChange(specialty.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về nghề nghiệp..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa nghề nghiệp hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn nghề nghiệp để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên nghề nghiệp..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm nghề nghiệp..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy nghề nghiệp.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredSpecialties.map((specialty) => (
                                                <CommandItem
                                                    key={specialty.id}
                                                    value={specialty.name}
                                                    onSelect={() => handleAddSpecialty(specialty.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedSpecialties.find(s => s.id === specialty.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="font-medium">{specialty.name}</span>
                                                    {specialty.code && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({specialty.code})
                                                        </span>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedSpecialties.length > 0 && (
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
                                Đã chọn: <b>{selectedSpecialties.length}</b> nghề nghiệp
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedSpecialties.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có nghề nghiệp nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã nghề nghiệp</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên nghề nghiệp *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedSpecialties.map((specialty, index) => (
                                            <>
                                                <TableRow key={specialty.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(specialty.id)}
                                                                title={expandedRows.has(specialty.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(specialty.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveSpecialty(specialty.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(specialty, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(specialty.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderSpecialtyFieldsExpanded(specialty, index)}
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
                                {selectedSpecialties.map((specialty, index) => renderSpecialtyFieldsExpanded(specialty, index))}
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
                        disabled={updateMutation.isPending || selectedSpecialties.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedSpecialties.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}