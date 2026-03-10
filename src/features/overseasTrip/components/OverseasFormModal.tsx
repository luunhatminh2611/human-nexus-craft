// components/OverseasFormModal.tsx

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
import { AlertCircle, Upload, X, FileText, Paperclip } from 'lucide-react';
import { employeeTravelApi } from '../api/overSeas';
import { employeeApi } from '@/features/employees/api/employeeApi';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/shared/components/ui/popover';
import { Search, User, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface OverseasFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any | null;
  onSuccess: () => void;
}

const FUNDING_SOURCES = [
  { value: 'COMPANY', label: 'Công ty' },
  { value: 'PERSONAL', label: 'Cá nhân' },
  { value: 'PARTNER', label: 'Đối tác' },
];

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
        <button type="button" className={`flex items-center gap-1.5 h-9 px-3 text-sm border rounded w-full hover:bg-gray-50 transition-colors text-left ${!employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}`}>
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate flex-1">{employeeName || 'Chọn nhân viên...'}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..." className="pl-7 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(emp => (
            <button key={emp.id} type="button"
              onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${employeeId === emp.id.toString() ? 'bg-green-50' : ''}`}>
              <div className="text-sm font-medium">{emp.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
              </div>
            </button>
          )) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">Không tìm thấy nhân viên</div>
          )}
        </div>
        {employeeId && (
          <div className="p-2 border-t">
            <button type="button" onClick={() => { onSelect({ id: 0, fullName: '' }); setOpen(false); }}
              className="w-full text-xs text-red-500 hover:text-red-700 text-center py-1">Bỏ chọn</button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default function OverseasFormModal({ isOpen, onClose, trip, onSuccess }: OverseasFormModalProps) {
  const isEdit = !!trip;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    country: '',
    fundingSource: '',
    travelPurpose: '',
    departureDate: '',
    returnDate: '',
    estimatedCost: '',
    actualCost: '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);

    if (trip) {
      setFormData({
        employeeId: trip.employeeId?.toString() || '',
        employeeName: '', // sẽ resolve sau nếu cần
        country: trip.country || '',
        fundingSource: trip.fundingSource || '',
        travelPurpose: trip.travelPurpose || '',
        departureDate: trip.departureDate || '',
        returnDate: trip.returnDate || '',
        estimatedCost: trip.estimatedCost?.toString() || '',
        actualCost: trip.actualCost?.toString() || '',
        note: trip.note || '',
      });
    } else {
      setFormData({
        employeeId: '', employeeName: '',
        country: '', fundingSource: '',
        travelPurpose: '', departureDate: '',
        returnDate: '', estimatedCost: '',
        actualCost: '', note: '',
      });
    }
    setFile(null);
    setErrors({});
  }, [isOpen, trip]);

  // Resolve tên nhân viên khi edit
  useEffect(() => {
    if (trip?.employeeId && allEmployees.length > 0) {
      const emp = allEmployees.find(e => e.id === trip.employeeId);
      if (emp) setFormData(prev => ({ ...prev, employeeName: emp.fullName }));
    }
  }, [allEmployees, trip]);

  const duration = (() => {
    if (formData.departureDate && formData.returnDate) {
      const d = Math.floor((new Date(formData.returnDate).getTime() - new Date(formData.departureDate).getTime()) / 86400000);
      return d > 0 ? d : 0;
    }
    return 0;
  })();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.employeeId) errs.employeeId = 'Vui lòng chọn nhân viên';
    if (!formData.country.trim()) errs.country = 'Vui lòng nhập quốc gia';
    if (!formData.travelPurpose.trim()) errs.travelPurpose = 'Vui lòng nhập mục đích';
    if (!formData.fundingSource) errs.fundingSource = 'Vui lòng chọn nguồn tài trợ';
    if (!formData.departureDate) errs.departureDate = 'Vui lòng chọn ngày xuất cảnh';
    if (!formData.returnDate) errs.returnDate = 'Vui lòng chọn ngày về';
    if (formData.departureDate && formData.returnDate &&
      new Date(formData.returnDate) <= new Date(formData.departureDate))
      errs.returnDate = 'Ngày về phải sau ngày xuất cảnh';
    if (!formData.estimatedCost || Number(formData.estimatedCost) <= 0)
      errs.estimatedCost = 'Vui lòng nhập chi phí dự toán hợp lệ';
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
        country: formData.country,
        fundingSource: formData.fundingSource,
        travelPurpose: formData.travelPurpose,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        estimatedCost: Number(formData.estimatedCost),
        actualCost: formData.actualCost ? Number(formData.actualCost) : null,
        note: formData.note || null,
      };
      if (isEdit) {
        await employeeTravelApi.update(trip.id, payload, file || undefined);
      } else {
        await employeeTravelApi.create(payload, file!);
      }
      toast.success(isEdit ? 'Đã cập nhật xuất cảnh' : 'Đã thêm xuất cảnh');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa lịch sử xuất cảnh' : 'Thêm lịch sử xuất cảnh'}</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-blue-800">Lịch sử xuất cảnh sẽ được lưu trữ vào hồ sơ của nhân viên và nhân viên có thể xem được thông tin này.</p>
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

          <div className="grid grid-cols-2 gap-4">
            {/* Quốc gia */}
            <div className="space-y-1.5">
              <Label>Quốc gia <span className="text-red-500">*</span></Label>
              <Input value={formData.country} onChange={e => handleChange('country', e.target.value)}
                placeholder="Singapore, Nhật Bản..." className={errors.country ? 'border-red-500' : ''} />
              {errors.country && <p className="text-sm text-red-500">{errors.country}</p>}
            </div>
            {/* Nguồn tài trợ */}
            <div className="space-y-1.5">
              <Label>Nguồn tài trợ <span className="text-red-500">*</span></Label>
              <Select value={formData.fundingSource} onValueChange={v => handleChange('fundingSource', v)}>
                <SelectTrigger className={errors.fundingSource ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn nguồn" />
                </SelectTrigger>
                <SelectContent>
                  {FUNDING_SOURCES.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.fundingSource && <p className="text-sm text-red-500">{errors.fundingSource}</p>}
            </div>
          </div>

          {/* Mục đích */}
          <div className="space-y-1.5">
            <Label>Mục đích chuyến đi <span className="text-red-500">*</span></Label>
            <Textarea value={formData.travelPurpose} onChange={e => handleChange('travelPurpose', e.target.value)}
              placeholder="Mô tả mục đích chuyến đi..." rows={3}
              className={errors.travelPurpose ? 'border-red-500' : ''} />
            {errors.travelPurpose && <p className="text-sm text-red-500">{errors.travelPurpose}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Ngày xuất cảnh */}
            <div className="space-y-1.5">
              <Label>Ngày xuất cảnh <span className="text-red-500">*</span></Label>
              <Input type="date" value={formData.departureDate} onChange={e => handleChange('departureDate', e.target.value)}
                className={errors.departureDate ? 'border-red-500' : ''} />
              {errors.departureDate && <p className="text-sm text-red-500">{errors.departureDate}</p>}
            </div>
            {/* Ngày về */}
            <div className="space-y-1.5">
              <Label>Ngày về <span className="text-red-500">*</span></Label>
              <Input type="date" value={formData.returnDate} onChange={e => handleChange('returnDate', e.target.value)}
                className={errors.returnDate ? 'border-red-500' : ''} />
              {errors.returnDate && <p className="text-sm text-red-500">{errors.returnDate}</p>}
            </div>
          </div>

          {duration > 0 && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm text-blue-800">
              <strong>Thời gian xuất cảnh:</strong> {duration} ngày
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Chi phí dự toán */}
            <div className="space-y-1.5">
              <Label>Chi phí dự toán (VNĐ) <span className="text-red-500">*</span></Label>
              <Input type="number" value={formData.estimatedCost} onChange={e => handleChange('estimatedCost', e.target.value)}
                placeholder="50000000" className={errors.estimatedCost ? 'border-red-500' : ''} />
              {errors.estimatedCost && <p className="text-sm text-red-500">{errors.estimatedCost}</p>}
            </div>
            {/* Chi phí thực tế */}
            <div className="space-y-1.5">
              <Label>Chi phí thực tế (VNĐ)</Label>
              <Input type="number" value={formData.actualCost} onChange={e => handleChange('actualCost', e.target.value)}
                placeholder="48000000" />
            </div>
          </div>

          {/* File */}
          <div className="space-y-1.5">
            <Label>Tài liệu đính kèm {!isEdit && <span className="text-red-500">*</span>}</Label>
            {isEdit && trip?.fileName && !file && (
              <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-900">
                <span className="font-medium">File hiện tại:</span> {trip.fileName}
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
                <input type="file" className="hidden" onChange={e => { setFile(e.target.files?.[0] ?? null); if (errors.file) setErrors(p => ({ ...p, file: '' })); }} />
              </label>
            )}
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <Label>Ghi chú</Label>
            <Textarea value={formData.note} onChange={e => handleChange('note', e.target.value)}
              placeholder="Thông tin bổ sung..." rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}