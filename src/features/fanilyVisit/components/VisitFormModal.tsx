import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { employeeVisitApi, EmployeeVisit, EmployeeVisitPayload } from '../api/familyVisitApi';
import { employeeApi } from '@/features/employees/api/employeeApi';

interface EmployeeOption {
  id: number;
  fullName: string;
  employeeCode: string;
  departmentName?: string;
}

const VISIT_TYPES = ['Thăm ốm', 'Thăm hiếu', 'Thăm hỷ', 'Thăm sinh nhật', 'Thăm khác'];
const RELATIONSHIPS = ['Bố', 'Mẹ', 'Vợ', 'Chồng', 'Con', 'Anh', 'Chị', 'Em', 'Ông', 'Bà', 'Khác'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  visit?: EmployeeVisit | null;
  employeeId?: number;
  onSuccess: () => void;
}

export default function FamilyVisitFormModal({ isOpen, onClose, visit, employeeId, onSuccess }: Props) {
  const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    employeeId: '',
    visitType: '',
    visitDate: '',
    visitedPerson: '',
    relationship: '',
    reason: '',
    giftAmount: '',
    giftDescription: '',
    representative: '',
    note: '',
    status: 'Chưa thăm',
  });

  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(data => setAllEmployees(data || [])).catch(console.error);

    if (visit) {
      setFormData({
        employeeId: visit.employeeId.toString(),
        visitType: visit.visitType,
        visitDate: visit.visitDate,
        visitedPerson: visit.visitedPerson,
        relationship: visit.relationship,
        reason: visit.reason,
        giftAmount: visit.giftAmount.toString(),
        giftDescription: visit.giftDescription || '',
        representative: visit.representative || '',
        note: visit.note || '',
        status: visit.status,
      });
    } else {
      setFormData({
        employeeId: employeeId?.toString() || '',
        visitType: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitedPerson: '',
        relationship: '',
        reason: '',
        giftAmount: '',
        giftDescription: '',
        representative: '',
        note: '',
        status: 'Chưa thăm',
      });
    }
    setErrors({});
  }, [isOpen, visit, employeeId]);

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.employeeId) e.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.visitType) e.visitType = 'Vui lòng chọn loại thăm';
    if (!formData.visitDate) e.visitDate = 'Vui lòng chọn ngày thăm';
    if (!formData.visitedPerson.trim()) e.visitedPerson = 'Vui lòng nhập người được thăm';
    if (!formData.relationship) e.relationship = 'Vui lòng chọn quan hệ';
    if (!formData.reason.trim()) e.reason = 'Vui lòng nhập lý do';
    if (!formData.giftAmount || Number(formData.giftAmount) < 0) e.giftAmount = 'Vui lòng nhập số tiền hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: EmployeeVisitPayload = {
        employeeId: Number(formData.employeeId),
        visitType: formData.visitType,
        visitDate: formData.visitDate,
        visitedPerson: formData.visitedPerson,
        relationship: formData.relationship,
        reason: formData.reason,
        giftAmount: Number(formData.giftAmount),
        giftDescription: formData.giftDescription,
        representative: formData.representative,
        note: formData.note,
        status: formData.status,
      };

      if (visit) {
        await employeeVisitApi.update(visit.id, payload);
        toast.success('Đã cập nhật thông tin thăm người thân');
      } else {
        await employeeVisitApi.create(payload);
        toast.success('Đã thêm mới lượt thăm người thân');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (visit ? 'Không thể cập nhật' : 'Không thể thêm mới'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (label: string, key: string, required = false) => (
    <div className="space-y-1">
      <Label className="text-xs">{label} {required && <span className="text-red-500">*</span>}</Label>
      <Input
        value={(formData as any)[key]}
        onChange={e => set(key, e.target.value)}
        className={`h-8 text-sm ${errors[key] ? 'border-red-500' : ''}`}
      />
      {errors[key] && <p className="text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{visit ? 'Chỉnh sửa thăm người thân' : 'Thêm lượt thăm người thân'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nhân viên */}
          <div className="space-y-1">
            <Label className="text-xs">Nhân viên <span className="text-red-500">*</span></Label>
            <Select value={formData.employeeId} onValueChange={v => set('employeeId', v)} disabled={!!employeeId || !!visit}>
              <SelectTrigger className={`text-sm ${errors.employeeId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Chọn nhân viên" />
              </SelectTrigger>
              <SelectContent>
                {allEmployees.map(e => (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {e.fullName} ({e.employeeCode}){e.departmentName ? ` · ${e.departmentName}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Loại thăm */}
            <div className="space-y-1">
              <Label className="text-xs">Loại thăm <span className="text-red-500">*</span></Label>
              <Select value={formData.visitType} onValueChange={v => set('visitType', v)}>
                <SelectTrigger className={`text-sm ${errors.visitType ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {VISIT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.visitType && <p className="text-xs text-red-500">{errors.visitType}</p>}
            </div>

            {/* Ngày thăm */}
            <div className="space-y-1">
              <Label className="text-xs">Ngày thăm <span className="text-red-500">*</span></Label>
              <Input type="date" value={formData.visitDate} onChange={e => set('visitDate', e.target.value)}
                className={`h-8 text-sm ${errors.visitDate ? 'border-red-500' : ''}`} />
              {errors.visitDate && <p className="text-xs text-red-500">{errors.visitDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Người được thăm */}
            <div className="space-y-1">
              <Label className="text-xs">Người được thăm <span className="text-red-500">*</span></Label>
              <Input value={formData.visitedPerson} onChange={e => set('visitedPerson', e.target.value)}
                placeholder="VD: Mẹ, Bố, Con..." className={`h-8 text-sm ${errors.visitedPerson ? 'border-red-500' : ''}`} />
              {errors.visitedPerson && <p className="text-xs text-red-500">{errors.visitedPerson}</p>}
            </div>

            {/* Quan hệ */}
            <div className="space-y-1">
              <Label className="text-xs">Quan hệ <span className="text-red-500">*</span></Label>
              <Select value={formData.relationship} onValueChange={v => set('relationship', v)}>
                <SelectTrigger className={`text-sm ${errors.relationship ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Chọn quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.relationship && <p className="text-xs text-red-500">{errors.relationship}</p>}
            </div>
          </div>

          {/* Lý do */}
          <div className="space-y-1">
            <Label className="text-xs">Lý do <span className="text-red-500">*</span></Label>
            <Textarea value={formData.reason} onChange={e => set('reason', e.target.value)}
              placeholder="Mô tả lý do thăm hỏi..." rows={2}
              className={`text-sm ${errors.reason ? 'border-red-500' : ''}`} />
            {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Số tiền */}
            <div className="space-y-1">
              <Label className="text-xs">Số tiền quà tặng (VNĐ) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.giftAmount} onChange={e => set('giftAmount', e.target.value)}
                placeholder="0" className={`h-8 text-sm ${errors.giftAmount ? 'border-red-500' : ''}`} />
              {errors.giftAmount && <p className="text-xs text-red-500">{errors.giftAmount}</p>}
            </div>

            {/* Mô tả quà */}
            <div className="space-y-1">
              <Label className="text-xs">Mô tả quà tặng</Label>
              <Input value={formData.giftDescription} onChange={e => set('giftDescription', e.target.value)}
                placeholder="VD: Tiền mặt, vòng hoa..." className="h-8 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Người đại diện */}
            <div className="space-y-1">
              <Label className="text-xs">Người đại diện thăm</Label>
              <Input value={formData.representative} onChange={e => set('representative', e.target.value)}
                placeholder="VD: Giám đốc, Trưởng phòng..." className="h-8 text-sm" />
            </div>

            {/* Trạng thái */}
            <div className="space-y-1">
              <Label className="text-xs">Trạng thái</Label>
              <Select value={formData.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chưa thăm">Chưa thăm</SelectItem>
                  <SelectItem value="Đã thăm">Đã thăm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1">
            <Label className="text-xs">Ghi chú</Label>
            <Textarea value={formData.note} onChange={e => set('note', e.target.value)}
              placeholder="Ghi chú bổ sung..." rows={2} className="text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}