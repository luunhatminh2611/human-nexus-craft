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

interface BulkEditMilitaryRankModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditMilitaryRankModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditMilitaryRankModalProps) {
    const queryClient = useQueryClient();
    const [selectedMilitaryRanks, setSelectedMilitaryRanks] = useState([]);
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

    const { data: allMilitaryRanks = [] } = useQuery({
        queryKey: ['militaryRanks'],
        queryFn: () => categoriesApi.militaryRank.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedMilitaryRanks = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.militaryRank.getById(id).then(response => response.data || response)
                );

                const militaryRanksData = await Promise.all(promises);

                const mappedMilitaryRanks = militaryRanksData.map(mr => ({
                    id: mr.id,
                    code: mr.code || '',
                    name: mr.name || '',
                    description: mr.description || '',
                }));

                setSelectedMilitaryRanks(mappedMilitaryRanks);
            } catch (error) {
                console.error('Error loading pre-selected military ranks:', error);
                toast.error('Không thể tải thông tin quân hàm');
            }
        };

        loadPreSelectedMilitaryRanks();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.militaryRank.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedMilitaryRanks.length} quân hàm`);
            queryClient.invalidateQueries({ queryKey: ['militaryRanks'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật quân hàm');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Quân hàm');

            const columns = [
                { header: 'Mã quân hàm', key: 'code', width: 20 },
                { header: 'Tên quân hàm *', key: 'name', width: 30 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedMilitaryRanks.forEach(mr => {
                mainSheet.addRow({
                    code: mr.code,
                    name: mr.name,
                    description: mr.description,
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

            saveAs(blob, `Chinh_sua_quan_ham_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedMilitaryRanks.length} quân hàm`);
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

            const worksheet = workbook.getWorksheet('Quân hàm');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Quân hàm"');
            }

            const importedMilitaryRanks: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                importedMilitaryRanks.push({
                    code,
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedMilitaryRanks.length === selectedMilitaryRanks.length) {
                setSelectedMilitaryRanks(prev => prev.map((mr, index) => ({
                    ...mr,
                    ...importedMilitaryRanks[index]
                })));
                toast.success(`Đã cập nhật ${importedMilitaryRanks.length} quân hàm từ file`);
            } else {
                toast.warning(`File có ${importedMilitaryRanks.length} dòng nhưng đang chỉnh sửa ${selectedMilitaryRanks.length} quân hàm`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddMilitaryRank = async (id: number) => {
        if (selectedMilitaryRanks.find(mr => mr.id === id)) {
            toast.error('Quân hàm này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.militaryRank.getById(id);
            const militaryRankData = response.data || response;

            setSelectedMilitaryRanks(prev => [...prev, {
                id: militaryRankData.id,
                code: militaryRankData.code || '',
                name: militaryRankData.name || '',
                description: militaryRankData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching military rank:', error);
            toast.error('Không thể tải thông tin quân hàm');
        }
    };

    const handleRemoveMilitaryRank = (id: number) => {
        setSelectedMilitaryRanks(prev => prev.filter(mr => mr.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedMilitaryRanks(prev =>
            prev.map(mr =>
                mr.id === id ? { ...mr, [field]: value } : mr
            )
        );
    };

    const handleSubmit = () => {
        if (selectedMilitaryRanks.length === 0) {
            toast.error('Vui lòng chọn ít nhất một quân hàm');
            return;
        }

        const invalidMilitaryRanks = selectedMilitaryRanks.filter(mr => !mr.name);

        if (invalidMilitaryRanks.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên quân hàm cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedMilitaryRanks);
    };

    const handleClose = () => {
        setSelectedMilitaryRanks([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredMilitaryRanks = allMilitaryRanks.filter(mr =>
        mr.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        mr.code?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (militaryRank, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={militaryRank[field]}
                        onChange={(e) => handleFieldChange(militaryRank.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã quân hàm' : 'Tên quân hàm'}
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={militaryRank.description}
                        onChange={(e) => handleFieldChange(militaryRank.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderMilitaryRankFieldsExpanded = (militaryRank, index) => (
        <div key={militaryRank.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {militaryRank.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMilitaryRank(militaryRank.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">
                        Mã quân hàm
                    </Label>
                    <Input
                        value={militaryRank.code}
                        onChange={(e) => handleFieldChange(militaryRank.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: SQ, HĐ, ĐW, TW, TĐ..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên quân hàm <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={militaryRank.name}
                        onChange={(e) => handleFieldChange(militaryRank.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Sĩ quan, Hạ sĩ quan..."
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={militaryRank.description}
                        onChange={(e) => handleFieldChange(militaryRank.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về quân hàm..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa quân hàm hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn quân hàm để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên hoặc mã quân hàm..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm quân hàm..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy quân hàm.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredMilitaryRanks.map((militaryRank) => (
                                                <CommandItem
                                                    key={militaryRank.id}
                                                    value={militaryRank.name}
                                                    onSelect={() => handleAddMilitaryRank(militaryRank.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedMilitaryRanks.find(mr => mr.id === militaryRank.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{militaryRank.name}</span>
                                                        {militaryRank.code && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Mã: {militaryRank.code}
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

                    {selectedMilitaryRanks.length > 0 && (
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
                                Đã chọn: <b>{selectedMilitaryRanks.length}</b> quân hàm
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedMilitaryRanks.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có quân hàm nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã quân hàm</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên quân hàm *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedMilitaryRanks.map((militaryRank, index) => (
                                            <>
                                                <TableRow key={militaryRank.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(militaryRank.id)}
                                                                title={expandedRows.has(militaryRank.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(militaryRank.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveMilitaryRank(militaryRank.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(militaryRank, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(militaryRank.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderMilitaryRankFieldsExpanded(militaryRank, index)}
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
                                {selectedMilitaryRanks.map((militaryRank, index) => renderMilitaryRankFieldsExpanded(militaryRank, index))}
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
                        disabled={updateMutation.isPending || selectedMilitaryRanks.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedMilitaryRanks.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}