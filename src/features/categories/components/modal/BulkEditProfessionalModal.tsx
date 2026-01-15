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

interface BulkEditProfessionalLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditProfessionalLevelModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditProfessionalLevelModalProps) {
    const queryClient = useQueryClient();
    const [selectedProfessionalLevels, setSelectedProfessionalLevels] = useState([]);
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

    const { data: allProfessionalLevels = [] } = useQuery({
        queryKey: ['professionalLevels'],
        queryFn: () => categoriesApi.professionalLevel.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedProfessionalLevels = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.professionalLevel.getById(id).then(response => response.data || response)
                );

                const professionalLevelsData = await Promise.all(promises);

                const mappedProfessionalLevels = professionalLevelsData.map(pl => ({
                    id: pl.id,
                    code: pl.code || '',
                    name: pl.name || '',
                    description: pl.description || '',
                }));

                setSelectedProfessionalLevels(mappedProfessionalLevels);
            } catch (error) {
                console.error('Error loading pre-selected professional levels:', error);
                toast.error('Không thể tải thông tin trình độ chuyên môn');
            }
        };

        loadPreSelectedProfessionalLevels();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.professionalLevel.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedProfessionalLevels.length} trình độ chuyên môn`);
            queryClient.invalidateQueries({ queryKey: ['professionalLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật trình độ chuyên môn');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Trình độ chuyên môn');

            const columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ chuyên môn *', key: 'name', width: 35 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedProfessionalLevels.forEach(pl => {
                mainSheet.addRow({
                    code: pl.code,
                    name: pl.name,
                    description: pl.description,
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

            saveAs(blob, `Chinh_sua_trinh_do_chuyen_mon_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedProfessionalLevels.length} trình độ chuyên môn`);
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

            const worksheet = workbook.getWorksheet('Trình độ chuyên môn');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ chuyên môn"');
            }

            const importedProfessionalLevels: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedProfessionalLevels.push({
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedProfessionalLevels.length === selectedProfessionalLevels.length) {
                setSelectedProfessionalLevels(prev => prev.map((pl, index) => ({
                    ...pl,
                    ...importedProfessionalLevels[index]
                })));
                toast.success(`Đã cập nhật ${importedProfessionalLevels.length} trình độ chuyên môn từ file`);
            } else {
                toast.warning(`File có ${importedProfessionalLevels.length} dòng nhưng đang chỉnh sửa ${selectedProfessionalLevels.length} trình độ chuyên môn`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddProfessionalLevel = async (id: number) => {
        if (selectedProfessionalLevels.find(pl => pl.id === id)) {
            toast.error('Trình độ chuyên môn này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.professionalLevel.getById(id);
            const professionalLevelData = response.data || response;

            setSelectedProfessionalLevels(prev => [...prev, {
                id: professionalLevelData.id,
                code: professionalLevelData.code || '',
                name: professionalLevelData.name || '',
                description: professionalLevelData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching professional level:', error);
            toast.error('Không thể tải thông tin trình độ chuyên môn');
        }
    };

    const handleRemoveProfessionalLevel = (id: number) => {
        setSelectedProfessionalLevels(prev => prev.filter(pl => pl.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedProfessionalLevels(prev =>
            prev.map(pl =>
                pl.id === id ? { ...pl, [field]: value } : pl
            )
        );
    };

    const handleSubmit = () => {
        if (selectedProfessionalLevels.length === 0) {
            toast.error('Vui lòng chọn ít nhất một trình độ chuyên môn');
            return;
        }

        const invalidProfessionalLevels = selectedProfessionalLevels.filter(pl => !pl.name);

        if (invalidProfessionalLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ chuyên môn cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedProfessionalLevels);
    };

    const handleClose = () => {
        setSelectedProfessionalLevels([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredProfessionalLevels = allProfessionalLevels.filter(pl =>
        pl.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        pl.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (professionalLevel, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={professionalLevel[field]}
                        onChange={(e) => handleFieldChange(professionalLevel.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ chuyên môn'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={professionalLevel.description}
                        onChange={(e) => handleFieldChange(professionalLevel.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderProfessionalLevelFieldsExpanded = (professionalLevel, index) => (
        <div key={professionalLevel.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {professionalLevel.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveProfessionalLevel(professionalLevel.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã trình độ
                    </Label>
                    <Input
                        value={professionalLevel.code}
                        onChange={(e) => handleFieldChange(professionalLevel.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: TDCM-01, KTV, CN, KS..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ chuyên môn <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={professionalLevel.name}
                        onChange={(e) => handleFieldChange(professionalLevel.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kỹ thuật viên, Công nhân..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={professionalLevel.description}
                        onChange={(e) => handleFieldChange(professionalLevel.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ chuyên môn..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa trình độ chuyên môn hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn trình độ chuyên môn để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã trình độ chuyên môn..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm trình độ chuyên môn..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy trình độ chuyên môn.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredProfessionalLevels.map((professionalLevel) => (
                                                <CommandItem
                                                    key={professionalLevel.id}
                                                    value={professionalLevel.name}
                                                    onSelect={() => handleAddProfessionalLevel(professionalLevel.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedProfessionalLevels.find(pl => pl.id === professionalLevel.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{professionalLevel.name}</span>
                                                        {professionalLevel.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {professionalLevel.code}
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

                    {selectedProfessionalLevels.length > 0 && (
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
                                Đã chọn: <b>{selectedProfessionalLevels.length}</b> trình độ chuyên môn
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedProfessionalLevels.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có trình độ chuyên môn nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã trình độ</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên trình độ chuyên môn *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedProfessionalLevels.map((professionalLevel, index) => (
                                            <>
                                                <TableRow key={professionalLevel.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(professionalLevel.id)}
                                                                title={expandedRows.has(professionalLevel.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(professionalLevel.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveProfessionalLevel(professionalLevel.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(professionalLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(professionalLevel.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderProfessionalLevelFieldsExpanded(professionalLevel, index)}
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
                                {selectedProfessionalLevels.map((professionalLevel, index) => renderProfessionalLevelFieldsExpanded(professionalLevel, index))}
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
                        disabled={updateMutation.isPending || selectedProfessionalLevels.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedProfessionalLevels.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}