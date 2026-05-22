import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Input } from "@/shared/components/ui/input";
import {
  Briefcase, Loader2, Save, X, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { workProcessApi } from "../api/workProcess";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkProcess {
  id: number;
  startDate: string;
  endDate: string;
  detail: string;
  positionId?: number;
  departmentId?: number;
  companyId?: number;
}

interface EditRow extends WorkProcess {
  isNew?: boolean;
  isDeleted?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workProcessList: WorkProcess[];
  employeeName?: string;
  employeeId?: number;
  onSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _tempId = -1;
const nextTempId = () => _tempId--;

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function WorkProcessEditModal({
  isOpen,
  onClose,
  workProcessList,
  employeeName,
  employeeId,
  onSuccess,
}: Props) {
  const [rows, setRows] = useState<EditRow[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRows(workProcessList.map(p => ({ ...p })));
    } else {
      setRows([]);
    }
  }, [isOpen, workProcessList]);

  const update = (id: number, field: keyof EditRow, value: string | number | undefined) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const addRow = () =>
    setRows(prev => [...prev, {
      id: nextTempId(),
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      detail: "",
      isNew: true,
    }]);

  const removeRow = (id: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, isDeleted: true } : r));

  const validate = () => {
    const activeRows = rows.filter(r => !r.isDeleted);
    for (const r of activeRows) {
      if (!r.detail.trim())            { toast.error("Thiếu nội dung công tác"); return false; }
      if (!r.startDate)                { toast.error("Thiếu ngày bắt đầu"); return false; }
      if (!r.endDate)                  { toast.error("Thiếu ngày kết thúc"); return false; }
      if (r.startDate > r.endDate)     { toast.error("Ngày bắt đầu phải trước ngày kết thúc"); return false; }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        employeeId,
        workProcesses: rows
          .filter(r => !r.isDeleted)
          .map(r => ({
            ...(r.isNew ? {} : { id: r.id }),
            startDate: r.startDate,
            endDate: r.endDate,
            detail: r.detail,
            ...(r.positionId   ? { positionId: r.positionId }     : {}),
            ...(r.departmentId ? { departmentId: r.departmentId } : {}),
            ...(r.companyId    ? { companyId: r.companyId }       : {}),
          })),
      };
      await workProcessApi.update(payload);
      toast.success("Đã cập nhật quá trình công tác");
      onSuccess?.();
      handleClose();
    } catch {
      toast.error("Không thể cập nhật");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => { setRows([]); onClose(); };

  const activeRows = rows.filter(r => !r.isDeleted);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Chỉnh sửa quá trình công tác{employeeName ? ` – ${employeeName}` : ""}
          </DialogTitle>
        </DialogHeader>

        {activeRows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Briefcase className="h-8 w-8" />
            <p className="text-sm">Chưa có quá trình công tác nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeRows.map((item, index) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg space-y-3 ${item.isNew ? "border-blue-300 bg-blue-50/50" : ""}`}
              >
                {/* Row 1: số thứ tự + nội dung + xóa */}
                <div className="flex items-center gap-3">
                  <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {index + 1}
                  </span>
                  <Input
                    value={item.detail}
                    onChange={e => update(item.id, "detail", e.target.value)}
                    className="h-9 text-sm flex-1"
                    placeholder="Nội dung công tác..."
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 shrink-0"
                    onClick={() => removeRow(item.id)}
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Row 2: ngày bắt đầu + ngày kết thúc */}
                <div className="grid grid-cols-2 gap-3 pl-9">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Từ ngày</p>
                    <Input
                      type="date"
                      value={item.startDate}
                      onChange={e => update(item.id, "startDate", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Đến ngày</p>
                    <Input
                      type="date"
                      value={item.endDate}
                      onChange={e => update(item.id, "endDate", e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Row 3: chức vụ + phòng ban + công ty — mỗi ô full width trong grid */}
                <div className="grid grid-cols-3 gap-3 pl-9">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">Chức vụ</p>
                    <GenericSearchSelect
                      api={categoryConfigs.position.api}
                      config={categoryConfigs.position}
                      value={item.positionId}
                      onChange={(v) => update(item.id, "positionId", v as number | undefined)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">Phòng ban quản lý</p>
                    <GenericSearchSelect
                      api={categoryConfigs.department.api}
                      config={categoryConfigs.department}
                      value={item.departmentId}
                      onChange={(v) => update(item.id, "departmentId", v as number | undefined)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground">Tập đoàn / Công ty</p>
                    <GenericSearchSelect
                      api={categoryConfigs.company.api}
                      config={categoryConfigs.company}
                      value={item.companyId}
                      onChange={(v) => update(item.id, "companyId", v as number | undefined)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add row */}
        <Button variant="outline" size="sm" className="w-full gap-1.5 mt-1" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> Thêm quá trình
        </Button>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-1" /> Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              : <Save className="h-4 w-4 mr-1" />}
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}