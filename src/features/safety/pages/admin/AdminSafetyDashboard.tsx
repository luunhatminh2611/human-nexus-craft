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
import { Button } from "@/shared/components/ui/button/Button2";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ppeApi } from "../../api/safetyApi";
import { toast } from "sonner";
import PPEPlanModal from "../../components/PPEmodal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/employees/hooks/useAuth";

export default function PPEPlansPage() {
  const [ppePlans, setPpePlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const itemsPerPage = 10;
  const navigate = useNavigate();
  
  // Lấy thông tin user để phân quyền
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  // Lấy danh sách kế hoạch bảo hộ
  const fetchPPEPlans = async () => {
    try {
      setLoading(true);
      const data = await ppeApi.getAllPlans();
      setPpePlans(data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách kế hoạch bảo hộ");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPPEPlans();
  }, []);

  // Lọc dữ liệu theo search
  const filteredPlans = ppePlans.filter((plan) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      plan.year?.toString().includes(searchLower) ||
      plan.notes?.toLowerCase().includes(searchLower) ||
      plan.status?.toLowerCase().includes(searchLower)
    );
  });

  // Phân trang
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  // Reset trang khi search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Xử lý xem chi tiết
  const handleViewDetail = (plan) => {
    // Admin: điều hướng đến /ppe/plans/:id
    // Manager: điều hướng đến /manager/ppe/plans/:id
    if (isAdmin) {
      navigate(`/ppe/plans/${plan.id}`);
    } else {
      navigate(`/manager/ppe/plans/${plan.id}`);
    }
  };

  // Xử lý chỉnh sửa (chỉ Admin)
  const handleEdit = (plan) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền chỉnh sửa");
      return;
    }
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  // Xử lý xóa (chỉ Admin)
  const handleDelete = async (plan) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa");
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa kế hoạch năm ${plan.year}?`)) {
      return;
    }

    try {
      // API xóa (nếu có)
      toast.success("Xóa kế hoạch thành công");
      fetchPPEPlans();
    } catch (error) {
      toast.error("Không thể xóa kế hoạch");
      console.error(error);
    }
  };

  // Xử lý đóng kế hoạch (chỉ Admin)
  const handleClosePlan = async (planId) => {
    if (!isAdmin) {
      toast.error("Bạn không có quyền đóng kế hoạch");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn đóng kế hoạch này?")) {
      return;
    }

    try {
      await ppeApi.closePlan(planId);
      toast.success("Đóng kế hoạch thành công");
      fetchPPEPlans();
    } catch (error) {
      toast.error("Không thể đóng kế hoạch");
      console.error(error);
    }
  };

  // Render badge status
  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: "default", label: "Đang hoạt động" },
      CLOSED: { variant: "secondary", label: "Đã đóng" },
      DRAFT: { variant: "outline", label: "Nháp" },
    };

    const statusInfo = statusMap[status] || {
      variant: "secondary",
      label: status
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Kế hoạch Bảo hộ lao động
          </h1>
          <p className="text-muted-foreground mt-2">
            Quản lý các kế hoạch cấp phát bảo hộ lao động theo năm
          </p>
        </div>

        {/* Nút tạo kế hoạch chỉ hiển thị với Admin */}
        {isAdmin && (
          <Button 
            className="bg-green-500 text-white hover:bg-green-600" 
            onClick={() => {
              setEditingPlan(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Tạo kế hoạch mới
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Danh sách kế hoạch
            </CardTitle>

            {/* Thanh tìm kiếm */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo năm, ghi chú, trạng thái..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Đang tải...</p>
          ) : currentPlans.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Năm</TableHead>
                    <TableHead>Số vật phẩm</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-bold text-lg">
                        {plan.year}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {plan.planDetails?.length || 0} vật phẩm
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {plan.notes || "Không có ghi chú"}
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell>
                        {new Date(plan.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Xem chi tiết - Hiển thị cho cả Admin và Manager */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(plan)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>

                          {/* Chỉnh sửa - Chỉ hiển thị với Admin */}
                          {isAdmin && plan.status !== "CLOSED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 text-amber-600" />
                            </Button>
                          )}

                          {/* Xóa - Chỉ hiển thị với Admin */}
                          {isAdmin && plan.status !== "CLOSED" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(plan)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredPlans.length)}
                    {" "}trên tổng số {filteredPlans.length} kế hoạch
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm
                ? "Không tìm thấy kế hoạch phù hợp"
                : "Chưa có kế hoạch bảo hộ nào"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Modal chỉ hiển thị cho Admin */}
      {isAdmin && (
        <PPEPlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlan(null);
          }}
          onSuccess={fetchPPEPlans}
          editData={editingPlan}
        />
      )}
    </div>
  );
}