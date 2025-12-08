// src/features/employees/components/InfoTab.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import EmployeeModal from './modal/EmployeeModal';
import { useAuthStore } from '../hooks/useAuth';

export default function InfoTab({ userData: initialUserData, employeeId }) {
  const [userData, setUserData] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const isAdmin = user?.roles === 'ADMIN';

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Thông tin cá nhân */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Sơ yếu lý lịch</CardTitle>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleOpenEditModal}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold text-lg mb-4">I. Thông tin cá nhân</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Giới tính</Label>
              <Input
                value={userData.gender || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Ngày sinh</Label>
              <Input
                type="date"
                value={userData.birthDate || ''}
                disabled
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Quốc tịch</Label>
              <Input
                value={userData.nationality?.name || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Dân tộc</Label>
              <Input
                value={userData.ethnicity || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Tôn giáo</Label>
              <Input
                value={userData.religion || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Tỉnh/Thành phố</Label>
              <Input
                value={userData.provinceCity?.name || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Phường/Xã</Label>
              <Input
                value={userData.ward?.name || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
          </div>
          <div className='mt-6'>
            <h3 className="font-semibold text-lg mb-2">II. CMND/CCCD</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Số CMND/CCCD</Label>
                <Input
                  value={userData.idNumber || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Ngày cấp</Label>
                <Input
                  type="date"
                  value={userData.idIssueDate || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Nơi cấp</Label>
                <Input
                  value={userData.idIssuePlace || ''}
                  disabled
                  className='mt-2'
                />
              </div>
            </div>
          </div>

          {/* IV. Trình độ học vấn & chuyên môn */}
          <div className='mt-6'>
            <h3 className="font-semibold text-lg mb-2">III. Trình độ học vấn & chuyên môn</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Trình độ chuyên môn</Label>
                <Input
                  value={userData?.educationLevel?.name || ''}
                  disabled
                  placeholder="Ví dụ: Đại học, Thạc sĩ, Tiến sĩ"
                  className='mt-2'
                />
              </div>
              <div className="">
                <Label>Chuyên ngành</Label>
                <Input
                  value={userData?.specialty?.name || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Trình độ lý luận chính trị</Label>
                <Input
                  value={userData?.politicalTheory?.name || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Ngoại ngữ</Label>
                <Input
                  value={userData.languageLevel?.name || ''}
                  disabled
                  placeholder="Ví dụ: Tiếng Anh B2, TOEIC 850"
                  className='mt-2'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>IV. Thông tin thân nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Thông tin về cha mẹ, vợ/chồng, con cái và các thành viên gia đình khác
          </p>
          <Textarea
            value={userData.familyMembers || ''}
            disabled
            rows={4}
            placeholder="Thông tin thân nhân..."
          />
        </CardContent>
      </Card>

      {isAdmin && (
        <EmployeeModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          employeeId={employeeId}
          mode="edit"
        />
      )}
    </div>
  );
}