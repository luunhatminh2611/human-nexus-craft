import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import {
  LeaveRequest,
  getEmployeeName,
  employees,
  LEAVE_TYPE_LABELS,
  LEAVE_SUBTYPE_LABELS,
  getLeaveTypeTags,
} from '../data/leaveData';
import StatusBadge from './StatusBadge';

interface Props {
  request: LeaveRequest | null;
  open: boolean;
  onClose: () => void;
}

export default function LeaveDetailModal({ request, open, onClose }: Props) {
  if (!request) return null;
  const emp = employees.find((e) => e.id === request.employeeId);
  const tags = getLeaveTypeTags(request.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Nhân viên</span>
            <span className="font-medium">{getEmployeeName(request.employeeId)}</span>

            <span className="text-muted-foreground">Loại công việc</span>
            <span>{emp?.jobType}</span>

            <span className="text-muted-foreground">Loại nghỉ</span>
            <span>
              {LEAVE_TYPE_LABELS[request.type]}
              {request.subType && ` — ${LEAVE_SUBTYPE_LABELS[request.subType]}`}
            </span>

            <span className="text-muted-foreground">Số ngày</span>
            <span className="font-semibold">{request.days} ngày</span>

            {request.startDate && (
              <>
                <span className="text-muted-foreground">Ngày bắt đầu</span>
                <span>{new Date(request.startDate).toLocaleDateString('vi-VN')}</span>
              </>
            )}

            <span className="text-muted-foreground">Trạng thái</span>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {tags.map((t, i) => (
              <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${t.color}`}>{t.label}</span>
            ))}
            {request.isEmergency && (
              <Badge variant="destructive" className="text-xs">Khẩn cấp</Badge>
            )}
          </div>

          {request.reason && (
            <div>
              <span className="text-sm text-muted-foreground">Lý do từ chối:</span>
              <p className="text-sm text-destructive mt-1">{request.reason}</p>
            </div>
          )}

          {request.flowNote && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm italic">
              📝 {request.flowNote}
            </div>
          )}

          {request.documents && request.documents.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Tệp đính kèm:</span>
              <div className="mt-1 space-y-1">
                {request.documents.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 border rounded">
                    <FileText className="h-4 w-4 text-primary" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {emp && request.type === 'ANNUAL' && (
            <div className="p-3 border rounded-lg text-sm space-y-1">
              <div className="font-medium">Thông tin phép năm:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{emp.leaveBalance.annual}</div>
                  <div className="text-xs text-muted-foreground">Tổng phép</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{emp.leaveBalance.used}</div>
                  <div className="text-xs text-muted-foreground">Đã dùng</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-emerald-600">{emp.leaveBalance.remaining}</div>
                  <div className="text-xs text-muted-foreground">Còn lại</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
