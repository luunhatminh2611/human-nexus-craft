import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X } from "lucide-react";
import { FamilyList } from "./FamilyList";
import { AddFamilyForm } from "./FamilyAddForm";
import type { CVData } from "@/mock/data";

interface CVTabProps {
  employeeId: string;
  initialData?: CVData;
}

export function CVTab({ employeeId, initialData }: CVTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CVData>(initialData || {
    employeeId,
    placeOfBirth: "",
    hometown: "",
    ethnicity: "",
    religion: "",
    idNumber: "",
    idIssueDate: "",
    idIssuePlace: "",
    permanentAddress: "",
    currentAddress: "",
    education: "",
    degree: "",
    specialization: "",
    politicalTheory: "",
    foreignLanguage: "",
    computerSkills: "",
    workExperience: "",
    militaryService: "",
    professionalQualifications: "",
  });

  const handleSave = () => {
    // In a real app, this would save to backend/database
    console.log("Saving CV data:", formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(initialData || {
      employeeId,
      placeOfBirth: "",
      hometown: "",
      ethnicity: "",
      religion: "",
      idNumber: "",
      idIssueDate: "",
      idIssuePlace: "",
      permanentAddress: "",
      currentAddress: "",
      education: "",
      degree: "",
      specialization: "",
      politicalTheory: "",
      foreignLanguage: "",
      computerSkills: "",
      workExperience: "",
      militaryService: "",
      professionalQualifications: "",
    });
    setIsEditing(false);
  };

  const handleChange = (field: keyof CVData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sơ yếu lý lịch</CardTitle>
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Lưu
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Thông tin cá nhân */}
          <div>
            <h3 className="font-semibold text-lg mb-4">I. Thông tin cá nhân</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nơi sinh</Label>
                <Input
                  value={formData.placeOfBirth || ""}
                  onChange={(e) => handleChange("placeOfBirth", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Quê quán</Label>
                <Input
                  value={formData.hometown || ""}
                  onChange={(e) => handleChange("hometown", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Dân tộc</Label>
                <Input
                  value={formData.ethnicity || ""}
                  onChange={(e) => handleChange("ethnicity", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Tôn giáo</Label>
                <Input
                  value={formData.religion || ""}
                  onChange={(e) => handleChange("religion", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* CMND/CCCD */}
          <div>
            <h3 className="font-semibold text-lg mb-4">II. CMND/CCCD</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Số CMND/CCCD</Label>
                <Input
                  value={formData.idNumber || ""}
                  onChange={(e) => handleChange("idNumber", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Ngày cấp</Label>
                <Input
                  type="date"
                  value={formData.idIssueDate || ""}
                  onChange={(e) => handleChange("idIssueDate", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Nơi cấp</Label>
                <Input
                  value={formData.idIssuePlace || ""}
                  onChange={(e) => handleChange("idIssuePlace", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <h3 className="font-semibold text-lg mb-4">III. Địa chỉ</h3>
            <div className="space-y-4">
              <div>
                <Label>Địa chỉ thường trú</Label>
                <Textarea
                  value={formData.permanentAddress || ""}
                  onChange={(e) => handleChange("permanentAddress", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
              <div>
                <Label>Chỗ ở hiện nay</Label>
                <Textarea
                  value={formData.currentAddress || ""}
                  onChange={(e) => handleChange("currentAddress", e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Trình độ học vấn */}
          <div>
            <h3 className="font-semibold text-lg mb-4">IV. Trình độ học vấn & chuyên môn</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Trình độ văn hóa</Label>
                <Input
                  value={formData.education || ""}
                  onChange={(e) => handleChange("education", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Trình độ chuyên môn</Label>
                <Input
                  value={formData.degree || ""}
                  onChange={(e) => handleChange("degree", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ví dụ: Đại học, Thạc sĩ, Tiến sĩ"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Chuyên ngành</Label>
                <Input
                  value={formData.specialization || ""}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Trình độ lý luận chính trị</Label>
                <Input
                  value={formData.politicalTheory || ""}
                  onChange={(e) => handleChange("politicalTheory", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label>Ngoại ngữ</Label>
                <Input
                  value={formData.foreignLanguage || ""}
                  onChange={(e) => handleChange("foreignLanguage", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ví dụ: Tiếng Anh B2, TOEIC 850"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Tin học</Label>
                <Input
                  value={formData.computerSkills || ""}
                  onChange={(e) => handleChange("computerSkills", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Kinh nghiệm làm việc */}
          <div>
            <h3 className="font-semibold text-lg mb-4">V. Kinh nghiệm làm việc</h3>
            <Textarea
              value={formData.workExperience || ""}
              onChange={(e) => handleChange("workExperience", e.target.value)}
              disabled={!isEditing}
              rows={4}
              placeholder="Mô tả kinh nghiệm làm việc trước đây..."
            />
          </div>

          {/* Nghĩa vụ quân sự */}
          <div>
            <h3 className="font-semibold text-lg mb-4">VI. Nghĩa vụ quân sự</h3>
            <Textarea
              value={formData.militaryService || ""}
              onChange={(e) => handleChange("militaryService", e.target.value)}
              disabled={!isEditing}
              rows={2}
              placeholder="Thông tin về quân hàm, thời gian phục vụ (nếu có)..."
            />
          </div>

          {/* Chứng chỉ nghề nghiệp */}
          <div>
            <h3 className="font-semibold text-lg mb-4">VII. Chứng chỉ nghề nghiệp</h3>
            <Textarea
              value={formData.professionalQualifications || ""}
              onChange={(e) => handleChange("professionalQualifications", e.target.value)}
              disabled={!isEditing}
              rows={3}
              placeholder="Liệt kê các chứng chỉ nghề nghiệp, kỹ năng đặc biệt..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Thông tin thân nhân */}
      <Card>
        <CardHeader>
          <CardTitle>VIII. Thông tin thân nhân</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddFamilyForm employeeId={employeeId} />
          <FamilyList employeeId={employeeId} />
        </CardContent>
      </Card>
    </div>
  );
}