import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Briefcase, Clock, AlertTriangle } from 'lucide-react';
import { Employee } from '../data/leaveData';

interface Props {
  employee: Employee;
}

export default function LeaveBalanceCard({ employee }: Props) {
  const { leaveBalance, workingMonths, yearsWorked, jobType } = employee;
  const eligible = workingMonths >= 12;

  const JOB_TYPE_LABELS: Record<string, string> = {
    UNDERGROUND: 'Hầm lò',
    OFFICE: 'Văn phòng',
    HAZARDOUS: 'Nặng nhọc, độc hại',
    NORMAL: 'Bình thường',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Số dư phép năm — {employee.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{leaveBalance.annual}</div>
            <div className="text-xs text-muted-foreground">Tổng phép năm</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-orange-600">{leaveBalance.used}</div>
            <div className="text-xs text-muted-foreground">Đã sử dụng</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-emerald-600">{leaveBalance.remaining}</div>
            <div className="text-xs text-muted-foreground">Còn lại</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{yearsWorked}</div>
            <div className="text-xs text-muted-foreground">Năm công tác</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <Briefcase className="h-3 w-3" />
            {JOB_TYPE_LABELS[jobType]}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {workingMonths} tháng làm việc
          </Badge>
          {!eligible && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Chưa đủ 12 tháng — Không đủ điều kiện nghỉ phép năm
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
