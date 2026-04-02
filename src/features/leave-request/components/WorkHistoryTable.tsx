import { WorkHistory, WORK_HISTORY_TYPE_LABELS, diffMonths } from '../data/workHistoryType';
import { Badge } from '@/components/ui/badge';

interface Props {
  histories: WorkHistory[];
}

function TypeBadge({ type }: { type: WorkHistory['type'] }) {
  const colors: Record<WorkHistory['type'], string> = {
    WORKING: 'bg-emerald-100 text-emerald-700',
    PROBATION: 'bg-blue-100 text-blue-700',
    SICK_LEAVE: 'bg-red-100 text-red-700',
    MATERNITY: 'bg-pink-100 text-pink-700',
    UNPAID_LEAVE: 'bg-amber-100 text-amber-700',
    WORK_ACCIDENT: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[type]}`}>
      {WORK_HISTORY_TYPE_LABELS[type]}
    </span>
  );
}

export default function WorkHistoryTable({ histories }: Props) {
  if (histories.length === 0) {
    return (
      <div className="text-center text-muted-foreground text-sm py-8">
        Chưa có lịch sử làm việc. Nhấn "+ Thêm lịch sử" để bắt đầu.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="text-left py-2 pr-3 font-medium">Công ty</th>
            <th className="text-left py-2 pr-3 font-medium">Loại</th>
            <th className="text-left py-2 pr-3 font-medium">Từ ngày</th>
            <th className="text-left py-2 pr-3 font-medium">Đến ngày</th>
            <th className="text-right py-2 font-medium">Tính vào</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {histories.map((h) => {
            const months = diffMonths(h.fromDate, h.toDate);
            const effective = h.isStateOwned
              ? (h.effectiveMonths ?? 0)
              : (() => {
                  switch (h.type) {
                    case 'WORKING':
                    case 'PROBATION':
                    case 'MATERNITY':
                      return months;
                    case 'SICK_LEAVE':
                      return Math.min(months, 2);
                    case 'WORK_ACCIDENT':
                      return Math.min(months, 6);
                    case 'UNPAID_LEAVE':
                      return Math.min(months, 1);
                    default:
                      return 0;
                  }
                })();

            return (
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-1.5">
                    {h.companyName}
                    {h.isStateOwned && (
                      <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">
                        Nhà nước
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 pr-3">
                  <TypeBadge type={h.type} />
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">{h.fromDate}</td>
                <td className="py-2.5 pr-3 text-muted-foreground">{h.toDate}</td>
                <td className="py-2.5 text-right">
                  {h.isStateOwned ? (
                    <span className="text-violet-600 font-medium">
                      ✅ {effective} tháng (HR nhập)
                    </span>
                  ) : h.type === 'UNPAID_LEAVE' && months > 1 ? (
                    <span className="text-amber-600">
                      ⚠️ {effective}/{months} tháng
                    </span>
                  ) : (
                    <span className="text-emerald-600">✅ {effective} tháng</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
