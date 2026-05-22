import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { workProcessApi } from "../api/workProcess";
import { Textarea } from "@/components/ui/textarea";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";

interface WorkProcess {
  id?: number;
  startDate: string;
  endDate: string;
  detail: string;
  positionId?: number;
  departmentId?: number;
  companyId?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number;
  historyData?: WorkProcess | null;
  mode: "create" | "edit";
  onSuccess?: () => void;
}

const today = new Date().toISOString().split("T")[0];

const EMPTY_FORM: WorkProcess = {
  startDate: today,
  endDate: today,
  detail: "",
  positionId: 0,
  departmentId: 0,
  companyId: 0,
};

export default function WorkProcessFormModal({
  isOpen,
  onClose,
  employeeId,
  historyData,
  mode,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState<WorkProcess>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  console.log("Form Data in Modal:", formData);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && historyData) {
        setFormData({
          id: historyData.id,
          startDate: historyData.startDate || "",
          endDate: historyData.endDate || "",
          detail: historyData.detail || "",
          positionId: historyData.positionId || 0,
          departmentId: historyData.departmentId || 0,
          companyId: historyData.companyId || 0,
        });
      } else {
        setFormData(EMPTY_FORM);
      }
    }
  }, [isOpen, mode, historyData]);

  const handleChange = (field: keyof WorkProcess, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (!formData.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return false;
    }
    if (!formData.detail?.trim()) {
      toast.error("Vui lòng nhập nội dung công tác");
      return false;
    }
    if (formData.endDate && formData.startDate > formData.endDate) {
      toast.error("Ngày bắt đầu phải trước ngày kết thúc");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (mode === "create") {
        await workProcessApi.create(employeeId, { ...formData });
        toast.success("Thêm quá trình công tác thành công");
      } else {
        await workProcessApi.updateById(formData.id, { ...formData });
        toast.success("Cập nhật quá trình công tác thành công");
      }
      onSuccess?.();
      onClose();
    } catch {
      toast.error("Không thể lưu thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Thêm quá trình công tác"
              : "Chỉnh sửa quá trình công tác"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">
              Từ ngày <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">
              Đến ngày <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="positionId">
            Chức vụ <span className="text-red-500">*</span>
          </Label>
          <GenericSearchSelect
            api={categoryConfigs.position.api}
            config={categoryConfigs.position}
            value={formData.positionId}
            onChange={(v) => handleChange("positionId", String(v))}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departmentId">
            Phòng ban quản lý <span className="text-red-500">*</span>
          </Label>
          <GenericSearchSelect
            api={categoryConfigs.department.api}
            config={categoryConfigs.department}
            value={formData.departmentId}
            onChange={(v) => {
              handleChange("departmentId", String(v));
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="companyId">
            Tập đoàn/Công ty <span className="text-red-500">*</span>
          </Label>
          <GenericSearchSelect
            api={categoryConfigs.company.api}
            config={categoryConfigs.company}
            value={formData.companyId}
            onChange={(v) =>
              handleChange("companyId", String(v))
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="detail">
            Tóm tắt quá trình công tác <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="detail"
            placeholder="Nhập tóm tắt quá trình công tác..."
            value={formData.detail}
            onChange={(e) => handleChange("detail", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : mode === "create" ? (
              "Thêm mới"
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
