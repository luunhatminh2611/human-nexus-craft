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
import { Textarea } from '@/shared/components/ui/textarea';
import { degreeApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditDegreeModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditDegreeModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditDegreeModalProps) {
    const queryClient = useQueryClient();
    const [selectedDegrees, setSelectedDegrees] = useState([]);
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

    const { data: allDegrees = [] } = useQuery({
        queryKey: ['degrees'],
        queryFn: () => degreeApi.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedDegrees = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    degreeApi.getById(id).then(response => response.data || response)
                );

                const degreesData = await Promise.all(promises);

                const mappedDegrees = degreesData.map(degree => ({
                    id: degree.id,
                    name: degree.name || '',
                    description: degree.description || '',
                }));

                setSelectedDegrees(mappedDegrees);
            } catch (error) {
                console.error('Error loading pre-selected degrees:', error);
                toast.error('Không thể tải thông tin bậc học');
            }
        };

        loadPreSelectedDegrees();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                degreeApi.update(item.id, {
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedDegrees.length} bậc học`);
            queryClient.invalidateQueries({ queryKey: ['degrees'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật bậc học');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Bac_hoc');

            const columns = [
                { header: 'Tên bậc học *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedDegrees.forEach(degree => {
                mainSheet.addRow({
                    name: degree.name,
                    description: degree.description,
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

            saveAs(blob, `Chinh_sua_bac_hoc_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedDegrees.length} bậc học`);
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

            const worksheet = workbook.getWorksheet('Bac_hoc');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Bac_hoc"');
            }

            const importedDegrees: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedDegrees.push({
                    name,
                    description: getCellValue(2),
                });
            });

            if (importedDegrees.length === selectedDegrees.length) {
                setSelectedDegrees(prev => prev.map((degree, index) => ({
                    ...degree,
                    ...importedDegrees[index]
                })));
                toast.success(`Đã cập nhật ${importedDegrees.length} bậc học từ file`);
            } else {
                toast.warning(`File có ${importedDegrees.length} dòng nhưng đang chỉnh sửa ${selectedDegrees.length} bậc học`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddDegree = async (id: number) => {
        if (selectedDegrees.find(degree => degree.id === id)) {
            toast.error('Bậc học này đã được thêm');
            return;
        }

        try {
            const response = await degreeApi.getById(id);
            const degreeData = response.data || response;

            setSelectedDegrees(prev => [...prev, {
                id: degreeData.id,
                name: degreeData.name || '',
                description: degreeData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching degree:', error);
            toast.error('Không thể tải thông tin bậc học');
        }
    };

    const handleRemoveDegree = (id: number) => {
        setSelectedDegrees(prev => prev.filter(degree => degree.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedDegrees(prev =>
            prev.map(degree =>
                degree.id === id ? { ...degree, [field]: value } : degree
            )
        );
    };

    const handleSubmit = () => {
        if (selectedDegrees.length === 0) {
            toast.error('Vui lòng chọn ít nhất một bậc học');
            return;
        }

        const invalidDegrees = selectedDegrees.filter(degree => !degree.name);

        if (invalidDegrees.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên bậc học cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedDegrees);
    };

    const handleClose = () => {
        setSelectedDegrees([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredDegrees = allDegrees.filter(degree =>
        degree.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (degree, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={degree[field]}
                        onChange={(e) => handleFieldChange(degree.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên bậc học"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={degree.description}
                        onChange={(e) => handleFieldChange(degree.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderDegreeFieldsExpanded = (degree, index) => (
        <div key={degree.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {degree.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDegree(degree.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên bậc học <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={degree.name}
                        onChange={(e) => handleFieldChange(degree.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Đại học, Thạc sĩ, Tiến sĩ..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={degree.description}
                        onChange={(e) => handleFieldChange(degree.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về bậc học..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa bậc học hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn bậc học để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên bậc học..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm bậc học..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy bậc học.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredDegrees.map((degree) => (
                                                <CommandItem
                                                    key={degree.id}
                                                    value={degree.name}
                                                    onSelect={() => handleAddDegree(degree.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedDegrees.find(d => d.id === degree.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{degree.name}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedDegrees.length > 0 && (
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
                                Đã chọn: <b>{selectedDegrees.length}</b> bậc học
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedDegrees.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có bậc học nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên bậc học *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedDegrees.map((degree, index) => (
                                            <React.Fragment key={degree.id}>
                                                <TableRow>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(degree.id)}
                                                                title={expandedRows.has(degree.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(degree.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDegree(degree.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(degree, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(degree, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(degree.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderDegreeFieldsExpanded(degree, index)}
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
                                {selectedDegrees.map((degree, index) => renderDegreeFieldsExpanded(degree, index))}
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
                        disabled={updateMutation.isPending || selectedDegrees.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedDegrees.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}