// File 2: BulkEditSocialInsuranceJobModal.tsx
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

interface BulkEditSocialInsuranceJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    preSelectedIds?: number[];
}

export default function BulkEditSocialInsuranceJobModal({
    isOpen,
    onClose,
    preSelectedIds = []
}: BulkEditSocialInsuranceJobModalProps) {
    const queryClient = useQueryClient();
    const [selectedJobs, setSelectedJobs] = useState([]);
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

    const { data: allJobs = [] } = useQuery({
        queryKey: ['socialInsuranceJobs'],
        queryFn: () => categoriesApi.socialInsuranceJob.getAll(),
    });

    useEffect(() => {
        const loadPreSelectedJobs = async () => {
            if (!isOpen || preSelectedIds.length === 0) return;

            try {
                const promises = preSelectedIds.map(id =>
                    categoriesApi.socialInsuranceJob.getById(id).then(response => response.data || response)
                );

                const jobsData = await Promise.all(promises);

                const mappedJobs = jobsData.map(job => ({
                    id: job.id,
                    code: job.code || '',
                    name: job.name || '',
                    description: job.description || '',
                }));

                setSelectedJobs(mappedJobs);
            } catch (error) {
                console.error('Error loading pre-selected jobs:', error);
                toast.error('Không thể tải thông tin công việc BHXH');
            }
        };

        loadPreSelectedJobs();
    }, [isOpen, preSelectedIds]);

    const updateMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => 
                categoriesApi.socialInsuranceJob.update(item.id, {
                    code: item.code,
                    name: item.name,
                    description: item.description,
                })
            );
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã cập nhật ${selectedJobs.length} công việc BHXH`);
            queryClient.invalidateQueries({ queryKey: ['socialInsuranceJobs'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể cập nhật công việc BHXH');
        },
    });

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Công việc BHXH');

            const columns = [
                { header: 'Mã công việc', key: 'code', width: 30 },
                { header: 'Tên công việc BHXH *', key: 'name', width: 40 },
                { header: 'Mô tả', key: 'description', width: 50 },
            ];

            mainSheet.columns = columns;

            selectedJobs.forEach(job => {
                mainSheet.addRow({
                    code: job.code,
                    name: job.name,
                    description: job.description,
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

            saveAs(blob, `Chinh_sua_cong_viec_BHXH_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success(`Đã tải xuống file với ${selectedJobs.length} công việc BHXH`);
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

            const worksheet = workbook.getWorksheet('Công việc BHXH');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Công việc BHXH"');
            }

            const importedJobs: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                importedJobs.push({
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                });
            });

            if (importedJobs.length === selectedJobs.length) {
                setSelectedJobs(prev => prev.map((job, index) => ({
                    ...job,
                    ...importedJobs[index]
                })));
                toast.success(`Đã cập nhật ${importedJobs.length} công việc BHXH từ file`);
            } else {
                toast.warning(`File có ${importedJobs.length} dòng nhưng đang chỉnh sửa ${selectedJobs.length} công việc BHXH`);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleAddJob = async (id: number) => {
        if (selectedJobs.find(job => job.id === id)) {
            toast.error('Công việc BHXH này đã được thêm');
            return;
        }

        try {
            const response = await categoriesApi.socialInsuranceJob.getById(id);
            const jobData = response.data || response;

            setSelectedJobs(prev => [...prev, {
                id: jobData.id,
                code: jobData.code || '',
                name: jobData.name || '',
                description: jobData.description || '',
            }]);

            setSearchValue('');
            setSearchOpen(false);
        } catch (error) {
            console.error('Error fetching job:', error);
            toast.error('Không thể tải thông tin công việc BHXH');
        }
    };

    const handleRemoveJob = (id: number) => {
        setSelectedJobs(prev => prev.filter(job => job.id !== id));
    };

    const handleFieldChange = (id: number, field: string, value: any) => {
        setSelectedJobs(prev =>
            prev.map(job =>
                job.id === id ? { ...job, [field]: value } : job
            )
        );
    };

    const handleSubmit = () => {
        if (selectedJobs.length === 0) {
            toast.error('Vui lòng chọn ít nhất một công việc BHXH');
            return;
        }

        const invalidJobs = selectedJobs.filter(job => !job.name);

        if (invalidJobs.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên công việc BHXH cho tất cả các dòng');
            return;
        }

        updateMutation.mutate(selectedJobs);
    };

    const handleClose = () => {
        setSelectedJobs([]);
        setSearchValue('');
        setExpandedRows(new Set());
        onClose();
    };

    const filteredJobs = allJobs.filter(job =>
        job.name?.toLowerCase().includes(searchValue.toLowerCase())
    );

    const renderTableCell = (job, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
                return (
                    <Input
                        value={job[field]}
                        onChange={(e) => handleFieldChange(job.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="CVBHXH-01"
                    />
                );
            case 'name':
                return (
                    <Input
                        value={job[field]}
                        onChange={(e) => handleFieldChange(job.id, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên công việc BHXH"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={job.description}
                        onChange={(e) => handleFieldChange(job.id, 'description', e.target.value)}
                        className="text-sm min-w-[200px]"
                        rows={2}
                        placeholder="Mô tả..."
                    />
                );
            default:
                return null;
        }
    };

    const renderJobFieldsExpanded = (job, index) => (
        <div key={job.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {job.name}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveJob(job.id)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã công việc</Label>
                    <Input
                        value={job.code}
                        onChange={(e) => handleFieldChange(job.id, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: CVBHXH-01, NGHE-01..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên công việc BHXH <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={job.name}
                        onChange={(e) => handleFieldChange(job.id, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Công việc nặng nhọc, độc hại, nguy hiểm..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={job.description}
                        onChange={(e) => handleFieldChange(job.id, 'description', e.target.value)}
                        className="text-sm"
                        rows={4}
                        placeholder="Nhập mô tả chi tiết về công việc BHXH..."
                    />
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa công việc BHXH hàng loạt</DialogTitle>
                    <DialogDescription>
                        Tìm kiếm và chọn công việc BHXH để chỉnh sửa thông tin. Các trường được đánh dấu (*) là bắt buộc.
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
                                        {searchValue || "Nhập tên công việc BHXH..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Tìm kiếm công việc BHXH..."
                                            value={searchValue}
                                            onValueChange={setSearchValue}
                                        />
                                        <CommandEmpty>Không tìm thấy công việc BHXH.</CommandEmpty>
                                        <CommandGroup className="max-h-64 overflow-auto">
                                            {filteredJobs.map((job) => (
                                                <CommandItem
                                                    key={job.id}
                                                    value={job.name}
                                                    onSelect={() => handleAddJob(job.id)}
                                                >
                                                    <Check
                                                        className={`mr-2 h-4 w-4 ${selectedJobs.find(j => j.id === job.id)
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                            }`}
                                                    />
                                                    <span className="font-medium">{job.name}</span>
                                                    {job.code && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({job.code})
                                                        </span>
                                                    )}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {selectedJobs.length > 0 && (
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
                                Đã chọn: <b>{selectedJobs.length}</b> công việc BHXH
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-auto px-4 py-4">
                        {selectedJobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>Chưa có công việc BHXH nào được chọn</p>
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
                                            <TableHead className="whitespace-nowrap">Mã công việc</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên công việc BHXH *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedJobs.map((job, index) => (
                                            <>
                                                <TableRow key={job.id}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(job.id)}
                                                                title={expandedRows.has(job.id) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(job.id) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveJob(job.id)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(job, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(job, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(job, 'description')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(job.id) && (
                                                    <TableRow>
                                                        <TableCell colSpan={5}>
                                                            {renderJobFieldsExpanded(job, index)}
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
                                {selectedJobs.map((job, index) => renderJobFieldsExpanded(job, index))}
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
                        disabled={updateMutation.isPending || selectedJobs.length === 0}
                        className="bg-green-500 text-white hover:bg-green-600"
                    >
                        {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {updateMutation.isPending ? 'Đang lưu...' : `Xác nhận (${selectedJobs.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}