import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Employee, LeaveRequest, LeaveType, LeaveSubType, LEAVE_TYPE_LABELS, LEAVE_SUBTYPE_LABELS } from '../data/leaveData';

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  onSubmit: (req: Omit<LeaveRequest, 'id' | 'status'>) => void;
}

export default function CreateLeaveModal({ open, onClose, employee, onSubmit }: Props) {
  const [type, setType] = useState<LeaveType>('ANNUAL');
  const [subType, setSubType] = useState<LeaveSubType | ''>('');
  const [days, setDays] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');

  const handleSubmit = () => {
    if (type === 'ANNUAL' && employee.workingMonths < 12) {
      toast.error('Nhân viên chưa đủ 12 tháng để nghỉ phép năm');
      return;
    }
    if (type === 'ANNUAL' && days > employee.leaveBalance.remaining) {
      toast.error(`Số ngày phép còn lại: ${employee.leaveBalance.remaining}`);
      return;
    }
    if (!startDate) {
      toast.error('Vui lòng chọn ngày bắt đầu');
      return;
    }

    onSubmit({
      employeeId: employee.id,
      type,
      subType: subType || undefined,
      days,
      isEmergency,
      reason: reason || undefined,
      startDate,
      createdAt: new Date().toISOString().split('T')[0],
      flowNote: isEmergency ? 'Emergency leave — notify within 2h' : undefined,
    });

    // reset
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
            <Checkbox
              id="emergency"
              checked={isEmergency}
              onCheckedChange={(v) => setIsEmergency(!!v)}
            />
            <Label htmlFor="emergency" className="text-sm cursor-pointer">
              Nghỉ khẩn cấp (thông báo trong vòng 2 giờ)
            </Label>
          </div>

          {type === 'ANNUAL' && employee.workingMonths < 12 && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              ⚠️ Nhân viên chưa đủ 12 tháng làm việc — Không đủ điều kiện nghỉ phép năm
            </div>
          )}

          {type === 'SOCIAL' && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
              ℹ️ Nghỉ chế độ BHXH không trừ phép năm. Yêu cầu nộp giấy tờ chứng minh.
            </div>
          )}

          {type === 'UNPAID' && (
            <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
              ⚠️ Nghỉ không lương sẽ ảnh hưởng đến tiền lương tháng.
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
