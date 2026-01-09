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
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Plus, Edit, Trash2, Check, X, Search, Upload, Download, Calendar, FileText, User } from "lucide-react";
import { toast } from "sonner";

// ================= MOCK DATA =================
const initialLeaveRequests = [
  {
    id: 1,
    title: "Nghỉ phép năm",
    createBy: "Nguyễn Văn A",
    employeeId: "NV001",
    department: "Phòng IT",
    startDate: "2025-03-01",
    endDate: "2025-03-03",
    totalDays: 3,
    leaveType: "ANNUAL",
    reason: "Du lịch cùng gia đình, nghỉ ngơi sau dự án",
    status: "PENDING",
    attachmentName: "don_xin_nghi_phep_NguyenVanA.pdf",
    createdAt: "2025-01-05",
    approvedBy: null,
    approvedAt: null,
    rejectedReason: null,
  },
  {
    id: 2,
    title: "Nghỉ ốm",
    createBy: "Trần Thị B",
    employeeId: "NV002",
    department: "Phòng Marketing",
    startDate: "2025-02-10",
    endDate: "2025-02-12",
    totalDays: 3,
    leaveType: "SICK",
    reason: "Ốm sốt, cần nghỉ ngơi điều trị",
    status: "APPROVED",
    attachmentName: "giay_nghi_om_TranThiB.pdf",
    createdAt: "2025-01-08",
    approvedBy: "Admin",
    approvedAt: "2025-01-09",
    rejectedReason: null,
  },
  {
    id: 3,
    title: "Nghỉ việc riêng",
    createBy: "Lê Văn C",
    employeeId: "NV003",
    department: "Phòng Kế toán",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    totalDays: 1,
    leaveType: "PERSONAL",
    reason: "Giải quyết việc gia đình cá nhân",
    status: "REJECTED",
    attachmentName: "don_xin_nghi_LeVanC.pdf",
    createdAt: "2025-01-10",
    approvedBy: "Admin",
    approvedAt: "2025-01-11",
    rejectedReason: "Thời điểm này phòng ban đang bận, vui lòng chọn thời gian khác",
  },
  {
    id: 4,
    title: "Nghỉ thai sản",
    createBy: "Phạm Thị D",
    employeeId: "NV004",
    department: "Phòng Nhân sự",
    startDate: "2025-04-01",
    endDate: "2025-07-31",
    totalDays: 122,
    leaveType: "MATERNITY",
    reason: "Nghỉ thai sản theo quy định",
    status: "PENDING",
    attachmentName: "giay_xac_nhan_thai_san_PhamThiD.pdf",
    createdAt: "2025-01-12",
    approvedBy: null,
    approvedAt: null,
    rejectedReason: null,
  },
];

const leaveTypeLabels = {
  ANNUAL: "Phép năm",
  SICK: "Nghỉ ốm",
  PERSONAL: "Việc riêng",
  MATERNITY: "Thai sản",
  UNPAID: "Không lương",
};

const statusLabels = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

export default function AdminLeaveRequestPage() {
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [viewingLeave, setViewingLeave] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("ALL");

  const [formData, setFormData] = useState({
    title: "",
    employeeId: "",
    createBy: "",
    department: "",
    startDate: "",
    endDate: "",
    leaveType: "ANNUAL",
    reason: "",
    attachmentName: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // ================= HELPERS =================
  const resetForm = () => {
    setFormData({
      title: "",
      employeeId: "",
      createBy: "",
      department: "",
      startDate: "",
      endDate: "",
      leaveType: "ANNUAL",
      reason: "",
      attachmentName: "",
    });
    setEditingLeave(null);
    setSelectedFile(null);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>,
      APPROVED: <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>,
      REJECTED: <Badge className="bg-red-100 text-red-800">Từ chối</Badge>,
    };
    return map[status] || status;
  };

  // ================= FILTERING =================
  const filteredRequests = leaveRequests.filter((leave) => {
    const matchSearch =
      leave.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.createBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === "ALL" || leave.status === statusFilter;
    const matchType = leaveTypeFilter === "ALL" || leave.leaveType === leaveTypeFilter;

    return matchSearch && matchStatus && matchType;
  });

  // ================= SELECTION =================
  const handleSelectAll = (checked) => {
    if (checked) {
      const pendingIds = filteredRequests
        .filter((l) => l.status === "PENDING")
        .map((l) => l.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // ================= CRUD =================
  const handleCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      title: leave.title,
      employeeId: leave.employeeId,
      createBy: leave.createBy,
      department: leave.department,
      startDate: leave.startDate,
      endDate: leave.endDate,
      leaveType: leave.leaveType,
      reason: leave.reason,
      attachmentName: leave.attachmentName || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn này?")) return;
    setLeaveRequests((prev) => prev.filter((l) => l.id !== id));
    toast.success("Đã xóa đơn nghỉ phép");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData((prev) => ({ ...prev, attachmentName: file.name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.createBy) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    const totalDays = calculateDays(formData.startDate, formData.endDate);

    if (editingLeave) {
      setLeaveRequests((prev) =>
        prev.map((l) =>
          l.id === editingLeave.id
            ? { ...l, ...formData, totalDays }
            : l
        )
      );
      toast.success("Cập nhật đơn thành công");
    } else {
      setLeaveRequests((prev) => [
        {
          id: Date.now(),
          ...formData,
          totalDays,
          status: "PENDING",
          createdAt: new Date().toISOString().split("T")[0],
          approvedBy: null,
          approvedAt: null,
          rejectedReason: null,
        },
        ...prev,
      ]);
      toast.success("Tạo đơn nghỉ phép mới");
    }

    setIsModalOpen(false);
    resetForm();
  };

  // ================= ADMIN ACTIONS =================
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn");
      return;
    }

    setLeaveRequests((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id)
          ? {
              ...l,
              status: "APPROVED",
              approvedBy: "Admin",
              approvedAt: new Date().toISOString().split("T")[0],
            }
          : l
      )
    );
    toast.success(`Đã duyệt ${selectedIds.length} đơn`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn");
      return;
    }

    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    setLeaveRequests((prev) =>
      prev.map((l) =>
        selectedIds.includes(l.id)
          ? {
              ...l,
              status: "REJECTED",
              approvedBy: "Admin",
              approvedAt: new Date().toISOString().split("T")[0],
              rejectedReason: reason,
            }
          : l
      )
    );
    toast.success(`Đã từ chối ${selectedIds.length} đơn`);
    setSelectedIds([]);
  };

  const handleViewDetail = (leave) => {
    setViewingLeave(leave);
    setIsDetailModalOpen(true);
  };

  // ================= STATISTICS =================
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((l) => l.status === "PENDING").length,
    approved: leaveRequests.filter((l) => l.status === "APPROVED").length,
    rejected: leaveRequests.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đơn nghỉ phép</h1>
          <p className="text-muted-foreground">Duyệt và theo dõi đơn nghỉ phép của nhân viên</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Tạo đơn
        </Button>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mã NV, phòng ban..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>

            <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Loại phép" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                <SelectItem value="ANNUAL">Phép năm</SelectItem>
                <SelectItem value="SICK">Nghỉ ốm</SelectItem>
                <SelectItem value="PERSONAL">Việc riêng</SelectItem>
                <SelectItem value="MATERNITY">Thai sản</SelectItem>
                <SelectItem value="UNPAID">Không lương</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                onClick={handleBulkApprove}
                disabled={selectedIds.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Duyệt ({selectedIds.length})
              </Button>
              <Button
                onClick={handleBulkReject}
                disabled={selectedIds.length === 0}
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Từ chối ({selectedIds.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length ===
                        filteredRequests.filter((l) => l.status === "PENDING").length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Loại phép</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Số ngày</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Không tìm thấy đơn nghỉ phép nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      {leave.status === "PENDING" && (
                        <Checkbox
                          checked={selectedIds.includes(leave.id)}
                          onCheckedChange={(checked) => handleSelectOne(leave.id, checked)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{leave.title}</p>
                        <p className="text-sm text-muted-foreground">{leave.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{leave.createBy}</p>
                        <p className="text-sm text-muted-foreground">{leave.employeeId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{leaveTypeLabels[leave.leaveType]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{leave.startDate}</div>
                        <div className="text-muted-foreground">→ {leave.endDate}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{leave.totalDays}</span> ngày
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(leave)}
                          title="Xem chi tiết"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(leave)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(leave.id)}
                          title="Xóa"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLeave ? "Chỉnh sửa đơn nghỉ phép" : "Tạo đơn nghỉ phép mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề đơn *</Label>
              <Input
                id="title"
                placeholder="VD: Nghỉ phép năm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createBy">Họ tên nhân viên *</Label>
                <Input
                  id="createBy"
                  placeholder="VD: Nguyễn Văn A"
                  value={formData.createBy}
                  onChange={(e) => setFormData({ ...formData, createBy: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Mã nhân viên *</Label>
                <Input
                  id="employeeId"
                  placeholder="VD: NV001"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="department">Phòng ban *</Label>
              <Input
                id="department"
                placeholder="VD: Phòng IT"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="leaveType">Loại phép *</Label>
              <Select
                value={formData.leaveType}
                onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">Phép năm</SelectItem>
                  <SelectItem value="SICK">Nghỉ ốm</SelectItem>
                  <SelectItem value="PERSONAL">Việc riêng</SelectItem>
                  <SelectItem value="MATERNITY">Thai sản</SelectItem>
                  <SelectItem value="UNPAID">Không lương</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Từ ngày *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endDate">Đến ngày *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {formData.startDate && formData.endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <strong>Tổng số ngày nghỉ:</strong>{" "}
                  {calculateDays(formData.startDate, formData.endDate)} ngày
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Lý do nghỉ phép *</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do nghỉ phép chi tiết..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="attachment">Đơn xin nghỉ phép (file viết tay)</Label>
              <div className="mt-2">
                <label
                  htmlFor="attachment"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    {selectedFile || formData.attachmentName ? (
                      <div>
                        <p className="text-sm font-medium">
                          {selectedFile?.name || formData.attachmentName}
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Click để chọn file đơn viết tay
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPG, PNG (tối đa 10MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="attachment"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DETAIL MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
          </DialogHeader>

          {viewingLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Tiêu đề</Label>
                  <p className="font-medium">{viewingLeave.title}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">{getStatusBadge(viewingLeave.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nhân viên</Label>
                  <p className="font-medium">{viewingLeave.createBy}</p>
                  <p className="text-sm text-muted-foreground">{viewingLeave.employeeId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phòng ban</Label>
                  <p className="font-medium">{viewingLeave.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Loại phép</Label>
                  <Badge variant="outline" className="mt-1">
                    {leaveTypeLabels[viewingLeave.leaveType]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số ngày nghỉ</Label>
                  <p className="font-medium text-lg">{viewingLeave.totalDays} ngày</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Từ ngày</Label>
                  <p className="font-medium">{viewingLeave.startDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Đến ngày</Label>
                  <p className="font-medium">{viewingLeave.endDate}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Lý do nghỉ phép</Label>
                <p className="mt-1 text-sm">{viewingLeave.reason}</p>
              </div>

              {viewingLeave.attachmentName && (
                <div>
                  <Label className="text-muted-foreground">Đơn đính kèm</Label>
                  <Button variant="outline" size="sm" className="mt-1 w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    {viewingLeave.attachmentName}
                  </Button>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Ngày nộp đơn</Label>
                    <p className="text-sm">{viewingLeave.createdAt}</p>
                  </div>
                  {viewingLeave.approvedBy && (
                    <>
                      <div>
                        <Label className="text-muted-foreground">Người duyệt</Label>
                        <p className="text-sm">{viewingLeave.approvedBy}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Ngày duyệt</Label>
                        <p className="text-sm">{viewingLeave.approvedAt}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {viewingLeave.status === "REJECTED" && viewingLeave.rejectedReason && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <Label className="text-red-800">Lý do từ chối</Label>
                  <p className="text-sm text-red-700 mt-1">{viewingLeave.rejectedReason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}