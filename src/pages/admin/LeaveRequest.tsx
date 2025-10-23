import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Check, X, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const mockLeaveRequests = [
  {
    id: "lr001",
    employeeName: "Nguyễn Văn A",
    reason: "Nghỉ phép năm",
    startDate: "2025-10-23",
    endDate: "2025-10-25",
    fileUrl: "/files/DonXinNghiPhep_A.pdf",
    uploadDate: "2025-10-20",
    status: "pending",
  },
  {
    id: "lr002",
    employeeName: "Trần Thị B",
    reason: "Nghỉ ốm",
    startDate: "2025-10-10",
    endDate: "2025-10-11",
    fileUrl: "/files/DonXinNghiPhep_B.pdf",
    uploadDate: "2025-10-09",
    status: "approved",
  },
  {
    id: "lr003",
    employeeName: "Lê Văn C",
    reason: "Việc gia đình",
    startDate: "2025-09-30",
    endDate: "2025-10-02",
    fileUrl: "/files/DonXinNghiPhep_C.pdf",
    uploadDate: "2025-09-28",
    status: "rejected",
  },
];

export default function LeaveRequestPage() {
  const [requests, setRequests] = useState(mockLeaveRequests);
  const [selected, setSelected] = useState<typeof mockLeaveRequests[0] | null>(null);

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Đơn xin nghỉ phép</h1>
        <p className="text-muted-foreground">
          Quản lý, duyệt và xem các đơn xin nghỉ phép của nhân viên.
        </p>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Thời gian nghỉ</TableHead>
                <TableHead>Ngày gửi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.employeeName}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>
                    {new Date(req.startDate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(req.endDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    {new Date(req.uploadDate).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        req.status === "approved"
                          ? "outline"
                          : req.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {req.status === "approved"
                        ? "Đã duyệt"
                        : req.status === "pending"
                        ? "Chờ duyệt"
                        : "Từ chối"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(req)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <a href={req.fileUrl} download>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>

                    {req.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(req.id)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* 🪟 Modal xem chi tiết */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <p>
                  <strong>Nhân viên:</strong> {selected.employeeName}
                </p>
                <p>
                  <strong>Lý do:</strong> {selected.reason}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {new Date(selected.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(selected.endDate).toLocaleDateString("vi-VN")}
                </p>
                <p>
                  <strong>Ngày gửi:</strong>{" "}
                  {new Date(selected.uploadDate).toLocaleDateString("vi-VN")}
                </p>

                <div className="border-t pt-4">
                  <p className="font-semibold mb-2">Tệp đính kèm:</p>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">{selected.fileUrl.split("/").pop()}</span>
                    </div>
                    <a href={selected.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        Xem PDF
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
