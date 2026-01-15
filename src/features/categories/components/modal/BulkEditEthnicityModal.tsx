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
import { ethnicityApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Search, Check, ChevronsUpDown, Upload, Download, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

interface BulkEditEthnicityModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditEthnicityModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditEthnicityModalProps) {
    const queryClient = useQueryClient();
    const [selectedEthnicities, setSelectedEthnicities] = useState([]);
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

    const { data: allEthnicities = [] } = useQuery({
        queryKey: ['ethnicities'],
        queryFn: ethnicityApi.getAll,
    });

    useEffect(() => {
        const loadPreSelectedEthnicities = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    ethnicityApi.getById(id).then(response => response.data || response)
                );

                const ethnicitiesData = await Promise.all(promises);

                const mappedEthnicities = ethnicitiesData.map(eth => ({
                    id: eth.id,
                    name: eth.name || '',
                    description: eth.description || '',
                }));

                setSelectedEthnicities(mappedEthnicities);
            } catch (error) {
                console.error('Error loading pre-selected ethnicities:', error);
                toast.error('Không thể tải thông tin dân tộc');
            }
        };

        loadPreSelectedEthnicities();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                ethnicityApi.update(item.id, {
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedEthnicities.length} dân tộc`);
            queryClient.invalidateQueries({ queryKey: ['ethnicities'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật dân tộc');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Dân tộc');

            const columns = [
                { header: 'Tên dân tộc *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedEthnicities.forEach(eth => {
                mainSheet.addRow({
                    name: eth.name,
                    description: eth.description,
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

            saveAs(blob, `Chinh_sua_dan_toc_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedEthnicities.length} dân tộc`);
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

            const worksheet = workbook.getWorksheet('Dân tộc');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Dân tộc"');
            }

            const importedEthnicities: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(1);
                if (!name) return;

                importedEthnicities.push({
                    name,
                    description: getCellValue(2),
                });
            });

            if (importedEthnicities.length === selectedEthnicities.length) {
                setSelectedEthnicities(prev => prev.map((eth, index) => ({
                    ...eth,
                    ...importedEthnicities[index]
                })));
                toast.success(`Đã cập nhật ${importedEthnicities.length} dân tộc từ file`);
            } else {
                toast.warning(`File có ${importedEthnicities.length} dòng nhưng đang chỉnh sửa ${selectedEthnicities.length} dân tộc`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddEthnicity = async (id: number) => {
        if (selectedEthnicities.find(eth => eth.id === id)) {
            toast.error('Dân tộc này đã được thêm');
            return;
        }

        try {
            const response = await ethnicityApi.getById(id);
            const ethnicityData = response.data || response;

            setSelectedEthnicities(prev => [...prev, {
                id: ethnicityData.id,
                name: ethnicityData.name || '',
                description: ethnicityData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching ethnicity:', error);
            toast.error('Không thể tải thông tin dân tộc');
        }
    };

    const handleRemoveEthnicity = (id: number) => {
        setSelectedEthnicities(prev => prev.filter(eth => eth.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedEthnicities(prev =>
            prev.map(eth =>
                eth.id === id ? { ...eth, [field]: value } : eth
            )
        );
    };

    const handleSubmit = () => {
        if (selectedEthnicities.length === 0) {
            toast.error('Vui lòng chọn ít nhất một dân tộc');
            return;
        }

        const invalidEthnicities = selectedEthnicities.filter(eth => !eth.name);

        if (invalidEthnicities.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên dân tộc cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedEthnicities);
    };

    const handleClose = () => {
        setSelectedEthnicities([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredEthnicities = allEthnicities.filter(eth =>
        eth.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (ethnicity, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'name':
                return (
                    <Input
                        value={ethnicity[field]}
                        onChange={(e) => handleFieldChange(ethnicity.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên dân tộc"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={ethnicity.description}
                        onChange={(e) => handleFieldChange(ethnicity.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderEthnicityFieldsExpanded = (ethnicity, index) => (
        <div key={ethnicity.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {ethnicity.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEthnicity(ethnicity.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên dân tộc <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={ethnicity.name}
                        onChange={(e) => handleFieldChange(ethnicity.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Kinh, Tày, Thái..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={ethnicity.description}
                        onChange={(e) => handleFieldChange(ethnicity.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về dân tộc..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa dân tộc hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn dân tộc để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên dân tộc..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm dân tộc..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy dân tộc.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredEthnicities.map((ethnicity) => (
                                                <CommandItem
                                                    key={ethnicity.id}
                                                    value={ethnicity.name}
                                                    onSelect={() => handleAddEthnicity(ethnicity.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedEthnicities.find(eth => eth.id === ethnicity.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{ethnicity.name}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedEthnicities.length > 0 && (
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
                                Đã chọn: <b>{selectedEthnicities.length}</b> dân tộc
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedEthnicities.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có dân tộc nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Tên dân tộc *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedEthnicities.map((ethnicity, index) => (
                                            <>
                                                <TableRow key={ethnicity.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(ethnicity.id)}
                                                                title={expandedRows.has(ethnicity.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(ethnicity.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveEthnicity(ethnicity.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(ethnicity, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(ethnicity, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(ethnicity.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={4}>
                                                            {renderEthnicityFieldsExpanded(ethnicity, index)}
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
                                {selectedEthnicities.map((ethnicity, index) => renderEthnicityFieldsExpanded(ethnicity, index))}
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
                        disabled={updateMutation.isPending || selectedEthnicities.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedEthnicities.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}