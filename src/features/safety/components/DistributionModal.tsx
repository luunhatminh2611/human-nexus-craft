import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import { Package, User, Calendar, CheckCircle, Clock, Plus } from "lucide-react";
import CreateDistributionModal from "./CreateDistributionModal";
import { employeeApi } from '@/features/employees/api/employeeApi';


interface DistributionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  distributions: any[];
  registration: any;
  onDistributionCreated: () => void;
}

export default function DistributionsModal({
  isOpen,
  onClose,
  distributions,
  registration,
  onDistributionCreated,
}: DistributionsModalProps) {
  const [isCreateDistModalOpen, setIsCreateDistModalOpen] = useState(false);

  const [employees, setEmployees] = useState<Record<number, string>>({});

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchEmployeeNames = async (employeeIds: number[]) => {
    try {
      const uniqueIds = [...new Set(employeeIds)];
      const employeeData: Record<number, string> = {};

      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const emp = await employeeApi.getById(id);
            employeeData[id] = emp.data.name;
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin nhân viên ${id}:`, error);
            employeeData[id] = `NV ${id}`;
          }
        })
      );

      setEmployees(employeeData);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin nhân viên:', error);
    }
  };

  useEffect(() => {
    if (distributions.length > 0) {
      const employeeIds = distributions.map(d => d.employeeId).filter(Boolean);
      if (employeeIds.length > 0) {
        fetchEmployeeNames(employeeIds);
      }
    }
  }, [distributions]);

  const getItemStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'DELIVERED': { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800' },
      'CONFIRMED': { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleCreateSuccess = () => {
    onDistributionCreated();
    setIsCreateDistModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-600" />
                Danh sách phát bảo hộ lao động
              </DialogTitle>

              {/* Nút tạo phân phát mới */}
              <Button
                onClick={() => setIsCreateDistModalOpen(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tạo phân phát mới
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {distributions.length > 0 ? (
              distributions.map((distribution) => (
                <div
                  key={distribution.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  {/* Thông tin phát */}
                  <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Mã phát</p>
                      <p className="font-semibold">#{distribution.id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Nhân viên nhận
                      </p>
                      <p className="font-medium">
                        {employees[distribution.employeeId] || `Nhân viên ${distribution.employeeId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Ngày phát
                      </p>
                      <p className="text-sm font-medium">
                        {formatDate(distribution.distributionDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Đơn đăng ký</p>
                      <Badge>#{distribution.registrationId}</Badge>
                    </div>
                  </div>

                  {/* Danh sách vật phẩm */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      Vật phẩm đã phát ({distribution.items?.length || 0})
                    </h4>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>STT</TableHead>
                          <TableHead>Tên vật phẩm</TableHead>
                          <TableHead className="text-center">Số lượng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Ngày xác nhận</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {distribution.items?.map((item: any, index: number) => (
                          <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {item.ppeItemName}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {item.quantity}
                            </TableCell>
                            <TableCell>
                              {getItemStatusBadge(item.status)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.confirmedAt ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-3 w-3" />
                                  {formatDate(item.confirmedAt)}
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  Chưa xác nhận
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="mb-4">Chưa có dữ liệu phát bảo hộ</p>
                <Button
                  onClick={() => setIsCreateDistModalOpen(true)}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tạo phân phát đầu tiên
                </Button>
              </div>
            )}
          </div>

          {/* Thống kê tổng */}
          {distributions.length > 0 && (
            <div className="border-t pt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tổng số lần phát</p>
                <p className="text-2xl font-bold text-blue-600">
                  {distributions.length}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Tổng vật phẩm</p>
                <p className="text-2xl font-bold text-green-600">
                  {distributions.reduce((total, d) => total + (d.items?.length || 0), 0)}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Số lượng đã phát</p>
                <p className="text-2xl font-bold text-purple-600">
                  {distributions.reduce((total, d) =>
                    total + (d.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0), 0
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal tạo phân phát */}
      <CreateDistributionModal
        isOpen={isCreateDistModalOpen}
        onClose={() => setIsCreateDistModalOpen(false)}
        onSuccess={handleCreateSuccess}
        registration={registration}
      />
    </>
  );
}