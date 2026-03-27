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
import { jobTitleApi } from '../../api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditPositionModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedPositionIds?: number[];
}

export default function BulkEditPositionModal({
    isOpen,
    onClose,
    preSelectedPositionIds = []
}: BulkEditPositionModalProps) {
    const queryClient = useQueryClient();
    const [selectedPositions, setSelectedPositions] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    const toggleRowExpansion = (positionId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(positionId)) {
                newSet.delete(positionId);
            } else {
                newSet.add(positionId);
            }
            return newSet;
        });
    };

    useEffect(() => {
        const loadPreSelectedPositions = async () => {
            if (!isOpen || preSelectedPositionIds.length === 0) return;

            try {
                const promises = preSelectedPositionIds.map(id =>
                    jobTitleApi.getById(id).then(response => response.data || response)
                );

                const positionsData = await Promise.all(promises);

                const mappedPositions = positionsData.map(pos => ({
                    id: pos.id,
                    name: pos.name || '',
                    code: pos.code || '',
                    description: pos.description || '',
                }));

                setSelectedPositions(mappedPositions);
            } catch (error) {
                console.error('Error loading pre-selected positions:', error);
                toast.error('Không thể tải thông tin Chức danh');
            }
        };

        loadPreSelectedPositions();
    }, [isOpen, preSelectedPositionIds]);

    const { data: allPositions = [] } = useQuery({
        queryKey: ['jobTitles'],
        queryFn: jobTitleApi.getAll,
    });

    const updateMutation = useMutation({
        mutationFn: (payload: any[]) => jobTitleApi.updateBulk(payload),
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedPositions.length} Chức danh`);
            queryClient.invalidateQueries({ queryKey: ['jobTitles'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật Chức danh');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Chức danh');

            const columns = [
                { header: 'Mã Chức danh', key: 'code', width: 15 },
                { header: 'Tên Chức danh *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedPositions.forEach(pos => {
                mainSheet.addRow({
                    code: pos.code,
                    name: pos.name,
                    description: pos.description,
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

            saveAs(blob, `Chinh_sua_chuc_vu_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedPositions.length} Chức danh`);
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

            const worksheet = workbook.getWorksheet('Chức danh');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Chức danh"');
            }

            const importedPositions: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                importedPositions.push({
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                });
            });

            // Cập nhật positions hiện có
            if (importedPositions.length === selectedPositions.length) {
                setSelectedPositions(prev => prev.map((pos, index) => ({
                    ...pos,
                    ...importedPositions[index]
                })));
                toast.success(`Đã cập nhật ${importedPositions.length} Chức danh từ file`);
            } else {
                toast.warning(`File có ${importedPositions.length} dòng nhưng đang chỉnh sửa ${selectedPositions.length} Chức danh`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddPosition = async (positionId: number) => {
        if (selectedPositions.find(p => p.id === positionId)) {
            toast.error('Chức danh này đã được thêm');
            return;
        }

        try {
            const response = await jobTitleApi.getById(positionId);
            const positionData = response.data || response;

            setSelectedPositions(prev => [...prev, {
                id: positionData.id,
                name: positionData.name || '',
                code: positionData.code || '',
                description: positionData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching position:', error);
            toast.error('Không thể tải thông tin Chức danh');
        }
    };

    const handleRemovePosition = (positionId: number) => {
        setSelectedPositions(prev => prev.filter(p => p.id !== positionId));
    };

    const handleFieldChange = (positionId: number, field: string, value: any) => {
        setSelectedPositions(prev =>
            prev.map(pos =>
                pos.id === positionId ? { ...pos, [field]: value } : pos
            )
        );
    };

    const handleSubmit = () => {
        if (selectedPositions.length === 0) {
            toast.error('Vui lòng chọn ít nhất một Chức danh');
            return;
        }

        const invalidPositions = selectedPositions.filter(pos => !pos.name);

        if (invalidPositions.length > 0) {
            toast.error('Vui lòng điền tên Chức danh cho tất cả các dòng');
            return;
        }

        const payload = selectedPositions.map(pos => ({
            id: Number(pos.id),
            name: pos.name,
            code: pos.code || null,
            description: pos.description || null,
        }));

        updateMutation.mutate(payload);
    };

    const handleClose = () => {
        setSelectedPositions([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredPositions = allPositions.filter(pos =>
        pos.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        pos.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (position, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={position[field]}
                        onChange={(e) => handleFieldChange(position.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã Chức danh' : 'Tên Chức danh'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={position.description}
                        onChange={(e) => handleFieldChange(position.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả"
                    />
                );
            default:
                return null;
        }
    };

    const renderPositionFieldsExpanded = (position, index) => (
        <div key={position.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {position.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePosition(position.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã Chức danh</Label>
                    <Input
                        value={position.code}
                        onChange={(e) => handleFieldChange(position.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: GD, PGD, TP..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên Chức danh <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={position.name}
                        onChange={(e) => handleFieldChange(position.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Giám đốc, Phó giám đốc..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={position.description}
                        onChange={(e) => handleFieldChange(position.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về Chức danh..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa Chức danh hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn Chức danh để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    {preSelectedPositionIds.length === 0 && (
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
                                        {searchValue || "Nhập tên hoặc mã Chức danh..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm Chức danh..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy Chức danh.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredPositions.map((position) => (
                                                <CommandItem
                                                    key={position.id}
                                                    value={position.name}
                                                    onSelect={() => handleAddPosition(position.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedPositions.find(p => p.id === position.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{position.name}</span>
                                                        {position.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {position.code}
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

                    {selectedPositions.length > 0 && (
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
                                Đã chọn: <b>{selectedPositions.length}</b> Chức danh
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedPositions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có Chức danh nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã Chức danh</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên Chức danh *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedPositions.map((position, index) => (
                                            <>
                                                <TableRow key={position.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(position.id)}
                                                                title={expandedRows.has(position.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(position.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemovePosition(position.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(position, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(position, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(position, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(position.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderPositionFieldsExpanded(position, index)}
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
                                {selectedPositions.map((position, index) => renderPositionFieldsExpanded(position, index))}
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
                        disabled={updateMutation.isPending || selectedPositions.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedPositions.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}