// File: BulkEditLanguageLevelModal.tsx
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
import { languageLevelApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditLanguageLevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditLanguageLevelModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditLanguageLevelModalProps) {
    const queryClient = useQueryClient();
    const [selectedLevels, setSelectedLevels] = useState([]);
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

    const { data: allLevels = [] } = useQuery({
        queryKey: ['languageLevels'],
        queryFn: () => languageLevelApi.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedLevels = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    languageLevelApi.getById(id).then(response => response.data || response)
                );

                const levelsData = await Promise.all(promises);

                const mappedLevels = levelsData.map(l => ({
                    id: l.id,
                    name: l.name || '',
                    description: l.description || '',
                }));

                setSelectedLevels(mappedLevels);
            } catch (error) {
                console.error('Error loading pre-selected levels:', error);
                toast.error('Không thể tải thông tin trình độ ngoại ngữ');
            }
        };

        loadPreSelectedLevels();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                languageLevelApi.update(item.id, {
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedLevels.length} trình độ ngoại ngữ`);
            queryClient.invalidateQueries({ queryKey: ['languageLevels'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật trình độ ngoại ngữ');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Trình độ ngoại ngữ');

            const columns = [
                { header: 'Tên trình độ ngoại ngữ *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedLevels.forEach(l => {
                mainSheet.addRow({
                    name: l.name,
                    description: l.description,
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

            saveAs(blob, `Chinh_sua_trinh_do_ngoai_ngu_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedLevels.length} trình độ ngoại ngữ`);
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

            const worksheet = workbook.getWorksheet('Trình độ ngoại ngữ');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Trình độ ngoại ngữ"');
            }

            const importedLevels: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedLevels.push({
                    name,
                    description: getCellValue(2),
                });
            });

            if (importedLevels.length === selectedLevels.length) {
                setSelectedLevels(prev => prev.map((l, index) => ({
                    ...l,
                    ...importedLevels[index]
                })));
                toast.success(`Đã cập nhật ${importedLevels.length} trình độ ngoại ngữ từ file`);
            } else {
                toast.warning(`File có ${importedLevels.length} dòng nhưng đang chỉnh sửa ${selectedLevels.length} trình độ ngoại ngữ`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddLevel = async (id: number) => {
        if (selectedLevels.find(l => l.id === id)) {
            toast.error('Trình độ ngoại ngữ này đã được thêm');
            return;
        }

        try {
            const response = await languageLevelApi.getById(id);
            const levelData = response.data || response;

            setSelectedLevels(prev => [...prev, {
                id: levelData.id,
                name: levelData.name || '',
                description: levelData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching level:', error);
            toast.error('Không thể tải thông tin trình độ ngoại ngữ');
        }
    };

    const handleRemoveLevel = (id: number) => {
        setSelectedLevels(prev => prev.filter(l => l.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedLevels(prev =>
            prev.map(l =>
                l.id === id ? { ...l, [field]: value } : l
            )
        );
    };

    const handleSubmit = () => {
        if (selectedLevels.length === 0) {
            toast.error('Vui lòng chọn ít nhất một trình độ ngoại ngữ');
            return;
        }

        const invalidLevels = selectedLevels.filter(l => !l.name);

        if (invalidLevels.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên trình độ ngoại ngữ cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedLevels);
    };

    const handleClose = () => {
        setSelectedLevels([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredLevels = allLevels.filter(l =>
        l.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (level, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={level[field]}
                        onChange={(e) => handleFieldChange(level.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên trình độ ngoại ngữ"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={level.description}
                        onChange={(e) => handleFieldChange(level.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderLevelFieldsExpanded = (level, index) => (
        <div key={level.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {level.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLevel(level.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên trình độ ngoại ngữ <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={level.name}
                        onChange={(e) => handleFieldChange(level.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: A1, A2, B1, B2, C1, IELTS 6.0..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={level.description}
                        onChange={(e) => handleFieldChange(level.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về trình độ ngoại ngữ..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa trình độ ngoại ngữ hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn trình độ ngoại ngữ để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên trình độ ngoại ngữ..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm trình độ ngoại ngữ..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy trình độ ngoại ngữ.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredLevels.map((level) => (
                                                <CommandItem
                                                    key={level.id}
                                                    value={level.name}
                                                    onSelect={() => handleAddLevel(level.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedLevels.find(l => l.id === level.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="font-medium">{level.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedLevels.length > 0 && (
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
                                Đã chọn: <b>{selectedLevels.length}</b> trình độ ngoại ngữ
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedLevels.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có trình độ ngoại ngữ nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên trình độ ngoại ngữ *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedLevels.map((level, index) => (
                                            <>
                                                <TableRow key={level.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(level.id)}
                                                                title={expandedRows.has(level.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(level.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveLevel(level.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(level, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(level, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(level.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderLevelFieldsExpanded(level, index)}
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
                                {selectedLevels.map((level, index) => renderLevelFieldsExpanded(level, index))}
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
                        disabled={updateMutation.isPending || selectedLevels.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedLevels.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}