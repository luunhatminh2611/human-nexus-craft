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
import { Label } from '@/shared/components/ui/label';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Loader2, Shield, UserCog, Users } from 'lucide-react';
import authService from '@/features/auth/api/authApi';

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onSuccess?: () => void;
}

const ROLES = [
  { id: 1, name: 'ADMIN', label: 'Quản trị', icon: Shield, color: 'text-red-600' },
  { id: 2, name: 'MANAGER', label: 'Quản lý', icon: UserCog, color: 'text-blue-600' },
  { id: 3, name: 'EMPLOYEE', label: 'Nhân viên', icon: Users, color: 'text-green-600' },
];

export default function RoleModal({
  isOpen,
  onClose,
  userData,
  onSuccess,
}: RoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<any>(null);

  // Fetch role từ API khi mở modal
  useEffect(() => {
    const fetchUserRole = async () => {
      const userId = userData?.userId || userData?.id;

      if (isOpen && userId) {
        try {
          const userRoles = await authService.getUserRole(userId);
          if (userRoles && userRoles.length > 0) {
            setCurrentUserRole(userRoles[0]);
            setSelectedRoleId(userRoles[0].roleId);
          } else {
            setCurrentUserRole(null);
            setSelectedRoleId(null);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setCurrentUserRole(null);
          setSelectedRoleId(null);
        }
      }
      setError('');
      setSuccess('');
    };

    fetchUserRole();
  }, [isOpen, userData]);

  const handleSubmit = async () => {
    if (!selectedRoleId) {
      setError('Vui lòng chọn vai trò');
      return;
    }

    const userId = userData?.userId || userData?.id;

    if (!userId) {
      setError('Không tìm thấy thông tin user');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (currentUserRole) {
        // Cập nhật role hiện tại
        await authService.updateUserRole(currentUserRole.id, {
          id: currentUserRole.id,
          userId: userId,
          roleId: selectedRoleId,
          isActive: true,
          createdAt: currentUserRole.createdAt,
          updatedAt: new Date().toISOString(),
          deleted: false,
        });
        setSuccess('Cập nhật vai trò thành công!');
      } else {
        // Tạo mới user role
        await authService.createUserRole(userId, selectedRoleId);
        setSuccess('Tạo vai trò thành công!');
      }

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Error managing role:', err);
      const errorMessage = err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mode = currentUserRole ? 'edit' : 'create';
  const selectedRole = ROLES.find(r => r.id === selectedRoleId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Tạo vai trò' : 'Chỉnh sửa vai trò'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? `Chọn vai trò cho nhân viên ${userData?.fullName}`
              : `Cập nhật vai trò cho nhân viên ${userData?.name}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <div className="space-y-3">
            <Label>Chọn vai trò <span className="text-red-500">*</span></Label>
            <div className="grid gap-3">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRoleId === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    disabled={loading}
                    className={`
                      flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}
                    `}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : role.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm">{role.label}</div>
                      <div className="text-xs text-muted-foreground">{role.name}</div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Vai trò đã chọn:</span> {selectedRole.label}
              </p>
            </div>
          )}
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
          <Button onClick={handleSubmit} disabled={loading || !selectedRoleId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Tạo vai trò' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}