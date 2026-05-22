// pages/hr/work-history/WorkHistoryPage.tsx

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Plus,
  Briefcase,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button/Button2";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import { toast } from "sonner";
import { useAuthStore } from "@/features/employees/hooks/useAuth";
import { workProcessApi } from "../../api/workProcess";
import WorkProcessModal from "../../components/WorkProcessModal";
import BulkAddWorkProcessModal from "../../components/BulkAddWorkProcessModal";
import WorkProcessEditModal from "../../components/WorkProcessEditModal";
import { Checkbox } from "@/components/ui/checkbox";
import BulkEditWorkProcessModal from "../../components/BulkEditWorkProcessModal";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WorkProcess {
  id?: number;
  startDate: string;
  endDate: string;
  detail: string;
  positionId?: number;
  departmentId?: number;
  companyId?: number;
}

export interface EmployeeWorkHistory {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  workProcessDTOList: WorkProcess[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function calcDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (months < 12) return `${months} tháng`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} năm ${rem} tháng` : `${years} năm`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminWorkProcess() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === "ADMIN";

  // Data
  const [allData, setAllData] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWorkHistory | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ─── Toggle ───────────────────────────────────────────────────────────────
  const toggleOne = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleAll = () =>
    setSelectedIds(
      selectedIds.length === paginated.length
        ? []
        : paginated.map((e) => e.employeeId),
    );

  // ─── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (isAdmin) {
        const data = await workProcessApi.getAll({
          page: page,
          limit: pageSize,
        });
        setAllData(data || []);
      } else {
        // const data = await workHistoryApi.getByEmployeeId(user.employeeId);
        // setAllData(Array.isArray(data) ? data : [data]);
      }
    } catch {
      toast.error("Không thể tải quá trình công tác");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isAdmin, refreshKey]);

  // ─── Filter ───────────────────────────────────────────────────────────────
  const filtered = allData.filter((emp: any) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      emp.employeeName?.toLowerCase().includes(s) ||
      emp.employeeCode?.toLowerCase().includes(s)
    );
  });

  // ─── Pagination ───────────────────────────────────────────────────────────
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginated = filtered.slice(page * pageSize, page * pageSize + pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!rowToDelete) return;
    try {
      //   await workHistoryApi.delete(rowToDelete.process.id);
      //   toast.success("Đã xóa quá trình công tác");
      //   setRefreshKey((p) => p + 1);
    } catch {
      toast.error("Không thể xóa quá trình công tác");
    } finally {
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
    }
  };

  const bulkEditInitialRows = allData
    .filter((emp: any) => selectedIds.includes(emp.employeeId))
    .flatMap((emp: any) =>
      (emp.workProcessDTOList ?? []).map((wp: WorkProcess) => ({
        ...wp,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
      })),
    );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Quá trình công tác</h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Quản lý quá trình công tác của tất cả nhân viên"
                : "Xem quá trình công tác của bạn"}
            </p>
          </div>
        </div>

        {/* Employee info banner */}
        {!isAdmin && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Quá trình công tác</p>
                <p>
                  Thông tin được quản lý bởi phòng Nhân sự. Nếu cần cập nhật,
                  vui lòng liên hệ phòng Nhân sự.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={
                  isAdmin
                    ? "Tìm theo tên nhân viên, mã nhân viên, nội dung công tác..."
                    : "Tìm theo nội dung công tác..."
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={() => setIsBulkModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Thêm mới
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  disabled={selectedIds.length === 0}
                >
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa(
                  {selectedIds.length})
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Table */}

        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">
                    <Checkbox
                      checked={
                        paginated.length > 0 &&
                        selectedIds.length === paginated.length
                      }
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead className="text-center w-16">STT</TableHead>
                  <TableHead>Họ và tên</TableHead>
                  <TableHead>Mã cán bộ</TableHead>
                  <TableHead>Chức vụ</TableHead>
                  <TableHead>Phòng ban quản lý</TableHead>
                  <TableHead>Tập đoàn/Công ty</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span className="text-sm">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-8 w-8" />
                        <p>
                          {isAdmin
                            ? "Không tìm thấy quá trình công tác nào"
                            : "Bạn chưa có quá trình công tác nào"}
                        </p>
                        {!isAdmin && (
                          <p className="text-sm">
                            Liên hệ phòng Nhân sự để cập nhật thông tin
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Table rows
                  paginated.map((emp, index) => (
                    <TableRow
                      key={emp.employeeId}
                      className={
                        selectedIds.includes(emp.employeeId)
                          ? "bg-primary/5"
                          : ""
                      }
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedIds.includes(emp.employeeId)}
                          onCheckedChange={() => toggleOne(emp.employeeId)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {page * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{emp.employeeName}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          {emp.employeeCode}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          Chức vụ ...
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          Phòng ban ...
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          Công ty ...
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsDetailModalOpen(true);
                            }}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  setIsEditModalOpen(true);
                                }}
                                title="Chỉnh sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setRowToDelete(emp);
                                  setIsDeleteDialogOpen(true);
                                }}
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && paginated.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Hiển thị {startIndex} – {endIndex} trong {totalItems}
              </p>
              <div className="flex items-center gap-2">
                <Select
                  value={pageSize.toString()}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(0);
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                  >
                    Đầu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-3 text-sm">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages - 1)}
                    disabled={page >= totalPages - 1}
                  >
                    Cuối
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <WorkProcessModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEmployee(null);
        }}
        workProcessList={selectedEmployee?.workProcessDTOList || []}
        employeeName={selectedEmployee?.employeeName}
      />

      <BulkAddWorkProcessModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={() => {
          setRefreshKey((p) => p + 1);
          setIsBulkModalOpen(false);
        }}
      />

      <WorkProcessEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        workProcessList={selectedEmployee?.workProcessDTOList || []}
        employeeName={selectedEmployee?.employeeName}
        employeeId={selectedEmployee?.employeeId}
        onSuccess={() => setRefreshKey((p) => p + 1)}
      />

      <BulkEditWorkProcessModal
        isOpen={isBulkEditModalOpen}
        onClose={() => {
          setIsBulkEditModalOpen(false);
          setSelectedIds([]); // bỏ chọn sau khi đóng
        }}
        onSuccess={() => {
          setRefreshKey((p) => p + 1);
          setSelectedIds([]);
        }}
        initialRows={bulkEditInitialRows}
      />
    </div>
  );
}
