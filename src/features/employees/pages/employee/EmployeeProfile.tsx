import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Badge } from '@/shared/components/ui/badge';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  Mail,
  Phone,
  MapPin,
  Code,
  CalendarDays,
  Shield,
} from 'lucide-react';
import { employeeApi } from '@/features/employees/api/employeeApi';
import { useAuthStore } from '../../hooks/useAuth';
import InfoTab from '@/features/employees/components/InfoTab';
import MedicalTab from '@/features/employees/components/MedicalTab';
import TrainingTab from '@/features/employees/components/TrainingTab';
import KpiTab from '@/features/employees/components/KpiTab';
import ContractsTab from '@/features/employees/components/ContractsTab';
import LeavesTab from '@/features/employees/components/LeavesTab';
import { SalaryTabWithDragDrop } from '@/features/employees/components/SalaryTabWithDragDrop';
import { userApi } from '../../api/userApi';
import authService from '@/features/auth/api/authApi';

function ProfileContent() {
  const { user } = useAuthStore();
  const [userData, setUserData] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<number | null>(null);

  useEffect(() => {
    const fetchEmployeeProfile = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
        // Bước 1: Lấy employeeId từ userId
        const profileData = await employeeApi.getProfile(user.userId);
        const empId = profileData.id;
        setEmployeeId(empId);

        // Bước 2: Lấy thông tin chi tiết employee bằng employeeId
        const detailedData = await employeeApi.getById(empId);
        setUserData(detailedData.data);

        const hasAccount = Boolean(detailedData.data.userId);
        setHasUserAccount(hasAccount);

        if (hasAccount && detailedData.data.userId) {
          try {
            const accountResponse = await userApi.getById(detailedData.data.userId);
            const account = accountResponse.data || accountResponse;
            setAccountData(account);

          } catch (accountError) {
            console.error('Error fetching user data:', accountError);
            setAccountData(null);
            setHasUserAccount(false);
          }
        } else {
          setAccountData(null);
        }

      } catch (error) {
        console.error('Error fetching employee profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeProfile();
  }, [user?.userId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Không tìm thấy thông tin nhân viên</h2>
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
                backgroundColor: `hsl(${(userData.name?.charCodeAt(0) || 0) * 137.508 % 360
                  }, 70%, 50%)`
              }}
            >
              <span className="text-3xl font-bold text-white">
                {userData.name?.charAt(0).toUpperCase() || 'N'}
              </span>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{userData.name}</h1>
                </div>
                <p className="text-lg text-muted-foreground mt-1">
                  {userData.positionName || 'Chưa có chức vụ'}
                  {userData.departmentName && ` • ${userData.departmentName}`}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span>{userData?.code || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {userData?.startDate
                      ? `${userData.startDate} (Ngày vào làm)`
                      : 'Chưa có ngày bắt đầu'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{accountData.email || 'Chưa có email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{accountData.phone || 'Chưa có SĐT'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {[userData?.wardName, userData?.provinceCityName]
                      .filter(Boolean)
                      .join(', ') || 'Chưa cập nhật địa chỉ'}
                  </span>
                </div>
                {accountData && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Tài khoản: <Badge variant="outline">{accountData.username}</Badge>
                      {' '}
                      <Badge variant={accountData.status === 'Active' ? 'default' : 'destructive'}>
                        {accountData.status}
                      </Badge>
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="info">Sơ yếu lý lịch</TabsTrigger>
          <TabsTrigger value="medical">Y tế</TabsTrigger>
          <TabsTrigger value="training">Đào tạo</TabsTrigger>
          <TabsTrigger value="kpi">KPI</TabsTrigger>
          <TabsTrigger value="salary">Lương</TabsTrigger>
          <TabsTrigger value="contracts">Hợp đồng</TabsTrigger>
          <TabsTrigger value="leaves">Đơn nghỉ phép</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="info" className="space-y-4">
          <InfoTab
            userData={userData}
            employeeId={employeeId?.toString()}
          />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingTab userData={userData} />
        </TabsContent>

        <TabsContent value="kpi" className="space-y-4">
          <KpiTab userData={userData} />
        </TabsContent>

        {/* Salary */}
        <TabsContent value="salary" className="space-y-4">
          <SalaryTabWithDragDrop employee={userData} />
        </TabsContent>

        {/* Medical */}
        <TabsContent value="medical" className="space-y-4">
          <MedicalTab userData={userData} />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeavesTab userData={userData} />
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <ContractsTab userData={userData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EmployeeProfile() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProfileContent />
    </DndProvider>
  );
}