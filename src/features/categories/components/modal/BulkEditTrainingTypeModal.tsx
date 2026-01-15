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

interface BulkEditTrainingTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditTrainingTypeModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditTrainingTypeModalProps) {
    const queryClient = useQueryClient();
    const [selectedTrainingTypes, setSelectedTrainingTypes] = useState([]);
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

    const { data: allTrainingTypes = [] } = useQuery({
        queryKey: ['trainingTypes'],
        queryFn: () => categoriesApi.trainingType.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedTrainingTypes = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.trainingType.getById(id).then(response => response.data || response)
                );

                const trainingTypesData = await Promise.all(promises);

                const mappedTrainingTypes = trainingTypesData.map(tt => ({
                    id: tt.id,
                    name: tt.name || '',
                    description: tt.description || '',
                }));

                setSelectedTrainingTypes(mappedTrainingTypes);
            } catch (error) {
                console.error('Error loading pre-selected training types:', error);
                toast.error('Không thể tải thông tin hình thức đào tạo');
            }
        };

        loadPreSelectedTrainingTypes();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.trainingType.update(item.id, {
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedTrainingTypes.length} hình thức đào tạo`);
            queryClient.invalidateQueries({ queryKey: ['trainingTypes'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật hình thức đào tạo');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Hình thức đào tạo');

            const columns = [
                { header: 'Tên hình thức đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedTrainingTypes.forEach(tt => {
                mainSheet.addRow({
                    name: tt.name,
                    description: tt.description,
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

            saveAs(blob, `Chinh_sua_hinh_thuc_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedTrainingTypes.length} hình thức đào tạo`);
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

            const worksheet = workbook.getWorksheet('Hình thức đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Hình thức đào tạo"');
            }

            const importedTrainingTypes: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedTrainingTypes.push({
                    name,
                    description: getCellValue(2),
                });
            });

            if (importedTrainingTypes.length === selectedTrainingTypes.length) {
                setSelectedTrainingTypes(prev => prev.map((tt, index) => ({
                    ...tt,
                    ...importedTrainingTypes[index]
                })));
                toast.success(`Đã cập nhật ${importedTrainingTypes.length} hình thức đào tạo từ file`);
            } else {
                toast.warning(`File có ${importedTrainingTypes.length} dòng nhưng đang chỉnh sửa ${selectedTrainingTypes.length} hình thức đào tạo`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddTrainingType = async (id: number) => {
        if (selectedTrainingTypes.find(tt => tt.id === id)) {
            toast.error('Hình thức đào tạo này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.trainingType.getById(id);
            const trainingTypeData = response.data || response;

            setSelectedTrainingTypes(prev => [...prev, {
                id: trainingTypeData.id,
                name: trainingTypeData.name || '',
                description: trainingTypeData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching training type:', error);
            toast.error('Không thể tải thông tin hình thức đào tạo');
        }
    };

    const handleRemoveTrainingType = (id: number) => {
        setSelectedTrainingTypes(prev => prev.filter(tt => tt.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedTrainingTypes(prev =>
            prev.map(tt =>
                tt.id === id ? { ...tt, [field]: value } : tt
            )
        );
    };

    const handleSubmit = () => {
        if (selectedTrainingTypes.length === 0) {
            toast.error('Vui lòng chọn ít nhất một hình thức đào tạo');
            return;
        }

        const invalidTrainingTypes = selectedTrainingTypes.filter(tt => !tt.name);

        if (invalidTrainingTypes.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên hình thức đào tạo cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedTrainingTypes);
    };

    const handleClose = () => {
        setSelectedTrainingTypes([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredTrainingTypes = allTrainingTypes.filter(tt =>
        tt.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (trainingType, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={trainingType[field]}
                        onChange={(e) => handleFieldChange(trainingType.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên hình thức đào tạo"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={trainingType.description}
                        onChange={(e) => handleFieldChange(trainingType.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTrainingTypeFieldsExpanded = (trainingType, index) => (
        <div key={trainingType.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingType.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingType(trainingType.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên hình thức đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingType.name}
                        onChange={(e) => handleFieldChange(trainingType.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Chính quy, Tại chức, Từ xa..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingType.description}
                        onChange={(e) => handleFieldChange(trainingType.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về hình thức đào tạo..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa hình thức đào tạo hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn hình thức đào tạo để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hình thức đào tạo..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm hình thức đào tạo..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy hình thức đào tạo.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredTrainingTypes.map((trainingType) => (
                                                <CommandItem
                                                    key={trainingType.id}
                                                    value={trainingType.name}
                                                    onSelect={() => handleAddTrainingType(trainingType.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedTrainingTypes.find(tt => tt.id === trainingType.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="font-medium">{trainingType.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedTrainingTypes.length > 0 && (
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
                                Đã chọn: <b>{selectedTrainingTypes.length}</b> hình thức đào tạo
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedTrainingTypes.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có hình thức đào tạo nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên hình thức đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTrainingTypes.map((trainingType, index) => (
                                            <>
                                                <TableRow key={trainingType.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingType.id)}
                                                                title={expandedRows.has(trainingType.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(trainingType.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingType(trainingType.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingType, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingType, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingType.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderTrainingTypeFieldsExpanded(trainingType, index)}
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
                                {selectedTrainingTypes.map((trainingType, index) => renderTrainingTypeFieldsExpanded(trainingType, index))}
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
                        disabled={updateMutation.isPending || selectedTrainingTypes.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedTrainingTypes.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}