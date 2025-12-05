// src/features/users/components/AssignRoleModal.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { userRoleApi } from '@/features/employees/api/userroleApi';
import { roleApi } from '@/features/categories/api/categoriesApi';

export default function AssignRoleModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}) {
  const [allRoles, setAllRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [roles, currentRoles] = await Promise.all([
        roleApi.getAll(),
        userRoleApi.getUserRoles(user.id),
      ]);
      setAllRoles(roles);
      setUserRoles(currentRoles);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRoleId) return;

    setSubmitting(true);
    try {
      await userRoleApi.createUserRole({
        userId: user.id,
        roleId: selectedRoleId,
        isActive: true,
      });
      
      // Reload user roles
      const updatedRoles = await userRoleApi.getUserRoles(user.id);
      setUserRoles(updatedRoles);
      setSelectedRoleId(null);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to assign role:', error);
      alert('Không thể phân vai trò. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRole = async (userRoleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quyền này?')) return;

    try {
      await userRoleApi.deleteUserRole(userRoleId);
      setUserRoles(userRoles.filter(ur => ur.id !== userRoleId));
      onSuccess?.();
    } catch (error) {
      console.error('Failed to remove role:', error);
      alert('Không thể xóa quyền. Vui lòng thử lại.');
    }
  };

  const assignedRoleIds = userRoles.map(ur => ur.roleId);
  const availableRoles = allRoles.filter(r => !assignedRoleIds.includes(r.id));

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Phân vai trò cho người dùng</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {user.fullName} ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Current Roles */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Vai trò hiện tại</h3>
                {userRoles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có vai trò nào được phân
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userRoles.map((userRole) => {
                      const role = allRoles.find(r => r.id === userRole.roleId);
                      return (
                        <div
                          key={userRole.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="default">
                              {role?.name || 'Unknown Role'}
                            </Badge>
                            {!userRole.isActive && (
                              <Badge variant="secondary">Không hoạt động</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRole(userRole.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assign New Role */}
              {availableRoles.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Thêm vai trò mới</h3>
                  <div className="flex gap-2">
                    <select
                      value={selectedRoleId || ''}
                      onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Chọn vai trò...</option>
                      {availableRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleAssignRole}
                      disabled={!selectedRoleId || submitting}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm vai trò
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}