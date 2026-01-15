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

interface BulkEditITLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditITLevelModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditITLevelModalProps) {
    const queryClient = useQueryClient();
    const [selectedITLevels, setSelectedITLevels] = useState([]);
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

    const { data: allITLevels = [] } = useQuery({
        queryKey: ['itLevels'],
        queryFn: () => categoriesApi.itLevel.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedITLevels = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.itLevel.getById(id).then(response => response.data || response)
                );

                const itLevelsData = await Promise.all(promises);

                const mappedITLevels = itLevelsData.map(itl => ({
                    id: itl.id,
                    code: itl.code || '',
                    name: itl.name || '',
                    description: itl.description || '',
                }));

                setSelectedITLevels(mappedITLevels);
            } catch (error) {
                console.error('Error loading pre-selected IT levels:', error);
                toast.error('Không thể tải thông tin trình độ tin học');
            }
        };

        loadPreSelectedITLevels();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.itLevel.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedITLevels.length} trình độ tin học`);
            queryClient.invalidateQueries({ queryKey: ['itLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật trình độ tin học');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Trình độ tin học');

            const columns = [
                { header: 'Mã trình độ', key: 'code', width: 20 },
                { header: 'Tên trình độ tin học *', key: 'name', width: 35 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedITLevels.forEach(itl => {
                mainSheet.addRow({
                    code: itl.code,
                    name: itl.name,
                    description: itl.description,
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

            saveAs(blob, `Chinh_sua_trinh_do_tin_hoc_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedITLevels.length} trình độ tin học`);
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

            const worksheet = workbook.getWorksheet('Trình độ tin học');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ tin học"');
            }

            const importedITLevels: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedITLevels.push({
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedITLevels.length === selectedITLevels.length) {
                setSelectedITLevels(prev => prev.map((itl, index) => ({
                    ...itl,
                    ...importedITLevels[index]
                })));
                toast.success(`Đã cập nhật ${importedITLevels.length} trình độ tin học từ file`);
            } else {
                toast.warning(`File có ${importedITLevels.length} dòng nhưng đang chỉnh sửa ${selectedITLevels.length} trình độ tin học`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddITLevel = async (id: number) => {
        if (selectedITLevels.find(itl => itl.id === id)) {
            toast.error('Trình độ tin học này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.itLevel.getById(id);
            const itLevelData = response.data || response;

            setSelectedITLevels(prev => [...prev, {
                id: itLevelData.id,
                code: itLevelData.code || '',
                name: itLevelData.name || '',
                description: itLevelData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching IT level:', error);
            toast.error('Không thể tải thông tin trình độ tin học');
        }
    };

    const handleRemoveITLevel = (id: number) => {
        setSelectedITLevels(prev => prev.filter(itl => itl.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedITLevels(prev =>
            prev.map(itl =>
                itl.id === id ? { ...itl, [field]: value } : itl
            )
        );
    };

    const handleSubmit = () => {
        if (selectedITLevels.length === 0) {
            toast.error('Vui lòng chọn ít nhất một trình độ tin học');
            return;
        }

        const invalidITLevels = selectedITLevels.filter(itl => !itl.name);

        if (invalidITLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ tin học cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedITLevels);
    };

    const handleClose = () => {
        setSelectedITLevels([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredITLevels = allITLevels.filter(itl =>
        itl.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        itl.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (itLevel, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={itLevel[field]}
                        onChange={(e) => handleFieldChange(itLevel.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã trình độ' : 'Tên trình độ tin học'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={itLevel.description}
                        onChange={(e) => handleFieldChange(itLevel.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderITLevelFieldsExpanded = (itLevel, index) => (
        <div key={itLevel.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {itLevel.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveITLevel(itLevel.id)}
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
                        value={itLevel.code}
                        onChange={(e) => handleFieldChange(itLevel.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: TDTH-01, CB, KH, NC..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ tin học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={itLevel.name}
                        onChange={(e) => handleFieldChange(itLevel.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Cơ bản, Khá, Giỏi..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={itLevel.description}
                        onChange={(e) => handleFieldChange(itLevel.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ tin học..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa trình độ tin học hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn trình độ tin học để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã trình độ tin học..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm trình độ tin học..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy trình độ tin học.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredITLevels.map((itLevel) => (
                                                <CommandItem
                                                    key={itLevel.id}
                                                    value={itLevel.name}
                                                    onSelect={() => handleAddITLevel(itLevel.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedITLevels.find(itl => itl.id === itLevel.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{itLevel.name}</span>
                                                        {itLevel.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {itLevel.code}
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

                    {selectedITLevels.length > 0 && (
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
                                Đã chọn: <b>{selectedITLevels.length}</b> trình độ tin học
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedITLevels.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có trình độ tin học nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ tin học *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedITLevels.map((itLevel, index) => (
                                            <>
                                                <TableRow key={itLevel.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(itLevel.id)}
                                                                title={expandedRows.has(itLevel.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(itLevel.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveITLevel(itLevel.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(itLevel, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(itLevel.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderITLevelFieldsExpanded(itLevel, index)}
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
                                {selectedITLevels.map((itLevel, index) => renderITLevelFieldsExpanded(itLevel, index))}
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
                        disabled={updateMutation.isPending || selectedITLevels.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedITLevels.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}