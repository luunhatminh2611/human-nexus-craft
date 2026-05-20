import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Input } from "@/shared/components/ui/input";
import { Calendar, Briefcase, Clock, Pencil, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { workProcessApi } from "../api/workProcess";

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

// ─── Types ────────────────────────────────────────────────────────────────────
interface WorkProcess {
  id: number;
  startDate: string;
  endDate: string;
  detail: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workProcessList: WorkProcess[];
  employeeName?: string;
  employeeId?: number;
  isAdmin?: boolean;
  onSuccess?: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function WorkProcessModal({
  isOpen,
  onClose,
  workProcessList,
  employeeName,
  employeeId,
  isAdmin,
  onSuccess,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<WorkProcess>>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = (item: WorkProcess) => {
    setEditingId(item.id);
    setEditData({ startDate: item.startDate, endDate: item.endDate, detail: item.detail });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id: number) => {
    if (!editData.startDate || !editData.endDate || !editData.detail?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (editData.startDate > editData.endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    setIsSaving(true);
    try {
      await workProcessApi.update(editData);
      toast.success("Đã cập nhật quá trình công tác");
      onSuccess?.();
      cancelEdit();
    } catch {
      toast.error("Không thể cập nhật");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Quá trình công tác{employeeName ? ` – ${employeeName}` : ""}
          </DialogTitle>
        </DialogHeader>

        {workProcessList.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Briefcase className="h-8 w-8" />
            <p className="text-sm">Không có quá trình công tác nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workProcessList.map((item, index) => {
              const isEditing = editingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg space-y-3 transition-colors ${isEditing ? "border-primary/50 bg-primary/5" : ""}`}
                >
                  {/* Header: số thứ tự + detail + nút edit */}
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {index + 1}
                    </span>

                    {isEditing ? (
                      <Input
                        value={editData.detail || ""}
                        onChange={e => setEditData(p => ({ ...p, detail: e.target.value }))}
                        className="h-8 text-sm flex-1"
                        placeholder="Nội dung công tác..."
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm font-medium leading-snug flex-1">
                        {item.detail || "—"}
                      </p>
                    )}

                    {/* Nút edit / save / cancel — chỉ admin */}
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSave(item.id)}
                              disabled={isSaving}
                              title="Lưu"
                            >
                              {isSaving
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Save className="h-3.5 w-3.5 text-green-600" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              title="Hủy"
                            >
                              <X className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(item)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-3 gap-2 pl-9">
                    <div className="flex items-start gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Từ ngày</p>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editData.startDate || ""}
                            onChange={e => setEditData(p => ({ ...p, startDate: e.target.value }))}
                            className="h-7 text-xs mt-0.5 px-1"
                          />
                        ) : (
                          <p className="text-sm font-medium">{formatDate(item.startDate)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Đến ngày</p>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editData.endDate || ""}
                            onChange={e => setEditData(p => ({ ...p, endDate: e.target.value }))}
                            className="h-7 text-xs mt-0.5 px-1"
                          />
                        ) : (
                          <p className="text-sm font-medium">{formatDate(item.endDate)}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Thời gian</p>
                        <p className="text-sm font-medium">
                          {calcDuration(
                            isEditing ? (editData.startDate || item.startDate) : item.startDate,
                            isEditing ? (editData.endDate   || item.endDate)   : item.endDate,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}