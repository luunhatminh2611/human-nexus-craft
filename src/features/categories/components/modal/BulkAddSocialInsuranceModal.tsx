// File 1: BulkAddSocialInsuranceJobModal.tsx
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Textarea } from '@/shared/components/ui/textarea';
import { categoriesApi } from '@/features/categories/api/categoriesApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Briefcase, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

export default function BulkAddSocialInsuranceJobModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [socialInsuranceJobs, setSocialInsuranceJobs] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    useEffect(() => {
        if (isOpen && socialInsuranceJobs.length === 0) {
            handleAddSocialInsuranceJob();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            const promises = payload.map(item => categoriesApi.socialInsuranceJob.create(item));
            return Promise.all(promises);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${socialInsuranceJobs.length} công việc BHXH thành công`);
            queryClient.invalidateQueries({ queryKey: ['socialInsuranceJobs'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm công việc BHXH');
        },
    });

    const createNewSocialInsuranceJob = () => {
        return {
            tempId: nextId,
            code: '',
            name: '',
            description: '',
        };
    };

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

            socialInsuranceJobs.forEach(job => {
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

            const fileName = socialInsuranceJobs.length > 0
                ? `Them_cong_viec_BHXH_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_cong_viec_BHXH.xlsx`;

            saveAs(blob, fileName);

            toast.success(socialInsuranceJobs.length > 0
                ? `Đã tải xuống file với ${socialInsuranceJobs.length} công việc BHXH`
                : 'Đã tải xuống file mẫu');
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
            const existingNames = new Map(socialInsuranceJobs.map(job => [job.name, job]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const name = getCellValue(2);
                if (!name) return;

                const jobData = {
                    tempId: existingNames.has(name) ? existingNames.get(name)!.tempId : nextId + importedJobs.length,
                    code: getCellValue(1),
                    name,
                    description: getCellValue(3),
                };

                importedJobs.push(jobData);
            });

            const updatedJobs = socialInsuranceJobs.map(job => {
                const imported = importedJobs.find(imp => imp.name === job.name);
                return imported || job;
            });

            const newJobs = importedJobs.filter(
                imp => !existingNames.has(imp.name)
            );

            setSocialInsuranceJobs([...updatedJobs, ...newJobs]);
            setNextId(prev => prev + newJobs.length);

            toast.success(`Đã nhập ${importedJobs.length} công việc BHXH (${newJobs.length} mới, ${importedJobs.length - newJobs.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopySocialInsuranceJob = (tempId: number) => {
        const jobToCopy = socialInsuranceJobs.find(job => job.tempId === tempId);
        if (jobToCopy) {
            const newJob = {
                ...jobToCopy,
                tempId: nextId,
            };
            setSocialInsuranceJobs(prev => [...prev, newJob]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép công việc BHXH');
        }
    };

    const toggleRowExpansion = (tempId: number) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tempId)) {
                newSet.delete(tempId);
            } else {
                newSet.add(tempId);
            }
            return newSet;
        });
    };

    const handleAddSocialInsuranceJob = () => {
        setSocialInsuranceJobs(prev => [...prev, createNewSocialInsuranceJob()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveSocialInsuranceJob = (tempId: number) => {
        setSocialInsuranceJobs(prev => prev.filter(job => job.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setSocialInsuranceJobs(prev =>
            prev.map(job =>
                job.tempId === tempId ? { ...job, [field]: value } : job
            )
        );
    };

    const handleSubmit = () => {
        if (socialInsuranceJobs.length === 0) {
            toast.error('Vui lòng thêm ít nhất một công việc BHXH');
            return;
        }

        const invalidJobs = socialInsuranceJobs.filter(job => !job.name);

        if (invalidJobs.length > 0) {
            toast.error('Vui lòng điền đầy đủ tên công việc BHXH cho tất cả các dòng');
            return;
        }

        const payload = socialInsuranceJobs.map(job => ({
            code: job.code || null,
            name: job.name,
            description: job.description || null,
        }));

        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setSocialInsuranceJobs([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (job, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
                return (
                    <Input
                        value={job[field]}
                        onChange={(e) => handleFieldChange(job.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="CVBHXH-01"
                    />
                );
            case 'name':
                return (
                    <Input
                        value={job[field]}
                        onChange={(e) => handleFieldChange(job.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder="Tên công việc BHXH"
                    />
                );
            case 'description':
                return (
                    <Textarea
                        value={job.description}
                        onChange={(e) => handleFieldChange(job.tempId, 'description', e.target.value)}
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
        <div key={job.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {job.name || 'Công việc BHXH mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSocialInsuranceJob(job.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã công việc</Label>
                    <Input
                        value={job.code}
                        onChange={(e) => handleFieldChange(job.tempId, 'code', e.target.value)}
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
                        onChange={(e) => handleFieldChange(job.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Công việc nặng nhọc, độc hại, nguy hiểm..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Mô tả</Label>
                    <Textarea
                        value={job.description}
                        onChange={(e) => handleFieldChange(job.tempId, 'description', e.target.value)}
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
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Thêm công việc BHXH hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều công việc BHXH và lưu một lần
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
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

                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleAddSocialInsuranceJob}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm công việc BHXH
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{socialInsuranceJobs.length}</b> công việc BHXH
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {socialInsuranceJobs.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có công việc BHXH nào. Nhấn <b>Thêm công việc BHXH</b> để bắt đầu.
                            </div>
                        ) : viewMode === 'table' ? (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12 sticky left-0 bg-background z-10">#</TableHead>
                                            <TableHead className="w-32 text-center sticky left-12 bg-background z-10">
                                                Thao tác
                                            </TableHead>
                                            <TableHead className="whitespace-nowrap">Mã công việc</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên công việc BHXH *</TableHead>
                                            <TableHead className="whitespace-nowrap">Mô tả</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {socialInsuranceJobs.map((job, index) => (
                                            <>
                                                <TableRow key={job.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(job.tempId)}
                                                                title={expandedRows.has(job.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(job.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopySocialInsuranceJob(job.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveSocialInsuranceJob(job.tempId)}
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
                                                {expandedRows.has(job.tempId) && (
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
                                {socialInsuranceJobs.map((job, index) => renderJobFieldsExpanded(job, index))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 border-t">
                    <div className="w-full flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={createMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending || socialInsuranceJobs.length === 0}
                            >
                                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                {createMutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}