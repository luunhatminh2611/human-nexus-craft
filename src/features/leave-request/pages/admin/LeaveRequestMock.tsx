import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

// ================= MOCK DATA =================
const initialLeaveRequests = [
  {
    id: 1,
    title: "Nghỉ phép năm",
    createBy: "Nguyễn Văn A",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    reason: "Du lịch cùng gia đình",
    status: "PENDING",
  },
  {
    id: 2,
    title: "Nghỉ ốm",
    createBy: "Trần Thị B",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    reason: "Ốm sốt",
    status: "APPROVED",
  },
  {
    id: 3,
    title: "Nghỉ việc riêng",
    createBy: "Lê Văn C",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    reason: "Giải quyết việc gia đình",
    status: "REJECTED",
  },
];

export default function AdminLeaveRequestMockPage() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // ================= HELPERS =================
  const resetForm = () => {
    setFormData({ title: "", startDate: "", endDate: "", reason: "" });
    setEditingLeave(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: <Badge variant="secondary">Chờ duyệt</Badge>,
      APPROVED: <Badge className="bg-green-500">Đã duyệt</Badge>,
      REJECTED: <Badge variant="destructive">Từ chối</Badge>,
    };
    return map[status] || status;
  };

  // ================= CRUD =================
  const handleCreate = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      title: leave.title,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;
    setLeaveRequests((prev) => prev.filter((l) => l.id !== id));
    toast.success("Đã xóa đơn nghỉ phép");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (editingLeave) {
      setLeaveRequests((prev) =>
        prev.map((l) =>
          l.id === editingLeave.id
            ? { ...l, ...formData }
            : l
        )
      );
      toast.success("Cập nhật đơn thành công");
    } else {
      setLeaveRequests((prev) => [
        ...prev,
        {
          id: Date.now(),
          createBy: "Mock User",
          status: "PENDING",
          ...formData,
        },
      ]);
      toast.success("Tạo đơn nghỉ phép mới");
    }

    setIsModalOpen(false);
    resetForm();
  };

  // ================= ADMIN ACTION =================
  const handleApprove = (id) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "APPROVED" } : l
      )
    );
    toast.success("Đã duyệt đơn nghỉ phép");
  };

  const handleReject = (id) => {
    setLeaveRequests((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "REJECTED" } : l
      )
    );
    toast.success("Đã từ chối đơn nghỉ phép");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin duyệt đơn nghỉ phép (Mock)</h1>
        <Button onClick={handleCreate} className="bg-green-500">
          <Plus className="h-4 w-4 mr-2" /> Tạo đơn
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn nghỉ phép</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Người nộp</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.title}</TableCell>
                  <TableCell>{leave.createBy}</TableCell>
                  <TableCell>
                    {leave.startDate} → {leave.endDate}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {leave.reason}
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      {leave.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(leave.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(leave.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(leave)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(leave.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL CREATE / EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLeave ? "Chỉnh sửa đơn nghỉ phép" : "Tạo đơn nghỉ phép"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Tiêu đề"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
            <Textarea
              placeholder="Lý do"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" className="bg-blue-500">
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
