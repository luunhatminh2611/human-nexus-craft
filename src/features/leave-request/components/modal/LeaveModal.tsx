import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button/Button2";
import { Upload, X, FileText } from "lucide-react";

export default function LeaveRequestModal({
  isOpen,
  setIsOpen,
  formData,
  selectedFile,
  loading,
  handleInputChange,
  handleFileChange,
  handleRemoveFile,
  handleSubmit,
  resetForm,
  isEdit = false,
  currentFileName = null,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Chỉnh sửa đơn xin nghỉ phép" : "Tạo đơn xin nghỉ phép"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Cập nhật thông tin đơn xin nghỉ phép của bạn"
              : "Điền đầy đủ thông tin để tạo đơn xin nghỉ phép mới"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề đơn *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ví dụ: Xin nghỉ phép việc riêng"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Ngày bắt đầu *</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Ngày kết thúc *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">Lý do nghỉ phép *</Label>
              <Textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Nhập lý do nghỉ phép..."
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">
                File đính kèm (không bắt buộc)
              </Label>

              {/* Hiển thị file hiện tại nếu đang edit và chưa chọn file mới */}
              {isEdit && currentFileName && !selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    File hiện tại: <span className="font-medium">{currentFileName}</span>
                  </span>
                </div>
              )}

              {!selectedFile ? (
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-sm truncate font-medium">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="ml-2 flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isEdit && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedFile 
                    ? "File mới sẽ thay thế file hiện tại"
                    : currentFileName 
                      ? "Chọn file mới nếu muốn thay đổi, hoặc để trống để giữ file hiện tại"
                      : "Chọn file nếu muốn thêm đính kèm"
                  }
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
              disabled={loading}
            >
              Hủy
            </Button>

            <Button type="submit" disabled={loading}>
              {loading 
                ? (isEdit ? "Đang cập nhật..." : "Đang tạo...") 
                : (isEdit ? "Cập nhật" : "Tạo đơn")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}