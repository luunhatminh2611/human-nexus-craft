// src/features/employees/components/ResumeTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Button from '@/shared/components/ui/button/Button';
import { User, Calendar, MapPin, Phone, Mail, FileText } from 'lucide-react';

export default function ResumeTab({ userData }) {
  return (
    <div className="space-y-4">
      {/* Thông tin cá nhân */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
          <Button variant="outline" size="sm">
            Chỉnh sửa
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Tên nhân viên</p>
              <p className="font-medium">{userData.fullName || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày sinh</p>
              <p className="font-medium">
                {userData.dateOfBirth
                  ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Giới tính</p>
              <p className="font-medium">{userData.gender || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Số CMND/CCCD</p>
              <p className="font-medium">{userData.identityNumber || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nơi cấp</p>
              <p className="font-medium">{userData.identityPlace || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày cấp</p>
              <p className="font-medium">
                {userData.identityDate
                  ? new Date(userData.identityDate).toLocaleDateString('vi-VN')
                  : 'Chưa cập nhật'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quốc tịch</p>
              <p className="font-medium">{userData.nationality || 'Việt Nam'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dân tộc</p>
              <p className="font-medium">{userData.ethnicity || 'Kinh'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tôn giáo</p>
              <p className="font-medium">{userData.religion || 'Không'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tình trạng hôn nhân</p>
              <p className="font-medium">{userData.maritalStatus || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thông tin liên hệ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            Thông tin liên hệ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-medium">{userData.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{userData.email || 'Chưa cập nhật'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Địa chỉ thường trú</p>
              <p className="font-medium">{userData.permanentAddress || userData.address || 'Chưa cập nhật'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground">Địa chỉ tạm trú</p>
              <p className="font-medium">{userData.currentAddress || userData.address || 'Chưa cập nhật'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Học vấn */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Trình độ học vấn
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.education && userData.education.length > 0 ? (
              userData.education.map((edu: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{edu.degree || 'Bằng cấp'}</p>
                      <p className="text-sm text-muted-foreground">{edu.school || 'Trường'}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {edu.startYear} - {edu.endYear || 'Hiện tại'}
                    </div>
                  </div>
                  <p className="text-sm">{edu.major || 'nghề nghiệp'}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Chưa có thông tin học vấn
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kinh nghiệm làm việc */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Kinh nghiệm làm việc
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.workExperience && userData.workExperience.length > 0 ? (
              userData.workExperience.map((work: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{work.position || 'Vị trí'}</p>
                      <p className="text-sm text-muted-foreground">{work.company || 'Công ty'}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {work.startDate
                        ? new Date(work.startDate).toLocaleDateString('vi-VN')
                        : ''}{' '}
                      -{' '}
                      {work.endDate
                        ? new Date(work.endDate).toLocaleDateString('vi-VN')
                        : 'Hiện tại'}
                    </div>
                  </div>
                  {work.description && (
                    <p className="text-sm text-muted-foreground">{work.description}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Chưa có thông tin kinh nghiệm làm việc
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Thông tin thân nhân */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Thông tin thân nhân
          </CardTitle>
          <Button variant="outline" size="sm">
            Thêm
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userData.family && userData.family.length > 0 ? (
              userData.family.map((member: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Tên nhân viên</p>
                      <p className="font-medium">{member.name || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Quan hệ</p>
                      <p className="font-medium">{member.relationship || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Năm sinh</p>
                      <p className="font-medium">{member.birthYear || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{member.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Chưa có thông tin thân nhân
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}