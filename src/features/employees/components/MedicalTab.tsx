// src/features/employees/components/MedicalTab.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import {
  Activity,
  Heart,
  Calendar,
  Ruler,
  Weight,
  Droplet,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Lock
} from 'lucide-react';
import { ehrApi } from '../api/ehrApi';
import { toast } from "sonner";
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '@/shared/components/ui/button/Button2';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/tables/table';
import CheckupDialog from './modal/CreateCheckUp';
import { transferApi } from '@/features/transfer/api/transferApi';

export default function MedicalTab({ userData }) {
  const [ehrProfile, setEhrProfile] = useState<any>(null);
  const [checkupHistory, setCheckupHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showCheckupDialog, setShowCheckupDialog] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState<any>(null);

  const [profileForm, setProfileForm] = useState<any>({
    bloodType: '',
    lastCheckDate: '',
    height: '',
    weight: '',
    allergy: '',
    chronicDisease: '',
    occupationalDisease: '',
    medication: '',
    healthClassification: '',
  });

  const handleOpenProfileDialog = () => {
    if (ehrProfile) {
      setProfileForm({
        bloodType: ehrProfile.bloodType || '',
        lastCheckDate: ehrProfile.lastCheckDate || '',
        height: ehrProfile.height || '',
        weight: ehrProfile.weight || '',
        allergy: ehrProfile.allergy || '',
        chronicDisease: ehrProfile.chronicDisease || '',
        occupationalDisease: ehrProfile.occupationalDisease || '',
        medication: ehrProfile.medication || '',
        healthClassification: ehrProfile.healthClassification || '',
      });
    }
    setShowProfileDialog(true);
  };

  const handleSubmitProfile = async () => {
    try {
      const payload = {
        ...(ehrProfile?.id && { id: ehrProfile.id }),
        employeeId: userData.id,
        ...profileForm,
        height: Number(profileForm.height) || 0,
        weight: Number(profileForm.weight) || 0,
      };

      await ehrApi.profile.update(payload);

      toast.success(ehrProfile ? 'Cập nhật hồ sơ thành công' : 'Tạo hồ sơ thành công');
      setShowProfileDialog(false);
      loadMedicalData();
    } catch (error) {
      console.error(error);
      toast.error('Không thể lưu hồ sơ sức khỏe');
    }
  };

  const { user } = useAuthStore();

  // Check quyền ADMIN hoặc MANAGER
  const isAdmin = user?.roles === 'ADMIN';
  const isManager = user?.roles === 'MANAGER';
  const canManage = isAdmin;

  // Load dữ liệu
  useEffect(() => {
    loadMedicalData();
  }, [userData.id]);

  const loadMedicalData = async () => {
    try {
      setLoading(true);

      // Load EHR Profile
      const profileData = await ehrApi.profile.getByEmployeeId(userData.id);
      setEhrProfile(profileData.data);

      // Load Checkup History
      const checkupData = await ehrApi.checkup.getByEmployeeId(userData.id);
      setCheckupHistory(checkupData);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu y tế:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCheckupFile = async (fileKey: string) => {
    try {
      const blob = await transferApi.downloadFile(fileKey);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileKey.split("/").pop() || "checkup-file";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Không thể tải file");
    }
  };

  const handleDeleteCheckup = async (checkupId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lượt khám này không?")) return;

    try {
      await ehrApi.checkup.delete(checkupId);
      toast.success("Xóa lượt khám thành công");
      loadMedicalData(); // reload bảng
    } catch (error) {
      console.error(error);
      toast.error("Không thể xóa lượt khám");
    }
  };

  // Tính BMI
  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Hồ sơ sức khỏe
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenProfileDialog}
          >
            <Plus className="h-4 w-4 mr-2" />
            Cập nhật hồ sơ sức khỏe
          </Button>
        </CardHeader>
        <CardContent>
          {ehrProfile ? (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-muted-foreground">Nhóm máu</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {ehrProfile.bloodType || '--'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4 text-blue-500" />
                    <p className="text-sm text-muted-foreground">Chiều cao</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {ehrProfile.height ? `${ehrProfile.height} cm` : '--'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Weight className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-muted-foreground">Cân nặng</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {ehrProfile.weight ? `${ehrProfile.weight} kg` : '--'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    <p className="text-sm text-muted-foreground">BMI</p>
                  </div>
                  <p className="text-2xl font-bold">
                    {calculateBMI(ehrProfile.height, ehrProfile.weight) || '--'}
                  </p>
                </div>
              </div>

              {/* Phân loại sức khỏe */}
              {ehrProfile.healthClassification && (
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                  <p className="text-sm text-muted-foreground mb-1">Phân loại sức khỏe</p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                    {ehrProfile.healthClassification}
                  </p>
                </div>
              )}

              {/* Thông tin bệnh lý */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Dị ứng */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="font-semibold">Dị ứng</p>
                  </div>
                  {ehrProfile.allergy ? (
                    <div className="flex flex-wrap gap-2">
                      {ehrProfile.allergy.split(',').map((item: string, idx: number) => (
                        <Badge key={idx} variant="destructive">
                          {item.trim()}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có dị ứng</p>
                  )}
                </div>

                {/* Bệnh mãn tính */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="h-4 w-4 text-red-500" />
                    <p className="font-semibold">Bệnh mãn tính</p>
                  </div>
                  {ehrProfile.chronicDisease && ehrProfile.chronicDisease !== 'Không' ? (
                    <p className="text-sm">{ehrProfile.chronicDisease}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có bệnh mãn tính</p>
                  )}
                </div>

                {/* Bệnh nghề nghiệp */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-4 w-4 text-orange-500" />
                    <p className="font-semibold">Bệnh nghề nghiệp</p>
                  </div>
                  {ehrProfile.occupationalDisease && ehrProfile.occupationalDisease !== 'Không' ? (
                    <p className="text-sm">{ehrProfile.occupationalDisease}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có bệnh nghề nghiệp</p>
                  )}
                </div>

                {/* Thuốc đang dùng */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <p className="font-semibold">Thuốc đang dùng</p>
                  </div>
                  {ehrProfile.medication ? (
                    <p className="text-sm">{ehrProfile.medication}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Không có thuốc đang sử dụng</p>
                  )}
                </div>
              </div>

              {/* Ngày khám gần nhất */}
              {ehrProfile.lastCheckDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Khám gần nhất: {new Date(ehrProfile.lastCheckDate).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Chưa có hồ sơ sức khỏe</p>
              {canManage && (
                <Button
                  size="sm"
                  onClick={handleOpenProfileDialog}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cập nhật hồ sơ sức khỏe
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lịch sử khám sức khỏe - Checkup History */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Lịch sử khám sức khỏe
            <Badge variant="secondary">{checkupHistory.length}</Badge>
          </CardTitle>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCheckup(null);
                setShowCheckupDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Thêm khám mới
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {checkupHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Ngày khám</TableHead>
                  <TableHead>Bệnh viện</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead className="text-center">File</TableHead>
                  {canManage && <TableHead className="text-right">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody>
                {checkupHistory
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((checkup, index) => (
                    <TableRow key={checkup.id}>
                      <TableCell>{index + 1}</TableCell>

                      {/* Ngày khám */}
                      <TableCell>
                        {new Date(checkup.date).toLocaleDateString("vi-VN")}
                      </TableCell>

                      {/* Bệnh viện */}
                      <TableCell>
                        {checkup.hospitalName || "—"}
                      </TableCell>

                      {/* Kết quả */}
                      <TableCell className="max-w-[250px] truncate">
                        {checkup.result || "—"}
                      </TableCell>

                      {/* File */}
                      <TableCell className='text-center'>
                        {checkup.fileKey ? (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleDownloadCheckupFile(checkup.fileKey)}
                          >
                            Tải file
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {canManage && (
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCheckup(checkup);
                              setShowCheckupDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCheckup(checkup.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Chưa có lịch sử khám sức khỏe
              </p>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedCheckup(null);
                    setShowCheckupDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm khám mới
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {ehrProfile ? 'Cập nhật hồ sơ sức khỏe' : 'Tạo hồ sơ sức khỏe'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Nhóm máu</label>
              <input
                className="input w-full"
                value={profileForm.bloodType}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, bloodType: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ngày khám gần nhất</label>
              <input
                type="date"
                className="input w-full"
                value={profileForm.lastCheckDate}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, lastCheckDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Chiều cao (cm)</label>
              <input
                type="number"
                className="input w-full"
                value={profileForm.height}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, height: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Cân nặng (kg)</label>
              <input
                type="number"
                className="input w-full"
                value={profileForm.weight}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, weight: e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Dị ứng</label>
              <input
                className="input w-full"
                placeholder="Ví dụ: Penicillin, Hải sản"
                value={profileForm.allergy}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, allergy: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bệnh mãn tính</label>
              <input
                className="input w-full"
                value={profileForm.chronicDisease}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, chronicDisease: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bệnh nghề nghiệp</label>
              <input
                className="input w-full"
                value={profileForm.occupationalDisease}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, occupationalDisease: e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Thuốc đang sử dụng</label>
              <input
                className="input w-full"
                value={profileForm.medication}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, medication: e.target.value })
                }
              />
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium">Phân loại sức khỏe</label>
              <input
                className="input w-full"
                placeholder="I, II, III..."
                value={profileForm.healthClassification}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    healthClassification: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitProfile}>
              Lưu hồ sơ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <CheckupDialog
        open={showCheckupDialog}
        onClose={() => setShowCheckupDialog(false)}
        employeeId={userData.id}
        checkup={selectedCheckup}
        onSuccess={() => {
          setShowCheckupDialog(false);
          loadMedicalData();
        }}
      />
    </div>
  );
}