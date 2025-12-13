import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Edit, Calendar, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/shared/components/ui/button/Button2';
import { Badge } from '@/shared/components/ui/badge';
import EmployeeModal from './modal/EmployeeModal';
import { useAuthStore } from '../hooks/useAuth';
import { transferApi } from '@/features/transfer/api/transferApi';

export default function InfoTab({ userData: initialUserData, employeeId }) {
  const [userData, setUserData] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transferHistory, setTransferHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuthStore();

  const isAdmin = user?.roles === 'ADMIN';

  useEffect(() => {
    if (employeeId) {
      fetchTransferHistory();
    }
  }, [employeeId]);

  const fetchTransferHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await transferApi.getByEmployeeId(employeeId);
      
      // Response có thể có cấu trúc: { content: [[...]], totalElements: ... }
      // Lấy mảng đầu tiên trong content
      const historyData = response?.content?.[0] || [];
      setTransferHistory(historyData);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử điều động:', error);
      setTransferHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleOpenEditModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
        <CardHeader>
          <CardTitle>V. Thông tin thân nhân</CardTitle>
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