// File: BulkEditPoliticalTheoryModal.tsx
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
import { politicalTheoryApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditPoliticalTheoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditPoliticalTheoryModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditPoliticalTheoryModalProps) {
    const queryClient = useQueryClient();
    const [selectedTheories, setSelectedTheories] = useState([]);
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

    const { data: allTheories = [] } = useQuery({
        queryKey: ['politicalTheories'],
        queryFn: () => politicalTheoryApi.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedTheories = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    politicalTheoryApi.getById(id).then(response => response.data || response)
                );

                const theoriesData = await Promise.all(promises);

                const mappedTheories = theoriesData.map(t => ({
                    id: t.id,
                    name: t.name || '',
                    description: t.description || '',
                }));

                setSelectedTheories(mappedTheories);
            } catch (error) {
                console.error('Error loading pre-selected theories:', error);
                toast.error('Không thể tải thông tin lý luận chính trị');
            }
        };

        loadPreSelectedTheories();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                politicalTheoryApi.update(item.id, {
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedTheories.length} lý luận chính trị`);
            queryClient.invalidateQueries({ queryKey: ['politicalTheories'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật lý luận chính trị');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Lý luận chính trị');

            const columns = [
                { header: 'Tên lý luận chính trị *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedTheories.forEach(t => {
                mainSheet.addRow({
                    name: t.name,
                    description: t.description,
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

            saveAs(blob, `Chinh_sua_ly_luan_chinh_tri_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedTheories.length} lý luận chính trị`);
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

            const worksheet = workbook.getWorksheet('Lý luận chính trị');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Lý luận chính trị"');
            }

            const importedTheories: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedTheories.push({
                    name,
                    description: getCellValue(2),
                });
            });

            if (importedTheories.length === selectedTheories.length) {
                setSelectedTheories(prev => prev.map((t, index) => ({
                    ...t,
                    ...importedTheories[index]
                })));
                toast.success(`Đã cập nhật ${importedTheories.length} lý luận chính trị từ file`);
            } else {
                toast.warning(`File có ${importedTheories.length} dòng nhưng đang chỉnh sửa ${selectedTheories.length} lý luận chính trị`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddTheory = async (id: number) => {
        if (selectedTheories.find(t => t.id === id)) {
            toast.error('Lý luận chính trị này đã được thêm');
            return;
        }

        try {
            const response = await politicalTheoryApi.getById(id);
            const theoryData = response.data || response;

            setSelectedTheories(prev => [...prev, {
                id: theoryData.id,
                name: theoryData.name || '',
                description: theoryData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching theory:', error);
            toast.error('Không thể tải thông tin lý luận chính trị');
        }
    };

    const handleRemoveTheory = (id: number) => {
        setSelectedTheories(prev => prev.filter(t => t.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedTheories(prev =>
            prev.map(t =>
                t.id === id ? { ...t, [field]: value } : t
            )
        );
    };

    const handleSubmit = () => {
        if (selectedTheories.length === 0) {
            toast.error('Vui lòng chọn ít nhất một lý luận chính trị');
            return;
        }

        const invalidTheories = selectedTheories.filter(t => !t.name);

        if (invalidTheories.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên lý luận chính trị cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedTheories);
    };

    const handleClose = () => {
        setSelectedTheories([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredTheories = allTheories.filter(t =>
        t.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (theory, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={theory[field]}
                        onChange={(e) => handleFieldChange(theory.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên lý luận chính trị"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={theory.description}
                        onChange={(e) => handleFieldChange(theory.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTheoryFieldsExpanded = (theory, index) => (
        <div key={theory.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {theory.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTheory(theory.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên lý luận chính trị <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={theory.name}
                        onChange={(e) => handleFieldChange(theory.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Sơ cấp lý luận chính trị, Trung cấp..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={theory.description}
                        onChange={(e) => handleFieldChange(theory.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về lý luận chính trị..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa lý luận chính trị hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn lý luận chính trị để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên lý luận chính trị..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm lý luận chính trị..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy lý luận chính trị.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredTheories.map((theory) => (
                                                <CommandItem
                                                    key={theory.id}
                                                    value={theory.name}
                                                    onSelect={() => handleAddTheory(theory.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedTheories.find(t => t.id === theory.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="font-medium">{theory.name}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedTheories.length > 0 && (
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
                                Đã chọn: <b>{selectedTheories.length}</b> lý luận chính trị
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedTheories.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có lý luận chính trị nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên lý luận chính trị *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTheories.map((theory, index) => (
                                            <>
                                                <TableRow key={theory.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(theory.id)}
                                                                title={expandedRows.has(theory.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(theory.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTheory(theory.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(theory, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(theory, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(theory.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderTheoryFieldsExpanded(theory, index)}
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
                                {selectedTheories.map((theory, index) => renderTheoryFieldsExpanded(theory, index))}
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
                        disabled={updateMutation.isPending || selectedTheories.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedTheories.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}