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
import { nationalityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditNationalityModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditNationalityModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditNationalityModalProps) {
    const queryClient = useQueryClient();
    const [selectedNationalities, setSelectedNationalities] = useState([]);
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

    const { data: allNationalities = [] } = useQuery({
        queryKey: ['nationalities'],
        queryFn: nationalityApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedNationalities = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    nationalityApi.getById(id).then(response => response.data || response)
                );

                const nationalitiesData = await Promise.all(promises);

                const mappedNationalities = nationalitiesData.map(nat => ({
                    id: nat.id,
                    code: nat.code || '',
                    name: nat.name || '',
                }));

                setSelectedNationalities(mappedNationalities);
            } catch (error) {
                console.error('Error loading pre-selected nationalities:', error);
                toast.error('Không thể tải thông tin quốc tịch');
            }
        };

        loadPreSelectedNationalities();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                nationalityApi.update(item.id, {
                    code: item.code,
                    name: item.name,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedNationalities.length} quốc tịch`);
            queryClient.invalidateQueries({ queryKey: ['nationalities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật quốc tịch');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Quốc tịch');

            const columns = [
                { header: 'Mã quốc tịch', key: 'code', width: 20 },
                { header: 'Tên quốc tịch *', key: 'name', width: 30 },
            ];

            mainSheet.columns = columns;

            selectedNationalities.forEach(nat => {
                mainSheet.addRow({
                    code: nat.code,
                    name: nat.name,
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

            saveAs(blob, `Chinh_sua_quoc_tich_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedNationalities.length} quốc tịch`);
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

            const worksheet = workbook.getWorksheet('Quốc tịch');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Quốc tịch"');
            }

            const importedNationalities: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedNationalities.push({
                    code,
                    name,
                });
            });

            if (importedNationalities.length === selectedNationalities.length) {
                setSelectedNationalities(prev => prev.map((nat, index) => ({
                    ...nat,
                    ...importedNationalities[index]
                })));
                toast.success(`Đã cập nhật ${importedNationalities.length} quốc tịch từ file`);
            } else {
                toast.warning(`File có ${importedNationalities.length} dòng nhưng đang chỉnh sửa ${selectedNationalities.length} quốc tịch`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddNationality = async (id: number) => {
        if (selectedNationalities.find(nat => nat.id === id)) {
            toast.error('Quốc tịch này đã được thêm');
            return;
        }

        try {
            const response = await nationalityApi.getById(id);
            const nationalityData = response.data || response;

            setSelectedNationalities(prev => [...prev, {
                id: nationalityData.id,
                code: nationalityData.code || '',
                name: nationalityData.name || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching nationality:', error);
            toast.error('Không thể tải thông tin quốc tịch');
        }
    };

    const handleRemoveNationality = (id: number) => {
        setSelectedNationalities(prev => prev.filter(nat => nat.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedNationalities(prev =>
            prev.map(nat =>
                nat.id === id ? { ...nat, [field]: value } : nat
            )
        );
    };

    const handleSubmit = () => {
        if (selectedNationalities.length === 0) {
            toast.error('Vui lòng chọn ít nhất một quốc tịch');
            return;
        }

        const invalidNationalities = selectedNationalities.filter(nat => !nat.name);

        if (invalidNationalities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên quốc tịch cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedNationalities);
    };

    const handleClose = () => {
        setSelectedNationalities([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredNationalities = allNationalities.filter(nat =>
        nat.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        nat.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (nationality, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={nationality[field]}
                        onChange={(e) => handleFieldChange(nationality.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã quốc tịch' : 'Tên quốc tịch'}
                    />
                );
            default:
                return null;
        }
    };

    const renderNationalityFieldsExpanded = (nationality, index) => (
        <div key={nationality.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {nationality.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveNationality(nationality.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã quốc tịch
                    </Label>
                    <Input
                        value={nationality.code}
                        onChange={(e) => handleFieldChange(nationality.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: VN, US, JP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên quốc tịch <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={nationality.name}
                        onChange={(e) => handleFieldChange(nationality.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Việt Nam, Hoa Kỳ..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa quốc tịch hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn quốc tịch để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã quốc tịch..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm quốc tịch..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy quốc tịch.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredNationalities.map((nationality) => (
                                                <CommandItem
                                                    key={nationality.id}
                                                    value={nationality.name}
                                                    onSelect={() => handleAddNationality(nationality.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedNationalities.find(nat => nat.id === nationality.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{nationality.name}</span>
                                                        {nationality.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {nationality.code}
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

                    {selectedNationalities.length > 0 && (
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
                                Đã chọn: <b>{selectedNationalities.length}</b> quốc tịch
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedNationalities.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có quốc tịch nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã quốc tịch</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên quốc tịch *</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedNationalities.map((nationality, index) => (
                                            <>
                                                <TableRow key={nationality.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(nationality.id)}
                                                                title={expandedRows.has(nationality.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(nationality.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveNationality(nationality.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(nationality, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(nationality, 'name')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(nationality.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderNationalityFieldsExpanded(nationality, index)}
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
                                {selectedNationalities.map((nationality, index) => renderNationalityFieldsExpanded(nationality, index))}
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
                        disabled={updateMutation.isPending || selectedNationalities.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedNationalities.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}