import { useEffect, useState } from "react";
import { Layout } from "@/shared/components/layouts/Layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import Button from "@/shared/components/ui/button/Button";
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
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import mockData from "@/mock/data";

export default function DepartmentList() {
  const navigate = useNavigate();
  const toast = ({ title, description }) => alert(`${title}\n${description}`);

  const [departments, setDepartments] = useState(
    mockData.departments.map((d) => ({ ...d, id: String(d.id) }))
  );

  const emptyForm = { name: "", parentId: "" };
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingDept, setEditingDept] = useState(null);

  useEffect(() => {
    setDepartments((prev) =>
      prev.map((d) => ({
        ...d,
        id: String(d.id),
        parentId: d.parentId ? String(d.parentId) : null,
      }))
    );
  }, []);

  const countEmployees = (deptId) =>
    mockData.employees.filter(
      (e) =>
        String(e.departmentId) === String(deptId) && e.status !== "Resigned"
    ).length;

  const handleAddDepartment = () => {
    const name = (form.name || "").trim();
    const parentId = form.parentId === "none" || !form.parentId ? null : form.parentId;

    if (!name) return toast({ title: "Lỗi", description: "Vui lòng nhập tên phòng ban" });

    const exists = departments.some(
      (d) => d.name.toLowerCase() === name.toLowerCase() && (d.parentId || null) === parentId
    );
    if (exists) return toast({ title: "Lỗi", description: "Phòng ban đã tồn tại" });

    const newDept = {
      id: Date.now().toString(),
      name,
      parentId,
      managerId: null,
    };

    setDepartments((prev) => [...prev, newDept]);
    setForm(emptyForm);
    setAddOpen(false);
    toast({ title: "Thành công", description: `Đã thêm phòng ban "${name}"` });
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setForm({
      name: dept.name,
      parentId: dept.parentId || "",
    });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    const name = (form.name || "").trim();
    const parentId = form.parentId === "none" || !form.parentId ? null : form.parentId;

    if (!name) return toast({ title: "Lỗi", description: "Vui lòng nhập tên phòng ban" });
    if (editingDept && editingDept.id === parentId)
      return toast({ title: "Lỗi", description: "Không thể chọn chính phòng ban làm phòng ban cha" });

    setDepartments((prev) =>
      prev.map((d) => (d.id === editingDept.id ? { ...d, name, parentId } : d))
    );
    setEditOpen(false);
    setEditingDept(null);
    setForm(emptyForm);
    toast({ title: "Thành công", description: "Cập nhật phòng ban thành công" });
  };

  const openDeleteConfirm = (dept) => {
    setEditingDept(dept);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!editingDept) return;

    setDepartments((prev) =>
      prev
        .filter((d) => d.id !== editingDept.id)
        .map((d) => (d.parentId === editingDept.id ? { ...d, parentId: null } : d))
    );

    setDeleteOpen(false);
    toast({ title: "Đã xóa", description: `Đã xóa ${editingDept.name}` });
    setEditingDept(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Danh sách phòng ban</h1>
            <p className="text-muted-foreground">
              Quản lý cơ cấu phòng ban và nhân sự
            </p>
          </div>
        </div>

        <Button
          onClick={() => {
            setForm(emptyForm);
            setAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm phòng ban
        </Button>
      </div>

      {/* Table hiển thị danh sách */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng ban</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="p-3 border">Tên phòng ban</th>
                  <th className="p-3 border">Phòng ban cha</th>
                  <th className="p-3 border">Trưởng phòng</th>
                  <th className="p-3 border text-center">Số nhân viên</th>
                  <th className="p-3 border text-center w-[120px]">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {departments.length > 0 ? (
                  departments.map((dept) => {
                    const manager = mockData.employees.find(
                      (e) => String(e.id) === String(dept.managerId)
                    );
                    const parentDept = departments.find((d) => d.id === dept.parentId);

                    return (
                      <tr key={dept.id} className="hover:bg-muted/40">
                        <td className="p-3 border font-medium">{dept.name}</td>
                        <td className="p-3 border">
                          {parentDept ? parentDept.name : (
                            <span className="text-muted-foreground italic">
                              (Phòng gốc)
                            </span>
                          )}
                        </td>
                        <td className="p-3 border">
                          {manager ? (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span>
                                {manager.firstName} {manager.lastName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">
                              Chưa có trưởng phòng
                            </span>
                          )}
                        </td>
                        <td className="p-3 border text-center">
                          <Badge variant="secondary" className="flex items-center gap-1 justify-center">
                            <Users className="h-3 w-3" />
                            {countEmployees(dept.id)}
                          </Badge>
                        </td>
                        <td className="p-3 border text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => openEditModal(dept)}
                              className="h-7 w-7"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openDeleteConfirm(dept)}
                              className="h-7 w-7"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-muted-foreground">
                      Không có phòng ban nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Thêm / Sửa / Xóa */}
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
                onValueChange={(v) =>
                  setForm((s) => ({ ...s, parentId: v === "none" ? "" : v }))
                }
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
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Hủy
              </Button>
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
                value={form.name}
                onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Phòng ban cha (tùy chọn)</Label>
              <Select
                value={form.parentId || "none"}
                onValueChange={(v) =>
                  setForm((s) => ({ ...s, parentId: v === "none" ? "" : v }))
                }
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
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setEditingDept(null);
                }}
              >
                Hủy
              </Button>
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
              Bạn có chắc muốn xóa{" "}
              <span className="font-semibold">{editingDept?.name}</span>? Các phòng con sẽ được đưa lên cấp gốc.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
