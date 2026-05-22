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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

interface TrainingHistory {
  id: number;
  educationSystem: string;
  trainingMethod: string;
  school: string;
  level: string;
  major: string;
  className: string;
  duration: string;
  note: string;
}

interface TrainingEmployee {
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  educationSystem?: { code: string; name: string };
  trainingMethod?: { code: string; name: string };
  trainingSchool?: { code: string; name: string };
  educationLevel?: { code: string; name: string };
  trainingMajor?: { code: string; name: string };
  className?: string;
  studyDuration?: string;
  note?: string;
  trainingHistories?: TrainingHistory[];
}

interface TrainingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: TrainingEmployee | TrainingEmployee[] | TrainingHistory[] | null;
  isAdmin?: boolean;
}

function getBadgeVariant(level: string) {
  if (level.includes("Thạc")) {
    return "bg-purple-100 text-purple-700";
  }

  if (level.includes("Kỹ sư")) {
    return "bg-blue-100 text-blue-700";
  }

  if (level.includes("Chứng")) {
    return "bg-green-100 text-green-700";
  }

  return "bg-muted";
}

export default function RefresherTrainingModal({
  isOpen,
  onClose,
  employee,
  isAdmin = false,
}: TrainingDetailModalProps) {
  const employeeData = Array.isArray(employee) ? undefined : employee;
  const trainingHistories = Array.isArray(employee)
    ? (employee as TrainingHistory[])
    : employee?.trainingHistories;
  const hasTrainingHistories = Array.isArray(trainingHistories) && trainingHistories.length > 0;

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
                {employeeData?.employeeName || "Đào tạo bồi dưỡng"}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span>{employeeData?.employeeCode || ""}</span>
                {employeeData?.employeeCode && <span>•</span>}
                <span>Quá trình đào tạo</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="relative space-y-6">
            {hasTrainingHistories ? (
              trainingHistories.map((history: TrainingHistory) => (
                <div key={history.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[30px] top-6 h-4 w-4 rounded-full border-4 border-white bg-slate-500 shadow-sm" />

                  {/* Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Card Header */}
                    <div className="border-b border-slate-200 px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg text-slate-900">{history.educationSystem}</h3>
                        <Badge className={getBadgeVariant(history.level || "")}>{history.level}</Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{history.school}</p>
                    </div>

                    {/* Card Body */}
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <BookOpen className="h-4 w-4" />
                            Ngành đào tạo
                          </div>
                          <p className="font-medium">{history.major}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <School className="h-4 w-4" />
                            Hình thức đào tạo
                          </div>
                          <p className="font-medium">{history.trainingMethod}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Award className="h-4 w-4" />
                            Tên lớp
                          </div>
                          <p className="font-medium">{history.className}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <Calendar className="h-4 w-4" />
                            Thời gian học
                          </div>
                          <p className="font-medium">{history.duration}</p>
                        </div>

                        {history.note && (
                          <div className="space-y-1 md:col-span-2 xl:col-span-3">
                            <div className="text-slate-500 text-sm">Ghi chú</div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                              {history.note}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div key={employeeData?.employeeId} className="relative">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Card Header */}
                  <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg text-slate-900">{employeeData?.educationSystem?.name}</h3>
                      <Badge>{employeeData?.educationLevel?.name}</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{employeeData?.trainingSchool?.name}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <BookOpen className="h-4 w-4" />
                          Ngành đào tạo
                        </div>
                        <p className="font-medium">{employeeData?.trainingMajor?.name}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <School className="h-4 w-4" />
                          Hình thức đào tạo
                        </div>
                        <p className="font-medium">{employeeData?.trainingMethod?.name}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Award className="h-4 w-4" />
                          Tên lớp
                        </div>
                        <p className="font-medium">{employeeData?.className}</p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="h-4 w-4" />
                          Thời gian học
                        </div>
                        <p className="font-medium">{employeeData?.studyDuration}</p>
                      </div>

                      {employeeData?.note && (
                        <div className="space-y-1 md:col-span-2 xl:col-span-3">
                          <div className="text-slate-500 text-sm">Ghi chú</div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            {employeeData.note}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer — chỉ nút Đóng */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 shrink-0 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}