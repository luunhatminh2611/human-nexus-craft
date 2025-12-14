import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Edit, Calendar, ArrowRight, FileText, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import EmployeeModal from './modal/EmployeeModal';
import FamilyModal from './modal/FamilyModal';
import { useAuthStore } from '../hooks/useAuth';
import { transferApi } from '@/features/transfer/api/transferApi';
import { familyApi } from '../api/family';

export default function InfoTab({ userData: initialUserData, employeeId }) {
  const [userData, setUserData] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [isLoadingFamily, setIsLoadingFamily] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyModalMode, setFamilyModalMode] = useState('create');
  const { user } = useAuthStore();

  const MAX_FAMILY_MEMBERS = 2;

  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';
  const isEmployee = user?.roles === 'EMPLOYEE';
  const canManageFamily = isManager || isEmployee;

  useEffect(() => {
    if (employeeId) {
      fetchTransferHistory();
      fetchFamilyMembers();
    }
  }, [employeeId]);

  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await transferApi.getByEmployeeId(employeeId);
      const historyData = response?.content?.[0] || [];
      setTransferHistory(historyData);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử điều động:', error);
      setTransferHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      setIsLoadingFamily(true);
      const response = await familyApi.getByEmployeeId(employeeId);
      setFamilyMembers(response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thân nhân:', error);
      setFamilyMembers([]);
    } finally {
      setIsLoadingFamily(false);
    }
  };

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddFamily = () => {
    if (familyMembers.length >= MAX_FAMILY_MEMBERS) {
      alert('Chỉ được phép thêm tối đa 2 thân nhân');
      return;
    }
    setFamilyModalMode('create');
    setSelectedFamily(null);
    setIsFamilyModalOpen(true);
  };

  const handleEditFamily = (familyMember) => {
    setFamilyModalMode('edit');
    setSelectedFamily(familyMember);
    setIsFamilyModalOpen(true);
  };

  const handleCloseFamilyModal = () => {
    setIsFamilyModalOpen(false);
    setSelectedFamily(null);
  };

  const handleFamilySuccess = () => {
    fetchFamilyMembers();
  };

  const handleDeleteFamily = async (familyId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông tin thân nhân này không?')) {
      return;
    }

    try {
      await familyApi.delete(familyId);
      alert('Xóa thân nhân thành công');
      fetchFamilyMembers(); // Refresh danh sách
    } catch (error) {
      console.error('Lỗi khi xóa thân nhân:', error);
      alert('Lỗi khi xóa thân nhân');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'DA_TAO': { label: 'Đã tạo', className: 'bg-yellow-100 text-yellow-800' },
      'TRUONG_PHONG_CHO_KY': { label: 'Chờ trưởng phòng ký', className: 'bg-yellow-100 text-yellow-800' },
      'GIAM_DOC_CHO_KY': { label: 'Chờ giám đốc ký', className: 'bg-blue-100 text-blue-800' },
      'CHO_TIEP_NHAN': { label: 'Chờ tiếp nhận', className: 'bg-purple-100 text-purple-800' },
      'REJECTED': { label: 'Từ chối', className: 'bg-red-100 text-red-800' },
      'SUCCEEDED': { label: 'Hoàn thành', className: 'bg-green-100 text-green-800' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getRelationshipBadge = (relationship) => {
    const relationshipColors = {
      'Cha': 'bg-blue-100 text-blue-800',
      'Mẹ': 'bg-pink-100 text-pink-800',
      'Vợ': 'bg-purple-100 text-purple-800',
      'Chồng': 'bg-purple-100 text-purple-800',
      'Con': 'bg-green-100 text-green-800',
      'Anh': 'bg-orange-100 text-orange-800',
      'Chị': 'bg-orange-100 text-orange-800',
      'Em': 'bg-orange-100 text-orange-800',
    };

    const className = relationshipColors[relationship] || 'bg-gray-100 text-gray-800';

    return (
      <Badge className={className}>
        {relationship}
      </Badge>
    );
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
                value={userData.birthday || ''}
                disabled
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Quốc tịch</Label>
              <Input
                value={userData.nationalityName || ''}
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
                value={userData.provinceCityName || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Phường/Xã</Label>
              <Input
                value={userData.wardName || ''}
                disabled
                placeholder="Chưa cập nhật"
                className='mt-2'
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1">Địa chỉ cụ thể</Label>
              <Input
                value={userData.contactAddress || ''}
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
                  value={userData.cccdNumber || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Ngày cấp</Label>
                <Input
                  type="date"
                  value={userData.cccdDate || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Nơi cấp</Label>
                <Input
                  value={userData.cccdPalce || ''}
                  disabled
                  className='mt-2'
                />
              </div>
            </div>
          </div>

          {/* III. Trình độ học vấn & chuyên môn */}
          <div className='mt-6'>
            <h3 className="font-semibold text-lg mb-2">III. Trình độ học vấn & chuyên ngành</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Bậc học</Label>
                <Input
                  value={userData?.educationLevelName || ''}
                  disabled
                  placeholder="Ví dụ: Đại học, Thạc sĩ, Tiến sĩ"
                  className='mt-2'
                />
              </div>
              <div className="">
                <Label>Chuyên ngành</Label>
                <Input
                  value={userData?.specialtyName || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Trình độ lý luận chính trị</Label>
                <Input
                  value={userData?.politicalTheoryName || ''}
                  disabled
                  className='mt-2'
                />
              </div>
              <div>
                <Label>Ngoại ngữ</Label>
                <Input
                  value={userData.languageLevelName || ''}
                  disabled
                  placeholder="Ví dụ: Tiếng Anh B2, TOEIC 850"
                  className='mt-2'
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IV. Lịch sử điều động */}
      <Card>
        <CardHeader>
          <CardTitle>IV. Lịch sử điều động</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Đang tải...</span>
              </div>
            </div>
          ) : transferHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có lịch sử điều động</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transferHistory.map((transfer, index) => (
                <div
                  key={transfer.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        Lần {transferHistory.length - index}
                      </span>
                      {getStatusBadge(transfer.status)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(transfer.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Từ</p>
                      <p className="font-medium text-sm">{transfer.fromDepartmentName}</p>
                      <p className="text-xs text-muted-foreground">{transfer.fromPositionName}</p>
                    </div>

                    <ArrowRight className="h-5 w-5 text-blue-500 flex-shrink-0" />

                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Đến</p>
                      <p className="font-medium text-sm">{transfer.toDepartmentName}</p>
                      <p className="text-xs text-muted-foreground">{transfer.toPositionName}</p>
                    </div>
                  </div>

                  {transfer.description && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Mô tả:</p>
                      <p className="text-sm">{transfer.description}</p>
                    </div>
                  )}

                  {transfer.note && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Ghi chú:</p>
                      <p className="text-sm">{transfer.note}</p>
                    </div>
                  )}

                  {transfer.creatorName && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Người tạo: <span className="font-medium">{transfer.creatorName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* V. Thông tin thân nhân */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>V. Thông tin thân nhân</CardTitle>
          {canManageFamily && (
            <Button variant="outline" size="sm" onClick={handleAddFamily}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm thân nhân
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoadingFamily ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Đang tải...</span>
              </div>
            </div>
          ) : familyMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có thông tin thân nhân</p>
              {canManageFamily && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddFamily}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thân nhân đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="grid grid-cols-4 items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{member.name}</p>
                        {getRelationshipBadge(member.relationship)}
                      </div>
                    </div>
                    {member.birthday && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Ngày sinh</p>
                        <p className="font-medium">{formatDate(member.birthday)}</p>
                      </div>
                    )}
                    {member.phone && (
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Số điện thoại</p>
                        <p className="font-medium">{member.phone}</p>
                      </div>
                    )}
                    {member.address && (
                      <div className="">
                        <p className="text-muted-foreground text-xs mb-1">Địa chỉ</p>
                        <p className="font-medium">{member.address}</p>
                      </div>
                    )}
                    {canManageFamily && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFamily(member)}
                          className="hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFamily(member.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Family Modal */}
      <FamilyModal
        isOpen={isFamilyModalOpen}
        onClose={handleCloseFamilyModal}
        employeeId={employeeId}
        familyData={selectedFamily}
        mode={familyModalMode}
        onSuccess={handleFamilySuccess}
      />
    </div>
  );
}