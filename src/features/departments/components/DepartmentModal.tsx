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

const emptyForm = { name: '', parent: '', type: 'Phòng', code: '' };

// Map giá trị từ API sang giá trị hiển thị
const TYPE_MAP = {
    'PHONG': 'Phòng',
    'BAN': 'Ban',
    'PHAN_XUONG': 'Phân xưởng',
    'KHO_CANG': 'Kho cảng',
    // Fallback cho các giá trị đã có dấu
    'Phòng': 'Phòng',
    'Ban': 'Ban',
    'Phân xưởng': 'Phân xưởng',
    'Kho cảng': 'Kho cảng',
};

// Map ngược lại khi gửi lên API
const TYPE_TO_API = {
    'Phòng': 'PHONG',
    'Ban': 'BAN',
    'Phân xưởng': 'PHAN_XUONG',
    'Kho cảng': 'KHO_CANG',
};

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

    const isEditMode = !!editingDept;

    // Reset form khi mở modal
    useEffect(() => {
        if (open) {
            if (editingDept) {
                const apiType = (editingDept.type || 'PHONG').trim();
                const displayType = TYPE_MAP[apiType] || 'Phòng';

                setForm({
                    name: editingDept.name || '',
                    parent: editingDept.parent || editingDept.parentId || '',
                    type: displayType,
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

        if (!name) {
            onError({ title: 'Lỗi', description: 'Vui lòng nhập tên phòng ban' });
            return;
        }

        // Kiểm tra không được chọn chính mình làm phòng ban cha
        if (isEditMode && editingDept && String(editingDept.id) === String(parentId)) {
            onError({ title: 'Lỗi', description: 'Không thể chọn chính phòng ban làm phòng ban cha' });
            return;
        }

        // Kiểm tra trùng tên (chỉ khi thêm mới)
        if (!isEditMode) {
            const exists = departments.some(
                (d) =>
                    d.name.toLowerCase() === name.toLowerCase() &&
                    (d.parentId || null) === (parentId ? String(parentId) : null)
            );
            if (exists) {
                onError({ title: 'Lỗi', description: 'Phòng ban đã tồn tại' });
                return;
            }
        }

        try {
            setSubmitting(true);

            const payload: {
                id?: number;
                company: { id: number };
                name: string;
                code?: string;
                type: string;
                parent?: { id: number };
            } = {
                company: { id: 2 },
                name,
                type: TYPE_TO_API[form.type] || form.type,
            };

            // Chỉ thêm code nếu có giá trị
            if (code) {
                payload.code = code;
            }

            // Chỉ thêm parent khi có giá trị
            if (parentId) {
                payload.parent = { id: parentId };
            }

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
            onError({
                title: 'Lỗi',
                description: isEditMode ? 'Không thể cập nhật phòng ban' : 'Không thể thêm phòng ban'
            });
            console.error(error);
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
                            placeholder="VD: Kỹ thuật"
                            value={form.name}
                            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label>Mã phòng ban</Label>
                        <Input
                            placeholder="VD: KT01"
                            value={form.code}
                            onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label>Loại *</Label>
                        <Select
                            value={form.type}
                            onValueChange={(v) => setForm((s) => ({ ...s, type: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại phòng ban" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Phòng">Phòng</SelectItem>
                                <SelectItem value="Ban">Ban</SelectItem>
                                <SelectItem value="Phân xưởng">Phân xưởng</SelectItem>
                                <SelectItem value="Kho cảng">Kho cảng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Phòng ban cha (tùy chọn)</Label>
                        <Select
                            value={form.parent || 'none'}
                            onValueChange={(v) => setForm((s) => ({ ...s, parent: v === 'none' ? '' : v }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Không chọn (là phòng ban cha)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Không chọn (phòng ban gốc)</SelectItem>
                                {departments
                                    .filter((d) => !isEditMode || d.id !== editingDept?.id)
                                    .map((d) => (
                                        <SelectItem key={d.id} value={d.id}>
                                            {d.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {isEditMode ? 'Lưu' : 'Thêm'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}