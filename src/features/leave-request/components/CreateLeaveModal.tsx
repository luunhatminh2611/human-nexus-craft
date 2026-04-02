import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Employee,
  LeaveRequest,
  LeaveType,
  LeaveSubType,
  LEAVE_TYPE_LABELS,
  LEAVE_SUBTYPE_LABELS,
  APPROVAL_FLOW_MAP,
  calculateLeaveBalance,
  getApprovalFlowLabel,
} from '../data/leaveData';

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  allRequests: LeaveRequest[];
  onSubmit: (req: Omit<LeaveRequest, 'id'>) => void;
}

export default function CreateLeaveModal({ open, onClose, employee, allRequests, onSubmit }: Props) {
  const [type, setType] = useState<LeaveType>('ANNUAL');
  const [subType, setSubType] = useState<LeaveSubType | ''>('');
  const [days, setDays] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');

  const balance = calculateLeaveBalance(employee, allRequests);
  const flow = APPROVAL_FLOW_MAP[type];

  const handleSubmit = () => {
    if (type === 'ANNUAL' && !balance.eligible) {
      toast.error('Nhân viên chưa đủ 12 tháng hiệu lực để nghỉ phép năm');
      return;
    }
    if (type === 'ANNUAL' && days > balance.remaining) {
      toast.error(`Số ngày phép còn lại: ${balance.remaining}. Bạn yêu cầu ${days} ngày.`);
      return;
    }
    if (!startDate) {
      toast.error('Vui lòng chọn ngày bắt đầu');
      return;
    }

    const now = new Date().toISOString();
    const initialStatus = flow === 'HR_ONLY' ? 'PENDING_HR' as const : 'PENDING_MANAGER' as const;

    onSubmit({
      employeeId: employee.id,
      type,
      subType: subType || undefined,
      days,
      status: initialStatus,
      approvalFlow: flow,
      isEmergency,
      emergencyFlow: isEmergency
        ? { notifiedAt: now, documentsDeadline: '', isValid: true }
        : undefined,
      reason: reason || undefined,
      startDate,
      createdAt: new Date().toISOString().split('T')[0],
      flowNote: `${LEAVE_TYPE_LABELS[type]} → ${getApprovalFlowLabel(flow)}`,
      timeline: [
        { action: 'Tạo đơn', by: employee.name, at: new Date().toLocaleString('vi-VN') },
        {
          action: flow === 'HR_ONLY' ? 'Gửi HR' : 'Gửi Quản lý',
          by: 'Hệ thống',
          at: new Date().toLocaleString('vi-VN'),
          note: `Auto-route: ${type} → ${flow}`,
        },
      ],
    });

    setType('ANNUAL');
    setSubType('');
    setDays(1);
    setIsEmergency(false);
    setReason('');
    setStartDate('');
    onClose();
  };

  const showSubType = type === 'SOCIAL' || type === 'PERSONAL_PAID';
  const subTypes: LeaveSubType[] =
    type === 'SOCIAL' ? ['SICK', 'MATERNITY'] : ['FUNERAL', 'WEDDING', 'CHILD_WEDDING'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tạo đơn xin nghỉ phép</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Loại nghỉ phép *</Label>
            <Select value={type} onValueChange={(v) => { setType(v as LeaveType); setSubType(''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(LEAVE_TYPE_LABELS) as LeaveType[]).map((t) => (
                  <SelectItem key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approval flow indicator */}
          <div className="p-2 bg-muted rounded-lg text-xs flex items-center gap-2">
            <span className="text-muted-foreground">Luồng duyệt:</span>
            <span className="font-medium">{getApprovalFlowLabel(flow)}</span>
          </div>

          {showSubType && (
            <div>
              <Label>Loại cụ thể</Label>
              <Select value={subType} onValueChange={(v) => setSubType(v as LeaveSubType)}>
                <SelectTrigger><SelectValue placeholder="Chọn..." /></SelectTrigger>
                <SelectContent>
                  {subTypes.map((s) => (
                    <SelectItem key={s} value={s}>{LEAVE_SUBTYPE_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày bắt đầu *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <Label>Số ngày *</Label>
              <Input type="number" min={1} value={days} onChange={(e) => setDays(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <Label>Lý do</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Nhập lý do..." />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="emergency" checked={isEmergency} onCheckedChange={(v) => setIsEmergency(!!v)} />
            <Label htmlFor="emergency" className="text-sm cursor-pointer">
              Nghỉ khẩn cấp (nghỉ trước, thông báo trong 2 giờ, bổ sung giấy tờ sau)
            </Label>
          </div>

          {/* Contextual warnings */}
          {type === 'ANNUAL' && !balance.eligible && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg whitespace-pre-line">
              ⚠️ Nhân viên chưa đủ điều kiện nghỉ phép năm
              {balance.eligibilityExplanation && '\n' + balance.eligibilityExplanation}
            </div>
          )}

          {type === 'ANNUAL' && balance.eligible && (
            <div className="p-3 bg-violet-50 text-violet-700 text-sm rounded-lg">
              📊 Phép năm còn lại: <strong>{balance.remaining}</strong> / {balance.totalEntitled} ngày
              {days > balance.remaining && (
                <span className="text-destructive block mt-1">⚠️ Vượt quá số phép còn lại!</span>
              )}
            </div>
          )}

          {type === 'SOCIAL' && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
              ℹ️ Nghỉ chế độ BHXH không trừ phép năm. Yêu cầu nộp giấy tờ chứng minh.
              <br />Gửi trực tiếp cho HR duyệt.
            </div>
          )}

          {type === 'UNPAID' && (
            <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
              ⚠️ Nghỉ không lương: Quản lý duyệt → HR duyệt. Ảnh hưởng trực tiếp đến lương.
            </div>
          )}

          {type === 'PERSONAL_PAID' && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
              ℹ️ Nghỉ việc riêng hưởng lương: Tang lễ (3 ngày), Kết hôn (3 ngày), Con kết hôn (1 ngày).
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit}>Gửi đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
