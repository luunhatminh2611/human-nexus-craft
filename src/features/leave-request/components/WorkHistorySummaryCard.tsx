import { WorkHistorySummary } from '../data/workHistoryType';
import { CheckCircle2, XCircle, Clock, Award } from 'lucide-react';

interface Props {
  employeeName: string;
  summary: WorkHistorySummary;
}

export default function WorkHistorySummaryCard({ employeeName, summary }: Props) {
  const { totalEffectiveMonths, seniorityYears, eligible, eligibilityLabel } = summary;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          📊 Tổng hợp
        </h3>
        <span className="text-sm font-medium">{employeeName}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Clock className="h-4 w-4 text-violet-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Thời gian hiệu lực</p>
            <p className="font-semibold text-sm">{totalEffectiveMonths} tháng</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
          <Award className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Thâm niên</p>
            <p className="font-semibold text-sm">{seniorityYears} năm</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
          eligible
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-amber-50 text-amber-700'
        }`}
      >
        {eligible ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0" />
        )}
        <span>{eligibilityLabel}</span>
      </div>

      {!eligible && (
        <p className="text-xs text-muted-foreground">
          Còn thiếu <strong>{12 - totalEffectiveMonths} tháng</strong> để đủ điều kiện nghỉ phép năm.
          Các đơn nghỉ sẽ tự động tính là <strong>nghỉ không lương</strong>.
        </p>
      )}
    </div>
  );
}
