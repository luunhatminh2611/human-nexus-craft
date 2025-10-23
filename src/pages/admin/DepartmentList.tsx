import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    User,
    Users,
    Edit,
    Trash2,
    Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import mockData from "@/mock/data";
import { useToast } from "@/hooks/use-toast"; // nếu bạn có, nếu không remove / thay bằng khác

export default function DepartmentList() {
    const navigate = useNavigate();
    const toast = ({ title, description }) => alert(`${title}\n${description}`);

    // Dùng state cục bộ để quản lý danh sách phòng ban (cập nhật động)
    const [departments, setDepartments] = useState(
        // clone để tránh thay đổi trực tiếp mockData
        mockData.departments.map((d) => ({ ...d, id: String(d.id) }))
    );

    // form state cho thêm & sửa
    const emptyForm = { name: "", parentId: "" };
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [form, setForm] = useState(emptyForm);
    const [editingDept, setEditingDept] = useState(null);

    useEffect(() => {
        setDepartments((prev) =>
            prev.map((d) => ({ ...d, id: String(d.id), parentId: d.parentId ? String(d.parentId) : null }))
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Helper: lấy số nhân viên của department ---
    const countEmployees = (deptId) =>
        mockData.employees.filter((e) => String(e.departmentId) === String(deptId) && e.status !== "Resigned").length;

    // --- Thêm phòng ban ---
    const handleAddDepartment = () => {
        const name = (form.name || "").trim();
        const parentId = form.parentId === "none" || !form.parentId ? null : form.parentId;

        if (!name) {
            if (toast) toast({ title: "Lỗi", description: "Vui lòng nhập tên phòng ban" });
            return;
        }

        // optional: tránh trùng tên cùng parent
        const exists = departments.some(
            (d) => d.name.toLowerCase() === name.toLowerCase() && (d.parentId || null) === parentId
        );
        if (exists) {
            if (toast) toast({ title: "Lỗi", description: "Phòng ban đã tồn tại" });
            return;
        }

        const newDept = {
            id: Date.now().toString(),
            name,
            parentId,
            managerId: null,
        };

        setDepartments((prev) => [...prev, newDept]);
        setForm(emptyForm);
        setAddOpen(false);
        if (toast) toast({ title: "Thành công", description: `Đã thêm phòng ban "${name}"` });
    };

    // --- Mở modal chỉnh sửa ---
    const openEditModal = (dept) => {
        setEditingDept(dept);
        setForm({
            name: dept.name,
            parentId: dept.parentId || "",
        });
        setEditOpen(true);
    };

    // --- Lưu chỉnh sửa ---
    const handleSaveEdit = () => {
        const name = (form.name || "").trim();
        const parentId = form.parentId === "none" || !form.parentId ? null : form.parentId;

        if (!name) {
            if (toast) toast({ title: "Lỗi", description: "Vui lòng nhập tên phòng ban" });
            return;
        }

        // tránh chọn chính nó làm parent
        if (editingDept && editingDept.id === parentId) {
            if (toast) toast({ title: "Lỗi", description: "Không thể chọn chính phòng ban làm phòng ban cha" });
            return;
        }

        setDepartments((prev) =>
            prev.map((d) =>
                d.id === editingDept.id ? { ...d, name, parentId } : d
            )
        );
        setEditOpen(false);
        setEditingDept(null);
        setForm(emptyForm);
        if (toast) toast({ title: "Thành công", description: "Cập nhật phòng ban thành công" });
    };

    // --- Xóa phòng ban ---
    const openDeleteConfirm = (dept) => {
        setEditingDept(dept);
        setDeleteOpen(true);
    };

    const handleDelete = () => {
        if (!editingDept) return;

        // Option: khi xóa phòng ban cha, ta có thể
        // - xóa luôn các phòng con, hoặc
        // - set parentId của con = null
        // Ở đây mình sẽ set parentId của các phòng con thành null (đưa lên gốc)
        setDepartments((prev) =>
            prev
                .filter((d) => d.id !== editingDept.id)
                .map((d) => (d.parentId === editingDept.id ? { ...d, parentId: null } : d))
        );

        setDeleteOpen(false);
        if (toast) toast({ title: "Đã xóa", description: `Đã xóa ${editingDept.name}` });
        setEditingDept(null);
    };

    // --- Render ---
    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Danh sách phòng ban</h1>
                            <p className="text-muted-foreground">Quản lý cơ cấu phòng ban và nhân sự</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => {
                            // reset form trước khi mở
                            setForm(emptyForm);
                            setAddOpen(true);
                        }}>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm phòng ban
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {departments.map((dept) => {
                        const employees = mockData.employees.filter(
                            (e) => String(e.departmentId) === String(dept.id) && e.status !== "Resigned"
                        );
                        const manager = mockData.employees.find((e) => String(e.id) === String(dept.managerId));
                        const parentDept = departments.find((d) => d.id === dept.parentId);

                        return (
                            <Card key={dept.id} className="relative transition-all hover:shadow-lg p-4">
                                {/* Buttons top-right */}
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold">{dept.name}</span>
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {countEmployees(dept.id)}
                                            </Badge>
                                        </div>

                                        {/* Icons nằm cùng hàng bên phải */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => openEditModal(dept)}
                                                className="h-6 w-6"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => openDeleteConfirm(dept)}
                                                className="h-6 w-6"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardTitle>

                                    {parentDept && (
                                        <p className="text-xs text-muted-foreground mt-1">Thuộc: {parentDept.name}</p>
                                    )}
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {manager ? (
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-4 w-4 text-primary" />
                                            <span>Trưởng phòng: {manager.firstName} {manager.lastName}</span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Chưa có trưởng phòng</p>
                                    )}

                                    <div>
                                        <p className="text-xs text-muted-foreground mb-2">Nhân viên</p>
                                        <div className="flex flex-wrap gap-2">
                                            {employees.length > 0 ? (
                                                employees.slice(0, 5).map((emp) => (
                                                    <div key={emp.id} className="flex items-center gap-2 bg-muted px-2 py-1 rounded-full text-xs">
                                                        <img src={emp.avatar} alt={`${emp.firstName} ${emp.lastName}`} className="w-6 h-6 rounded-full border" />
                                                        <span>{emp.firstName}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-xs text-muted-foreground">(Chưa có nhân viên)</span>
                                            )}
                                            {employees.length > 5 && (
                                                <Badge variant="outline" className="text-xs">+{employees.length - 5}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Thêm phòng ban mới</DialogTitle>
                            <DialogDescription>Nhập tên và chọn phòng ban cha (nếu có).</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-2">
                            <div>
                                <Label>Tên phòng ban</Label>
                                <Input
                                    placeholder="VD: Kỹ thuật"
                                    value={form.name}
                                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>Phòng ban cha (tùy chọn)</Label>
                                <Select
                                    value={form.parentId || "none"}
                                    onValueChange={(v) => setForm((s) => ({ ...s, parentId: v === "none" ? "" : v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Không chọn (là phòng ban cha)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn (phòng ban gốc)</SelectItem>
                                        {departments.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => { setAddOpen(false); setForm(emptyForm); }}>Hủy</Button>
                                <Button onClick={handleAddDepartment}>Thêm</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
                            <DialogDescription>Chỉnh sửa tên hoặc phòng ban cha.</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-2">
                            <div>
                                <Label>Tên phòng ban</Label>
                                <Input
                                    placeholder="Tên phòng ban"
                                    value={form.name}
                                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <Label>Phòng ban cha (tùy chọn)</Label>
                                <Select
                                    value={form.parentId || "none"}
                                    onValueChange={(v) => setForm((s) => ({ ...s, parentId: v === "none" ? "" : v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Không chọn (phòng ban gốc)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không chọn (phòng ban gốc)</SelectItem>
                                        {departments
                                            .filter((d) => d.id !== editingDept?.id)
                                            .map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => { setEditOpen(false); setEditingDept(null); setForm(emptyForm); }}>Hủy</Button>
                                <Button onClick={handleSaveEdit}>Lưu</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Xóa phòng ban</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc muốn xóa <span className="font-semibold">{editingDept?.name}</span>? Các phòng con của nó sẽ được đưa lên cấp gốc.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => { setDeleteOpen(false); setEditingDept(null); }}>Hủy</Button>
                            <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </Layout>
    );
}
