import { useState } from "react";
import { Layout } from "@/shared/components/layouts/Layout";
import { Card } from "@/shared/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/shared/components/tables/table";
import { Badge } from "@/shared/components/ui/badge";
import Button from "@/shared/components/ui/button/Button";
import { Eye, Check, X, Download } from "lucide-react";

// 🧠 MOCK DATA
const mockMedicalRecords = [
  {
    id: "m001",
    employeeId: "e001",
    employeeName: "Nguyễn Văn A",
    fileName: "KhamSucKhoeTongQuat_2024.pdf",
    fileUrl: "/files/KhamSucKhoeTongQuat_2024.pdf",
    uploadDate: "2024-11-10",
    status: "approved",
  },
  {
    id: "m002",
    employeeId: "e002",
    employeeName: "Trần Thị B",
    fileName: "XetNghiemMau_2025.pdf",
    fileUrl: "/files/XetNghiemMau_2025.pdf",
    uploadDate: "2025-01-15",
    status: "pending",
  },
  {
    id: "m003",
    employeeId: "e003",
    employeeName: "Lê Văn C",
    fileName: "TiemChungCovid19.png",
    fileUrl: "/files/TiemChungCovid19.png",
    uploadDate: "2025-02-02",
    status: "rejected",
  },
];

export default function AdminMedicalRecord() {
  const [records, setRecords] = useState(mockMedicalRecords);

  const handleApprove = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý hồ sơ y tế</h1>
      <p className="text-muted-foreground">
        Duyệt, xem chi tiết và quản lý các hồ sơ y tế nhân viên.
      </p>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Tên hồ sơ</TableHead>
              <TableHead>Ngày tải lên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.employeeName}</TableCell>
                <TableCell>{record.fileName}</TableCell>
                <TableCell>
                  {new Date(record.uploadDate).toLocaleDateString("vi-VN")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "approved"
                        ? "outline"
                        : record.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {record.status === "approved"
                      ? "Đã duyệt"
                      : record.status === "pending"
                      ? "Chờ duyệt"
                      : "Từ chối"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">

                  <a href={record.fileUrl} download>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>

                  {record.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(record.id)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(record.id)}
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
    </div>
  );
}
