import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/shared/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/shared/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { unitApi } from '@/features/departments/api/departmentApi';
import { departmentTypeApi } from '@/features/departments/api/departmentTypeApi';
import GenericSearchSelect from '@/features/employees/components/GenericSearchSelect';
import { categoryConfigs } from '@/features/employees/components/CategoriesConfig';

const emptyForm = { name: '', parent: '', departmentTypeId: '', code: '' };

export function DepartmentFormModal({
    open,
    onOpenChange,
    editingDept,
    departments,
    onSuccess,
    onError,
}) {
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [departmentTypes, setDepartmentTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(false);

    const isEditMode = !!editingDept;

    // Load danh sách loại phòng ban
    useEffect(() => {
        if (open) {
            fetchDepartmentTypes();
        }
    }, [open]);

    const fetchDepartmentTypes = async () => {
        try {
            setLoadingTypes(true);
            const data = await departmentTypeApi.getAll();
            // Chỉ lấy các loại phòng ban đang active
            const activeTypes = (data || []).filter(type => type.isActive);
            setDepartmentTypes(activeTypes);
        } catch (error) {
            console.error('Error loading department types:', error);
            onError({ title: 'Lỗi', description: 'Không thể tải danh sách loại phòng ban' });
        } finally {
            setLoadingTypes(false);
        }
    };

    // Reset form khi mở modal
    useEffect(() => {
        if (open) {
            if (editingDept) {
                console.log('Editing dept:', editingDept);
                setForm({
                    name: editingDept.name || '',
                    parent: editingDept.parent || editingDept.parentId || '',
                    departmentTypeId: editingDept.departmentType?.id ? String(editingDept.departmentType.id) : '',
                    code: editingDept.code || '',
                });
            } else {
                setForm({ ...emptyForm });
            }
        }
    }, [open, editingDept]);

    const handleSubmit = async () => {
        const name = (form.name || '').trim();
        const parentId = form.parent === 'none' || !form.parent ? null : Number(form.parent);
        const code = (form.code || '').trim();
        const departmentTypeId = form.departmentTypeId ? Number(form.departmentTypeId) : null;

        // Validation
        if (!name) {
            onError({ title: 'Lỗi', description: 'Vui lòng nhập tên phòng ban' });
            return;
        }

        if (!departmentTypeId) {
            onError({ title: 'Lỗi', description: 'Vui lòng chọn loại phòng ban' });
            return;
        }

        // Kiểm tra không được chọn chính mình làm phòng ban cha
        if (isEditMode && editingDept && String(editingDept.id) === String(parentId)) {
            onError({ title: 'Lỗi', description: 'Không thể chọn chính phòng ban làm phòng ban gốc' });
            return;
        }

        // Kiểm tra trùng tên (chỉ khi thêm mới hoặc thay đổi tên)
        if (!isEditMode || (editingDept && editingDept.name !== name)) {
            const exists = departments.some(
                (d) =>
                    d.name.toLowerCase() === name.toLowerCase() &&
                    (!isEditMode || d.id !== editingDept.id)
            );
            if (exists) {
                onError({ title: 'Lỗi', description: 'Tên phòng ban đã tồn tại' });
                return;
            }
        }

        try {
            setSubmitting(true);

            const payload: any = {
                company: { id: 2 }, // Hard-coded company ID
                name,
                code: code || undefined, // Chỉ gửi code nếu có giá trị
                departmentType: { id: departmentTypeId },
                parent: parentId ? { id: parentId } : null,
            };

            // Nếu là edit mode, thêm id
            if (isEditMode) {
                payload.id = Number(editingDept.id);
            }

            console.log('Payload gửi lên:', JSON.stringify(payload, null, 2));

            if (isEditMode) {
                await unitApi.update(payload);
                onError({ title: 'Thành công', description: 'Cập nhật phòng ban thành công' });
            } else {
                await unitApi.create(payload);
                onError({ title: 'Thành công', description: `Đã thêm phòng ban "${name}"` });
            }

            onSuccess();
            onOpenChange(false);
            setForm(emptyForm);
        } catch (error) {
            const errorMessage = error?.response?.data?.message ||
                (isEditMode ? 'Không thể cập nhật phòng ban' : 'Không thể thêm phòng ban');

            onError({
                title: 'Lỗi',
                description: errorMessage
            });
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Chỉnh sửa thông tin phòng ban.' : 'Nhập thông tin phòng ban mới.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                    <div>
                        <Label>Tên phòng ban *</Label>
                        <Input
                            placeholder="Nhập tên phòng ban"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <Label>Mã phòng ban</Label>
                        <Input
                            placeholder="Nhập mã phòng ban"
                            value={form.code}
                            onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                        />
                    </div>

                    <div>
                        <Label>Loại phòng ban *</Label>
                        <GenericSearchSelect
                            api={categoryConfigs.departmentType.api}
                            config={categoryConfigs.departmentType}
                            value={form.departmentTypeId}
                            onChange={(v) => setForm((s) => ({ ...s, departmentTypeId: v }))}
                        />
                        {departmentTypes.length === 0 && !loadingTypes && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Chưa có loại phòng ban. Vui lòng thêm loại phòng ban trong phần Danh mục.
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>Phòng ban gốc</Label>
                        <Select
                            value={form.parent || 'none'}
                            onValueChange={(v) => setForm((s) => ({ ...s, parent: v === 'none' ? '' : v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn phòng ban gốc" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    <span className="italic text-muted-foreground">Không có (phòng ban gốc)</span>
                                </SelectItem>
                                {departments
                                    .filter((d) => !isEditMode || d.id !== editingDept?.id)
                                    .map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            <div className="flex flex-col">
                                                <span>{d.name}</span>
                                                <span className="text-xs text-muted-foreground">{d.code}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting || loadingTypes}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditMode ? 'Lưu' : 'Thêm phòng ban'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}