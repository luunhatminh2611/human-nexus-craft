import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Calendar, Briefcase, Clock, Building2, LayoutGrid, UserCircle } from "lucide-react";

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
  if (months <= 0) return "Dưới 1 tháng";
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
  positionId?: number;
  departmentId?: number;
  companyId?: number;
  positionName?: string;
  departmentName?: string;
  companyName?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  workProcessList: WorkProcess[];
  employeeName?: string;
}

// ─── Tag chip ─────────────────────────────────────────────────────────────────
function Tag({
  icon: Icon,
  label,
  empty,
}: {
  icon: React.ElementType;
  label?: string;
  empty?: boolean;
}) {
  if (empty) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-border text-muted-foreground/60 italic">
        <Icon className="h-3 w-3 shrink-0" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border bg-muted text-foreground font-medium">
      <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
      {label}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function WorkProcessModal({
  isOpen,
  onClose,
  workProcessList,
  employeeName,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Quá trình công tác
          </DialogTitle>
          {employeeName && (
            <p className="text-sm text-foreground/70 mt-0.5">
              {employeeName}
              {workProcessList.length > 0 && (
                <span className="text-muted-foreground">
                  {" "}&nbsp;·&nbsp; {workProcessList.length} giai đoạn
                </span>
              )}
            </p>
          )}
        </DialogHeader>

        {/* Body */}
        <div className="overflow-y-auto px-4 py-3 flex flex-col gap-2">
          {workProcessList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
              <Briefcase className="h-8 w-8 opacity-30" />
              <p className="text-sm">Không có quá trình công tác nào</p>
            </div>
          ) : (
            workProcessList.map((item, index) => {
              const duration = calcDuration(item.startDate, item.endDate);
              const hasLongDuration =
                item.startDate &&
                item.endDate &&
                new Date(item.endDate).getTime() -
                  new Date(item.startDate).getTime() >
                  30 * 24 * 60 * 60 * 1000;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 border border-border rounded-xl px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Index badge */}
                  <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground">
                    {index + 1}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">

                    {/* Detail + duration */}
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-sm font-semibold leading-snug text-foreground break-words">
                        {item.detail || "—"}
                      </p>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap
                          ${
                            hasLongDuration
                              ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300"
                              : "bg-muted border-border text-foreground/70"
                          }`}
                      >
                        <Clock className="h-3 w-3" />
                        {duration}
                      </span>
                    </div>

                    {/* Date range */}
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
                      <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span>{formatDate(item.startDate)}</span>
                      <span className="text-muted-foreground px-0.5">→</span>
                      <span>{formatDate(item.endDate)}</span>
                    </div>

                    {/* Tags: chức vụ / phòng ban / công ty */}
                    <div className="flex flex-wrap gap-1.5">
                      <Tag
                        icon={UserCircle}
                        label={
                          item.positionName ||
                          (item.positionId ? String(item.positionId) : "Chưa có chức vụ")
                        }
                        empty={!item.positionName && !item.positionId}
                      />
                      <Tag
                        icon={LayoutGrid}
                        label={
                          item.departmentName ||
                          (item.departmentId ? String(item.departmentId) : "Chưa có phòng ban")
                        }
                        empty={!item.departmentName && !item.departmentId}
                      />
                      <Tag
                        icon={Building2}
                        label={
                          item.companyName ||
                          (item.companyId ? String(item.companyId) : "Chưa có công ty")
                        }
                        empty={!item.companyName && !item.companyId}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </DialogContent>
    </Dialog>
  );
}