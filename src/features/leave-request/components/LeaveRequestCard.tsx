import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, FileText } from 'lucide-react';
import {
  LeaveRequest,
  Role,
  getEmployeeName,
  LEAVE_TYPE_LABELS,
  LEAVE_SUBTYPE_LABELS,
  getLeaveTypeTags,
} from '../data/leaveData';
import StatusBadge from './StatusBadge';

interface Props {
  request: LeaveRequest;
  role: Role;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onViewDetail: (req: LeaveRequest) => void;
}

export default function LeaveRequestCard({ request, role, onApprove, onReject, onViewDetail }: Props) {
  const tags = getLeaveTypeTags(request.type);
  const canApprove =
    (role === 'MANAGER' && request.status === 'PENDING') ||
    (role === 'HR' && request.status === 'WAITING_HR');

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail(request)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{getEmployeeName(request.employeeId)}</span>
              <StatusBadge status={request.status} />
              {request.isEmergency && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <AlertCircle className="h-3 w-3" />
                  Khẩn cấp
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {LEAVE_TYPE_LABELS[request.type]}
                {request.subType && ` — ${LEAVE_SUBTYPE_LABELS[request.subType]}`}
              </span>
              <span className="font-medium">{request.days} ngày</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {tags.map((t, i) => (
                <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>
                  {t.label}
                </span>
              ))}
              {request.documents && request.documents.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {request.documents.length} tệp đính kèm
                </span>
              )}
            </div>

            {request.reason && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {request.reason}
              </p>
            )}

            {request.flowNote && (
              <p className="text-xs text-muted-foreground italic">📝 {request.flowNote}</p>
            )}
          </div>

          {canApprove && (
            <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="text-emerald-600 hover:bg-emerald-50" onClick={() => onApprove(request.id)}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => onReject(request.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
