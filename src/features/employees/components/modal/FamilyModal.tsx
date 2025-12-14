import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button/Button2';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { familyApi } from '../../api/family';

const RELATIONSHIPS = [
  { value: 'Cha', label: 'Cha' },
  { value: 'Mẹ', label: 'Mẹ' },
  { value: 'Vợ', label: 'Vợ' },
  { value: 'Chồng', label: 'Chồng' },
  { value: 'Con', label: 'Con' },
  { value: 'Anh', label: 'Anh' },
  { value: 'Chị', label: 'Chị' },
  { value: 'Em', label: 'Em' },
  { value: 'Ông', label: 'Ông' },
  { value: 'Bà', label: 'Bà' },
  { value: 'Khác', label: 'Khác' },
];

export default function FamilyModal({
  isOpen,
  onClose,
  employeeId,
  familyData = null,
  mode = 'create',
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    birthday: '',
    phone: '',
    address: '',
  });

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isOpen && mode === 'edit' && familyData) {
      setFormData({
        name: familyData.name || '',
        relationship: familyData.relationship || '',
        birthday: familyData.birthday || '',
        phone: familyData.phone || '',
        address: familyData.address || '',
      });
    } else if (isOpen && mode === 'create') {
      // Reset form khi tạo mới
      setFormData({
        name: '',
        relationship: '',
        birthday: '',
        phone: '',
        address: '',
      });
    }
    setError('');
    setSuccess('');
  }, [isOpen, mode, familyData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleRelationshipChange = (value) => {
    setFormData(prev => ({
      ...prev,
      relationship: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }
    if (!formData.relationship) {
      setError('Vui lòng chọn mối quan hệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: formData.name,
        relationship: formData.relationship,
        birthday: formData.birthday || null,
        phone: formData.phone || null,
        address: formData.address || null,
        employeeId: employeeId,
        ...(mode === 'edit' && familyData && { id: familyData.id }),
      };

      if (mode === 'create') {
        await familyApi.create(payload);
        setSuccess('Thêm thân nhân thành công!');
      } else {
        await familyApi.update(payload);
        setSuccess('Cập nhật thông tin thân nhân thành công!');
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm thông tin thân nhân' : 'Cập nhật thông tin thân nhân'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Nhập thông tin thân nhân của nhân viên'
              : 'Chỉnh sửa thông tin thân nhân'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Row 1: Họ tên & Mối quan hệ */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập họ và tên"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">
                Mối quan hệ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.relationship}
                onValueChange={handleRelationshipChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn mối quan hệ" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((rel) => (
                    <SelectItem key={rel.value} value={rel.value}>
                      {rel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Ngày sinh & Số điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Ngày sinh</Label>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 3: Địa chỉ */}
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ"
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'Thêm thân nhân' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}