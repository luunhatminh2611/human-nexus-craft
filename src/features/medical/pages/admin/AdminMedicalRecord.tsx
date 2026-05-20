import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button as Button2 } from "@/shared/components/ui/button/Button2";
import Button from "@/shared/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Activity,
  Heart,
  User,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { routineHealthCheckApi } from "../../api/medicalApi";
import type { HealthRecord } from "../../components/MedicalFormModal";
import MedicalDetailModal from "../../components/MedicalDetailModal";
import MedicalFormModal from "../../components/MedicalFormModal";
import BulkAddHealthModal from "../../components/BulkAddHealthModal";
import BulkEditHealthModal from "../../components/BulkEditHealthModal";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown } from "lucide-react";

// ─── Health Level Badge ──────────────────────────────────────────────────────

function HealthLevelBadge({ level }: { level?: number }) {
  if (!level) return <span className="text-muted-foreground text-xs">—</span>;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: "Loại I", cls: "bg-emerald-100 text-emerald-700" },
    2: { label: "Loại II", cls: "bg-blue-100   text-blue-700" },
    3: { label: "Loại III", cls: "bg-yellow-100 text-yellow-700" },
    4: { label: "Loại IV", cls: "bg-orange-100 text-orange-700" },
    5: { label: "Loại V", cls: "bg-red-100    text-red-700" },
  };
  const cfg = map[level] ?? {
    label: `Loại ${level}`,
    cls: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthManagement() {
  const queryClient = useQueryClient();

  // ── Filter state ───────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  // ── Modal state ────────────────────────────────────────────────────────────
  const [detailRecord, setDetailRecord] = useState<HealthRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [editRecord, setEditRecord] = useState<HealthRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: records = [], isLoading } = useQuery<HealthRecord[]>({
    queryKey: ["health-records"],
    queryFn: routineHealthCheckApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => routineHealthCheckApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      toast({ title: "Đã xóa hồ sơ" });
    },
    onError: () => toast({ title: "Lỗi khi xóa", variant: "destructive" }),
  });

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreate = () => {
    setEditRecord(null);
    setShowForm(true);
  };

  const openEdit = (r: HealthRecord) => {
    setEditRecord(r);
    setShowForm(true);
  };

  const openDetail = (r: HealthRecord) => {
    setDetailRecord(r);
    setShowDetail(true);
  };

  const handleDownloadReport = async (employeeId: number) => {
    try {
      await routineHealthCheckApi.downloadReport(employeeId);
      toast({ title: "Đã tải xuống báo cáo thành công" });
    } catch (error: any) {
      toast({
        title: "Lỗi tải file",
        description: error?.message || "Lỗi không xác định",
        variant: "destructive",
      });
    }
  };

  // ── Unique months for filter dropdown ─────────────────────────────────────
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ngayKham) set.add(r.ngayKham.slice(0, 7)); // "YYYY-MM"
    });
    return Array.from(set).sort().reverse();
  }, [records]);

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const term = searchTerm.trim().toLowerCase();
        const matchSearch =
          !term ||
          String(r.employeeId).includes(term) ||
          (r.donVi ?? "").toLowerCase().includes(term);
        const matchMonth =
          filterMonth === "all" || r.ngayKham?.slice(0, 7) === filterMonth;
        return matchSearch && matchMonth;
      }),
    [records, searchTerm, filterMonth],
  );

  // Handlers
  const handleToggleOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => r.id!).filter(Boolean));
    }
  };

  const isAllSelected =
    selectedIds.length === filtered.length && filtered.length > 0;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < filtered.length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold"> Khám sức khỏe định kỳ </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý lịch khám sức khỏe định kỳ của nhân viên ({records.length}{" "}
            hồ sơ)
          </p>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã NV, đơn vị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Lọc theo tháng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all"> Tất cả tháng </SelectItem>
              {uniqueMonths.map((m) => {
                const [year, month] = m.split("-");
                return (
                  <SelectItem key={m} value={m}>
                    Tháng {month}/{year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button2 onClick={() => setShowBulkAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Thêm mới
          </Button2>

          <Button2
            variant="outline"
            onClick={() => setShowBulkEdit(true)}
            disabled={selectedIds.length === 0}
          >
            <Edit className="h-4 w-4 mr-2" /> Sửa sửa({selectedIds.length}
            )
          </Button2>
        </div>
      </Card>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <p>Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-muted sticky top-0 z-10">
                <tr>
                  <th className="text-center p-3 w-10">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleToggleAll}
                    />
                  </th>
                  <th className="text-center p-3 text-sm font-semibold w-10">
                    {" "}
                    STT{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    Nhân viên{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    Đơn vị{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    Ngày khám{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    Huyết áp{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    Mạch{" "}
                  </th>
                  <th className="text-left p-3 text-sm font-semibold">
                    {" "}
                    PL Sức khỏe{" "}
                  </th>
                  <th className="text-center p-3 text-sm font-semibold w-32">
                    {" "}
                    Thao tác{" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                        <p>Không tìm thấy hồ sơ nào </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => openDetail(r)}
                    >
                      <td
                        className="p-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedIds.includes(r.id!)}
                          onCheckedChange={() => handleToggleOne(r.id!)}
                        />
                      </td>
                      <td className="p-3 text-center text-sm text-muted-foreground">
                        {i + 1}
                      </td>

                      {/* Nhân viên */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary/60" />
                          </div>
                          <span className="text-sm font-medium">
                            {" "}
                            {r.employeeName}{" "}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-sm"> {r.donVi || "—"} </td>

                      <td className="p-3 text-sm">
                        {r.ngayKham
                          ? new Date(
                              r.ngayKham + "T00:00:00",
                            ).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="p-3 text-sm"> {r.huyetAp || "—"} </td>

                      <td className="p-3 text-sm">
                        {r.mach ? `${r.mach} lần/phút` : "—"}
                      </td>

                      <td className="p-3">
                        <HealthLevelBadge level={r.plSucKhoe} />
                      </td>

                      {/* Actions — stopPropagation để không trigger row click */}
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xem chi tiết"
                            onClick={() => openDetail(r)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Chỉnh sửa"
                            onClick={() => openEdit(r)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Tải về Word (Mẫu 03 - TT32/2023)"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleDownloadReport(r.employeeId)}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xóa"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(r.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <MedicalDetailModal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        record={detailRecord}
      />

      <MedicalFormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditRecord(null);
        }}
        record={editRecord}
        onSuccess={() => {
          setShowForm(false);
          setEditRecord(null);
        }}
      />

      <BulkAddHealthModal
        isOpen={showBulkAdd}
        onClose={() => setShowBulkAdd(false)}
        onSuccess={() => {
          setShowBulkAdd(false);
          queryClient.invalidateQueries({ queryKey: ["health-records"] });
        }}
      />
      <BulkEditHealthModal
        isOpen={showBulkEdit}
        onClose={() => setShowBulkEdit(false)}
        preSelectedIds={selectedIds}
        onSuccess={() => {
          setShowBulkEdit(false);
          setSelectedIds([]);
          queryClient.invalidateQueries({ queryKey: ["health-records"] });
        }}
      />
    </div>
  );
}
