// components/MedicalDetailModal.tsx

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import {
  Activity,
  Heart,
  Ruler,
  Weight,
  Droplet,
  AlertCircle,
  Calendar,
  User,
  Building2,
  Loader2,
} from 'lucide-react';
import { mockMedicalProfiles, type MedicalProfile } from '../../../mock/medicalProfile';

interface MedicalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string | null;
}

export default function MedicalDetailModal({
  isOpen,
  onClose,
  profileId,
}: MedicalDetailModalProps) {
  const [profile, setProfile] = useState<MedicalProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && profileId) {
      fetchProfileDetail();
    }
  }, [isOpen, profileId]);

  const fetchProfileDetail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const foundProfile = mockMedicalProfiles.find(p => p.id === profileId);
    setProfile(foundProfile || null);
    setIsLoading(false);
  };

  const calculateBMI = (height: number, weight: number) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Thiếu cân', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (bmi < 25) return { label: 'Bình thường', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (bmi < 30) return { label: 'Thừa cân', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { label: 'Béo phì', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getHealthBadge = (classification: string) => {
    const healthConfig = {
      'Loại I': { className: 'bg-green-100 text-green-800' },
      'Loại II': { className: 'bg-blue-100 text-blue-800' },
      'Loại III': { className: 'bg-yellow-100 text-yellow-800' },
      'Loại IV': { className: 'bg-orange-100 text-orange-800' },
      'Loại V': { className: 'bg-red-100 text-red-800' },
    };

    const config = healthConfig[classification];
    if (!config) return null;

    return (
      <Badge className={config.className}>
        {classification}
      </Badge>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Chi tiết hồ sơ sức khỏe
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Đang tải...</span>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Employee Info */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <Label className="text-blue-600">Nhân viên</Label>
                  </div>
                  <p className="text-lg font-semibold">{profile.employeeName}</p>
                  <p className="text-sm text-muted-foreground">{profile.employeeCode}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{profile.departmentName}</span>
                  </div>
                </div>
                
                {profile.healthClassification && (
                  <div>
                    {getHealthBadge(profile.healthClassification)}
                  </div>
                )}
              </div>
            </Card>

            {/* Basic Health Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="h-4 w-4 text-red-500" />
                  <Label className="text-sm text-muted-foreground">Nhóm máu</Label>
                </div>
                <p className="text-2xl font-bold">{profile.bloodType || '--'}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm text-muted-foreground">Chiều cao</Label>
                </div>
                <p className="text-2xl font-bold">
                  {profile.height ? `${profile.height} cm` : '--'}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Weight className="h-4 w-4 text-green-500" />
                  <Label className="text-sm text-muted-foreground">Cân nặng</Label>
                </div>
                <p className="text-2xl font-bold">
                  {profile.weight ? `${profile.weight} kg` : '--'}
                </p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-500" />
                  <Label className="text-sm text-muted-foreground">BMI</Label>
                </div>
                {(() => {
                  const bmi = calculateBMI(profile.height, profile.weight);
                  if (!bmi) return <p className="text-2xl font-bold">--</p>;
                  
                  const category = getBMICategory(parseFloat(bmi));
                  return (
                    <div>
                      <p className="text-2xl font-bold">{bmi}</p>
                      <p className={`text-xs mt-1 ${category.color}`}>
                        {category.label}
                      </p>
                    </div>
                  );
                })()}
              </Card>
            </div>

            {/* Health Information */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Allergies */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <Label className="font-semibold">Dị ứng</Label>
                </div>
                {profile.allergy && profile.allergy !== 'Không' ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.allergy.split(',').map((item: string, idx: number) => (
                      <Badge key={idx} variant="destructive" className="text-sm">
                        {item.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có dị ứng</p>
                )}
              </Card>

              {/* Chronic Disease */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <Label className="font-semibold">Bệnh mãn tính</Label>
                </div>
                {profile.chronicDisease && profile.chronicDisease !== 'Không' ? (
                  <p className="text-sm">{profile.chronicDisease}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có bệnh mãn tính</p>
                )}
              </Card>

              {/* Occupational Disease */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <Label className="font-semibold">Bệnh nghề nghiệp</Label>
                </div>
                {profile.occupationalDisease && profile.occupationalDisease !== 'Không' ? (
                  <p className="text-sm">{profile.occupationalDisease}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có bệnh nghề nghiệp</p>
                )}
              </Card>

              {/* Medication */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <Label className="font-semibold">Thuốc đang sử dụng</Label>
                </div>
                {profile.medication && profile.medication !== 'Không' ? (
                  <p className="text-sm">{profile.medication}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Không có thuốc đang sử dụng</p>
                )}
              </Card>
            </div>

            {/* Additional Info */}
            <Card className="p-4">
              <div className="grid md:grid-cols-2 gap-4">
                {profile.lastCheckDate && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <Label className="text-sm text-muted-foreground">Ngày khám gần nhất</Label>
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(profile.lastCheckDate).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <Label className="text-sm text-muted-foreground">Cập nhật lần cuối</Label>
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(profile.updatedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>

            {/* Health Status Summary */}
            {(() => {
              const hasHealthIssues = 
                (profile.allergy && profile.allergy !== 'Không') ||
                (profile.chronicDisease && profile.chronicDisease !== 'Không') ||
                (profile.occupationalDisease && profile.occupationalDisease !== 'Không');
              
              const bmi = calculateBMI(profile.height, profile.weight);
              const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;
              const hasAbnormalBMI = bmiCategory && (bmiCategory.label !== 'Bình thường');

              if (hasHealthIssues || hasAbnormalBMI) {
                return (
                  <Card className="p-4 bg-amber-50 border-amber-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <Label className="font-semibold text-amber-900">
                          Lưu ý sức khỏe
                        </Label>
                        <ul className="mt-2 space-y-1 text-sm text-amber-800">
                          {hasAbnormalBMI && (
                            <li>• Chỉ số BMI {bmiCategory.label.toLowerCase()}, cần chú ý điều chỉnh chế độ ăn uống và tập luyện</li>
                          )}
                          {profile.allergy && profile.allergy !== 'Không' && (
                            <li>• Nhân viên có dị ứng với: {profile.allergy}</li>
                          )}
                          {profile.chronicDisease && profile.chronicDisease !== 'Không' && (
                            <li>• Cần theo dõi bệnh mãn tính: {profile.chronicDisease}</li>
                          )}
                          {profile.occupationalDisease && profile.occupationalDisease !== 'Không' && (
                            <li>• Có bệnh nghề nghiệp: {profile.occupationalDisease}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </Card>
                );
              }
              return null;
            })()}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Không tìm thấy hồ sơ y tế</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}