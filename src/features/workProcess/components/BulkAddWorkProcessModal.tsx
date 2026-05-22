// components/BulkAddWorkProcessModal.tsx

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Input } from "@/shared/components/ui/input";
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
import {
  Loader2,
  X,
  Plus,
  Copy,
  ChevronDown,
  Search,
  User,
  Briefcase,
} from "lucide-react";

import { employeeApi } from "@/features/employees/api/employeeApi";
import { workProcessApi } from "../api/workProcess";
import { WorkProcess } from "../pages/admin/AdminWorkProcess";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WorkProcessRow {
  id?: number;
  tempId: number;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  detail: string;
  rowStatus: "pending" | "success" | "error";
  errorMessage?: string;
  positionId?: number;
  departmentId?: number;
  companyId?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode: "create" | "edit";
  initialRows?: WorkProcess[];
}

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({
  row,
  allEmployees,
  onSelect,
}: {
  row: WorkProcessRow;
  allEmployees: any[];
  onSelect: (emp: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? allEmployees.filter(
        (e) =>
          e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          e.employeeCode?.toLowerCase().includes(search.toLowerCase()),
      )
    : allEmployees.slice(0, 20);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 h-8 px-2 text-sm border rounded w-full min-w-[160px] hover:bg-gray-50 transition-colors text-left
            ${!row.employeeId ? "text-muted-foreground border-dashed" : "text-foreground"}`}
        >
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1">
            {row.employeeName || "Chọn..."}
          </span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start" side="bottom">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tên hoặc mã nhân viên..."
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  onSelect(emp);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors
                ${row.employeeId === emp.id.toString() ? "bg-green-50" : ""}`}
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="text-sm font-medium">{emp.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {emp.employeeCode}
                  {emp.departmentName && ` · ${emp.departmentName}`}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              Không tìm thấy
            </div>
          )}
        </div>
        {row.employeeId && (
          <div className="p-2 border-t">
            <button
              type="button"
              onClick={() => {
                onSelect({ id: 0, fullName: "" });
                setOpen(false);
              }}
              className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function BulkAddWorkProcessModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialRows,
}: Props) {
  const [rows, setRows] = useState<WorkProcessRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);

  const idCounter = useRef(1);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    employeeApi
      .getAll()
      .then((d) => setAllEmployees(d || []))
      .catch(console.error);
    if (rows.length === 0) addRow();
  }, [isOpen]);

  const makeRow = (): WorkProcessRow => ({
    tempId: idCounter.current++,
    employeeId: "",
    employeeName: "",
    startDate: today,
    endDate: today,
    detail: "",
    rowStatus: "pending",
  });

  const addRow = () => setRows((prev) => [...prev, makeRow()]);

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.tempId !== id));

  const copyRow = (id: number) => {
    const row = rows.find((r) => r.tempId === id);
    if (row) {
      setRows((prev) => [
        ...prev,
        {
          ...row,
          tempId: idCounter.current++,
          rowStatus: "pending",
          errorMessage: undefined,
        },
      ]);
      toast.info("Đã sao chép dòng");
    }
  };
  const handleChange = (
    tempId: number,
    field: keyof WorkProcessRow,
    value: string,
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.tempId === tempId ? { ...r, [field]: value } : r)),
    );
  };

  const update = (id: number, field: keyof WorkProcessRow, value: any) =>
    setRows((prev) =>
      prev.map((r) => (r.tempId === id ? { ...r, [field]: value } : r)),
    );

  const validate = () => {
    let ok = true;
    setRows((prev) =>
      prev.map((r) => {
        const errs: string[] = [];
        if (!r.employeeId) errs.push("Chưa chọn nhân viên");
        if (!r.startDate) errs.push("Thiếu ngày bắt đầu");
        if (!r.endDate) errs.push("Thiếu ngày kết thúc");
        if (r.startDate && r.endDate && r.startDate > r.endDate)
          errs.push("Ngày bắt đầu phải trước ngày kết thúc");
        if (!r.detail.trim()) errs.push("Thiếu nội dung công tác");
        if (errs.length) {
          ok = false;
          return { ...r, rowStatus: "error", errorMessage: errs.join(" · ") };
        }
        return { ...r, rowStatus: "pending", errorMessage: undefined };
      }),
    );
    return ok;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!rows.length) {
      toast.error("Vui lòng thêm ít nhất một dòng");
      return;
    }
    if (!validate()) {
      toast.error("Kiểm tra các dòng bị lỗi (đường viền đỏ)");
      return;
    }

    setIsSubmitting(true);

    const grouped = rows.reduce<Record<string, WorkProcessRow[]>>(
      (acc, row) => {
        if (!acc[row.employeeId]) acc[row.employeeId] = [];
        acc[row.employeeId].push(row);
        return acc;
      },
      {},
    );

    const payload = Object.entries(grouped).map(([employeeId, empRows]) => ({
      employeeId: Number(employeeId),
      workProcesses: empRows.map((r) => ({
        startDate: r.startDate,
        endDate: r.endDate,
        detail: r.detail,
      })),
    }));

    try {
      await workProcessApi.createBulk(payload);
      setRows((prev) => prev.map((r) => ({ ...r, rowStatus: "success" })));
      toast.success(`Đã thêm ${rows.length} quá trình công tác thành công`);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi lưu");
      setRows((prev) =>
        prev.map((r) => ({
          ...r,
          rowStatus: "error",
          errorMessage: err?.response?.data?.message || "Lỗi khi lưu",
        })),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRows([]);
    onClose();
  };

  const successCount = rows.filter((r) => r.rowStatus === "success").length;
  const errorCount = rows.filter((r) => r.rowStatus === "error").length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Thêm quá trình công tác hàng loạt
          </DialogTitle>
          <DialogDescription>
            Thêm quá trình công tác cho nhiều nhân viên cùng lúc
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={addRow}
            >
              <Plus className="h-3.5 w-3.5" /> Thêm dòng
            </Button>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {successCount > 0 && (
                <span className="text-green-600 font-medium">
                  ✓ {successCount}
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-red-500  font-medium">
                  ✗ {errorCount}
                </span>
              )}
              <span>
                Tổng: <b>{rows.length}</b>
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {rows.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-16 flex flex-col items-center gap-3">
                <Briefcase className="h-10 w-10 opacity-30" />
                <p>
                  Chưa có dòng nào. Nhấn <b>Thêm dòng</b> để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-x-auto mx-6 my-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-background z-20 w-10 border-r">
                        #
                      </TableHead>
                      <TableHead className="sticky left-10 bg-background z-20 w-20 border-r text-center">
                        Thao tác
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[170px]">
                        Nhân viên *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Ngày bắt đầu *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Ngày kết thúc *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Chức vụ *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Phòng ban quản lý *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[160px]">
                        Tập đoàn/Công ty *
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[280px]">
                        Nội dung công tác *
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => (
                      <TableRow
                        key={row.tempId}
                        className={
                          row.rowStatus === "error"
                            ? "bg-red-50 border-l-2 border-l-red-400"
                            : row.rowStatus === "success"
                              ? "bg-green-50 border-l-2 border-l-green-400"
                              : ""
                        }
                      >
                        <TableCell className="sticky left-0 bg-inherit z-10 w-10 border-r text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell className="sticky left-10 bg-inherit z-10 w-20 border-r">
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyRow(row.tempId)}
                              title="Sao chép"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(row.tempId)}
                              title="Xóa dòng"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          {row.errorMessage && (
                            <p className="text-xs text-red-500 mt-1 max-w-[120px] leading-tight">
                              {row.errorMessage}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <EmployeePopover
                            row={row}
                            allEmployees={allEmployees}
                            onSelect={(emp) => {
                              update(
                                row.tempId,
                                "employeeId",
                                emp.id ? emp.id.toString() : "",
                              );
                              update(
                                row.tempId,
                                "employeeName",
                                emp.fullName || "",
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={row.startDate}
                            onChange={(e) =>
                              update(row.tempId, "startDate", e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={row.endDate}
                            onChange={(e) =>
                              update(row.tempId, "endDate", e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <GenericSearchSelect
                            api={categoryConfigs.position.api}
                            config={categoryConfigs.position}
                            value={row.positionId}
                            onChange={(v) =>
                              handleChange(row.tempId, "positionId", String(v))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <GenericSearchSelect
                            api={categoryConfigs.department.api}
                            config={categoryConfigs.department}
                            value={row.departmentId}
                            onChange={(v) => {
                              handleChange(row.tempId, "departmentId", String(v));
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <GenericSearchSelect
                            api={categoryConfigs.company.api}
                            config={categoryConfigs.company}
                            value={row.companyId}
                            onChange={(v) =>
                              handleChange(row.tempId, "companyId", String(v))
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <Textarea
                            value={row.detail}
                            onChange={(e) =>
                              update(row.tempId, "detail", e.target.value)
                            }
                            className="h-8 text-sm"
                            placeholder="Mô tả công việc, vị trí..."
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t shrink-0">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !rows.length}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isSubmitting ? "Đang lưu..." : `Xác nhận (${rows.length} dòng)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
