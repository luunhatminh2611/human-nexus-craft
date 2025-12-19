import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import { FileText, Download } from 'lucide-react';
import { leaveRequestApi } from '../../leave-request/api/leaveRequestApi';
import { toast } from 'sonner';

export default function LeavesTab({ userData }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách đơn nghỉ phép theo userId
  const fetchLeaveRequests = async () => {
    if (!userData?.userId) return;

    try {
      setLoading(true);
      const data = await leaveRequestApi.getByUser(userData.userId);
      setLeaveRequests(data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách đơn nghỉ phép');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [userData?.userId]);

  // Render badge status
  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { variant: 'default', label: 'Đã duyệt' },
      PENDING: { variant: 'secondary', label: 'Chờ duyệt' },
      REJECTED: { variant: 'destructive', label: 'Từ chối' },
    };

    const statusInfo = statusMap[status] || { variant: 'secondary', label: status };

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
      toast.error('Không có file đính kèm');
      return;
    }

    if (leave.attachmentBase64) {
      try {
        downloadBinaryFile(leave.attachmentBase64, leave.fileName, leave.fileType);
        toast.success('Đang tải xuống file...');
      } catch (error) {
        toast.error('Không thể tải file');
        console.error(error);
      }
    } else {
      toast.error('File không tồn tại');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-amber-600" />
          Đơn xin nghỉ phép
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
                    {leave.title || 'Đơn nghỉ phép'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(leave.startDate).toLocaleDateString('vi-VN')}</div>
                      <div className="text-muted-foreground">
                        đến {new Date(leave.endDate).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate">
                    {leave.reason || 'Không ghi rõ'}
                  </TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  <TableCell className="text-center">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Nhân viên này chưa có đơn nghỉ phép nào.
          </p>
        )}
      </CardContent>
    </Card>
  );
}