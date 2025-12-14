import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button/Button2";
import { Calendar, FileText, Download, Upload, X } from "lucide-react";
import { ehrCheckupApi } from "../../api/ehrApi";
import { transferApi } from "@/features/transfer/api/transferApi";
import { toast } from "sonner";

export default function CheckupDialog({
  open,
  onClose,
  employeeId,
  checkup,
  onSuccess,
}) {
  const isEdit = Boolean(checkup?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileKey, setExistingFileKey] = useState("");

  const [formData, setFormData] = useState({
    id: "",
    employeeId: "",
    date: "",
    hospitalName: "",
    result: "",
  });

  /* ================= LOAD DATA (EDIT) ================= */
  useEffect(() => {
    if (open) {
      if (isEdit) {
        fetchCheckupData();
      } else {
        resetForm();
      }
    }
  }, [open]);

  const fetchCheckupData = async () => {
    try {
      const data = await ehrCheckupApi.getById(checkup.id);

      setFormData({
        id: data.id,
        employeeId: data.employeeId.toString(),
        date: data.date,
        hospitalName: data.hospitalName,
        result: data.result,
      });

      if (data.file) {
        setExistingFileKey(data.file);
      }
    } catch (err) {
      toast.error("Không thể tải dữ liệu lượt khám");
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      employeeId: employeeId.toString(),
      date: "",
      hospitalName: "",
      result: "",
    });
    setSelectedFile(null);
    setExistingFileKey("");
  };

  /* ================= FILE ================= */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File tối đa 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleDownloadFile = async () => {
    try {
      const blob = await transferApi.downloadFile(existingFileKey);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = getFileName(existingFileKey);
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Không thể tải file");
    }
  };

  const getFileName = (key: string) => key.split("/").pop();

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const submitFormData = new FormData();

      if (isEdit) submitFormData.append("id", formData.id);

      submitFormData.append("employeeId", employeeId.toString());
      submitFormData.append("date", formData.date);
      submitFormData.append("hospitalName", formData.hospitalName);
      submitFormData.append("result", formData.result);

      if (selectedFile) {
        submitFormData.append("file", selectedFile);
      } else if (existingFileKey && isEdit) {
        submitFormData.append("file", existingFileKey);
      }

      if (isEdit) {
        await ehrCheckupApi.update(submitFormData);
        toast.success("Cập nhật lượt khám thành công");
      } else {
        await ehrCheckupApi.create(submitFormData);
        toast.success("Tạo lượt khám thành công");
      }

      onSuccess?.();
      onClose();
    } catch {
      toast.error("Lưu lượt khám thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật lượt khám" : "Thêm lượt khám"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Date */}
          <div>
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ngày khám
            </label>
            <input
              type="date"
              className="input w-full"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          {/* Hospital */}
          <div>
            <label className="text-sm font-medium">Bệnh viện</label>
            <input
              className="input w-full"
              value={formData.hospitalName}
              onChange={(e) =>
                setFormData({ ...formData, hospitalName: e.target.value })
              }
            />
          </div>

          {/* Result */}
          <div>
            <label className="text-sm font-medium">Kết quả</label>
            <textarea
              className="input w-full min-h-[90px]"
              value={formData.result}
              onChange={(e) =>
                setFormData({ ...formData, result: e.target.value })
              }
            />
          </div>

          {/* FILE */}
          <div>
            <label className="text-sm font-medium">File đính kèm</label>

            {existingFileKey && !selectedFile && (
              <div className="border rounded-lg p-3 bg-blue-50 flex justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm truncate">
                    {getFileName(existingFileKey)}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadFile}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}

            {selectedFile && (
              <div className="border rounded-lg p-3 bg-green-50 flex justify-between">
                <span className="text-sm truncate">{selectedFile.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <input
              type="file"
              hidden
              id="file-upload"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() =>
                document.getElementById("file-upload")?.click()
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              Chọn file
            </Button>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
