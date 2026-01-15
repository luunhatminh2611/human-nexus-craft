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

interface BulkEditTrainingMajorModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditTrainingMajorModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditTrainingMajorModalProps) {
    const queryClient = useQueryClient();
    const [selectedTrainingMajors, setSelectedTrainingMajors] = useState([]);
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

    const { data: allTrainingMajors = [] } = useQuery({
        queryKey: ['trainingMajors'],
        queryFn: () => categoriesApi.trainingMajor.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedTrainingMajors = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.trainingMajor.getById(id).then(response => response.data || response)
                );

                const trainingMajorsData = await Promise.all(promises);

                const mappedTrainingMajors = trainingMajorsData.map(tm => ({
                    id: tm.id,
                    code: tm.code || '',
                    name: tm.name || '',
                    description: tm.description || '',
                }));

                setSelectedTrainingMajors(mappedTrainingMajors);
            } catch (error) {
                console.error('Error loading pre-selected training majors:', error);
                toast.error('Không thể tải thông tin ngành đào tạo');
            }
        };

        loadPreSelectedTrainingMajors();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.trainingMajor.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedTrainingMajors.length} ngành đào tạo`);
            queryClient.invalidateQueries({ queryKey: ['trainingMajors'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật ngành đào tạo');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Ngành đào tạo');

            const columns = [
                { header: 'Mã ngành', key: 'code', width: 20 },
                { header: 'Tên ngành đào tạo *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedTrainingMajors.forEach(tm => {
                mainSheet.addRow({
                    code: tm.code,
                    name: tm.name,
                    description: tm.description,
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

            saveAs(blob, `Chinh_sua_nganh_dao_tao_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedTrainingMajors.length} ngành đào tạo`);
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

            const worksheet = workbook.getWorksheet('Ngành đào tạo');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Ngành đào tạo"');
            }

            const importedTrainingMajors: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedTrainingMajors.push({
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedTrainingMajors.length === selectedTrainingMajors.length) {
                setSelectedTrainingMajors(prev => prev.map((tm, index) => ({
                    ...tm,
                    ...importedTrainingMajors[index]
                })));
                toast.success(`Đã cập nhật ${importedTrainingMajors.length} ngành đào tạo từ file`);
            } else {
                toast.warning(`File có ${importedTrainingMajors.length} dòng nhưng đang chỉnh sửa ${selectedTrainingMajors.length} ngành đào tạo`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddTrainingMajor = async (id: number) => {
        if (selectedTrainingMajors.find(tm => tm.id === id)) {
            toast.error('Ngành đào tạo này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.trainingMajor.getById(id);
            const trainingMajorData = response.data || response;

            setSelectedTrainingMajors(prev => [...prev, {
                id: trainingMajorData.id,
                code: trainingMajorData.code || '',
                name: trainingMajorData.name || '',
                description: trainingMajorData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching training major:', error);
            toast.error('Không thể tải thông tin ngành đào tạo');
        }
    };

    const handleRemoveTrainingMajor = (id: number) => {
        setSelectedTrainingMajors(prev => prev.filter(tm => tm.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedTrainingMajors(prev =>
            prev.map(tm =>
                tm.id === id ? { ...tm, [field]: value } : tm
            )
        );
    };

    const handleSubmit = () => {
        if (selectedTrainingMajors.length === 0) {
            toast.error('Vui lòng chọn ít nhất một ngành đào tạo');
            return;
        }

        const invalidTrainingMajors = selectedTrainingMajors.filter(tm => !tm.name);

        if (invalidTrainingMajors.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên ngành đào tạo cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedTrainingMajors);
    };

    const handleClose = () => {
        setSelectedTrainingMajors([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredTrainingMajors = allTrainingMajors.filter(tm =>
        tm.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        tm.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (trainingMajor, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={trainingMajor[field]}
                        onChange={(e) => handleFieldChange(trainingMajor.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã ngành' : 'Tên ngành đào tạo'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={trainingMajor.description}
                        onChange={(e) => handleFieldChange(trainingMajor.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderTrainingMajorFieldsExpanded = (trainingMajor, index) => (
        <div key={trainingMajor.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {trainingMajor.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveTrainingMajor(trainingMajor.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã ngành
                    </Label>
                    <Input
                        value={trainingMajor.code}
                        onChange={(e) => handleFieldChange(trainingMajor.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: CNTT, KTXD, QTKD..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên ngành đào tạo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={trainingMajor.name}
                        onChange={(e) => handleFieldChange(trainingMajor.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Công nghệ thông tin, Kế toán..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={trainingMajor.description}
                        onChange={(e) => handleFieldChange(trainingMajor.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về ngành đào tạo..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa ngành đào tạo hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn ngành đào tạo để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã ngành đào tạo..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm ngành đào tạo..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy ngành đào tạo.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredTrainingMajors.map((trainingMajor) => (
                                                <CommandItem
                                                    key={trainingMajor.id}
                                                    value={trainingMajor.name}
                                                    onSelect={() => handleAddTrainingMajor(trainingMajor.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedTrainingMajors.find(tm => tm.id === trainingMajor.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{trainingMajor.name}</span>
                                                        {trainingMajor.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {trainingMajor.code}
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

                    {selectedTrainingMajors.length > 0 && (
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
                                Đã chọn: <b>{selectedTrainingMajors.length}</b> ngành đào tạo
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedTrainingMajors.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có ngành đào tạo nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã ngành</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên ngành đào tạo *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTrainingMajors.map((trainingMajor, index) => (
                                            <>
                                                <TableRow key={trainingMajor.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(trainingMajor.id)}
                                                                title={expandedRows.has(trainingMajor.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(trainingMajor.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveTrainingMajor(trainingMajor.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(trainingMajor, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(trainingMajor.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderTrainingMajorFieldsExpanded(trainingMajor, index)}
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
                                {selectedTrainingMajors.map((trainingMajor, index) => renderTrainingMajorFieldsExpanded(trainingMajor, index))}
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
                        disabled={updateMutation.isPending || selectedTrainingMajors.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedTrainingMajors.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}