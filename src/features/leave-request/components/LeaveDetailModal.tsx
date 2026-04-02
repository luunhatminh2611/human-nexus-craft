import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowRight, AlertCircle, Clock } from 'lucide-react';
import {
  LeaveRequest,
  employees,
  LEAVE_TYPE_LABELS,
  LEAVE_SUBTYPE_LABELS,
  getLeaveTypeTags,
  getApprovalFlowLabel,
  JOB_TYPE_LABELS,
  calculateLeaveBalance,
} from '../data/leaveData';
import StatusBadge from './StatusBadge';

interface Props {
  request: LeaveRequest | null;
  allRequests: LeaveRequest[];
  open: boolean;
  onClose: () => void;
}

export default function LeaveDetailModal({ request, allRequests, open, onClose }: Props) {
  if (!request) return null;
  const emp = employees.find((e) => e.id === request.employeeId);
  const tags = getLeaveTypeTags(request.type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn nghỉ phép</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground">Nhân viên</span>
            <span className="font-medium">{emp?.name ?? 'N/A'}</span>

            <span className="text-muted-foreground">Loại công việc</span>
            <span>{emp ? JOB_TYPE_LABELS[emp.jobType] : 'N/A'}</span>

            <span className="text-muted-foreground">Loại nghỉ</span>
            <span>
              {LEAVE_TYPE_LABELS[request.type]}
              {request.subType && ` — ${LEAVE_SUBTYPE_LABELS[request.subType]}`}
            </span>

            <span className="text-muted-foreground">Số ngày</span>
            <span className="font-semibold">{request.days} ngày</span>

            <span className="text-muted-foreground">Luồng duyệt</span>
            <span>{getApprovalFlowLabel(request.approvalFlow)}</span>

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

          {/* Emergency flow details */}
          {request.isEmergency && request.emergencyFlow && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm space-y-1">
              <div className="font-medium text-red-700 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> Thông tin nghỉ khẩn cấp
              </div>
              {request.emergencyFlow.notifiedAt && (
                <p className="text-red-600">Thông báo lúc: {new Date(request.emergencyFlow.notifiedAt).toLocaleString('vi-VN')}</p>
              )}
              {request.emergencyFlow.documentsDeadline && (
                <p className="text-red-600">Deadline giấy tờ: {request.emergencyFlow.documentsDeadline}</p>
              )}
              <p className="text-red-600">
                Trạng thái: {request.emergencyFlow.isValid ? '✅ Hợp lệ' : '❌ Không hợp lệ'}
              </p>
            </div>
          )}

          {request.rejectionReason && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <span className="text-sm font-medium text-destructive">Lý do từ chối:</span>
              <p className="text-sm text-destructive mt-1">{request.rejectionReason}</p>
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

          {/* Leave balance for ANNUAL */}
          {emp && request.type === 'ANNUAL' && (() => {
            const bal = calculateLeaveBalance(emp, allRequests);
            return (
              <div className="p-3 border rounded-lg text-sm space-y-1">
                <div className="font-medium">Thông tin phép năm:</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{bal.baseDays}</div>
                    <div className="text-xs text-muted-foreground">Cơ sở</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-violet-600">+{bal.seniorityBonus}</div>
                    <div className="text-xs text-muted-foreground">Thâm niên</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">{bal.usedAnnual}</div>
                    <div className="text-xs text-muted-foreground">Đã dùng</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-emerald-600">{bal.remaining}</div>
                    <div className="text-xs text-muted-foreground">Còn lại</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Timeline */}
          {request.timeline && request.timeline.length > 0 && (
            <div className="p-3 border rounded-lg">
              <div className="text-sm font-medium mb-2 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Timeline
              </div>
              <div className="space-y-2">
                {request.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1 ${
                        i === request.timeline!.length - 1 ? 'bg-primary' : 'bg-muted-foreground/40'
                      }`} />
                      {i < request.timeline!.length - 1 && <div className="w-px h-4 bg-border" />}
                    </div>
                    <div>
                      <span className="font-medium">{t.action}</span>
                      <span className="text-muted-foreground"> — {t.by}</span>
                      <div className="text-muted-foreground">{t.at}</div>
                      {t.note && <div className="text-muted-foreground italic">{t.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
