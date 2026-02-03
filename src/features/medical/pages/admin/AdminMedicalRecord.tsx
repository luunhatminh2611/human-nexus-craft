// pages/hr/medical/MedicalHRPage.tsx

import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search, Eye, ChevronLeft, ChevronRight, Activity, Plus, Edit, AlertCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button/Button2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/tables/table';
import { mockMedicalProfiles, type MedicalProfile } from '../../../../mock/medicalProfile';
import MedicalDetailModal from '../../components/MedicalDetailModal';
import MedicalFormModal from '../../components/MedicalFormModal';
import { useAuthStore } from '@/features/employees/hooks/useAuth';
import { ehrApi } from '@/features/employees/api/ehrApi';
import { toast } from '@/shared/hooks/use-toast';

export default function MedicalHRPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.roles === 'ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [allergyFilter, setAllergyFilter] = useState<string>('ALL');
  const [profiles, setProfiles] = useState<MedicalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    fetchProfiles();
  }, [page, pageSize, searchTerm, healthFilter, departmentFilter, allergyFilter, refreshKey]);

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      let filtered: any[] = [];

      // Nếu là admin, sử dụng mock data (vì API chưa có)
      if (isAdmin) {
        filtered = [...mockMedicalProfiles];
      } else {
        // Nếu không phải admin, gọi API để lấy hồ sơ của user hiện tại
        if (user?.employeeId) {
          try {
            const response = await ehrApi.profile.getByEmployeeId(user.employeeId);
            // Chuyển đổi API response thành format giống mock data
            if (response.data) {
              filtered = [response.data];
            }
          } catch (error) {
            console.error('Lỗi khi lấy dữ liệu hồ sơ y tế:', error);
            toast({
              title: 'Lỗi',
              description: 'Không thể tải hồ sơ y tế',
            });
            filtered = [];
          }
        }
      }

      // Áp dụng các filter
      if (healthFilter !== 'ALL') {
        filtered = filtered.filter(p => p.healthClassification === healthFilter);
      }

      if (departmentFilter !== 'ALL') {
        filtered = filtered.filter(p => p.departmentName === departmentFilter);
      }

      if (allergyFilter !== 'ALL') {
        if (allergyFilter === 'HAS_ALLERGY') {
          filtered = filtered.filter(p => p.allergy && p.allergy !== 'Không');
        } else if (allergyFilter === 'NO_ALLERGY') {
          filtered = filtered.filter(p => !p.allergy || p.allergy === 'Không');
        }
      }

      if (searchTerm) {
        filtered = filtered.filter(p =>
          p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.bloodType?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by last check date (newest first)
      filtered.sort((a, b) => {
        if (!a.lastCheckDate) return 1;
        if (!b.lastCheckDate) return -1;
        return new Date(b.lastCheckDate).getTime() - new Date(a.lastCheckDate).getTime();
      });

      setTotalItems(filtered.length);

      const start = page * pageSize;
      const end = start + pageSize;
      setProfiles(filtered.slice(start, end));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu y tế:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu y tế',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetailModal = (id: string) => {
    setSelectedProfileId(id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProfileId(null);
  };

  const handleOpenFormModal = (profile?: MedicalProfile) => {
    setSelectedProfile(profile || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedProfile(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    handleCloseFormModal();
  };

  const getHealthBadge = (classification: string) => {
    const healthConfig = {
      'I': { className: 'bg-green-100 text-green-800' },
      'II': { className: 'bg-blue-100 text-blue-800' },
      'III': { className: 'bg-yellow-100 text-yellow-800' },
      'IV': { className: 'bg-orange-100 text-orange-800' },
      'V': { className: 'bg-red-100 text-red-800' },
    };

    const config = healthConfig[classification];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {classification}
      </Badge>
    );
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Gầy', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Bình thường', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'text-yellow-600' };
    return { label: 'Béo phì', color: 'text-red-600' };
  };

  // Calculate statistics - chỉ dùng mock data cho admin
  const stats = isAdmin ? {
    total: mockMedicalProfiles.length,
    healthyClass1: mockMedicalProfiles.filter(p => p.healthClassification === 'Loại I').length,
    healthyClass2: mockMedicalProfiles.filter(p => p.healthClassification === 'Loại II').length,
    withAllergies: mockMedicalProfiles.filter(p => p.allergy && p.allergy !== 'Không').length,
    withChronicDisease: mockMedicalProfiles.filter(p => p.chronicDisease && p.chronicDisease !== 'Không').length,
    withOccupationalDisease: mockMedicalProfiles.filter(p => p.occupationalDisease && p.occupationalDisease !== 'Không').length,
  } : {
    total: profiles.length,
    healthyClass1: profiles.filter(p => p.healthClassification === 'Loại I').length,
    healthyClass2: profiles.filter(p => p.healthClassification === 'Loại II').length,
    withAllergies: profiles.filter(p => p.allergy && p.allergy !== 'Không').length,
    withChronicDisease: profiles.filter(p => p.chronicDisease && p.chronicDisease !== 'Không').length,
    withOccupationalDisease: profiles.filter(p => p.occupationalDisease && p.occupationalDisease !== 'Không').length,
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = page * pageSize + 1;
  const endIndex = Math.min((page + 1) * pageSize, totalItems);

  const departments = isAdmin 
    ? Array.from(new Set(mockMedicalProfiles.map(p => p.departmentName)))
    : Array.from(new Set(profiles.map(p => p.departmentName)));
  
  const healthClassifications = ['Loại I', 'Loại II', 'Loại III', 'Loại IV', 'Loại V'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản lý hồ sơ y tế' : 'Hồ sơ y tế của tôi'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? 'Quản lý và theo dõi sức khỏe của tất cả nhân viên'
              : 'Xem và cập nhật hồ sơ sức khỏe của bạn'
            }
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenFormModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm hồ sơ y tế
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isAdmin 
                ? 'Tìm kiếm theo tên nhân viên, mã NV hoặc nhóm máu'
                : 'Tìm kiếm theo tên'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isAdmin && (
            <>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phòng ban</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Phân loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả phân loại</SelectItem>
                  {healthClassifications.map(hc => (
                    <SelectItem key={hc} value={hc}>{hc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={allergyFilter} onValueChange={setAllergyFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Dị ứng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="HAS_ALLERGY">Có dị ứng</SelectItem>
                  <SelectItem value="NO_ALLERGY">Không dị ứng</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead>Nhân viên</TableHead>}
                <TableHead>Nhóm máu</TableHead>
                <TableHead>Chỉ số</TableHead>
                <TableHead>BMI</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Dị ứng</TableHead>
                <TableHead>Khám gần nhất</TableHead>
                <TableHead className="text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Activity className="h-8 w-8" />
                      <p>Không tìm thấy hồ sơ y tế nào</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => {
                  const bmi = calculateBMI(profile.height, profile.weight);
                  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

                  return (
                    <TableRow key={profile.id}>
                      {isAdmin && (
                        <TableCell>
                          <div>
                            <p className="font-medium">{profile.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{profile.employeeCode}</p>
                            <p className="text-xs text-muted-foreground">{profile.departmentName}</p>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline" className="font-semibold">
                          {profile.bloodType || '--'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Cao:</span>{' '}
                            <span className="font-medium">{profile.height || '--'} cm</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nặng:</span>{' '}
                            <span className="font-medium">{profile.weight || '--'} kg</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {bmi ? (
                          <div className="text-sm">
                            <div className="font-bold text-lg">{bmi}</div>
                            <div className={`text-xs ${bmiCategory?.color}`}>
                              {bmiCategory?.label}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.healthClassification ? (
                          getHealthBadge(profile.healthClassification)
                        ) : (
                          <span className="text-muted-foreground">Chưa xác định</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {profile.allergy && profile.allergy !== 'Không' ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {profile.allergy.split(',').slice(0, 2).map((item, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {item.trim()}
                              </Badge>
                            ))}
                            {profile.allergy.split(',').length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{profile.allergy.split(',').length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Không</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {profile.lastCheckDate ? (
                            <span className="font-medium">
                              {new Date(profile.lastCheckDate).toLocaleDateString('vi-VN')}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Chưa khám</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetailModal(profile.id)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenFormModal(profile)}
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && profiles.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex} - {endIndex} trong tổng số {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(0)}
                  disabled={page === 0}
                >
                  Đầu
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="px-3 text-sm">
                  Trang {page + 1} / {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={page >= totalPages - 1}
                >
                  Cuối
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <MedicalDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        profileId={selectedProfileId}
      />

      {/* Form Modal */}
      {isAdmin && (
        <MedicalFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          profile={selectedProfile}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}