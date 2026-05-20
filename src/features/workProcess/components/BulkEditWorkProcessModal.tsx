// components/BulkEditWorkProcessModal.tsx

import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Pencil,
  User,
  Trash2,
} from "lucide-react";

import { workProcessApi } from "../api/workProcess";
import { WorkProcess } from "../pages/admin/AdminWorkProcess";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkProcessEntry {
  id?: number;
  tempId: number;
  startDate: string;
  endDate: string;
  detail: string;
  isNew?: boolean;
}

interface EmployeeRow {
  employeeId: number;
  employeeName: string;
  entries: WorkProcessEntry[];
  isExpanded: boolean;
  rowStatus: "pending" | "success" | "error";
  errorMessage?: string;
}

/** initialRows shape (enriched từ WorkHistoryPage) */
export interface BulkEditRow extends WorkProcess {
  employeeId: number;
  employeeName: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRows?: BulkEditRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _tempId = 1;
const nextId = () => _tempId++;
const today = () => new Date().toISOString().split("T")[0];

function makeEntry(): WorkProcessEntry {
  return {
    tempId: nextId(),
    startDate: today(),
    endDate: today(),
    detail: "",
    isNew: true,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BulkEditWorkProcessModal({
  isOpen,
  onClose,
  onSuccess,
  initialRows,
}: Props) {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Khởi tạo từ initialRows ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    if (!initialRows || initialRows.length === 0) {
      setEmployees([]);
      return;
    }

    // Gom theo employeeId
    const map = new Map<number, EmployeeRow>();
    for (const r of initialRows) {
      if (!map.has(r.employeeId)) {
        map.set(r.employeeId, {
          employeeId: r.employeeId,
          employeeName: r.employeeName,
          entries: [],
          isExpanded: false,
          rowStatus: "pending",
        });
      }
      map.get(r.employeeId)!.entries.push({
        id: r.id,
        tempId: nextId(),
        startDate: r.startDate ?? today(),
        endDate: r.endDate ?? today(),
        detail: r.detail ?? "",
        isNew: false,
      });
    }

    setEmployees(Array.from(map.values()));
  }, [isOpen]);

  // ─── Employee-level actions ────────────────────────────────────────────────
  const toggleExpand = (empId: number) =>
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === empId ? { ...e, isExpanded: !e.isExpanded } : e,
      ),
    );

  const removeEmployee = (empId: number) =>
    setEmployees((prev) => prev.filter((e) => e.employeeId !== empId));

  // ─── Entry-level actions ───────────────────────────────────────────────────
  const addEntry = (empId: number) =>
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === empId
          ? { ...e, entries: [...e.entries, makeEntry()] }
          : e,
      ),
    );

  const removeEntry = (empId: number, tempId: number) =>
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === empId
          ? { ...e, entries: e.entries.filter((en) => en.tempId !== tempId) }
          : e,
      ),
    );

  const updateEntry = (
    empId: number,
    tempId: number,
    field: keyof WorkProcessEntry,
    value: any,
  ) =>
    setEmployees((prev) =>
      prev.map((e) =>
        e.employeeId === empId
          ? {
              ...e,
              entries: e.entries.map((en) =>
                en.tempId === tempId ? { ...en, [field]: value } : en,
              ),
            }
          : e,
      ),
    );

  // ─── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    let ok = true;
    setEmployees((prev) =>
      prev.map((emp) => {
        const entryErrs: string[] = [];
        const updatedEntries = emp.entries.map((en) => {
          const errs: string[] = [];
          if (!en.startDate) errs.push("Thiếu ngày bắt đầu");
          if (!en.endDate) errs.push("Thiếu ngày kết thúc");
          if (en.startDate && en.endDate && en.startDate > en.endDate)
            errs.push("Ngày bắt đầu phải trước ngày kết thúc");
          if (!en.detail.trim()) errs.push("Thiếu nội dung công tác");
          if (errs.length) entryErrs.push(...errs);
          return en;
        });

        if (emp.entries.length === 0) {
          entryErrs.push("Chưa có quá trình nào");
        }

        if (entryErrs.length) {
          ok = false;
          return {
            ...emp,
            entries: updatedEntries,
            isExpanded: true, // tự mở accordion khi có lỗi
            rowStatus: "error" as const,
            errorMessage: entryErrs[0],
          };
        }
        return {
          ...emp,
          entries: updatedEntries,
          rowStatus: "pending" as const,
          errorMessage: undefined,
        };
      }),
    );
    return ok;
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!employees.length) {
      toast.error("Không có nhân viên nào để chỉnh sửa");
      return;
    }
    if (!validate()) {
      toast.error("Kiểm tra các dòng bị lỗi");
      return;
    }

    setIsSubmitting(true);

    const payload = employees.map((emp) => ({
      employeeId: emp.employeeId,
      workProcesses: emp.entries.map((en) => ({
        ...(en.id ? { id: en.id } : {}),
        startDate: en.startDate,
        endDate: en.endDate,
        detail: en.detail,
      })),
    }));

    console.log("Payload edit:", payload);

    try {
      await workProcessApi.updateBulk(payload);
      setEmployees((prev) => prev.map((e) => ({ ...e, rowStatus: "success" })));
      const total = employees.reduce((s, e) => s + e.entries.length, 0);
      toast.success(`Đã cập nhật ${total} quá trình công tác thành công`);
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmployees([]);
    onClose();
  };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const totalEntries = employees.reduce((s, e) => s + e.entries.length, 0);
  const errorCount = employees.filter((e) => e.rowStatus === "error").length;
  const successCount = employees.filter(
    (e) => e.rowStatus === "success",
  ).length;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[96vw] w-full h-[92vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Chỉnh sửa quá trình công tác hàng loạt
          </DialogTitle>
          <DialogDescription>
            Mở từng nhân viên để chỉnh sửa, thêm hoặc xóa quá trình công tác
          </DialogDescription>
        </DialogHeader>

        {/* Stats bar */}
        <div className="px-6 py-2.5 border-b bg-muted/30 shrink-0 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <b>{employees.length}</b> nhân viên
          </span>
          <span>·</span>
          <span>
            <b>{totalEntries}</b> quá trình
          </span>
          {errorCount > 0 && (
            <>
              <span>·</span>
              <span className="text-red-500 font-medium">
                ✗ {errorCount} lỗi
              </span>
            </>
          )}
          {successCount > 0 && (
            <>
              <span>·</span>
              <span className="text-green-600 font-medium">
                ✓ {successCount} thành công
              </span>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-2">
          {employees.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground text-sm">
              <Briefcase className="h-10 w-10 opacity-30" />
              <p>Không có nhân viên nào được chọn.</p>
            </div>
          ) : (
            employees.map((emp, empIndex) => (
              <div
                key={emp.employeeId}
                className={`border rounded-lg overflow-hidden transition-colors
                ${
                  emp.rowStatus === "error"
                    ? "border-red-300"
                    : emp.rowStatus === "success"
                      ? "border-green-300"
                      : "border-border"
                }`}
              >
                {/* ── Master row ── */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none
                  ${
                    emp.rowStatus === "error"
                      ? "bg-red-50"
                      : emp.rowStatus === "success"
                        ? "bg-green-50"
                        : "bg-muted/30"
                  }
                  hover:bg-muted/50 transition-colors`}
                  onClick={() => toggleExpand(emp.employeeId)}
                >
                  {/* Chevron */}
                  <span className="text-muted-foreground shrink-0">
                    {emp.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </span>

                  {/* STT */}
                  <span className="text-sm text-muted-foreground w-5 shrink-0 text-center">
                    {empIndex + 1}
                  </span>

                  {/* Avatar + tên */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium text-sm truncate">
                      {emp.employeeName}
                    </span>
                  </div>

                  {/* Badge số quá trình */}
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {emp.entries.length} quá trình
                  </Badge>

                  {/* Badge trạng thái */}
                  {emp.rowStatus === "error" && (
                    <Badge
                      variant="destructive"
                      className="shrink-0 text-xs max-w-[180px] truncate"
                    >
                      {emp.errorMessage ?? "Lỗi"}
                    </Badge>
                  )}
                  {emp.rowStatus === "success" && (
                    <Badge className="shrink-0 text-xs bg-green-600">
                      Đã lưu
                    </Badge>
                  )}

                  {/* Nút xóa nhân viên khỏi danh sách */}
                  <button
                    type="button"
                    className="shrink-0 p-1 rounded hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Xóa nhân viên này khỏi danh sách"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEmployee(emp.employeeId);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ── Detail accordion ── */}
                {emp.isExpanded && (
                  <div className="border-t bg-background">
                    {emp.entries.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/20">
                              <TableHead className="w-10 text-center">
                                #
                              </TableHead>
                              <TableHead className="min-w-[155px]">
                                Ngày bắt đầu *
                              </TableHead>
                              <TableHead className="min-w-[155px]">
                                Ngày kết thúc *
                              </TableHead>
                              <TableHead className="min-w-[300px]">
                                Nội dung công tác *
                              </TableHead>
                              <TableHead className="w-12 text-center">
                                Xóa
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {emp.entries.map((en, enIdx) => (
                              <TableRow
                                key={en.tempId}
                                className={en.isNew ? "bg-blue-50/50" : ""}
                              >
                                <TableCell className="text-center text-xs text-muted-foreground">
                                  <div>{enIdx + 1}</div>
                                  {en.isNew && (
                                    <div className="text-[9px] text-blue-500 font-medium leading-none mt-0.5">
                                      mới
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="date"
                                    value={en.startDate}
                                    onChange={(e) =>
                                      updateEntry(
                                        emp.employeeId,
                                        en.tempId,
                                        "startDate",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="date"
                                    value={en.endDate}
                                    onChange={(e) =>
                                      updateEntry(
                                        emp.employeeId,
                                        en.tempId,
                                        "endDate",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 text-sm"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={en.detail}
                                    onChange={(e) =>
                                      updateEntry(
                                        emp.employeeId,
                                        en.tempId,
                                        "detail",
                                        e.target.value,
                                      )
                                    }
                                    className="h-8 text-sm"
                                    placeholder="Mô tả công việc, vị trí..."
                                  />
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      removeEntry(emp.employeeId, en.tempId)
                                    }
                                    title="Xóa quá trình này"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="px-6 py-5 text-sm text-muted-foreground text-center">
                        Chưa có quá trình nào.
                      </div>
                    )}

                    {/* Nút thêm quá trình */}
                    <div className="px-4 py-2.5 border-t bg-muted/10">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-primary hover:text-primary hover:bg-primary/5"
                        onClick={() => addEntry(emp.employeeId)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Thêm quá trình công tác
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
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
              disabled={isSubmitting || !employees.length}
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isSubmitting
                ? "Đang lưu..."
                : `Lưu thay đổi (${totalEntries} quá trình)`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
