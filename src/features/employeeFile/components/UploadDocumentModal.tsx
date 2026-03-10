// components/UploadDocumentModal.tsx

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Upload, File, AlertCircle, X, Paperclip, User, ChevronDown, Search } from 'lucide-react';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/shared/components/ui/popover';
import { toast } from 'sonner';
import { employeeDocumentApi } from '../api/document';
import { employeeApi } from '@/features/employees/api/employeeApi';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'RECRUITMENT',  label: 'Hồ sơ tuyển dụng' },
  { value: 'CONTRACT',     label: 'Hợp đồng' },
  { value: 'INSURANCE',    label: 'Bảo hiểm & Thuế' },
  { value: 'CERTIFICATE',  label: 'Bằng cấp' },
  { value: 'DECISION',     label: 'Quyết định' },
  { value: 'TRAINING',     label: 'Đào tạo' },
  { value: 'OTHER',        label: 'Khác' },
];

// ─── EmployeePopover ──────────────────────────────────────────────────────────
function EmployeePopover({ employeeId, employeeName, allEmployees, onSelect, disabled }: {
  employeeId: string;
  employeeName: string;
  allEmployees: any[];
  onSelect: (emp: any) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allEmployees.filter(e =>
        e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(search.toLowerCase()))
    : allEmployees.slice(0, 20);

  return (
    <Popover open={open && !disabled} onOpenChange={v => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`flex items-center gap-1.5 h-9 px-3 text-sm border rounded w-full hover:bg-gray-50 transition-colors text-left
            ${!employeeId ? 'text-muted-foreground border-dashed' : 'text-foreground'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <Input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã..." className="pl-7 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length > 0 ? filtered.map(emp => (
            <button key={emp.id} type="button"
              onClick={() => { onSelect(emp); setOpen(false); setSearch(''); }}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors
                ${employeeId === emp.id.toString() ? 'bg-green-50' : ''}`}>
              <div className="text-sm font-medium">{emp.fullName}</div>
              <div className="text-xs text-muted-foreground">
                {emp.employeeCode}{emp.departmentName && ` · ${emp.departmentName}`}
              </div>
            </button>
          )) : (
            <div className="px-3 py-4 text-xs text-muted-foreground text-center">Không tìm thấy</div>
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UploadDocumentModal({ isOpen, onClose, onSuccess }: UploadDocumentModalProps) {
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    documentType: '',
    documentName: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    employeeApi.getAll().then(d => setAllEmployees(d || [])).catch(console.error);
    setFormData({ employeeId: '', employeeName: '', documentType: '', documentName: '', description: '' });
    setSelectedFile(null);
    setErrors({});
  }, [isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File không được vượt quá 10MB' }));
      return;
    }
    setSelectedFile(file);
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.employeeId)        errs.employeeId    = 'Vui lòng chọn nhân viên';
    if (!formData.documentType)      errs.documentType  = 'Vui lòng chọn loại tài liệu';
    if (!formData.documentName.trim()) errs.documentName = 'Vui lòng nhập tên tài liệu';
    if (!selectedFile)               errs.file          = 'Vui lòng chọn file để upload';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await employeeDocumentApi.create(
        Number(formData.employeeId),
        {
          documentType: formData.documentType,
          documentName: formData.documentName,
          description: formData.description || null,
        },
        selectedFile!,
      );
      toast.success('Đã upload tài liệu thành công');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Không thể upload tài liệu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload tài liệu hồ sơ</DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            File được chấp nhận: PDF, JPG, PNG, DOC, DOCX. Dung lượng tối đa: 10MB.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 mt-2">
          {/* Nhân viên */}
          <div className="space-y-1.5">
            <Label>Nhân viên <span className="text-red-500">*</span></Label>
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
                if (errors.employeeId) setErrors(p => ({ ...p, employeeId: '' }));
              }}
            />
            {errors.employeeId && <p className="text-sm text-red-500">{errors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Loại tài liệu */}
            <div className="space-y-1.5">
              <Label>Loại tài liệu <span className="text-red-500">*</span></Label>
              <Select value={formData.documentType} onValueChange={v => handleChange('documentType', v)}>
                <SelectTrigger className={errors.documentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.documentType && <p className="text-sm text-red-500">{errors.documentType}</p>}
            </div>

            {/* Tên tài liệu */}
            <div className="space-y-1.5">
              <Label>Tên tài liệu <span className="text-red-500">*</span></Label>
              <Input
                value={formData.documentName}
                onChange={e => handleChange('documentName', e.target.value)}
                placeholder="VD: Hợp đồng lao động, Bằng tốt nghiệp..."
                className={errors.documentName ? 'border-red-500' : ''}
              />
              {errors.documentName && <p className="text-sm text-red-500">{errors.documentName}</p>}
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-1.5">
            <Label>Mô tả</Label>
            <Textarea
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Mô tả ngắn về tài liệu..."
              rows={2}
            />
          </div>

          {/* File upload */}
          <div className="space-y-1.5">
            <Label>File tài liệu <span className="text-red-500">*</span></Label>
            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <File className="h-8 w-8 text-blue-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <button type="button" onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:border-primary transition-colors
                ${errors.file ? 'border-red-400' : 'border-gray-300'}`}>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Kéo thả hoặc nhấn để chọn file</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, DOCX · tối đa 10MB</p>
                <input type="file" className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange} />
              </label>
            )}
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? <><div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />Đang upload...</>
              : <><Upload className="h-4 w-4 mr-2" />Xác nhận</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}