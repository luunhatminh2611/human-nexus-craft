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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  WorkHistory,
  WorkHistoryType,
  WORK_HISTORY_TYPE_LABELS,
} from '../data/workHistoryType';

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: number;
  onSave: (entry: Omit<WorkHistory, 'id'>) => void;
}

const HISTORY_TYPES: WorkHistoryType[] = [
  'WORKING',
  'PROBATION',
  'MATERNITY',
  'SICK_LEAVE',
  'WORK_ACCIDENT',
  'UNPAID_LEAVE',
];

export default function AddHistoryModal({ open, onClose, employeeId, onSave }: Props) {
  const [companyName, setCompanyName] = useState('');
  const [isStateOwned, setIsStateOwned] = useState(false);
  const [type, setType] = useState<WorkHistoryType>('WORKING');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [effectiveMonths, setEffectiveMonths] = useState<number>(0);

  const reset = () => {
    setCompanyName('');
    setIsStateOwned(false);
    setType('WORKING');
    setFromDate('');
    setToDate('');
    setEffectiveMonths(0);
  };

  const handleSave = () => {
    if (!companyName.trim()) {
      toast.error('Vui lòng nhập tên công ty');
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc');
      return;
    }
    if (new Date(toDate) <= new Date(fromDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    if (isStateOwned && effectiveMonths <= 0) {
      toast.error('Vui lòng nhập số tháng hiệu lực được công nhận cho công ty nhà nước');
      return;
    }

    onSave({
      employeeId,
      companyName: companyName.trim(),
      isStateOwned,
      type,
      fromDate,
      toDate,
      effectiveMonths: isStateOwned ? effectiveMonths : undefined,
    });

    toast.success('Đã thêm lịch sử làm việc');
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>➕ Thêm lịch sử làm việc</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Company name */}
          <div className="space-y-1">
            <Label>Công ty</Label>
            <Input
              placeholder="VD: TKV Uông Bí, Vinacomin..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {/* State-owned checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="stateOwned"
              checked={isStateOwned}
              onCheckedChange={(v) => setIsStateOwned(!!v)}
            />
            <Label htmlFor="stateOwned" className="cursor-pointer">
              ☑ Công ty nhà nước
            </Label>
          </div>

          {/* Effective months — only for state-owned */}
          {isStateOwned && (
            <div className="space-y-1 pl-6 border-l-2 border-violet-200">
              <Label>Số tháng hiệu lực được công nhận</Label>
              <Input
                type="number"
                min={1}
                max={600}
                value={effectiveMonths || ''}
                onChange={(e) => setEffectiveMonths(Number(e.target.value))}
                placeholder="HR nhập tay — VD: 24"
              />
              <p className="text-xs text-muted-foreground">
                Tháng này sẽ được cộng trực tiếp vào tổng thời gian hiệu lực & thâm niên.
              </p>
            </div>
          )}

          {/* Type */}
          <div className="space-y-1">
            <Label>Loại</Label>
            <Select value={type} onValueChange={(v) => setType(v as WorkHistoryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HISTORY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {WORK_HISTORY_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Từ ngày</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Đến ngày</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {/* Info note */}
          {!isStateOwned && (
            <div className="p-2.5 bg-muted rounded-lg text-xs text-muted-foreground space-y-1">
              <p>📌 Quy tắc tính tháng hiệu lực:</p>
              <ul className="pl-3 space-y-0.5">
                <li>• Làm việc / Tập sự / Thai sản → 100%</li>
                <li>• Nghỉ ốm → tối đa 2 tháng</li>
                <li>• Tai nạn lao động → tối đa 6 tháng</li>
                <li>• Nghỉ không lương → tối đa 1 tháng</li>
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
