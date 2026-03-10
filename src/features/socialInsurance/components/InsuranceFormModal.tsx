// components/SocialInsuranceFormModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { AlertCircle, Upload, X, Paperclip } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Search, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { employeeSocialInsuranceApi } from '../api/socialInsurance';
import { employeeApi } from '@/features/employees/api/employeeApi';

interface SocialInsuranceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: any | null;   // null = tạo mới, object = chỉnh sửa
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE',    label: 'Đang tham gia' },
  { value: 'INACTIVE',  label: 'Ngừng tham gia' },
  { value: 'SUSPENDED', label: 'Tạm dừng' },
];

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({ employeeId, employeeName, allEmployees, onSelect }: {
  employeeId: string;
  employeeName: string;
  allEmployees: any[];
  onSelect: (emp: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allEmployees.filter(e =>
        e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(search.toLowerCase()))
    : allEmployees.slice(0, 20);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-1.5 h-9 px-3 text-sm border rounded w-full hover:bg-gray-50 transition-colors text-left
            ${!employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}`}
        >
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1">{employeeName || 'Chọn nhân viên...'}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              autoFocus value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..."
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(emp => (
            <button
              key={emp.id} type="button"
              onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors
                ${employeeId === emp.id.toString() ? 'bg-green-50' : ''}`}
            >
              <div className="text-sm font-medium">{emp.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
              </div>
            </button>
          )) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">
              Không tìm thấy nhân viên
            </div>
          )}
        </div>
        {employeeId && (
          <div className="p-2 border-t">
            <button
              type="button"
              onClick={() => { onSelect({ id: 0, fullName: '' }); setOpen(false); }}
              className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1"
            >
              Bỏ chọn
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function SocialInsuranceFormModal({
  isOpen, onClose, record, onSuccess,
}: SocialInsuranceFormModalProps) {
  const isEdit = !!record;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    insuranceBookNumber: '',
    insuranceCode: '',
    startDate: '',
    status: '',
    salaryBase: '',
    note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load nhân viên & fill form
  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);

    if (record) {
      setFormData({
        employeeId: record.employeeId?.toString() || '',
        employeeName: '',
        insuranceBookNumber: record.insuranceBookNumber || '',
        insuranceCode: record.insuranceCode || '',
        startDate: record.startDate || '',
        status: record.status || '',
        salaryBase: record.salaryBase?.toString() || '',
        note: record.note || '',
      });
    } else {
      setFormData({
        employeeId: '', employeeName: '',
        insuranceBookNumber: '', insuranceCode: '',
        startDate: '', status: '',
        salaryBase: '', note: '',
      });
    }
    setFile(null);
    setErrors({});
  }, [isOpen, record]);

  // Resolve tên nhân viên khi edit
  useEffect(() => {
    if (record?.employeeId && allEmployees.length > 0) {
      const emp = allEmployees.find(e => e.id === record.employeeId);
      if (emp) setFormData(prev => ({ ...prev, employeeName: emp.fullName }));
    }
  }, [allEmployees, record]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.employeeId) errs.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.insuranceBookNumber.trim()) errs.insuranceBookNumber = 'Vui lòng nhập số sổ BHXH';
    if (!formData.insuranceCode.trim()) errs.insuranceCode = 'Vui lòng nhập mã số BHXH';
    if (!formData.startDate) errs.startDate = 'Vui lòng chọn ngày tham gia';
    if (!formData.status) errs.status = 'Vui lòng chọn trạng thái';
    if (!formData.salaryBase || Number(formData.salaryBase) <= 0)
      errs.salaryBase = 'Vui lòng nhập mức lương đóng hợp lệ';
    if (!isEdit && !file) errs.file = 'Vui lòng tải lên tài liệu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        insuranceBookNumber: formData.insuranceBookNumber,
        insuranceCode: formData.insuranceCode,
        startDate: formData.startDate,
        status: formData.status,
        salaryBase: Number(formData.salaryBase),
        note: formData.note || null,
      };
      if (isEdit) {
        await employeeSocialInsuranceApi.update(record.id, payload, file || undefined);
        toast.success('Đã cập nhật thông tin BHXH');
      } else {
        await employeeSocialInsuranceApi.create(payload, file!);
        toast.success('Đã thêm thông tin BHXH');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu thông tin BHXH');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa thông tin BHXH' : 'Thêm thông tin BHXH'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-blue-800">
            Thông tin bảo hiểm xã hội sẽ được lưu vào hồ sơ nhân viên và nhân viên có thể xem được.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Nhân viên */}
          <div className="space-y-1.5">
            <Label>Nhân viên <span className="text-red-500">*</span></Label>
            {isEdit ? (
              <div className="border rounded p-3 bg-muted/30 text-sm">
                <p className="font-medium">{formData.employeeName || `ID: ${formData.employeeId}`}</p>
              </div>
            ) : (
              <EmployeePopover
                employeeId={formData.employeeId}
                employeeName={formData.employeeName}
                allEmployees={allEmployees}
                onSelect={emp => {
                  setFormData(prev => ({
                    ...prev,
                    employeeId: emp.id ? emp.id.toString() : '',
                    employeeName: emp.fullName || '',
                  }));
                  if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: '' }));
                }}
              />
            )}
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          {/* Số sổ & Mã số BHXH */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Số sổ BHXH <span className="text-red-500">*</span></Label>
              <Input
                value={formData.insuranceBookNumber}
                onChange={e => handleChange('insuranceBookNumber', e.target.value)}
                placeholder="VD: 01234567890"
                className={errors.insuranceBookNumber ? 'border-red-500' : ''}
              />
              {errors.insuranceBookNumber && <p className="text-sm text-red-500">{errors.insuranceBookNumber}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Mã số BHXH <span className="text-red-500">*</span></Label>
              <Input
                value={formData.insuranceCode}
                onChange={e => handleChange('insuranceCode', e.target.value)}
                placeholder="VD: 0100100001"
                className={errors.insuranceCode ? 'border-red-500' : ''}
              />
              {errors.insuranceCode && <p className="text-sm text-red-500">{errors.insuranceCode}</p>}
            </div>
          </div>

          {/* Ngày tham gia & Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ngày tham gia <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Trạng thái <span className="text-red-500">*</span></Label>
              <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
            </div>
          </div>

          {/* Mức lương đóng BHXH */}
          <div className="space-y-1.5">
            <Label>Mức lương đóng BHXH (VNĐ) <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              value={formData.salaryBase}
              onChange={e => handleChange('salaryBase', e.target.value)}
              placeholder="VD: 6000000"
              className={errors.salaryBase ? 'border-red-500' : ''}
            />
            {errors.salaryBase && <p className="text-sm text-red-500">{errors.salaryBase}</p>}
          </div>

          {/* File đính kèm */}
          <div className="space-y-1.5">
            <Label>Tài liệu đính kèm {!isEdit && <span className="text-red-500">*</span>}</Label>
            {isEdit && record?.fileName && !file && (
              <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900">
                <span className="font-medium">File hiện tại:</span> {record.fileName}
                <p className="text-xs text-green-600 mt-1">Tải lên file mới để thay thế (không bắt buộc)</p>
              </div>
            )}
            {file ? (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <Paperclip className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="flex-1 truncate text-blue-800">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-muted-foreground hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-5 cursor-pointer hover:border-primary transition-colors ${errors.file ? 'border-red-400' : 'border-gray-300'}`}>
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Nhấn để chọn file</span>
                <input
                  type="file" className="hidden"
                  onChange={e => {
                    setFile(e.target.files?.[0] ?? null);
                    if (errors.file) setErrors(p => ({ ...p, file: '' }));
                  }}
                />
              </label>
            )}
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea
              value={formData.note}
              onChange={e => handleChange('note', e.target.value)}
              placeholder="Thông tin bổ sung..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}