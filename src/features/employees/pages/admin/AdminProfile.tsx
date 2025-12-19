import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  UserPlus,
  UserCog,
  Code,
  CalendarDays,
  ShieldPlus,
  ShieldCheck,
} from 'lucide-react';
import { employeeApi } from '@/features/employees/api/employeeApi';
import authService from '@/features/auth/api/authApi';
import InfoTab from '@/features/employees/components/InfoTab';
import ResumeTab from '@/features/employees/components/ResumeTab';
import MedicalTab from '../../components/MedicalTab';
import TrainingTab from '../../components/TrainingTab';
import KpiTab from '../../components/KpiTab';
import ContractsTab from '../../components/ContractsTab';
import LeavesTab from '../../components/LeavesTab';
import { SalaryTabWithDragDrop } from '../../components/SalaryTabWithDragDrop';
import { Button } from '@/shared/components/ui/button/Button2';
import AccountModal from '@/features/auth/components/AccountModal';
import RoleModal from '@/features/auth/components/RoleModal';
import { userApi } from '../../api/userApi';

function ProfileContent() {
  const { id } = useParams();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAdditionalInfo, setHasAdditionalInfo] = useState(false);
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [hasUserRole, setHasUserRole] = useState(false);
  const [userRole, setUserRole] = useState<any>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [accountModalMode, setAccountModalMode] = useState<'create' | 'edit'>('create');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Lấy thông tin employee
        const employeeResponse = await employeeApi.getById(Number(id));
        const employee = employeeResponse.data || employeeResponse;
        setEmployeeData(employee);

        // Kiểm tra có userId không
        const hasAccount = Boolean(employee.userId);
        setHasUserAccount(hasAccount);

        // Nếu có userId, fetch thông tin user
        if (hasAccount && employee.userId) {
          try {
            const userResponse = await userApi.getById(employee.userId);
            const user = userResponse.data || userResponse;
            setUserData(user);

            // Fetch user role
            try {
              const userRoles = await authService.getUserRole(employee.userId);
              if (userRoles && userRoles.length > 0) {
                setUserRole(userRoles[0]);
                setHasUserRole(true);
              } else {
                setUserRole(null);
                setHasUserRole(false);
              }
            } catch (roleError) {
              console.error('Error fetching user role:', roleError);
              setUserRole(null);
              setHasUserRole(false);
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            setUserData(null);
            setHasUserAccount(false);
          }
        } else {
          setUserData(null);
          setUserRole(null);
          setHasUserRole(false);
        }

        // Kiểm tra có thông tin bổ sung không
        const hasInfo = Boolean(
          employee.birthDate ||
          employee.provinceCity ||
          employee.position ||
          employee.department ||
          employee.startDate
        );
        setHasAdditionalInfo(hasInfo);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCreateEditInfo = () => {
    console.log('Create/Edit info clicked');
  };

  const handleManageAccount = () => {
    if (hasUserAccount) {
      setAccountModalMode('edit');
    } else {
      setAccountModalMode('create');
    }
    setIsAccountModalOpen(true);
  };

  const handleManageRole = () => {
    if (!hasUserAccount) {
      alert('Vui lòng tạo tài khoản trước khi phân quyền');
      return;
    }
    setIsRoleModalOpen(true);
  };

  const handleCloseAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  const handleCloseRoleModal = () => {
    setIsRoleModalOpen(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Không tìm thấy nhân viên</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `hsl(${(employeeData.name?.charCodeAt(0) || 0) * 137.508 % 360
                  }, 70%, 50%)`
              }}
            >
              <span className="text-3xl font-bold text-white">
                {employeeData.name?.charAt(0).toUpperCase() || 'N'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{employeeData.name}</h1>
                  </div>
                  <p className="text-lg text-muted-foreground mt-1">
                    {employeeData.positionName || 'Chưa có chức vụ'}
                    {employeeData.departmentName && ` • ${employeeData.departmentName}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={hasUserAccount ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleManageAccount}
                  >
                    {hasUserAccount ? (
                      <>
                        <UserCog className="h-4 w-4 mr-2" />
                        Cập nhật tài khoản
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Thêm tài khoản
                      </>
                    )}
                  </Button>
                  <Button
                    variant={hasUserRole ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleManageRole}
                    disabled={!hasUserAccount}
                  >
                    {hasUserRole ? (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Chỉnh sửa vai trò
                      </>
                    ) : (
                      <>
                        <ShieldPlus className="h-4 w-4 mr-2" />
                        Tạo vai trò
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span>{employeeData?.code || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {employeeData?.startDate
                      ? `${employeeData.startDate} (Ngày vào làm)`
                      : 'Chưa có ngày bắt đầu'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{userData?.email || 'Chưa có email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{userData?.phone || 'Chưa có SĐT'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[employeeData?.wardName, employeeData?.provinceCityName]
                      .filter(Boolean)
                      .join(', ') || 'Chưa cập nhật địa chỉ'}
                  </span>
                </div>
                {hasUserAccount && userData && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Tài khoản: <Badge variant="outline">{userData.username}</Badge>
                      {' '}
                      <Badge variant={userData.status === 'Active' ? 'default' : 'destructive'}>
                        {userData.status}
                      </Badge>
                      {hasUserRole && userRole && (
                        <>
                          {' • '}
                          <Badge variant="secondary">
                            {userRole.roleName || 'N/A'}
                          </Badge>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-14">
          <TabsTrigger value="info">Thông tin nhân sự</TabsTrigger>
          <TabsTrigger value="1">Quyết định</TabsTrigger>
          <TabsTrigger value="2">Bằng cấp</TabsTrigger>
          <TabsTrigger value="3">Quan hệ gia đình</TabsTrigger>
          <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
          <TabsTrigger value="4">Xuất cảnh nước ngoài</TabsTrigger>
          <TabsTrigger value="5">Nghỉ phép, theo dõi phép</TabsTrigger>
          <TabsTrigger value="6">Bảo hiểm xã hội</TabsTrigger>
          <TabsTrigger value="7">Hồ sơ</TabsTrigger>
          <TabsTrigger value="medical">Y tế</TabsTrigger>
          <TabsTrigger value="training">Đào tạo</TabsTrigger>
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="salary">Lương</TabsTrigger>
          <TabsTrigger value="8">Khác</TabsTrigger>

          <TabsTrigger value="leaves">Đơn nghỉ phép</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="info" className="space-y-4">
          <InfoTab
            userData={employeeData}
            employeeId={id}
          />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingTab userData={employeeData} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          <KpiTab userData={employeeData} />
        </TabsContent>

        {/* Salary */}
        <TabsContent value="salary" className="space-y-4">
          <SalaryTabWithDragDrop employee={employeeData} />
        </TabsContent>

        {/* Medical */}
        <TabsContent value="medical" className="space-y-4">
          <MedicalTab userData={employeeData} />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeavesTab userData={employeeData} />
        </TabsContent>

        <TabsContent value="1" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="2" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="3" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="4" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="5" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="6" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="7" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="8" className="space-y-4">
          <ContractsTab />
        </TabsContent>
        <TabsContent value="contracts" className="space-y-4">
          <ContractsTab  />
        </TabsContent>
      </Tabs>

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={handleCloseAccountModal}
        employeeId={Number(id)}
        existingUser={userData || null}
        mode={accountModalMode}
        employeeData={employeeData}
      />

      {/* Role Modal */}
      <RoleModal
        isOpen={isRoleModalOpen}
        onClose={handleCloseRoleModal}
        userData={employeeData}
        onSuccess={() => {
          // Refresh data after role update
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function AdminProfile() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProfileContent />
    </DndProvider>
  );
}