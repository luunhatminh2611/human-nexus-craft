import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/shared/components/ui/button/Button2";

import {
  GraduationCap,
  Calendar,
  School,
  BookOpen,
  Award,
  Pencil,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TrainingEmployeeType } from "../types/refresherTrainingType";

interface TrainingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: TrainingEmployeeType | null;
  isAdmin?: boolean;
  defaultEditing?: boolean;
}

const educationSystems = [
  { code: "HDT001", name: "Đại học chính quy" },
  { code: "HDT002", name: "Liên thông" },
  { code: "HDT003", name: "Tại chức" },
];

const trainingMethods = [
  { code: "HT001", name: "Tập trung" },
  { code: "HT002", name: "Online" },
  { code: "HT003", name: "Vừa học vừa làm" },
];

const trainingSchools = [
  { code: "TR001", name: "Đại học Bách Khoa Hà Nội" },
  { code: "TR002", name: "Đại học Quốc Gia Hà Nội" },
  { code: "TR003", name: "Học viện Công nghệ Bưu chính Viễn thông" },
];

const educationLevels = [
  { code: "TD001", name: "Kỹ sư" },
  { code: "TD002", name: "Cử nhân" },
  { code: "TD003", name: "Thạc sĩ" },
];

const trainingMajors = [
  { code: "NDT001", name: "Công nghệ thông tin" },
  { code: "NDT002", name: "An toàn thông tin" },
  { code: "NDT003", name: "Khoa học máy tính" },
];

function getBadgeVariant(level: string) {
  if (level.includes("Thạc")) return "bg-purple-100 text-purple-700";
  if (level.includes("Kỹ sư")) return "bg-blue-100 text-blue-700";
  if (level.includes("Chứng")) return "bg-green-100 text-green-700";
  return "bg-muted";
}

export default function RefresherTrainingModal({
  isOpen,
  onClose,
  employee,
  isAdmin = false,
  defaultEditing,
}: TrainingDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TrainingEmployeeType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
      setIsEditing(defaultEditing ?? false);
    }
  }, [employee, defaultEditing]);

  const updateField = (field: keyof TrainingEmployeeType, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsSubmitting(true);

    try {
      console.log("Payload gửi đi:", formData);

      // await refresherApi.update(formData);

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white text-slate-900">
        {/* Header */}
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
              <GraduationCap className="h-7 w-7 text-slate-700" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                {employee?.employeeName || "Đào tạo bồi dưỡng"}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>{employee?.employeeCode || ""}</span>
                {employee?.employeeCode && <span>•</span>}
                <span>
                  {isEditing ? "Chỉnh sửa thông tin" : "Quá trình đào tạo"}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="relative space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Card Header */}
              <div className="border-b border-slate-200 px-5 py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditing ? (
                    <Select
                      value={formData?.educationSystem?.code}
                      onValueChange={(value) => {
                        const found = educationSystems.find(
                          (x) => x.code === value,
                        );
                        updateField("educationSystem", {
                          code: found?.code || "",
                          name: found?.name || "",
                        });
                      }}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Chọn hệ đào tạo" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationSystems.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <h3 className="font-semibold text-lg text-slate-900">
                      {formData?.educationSystem?.name}
                    </h3>
                  )}

                  {isEditing ? (
                    <Select
                      value={formData?.educationLevel?.code}
                      onValueChange={(value) => {
                        const found = educationLevels.find(
                          (x) => x.code === value,
                        );
                        updateField("educationLevel", {
                          code: found?.code || "",
                          name: found?.name || "",
                        });
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chọn trình độ" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((item) => (
                          <SelectItem key={item.code} value={item.code}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      className={getBadgeVariant(
                        formData?.educationLevel?.name || "",
                      )}
                    >
                      {formData?.educationLevel?.name}
                    </Badge>
                  )}
                </div>

                {/* Trường đào tạo */}
                {isEditing ? (
                  <Select
                    value={formData?.trainingSchool?.code}
                    onValueChange={(value) => {
                      const found = trainingSchools.find(
                        (x) => x.code === value,
                      );
                      updateField("trainingSchool", {
                        code: found?.code || "",
                        name: found?.name || "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Chọn trường đào tạo" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingSchools.map((item) => (
                        <SelectItem key={item.code} value={item.code}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-slate-500 mt-1">
                    {formData?.trainingSchool?.name}
                  </p>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {/* Ngành đào tạo */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <BookOpen className="h-4 w-4" />
                      Ngành đào tạo
                    </div>
                    {isEditing ? (
                      <Select
                        value={formData?.trainingMajor?.code}
                        onValueChange={(value) => {
                          const found = trainingMajors.find(
                            (x) => x.code === value,
                          );
                          updateField("trainingMajor", {
                            code: found?.code || "",
                            name: found?.name || "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn ngành đào tạo" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainingMajors.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">
                        {formData?.trainingMajor?.name}
                      </p>
                    )}
                  </div>

                  {/* Hình thức đào tạo */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <School className="h-4 w-4" />
                      Hình thức đào tạo
                    </div>
                    {isEditing ? (
                      <Select
                        value={formData?.trainingMethod?.code}
                        onValueChange={(value) => {
                          const found = trainingMethods.find(
                            (x) => x.code === value,
                          );
                          updateField("trainingMethod", {
                            code: found?.code || "",
                            name: found?.name || "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hình thức" />
                        </SelectTrigger>
                        <SelectContent>
                          {trainingMethods.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="font-medium">
                        {formData?.trainingMethod?.name}
                      </p>
                    )}
                  </div>

                  {/* Tên lớp */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Award className="h-4 w-4" />
                      Tên lớp
                    </div>
                    {isEditing ? (
                      <Input
                        value={formData?.className || ""}
                        onChange={(e) =>
                          updateField("className", e.target.value)
                        }
                        placeholder="Tên lớp"
                      />
                    ) : (
                      <p className="font-medium">{formData?.className}</p>
                    )}
                  </div>

                  {/* Thời gian học */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" />
                      Thời gian học
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="date"
                          value={formData?.startDate || ""}
                          onChange={(e) =>
                            updateField("startDate", e.target.value)
                          }
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="date"
                          value={formData?.endDate || ""}
                          onChange={(e) =>
                            updateField("endDate", e.target.value)
                          }
                        />
                      </div>
                    ) : (
                      <p className="font-medium">
                        {formData?.startDate} - {formData?.endDate}
                      </p>
                    )}
                  </div>

                  {/* Ghi chú */}
                  {(isEditing || formData?.note) && (
                    <div className="space-y-1 md:col-span-2 xl:col-span-3">
                      <div className="text-slate-500 text-sm">Ghi chú</div>
                      {isEditing ? (
                        <Textarea
                          value={formData?.note || ""}
                          onChange={(e) => updateField("note", e.target.value)}
                          placeholder="Ghi chú"
                          className="text-sm"
                        />
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          {formData?.note}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 shrink-0 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
