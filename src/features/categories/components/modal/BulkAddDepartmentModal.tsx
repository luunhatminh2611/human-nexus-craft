import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { unitApi } from '@/features/departments/api/departmentApi';
import { departmentTypeApi } from '@/features/departments/api/departmentTypeApi';
import { toast } from 'sonner';
import { Loader2, X, Plus, Building2, Download, Upload, Copy, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import { Button } from '@/shared/components/ui/button/Button2';

// ✅ Helper: Retry với Exponential Backoff
const retryRequest = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  delayMs = 1000
): Promise<any> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isDeadlock = error?.message?.includes('Deadlock') || 
                        error?.response?.data?.message?.includes('Deadlock');
      const isLastRetry = i === maxRetries - 1;

      if (isDeadlock && !isLastRetry) {
        const waitTime = delayMs * Math.pow(2, i);
        console.warn(`⚠️ Deadlock detected, retry ${i + 1}/${maxRetries} after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
};

// ✅ Sequential create với delay giữa các request
const createDepartmentsSequentially = async (items: any[]) => {
  const results = [];
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await retryRequest(() => unitApi.create(items[i]));
      results.push(result);
      
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Lỗi tạo phòng ban ${i + 1}:`, error);
      throw error;
    }
  }
  return results;
};

export default function BulkAddDepartmentModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [departments, setDepartments] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [viewMode, setViewMode] = useState<'table' | 'expanded'>('table');

    // Fetch department types và existing departments
    const { data: departmentTypes = [] } = useQuery({
        queryKey: ['departmentTypes'],
        queryFn: departmentTypeApi.getAll,
    });

    const { data: existingDepartments = [] } = useQuery({
        queryKey: ['departments'],
        queryFn: unitApi.getAll,
    });

    useEffect(() => {
        if (isOpen && departments.length === 0) {
            handleAddDepartment();
        }
    }, [isOpen]);

    const createMutation = useMutation({
        mutationFn: async (payload: any[]) => {
            // ✅ Sequential create thay vì Promise.all
            return await createDepartmentsSequentially(payload);
        },
        onSuccess: () => {
            toast.success(`Đã thêm ${departments.length} phòng ban thành công`);
            queryClient.invalidateQueries({ queryKey: ['departments'] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể thêm phòng ban');
        },
    });

    const createNewDepartment = () => {
        return {
            tempId: nextId,
            name: '',
            code: '',
            departmentTypeId: '',
            parentId: 'none',
        };
    };

    const handleExportExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const mainSheet = workbook.addWorksheet('Phòng ban');
            const dropdownSheet = workbook.addWorksheet('Danh mục');

            dropdownSheet.state = 'hidden';

            const columns = [
                { header: 'Mã phòng ban', key: 'code', width: 20 },
                { header: 'Tên phòng ban *', key: 'name', width: 30 },
                { header: 'Loại phòng ban', key: 'departmentType', width: 25 },
                { header: 'Phòng ban gốc', key: 'parent', width: 30 },
            ];

            mainSheet.columns = columns;

            // Ghi dữ liệu hiện tại (nếu có)
            departments.forEach(dept => {
                const deptType = departmentTypes.find(dt => dt.id === Number(dept.departmentTypeId));
                const parentDept = existingDepartments.find(d => d.id === Number(dept.parentId));

                mainSheet.addRow({
                    code: dept.code,
                    name: dept.name,
                    departmentType: deptType?.name || '',
                    parent: parentDept?.name || '',
                });
            });

            // Ghi dropdown lists
            let colIndex = 1;
            const dropdownRanges = {};

            const writeDropdown = (data: any[], key: string) => {
                if (data && data.length > 0) {
                    dropdownSheet.getCell(1, colIndex).value = key;
                    data.forEach((item, idx) => {
                        dropdownSheet.getCell(idx + 2, colIndex).value = item.name || item;
                    });
                    const letter = String.fromCharCode(64 + colIndex);
                    dropdownRanges[key] = `'Danh mục'!$${letter}$2:$${letter}$${data.length + 1}`;
                    colIndex++;
                }
            };

            writeDropdown(departmentTypes, 'departmentType');
            writeDropdown(existingDepartments, 'parent');

            // Add validation
            const addValidation = (columnKey: string, dropdownKey: string) => {
                const colNumber = columns.findIndex(col => col.key === columnKey) + 1;
                if (colNumber > 0 && dropdownRanges[dropdownKey]) {
                    const maxRow = Math.max(departments.length + 1, 100);
                    for (let i = 2; i <= maxRow; i++) {
                        mainSheet.getCell(i, colNumber).dataValidation = {
                            type: 'list',
                            allowBlank: true,
                            formulae: [dropdownRanges[dropdownKey]],
                        };
                    }
                }
            };

            addValidation('departmentType', 'departmentType');
            addValidation('parent', 'parent');

            // Style header
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

            const fileName = departments.length > 0
                ? `Them_phong_ban_${new Date().toISOString().split('T')[0]}.xlsx`
                : `Mau_them_phong_ban.xlsx`;

            saveAs(blob, fileName);

            toast.success(departments.length > 0
                ? `Đã tải xuống file với ${departments.length} phòng ban`
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

            const worksheet = workbook.getWorksheet('Phòng ban');
            if (!worksheet) {
                throw new Error('Không tìm thấy sheet "Phòng ban"');
            }

            const findIdByName = (list: any[], name: string) => {
                if (!name) return '';
                const found = list?.find(item =>
                    item.name?.toLowerCase().trim() === name?.toLowerCase().trim()
                );
                return found ? String(found.id) : '';
            };

            const importedDepartments: any[] = [];
            const existingCodes = new Map(departments.map(dept => [dept.code, dept]));

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                const getCellValue = (colNumber: number) => {
                    const cell = row.getCell(colNumber);
                    return cell.value ? String(cell.value).trim() : '';
                };

                const code = getCellValue(1);
                const name = getCellValue(2);
                if (!name) return;

                const departmentData = {
                    tempId: existingCodes.has(code) ? existingCodes.get(code)!.tempId : nextId + importedDepartments.length,
                    code,
                    name,
                    departmentTypeId: findIdByName(departmentTypes, getCellValue(3)),
                    parentId: findIdByName(existingDepartments, getCellValue(4)) || 'none',
                };

                importedDepartments.push(departmentData);
            });

            const updatedDepartments = departments.map(dept => {
                const imported = importedDepartments.find(imp => imp.code === dept.code && dept.code);
                return imported || dept;
            });

            const newDepartments = importedDepartments.filter(
                imp => !existingCodes.has(imp.code) || !imp.code
            );

            setDepartments([...updatedDepartments, ...newDepartments]);
            setNextId(prev => prev + newDepartments.length);

            toast.success(`Đã nhập ${importedDepartments.length} phòng ban (${newDepartments.length} mới, ${importedDepartments.length - newDepartments.length} cập nhật)`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Không thể đọc file');
        } finally {
            e.target.value = '';
        }
    };

    const handleCopyDepartment = (tempId: number) => {
        const departmentToCopy = departments.find(d => d.tempId === tempId);
        if (departmentToCopy) {
            const newDepartment = {
                ...departmentToCopy,
                tempId: nextId,
                code: '',
            };
            setDepartments(prev => [...prev, newDepartment]);
            setNextId(prev => prev + 1);
            toast.success('Đã sao chép phòng ban');
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

    const handleAddDepartment = () => {
        setDepartments(prev => [...prev, createNewDepartment()]);
        setNextId(prev => prev + 1);
    };

    const handleRemoveDepartment = (tempId: number) => {
        setDepartments(prev => prev.filter(d => d.tempId !== tempId));
    };

    const handleFieldChange = (tempId: number, field: string, value: any) => {
        setDepartments(prev =>
            prev.map(dept =>
                dept.tempId === tempId ? { ...dept, [field]: value } : dept
            )
        );
    };

    const handleSubmit = () => {
        if (departments.length === 0) {
            toast.error('Vui lòng thêm ít nhất một phòng ban');
            return;
        }

        // ✅ Validate: Kiểm tra tên không được trống (sau khi trim)
        const invalidNames = departments.filter(dept => {
            const name = (dept.name || '').trim();
            return !name;
        });

        if (invalidNames.length > 0) {
            toast.error('Vui lòng điền tên phòng ban cho tất cả các dòng');
            return;
        }

        // ✅ Validate: Kiểm tra loại phòng ban không được trống
        const missingTypes = departments.filter(dept => !dept.departmentTypeId);
        if (missingTypes.length > 0) {
            toast.error('Vui lòng chọn loại phòng ban cho tất cả các dòng');
            return;
        }

        // ✅ Tạo payload với xử lý đúng: company, trim, undefined/null
        const payload = departments.map(dept => {
            const code = (dept.code || '').trim();
            const parentId = dept.parentId && dept.parentId !== 'none'
                ? Number(dept.parentId)
                : null;

            return {
                company: { id: 2 }, // ✅ THÊM company
                name: (dept.name || '').trim(),
                code: code || undefined, // ✅ undefined nếu trống
                departmentType: { id: Number(dept.departmentTypeId) },
                parent: parentId ? { id: parentId } : null,
            };
        });

        console.log('Payload gửi lên:', JSON.stringify(payload, null, 2));
        createMutation.mutate(payload);
    };

    const handleClose = () => {
        setDepartments([]);
        setNextId(1);
        setExpandedRows(new Set());
        onClose();
    };

    const renderTableCell = (department, field: string) => {
        const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

        switch (field) {
            case 'code':
            case 'name':
                return (
                    <Input
                        value={department[field]}
                        onChange={(e) => handleFieldChange(department.tempId, field, e.target.value)}
                        className={commonInputClass}
                        placeholder={field === 'code' ? 'Mã phòng ban' : 'Tên phòng ban'}
                    />
                );
            case 'departmentTypeId':
                return (
                    <Select
                        value={department.departmentTypeId}
                        onValueChange={(value) => handleFieldChange(department.tempId, 'departmentTypeId', value)}
                    >
                        <SelectTrigger className={commonInputClass}>
                            <SelectValue placeholder="Chọn loại" />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentTypes.map(dt => (
                                <SelectItem key={dt.id} value={String(dt.id)}>
                                    {dt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'parentId':
                return (
                    <Select
                        value={department.parentId}
                        onValueChange={(value) => handleFieldChange(department.tempId, 'parentId', value === 'none' ? '' : value)}
                    >
                        <SelectTrigger className={commonInputClass}>
                            <SelectValue placeholder="Chọn phòng ban gốc" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Không có</SelectItem>
                            {existingDepartments.map(d => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            default:
                return null;
        }
    };

    const renderDepartmentFieldsExpanded = (department, index) => (
        <div key={department.tempId} className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between sticky top-0 bg-muted/30 pb-2 border-b z-10">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        {index + 1}
                    </span>
                    {department.name || 'Phòng ban mới'}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDepartment(department.tempId)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs">Mã phòng ban</Label>
                    <Input
                        value={department.code}
                        onChange={(e) => handleFieldChange(department.tempId, 'code', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: IT, HR, KT..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">
                        Tên phòng ban <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        value={department.name}
                        onChange={(e) => handleFieldChange(department.tempId, 'name', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="Ví dụ: Phòng Công nghệ thông tin..."
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Loại phòng ban <span className="text-red-500">*</span></Label>
                    <Select
                        value={department.departmentTypeId}
                        onValueChange={(value) => handleFieldChange(department.tempId, 'departmentTypeId', value)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Chọn loại phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                            {departmentTypes.map(dt => (
                                <SelectItem key={dt.id} value={String(dt.id)}>
                                    {dt.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Phòng ban gốc</Label>
                    <Select
                        value={department.parentId}
                        onValueChange={(value) => handleFieldChange(department.tempId, 'parentId', value)}
                    >
                        <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Chọn phòng ban gốc" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Không có (Phòng ban gốc)</SelectItem>
                            {existingDepartments.map(d => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                    {d.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Thêm phòng ban hàng loạt
                    </DialogTitle>
                    <DialogDescription>
                        Có thể thêm nhiều phòng ban và lưu một lần
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
                                onClick={handleAddDepartment}
                            >
                                <Plus className="h-4 w-4" />
                                Thêm phòng ban
                            </Button>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            Tổng số: <b>{departments.length}</b> phòng ban
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto px-6 py-4">
                        {departments.length === 0 ? (
                            <div className="text-sm text-muted-foreground text-center py-10">
                                Chưa có phòng ban nào. Nhấn <b>Thêm phòng ban</b> để bắt đầu.
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
                                            <TableHead className="whitespace-nowrap">Mã phòng ban</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Loại phòng ban *</TableHead>
                                            <TableHead className="whitespace-nowrap">Phòng ban gốc</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departments.map((department, index) => (
                                            <>
                                                <TableRow key={department.tempId}>
                                                    <TableCell className="sticky left-0 bg-background z-10 border-r">
                                                        <span className="font-medium">{index + 1}</span>
                                                    </TableCell>
                                                    <TableCell className="sticky left-12 bg-background z-10 border-r">
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => toggleRowExpansion(department.tempId)}
                                                                title={expandedRows.has(department.tempId) ? "Thu gọn" : "Mở rộng"}
                                                            >
                                                                {expandedRows.has(department.tempId) ?
                                                                    <ChevronUp className="h-4 w-4" /> :
                                                                    <ChevronDown className="h-4 w-4" />
                                                                }
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleCopyDepartment(department.tempId)}
                                                                title="Sao chép"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDepartment(department.tempId)}
                                                                title="Xóa"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTableCell(department, 'code')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'name')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'departmentTypeId')}</TableCell>
                                                    <TableCell>{renderTableCell(department, 'parentId')}</TableCell>
                                                </TableRow>
                                                {expandedRows.has(department.tempId) && (
                                                    <TableRow>
                                                        <TableCell colSpan={6}>
                                                            {renderDepartmentFieldsExpanded(department, index)}
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
                                {departments.map((department, index) => renderDepartmentFieldsExpanded(department, index))}
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
                                disabled={createMutation.isPending || departments.length === 0}
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