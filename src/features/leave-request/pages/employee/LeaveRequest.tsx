import React, { useEffect, useState } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import { FileText, Download, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/features/employees/hooks/useAuth";
import LeaveRequestModal from "../../components/modal/LeaveModal";

/* ================= MOCK DATA ================= */

const MOCK_LEAVE_REQUESTS = [
  {
    id: 1,
    title: "Nghỉ phép năm",
    startDate: "2025-01-10",
    endDate: "2025-01-12",
    reason: "Nghỉ du lịch cùng gia đình",
    status: "PENDING",
    createBy: "Nguyễn Văn A",
    approverUserId: "2",
    fileName: "don_nghi_phep.pdf",
    fileType: "application/pdf",
    attachmentBase64: "MockBinaryData",
  },
  {
    id: 2,
    title: "Nghỉ ốm",
    startDate: "2025-01-05",
    endDate: "2025-01-06",
    reason: "Sốt cao",
    status: "APPROVED",
    createBy: "Nguyễn Văn A",
    approverUserId: "3",
    fileName: null,
    fileType: null,
    attachmentBase64: null,
  },
  {
    id: 3,
    title: "Nghỉ việc riêng",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    reason: "Giải quyết việc cá nhân",
    status: "REJECTED",
    createBy: "Nguyễn Văn A",
    approverUserId: "2",
    fileName: null,
    fileType: null,
    attachmentBase64: null,
  },
];

export default function LeaveRequest() {
  const { user } = useAuthStore();

  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editingLeave, setEditingLeave] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<any>(null);

  const [approverUserId, setApproverUserId] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  /* ================= LOAD MOCK ================= */

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLeaveRequests(MOCK_LEAVE_REQUESTS);
      setLoading(false);
    }, 500);
  }, []);

  /* ================= COMMON ================= */

  const resetForm = () => {
    setFormData({
      title: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    setSelectedFile(null);
    setApproverUserId("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleRemoveFile = () => setSelectedFile(null);

  /* ================= CREATE ================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!approverUserId) {
      toast.error("Vui lòng chọn người duyệt");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLeaveRequests((prev) => [
        {
          id: Date.now(),
          ...formData,
          status: "PENDING",
          createBy: user?.fullName || "Nhân viên",
          approverUserId,
          fileName: selectedFile?.name || null,
          fileType: selectedFile?.type || null,
          attachmentBase64: selectedFile ? "MockBinaryData" : null,
        },
        ...prev,
      ]);

      toast.success("Tạo đơn nghỉ phép thành công");
      setIsModalOpen(false);
      resetForm();
      setLoading(false);
    }, 500);
  };

  /* ================= EDIT ================= */

  const handleEdit = (leave: any) => {
    setEditingLeave(leave);
    setFormData({
      title: leave.title,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    });
    setApproverUserId(leave.approverUserId);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      setLeaveRequests((prev) =>
        prev.map((item) =>
          item.id === editingLeave.id
            ? {
                ...item,
                ...formData,
                approverUserId,
                fileName: selectedFile?.name || item.fileName,
              }
            : item
        )
      );

      toast.success("Cập nhật đơn nghỉ phép thành công");
      setIsEditModalOpen(false);
      setEditingLeave(null);
      resetForm();
      setLoading(false);
    }, 500);
  };

  /* ================= DELETE ================= */

  const handleDeleteClick = (leave: any) => {
    setLeaveToDelete(leave);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLeaveRequests((prev) => prev.filter((l) => l.id !== leaveToDelete.id));
      toast.success("Xóa đơn nghỉ phép thành công");
      setDeleteConfirmOpen(false);
      setLeaveToDelete(null);
      setLoading(false);
    }, 400);
  };

  /* ================= DOWNLOAD MOCK ================= */

  const handleDownload = (leave: any) => {
    if (!leave.fileName) {
      toast.error("Không có file đính kèm");
      return;
    }
    toast.success(`Mock tải file: ${leave.fileName}`);
  };

  /* ================= UI ================= */

  const getStatusBadge = (status: string) => {
    const map: any = {
      APPROVED: { variant: "default", label: "Đã duyệt" },
      PENDING: { variant: "secondary", label: "Chờ duyệt" },
      REJECTED: { variant: "destructive", label: "Từ chối" },
    };
    const s = map[status];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đơn xin nghỉ phép</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các đơn xin nghỉ phép của bạn
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white">
          <Plus className="mr-2 h-4 w-4" /> Tạo đơn mới
        </Button>
      </div>

      <LeaveRequestModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        formData={formData}
        selectedFile={selectedFile}
        loading={loading}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
        isEdit={false}
        currentFileName={null}
        approverUserId={approverUserId}
        setApproverUserId={setApproverUserId}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Danh sách đơn nghỉ phép
          </CardTitle>
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
                  <TableCell className="truncate max-w-[250px]">
                    {leave.reason}
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell className="text-center space-x-2">
                    {leave.fileName && (
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(leave)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {["PENDING", "REJECTED"].includes(leave.status) && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(leave)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleDeleteClick(leave)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <LeaveRequestModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        formData={formData}
        selectedFile={selectedFile}
        loading={loading}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleSubmit={handleEditSubmit}
        resetForm={resetForm}
        isEdit
        currentFileName={editingLeave?.fileName}
        approverUserId={approverUserId}
        setApproverUserId={setApproverUserId}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn "{leaveToDelete?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
