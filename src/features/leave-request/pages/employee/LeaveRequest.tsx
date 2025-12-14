import React, { useState, useEffect } from "react";
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
import { leaveRequestApi } from "../../api/leaveRequestApi";
import { toast } from "sonner";
import { useAuthStore } from "@/features/employees/hooks/useAuth";
import LeaveRequestModal from "../../components/modal/LeaveModal";

export default function LeaveRequest() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingLeave, setEditingLeave] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState(null);
  const [approverUserId, setApproverUserId] = useState("");

  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Lấy danh sách đơn nghỉ phép
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await leaveRequestApi.getAll();
      setLeaveRequests(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách đơn nghỉ phép");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (leave) => {
    setEditingLeave(leave);
    setFormData({
      title: leave.title,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason,
    });
    setApproverUserId(leave.approverUserId || "");
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
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

    try {
      setLoading(true);
      const dataToUpdate = {
        ...formData,
        approverUserId,
      };
      await leaveRequestApi.update(editingLeave.id, dataToUpdate, selectedFile);
      toast.success("Cập nhật đơn nghỉ phép thành công");
      setIsEditModalOpen(false);
      setEditingLeave(null);
      resetForm();
      fetchLeaveRequests();
    } catch (error) {
      toast.error("Không thể cập nhật đơn nghỉ phép");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (leave) => {
    setLeaveToDelete(leave);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leaveToDelete) return;

    try {
      setLoading(true);
      await leaveRequestApi.delete(leaveToDelete.id);
      toast.success("Xóa đơn nghỉ phép thành công");
      setDeleteConfirmOpen(false);
      setLeaveToDelete(null);
      fetchLeaveRequests();
    } catch (error) {
      toast.error("Không thể xóa đơn nghỉ phép");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Xử lý thay đổi form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý chọn file
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Xóa file đã chọn
  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
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

    try {
      setLoading(true);
      const dataToSubmit = {
        ...formData,
        approverUserId,
      };
      await leaveRequestApi.create(dataToSubmit, selectedFile);
      toast.success("Tạo đơn nghỉ phép thành công");
      setIsModalOpen(false);
      resetForm();
      fetchLeaveRequests();
    } catch (error) {
      toast.error(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
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

  // Render badge status
  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { variant: "default", label: "Đã duyệt" },
      PENDING: { variant: "secondary", label: "Chờ duyệt" },
      REJECTED: { variant: "destructive", label: "Từ chối" },
    };

    const statusInfo = statusMap[status] || { variant: "secondary", label: status };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const downloadBinaryFile = (binaryString, fileName, fileType) => {
    try {
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: fileType || 'application/octet-stream' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  const handleDownload = (leave) => {
    if (!leave.fileName) {
      toast.error("Không có file đính kèm");
      return;
    }

    if (leave.attachmentBase64) {
      try {
        downloadBinaryFile(leave.attachmentBase64, leave.fileName, leave.fileType);
        toast.success("Đang tải xuống file...");
      } catch (error) {
        toast.error("Không thể tải file");
        console.error(error);
      }
    } else {
      handleDownloadFromAPI(leave.id);
    }
  };

  const handleDownloadFromAPI = async (leaveId) => {
    try {
      const response = await leaveRequestApi.getByUser(user?.userId);
      const leaveDetail = response.find(item => item.id === leaveId);

      if (!leaveDetail) {
        toast.error("Không tìm thấy đơn nghỉ phép");
        return;
      }

      const binaryData = leaveDetail.attachmentBase64;

      if (!binaryData) {
        toast.error("File không tồn tại");
        return;
      }

      downloadBinaryFile(binaryData, leaveDetail.fileName, leaveDetail.fileType);
      toast.success("Đang tải xuống file...");
    } catch (error) {
      toast.error("Không thể tải file");
      console.error(error);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn xin nghỉ phép</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các đơn xin nghỉ phép của bạn
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white hover:bg-green-600">
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
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Đang tải...</p>
          ) : leaveRequests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Người nộp</TableHead>
                  <TableHead>Thời gian nghỉ</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {leaveRequests.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">
                      {leave.title || "Đơn nghỉ phép"}
                    </TableCell>
                    <TableCell>{leave.createBy || "N/A"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(leave.startDate).toLocaleDateString("vi-VN")}</div>
                        <div className="text-muted-foreground">
                          đến {new Date(leave.endDate).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">
                      {leave.reason || "Không ghi rõ"}
                    </TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {leave.fileName ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(leave)}
                            title="Tải xuống file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Không có file
                          </span>
                        )}
                        {['PENDING', 'REJECTED'].includes(leave.status) && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(leave)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(leave)}
                              title="Xóa"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Bạn chưa có đơn nghỉ phép nào.
            </p>
          )}
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
        isEdit={true}
        currentFileName={editingLeave?.fileName}
        approverUserId={approverUserId}
        setApproverUserId={setApproverUserId}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đơn nghỉ phép "{leaveToDelete?.title}"?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setLeaveToDelete(null);
              }}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? "Đang xóa..." : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}