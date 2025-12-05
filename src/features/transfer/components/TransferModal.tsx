import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Upload, X, Download, FileText } from 'lucide-react';
import { transferApi } from '../../transfer/api/transferApi';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { unitApi } from '@/features/departments/api/departmentApi';
import { jobTitleApi } from '@/features/categories/api/categoriesApi';

interface TransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    transferId?: string | number | null;
    mode: 'create' | 'edit';
    onSuccess?: () => void;
}

export default function TransferModal({
    isOpen,
    onClose,
    transferId,
    mode,
    onSuccess,
}: TransferModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingFileKey, setExistingFileKey] = useState<string>('');

    const [formData, setFormData] = useState({
        id: '',
        employeeId: '',
        toDepartmentId: '',
        toPositionId: '',
        description: '',
        note: '',
        effectiveDate: '',
    });

    useEffect(() => {
        if (isOpen) {
            loadModalData();
        }
    }, [isOpen, mode, transferId]);

    // Load tất cả data theo thứ tự
    const loadModalData = async () => {
        try {
            setIsLoading(true);

            // Bước 1: Load employees, departments, positions TRƯỚC
            await Promise.all([
                fetchEmployees(),
                fetchDepartments(),
                fetchPositions()
            ]);

            // Bước 2: Nếu là edit, gọi API getById và map data
            if (mode === 'edit' && transferId) {
                await fetchTransferData();
            } else {
                resetForm();
            }
        } catch (error) {
            console.error('Lỗi khi load dữ liệu modal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await employeeApi.getAll();
            const empList = Array.isArray(data) ? data : [];
            setEmployees(empList);
            return empList; // Return để dùng trong Promise.all
        } catch (error) {
            console.error('Lỗi khi lấy danh sách nhân viên:', error);
            return [];
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await unitApi.getAll();
            const deptList = Array.isArray(data) ? data : [];
            setDepartments(deptList);
            return deptList;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách phòng ban:', error);
            return [];
        }
    };

    const fetchPositions = async () => {
        try {
            const data = await jobTitleApi.getAll();
            const posList = Array.isArray(data) ? data : [];
            setPositions(posList);
            return posList;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách chức vụ:', error);
            return [];
        }
    };

    const fetchTransferData = async () => {
        try {
            const data = await transferApi.getById(transferId!);
            console.log('Transfer data from API:', data);

            // Lấy danh sách hiện tại từ state (đã load xong ở trên)
            const currentEmployees = employees.length > 0 ? employees : await employeeApi.getAll();
            const currentDepartments = departments.length > 0 ? departments : await unitApi.getAll();
            const currentPositions = positions.length > 0 ? positions : await jobTitleApi.getAll();

            // Map từ name sang ID
            const employee = currentEmployees.find(e => e.fullName === data.employeeName);
            const department = currentDepartments.find(d => d.name === data.toDepartmentName);
            const position = currentPositions.find(p => p.name === data.toPositionName);

            console.log('Mapped IDs:', {
                employee: employee?.id,
                department: department?.id,
                position: position?.id
            });

            // Format effectiveDate từ "2025-12-04 02:20:49.655470" sang "2025-12-04"
            let formattedDate = '';
            if (data.effectiveDate) {
                formattedDate = data.effectiveDate.split(' ')[0];
            } else if (data.createdAt) {
                formattedDate = data.createdAt.split(' ')[0];
            }

            setFormData({
                id: data.id || '',
                employeeId: employee?.id?.toString() || '',
                toDepartmentId: department?.id?.toString() || '',
                toPositionId: position?.id?.toString() || '',
                description: data.description || '',
                note: data.note || '',
                effectiveDate: formattedDate,
            });

            // Lưu keyFile từ backend
            if (data.keyFile) {
                setExistingFileKey(data.keyFile);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin điều động:', error);
            alert('Không thể tải thông tin điều động');
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            employeeId: '',
            toDepartmentId: '',
            toPositionId: '',
            description: '',
            note: '',
            effectiveDate: '',
        });
        setSelectedFile(null);
        setExistingFileKey('');
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Kiểm tra kích thước file (10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File quá lớn. Vui lòng chọn file nhỏ hơn 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRemoveNewFile = () => {
        setSelectedFile(null);
        // Reset input file
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleRemoveExistingFile = () => {
        setExistingFileKey('');
    };

    const handleDownloadFile = () => {
        if (!existingFileKey) {
            alert('Không có file để tải xuống');
            return;
        }

        const fileUrl = transferApi.getFileUrl(existingFileKey);
        console.log("Opening file:", fileUrl);
        window.open(fileUrl, "_blank");
    };

    const getFileName = (keyFile: string) => {
        // Lấy tên file từ keyFile path
        const parts = keyFile.split('/');
        return parts[parts.length - 1];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        if (!formData.employeeId || !formData.toDepartmentId || !formData.toPositionId) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        try {
            setIsLoading(true);

            // Tạo FormData để gửi file
            const submitFormData = new FormData();

            // Append các field text
            if (mode === 'edit' && formData.id) {
                submitFormData.append('id', formData.id);
            }
            submitFormData.append('employeeId', formData.employeeId.toString());
            submitFormData.append('toDepartmentId', formData.toDepartmentId.toString());
            submitFormData.append('toPositionId', formData.toPositionId.toString());
            submitFormData.append('description', formData.description || '');
            submitFormData.append('note', formData.note || '');
            submitFormData.append('effectiveDate', formData.effectiveDate || '');

            // Append file nếu có file mới
            if (selectedFile) {
                submitFormData.append('file', selectedFile);
            } else if (existingFileKey && mode === 'edit') {
                // Giữ file cũ nếu không chọn file mới
                submitFormData.append('keyFile', existingFileKey);
            }

            if (mode === 'create') {
                await transferApi.create(submitFormData);
                alert('Tạo quyết định điều động thành công');
            } else {
                await transferApi.update(submitFormData);
                alert('Cập nhật quyết định điều động thành công');
            }

            onSuccess?.();
            onClose();
            resetForm();
        } catch (error) {
            console.error('Lỗi khi lưu quyết định điều động:', error);
            alert(`Lỗi: ${mode === 'create' ? 'Tạo' : 'Cập nhật'} quyết định điều động thất bại`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Tạo quyết định điều động' : 'Cập nhật quyết định điều động'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nhân viên */}
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">
                            Nhân viên <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.employeeId.toString()}
                            onValueChange={(value) => handleChange('employeeId', value)}
                            disabled={mode === 'edit'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn nhân viên" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp: any) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.fullName} - {emp.employeeCode}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phòng ban đích */}
                    <div className="space-y-2">
                        <Label htmlFor="toDepartmentId">
                            Điều động đến phòng ban <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.toDepartmentId.toString()}
                            onValueChange={(value) => handleChange('toDepartmentId', value)}
                            disabled={mode === 'edit'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phòng ban" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept: any) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Chức vụ đích */}
                    <div className="space-y-2">
                        <Label htmlFor="toPositionId">
                            Chức vụ mới <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.toPositionId.toString()}
                            onValueChange={(value) => handleChange('toPositionId', value)}
                            disabled={mode === 'edit'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn chức vụ" />
                            </SelectTrigger>
                            <SelectContent>
                                {positions.map((pos: any) => (
                                    <SelectItem key={pos.id} value={pos.id.toString()}>
                                        {pos.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Ngày hiệu lực */}
                    <div className="space-y-2">
                        <Label htmlFor="effectiveDate">Ngày hiệu lực</Label>
                        <Input
                            id="effectiveDate"
                            type="date"
                            value={formData.effectiveDate}
                            onChange={(e) => handleChange('effectiveDate', e.target.value)}
                        />
                    </div>

                    {/* Mô tả */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Nhập mô tả..."
                            rows={3}
                        />
                    </div>

                    {/* Ghi chú */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Ghi chú</Label>
                        <Textarea
                            id="note"
                            value={formData.note}
                            onChange={(e) => handleChange('note', e.target.value)}
                            placeholder="Nhập ghi chú..."
                            rows={3}
                        />
                    </div>

                    {/* File upload */}
                    <div className="space-y-2">
                        <Label htmlFor="file-upload">File đính kèm</Label>

                        {/* Hiển thị file hiện tại (khi edit) */}
                        {existingFileKey && !selectedFile && (
                            <div className="border rounded-lg p-3 bg-blue-50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        <span className="text-sm truncate" title={getFileName(existingFileKey)}>
                                            {getFileName(existingFileKey)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDownloadFile}
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                            title="Tải xuống"
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleRemoveExistingFile}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            title="Xóa file"
                                            disabled={mode === 'edit'}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-600">File hiện tại</p>
                            </div>
                        )}

                        {/* Hiển thị file mới được chọn */}
                        {selectedFile && (
                            <div className="border rounded-lg p-3 bg-green-50 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Upload className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <span className="text-sm truncate" title={selectedFile.name}>
                                            {selectedFile.name}
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveNewFile}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-green-600">File mới (sẽ thay thế file cũ)</p>
                            </div>
                        )}

                        {/* Input file */}
                        <div className="flex items-center gap-2">
                            <Input
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('file-upload')?.click()}
                                className="w-full"
                                disabled={mode === 'edit'}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {existingFileKey || selectedFile ? 'Chọn file khác' : 'Chọn file'}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Hỗ trợ: PDF, Word, Excel, hình ảnh (tối đa 10MB)
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            {isLoading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}