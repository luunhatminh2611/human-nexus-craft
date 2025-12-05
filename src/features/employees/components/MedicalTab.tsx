// src/features/employees/components/MedicalTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { Badge } from '@/shared/components/ui/badge';
import { Activity, Heart, FileText, AlertCircle, Calendar, Ruler, Weight } from 'lucide-react';

export default function MedicalTab({ userData }) {
  return (
    <div className="space-y-4">
      {/* Thông tin sức khỏe cơ bản */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Thông tin sức khỏe
          </CardTitle>
          <Button variant="outline" size="sm">
            Cập nhật
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nhóm máu</p>
              <p className="font-medium">{userData.bloodType || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Ruler className="h-4 w-4" />
                Chiều cao
              </p>
              <p className="font-medium">
                {userData.height ? `${userData.height} cm` : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Weight className="h-4 w-4" />
                Cân nặng
              </p>
              <p className="font-medium">
                {userData.weight ? `${userData.weight} kg` : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Huyết áp</p>
              <p className="font-medium">{userData.bloodPressure || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nhịp tim</p>
              <p className="font-medium">
                {userData.heartRate ? `${userData.heartRate} bpm` : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Thị lực</p>
              <p className="font-medium">{userData.vision || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bệnh lý - Dị ứng */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Bệnh lý & Dị ứng
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Dị ứng */}
            <div>
              <p className="text-sm font-semibold mb-2">Dị ứng</p>
              {userData.allergies && userData.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userData.allergies.map((allergy: string, index: number) => (
                    <Badge key={index} variant="destructive">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Không có dị ứng</p>
              )}
            </div>

            {/* Bệnh mãn tính */}
            <div>
              <p className="text-sm font-semibold mb-2">Bệnh mãn tính</p>
              {userData.chronicDiseases && userData.chronicDiseases.length > 0 ? (
                <div className="space-y-2">
                  {userData.chronicDiseases.map((disease: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <p className="font-medium">{disease.name}</p>
                      {disease.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {disease.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Không có bệnh mãn tính</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lịch sử khám bệnh */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Lịch sử khám bệnh
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.medicalHistory && userData.medicalHistory.length > 0 ? (
              userData.medicalHistory.map((record: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{record.diagnosis || 'Chẩn đoán'}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.facility || 'Cơ sở y tế'}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {record.date
                        ? new Date(record.date).toLocaleDateString('vi-VN')
                        : 'Chưa rõ ngày'}
                    </Badge>
                  </div>
                  {record.treatment && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Điều trị:</p>
                      <p className="text-sm text-muted-foreground">{record.treatment}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Ghi chú:</p>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Chưa có lịch sử khám bệnh
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Khám sức khỏe định kỳ */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Khám sức khỏe định kỳ
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.healthCheckups && userData.healthCheckups.length > 0 ? (
              userData.healthCheckups.map((checkup: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold">
                        Khám sức khỏe {checkup.year || new Date().getFullYear()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {checkup.date
                          ? new Date(checkup.date).toLocaleDateString('vi-VN')
                          : 'Chưa rõ ngày'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        checkup.status === 'Đạt'
                          ? 'default'
                          : checkup.status === 'Không đạt'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {checkup.status || 'Chưa xác định'}
                    </Badge>
                  </div>
                  {checkup.results && (
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Phân loại sức khỏe: </span>
                        <span className="font-medium">
                          {checkup.results.classification || 'Chưa cập nhật'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">BMI: </span>
                        <span className="font-medium">{checkup.results.bmi || 'N/A'}</span>
                      </div>
                    </div>
                  )}
                  {checkup.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Ghi chú: {checkup.notes}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Chưa có kết quả khám sức khỏe định kỳ
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bảo hiểm y tế */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Bảo hiểm y tế
          </CardTitle>
          <Button variant="outline" size="sm">
            Cập nhật
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Số thẻ BHYT</p>
              <p className="font-medium">{userData.healthInsuranceNumber || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nơi đăng ký KCB</p>
              <p className="font-medium">{userData.healthInsuranceFacility || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày hiệu lực</p>
              <p className="font-medium">
                {userData.healthInsuranceStartDate
                  ? new Date(userData.healthInsuranceStartDate).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày hết hạn</p>
              <p className="font-medium">
                {userData.healthInsuranceEndDate
                  ? new Date(userData.healthInsuranceEndDate).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}