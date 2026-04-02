import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { WorkHistory, getWorkHistorySummary } from '../data/workHistoryType';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  allRequests: LeaveRequest[];
  workHistories: WorkHistory[]; // ← NEW: danh sách work history của nhân viên
  onSubmit: (req: Omit<LeaveRequest, 'id'>) => void;
}

// Các loại nghỉ có thể hiển thị trong dropdown (ANNUAL bị ẩn nếu chưa đủ)
const ALL_LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SOCIAL', 'PERSONAL_PAID', 'UNPAID'];

// Sub-types chỉ áp dụng cho loại nhất định
const SUB_TYPE_MAP: Partial<Record<LeaveType, LeaveSubType[]>> = {
  SOCIAL: ['SICK', 'MATERNITY', 'WORK_ACCIDENT'],
  PERSONAL_PAID: ['WEDDING', 'FUNERAL', 'CHILD_WEDDING'],
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function CreateLeaveModal({
  open,
  onClose,
  employee,
  allRequests,
  workHistories,
  onSubmit,
}: Props) {
  const [type, setType] = useState<LeaveType>('ANNUAL');
  const [subType, setSubType] = useState<LeaveSubType | ''>('');
  const [days, setDays] = useState(1);
  const [isEmergency, setIsEmergency] = useState(false);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');

  // ── Derived state ──────────────────────────────────────────
  const balance = calculateLeaveBalance(employee, allRequests);
  const flow = APPROVAL_FLOW_MAP[type];
  const workSummary = getWorkHistorySummary(workHistories);
  const hasWorkHistory = workHistories.length > 0;
  const isEligibleForAnnual = workSummary.eligible; // >= 12 tháng hiệu lực

  const availableSubTypes = SUB_TYPE_MAP[type] ?? [];
  const showSubType = availableSubTypes.length > 0;

  // ── Auto-calculate paid vs unpaid split ───────────────────
  const computeSplit = (): { paidDays: number; unpaidDays: number; autoUnpaid: boolean } => {
    // Case 2: chưa đủ 12 tháng → toàn bộ không lương
    if (!isEligibleForAnnual && type === 'ANNUAL') {
      return { paidDays: 0, unpaidDays: days, autoUnpaid: true };
    }
    // Case 3: đủ điều kiện nhưng vượt balance
    if (type === 'ANNUAL' && isEligibleForAnnual) {
      const paid = Math.min(days, balance.remaining);
      const unpaid = Math.max(0, days - balance.remaining);
      return { paidDays: paid, unpaidDays: unpaid, autoUnpaid: unpaid > 0 };
    }
    return { paidDays: days, unpaidDays: 0, autoUnpaid: false };
  };

  const split = computeSplit();

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = () => {
    // CASE 1: Không có work history → block
    if (!hasWorkHistory) {
      toast.error('Nhân viên chưa có lịch sử làm việc. HR cần nhập trước.');
      return;
    }

    if (!startDate) {
      toast.error('Vui lòng chọn ngày bắt đầu');
      return;
    }
    if (days < 1) {
      toast.error('Số ngày nghỉ phải >= 1');
      return;
    }

    const now = new Date().toISOString();
    const initialStatus =
      flow === 'HR_ONLY' ? ('PENDING_HR' as const) : ('PENDING_MANAGER' as const);

    // Nếu type = ANNUAL nhưng chưa đủ điều kiện → auto chuyển thành UNPAID
    const finalType: LeaveType =
      type === 'ANNUAL' && !isEligibleForAnnual ? 'UNPAID' : type;

    onSubmit({
      employeeId: employee.id,
      type: finalType,
      subType: subType || undefined,
      days,
      status: initialStatus,
      approvalFlow: APPROVAL_FLOW_MAP[finalType],
      isEmergency,
      emergencyFlow: isEmergency
        ? { notifiedAt: now, documentsDeadline: '', isValid: true }
        : undefined,
      reason: reason || undefined,
      startDate,
      createdAt: new Date().toISOString().split('T')[0],
      flowNote: `${LEAVE_TYPE_LABELS[finalType]} → ${getApprovalFlowLabel(APPROVAL_FLOW_MAP[finalType])}`,
      // Lưu split info để HR/admin biết
      autoCalculated:
        split.autoUnpaid || split.unpaidDays > 0
          ? { paidDays: split.paidDays, unpaidDays: split.unpaidDays }
          : undefined,
      timeline: [
        {
          action: 'Tạo đơn',
          by: employee.name,
          at: new Date().toLocaleString('vi-VN'),
        },
        {
          action: flow === 'HR_ONLY' ? 'Gửi HR' : 'Gửi Quản lý',
          by: 'Hệ thống',
          at: new Date().toLocaleString('vi-VN'),
          note: `Auto-route: ${finalType} → ${APPROVAL_FLOW_MAP[finalType]}`,
        },
      ],
    });

    // Reset
    setType('ANNUAL');
    setSubType('');
    setDays(1);
    setIsEmergency(false);
    setReason('');
    setStartDate('');
    onClose();
  };

  // ── CASE 1: Block UI khi không có work history ─────────────
  if (!hasWorkHistory) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo đơn nghỉ phép</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center space-y-3">
            <p className="text-4xl">⛔</p>
            <p className="font-semibold text-destructive">
              Không thể tạo đơn nghỉ phép
            </p>
            <p className="text-sm text-muted-foreground">
              Nhân viên <strong>{employee.name}</strong> chưa có lịch sử làm việc.
              <br />
              HR vui lòng nhập lịch sử trong tab{' '}
              <strong>"Work History Management"</strong> trước.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── CASE 2 banner: chưa đủ 12 tháng ──────────────────────
  const showUnpaidBanner = !isEligibleForAnnual && type === 'ANNUAL';

  // ─────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nghỉ phép — {employee.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Work history status badge ─────────────────── */}
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
              isEligibleForAnnual
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {isEligibleForAnnual ? '✅' : '⚠️'}
            <span>
              {workSummary.eligibilityLabel} — Thâm niên:{' '}
              <strong>{workSummary.seniorityYears} năm</strong>
            </span>
          </div>

          {/* ── Leave type selector ───────────────────────── */}
          <div className="space-y-1">
            <Label>Loại nghỉ</Label>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as LeaveType);
                setSubType('');
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_LEAVE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {LEAVE_TYPE_LABELS[t]}
                    {t === 'ANNUAL' && !isEligibleForAnnual
                      ? ' → sẽ tính là không lương'
                      : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Approval flow indicator ───────────────────── */}
          <div className="p-2 bg-muted rounded-lg text-xs flex items-center gap-2">
            <span className="text-muted-foreground">Luồng duyệt:</span>
            <span className="font-medium">{getApprovalFlowLabel(flow)}</span>
          </div>

          {/* ── Sub-type ──────────────────────────────────── */}
          {showSubType && (
            <div className="space-y-1">
              <Label>Loại cụ thể</Label>
              <Select
                value={subType}
                onValueChange={(v) => setSubType(v as LeaveSubType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại cụ thể..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubTypes.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEAVE_SUBTYPE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Days ──────────────────────────────────────── */}
          <div className="space-y-1">
            <Label>Số ngày nghỉ</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </div>

          {/* ── Start date ────────────────────────────────── */}
          <div className="space-y-1">
            <Label>Ngày bắt đầu</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* ── Reason ────────────────────────────────────── */}
          <div className="space-y-1">
            <Label>Lý do (tuỳ chọn)</Label>
            <Textarea
              placeholder="Ghi chú thêm nếu cần..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          {/* ── Emergency ─────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="emergency"
              checked={isEmergency}
              onCheckedChange={(v) => setIsEmergency(!!v)}
            />
            <Label htmlFor="emergency" className="text-sm cursor-pointer">
              Nghỉ khẩn cấp (nghỉ trước, thông báo trong 2 giờ, bổ sung giấy tờ sau)
            </Label>
          </div>

          {/* ══════════════════════════════════════════════════
              CONTEXTUAL WARNINGS & AUTO-CALC DISPLAY
          ══════════════════════════════════════════════════ */}

          {/* CASE 2: chưa đủ 12 tháng → auto unpaid */}
          {showUnpaidBanner && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg space-y-1">
              <p className="font-semibold">
                ⚠️ Chưa đủ điều kiện nghỉ phép năm
              </p>
              <p>
                Nhân viên mới có <strong>{workSummary.totalEffectiveMonths} tháng</strong>{' '}
                hiệu lực (cần 12 tháng).
              </p>
              <p className="font-medium text-amber-900">
                → Đơn này sẽ tự động tính là{' '}
                <span className="underline">nghỉ không lương</span>.
              </p>
              <p className="text-xs text-amber-700">
                Người dùng không cần chọn — hệ thống tự quyết định.
              </p>
            </div>
          )}

          {/* CASE 3: đủ điều kiện, hiển thị balance + split */}
          {type === 'ANNUAL' && isEligibleForAnnual && (
            <div className="p-3 bg-violet-50 border border-violet-200 text-violet-800 text-sm rounded-lg space-y-2">
              <p className="font-semibold">
                📊 Phép năm còn lại:{' '}
                <strong>{balance.remaining}</strong> / {balance.totalEntitled} ngày
              </p>

              {/* Split display when exceeding balance */}
              {split.unpaidDays > 0 && (
                <div className="mt-2 pt-2 border-t border-violet-200 space-y-1">
                  <p className="font-semibold text-violet-900">
                    Phân bổ tự động ({days} ngày nghỉ):
                  </p>
                  <div className="flex gap-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      ✅ {split.paidDays} ngày có lương
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                      ⚠️ {split.unpaidDays} ngày không lương
                    </span>
                  </div>
                  <p className="text-xs text-violet-700">
                    Vượt quá số phép còn lại — phần dư tự động tính không lương.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* SOCIAL info */}
          {type === 'SOCIAL' && (
            <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-lg">
              ℹ️ Nghỉ chế độ BHXH không trừ phép năm. Yêu cầu nộp giấy tờ
              chứng minh.
              <br />
              Gửi trực tiếp cho HR duyệt.
            </div>
          )}

          {/* UNPAID info */}
          {type === 'UNPAID' && (
            <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
              ⚠️ Nghỉ không lương: Quản lý duyệt → HR duyệt. Ảnh hưởng trực
              tiếp đến lương.
            </div>
          )}

          {/* PERSONAL_PAID info */}
          {type === 'PERSONAL_PAID' && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
              ℹ️ Nghỉ việc riêng hưởng lương: Tang lễ (3 ngày), Kết hôn (3
              ngày), Con kết hôn (1 ngày).
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit}>Tạo đơn</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
