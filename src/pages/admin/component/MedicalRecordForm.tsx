import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Heart, FileText, Download, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Employee, MedicalRecord, healthClassifications } from '@/mock/data';

interface MedicalRecordFormProps {
  employee: Employee;
  medicalRecord?: MedicalRecord;
}

export default function MedicalRecordForm({ employee, medicalRecord }: MedicalRecordFormProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bloodType: medicalRecord?.bloodType || '',
    height: medicalRecord?.height || '',
    weight: medicalRecord?.weight || '',
    allergies: medicalRecord?.allergies || '',
    chronicDiseases: medicalRecord?.chronicDiseases || '',
    medications: medicalRecord?.medications || '',
    emergencyContact: medicalRecord?.emergencyContact || '',
    emergencyContactPhone: medicalRecord?.emergencyContactPhone || '',
    lastCheckupDate: medicalRecord?.lastCheckupDate || '',
    occupationalDisease: medicalRecord?.occupationalDisease || '',
    healthClassification: medicalRecord?.healthClassification || '',
    notes: medicalRecord?.notes || '',
  });

  const handleSave = () => {
    // In real app, this would save to backend
    toast({
      title: "Đã lưu thông tin y tế",
      description: "Thông tin y tế của nhân viên đã được cập nhật.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      bloodType: medicalRecord?.bloodType || '',
      height: medicalRecord?.height || '',
      weight: medicalRecord?.weight || '',
      allergies: medicalRecord?.allergies || '',
      chronicDiseases: medicalRecord?.chronicDiseases || '',
      medications: medicalRecord?.medications || '',
      emergencyContact: medicalRecord?.emergencyContact || '',
      emergencyContactPhone: medicalRecord?.emergencyContactPhone || '',
      lastCheckupDate: medicalRecord?.lastCheckupDate || '',
      occupationalDisease: medicalRecord?.occupationalDisease || '',
      healthClassification: medicalRecord?.healthClassification || '',
      notes: medicalRecord?.notes || '',
    });
    setIsEditing(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Thông tin y tế (EHR)
          </CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bloodType">Nhóm máu</Label>
              <Input
                id="bloodType"
                value={formData.bloodType}
                onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                disabled={!isEditing}
                placeholder="Ví dụ: A+, B-, O+, AB+"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastCheckupDate">Ngày khám gần nhất</Label>
              <Input
                id="lastCheckupDate"
                type="date"
                value={formData.lastCheckupDate}
                onChange={(e) => setFormData({ ...formData, lastCheckupDate: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">Chiều cao (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                disabled={!isEditing}
                placeholder="Ví dụ: 170"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Cân nặng (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                disabled={!isEditing}
                placeholder="Ví dụ: 65"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Dị ứng</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              disabled={!isEditing}
              placeholder="Ví dụ: Dị ứng với penicillin, phấn hoa..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chronicDiseases">Bệnh mãn tính</Label>
            <Textarea
              id="chronicDiseases"
              value={formData.chronicDiseases}
              onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
              disabled={!isEditing}
              placeholder="Ví dụ: Tiểu đường, cao huyết áp..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupationalDisease">Bệnh nghề nghiệp</Label>
            <Textarea
              id="occupationalDisease"
              value={formData.occupationalDisease}
              onChange={(e) => setFormData({ ...formData, occupationalDisease: e.target.value })}
              disabled={!isEditing}
              placeholder="Ví dụ: Bệnh nghề nghiệp liên quan đến công việc..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthClassification">Phân loại sức khỏe</Label>
            <Select
              value={formData.healthClassification}
              onValueChange={(value) => setFormData({ ...formData, healthClassification: value })}
              disabled={!isEditing}
            >
              <SelectTrigger id="healthClassification">
                <SelectValue placeholder="Chọn phân loại sức khỏe" />
              </SelectTrigger>
              <SelectContent>
                {healthClassifications.map((classification) => (
                  <SelectItem key={classification} value={classification}>
                    {classification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Thuốc đang dùng</Label>
            <Textarea
              id="medications"
              value={formData.medications}
              onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
              disabled={!isEditing}
              placeholder="Ví dụ: Metformin 500mg, Aspirin..."
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Người liên hệ khẩn cấp</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                disabled={!isEditing}
                placeholder="Tên người liên hệ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Số điện thoại khẩn cấp</Label>
              <Input
                id="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                disabled={!isEditing}
                placeholder="Số điện thoại"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={!isEditing}
              placeholder="Thông tin bổ sung khác..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Hồ sơ y tế đã tải lên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {medicalRecord && medicalRecord.status === 'Approved' ? (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">{medicalRecord.fileUrl}</span>
                <Badge variant="outline">Đã duyệt</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(medicalRecord.fileUrl, '_blank')}
                >
                  Xem
                </Button>
                <a href={medicalRecord.fileUrl} download>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Chưa có hồ sơ y tế được chấp thuận
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
