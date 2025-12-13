// EmployeeScheduleModal.tsx
import React from "react";
import Button from "@/shared/components/ui/button/Button";
import { Save, X, Edit, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

type DaySchedule = {
  id: number | string;
  instanceId: string;
  employeeId: number | string;
  date: string;
  location?: string;
  status?: string;
  employeeName?: string;
  createdById?: number | string;
  raw?: any;
};

type EmployeeScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    location: string,
    description: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  editingSchedule: DaySchedule | null;
  selectedDay: string | null;
  isFromDayCell: boolean;
};

export default function EmployeeScheduleModal({
  isOpen,
  onClose,
  onSave,
  editingSchedule,
  selectedDay,
  isFromDayCell,
}: EmployeeScheduleModalProps) {
  const handleSubmit = async () => {
    const title = (document.getElementById("modal-title") as HTMLInputElement)?.value;
    const location = (document.getElementById("modal-location") as HTMLInputElement)?.value;
    const description = (document.getElementById("modal-description") as HTMLTextAreaElement)?.value;
    const startDate = (document.getElementById("modal-start-date") as HTMLInputElement)?.value;
    const endDate = (document.getElementById("modal-end-date") as HTMLInputElement)?.value;

    if (!title?.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }

    if (!location?.trim()) {
      alert("Vui lòng nhập địa điểm");
      return;
    }

    if (!startDate) {
      alert("Vui lòng chọn ngày bắt đầu");
      return;
    }

    const finalEndDate = isFromDayCell ? startDate : (endDate || startDate);

    await onSave(title, location, description, startDate, finalEndDate);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingSchedule ? (
              <>
                <Edit size={20} className="text-blue-600" /> Chỉnh sửa lịch công tác
              </>
            ) : (
              <>
                <Plus size={20} className="text-green-600" />
                {isFromDayCell ? "Thêm lịch công tác" : "Tạo lịch công tác"}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Tiêu đề và Địa điểm - CÙNG HÀNG */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-title"
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Nhập tiêu đề lịch công tác..."
                defaultValue={editingSchedule?.raw?.title ?? ""}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                id="modal-location"
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                placeholder="Nhập địa điểm..."
                defaultValue={editingSchedule?.location ?? ""}
              />
            </div>
          </div>

          {/* Ngày bắt đầu và Ngày kết thúc - CÙNG HÀNG */}
          {isFromDayCell && !editingSchedule ? (
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Ngày làm việc
              </label>
              <input
                id="modal-start-date"
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1"
                defaultValue={selectedDay || ""}
                readOnly
              />
              <input
                id="modal-end-date"
                type="hidden"
                value={selectedDay || ""}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-start-date"
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 mt-1"
                  defaultValue={
                    editingSchedule?.raw?.startDateTime?.split("T")[0] || selectedDay || ""
                  }
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Ngày kết thúc
                </label>
                <input
                  id="modal-end-date"
                  type="date"
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white mt-1"
                  defaultValue={
                    editingSchedule?.raw?.endDateTime?.split("T")[0] || selectedDay || ""
                  }
                />
              </div>
            </div>
          )}

          {/* Hint text - Hiển thị dưới grid ngày tháng */}
          {!isFromDayCell && (
            <div className="text-xs text-gray-500 -mt-2">
              Để trống hoặc giống ngày bắt đầu → 1 ngày. Chọn khác → khoảng thời gian.
            </div>
          )}

          {/* Mô tả - FULL WIDTH */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Mô tả
            </label>
            <textarea
              id="modal-description"
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none"
              placeholder="Nhập mô tả công việc..."
              rows={3}
              defaultValue={editingSchedule?.raw?.description ?? ""}
            />
          </div>

          {/* Thông báo trạng thái */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            <p className="font-medium">📋 Lưu ý:</p>
            <p>Lịch công tác sẽ ở trạng thái <strong>"Chờ xác nhận"</strong> cho đến khi trưởng phòng xác nhận.</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            <X size={16} className="mr-1" /> Hủy
          </Button>
          <Button onClick={handleSubmit}>
            <Save size={16} className="mr-1" /> {editingSchedule ? "Cập nhật" : "Tạo lịch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}