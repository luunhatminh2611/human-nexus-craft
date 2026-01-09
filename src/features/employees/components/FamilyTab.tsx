import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import FamilyModal from './modal/FamilyModal';
import { familyApi } from '../api/family';
import { useAuthStore } from '../hooks/useAuth';

export default function FamilyTab({ employeeId }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [mode, setMode] = useState('create');

  const { user } = useAuthStore();
  const isManager = user?.roles === 'MANAGER';
  const isEmployee = user?.roles === 'EMPLOYEE';
  const canManageFamily = isManager || isEmployee;

  useEffect(() => {
    if (employeeId) {
      fetchFamilyMembers();
    }
  }, [employeeId]);

  const fetchFamilyMembers = async () => {
    try {
      setIsLoading(true);
      const res = await familyApi.getByEmployeeId(employeeId);
      setFamilyMembers(res || []);
    } catch (e) {
      console.error('Lỗi lấy thân nhân', e);
      setFamilyMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setMode('create');
    setSelectedFamily(null);
    setIsFamilyModalOpen(true);
  };

  const handleEdit = (member) => {
    setMode('edit');
    setSelectedFamily(member);
    setIsFamilyModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa thông tin thân nhân này?')) return;
    await familyApi.delete(id);
    fetchFamilyMembers();
  };

  const getRelationshipBadge = (relationship) => {
    const map = {
      Cha: 'bg-blue-100 text-blue-800',
      Mẹ: 'bg-pink-100 text-pink-800',
      Vợ: 'bg-purple-100 text-purple-800',
      Chồng: 'bg-purple-100 text-purple-800',
      Con: 'bg-green-100 text-green-800',
    };
    return <Badge className={map[relationship] || 'bg-gray-100'}>{relationship}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Thông tin thân nhân</CardTitle>
          <Button size="sm" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm thân nhân
          </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground">Đang tải...</div>
        ) : familyMembers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Chưa có thông tin thân nhân
          </div>
        ) : (
          <div className="space-y-3">
            {familyMembers.map((m) => (
              <div
                key={m.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <div className="flex gap-2 mt-1">
                    {getRelationshipBadge(m.relationship)}
                    {m.phone && <span className="text-sm text-muted-foreground">{m.phone}</span>}
                  </div>
                </div>

                {canManageFamily && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(m)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        employeeId={employeeId}
        familyData={selectedFamily}
        mode={mode}
        onSuccess={fetchFamilyMembers}
      />
    </Card>
  );
}