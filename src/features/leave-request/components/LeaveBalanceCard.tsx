import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Briefcase, Clock, AlertTriangle, Info } from 'lucide-react';
import { Employee, LeaveRequest, calculateLeaveBalance, JOB_TYPE_LABELS, calculateEffectiveMonths } from '../data/leaveData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  employee: Employee;
  requests: LeaveRequest[];
}

export default function LeaveBalanceCard({ employee, requests }: Props) {
  const balance = calculateLeaveBalance(employee, requests);
  const effectiveMonths = calculateEffectiveMonths(employee.workingTime);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Số dư phép năm — {employee.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{balance.baseDays}</div>
            <div className="text-xs text-muted-foreground">Cơ sở ({JOB_TYPE_LABELS[employee.jobType]})</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-violet-600">+{balance.seniorityBonus}</div>
            <div className="text-xs text-muted-foreground">Thâm niên ({Math.floor(balance.yearsWorked)}y)</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-foreground">{balance.totalEntitled}</div>
            <div className="text-xs text-muted-foreground">Tổng phép</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-orange-600">{balance.usedAnnual}</div>
            <div className="text-xs text-muted-foreground">Đã sử dụng</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-emerald-600">{balance.remaining}</div>
            <div className="text-xs text-muted-foreground">Còn lại</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline" className="gap-1">
            <Briefcase className="h-3 w-3" />
            {JOB_TYPE_LABELS[employee.jobType]}
          </Badge>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 cursor-help">
                  <Clock className="h-3 w-3" />
                  {effectiveMonths} tháng hiệu lực
                  <Info className="h-3 w-3 ml-1" />
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-xs space-y-1">
                  <p>Thực tế: {employee.workingTime.actualMonths}th</p>
                  {employee.workingTime.probationMonths > 0 && <p>Thử việc: +{employee.workingTime.probationMonths}th</p>}
                  {employee.workingTime.sickLeaveMonths > 0 && <p>Nghỉ ốm: +{Math.min(employee.workingTime.sickLeaveMonths, 2)}th (max 2)</p>}
                  {employee.workingTime.maternityMonths > 0 && <p>Thai sản: +{employee.workingTime.maternityMonths}th</p>}
                  {employee.workingTime.unpaidLeaveMonths > 0 && <p>Không lương: +{Math.min(employee.workingTime.unpaidLeaveMonths, 1)}th (max 1)</p>}
                  {employee.workingTime.accidentMonths > 0 && <p>Tai nạn LĐ: +{employee.workingTime.accidentMonths}th</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {!balance.eligible && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Chưa đủ 12 tháng — Không đủ điều kiện nghỉ phép năm
            </Badge>
          )}
        </div>

        {!balance.eligible && balance.eligibilityExplanation && (
          <div className="mt-3 p-3 bg-destructive/10 text-destructive text-xs rounded-lg whitespace-pre-line">
            ⚠️ Chi tiết tính thời gian hiệu lực:
            {'\n'}{balance.eligibilityExplanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
