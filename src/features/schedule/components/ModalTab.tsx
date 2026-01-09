import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button as Button2 } from "@/shared/components/ui/button/Button2";
import { Save, X, Edit, Plus } from "lucide-react";
import { workScheduleApi } from "../../schedule/api/scheduleApi";
import { toast } from "@/shared/hooks/use-toast";

interface WorkSchedule {
  id: number;
  title?: string;
  employeeId: number;
  location?: string;
  startDateTime: string;
  endDateTime?: string;
  description?: string;
  status?: string;
}

interface WorkScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: WorkSchedule | null; // null = create, có giá trị = edit
  employeeId: number; // employeeId cố định
  onSuccess: () => void;
}

export default function WorkScheduleFormModal({
  isOpen,
  onClose,
  schedule,
  employeeId,
  onSuccess,
}: WorkScheduleFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    description: "",
  });

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (schedule) {
        // Edit mode - điền dữ liệu có sẵn
        setFormData({
          title: schedule.title || "",
          location: schedule.location || "",
          startDateTime: schedule.startDateTime?.split("T")[0] || "",
          endDateTime: schedule.endDateTime?.split("T")[0] || "",
          description: schedule.description || "",
        });
      } else {
        // Create mode - reset form
        setFormData({
          title: "",
          location: "",
          startDateTime: "",
          endDateTime: "",
          description: "",
        });
      }
    }
  }, [isOpen, schedule]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tiêu đề",
        variant: "destructive",
      });
      return;
    }

    if (!formData.startDateTime) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày bắt đầu",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        employeeId: employeeId, // Sử dụng employeeId từ props
        location: formData.location,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime || formData.startDateTime, // Nếu không có endDate thì = startDate
        description: formData.description,
      };

      if (schedule) {
        // Update
        await workScheduleApi.update(schedule.id, payload);
        toast({
          title: "Thành công",
          description: "Đã cập nhật lịch công tác",
        });
      } else {
        // Create
        await workScheduleApi.create(payload);
        toast({
          title: "Thành công",
          description: "Đã tạo lịch công tác mới",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể lưu lịch công tác",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {schedule ? (
              <>
                <Edit size={20} className="text-blue-600" /> Chỉnh sửa lịch công tác
              </>
            ) : (
              <>
                <Plus size={20} className="text-green-600" /> Thêm lịch công tác mới
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Tiêu đề */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề lịch công tác..."
              disabled={loading}
            />
          </div>

          {/* Địa điểm */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Địa điểm
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa điểm..."
              disabled={loading}
            />
          </div>

          {/* Ngày bắt đầu và Ngày kết thúc */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                Ngày kết thúc
              </label>
              <input
                type="date"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div className="text-xs text-gray-500 -mt-2">
            💡 Để trống ngày kết thúc hoặc chọn giống ngày bắt đầu → Lịch công tác 1 ngày
          </div>

          {/* Mô tả */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Nhập mô tả công việc..."
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button2
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              <X size={16} className="mr-1" /> Hủy
            </Button2>
            <Button2
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" /> Xác nhận
                </>
              )}
            </Button2>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}